import {
  AppMapService,
  resolveAmapWebServiceConfig,
  resolveMapServiceProvider,
  resolveTiandituWebServiceConfig,
} from './map';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.resetAllMocks();
});

function createService(
  keys = 'key-a,key-b',
  responses: Array<any | Error> = []
) {
  const service = new AppMapService() as any;
  const requests: Array<{ path: string; params: Record<string, string> }> = [];

  service.env = {
    MAP_SERVICE_PROVIDER: 'amap',
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

function createTiandituService(
  keys = 'tdt-key-a,tdt-key-b',
  responses: Array<any | Error> = []
) {
  const service = new AppMapService() as any;
  const requests: Array<{ path: string; params: Record<string, string> }> = [];

  service.env = {
    MAP_SERVICE_PROVIDER: 'tianditu',
    TIANDITU_WEB_SERVICE_KEYS: keys,
    TIANDITU_WEB_SERVICE_TIMEOUT_MS: '2600',
  } as NodeJS.ProcessEnv;

  service.requestTianditu = async (
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

describe('resolveMapServiceProvider', () => {
  it('defaults to tianditu when the provider is not configured', () => {
    expect(resolveMapServiceProvider({} as NodeJS.ProcessEnv)).toBe('tianditu');
  });

  it('keeps the seller proxy amap mode available for explicit rollback', () => {
    expect(
      resolveMapServiceProvider({ MAP_SERVICE_PROVIDER: 'amap' } as NodeJS.ProcessEnv)
    ).toBe('amap-proxy');
    expect(
      resolveMapServiceProvider({ MAP_SERVICE_PROVIDER: 'amap-proxy' } as NodeJS.ProcessEnv)
    ).toBe('amap-proxy');
  });

  it('supports official amap web service mode', () => {
    expect(
      resolveMapServiceProvider({ MAP_SERVICE_PROVIDER: 'amap-official' } as NodeJS.ProcessEnv)
    ).toBe('amap-official');
  });

  it('falls back to tianditu for unknown provider names', () => {
    expect(
      resolveMapServiceProvider({ MAP_SERVICE_PROVIDER: 'unknown' } as NodeJS.ProcessEnv)
    ).toBe('tianditu');
  });
});

describe('resolveTiandituWebServiceConfig', () => {
  it('parses a key pool from comma, blank and newline separated values', () => {
    const config = resolveTiandituWebServiceConfig({
      TIANDITU_WEB_SERVICE_KEYS: ' key-a,\nkey-b  key-c ',
      TIANDITU_WEB_SERVICE_TIMEOUT_MS: '3200',
    } as NodeJS.ProcessEnv);

    expect(config.enabled).toBe(true);
    expect(config.keys).toEqual(['key-a', 'key-b', 'key-c']);
    expect(config.timeoutMs).toBe(3200);
  });

  it('supports a browser referer for browser-side tianditu keys', () => {
    const config = resolveTiandituWebServiceConfig({
      TIANDITU_WEB_SERVICE_KEYS: 'key-a',
      TIANDITU_WEB_SERVICE_REFERER: 'https://car-preprod.example.invalid/',
    } as NodeJS.ProcessEnv);

    expect(config.referer).toBe('https://car-preprod.example.invalid/');
  });

  it('supports server-side tianditu key access mode', () => {
    const config = resolveTiandituWebServiceConfig({
      TIANDITU_WEB_SERVICE_KEYS: 'key-a',
      TIANDITU_WEB_SERVICE_ACCESS: 'server',
    } as NodeJS.ProcessEnv);

    expect(config.access).toBe('server');
  });
});

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
      MAP_SERVICE_PROVIDER: 'amap-proxy',
      AMAP_WEB_SERVICE_KEYS: 'key-a',
      AMAP_WEB_SERVICE_PROXY_BASE_URL: 'https://amap-proxy.example.invalid/_AMapService',
    } as NodeJS.ProcessEnv);

    expect(config.proxyBaseUrl).toBe('https://amap-proxy.example.invalid/_AMapService');
  });

  it('disables seller proxy details in official amap mode', () => {
    const config = resolveAmapWebServiceConfig({
      MAP_SERVICE_PROVIDER: 'amap-official',
      AMAP_WEB_SERVICE_KEYS: 'key-a',
      AMAP_WEB_SERVICE_PROXY_BASE_URL: 'https://amap-proxy.example.invalid/_AMapService',
    } as NodeJS.ProcessEnv);

    expect(config.proxyBaseUrl).toBe('');
  });
});

describe('AppMapService', () => {
  it('uses tianditu by default for reverse geocoding', async () => {
    const { service, requests } = createTiandituService('tdt-key-a', [
      {
        status: '0',
        result: {
          formatted_address: '广东省广州市天河区天河公园',
          addressComponent: {
            address: '广东省广州市天河区天河公园',
          },
        },
      },
    ]);
    (service as any).env = {
      TIANDITU_WEB_SERVICE_KEYS: 'tdt-key-a',
    } as NodeJS.ProcessEnv;

    const result = await service.reverseGeocode(113.366739, 23.128003);

    expect(requests).toEqual([
      expect.objectContaining({
        path: '/geocoder',
        params: expect.objectContaining({
          tk: 'tdt-key-a',
          type: 'geocode',
          postStr: JSON.stringify({ lon: 113.366739, lat: 23.128003, ver: 1 }),
        }),
      }),
    ]);
    expect(result).toEqual({
      formattedAddress: '广东省广州市天河区天河公园',
      latitude: 23.128003,
      longitude: 113.366739,
    });
  });

  it('uses tianditu by default for address suggestions', async () => {
    const { service, requests } = createTiandituService('tdt-key-a', [
      {
        status: { infocode: 1000 },
        pois: [
          {
            hotPointID: 'poi-1',
            name: '天河公园',
            address: '广东省广州市天河区中山大道西',
            lonlat: '113.366739,23.128003',
          },
        ],
      },
    ]);
    (service as any).env = {
      TIANDITU_WEB_SERVICE_KEYS: 'tdt-key-a',
    } as NodeJS.ProcessEnv;

    const result = await service.searchAddressSuggestions('天河公园');

    expect(requests[0]).toEqual(
      expect.objectContaining({
        path: '/v2/search',
        params: expect.objectContaining({
          tk: 'tdt-key-a',
          type: 'query',
          postStr: JSON.stringify({ keyWord: '天河公园', level: 12, mapBound: '-180,-90,180,90', queryType: 1, count: 5, start: 0 }),
        }),
      })
    );
    expect(result).toEqual([
      expect.objectContaining({
        id: 'poi-1',
        name: '天河公园',
        longitude: 113.366739,
        latitude: 23.128003,
      }),
    ]);
  });

  it('falls back to the next tianditu key when the first key fails', async () => {
    const { service, requests } = createTiandituService('tdt-key-a,tdt-key-b', [
      {
        status: '1',
        msg: 'invalid tk',
      },
      {
        status: '0',
        result: {
          formatted_address: '广东省广州市天河区天河公园',
        },
      },
    ]);

    const result = await service.reverseGeocode(113.366739, 23.128003);

    expect(requests.map(item => item.params.tk)).toEqual(['tdt-key-a', 'tdt-key-b']);
    expect(result?.formattedAddress).toContain('天河公园');
  });

  it('returns a clear error for invalid reverse geocode coordinates', async () => {
    const { service } = createTiandituService('tdt-key-a');

    await expect(service.reverseGeocode(Number.NaN, 23.128003)).rejects.toThrow(
      '缺少有效经纬度'
    );
  });

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

  it('falls back to the next key when the current key domain is invalid', async () => {
    const { service, requests } = createService('key-a,key-b', [
      {
        status: '0',
        info: 'INVALID_USER_DOMAIN',
        infocode: '10006',
      },
      {
        status: '1',
        info: 'OK',
        infocode: '10000',
        regeocode: {
          formatted_address: '广东省广州市天河区天园街道天河公园',
        },
      },
    ]);

    const result = await service.reverseGeocode(113.366739, 23.128003);

    expect(requests.map(item => item.params.key)).toEqual(['key-a', 'key-b']);
    expect(result).toEqual(
      expect.objectContaining({
        formattedAddress: '广东省广州市天河区天园街道天河公园',
      })
    );
  });

  it('returns a clear domain message when the only key is not authorized for the proxy domain', async () => {
    const { service } = createService('key-a', [
      {
        status: '0',
        info: 'INVALID_USER_DOMAIN',
        infocode: '10006',
      },
    ]);

    await expect(service.reverseGeocode(113.366739, 23.128003)).rejects.toThrow(
      '当前高德 Key 未授权线上域名'
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
      MAP_SERVICE_PROVIDER: 'amap-proxy',
      AMAP_WEB_SERVICE_KEYS: 'key-a',
      AMAP_WEB_SERVICE_PROXY_BASE_URL: 'https://amap-proxy.example.invalid/_AMapService',
      AMAP_WEB_SERVICE_PROXY_APPNAME: 'https%3A%2F%2Famap-proxy.example.invalid%2Fdt.html',
      AMAP_WEB_SERVICE_PROXY_X_REQUESTED_WITH: 'com.example.car',
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
    expect(url).toBe('https://amap-proxy.example.invalid/_AMapService/v3/place/text');
    expect(options?.params).toMatchObject({
      platform: 'JS',
      s: 'rsv3',
      key: 'key-a',
      keywords: '科技园',
      offset: '5',
    });
    expect(options?.headers).toMatchObject({
      'X-Requested-With': 'com.example.car',
    });
  });

  it('builds official amap web service requests without seller proxy params', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: '1',
        info: 'OK',
        infocode: '10000',
        regeocode: {
          formatted_address: '广东省广州市天河区天河公园',
        },
      },
    } as any);

    const service = new AppMapService() as any;
    service.env = {
      MAP_SERVICE_PROVIDER: 'amap-official',
      AMAP_WEB_SERVICE_KEYS: 'amap-official-key',
      AMAP_WEB_SERVICE_PROXY_BASE_URL: 'https://amap-proxy.example.invalid/_AMapService',
    } as NodeJS.ProcessEnv;

    const result = await service.reverseGeocode(113.366739, 23.128003);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://restapi.amap.com/v3/geocode/regeo',
      expect.objectContaining({
        params: expect.objectContaining({
          key: 'amap-official-key',
          location: '113.366739,23.128003',
        }),
      })
    );
    const [, options] = mockedAxios.get.mock.calls[0];
    expect(options?.params).not.toHaveProperty('platform');
    expect(options?.params).not.toHaveProperty('appname');
    expect(result?.formattedAddress).toBe('广东省广州市天河区天河公园');
  });

  it('falls back to current process env when the service env snapshot is empty', async () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      MAP_SERVICE_PROVIDER: 'amap-official',
      AMAP_WEB_SERVICE_KEYS: 'amap-official-key',
    };
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: '1',
        info: 'OK',
        infocode: '10000',
        regeocode: {
          formatted_address: '广东省广州市天河区天河公园',
        },
      },
    } as any);

    try {
      const service = new AppMapService() as any;
      service.env = {} as NodeJS.ProcessEnv;

      await service.reverseGeocode(113.366739, 23.128003);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://restapi.amap.com/v3/geocode/regeo',
        expect.any(Object)
      );
    } finally {
      process.env = originalEnv;
    }
  });

  it('prefers current process env over a stale service env snapshot', async () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      MAP_SERVICE_PROVIDER: 'amap-official',
      AMAP_WEB_SERVICE_KEYS: 'amap-official-key',
    };
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: '1',
        info: 'OK',
        infocode: '10000',
        regeocode: {
          formatted_address: '广东省广州市天河区天河公园',
        },
      },
    } as any);

    try {
      const service = new AppMapService() as any;
      service.env = {
        MAP_SERVICE_PROVIDER: 'amap-proxy',
        AMAP_WEB_SERVICE_KEYS: 'stale-proxy-key',
        AMAP_WEB_SERVICE_PROXY_BASE_URL: 'https://amap-proxy.example.invalid/_AMapService',
      } as NodeJS.ProcessEnv;

      await service.reverseGeocode(113.366739, 23.128003);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://restapi.amap.com/v3/geocode/regeo',
        expect.objectContaining({
          params: expect.objectContaining({ key: 'amap-official-key' }),
        })
      );
    } finally {
      process.env = originalEnv;
    }
  });

  it('builds tianditu requests with a browser referer header', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: '0',
        result: {
          formatted_address: '广东省广州市天河区天河公园',
        },
      },
    } as any);

    const service = new AppMapService() as any;
    service.env = {
      MAP_SERVICE_PROVIDER: 'tianditu',
      TIANDITU_WEB_SERVICE_KEYS: 'tdt-key-a',
      TIANDITU_WEB_SERVICE_REFERER: 'https://car-preprod.example.invalid/',
    } as NodeJS.ProcessEnv;

    await service.reverseGeocode(113.366739, 23.128003);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.tianditu.gov.cn/geocoder',
      expect.objectContaining({
        headers: expect.objectContaining({
          Referer: 'https://car-preprod.example.invalid/',
          'User-Agent': 'Mozilla/5.0',
        }),
      })
    );
  });

  it('builds tianditu server-side key requests through ajaxproxy', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: 'var tdt_loadResult={"status":"0","result":{"formatted_address":"广东省广州市天河区天河公园"}};',
    } as any);

    const service = new AppMapService() as any;
    service.env = {
      MAP_SERVICE_PROVIDER: 'tianditu',
      TIANDITU_WEB_SERVICE_KEYS: 'tdt-key-a',
      TIANDITU_WEB_SERVICE_ACCESS: 'server',
    } as NodeJS.ProcessEnv;

    const result = await service.reverseGeocode(113.366739, 23.128003);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.tianditu.gov.cn/apiserver/ajaxproxy',
      expect.objectContaining({
        params: expect.objectContaining({
          proxyReqUrl: expect.stringContaining('https://api.tianditu.gov.cn/geocoder'),
        }),
        headers: expect.not.objectContaining({
          Referer: expect.any(String),
        }),
      })
    );
    const [, options] = mockedAxios.get.mock.calls[0];
    expect(options?.params?.proxyReqUrl).toContain('tk=tdt-key-a');
    expect(result?.formattedAddress).toBe('广东省广州市天河区天河公园');
  });
});
