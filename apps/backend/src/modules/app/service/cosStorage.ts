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
const DEFAULT_IMAGE_EXTENSION = '.jpg';
const COS_BUCKET_APP_ID_SUFFIX_PATTERN = /-\d{5,}$/;
const IMAGE_EXTENSION_CONTENT_TYPE_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};
const IMAGE_CONTENT_TYPE_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': DEFAULT_IMAGE_EXTENSION,
  'image/jpg': DEFAULT_IMAGE_EXTENSION,
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
};
const SUPPORTED_IMAGE_FORMAT_LABEL = 'jpg、jpeg、png、webp、heic、heif';

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
    return '';
  }
  return extension;
}

function normalizeBucketName(bucket: string, appId?: string) {
  if (!bucket) {
    return '';
  }

  if (COS_BUCKET_APP_ID_SUFFIX_PATTERN.test(bucket)) {
    return bucket;
  }

  return appId ? `${bucket}-${appId}` : bucket;
}

function normalizeImageContentType(contentType?: string) {
  const normalized = (contentType || '').split(';')[0].trim().toLowerCase();
  if (!normalized) {
    return '';
  }

  return normalized === 'image/jpg' ? 'image/jpeg' : normalized;
}

function resolveAllowedImageUpload(fileName: string, contentType?: string) {
  const extension = normalizeExtension(fileName);
  const normalizedContentType = normalizeImageContentType(contentType);
  const hasExplicitExtension = Boolean(extension);

  if (hasExplicitExtension && !IMAGE_EXTENSION_CONTENT_TYPE_MAP[extension]) {
    throw new CoolCommException(`仅支持上传图片，当前仅允许 ${SUPPORTED_IMAGE_FORMAT_LABEL} 格式`);
  }

  if (normalizedContentType && !IMAGE_CONTENT_TYPE_EXTENSION_MAP[normalizedContentType]) {
    throw new CoolCommException(`仅支持上传图片，当前仅允许 ${SUPPORTED_IMAGE_FORMAT_LABEL} 格式`);
  }

  if (!hasExplicitExtension && !normalizedContentType) {
    throw new CoolCommException(`仅支持上传图片，当前仅允许 ${SUPPORTED_IMAGE_FORMAT_LABEL} 格式`);
  }

  const resolvedExtension =
    extension || IMAGE_CONTENT_TYPE_EXTENSION_MAP[normalizedContentType] || DEFAULT_IMAGE_EXTENSION;
  const resolvedContentType =
    normalizedContentType || IMAGE_EXTENSION_CONTENT_TYPE_MAP[resolvedExtension];

  if (normalizedContentType) {
    const expectedContentType = IMAGE_EXTENSION_CONTENT_TYPE_MAP[resolvedExtension];
    if (expectedContentType && normalizedContentType !== expectedContentType) {
      throw new CoolCommException('图片类型与文件后缀不匹配，请重新选择图片后再试');
    }
  }

  return {
    extension: resolvedExtension,
    contentType: resolvedContentType,
  };
}

function buildValuationPhotoKey(uploadPrefix: string, visitorKey: string, extension: string) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const safeVisitorKey = sanitizePathSegment(visitorKey, 'visitor');

  return normalizeCosKey(
    `${uploadPrefix}visitors/${safeVisitorKey}/valuation-orders/${year}/${month}/${uuid()}${extension}`
  );
}

function createSignedHeaders(contentType: string) {
  return {
    'Content-Type': contentType,
  };
}

export function resolveCosStorageConfig(
  env: NodeJS.ProcessEnv = process.env
): ResolvedCosStorageConfig {
  const region = env.COS_REGION?.trim() || '';
  const rawBucket = env.COS_BUCKET?.trim() || '';
  const appId = env.COS_APP_ID?.trim() || '';
  const bucket = normalizeBucketName(rawBucket, appId);
  const secretId = env.COS_SECRET_ID?.trim() || '';
  const secretKey = env.COS_SECRET_KEY?.trim() || '';

  const missingKeys = [
    !region ? 'COS_REGION' : null,
    !rawBucket ? 'COS_BUCKET' : null,
    rawBucket && !COS_BUCKET_APP_ID_SUFFIX_PATTERN.test(rawBucket) && !appId ? 'COS_APP_ID' : null,
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
    const imageUpload = resolveAllowedImageUpload(fileName, contentType);
    const key = buildValuationPhotoKey(config.uploadPrefix, visitorKey, imageUpload.extension);
    const headers = createSignedHeaders(imageUpload.contentType);

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
