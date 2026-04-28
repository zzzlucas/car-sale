import type {
  SupportChatHistoryMessage,
  SupportChatResponse,
} from "@car/shared-types";

import { requestJson } from "../../../services/api";

export const SUPPORT_PRESET_QUESTIONS = [
  { id: "flow", label: "报废流程怎么走", question: "报废流程怎么走？" },
  { id: "materials", label: "需要准备哪些材料", question: "需要准备哪些材料？" },
  { id: "progress", label: "怎么查看预约进度", question: "怎么查看预约进度？" },
] as const;

export const PROFESSIONAL_SUPPORT_CONTACT = {
  phone: "400-800-8899",
  wechatId: "scrap-service-001",
  serviceHours: [
    "周一至周日 08:30 - 20:30",
    "节假日可先留言，客服会在营业时段优先回呼",
  ],
} as const;

const SUPPORT_FALLBACK_REPLY =
  "我先为您转成基础人工协助建议：当前智能答复暂时不可用，建议直接联系专业客服继续处理。";

export type SupportAssistantChatPayload = {
  conversationId?: string;
  userMessage: string;
  turnCount: number;
  orderId?: string;
  history: SupportChatHistoryMessage[];
};

export async function chatWithSupportAssistant(
  payload: SupportAssistantChatPayload,
): Promise<SupportChatResponse> {
  try {
    return await requestJson<SupportChatResponse>("/app/support/chat", {
      method: "POST",
      body: JSON.stringify({
        scene: "customer_support",
        conversationId: payload.conversationId,
        userMessage: payload.userMessage,
        turnCount: payload.turnCount,
        orderId: payload.orderId,
        history: payload.history,
      }),
    });
  } catch {
    return {
      conversationId: String(payload.conversationId || "").trim(),
      reply: SUPPORT_FALLBACK_REPLY,
      escalation: {
        showInlineProfessionalContact: shouldShowInlineProfessionalContact(payload.turnCount),
        showLargeProfessionalContact: shouldShowFullProfessionalContact(payload.turnCount),
      },
      usage: null,
    };
  }
}

export function shouldShowInlineProfessionalContact(answeredTurns: number) {
  return answeredTurns >= 1;
}

export function shouldShowFullProfessionalContact(answeredTurns: number) {
  return answeredTurns > 3;
}
