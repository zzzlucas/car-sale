import { afterEach, describe, expect, it, vi } from "vitest";

import { requestJson } from "./api";

describe("api service base url", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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
});
