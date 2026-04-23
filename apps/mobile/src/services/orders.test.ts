import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getMyOrders, submitValuationOrder } from "./orders";

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

describe("orders service", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createStorage());
    localStorage.setItem("car.visitor.key", "visitor-test");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("forwards the visitor header when submitting a valuation order", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: "12",
          orderNo: "VR-0012-H5",
          currentStatus: "submitted",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await submitValuationOrder({
      vehicleType: "car",
      brandModel: "丰田 凯美瑞",
      plateNumber: "粤A12345",
      plateRetention: true,
      wheelMaterial: "aluminum",
      weightTons: 1.55,
      contactName: "张三",
      contactPhone: "13800138000",
      pickupAddress: "深圳南山",
      pickupLatitude: 22.54,
      pickupLongitude: 113.93,
      vehiclePhotos: ["cos://car-platform-dev/visitors/visitor-test/valuation-orders/2026/04/car.jpg"],
    } as any);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.headers).toMatchObject({
      "X-Visitor-Key": "visitor-test",
    });
    expect(String(init?.body)).toContain('"pickupAddress":"深圳南山"');
  });

  it("does not silently fallback to sample orders when the backend fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await expect(getMyOrders()).rejects.toThrow("Request failed: 500");
  });
});
