import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "CustomerSupportPage.vue"), "utf8");

describe("CustomerSupportPage ai support experience", () => {
  it("shows three preset quick questions when the page first loads", () => {
    expect(source).toContain("showPresetQuestions");
    expect(source).toContain("SUPPORT_PRESET_QUESTIONS");
    expect(source).toContain("item.label");
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

  it("shows first-token loading, typewriter state, and markdown-rendered assistant text", () => {
    expect(source).toContain("isPending");
    expect(source).toContain("typing-indicator");
    expect(source).toContain("queueStreamingAssistantText");
    expect(source).toContain("waitForTypewriterIdle");
    expect(source).toContain("renderSupportMarkdown");
    expect(source).toContain("v-html");
  });
});
