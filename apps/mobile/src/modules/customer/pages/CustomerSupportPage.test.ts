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

  it("includes both the inline and full contact-professional-support escalations", () => {
    expect(source).toContain("联系专业客服");
    expect(source).toContain("showLargeContactCta");
    expect(source).toContain('to=\"/customer/support/contact\"');
  });

  it("uses the backend support assistant instead of local keyword replies", () => {
    expect(source).toContain("chatWithSupportAssistant");
    expect(source).not.toContain("buildAssistantReply");
    expect(source).toContain("isSending");
  });
});
