import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "CustomerSupportPage.vue"), "utf8");
const supportChatSource = fs.readFileSync(path.join(__dirname, "supportChat.ts"), "utf8");

describe("CustomerSupportPage ai support experience", () => {
  it("shows preset quick questions when the page first loads", () => {
    expect(source).toContain("showPresetQuestions");
    expect(source).toContain("SUPPORT_PRESET_QUESTIONS");
    expect(source).toContain("item.label");
    expect(supportChatSource).toContain("报废补贴怎么申领");
  });

  it("uses clear one-to-one support wording instead of vague professional or real-person copy", () => {
    expect(source).toContain("联系一对一客服");
    expect(source).toContain("showLargeContactCta");
    expect(source).toContain('to=\"/customer/support/contact\"');
    expect(source).not.toContain("联系专业客服");
    expect(source).not.toContain("真人客服");
  });

  it("uses the backend support assistant instead of local keyword replies", () => {
    expect(source).toContain("streamSupportAssistantChat");
    expect(source).toContain("upsertStreamingAssistantMessage");
    expect(source).not.toContain("buildAssistantReply");
    expect(source).toContain("isSending");
  });

  it("shows a clear one-to-one support handoff when daily AI quota is exhausted", () => {
    expect(supportChatSource).toContain("SUPPORT_DAILY_LIMIT");
    expect(supportChatSource).toContain("30");
    expect(supportChatSource).toContain("今天的 AI 咨询次数已用完");
    expect(supportChatSource).toContain("daily_ai_limit_exceeded");
  });

  it("shows first-token loading, typewriter state, and markdown-rendered assistant text", () => {
    expect(source).toContain("isPending");
    expect(source).toContain("typing-indicator");
    expect(source).toContain("queueStreamingAssistantText");
    expect(source).toContain("waitForTypewriterIdle");
    expect(source).toContain("renderSupportMarkdown");
    expect(source).toContain("v-html");
  });

  it("persists chat history locally and provides a restart conversation action", () => {
    expect(source).toContain("readSupportChatCache");
    expect(source).toContain("writeSupportChatCache");
    expect(source).toContain("clearSupportChatCache");
    expect(source).toContain("restartConversation");
    expect(source).toContain("重新开始");
  });

  it("uses a fixed chat shell with a browser-managed keyboard-safe footer", () => {
    expect(source).toContain("support-chat-shell");
    expect(source).toContain("fixed inset-x-0 top-0");
    expect(source).toContain("support-chat-body");
    expect(source).toContain("support-chat-composer");
    expect(source).toContain("min-h-0");
    expect(source).toContain("lockSupportChatPageScroll");
    expect(source).toContain("document.body.style.overflow");
  });

  it("does not apply a second keyboard viewport compensation in social webviews", () => {
    expect(source).not.toContain("visualViewport");
    expect(source).not.toContain("--support-chat-viewport-height");
    expect(source).not.toContain("--support-chat-viewport-offset-top");
    expect(source).toContain("bottom: 0");
  });

  it("styles restart conversation as a real button", () => {
    expect(source).toContain("重新开始");
    expect(source).toContain("restart-button");
    expect(source).toContain("rounded-full border");
  });
});
