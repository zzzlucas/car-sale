import { CoolCommException } from '@cool-midway/core';
import { Provide } from '@midwayjs/core';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

import type {
  ValuationPhotoUploadTicketPayload,
  ValuationPhotoUploadTicketResult,
} from '@car/shared-types';

import COS = require('cos-nodejs-sdk-v5');

const COS_POINTER_PREFIX = 'cos://';
const DEFAULT_UPLOAD_PREFIX = 'car-platform-dev/';
const DEFAULT_SIGN_EXPIRES = 900;

interface ResolvedCosStorageConfig {
  enabled: boolean;
  region: string;
  bucket: string;
  secretId: string;
  secretKey: string;
  uploadPrefix: string;
  signExpires: number;
  missingKeys: string[];
}

function normalizeCosKey(value: string) {
  return value.replace(/\\/g, '/').replace(/^\/+/, '');
}

function normalizeUploadPrefix(value?: string) {
  const normalized = normalizeCosKey((value || DEFAULT_UPLOAD_PREFIX).trim()).replace(/\/+$/, '');
  return normalized ? `${normalized}/` : '';
}

function normalizeSignExpires(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_SIGN_EXPIRES;
}

function sanitizePathSegment(value: string, fallback: string) {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
}

function normalizeExtension(fileName: string) {
  const extension = path.extname(path.basename(fileName || '')).toLowerCase();
  if (!extension || extension.length > 10) {
    return '.jpg';
  }
  return extension;
}

function buildValuationPhotoKey(uploadPrefix: string, visitorKey: string, fileName: string) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const safeVisitorKey = sanitizePathSegment(visitorKey, 'visitor');
  const extension = normalizeExtension(fileName);

  return normalizeCosKey(
    `${uploadPrefix}visitors/${safeVisitorKey}/valuation-orders/${year}/${month}/${uuid()}${extension}`
  );
}

function createSignedHeaders(contentType?: string) {
  return {
    'Content-Type': contentType?.trim() || 'application/octet-stream',
  };
}

export function resolveCosStorageConfig(
  env: NodeJS.ProcessEnv = process.env
): ResolvedCosStorageConfig {
  const region = env.COS_REGION?.trim() || '';
  const bucket = env.COS_BUCKET?.trim() || '';
  const secretId = env.COS_SECRET_ID?.trim() || '';
  const secretKey = env.COS_SECRET_KEY?.trim() || '';

  const missingKeys = [
    !region ? 'COS_REGION' : null,
    !bucket ? 'COS_BUCKET' : null,
    !secretId ? 'COS_SECRET_ID' : null,
    !secretKey ? 'COS_SECRET_KEY' : null,
  ].filter(Boolean) as string[];

  return {
    enabled: missingKeys.length === 0,
    region,
    bucket,
    secretId,
    secretKey,
    uploadPrefix: normalizeUploadPrefix(env.COS_UPLOAD_PREFIX),
    signExpires: normalizeSignExpires(env.COS_SIGN_EXPIRES),
    missingKeys,
  };
}

export function buildCosObjectPointer(key: string) {
  return `${COS_POINTER_PREFIX}${normalizeCosKey(key)}`;
}

export function parseCosObjectPointer(value: string) {
  if (!value.startsWith(COS_POINTER_PREFIX)) {
    return null;
  }

  return normalizeCosKey(value.slice(COS_POINTER_PREFIX.length));
}

@Provide()
export class AppCosStorageService {
  env: NodeJS.ProcessEnv = process.env;

  private client: COS | null = null;

  createValuationPhotoUploadTicket({
    visitorKey,
    fileName,
    contentType,
  }: ValuationPhotoUploadTicketPayload & { visitorKey: string }): ValuationPhotoUploadTicketResult {
    if (!visitorKey.trim()) {
      throw new CoolCommException('访客标识缺失，无法生成上传票据');
    }

    const config = this.getRequiredConfig();
    const key = buildValuationPhotoKey(config.uploadPrefix, visitorKey, fileName);
    const headers = createSignedHeaders(contentType);

    return {
      uploadUrl: this.getClient(config).getObjectUrl({
        Bucket: config.bucket,
        Region: config.region,
        Key: key,
        Method: 'PUT',
        Sign: true,
        Expires: config.signExpires,
        Headers: headers,
      }),
      method: 'PUT',
      headers,
      objectPointer: buildCosObjectPointer(key),
      expiresAt: new Date(Date.now() + config.signExpires * 1000).toISOString(),
    };
  }

  resolveDisplayUrl(value: string) {
    const key = parseCosObjectPointer(value);
    if (!key) {
      return value;
    }

    const config = resolveCosStorageConfig(this.env);
    if (!config.enabled) {
      return value;
    }

    return this.getClient(config).getObjectUrl({
      Bucket: config.bucket,
      Region: config.region,
      Key: key,
      Method: 'GET',
      Sign: true,
      Expires: config.signExpires,
    });
  }

  private getRequiredConfig() {
    const config = resolveCosStorageConfig(this.env);
    if (!config.enabled) {
      throw new CoolCommException(
        `腾讯云 COS 配置不完整：${config.missingKeys.join(', ')}`
      );
    }
    return config;
  }

  private getClient(config: ResolvedCosStorageConfig) {
    if (!this.client) {
      this.client = new COS({
        SecretId: config.secretId,
        SecretKey: config.secretKey,
        Protocol: 'https:',
      });
    }

    return this.client;
  }
}
