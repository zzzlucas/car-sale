import { describe, expect, it, vi } from "vitest";

import {
  SUPPORT_CHAT_CACHE_KEY,
  clearSupportChatCache,
  readSupportChatCache,
  writeSupportChatCache,
} from "./supportChatStorage";

function createStorage(initialValue?: string) {
  const store = new Map<string, string>();
  if (initialValue !== undefined) {
    store.set(SUPPORT_CHAT_CACHE_KEY, initialValue);
  }

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
  };
}

describe("support chat local cache", () => {
  it("writes and reads the latest conversation snapshot", () => {
    const storage = createStorage();

    writeSupportChatCache(
      {
        conversationId: "support-1",
        showLargeContactCta: true,
        messages: [
          { id: "a-welcome", role: "assistant", kind: "welcome", text: "您好" },
          { id: "u-1", role: "user", text: "报废流程" },
        ],
      },
      storage,
    );

    expect(storage.setItem).toHaveBeenCalledWith(SUPPORT_CHAT_CACHE_KEY, expect.any(String));
    expect(readSupportChatCache(storage)).toMatchObject({
      conversationId: "support-1",
      showLargeContactCta: true,
      messages: [
        { id: "a-welcome", role: "assistant", kind: "welcome", text: "您好" },
        { id: "u-1", role: "user", text: "报废流程" },
      ],
    });
  });

  it("clears the cached conversation when restarting", () => {
    const storage = createStorage("{}");

    clearSupportChatCache(storage);

    expect(storage.removeItem).toHaveBeenCalledWith(SUPPORT_CHAT_CACHE_KEY);
  });
});
