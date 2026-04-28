import { BaseService } from '@cool-midway/core';
import { Provide } from '@midwayjs/core';
import axios from 'axios';
import {
  executeChatCompletion,
  parseEnvKeys,
  type AiProviderExecutionKey,
  type AiProviderExecutionResult,
} from '@workspace-packages/ai-provider-runtime';

import type {
  SupportChatMessage,
  SupportChatRequest,
  SupportChatResponse,
  SupportChatUsage,
} from '@car/shared-types';

const SUPPORT_SCENE = 'customer_support';
const DEFAULT_SUPPORT_MODEL = 'deepseek-ai/DeepSeek-V3.2';
const FALLBACK_REPLY =
  '我先为您转成基础人工协助建议：当前智能答复暂时不可用，建议直接联系专业客服继续处理。';

@Provide()
export class AppSupportAiService extends BaseService {
  env: NodeJS.ProcessEnv = process.env;

  async chat(payload: SupportChatRequest): Promise<SupportChatResponse> {
    const conversationId = this.resolveConversationId(payload?.conversationId);
    const messages = this.resolveIncomingMessages(payload);
    const turnCount = this.resolveTurnCount(payload?.turnCount, messages);
    const latestUserMessage = this.getLatestUserMessage(messages);

    try {
      const aiResponse = await this.executeRuntimeChat({
        scene: payload?.scene || SUPPORT_SCENE,
        messages,
        orderId: payload?.orderId,
      });
      const reply = this.extractReply(aiResponse);
      if (!reply) {
        return this.buildFallbackResponse(conversationId, turnCount, latestUserMessage);
      }

      return {
        conversationId,
        reply,
        traceId: aiResponse.meta?.traceId,
        model: aiResponse.meta?.model,
        escalation: this.buildEscalation(turnCount, latestUserMessage),
        usage: aiResponse.usage ?? null,
      };
    } catch {
      return this.buildFallbackResponse(conversationId, turnCount, latestUserMessage);
    }
  }

  protected async executeRuntimeChat(params: {
    scene: string;
    messages: SupportChatMessage[];
    orderId?: string;
  }): Promise<AiProviderExecutionResult<any>> {
    const baseUrl = this.resolveBaseUrl();
    const primaryKeys = this.resolvePrimaryKeys();
    const fallbackKeys = this.resolveFallbackKeys();
    const model = this.resolveModel();
    const timeoutMs = this.resolveTimeoutMs();

    if (!baseUrl || (primaryKeys.length === 0 && fallbackKeys.length === 0)) {
      throw new Error('Support AI provider is not configured');
    }

    return executeChatCompletion({
      model,
      level1Allowlist: this.resolveLevel1Allowlist(model),
      primaryKeys,
      fallbackKeys,
      request: async ({ key, model: resolvedModel, meta }) => {
        const response = await axios.post(
          `${baseUrl}/chat/completions`,
          {
            model: resolvedModel,
            messages: this.buildRuntimeMessages(params.scene, params.messages, params.orderId),
            temperature: 0.2,
            stream: false,
          },
          {
            headers: {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            timeout: timeoutMs,
          }
        );

        return {
          data: response.data,
          usage: this.normalizeUsage(response.data?.usage),
          meta: {
            ...meta,
            provider: this.resolveProvider(),
            traceId: this.extractTraceId(response),
          },
        };
      },
    });
  }

  private getRuntimeEnv() {
    return {
      ...this.env,
      ...process.env,
    } as NodeJS.ProcessEnv;
  }

  private buildRuntimeMessages(scene: string, messages: SupportChatMessage[], orderId?: string) {
    const safeOrderId = this.resolveSafeOrderId(orderId);
    const orderContext = safeOrderId
      ? [
          {
            role: 'system' as const,
            content: `当前会话关联订单号：${safeOrderId}。仅在用户明确提到订单问题时参考该信息，不要臆造订单状态。`,
          },
        ]
      : [];

    return [
      {
        role: 'system' as const,
        content: `你是车辆回收平台的${scene}助手。回答尽量简洁、口语化，优先帮助用户理解流程、材料、进度与预约相关问题；如果问题需要人工继续处理，请直接建议联系专业客服。不要承诺最终报价、政策结论或办理结果。`,
      },
      ...orderContext,
      ...messages,
    ];
  }

  private resolveIncomingMessages(payload: SupportChatRequest): SupportChatMessage[] {
    const directMessages = Array.isArray(payload?.messages)
      ? payload.messages
          .map(item => this.normalizeSupportMessage(item))
          .filter((item): item is SupportChatMessage => !!item)
      : [];

    const historyMessages = Array.isArray(payload?.history)
      ? payload.history
          .map(item => this.normalizeSupportMessage(item))
          .filter((item): item is SupportChatMessage => !!item)
      : [];

    const messages = directMessages.length > 0 ? directMessages : historyMessages;
    const userMessage = String(payload?.userMessage || '').trim();
    if (userMessage && !messages.some(item => item.role === 'user' && item.content === userMessage)) {
      messages.push({ role: 'user', content: userMessage });
    }

    return messages.filter(item => item.role === 'assistant' || item.role === 'user');
  }

  private normalizeSupportMessage(raw: any): SupportChatMessage | null {
    const role = String(raw?.role || '').trim();
    const content = String(raw?.content || '').trim();
    if (!content || !['system', 'assistant', 'user'].includes(role)) {
      return null;
    }

    return {
      role: role as SupportChatMessage['role'],
      content,
    };
  }

  private extractReply(response: AiProviderExecutionResult<any>) {
    return String(response?.data?.choices?.[0]?.message?.content || '').trim();
  }

  private normalizeUsage(rawUsage: any): SupportChatUsage | undefined {
    if (!rawUsage || typeof rawUsage !== 'object') {
      return undefined;
    }

    return {
      promptTokens: this.toOptionalNumber(rawUsage.promptTokens ?? rawUsage.prompt_tokens),
      completionTokens: this.toOptionalNumber(rawUsage.completionTokens ?? rawUsage.completion_tokens),
      totalTokens: this.toOptionalNumber(rawUsage.totalTokens ?? rawUsage.total_tokens),
    };
  }

  private toOptionalNumber(value: any) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private extractTraceId(response: any) {
    const headers = response?.headers || {};
    return String(headers['x-request-id'] || headers['x-trace-id'] || headers['cf-ray'] || '').trim() || undefined;
  }

  private buildFallbackResponse(
    conversationId: string,
    turnCount: number,
    latestUserMessage: string
  ): SupportChatResponse {
    return {
      conversationId,
      reply: FALLBACK_REPLY,
      escalation: this.buildEscalation(turnCount, latestUserMessage),
      usage: null,
    };
  }

  private buildEscalation(turnCount: number, latestUserMessage: string) {
    const asksForHuman = /人工|客服|真人|联系|电话|微信/.test(latestUserMessage);
    const hasComplexIssue = /异常|争议|价格|报价|补贴|资料缺失|拖车|取车时间/.test(latestUserMessage);

    return {
      showInlineProfessionalContact: turnCount >= 1 || asksForHuman || hasComplexIssue,
      showLargeProfessionalContact: turnCount > 3 || asksForHuman || hasComplexIssue,
      reason: asksForHuman
        ? 'requested_professional_support'
        : hasComplexIssue
          ? 'complex_business_issue'
          : turnCount > 3
            ? 'turn_count_exceeded'
            : undefined,
    };
  }

  private getLatestUserMessage(messages: SupportChatMessage[]) {
    const latest = [...messages].reverse().find(item => item.role === 'user');
    return String(latest?.content || '').trim();
  }

  private resolveTurnCount(rawTurnCount: any, messages: SupportChatMessage[]) {
    const parsed = Number(rawTurnCount);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed);
    }

    return messages.filter(item => item.role === 'user').length;
  }

  private resolveConversationId(rawConversationId?: string) {
    const normalized = String(rawConversationId || '').trim();
    if (normalized) {
      return normalized;
    }

    return `support-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private resolveSafeOrderId(rawOrderId?: string) {
    const normalized = String(rawOrderId || '').trim();
    if (!normalized || !/^[A-Za-z0-9_-]{1,64}$/.test(normalized)) {
      return undefined;
    }

    return normalized;
  }

  private resolveModel() {
    const env = this.getRuntimeEnv();
    return (
      env.AI_SUPPORT_MODEL?.trim()
      || env.SUPPORT_AI_MODEL?.trim()
      || env.AI_PROVIDER_MODEL?.trim()
      || DEFAULT_SUPPORT_MODEL
    );
  }

  private resolveBaseUrl() {
    const env = this.getRuntimeEnv();
    const raw =
      env.AI_SUPPORT_BASE_URL?.trim()
      || env.SUPPORT_AI_BASE_URL?.trim()
      || env.AI_PROVIDER_BASE_URL?.trim()
      || env.OPENAI_BASE_URL?.trim()
      || env.OPENAI_API_BASE_URL?.trim()
      || '';

    return raw.replace(/\/+$/, '');
  }

  private resolveProvider() {
    const env = this.getRuntimeEnv();
    return env.AI_SUPPORT_PROVIDER?.trim() || 'siliconflow';
  }

  private resolvePrimaryKeys(): AiProviderExecutionKey[] {
    const env = this.getRuntimeEnv();
    return parseEnvKeys([
      env.AI_SUPPORT_API_KEYS || '',
      env.AI_SUPPORT_API_KEY || '',
      env.SUPPORT_AI_API_KEYS || '',
      env.SUPPORT_AI_API_KEY || '',
      env.AI_PROVIDER_API_KEYS || '',
      env.AI_PROVIDER_API_KEY || '',
    ]).map((key, index) => ({ key, label: `support-primary-${index + 1}` }));
  }

  private resolveFallbackKeys(): AiProviderExecutionKey[] {
    const env = this.getRuntimeEnv();
    return parseEnvKeys([
      env.AI_SUPPORT_FALLBACK_API_KEYS || '',
      env.AI_SUPPORT_FALLBACK_API_KEY || '',
      env.SUPPORT_AI_FALLBACK_API_KEYS || '',
      env.SUPPORT_AI_FALLBACK_API_KEY || '',
      env.AI_PROVIDER_FALLBACK_API_KEYS || '',
      env.AI_PROVIDER_FALLBACK_API_KEY || '',
    ]).map((key, index) => ({ key, level: 10, label: `support-fallback-${index + 1}` }));
  }

  private resolveLevel1Allowlist(model: string) {
    const env = this.getRuntimeEnv();
    const configured = parseEnvKeys([
      env.AI_SUPPORT_LEVEL1_ALLOWLIST || '',
      env.SUPPORT_AI_LEVEL1_ALLOWLIST || '',
      env.AI_PROVIDER_LEVEL1_ALLOWLIST || '',
    ]);

    return configured.length > 0 ? configured : [model];
  }

  private resolveTimeoutMs() {
    const env = this.getRuntimeEnv();
    const parsed = Number(env.AI_SUPPORT_TIMEOUT_MS || env.SUPPORT_AI_TIMEOUT_MS || 60000);
    return Number.isFinite(parsed) ? Math.max(1000, parsed) : 60000;
  }
}
