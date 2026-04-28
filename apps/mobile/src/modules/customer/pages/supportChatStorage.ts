export const SUPPORT_CHAT_CACHE_KEY = "car:customer-support-chat:v1";

export type SupportChatCacheMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  kind?: "welcome" | "answer";
  showInlineProfessionalContact?: boolean;
};

export type SupportChatCache = {
  conversationId: string | null;
  messages: SupportChatCacheMessage[];
  showLargeContactCta: boolean;
  savedAt: number;
};

type ChatStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getDefaultStorage(): ChatStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function normalizeCache(value: unknown): SupportChatCache | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const cache = value as Partial<SupportChatCache>;
  if (!Array.isArray(cache.messages) || cache.messages.length === 0) {
    return null;
  }

  const messages = cache.messages
    .map(message => ({
      id: String(message?.id || "").trim(),
      role: message?.role === "user" ? "user" : "assistant",
      text: String(message?.text || ""),
      kind: message?.kind === "answer" ? "answer" : message?.kind === "welcome" ? "welcome" : undefined,
      showInlineProfessionalContact: Boolean(message?.showInlineProfessionalContact),
    }))
    .filter(message => message.id && message.text.trim());

  if (messages.length === 0) {
    return null;
  }

  return {
    conversationId: String(cache.conversationId || "").trim() || null,
    messages,
    showLargeContactCta: Boolean(cache.showLargeContactCta),
    savedAt: Number.isFinite(cache.savedAt) ? Number(cache.savedAt) : Date.now(),
  };
}

export function readSupportChatCache(storage: ChatStorage | null = getDefaultStorage()) {
  if (!storage) {
    return null;
  }

  try {
    return normalizeCache(JSON.parse(storage.getItem(SUPPORT_CHAT_CACHE_KEY) || "null"));
  } catch {
    return null;
  }
}

export function writeSupportChatCache(cache: Omit<SupportChatCache, "savedAt">, storage: ChatStorage | null = getDefaultStorage()) {
  if (!storage) {
    return;
  }

  storage.setItem(
    SUPPORT_CHAT_CACHE_KEY,
    JSON.stringify({
      ...cache,
      savedAt: Date.now(),
    }),
  );
}

export function clearSupportChatCache(storage: ChatStorage | null = getDefaultStorage()) {
  storage?.removeItem(SUPPORT_CHAT_CACHE_KEY);
}
