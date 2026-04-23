import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { uploadVehiclePhoto } from "./upload";

function createStorage() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

describe("uploadVehiclePhoto", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorage());
    localStorage.setItem("car.visitor.key", "visitor-upload");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("requests a COS upload ticket, uploads the file, and returns the object pointer", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            uploadUrl: "https://example-1250000000.cos.ap-shanghai.myqcloud.com/car-platform-dev/a.png?q-signature=test",
            method: "PUT",
            headers: {
              "Content-Type": "image/png",
            },
            objectPointer: "cos://car-platform-dev/orders/demo/car.png",
            expiresAt: "2026-04-23T12:00:00.000Z",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    vi.stubGlobal("fetch", fetchMock);

    const result = await uploadVehiclePhoto(
      new File(["image-binary"], "car.png", { type: "image/png" }),
    );

    expect(result).toBe("cos://car-platform-dev/orders/demo/car.png");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [ticketPath, ticketInit] = fetchMock.mock.calls[0];
    expect(ticketPath).toContain("/app/valuation-orders/photos/upload-ticket");
    expect(ticketInit?.method).toBe("POST");
    expect(ticketInit?.headers).toMatchObject({
      "X-Visitor-Key": "visitor-upload",
      "Content-Type": "application/json",
    });
    expect(String(ticketInit?.body)).toContain('"fileName":"car.png"');
    expect(String(ticketInit?.body)).toContain('"contentType":"image/png"');

    const [uploadUrl, uploadInit] = fetchMock.mock.calls[1];
    expect(uploadUrl).toContain("car-platform-dev/a.png");
    expect(uploadInit).toMatchObject({
      method: "PUT",
      headers: {
        "Content-Type": "image/png",
      },
    });
    expect(uploadInit?.body).toBeInstanceOf(File);
  });
});
