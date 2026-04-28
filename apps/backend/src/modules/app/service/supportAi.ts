import { BaseService } from '@cool-midway/core';
import { Inject, Provide } from '@midwayjs/core';
import axios from 'axios';
import { PassThrough } from 'stream';
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
  '我先为您转成基础一对一协助建议：当前智能答复暂时不可用，建议直接联系一对一客服继续处理。';
const DAILY_LIMIT_REPLY = '今天的 AI 咨询次数已用完，可联系一对一客服继续处理。';
const DEFAULT_DAILY_LIMIT = 30;
const dailyUsageMemory = new Map<string, number>();
const PROJECT_SUPPORT_CONTEXT = `
项目内预约进度查询口径：
- 客户提交车辆估价与预约后，移动端会跳转到 /customer/progress/:orderId 展示该订单进度；后续也可以从“我的/预约记录”进入 /customer/records，再点击对应订单“查看详情”。
- 进度页读取 backend 的 GET /app/valuation-orders/:id/progress，展示订单编号、当前进度、进度追踪时间线、预约信息、车辆信息和车辆照片。
- 进度状态必须以 backend 返回的 scrap_order.currentStatus 和 order_timeline 为准，不要自己推断或编造状态。
- 当前统一状态包括：submitted 已提交、contacted 联系中、quoted 估价完成、scheduled_pickup 已安排上门/拖车、picked_up 已拖车进场、dismantling 拆解处理中、deregistration_processing 注销办理中、completed 已完成、cancelled 已取消。
- 如果用户只有手机号或订单号但没有页面上下文，先建议去“我的-预约记录”查看；如果仍找不到记录，再引导联系一对一客服核实。

车辆报废更新补贴回答口径（按商务部等 8 部门《2026 年汽车以旧换新补贴实施细则》和问答手册整理）：
- 这是“汽车以旧换新”里的汽车报废更新补贴，面向个人消费者；具体受理节奏和地方细则以用户所在地商务等主管部门最新通知为准。
- 旧车条件：报废 2013年6月30日（含当日）前注册登记的汽油乘用车、2015年6月30日（含当日）前注册登记的柴油及其他燃料乘用车，或 2019年12月31日（含当日）前注册登记的新能源乘用车；旧车应在 2025年1月8日前登记在申请人名下。
- 新车条件：购买纳入工信部《减免车辆购置税的新能源汽车车型目录》的新能源乘用车，或 2.0 升及以下排量燃油乘用车；报废旧车所有人和新购置乘用车所有人应为同一个人消费者。
- 补贴标准：报废符合条件旧车并购买新能源乘用车，按新车销售价格 12% 补贴，最高 2 万元；报废符合条件燃油乘用车并购买 2.0 升及以下燃油乘用车，按新车销售价格 10% 补贴，最高 1.5 万元；报废新能源乘用车后购买燃油乘用车不予补贴。
- 材料时间：申请材料中的《报废机动车回收证明》《机动车注销证明》《机动车销售统一发票》《机动车登记证书》均应自 2026年1月1日起取得；新车发票和登记证书原则上应在同一省级地区开具或办理。
- 申领入口：手机端通过微信、支付宝、抖音、云闪付搜索“汽车以旧换新”小程序；电脑端登录全国汽车流通信息管理系统网站 https://qclt.mofcom.gov.cn 进入“汽车以旧换新”专题/汽车报废更新补贴申请入口。
- 常见材料：申请人身份信息、本人 I 类借记卡银行账户、旧车《报废机动车回收证明》和《机动车注销证明》、新车《机动车销售统一发票》和《机动车登记证书》第 1、2 页原件照片或扫描件。
- 回答时应提醒用户先核对所在地申报入口、材料时限、车辆条件和剩余额度；不要承诺一定能领、能领多少钱或审核必过。
`.trim();

type SupportChatStreamEvent =
  | {
      type: 'meta';
      conversationId: string;
      traceId?: string;
      model?: string;
    }
  | {
      type: 'delta';
      content: string;
    }
  | {
      type: 'done';
      response: SupportChatResponse;
    }
  | {
      type: 'error';
      message: string;
      response?: SupportChatResponse;
    };

@Provide()
export class AppSupportAiService extends BaseService {
  env: NodeJS.ProcessEnv = process.env;

  @Inject()
  ctx: any;

  streamChat(payload: SupportChatRequest): NodeJS.ReadableStream {
    const stream = new PassThrough();

    void this.writeStreamChat(payload, stream);

    return stream;
  }

  async chat(payload: SupportChatRequest): Promise<SupportChatResponse> {
    const conversationId = this.resolveConversationId(payload?.conversationId);
    const messages = this.resolveIncomingMessages(payload);
    const turnCount = this.resolveTurnCount(payload?.turnCount, messages);
    const latestUserMessage = this.getLatestUserMessage(messages);

    if (!this.consumeDailyQuota()) {
      return this.buildDailyLimitResponse(conversationId);
    }

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

  protected async executeRuntimeChatStream(params: {
    scene: string;
    messages: SupportChatMessage[];
    orderId?: string;
  }): Promise<AiProviderExecutionResult<NodeJS.ReadableStream>> {
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
            stream: true,
          },
          {
            headers: {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            responseType: 'stream',
            timeout: timeoutMs,
          }
        );

        return {
          data: response.data as NodeJS.ReadableStream,
          meta: {
            ...meta,
            provider: this.resolveProvider(),
            traceId: this.extractTraceId(response),
          },
        };
      },
    });
  }

  private async writeStreamChat(payload: SupportChatRequest, stream: PassThrough) {
    const conversationId = this.resolveConversationId(payload?.conversationId);
    const messages = this.resolveIncomingMessages(payload);
    const turnCount = this.resolveTurnCount(payload?.turnCount, messages);
    const latestUserMessage = this.getLatestUserMessage(messages);
    let reply = '';
    let usage: SupportChatUsage | null = null;

    if (!this.consumeDailyQuota()) {
      this.writeSseEvent(stream, { type: 'done', response: this.buildDailyLimitResponse(conversationId) });
      stream.end();
      return;
    }

    try {
      const aiResponse = await this.executeRuntimeChatStream({
        scene: payload?.scene || SUPPORT_SCENE,
        messages,
        orderId: payload?.orderId,
      });

      this.writeSseEvent(stream, {
        type: 'meta',
        conversationId,
        traceId: aiResponse.meta?.traceId,
        model: aiResponse.meta?.model,
      });

      usage = await this.consumeProviderStream(aiResponse.data, content => {
        reply += content;
        this.writeSseEvent(stream, { type: 'delta', content });
      });

      const response: SupportChatResponse = reply.trim()
        ? {
            conversationId,
            reply,
            traceId: aiResponse.meta?.traceId,
            model: aiResponse.meta?.model,
            escalation: this.buildEscalation(turnCount, latestUserMessage),
            usage,
          }
        : this.buildFallbackResponse(conversationId, turnCount, latestUserMessage);

      this.writeSseEvent(stream, { type: 'done', response });
    } catch {
      this.writeSseEvent(stream, {
        type: 'error',
        message: '当前智能答复暂时不可用',
        response: this.buildFallbackResponse(conversationId, turnCount, latestUserMessage),
      });
    } finally {
      stream.end();
    }
  }

  private async consumeProviderStream(
    providerStream: NodeJS.ReadableStream,
    onDelta: (content: string) => void
  ): Promise<SupportChatUsage | null> {
    let buffer = '';
    let usage: SupportChatUsage | null = null;

    const processLine = (line: string) => {
      const normalized = line.trim();
      if (!normalized.startsWith('data:')) {
        return;
      }

      const raw = normalized.slice(5).trim();
      if (!raw || raw === '[DONE]') {
        return;
      }

      try {
        const payload = JSON.parse(raw);
        const content = payload?.choices?.[0]?.delta?.content ?? payload?.choices?.[0]?.message?.content;
        if (typeof content === 'string' && content.length > 0) {
          onDelta(content);
        }

        const normalizedUsage = this.normalizeUsage(payload?.usage);
        if (normalizedUsage) {
          usage = normalizedUsage;
        }
      } catch {
        return;
      }
    };

    for await (const chunk of providerStream as AsyncIterable<Buffer | string>) {
      buffer += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      for (const line of lines) {
        processLine(line);
      }
    }

    if (buffer.trim()) {
      processLine(buffer);
    }

    return usage;
  }

  private writeSseEvent(stream: PassThrough, event: SupportChatStreamEvent) {
    stream.write(`data: ${JSON.stringify(event)}\n\n`);
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
        content: `你是车辆回收平台的${scene}助手。回答尽量简洁、口语化，优先帮助用户理解流程、材料、进度与预约相关问题；如果问题需要人工继续处理，请直接建议联系一对一客服。不要承诺最终报价、政策结论、补贴金额或办理结果。\n\n${PROJECT_SUPPORT_CONTEXT}`,
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

  private buildDailyLimitResponse(conversationId: string): SupportChatResponse {
    return {
      conversationId,
      reply: DAILY_LIMIT_REPLY,
      escalation: {
        showInlineProfessionalContact: true,
        showLargeProfessionalContact: true,
        reason: 'daily_ai_limit_exceeded',
      },
      usage: null,
    };
  }

  private consumeDailyQuota() {
    const limit = this.resolveDailyLimit();
    if (limit <= 0) {
      return false;
    }

    const visitorKey = this.resolveVisitorKey();
    const usageKey = `${this.resolveToday()}::${visitorKey}`;
    const current = dailyUsageMemory.get(usageKey) || 0;
    if (current >= limit) {
      return false;
    }

    dailyUsageMemory.set(usageKey, current + 1);
    return true;
  }

  private resolveVisitorKey() {
    return String(this.ctx?.get?.('x-visitor-key') || '').trim().slice(0, 64) || 'anonymous';
  }

  private resolveToday() {
    return new Date().toISOString().slice(0, 10);
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

  private resolveDailyLimit() {
    const env = this.getRuntimeEnv();
    const parsed = Number(env.AI_SUPPORT_DAILY_LIMIT || env.SUPPORT_AI_DAILY_LIMIT || DEFAULT_DAILY_LIMIT);
    return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : DEFAULT_DAILY_LIMIT;
  }
}
