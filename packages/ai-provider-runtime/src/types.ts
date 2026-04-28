export interface AiProviderUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AiProviderTraceMeta {
  traceId?: string;
  provider?: string;
  model?: string;
  keyId?: string;
  keyMasked?: string;
  routingReason?: string;
}

export interface AiProviderExecutionKey {
  key: string;
  level?: number;
  label?: string;
}

export interface AiProviderExecutionResult<TResponse = unknown> {
  data: TResponse;
  usage?: AiProviderUsage;
  meta?: AiProviderTraceMeta;
}

export interface ExecuteChatCompletionRequestParams {
  key: string;
  model: string;
  meta: AiProviderTraceMeta;
}

export interface ExecuteChatCompletionRequestResult<TResponse = unknown> {
  data: TResponse;
  usage?: AiProviderUsage;
  meta?: Partial<AiProviderTraceMeta>;
}

export interface ExecuteChatCompletionParams<TResponse = unknown> {
  model: string;
  level1Allowlist: string[];
  primaryKeys: AiProviderExecutionKey[];
  fallbackKeys: AiProviderExecutionKey[];
  request: (
    params: ExecuteChatCompletionRequestParams
  ) => Promise<TResponse | ExecuteChatCompletionRequestResult<TResponse>>;
  shouldFallbackOnError?: (error: unknown) => boolean;
}
