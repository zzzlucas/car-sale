export type SupportChatMessageRole = "system" | "assistant" | "user";
export type SupportChatHistoryRole = "assistant" | "user";

export interface SupportChatMessage {
  role: SupportChatMessageRole;
  content: string;
}

export interface SupportChatHistoryMessage {
  role: SupportChatHistoryRole;
  content: string;
}

export interface SupportChatRequest {
  scene?: "customer_support";
  userMessage?: string;
  conversationId?: string;
  turnCount?: number;
  orderId?: string;
  history?: SupportChatHistoryMessage[];
  messages?: SupportChatMessage[];
}

export interface SupportChatEscalation {
  showInlineProfessionalContact: boolean;
  showLargeProfessionalContact: boolean;
  reason?: string;
}

export interface SupportChatUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface SupportChatResponse {
  conversationId: string;
  reply: string;
  traceId?: string;
  model?: string;
  escalation: SupportChatEscalation;
  usage: SupportChatUsage | null;
}
