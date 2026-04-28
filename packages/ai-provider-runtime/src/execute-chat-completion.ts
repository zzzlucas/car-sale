import { resolveModelTargetLevel } from './model-routing';
import type {
  AiProviderExecutionKey,
  AiProviderExecutionResult,
  AiProviderTraceMeta,
  ExecuteChatCompletionParams,
  ExecuteChatCompletionRequestParams,
  ExecuteChatCompletionRequestResult,
} from './types';

function isUsableKey(entry: AiProviderExecutionKey): boolean {
  return entry.key.trim().length > 0;
}

function matchesLevel(entry: AiProviderExecutionKey, level: number): boolean {
  return entry.level === undefined || entry.level === level;
}

function createMeta(
  entry: AiProviderExecutionKey,
  model: string,
  routingReason: string
): AiProviderTraceMeta {
  return {
    model,
    keyId: entry.label,
    routingReason,
  };
}

function toRequestParams(
  entry: AiProviderExecutionKey,
  model: string,
  meta: AiProviderTraceMeta
): ExecuteChatCompletionRequestParams {
  return {
    key: entry.key,
    model,
    meta,
  };
}

function isWrappedRequestResult<TResponse = unknown>(
  value: TResponse | ExecuteChatCompletionRequestResult<TResponse>
): value is ExecuteChatCompletionRequestResult<TResponse> {
  return (
    typeof value === 'object'
    && value !== null
    && 'data' in value
    && ('usage' in value || 'meta' in value)
  );
}

function normalizeRequestResult<TResponse = unknown>(
  value: TResponse | ExecuteChatCompletionRequestResult<TResponse>,
  meta: AiProviderTraceMeta
): AiProviderExecutionResult<TResponse> {
  if (isWrappedRequestResult(value)) {
    return {
      data: value.data,
      usage: value.usage,
      meta: {
        ...meta,
        ...value.meta,
      },
    };
  }

  return {
    data: value,
    meta,
  };
}

export async function executeChatCompletion<TResponse = unknown>(
  params: ExecuteChatCompletionParams<TResponse>
): Promise<AiProviderExecutionResult<TResponse>> {
  const {
    model,
    level1Allowlist,
    primaryKeys,
    fallbackKeys,
    request,
    shouldFallbackOnError = () => true,
  } = params;
  const { level, reason } = resolveModelTargetLevel(model, level1Allowlist);

  const preferredKeys = primaryKeys.filter((entry) => matchesLevel(entry, level) && isUsableKey(entry));
  const fallbackLevel = level === 1 ? 10 : level;
  const backupKeys = fallbackKeys.filter((entry) => matchesLevel(entry, fallbackLevel) && isUsableKey(entry));
  const candidateKeys = [...preferredKeys, ...backupKeys];

  if (candidateKeys.length === 0) {
    throw new Error(`No usable API key available for model "${model}"`);
  }

  let lastError: unknown;

  for (const entry of candidateKeys) {
    const meta = createMeta(entry, model, reason);

    try {
      const data = await request(toRequestParams(entry, model, meta));
      return normalizeRequestResult(data, meta);
    } catch (error) {
      lastError = error;
      if (!shouldFallbackOnError(error)) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Chat completion request failed');
}
