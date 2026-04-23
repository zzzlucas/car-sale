import { AppMapService, resolveAmapWebServiceConfig } from './map';

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
});
