import { afterEach, describe, expect, it, vi } from "vitest";

import { requestJson, requestStream } from "./api";

describe("api service base url", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("uses a relative request path by default so vite proxy can forward backend calls", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ok: true } }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await requestJson("/app/ping");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/app/ping");
  });

  it("throws the backend business message when the response code is not success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 1001,
        message: "当前高德 Key 不支持后端 Web 服务调用",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(requestJson("/app/map/address-suggestions")).rejects.toThrow(
      "当前高德 Key 不支持后端 Web 服务调用",
    );
  });

  it("aborts json requests instead of leaving order APIs pending forever", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_path: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));

    vi.stubGlobal("fetch", fetchMock);

    const promise = expect(requestJson("/app/me/valuation-orders")).rejects.toThrow("Request timeout");
    await vi.advanceTimersByTimeAsync(15_000);

    await promise;
    expect(fetchMock).toHaveBeenCalledWith("/app/me/valuation-orders", expect.objectContaining({
      signal: expect.any(AbortSignal),
    }));
  });

  it("returns a readable stream response for backend event streams", async () => {
    const stream = new ReadableStream();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body: stream,
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await requestStream("/app/support/chat/stream", {
      method: "POST",
      body: "{}",
    });

    expect(fetchMock).toHaveBeenCalledWith("/app/support/chat/stream", expect.objectContaining({
      method: "POST",
      body: "{}",
      headers: { "Content-Type": "application/json" },
    }));
    expect(result).toBe(stream);
  });
});
