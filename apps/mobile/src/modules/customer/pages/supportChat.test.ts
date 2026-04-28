import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  SUPPORT_PRESET_QUESTIONS,
  chatWithSupportAssistant,
  streamSupportAssistantChat,
  shouldShowFullProfessionalContact,
  shouldShowInlineProfessionalContact,
} from "./supportChat";

vi.mock("../../../services/api", () => ({
  requestJson: vi.fn(),
  requestStream: vi.fn(),
}));

import { requestJson, requestStream } from "../../../services/api";

const mockedRequestJson = vi.mocked(requestJson);
const mockedRequestStream = vi.mocked(requestStream);

function createSseStream(events: string[]) {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      }
      controller.close();
    },
  });
}

describe("supportChat backend integration", () => {
  beforeEach(() => {
    mockedRequestJson.mockReset();
    mockedRequestStream.mockReset();
  });

  it("provides four preset quick questions including subsidy guidance", () => {
    expect(SUPPORT_PRESET_QUESTIONS).toHaveLength(4);
    expect(SUPPORT_PRESET_QUESTIONS.map(item => item.question)).toContain("报废补贴怎么申领？");
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

  it("streams assistant deltas from the backend support chat stream endpoint", async () => {
    mockedRequestStream.mockResolvedValueOnce(
      createSseStream([
        JSON.stringify({ type: "meta", conversationId: "support-stream-1" }),
        JSON.stringify({ type: "delta", content: "请先" }),
        JSON.stringify({ type: "delta", content: "提交车辆信息" }),
        JSON.stringify({
          type: "done",
          response: {
            conversationId: "support-stream-1",
            reply: "请先提交车辆信息",
            escalation: {
              showInlineProfessionalContact: true,
              showLargeProfessionalContact: false,
            },
            usage: null,
          },
        }),
      ]),
    );
    const deltas: string[] = [];

    const result = await streamSupportAssistantChat(
      {
        userMessage: "报废流程怎么走？",
        turnCount: 1,
        history: [{ role: "user", content: "报废流程怎么走？" }],
      },
      {
        onDelta: content => deltas.push(content),
      },
    );

    expect(mockedRequestStream).toHaveBeenCalledWith("/app/support/chat/stream", {
      method: "POST",
      body: JSON.stringify({
        scene: "customer_support",
        conversationId: undefined,
        userMessage: "报废流程怎么走？",
        turnCount: 1,
        orderId: undefined,
        history: [{ role: "user", content: "报废流程怎么走？" }],
      }),
    });
    expect(deltas).toEqual(["请先", "提交车辆信息"]);
    expect(result.reply).toBe("请先提交车辆信息");
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
