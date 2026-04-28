import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  SUPPORT_PRESET_QUESTIONS,
  chatWithSupportAssistant,
  shouldShowFullProfessionalContact,
  shouldShowInlineProfessionalContact,
} from "./supportChat";

vi.mock("../../../services/api", () => ({
  requestJson: vi.fn(),
}));

import { requestJson } from "../../../services/api";

const mockedRequestJson = vi.mocked(requestJson);

describe("supportChat backend integration", () => {
  beforeEach(() => {
    mockedRequestJson.mockReset();
  });

  it("provides exactly three preset quick questions for first-entry guidance", () => {
    expect(SUPPORT_PRESET_QUESTIONS).toHaveLength(3);
  });

  it("sends customer support questions to the backend support chat endpoint", async () => {
    mockedRequestJson.mockResolvedValueOnce({
      conversationId: "support-1",
      reply: "请先查看预约记录。",
      escalation: {
        showInlineProfessionalContact: true,
        showLargeProfessionalContact: false,
      },
      usage: null,
    });

    const result = await chatWithSupportAssistant({
      userMessage: "怎么查看预约进度？",
      turnCount: 1,
      history: [{ role: "user", content: "怎么查看预约进度？" }],
    });

    expect(mockedRequestJson).toHaveBeenCalledWith("/app/support/chat", {
      method: "POST",
      body: JSON.stringify({
        scene: "customer_support",
        conversationId: undefined,
        userMessage: "怎么查看预约进度？",
        turnCount: 1,
        orderId: undefined,
        history: [{ role: "user", content: "怎么查看预约进度？" }],
      }),
    });
    expect(result.reply).toBe("请先查看预约记录。");
  });

  it("returns a professional-support fallback when backend chat fails", async () => {
    mockedRequestJson.mockRejectedValueOnce(new Error("network"));

    const result = await chatWithSupportAssistant({
      userMessage: "价格有争议",
      turnCount: 4,
      history: [{ role: "user", content: "价格有争议" }],
    });

    expect(result.reply).toContain("当前智能答复暂时不可用");
    expect(result.escalation.showInlineProfessionalContact).toBe(true);
    expect(result.escalation.showLargeProfessionalContact).toBe(true);
  });

  it("shows the small professional-support handoff after the first answered turn", () => {
    expect(shouldShowInlineProfessionalContact(0)).toBe(false);
    expect(shouldShowInlineProfessionalContact(1)).toBe(true);
  });

  it("shows the large professional-support handoff only after more than three answered turns", () => {
    expect(shouldShowFullProfessionalContact(3)).toBe(false);
    expect(shouldShowFullProfessionalContact(4)).toBe(true);
  });
});
