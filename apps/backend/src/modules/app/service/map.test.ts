import { AppMapService, resolveAmapWebServiceConfig } from './map';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function createService(
  keys = 'key-a,key-b',
  responses: Array<any | Error> = []
) {
  const service = new AppMapService() as any;
  const requests: Array<{ path: string; params: Record<string, string> }> = [];

  service.env = {
    AMAP_WEB_SERVICE_KEYS: keys,
    AMAP_WEB_SERVICE_TIMEOUT_MS: '2600',
  } as NodeJS.ProcessEnv;

  service.requestAmap = async (
    path: string,
    params: Record<string, string>
  ) => {
    requests.push({ path, params });
    const response = responses.shift();

    if (response instanceof Error) {
      throw response;
    }

    return response;
  };

  return {
    service: service as AppMapService,
    requests,
  };
}

describe('resolveAmapWebServiceConfig', () => {
  it('parses a key pool from comma, blank and newline separated values', () => {
    const config = resolveAmapWebServiceConfig({
      AMAP_WEB_SERVICE_KEYS: ' key-a,\nkey-b  key-c ',
      AMAP_WEB_SERVICE_TIMEOUT_MS: '3200',
    } as NodeJS.ProcessEnv);

    expect(config.enabled).toBe(true);
    expect(config.keys).toEqual(['key-a', 'key-b', 'key-c']);
    expect(config.timeoutMs).toBe(3200);
  });

  it('supports the proxy base url for seller-provided amap chains', () => {
    const config = resolveAmapWebServiceConfig({
      AMAP_WEB_SERVICE_KEYS: 'key-a',
      AMAP_WEB_SERVICE_PROXY_BASE_URL: 'https://amap.bangban.cc/_AMapService',
    } as NodeJS.ProcessEnv);

    expect(config.proxyBaseUrl).toBe('https://amap.bangban.cc/_AMapService');
  });
});

describe('AppMapService', () => {
  it('returns an empty list for too-short keywords without calling amap', async () => {
    const { service, requests } = createService();

    await expect(service.searchAddressSuggestions('a')).resolves.toEqual([]);
    expect(requests).toHaveLength(0);
  });

  it('falls back to the next key when the current key is over limit', async () => {
    const { service, requests } = createService('key-a,key-b', [
      {
        status: '0',
        info: 'DAILY_QUERY_OVER_LIMIT',
        infocode: '10003',
      },
      {
        status: '1',
        info: 'OK',
        infocode: '10000',
        pois: [
          {
            id: 'B001',
            name: '科技园',
            address: '科技南十二路',
            pname: '广东省',
            cityname: '深圳市',
            adname: '南山区',
            location: '113.9501,22.5401',
          },
        ],
      },
    ]);

    const result = await service.searchAddressSuggestions('科技园');

    expect(requests.map(item => item.params.key)).toEqual(['key-a', 'key-b']);
    expect(result).toEqual([
      expect.objectContaining({
        id: 'B001',
        name: '科技园',
        latitude: 22.5401,
        longitude: 113.9501,
      }),
    ]);
    expect(result[0].formattedAddress).toContain('科技南十二路');
  });

  it('returns a clear mismatch message when the key cannot be used for web service requests', async () => {
    const { service } = createService('key-a', [
      {
        status: '0',
        info: 'USERKEY_PLAT_NOMATCH',
        infocode: '10009',
      },
    ]);

    await expect(service.searchAddressSuggestions('科技园')).rejects.toThrow(
      '当前高德 Key 不支持后端 Web 服务调用'
    );
  });

  it('resolves a chinese address from reverse geocode output', async () => {
    const { service } = createService('key-a', [
      {
        status: '1',
        info: 'OK',
        infocode: '10000',
        regeocode: {
          formatted_address: '广东省广州市天河区天园街道天河公园',
        },
      },
    ]);

    await expect(service.reverseGeocode(113.366739, 23.128003)).resolves.toEqual({
      formattedAddress: '广东省广州市天河区天园街道天河公园',
      latitude: 23.128003,
      longitude: 113.366739,
    });
  });

  it('builds the seller proxy request shape when a proxy base url is configured', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: 'jsonp_test({"status":"1","info":"OK","infocode":"10000","pois":[]})',
    } as any);

    const service = new AppMapService() as any;
    service.env = {
      AMAP_WEB_SERVICE_KEYS: 'key-a',
      AMAP_WEB_SERVICE_PROXY_BASE_URL: 'https://amap.bangban.cc/_AMapService',
      AMAP_WEB_SERVICE_PROXY_APPNAME: 'https%3A%2F%2Famap.bangban.cc%2Fdt.html',
    } as NodeJS.ProcessEnv;

    await service.requestAmap(
      '/v3/place/text',
      {
        key: 'key-a',
        keywords: '科技园',
        offset: '5',
      },
      2500
    );

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    const [url, options] = mockedAxios.get.mock.calls[0];
    expect(url).toBe('https://amap.bangban.cc/_AMapService/v3/place/text');
    expect(options?.params).toMatchObject({
      platform: 'JS',
      s: 'rsv3',
      key: 'key-a',
      keywords: '科技园',
      offset: '5',
    });
    expect(options?.headers).toMatchObject({
      'X-Requested-With': 'com.bangban.cc',
    });
  });
});
