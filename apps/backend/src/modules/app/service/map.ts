import { randomUUID } from 'crypto';
import axios from 'axios';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { Provide } from '@midwayjs/core';

import type { MapAddressSuggestion, MapReverseGeocodeResult } from '@car/shared-types';

const AMAP_BASE_URL = 'https://restapi.amap.com';
const TIANDITU_BASE_URL = 'https://api.tianditu.gov.cn';
const TIANDITU_SERVER_PROXY_PATH = '/apiserver/ajaxproxy';
const DEFAULT_TIMEOUT_MS = 2500;
const DEFAULT_OFFSET = 5;
const DEFAULT_TIANDITU_REFERER = 'http://localhost:6173/';
const DEFAULT_PROXY_APPNAME = 'https%3A%2F%2Famap.bangban.cc%2Fdt.html';
const DEFAULT_PROXY_CALLBACK = 'jsonp_test';
const DEFAULT_PROXY_REFERER = 'https://amap.bangban.cc/dt.html';
const DEFAULT_PROXY_X_REQUESTED_WITH = 'com.bangban.cc';

const KEY_POOL_ERROR_CODES = new Set([
  '10001',
  '10003',
  '10004',
  '10006',
  '10008',
  '10009',
  '10010',
  '10021',
  '10029',
  '10044',
]);

const KEY_POOL_ERROR_INFOS = new Set([
  'INVALID_USER_KEY',
  'SERVICE_NOT_AVAILABLE',
  'DAILY_QUERY_OVER_LIMIT',
  'ACCESS_TOO_FREQUENT',
  'INVALID_USER_DOMAIN',
  'USERKEY_PLAT_NOMATCH',
  'INVALID_USER_SCODE',
  'USER_DAILY_QUERY_OVER_LIMIT',
]);

interface AmapPlaceTextPoi {
  id?: string;
  name?: string;
  address?: string;
  pname?: string;
  cityname?: string;
  adname?: string;
  location?: string;
}

interface AmapPlaceTextResponse {
  status?: string;
  info?: string;
  infocode?: string;
  pois?: AmapPlaceTextPoi[];
}

interface AmapRegeoResponse {
  status?: string;
  info?: string;
  infocode?: string;
  regeocode?: {
    formatted_address?: string;
  };
}

interface TiandituSearchPoi {
  hotPointID?: string;
  name?: string;
  address?: string;
  lonlat?: string;
}

interface TiandituSearchResponse {
  status?: string | number | { infocode?: string | number; cndesc?: string };
  msg?: string;
  pois?: TiandituSearchPoi[];
}

interface TiandituRegeoResponse {
  status?: string | number;
  msg?: string;
  result?: {
    formatted_address?: string;
    formattedAddress?: string;
    addressComponent?: {
      address?: string;
    };
  };
}

type MapServiceProvider = 'tianditu' | 'amap';
type TiandituAccessMode = 'browser' | 'server';

function parseKeyPool(rawPool: string) {
  return Array.from(
    new Set(
      rawPool
        .split(/[\s,]+/)
        .map(item => item.trim())
        .filter(Boolean)
    )
  );
}

export function resolveMapServiceProvider(env: NodeJS.ProcessEnv): MapServiceProvider {
  const provider = String(env.MAP_SERVICE_PROVIDER || 'tianditu')
    .trim()
    .toLowerCase();

  return provider === 'amap' ? 'amap' : 'tianditu';
}

export function resolveTiandituWebServiceConfig(env: NodeJS.ProcessEnv) {
  const rawPool = [env.TIANDITU_WEB_SERVICE_KEYS, env.TIANDITU_WEB_SERVICE_KEY]
    .filter(Boolean)
    .join('\n');

  const keys = parseKeyPool(rawPool);
  const timeoutMs = Math.max(
    1000,
    Number(env.TIANDITU_WEB_SERVICE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS)
  );

  const access = String(env.TIANDITU_WEB_SERVICE_ACCESS || 'browser')
    .trim()
    .toLowerCase();

  return {
    enabled: keys.length > 0,
    keys,
    timeoutMs,
    access: access === 'server' ? 'server' : 'browser' as TiandituAccessMode,
    referer: env.TIANDITU_WEB_SERVICE_REFERER?.trim() || DEFAULT_TIANDITU_REFERER,
  };
}

export function resolveAmapWebServiceConfig(env: NodeJS.ProcessEnv) {
  const rawPool = [env.AMAP_WEB_SERVICE_KEYS, env.AMAP_WEB_SERVICE_KEY]
    .filter(Boolean)
    .join('\n');

  const keys = parseKeyPool(rawPool);

  const timeoutMs = Math.max(
    1000,
    Number(env.AMAP_WEB_SERVICE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS)
  );

  return {
    enabled: keys.length > 0,
    keys,
    timeoutMs,
    proxyBaseUrl: env.AMAP_WEB_SERVICE_PROXY_BASE_URL?.trim() || '',
    proxyAppname: env.AMAP_WEB_SERVICE_PROXY_APPNAME?.trim() || DEFAULT_PROXY_APPNAME,
    proxyCallback: env.AMAP_WEB_SERVICE_PROXY_CALLBACK?.trim() || DEFAULT_PROXY_CALLBACK,
    proxyReferer: env.AMAP_WEB_SERVICE_PROXY_REFERER?.trim() || DEFAULT_PROXY_REFERER,
    proxyRequestedWith:
      env.AMAP_WEB_SERVICE_PROXY_X_REQUESTED_WITH?.trim() || DEFAULT_PROXY_X_REQUESTED_WITH,
  };
}

@Provide()
export class AppMapService extends BaseService {
  env: NodeJS.ProcessEnv = process.env;

  private keyCursor = 0;

  async searchAddressSuggestions(rawKeywords: string): Promise<MapAddressSuggestion[]> {
    const keywords = String(rawKeywords || '').trim();
    if (keywords.length < 2) {
      return [];
    }

    if (resolveMapServiceProvider(this.env) === 'tianditu') {
      return this.searchAddressSuggestionsByTianditu(keywords);
    }

    return this.searchAddressSuggestionsByAmap(keywords);
  }

  async reverseGeocode(
    longitude: number,
    latitude: number
  ): Promise<MapReverseGeocodeResult | null> {
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      throw new CoolCommException('缺少有效经纬度');
    }

    if (resolveMapServiceProvider(this.env) === 'tianditu') {
      return this.reverseGeocodeByTianditu(longitude, latitude);
    }

    return this.reverseGeocodeByAmap(longitude, latitude);
  }

  private async searchAddressSuggestionsByTianditu(
    keywords: string
  ): Promise<MapAddressSuggestion[]> {
    const config = resolveTiandituWebServiceConfig(this.env);
    if (!config.enabled) {
      throw new CoolCommException('天地图服务暂未配置');
    }

    const attempts = this.buildAttempts(config.keys);
    let fallbackTriggered = false;

    for (const attempt of attempts) {
      try {
        const payload = (await this.requestTianditu(
          '/v2/search',
          {
            tk: attempt.key,
            type: 'query',
            postStr: JSON.stringify({
              keyWord: keywords,
              level: 12,
              mapBound: '-180,-90,180,90',
              queryType: 1,
              count: DEFAULT_OFFSET,
              start: 0,
            }),
          },
          config.timeoutMs
        )) as TiandituSearchResponse;

        if (this.isTiandituSuccess(payload)) {
          this.keyCursor = (attempt.index + 1) % config.keys.length;
          return this.mapTiandituPois(payload.pois);
        }

        if (attempts.length > 1) {
          fallbackTriggered = true;
          continue;
        }

        throw new CoolCommException(this.toTiandituPublicErrorMessage(payload));
      } catch (error) {
        if (error instanceof CoolCommException) {
          throw error;
        }

        if (this.shouldFallbackByError(error) && attempts.length > 1) {
          fallbackTriggered = true;
          continue;
        }

        throw new CoolCommException('天地图服务暂时不可用，请稍后重试');
      }
    }

    if (fallbackTriggered) {
      throw new CoolCommException('天地图服务暂时不可用，请稍后重试');
    }

    return [];
  }

  private async reverseGeocodeByTianditu(
    longitude: number,
    latitude: number
  ): Promise<MapReverseGeocodeResult | null> {
    const config = resolveTiandituWebServiceConfig(this.env);
    if (!config.enabled) {
      throw new CoolCommException('天地图服务暂未配置');
    }

    const attempts = this.buildAttempts(config.keys);
    let fallbackTriggered = false;

    for (const attempt of attempts) {
      try {
        const payload = (await this.requestTianditu(
          '/geocoder',
          {
            tk: attempt.key,
            type: 'geocode',
            postStr: JSON.stringify({ lon: longitude, lat: latitude, ver: 1 }),
          },
          config.timeoutMs
        )) as TiandituRegeoResponse;

        if (this.isTiandituSuccess(payload)) {
          this.keyCursor = (attempt.index + 1) % config.keys.length;
          return this.mapTiandituReverseGeocode(payload, longitude, latitude);
        }

        if (attempts.length > 1) {
          fallbackTriggered = true;
          continue;
        }

        throw new CoolCommException(this.toTiandituPublicErrorMessage(payload));
      } catch (error) {
        if (error instanceof CoolCommException) {
          throw error;
        }

        if (this.shouldFallbackByError(error) && attempts.length > 1) {
          fallbackTriggered = true;
          continue;
        }

        throw new CoolCommException('天地图服务暂时不可用，请稍后重试');
      }
    }

    if (fallbackTriggered) {
      throw new CoolCommException('天地图服务暂时不可用，请稍后重试');
    }

    return null;
  }

  private async searchAddressSuggestionsByAmap(
    keywords: string
  ): Promise<MapAddressSuggestion[]> {

    const config = resolveAmapWebServiceConfig(this.env);
    if (!config.enabled) {
      throw new CoolCommException('地图服务暂未配置');
    }

    const attempts = this.buildAttempts(config.keys);
    let fallbackTriggered = false;

    for (const attempt of attempts) {
      try {
        const payload = (await this.requestAmap(
          '/v3/place/text',
          {
            key: attempt.key,
            keywords,
            offset: String(DEFAULT_OFFSET),
            page: '1',
            extensions: 'base',
          },
          config.timeoutMs
        )) as AmapPlaceTextResponse;

        if (String(payload.status) === '1') {
          this.keyCursor = (attempt.index + 1) % config.keys.length;
          return this.mapPois(payload.pois);
        }

        if (this.shouldFallbackByResponse(payload) && attempts.length > 1) {
          fallbackTriggered = true;
          continue;
        }

        throw new CoolCommException(this.toPublicErrorMessage(payload));
      } catch (error) {
        if (error instanceof CoolCommException) {
          throw error;
        }

        if (this.shouldFallbackByError(error) && attempts.length > 1) {
          fallbackTriggered = true;
          continue;
        }

        throw new CoolCommException('地图服务暂时不可用，请稍后重试');
      }
    }

    if (fallbackTriggered) {
      throw new CoolCommException('地图服务暂时不可用，请稍后重试');
    }

    return [];
  }

  private async reverseGeocodeByAmap(
    longitude: number,
    latitude: number
  ): Promise<MapReverseGeocodeResult | null> {
    const config = resolveAmapWebServiceConfig(this.env);
    if (!config.enabled) {
      throw new CoolCommException('地图服务暂未配置');
    }

    const attempts = this.buildAttempts(config.keys);
    let fallbackTriggered = false;

    for (const attempt of attempts) {
      try {
        const payload = (await this.requestAmap(
          '/v3/geocode/regeo',
          {
            key: attempt.key,
            location: `${longitude},${latitude}`,
            extensions: 'base',
          },
          config.timeoutMs
        )) as AmapRegeoResponse;

        if (String(payload.status) === '1') {
          this.keyCursor = (attempt.index + 1) % config.keys.length;
          return this.mapReverseGeocode(payload, longitude, latitude);
        }

        if (this.shouldFallbackByResponse(payload) && attempts.length > 1) {
          fallbackTriggered = true;
          continue;
        }

        throw new CoolCommException(this.toPublicErrorMessage(payload));
      } catch (error) {
        if (error instanceof CoolCommException) {
          throw error;
        }

        if (this.shouldFallbackByError(error) && attempts.length > 1) {
          fallbackTriggered = true;
          continue;
        }

        throw new CoolCommException('地图服务暂时不可用，请稍后重试');
      }
    }

    if (fallbackTriggered) {
      throw new CoolCommException('地图服务暂时不可用，请稍后重试');
    }

    return null;
  }

  protected async requestAmap(
    path: string,
    params: Record<string, string>,
    timeoutMs: number
  ): Promise<AmapPlaceTextResponse | AmapRegeoResponse> {
    const config = resolveAmapWebServiceConfig(this.env);
    if (config.proxyBaseUrl) {
      return this.requestAmapByProxy(path, params, timeoutMs, config);
    }

    const response = await axios.get(`${AMAP_BASE_URL}${path}`, {
      params,
      timeout: timeoutMs,
    });

    return this.parseAmapPayload(response.data) as AmapPlaceTextResponse | AmapRegeoResponse;
  }

  protected async requestTianditu(
    path: string,
    params: Record<string, string>,
    timeoutMs: number
  ): Promise<TiandituSearchResponse | TiandituRegeoResponse> {
    const config = resolveTiandituWebServiceConfig(this.env);
    if (config.access === 'server') {
      return this.requestTiandituByServerProxy(path, params, timeoutMs);
    }

    const response = await axios.get(`${TIANDITU_BASE_URL}${path}`, {
      params,
      headers: {
        Referer: config.referer,
        'User-Agent': 'Mozilla/5.0',
      },
      timeout: timeoutMs,
    });

    return response.data as TiandituSearchResponse | TiandituRegeoResponse;
  }

  private async requestTiandituByServerProxy(
    path: string,
    params: Record<string, string>,
    timeoutMs: number
  ): Promise<TiandituSearchResponse | TiandituRegeoResponse> {
    const targetUrl = `${TIANDITU_BASE_URL}${path}?${new URLSearchParams(params).toString()}`;
    const response = await axios.get(`${TIANDITU_BASE_URL}${TIANDITU_SERVER_PROXY_PATH}`, {
      params: {
        proxyReqUrl: targetUrl,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      timeout: timeoutMs,
      responseType: 'text',
      transformResponse: [data => data],
    });

    return this.parseTiandituPayload(response.data) as
      | TiandituSearchResponse
      | TiandituRegeoResponse;
  }

  private buildAttempts(keys: string[]) {
    return keys.map((_, offset) => {
      const index = (this.keyCursor + offset) % keys.length;
      return {
        index,
        key: keys[index],
      };
    });
  }

  private shouldFallbackByResponse(payload: AmapPlaceTextResponse) {
    const code = String(payload.infocode || '').trim();
    const info = String(payload.info || '').trim().toUpperCase();

    return KEY_POOL_ERROR_CODES.has(code) || KEY_POOL_ERROR_INFOS.has(info);
  }

  private shouldFallbackByError(error: unknown) {
    return axios.isAxiosError(error) || error instanceof Error;
  }

  private toPublicErrorMessage(payload: AmapPlaceTextResponse) {
    if (String(payload.infocode || '').trim() === '10001') {
      return '地图服务鉴权失败，请稍后重试';
    }

    if (String(payload.infocode || '').trim() === '10003') {
      return '地图服务额度已用尽，请稍后重试';
    }

    if (String(payload.infocode || '').trim() === '10009') {
      return '当前高德 Key 不支持后端 Web 服务调用';
    }

    if (String(payload.infocode || '').trim() === '10006') {
      return '当前高德 Key 未授权线上域名';
    }

    return '地图服务暂时不可用，请稍后重试';
  }

  private async requestAmapByProxy(
    path: string,
    params: Record<string, string>,
    timeoutMs: number,
    config: ReturnType<typeof resolveAmapWebServiceConfig>
  ) {
    const { key, ...rest } = params;
    const timestamp = Math.floor(Date.now() / 1000);
    const response = await axios.get(`${config.proxyBaseUrl}${path}`, {
      params: {
        platform: 'JS',
        s: 'rsv3',
        logversion: '2.0',
        key,
        sdkversion: '2.3.5.6',
        appname: config.proxyAppname,
        language: 'zh_cn',
        csid: randomUUID().replace(/-/g, ''),
        callback: config.proxyCallback,
        ...rest,
      },
      headers: {
        Referer: `${config.proxyReferer}?time=${timestamp}`,
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': config.proxyRequestedWith,
      },
      timeout: timeoutMs,
      responseType: 'text',
      transformResponse: [data => data],
    });

    return this.parseAmapPayload(response.data) as AmapPlaceTextResponse | AmapRegeoResponse;
  }

  private mapPois(pois: AmapPlaceTextPoi[] | undefined): MapAddressSuggestion[] {
    return (pois ?? [])
      .map(poi => {
        const location = this.parseLocation(poi.location);
        if (!location || !poi.name?.trim()) {
          return null;
        }

        return {
          id: String(poi.id || `${location.longitude},${location.latitude}`),
          name: poi.name.trim(),
          formattedAddress: this.formatAddress(poi),
          latitude: location.latitude,
          longitude: location.longitude,
        } satisfies MapAddressSuggestion;
      })
      .filter((item): item is MapAddressSuggestion => Boolean(item));
  }

  private mapReverseGeocode(
    payload: AmapRegeoResponse,
    longitude: number,
    latitude: number
  ): MapReverseGeocodeResult | null {
    const formattedAddress = String(payload.regeocode?.formatted_address || '').trim();
    if (!formattedAddress) {
      return null;
    }

    return {
      formattedAddress,
      latitude,
      longitude,
    };
  }

  private mapTiandituPois(
    pois: TiandituSearchPoi[] | undefined
  ): MapAddressSuggestion[] {
    return (pois ?? [])
      .map(poi => {
        const location = this.parseLocation(poi.lonlat);
        const name = String(poi.name || '').trim();
        if (!location || !name) {
          return null;
        }

        const formattedAddress = [poi.address, poi.name]
          .map(item => String(item || '').trim())
          .filter(Boolean)
          .filter((item, index, items) => items.indexOf(item) === index)
          .join(' ');

        return {
          id: String(poi.hotPointID || `${location.longitude},${location.latitude}`),
          name,
          formattedAddress,
          latitude: location.latitude,
          longitude: location.longitude,
        } satisfies MapAddressSuggestion;
      })
      .filter((item): item is MapAddressSuggestion => Boolean(item));
  }

  private mapTiandituReverseGeocode(
    payload: TiandituRegeoResponse,
    longitude: number,
    latitude: number
  ): MapReverseGeocodeResult | null {
    const formattedAddress = String(
      payload.result?.formatted_address ||
        payload.result?.formattedAddress ||
        payload.result?.addressComponent?.address ||
        ''
    ).trim();

    if (!formattedAddress) {
      return null;
    }

    return {
      formattedAddress,
      latitude,
      longitude,
    };
  }

  private isTiandituSuccess(payload: TiandituSearchResponse | TiandituRegeoResponse) {
    const status = payload.status;
    if (typeof status === 'object' && status) {
      return String(status.infocode || '').trim() === '1000';
    }

    return String(status ?? '').trim() === '0';
  }

  private toTiandituPublicErrorMessage(
    payload: TiandituSearchResponse | TiandituRegeoResponse
  ) {
    const message = String(payload.msg || '').trim();
    return message ? `天地图服务不可用：${message}` : '天地图服务暂时不可用，请稍后重试';
  }

  private parseAmapPayload(payload: unknown) {
    if (typeof payload === 'string') {
      const normalized = payload.trim();
      if (normalized.startsWith('{') || normalized.startsWith('[')) {
        return JSON.parse(normalized);
      }

      const leftBracket = normalized.indexOf('(');
      if (leftBracket >= 0 && normalized.endsWith(')')) {
        return JSON.parse(normalized.slice(leftBracket + 1, -1).trim());
      }
    }

    return payload;
  }

  private parseTiandituPayload(payload: unknown) {
    if (typeof payload === 'string') {
      const normalized = payload.trim();
      if (normalized.startsWith('{') || normalized.startsWith('[')) {
        return JSON.parse(normalized);
      }

      const assignment = normalized.indexOf('=');
      if (assignment >= 0) {
        return JSON.parse(normalized.slice(assignment + 1).replace(/;\s*$/, '').trim());
      }
    }

    return payload;
  }

  private parseLocation(rawLocation?: string) {
    const [rawLongitude, rawLatitude] = String(rawLocation || '').split(',');
    const longitude = Number(rawLongitude);
    const latitude = Number(rawLatitude);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return null;
    }

    return {
      longitude,
      latitude,
    };
  }

  private formatAddress(poi: AmapPlaceTextPoi) {
    const parts: string[] = [];

    for (const item of [poi.pname, poi.cityname, poi.adname, poi.address, poi.name]) {
      const value = String(item || '').trim();
      if (!value || parts.includes(value)) {
        continue;
      }
      parts.push(value);
    }

    return parts.join(' ');
  }
}
