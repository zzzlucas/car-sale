import { afterEach, describe, expect, it, vi } from "vitest";

import { reverseGeocodeLocation, searchAddressSuggestions } from "./map";

describe("map service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("skips backend lookup when the keyword is too short", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchAddressSuggestions("a")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls the backend address suggestion endpoint and returns results", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "B001",
            name: "科技园",
            formattedAddress: "广东省 深圳市 南山区 科技南十二路 科技园",
            latitude: 22.5401,
            longitude: 113.9501,
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await searchAddressSuggestions("科技园");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/app/map/address-suggestions?keywords=%E7%A7%91%E6%8A%80%E5%9B%AD",
    );
    expect(result[0]).toMatchObject({
      name: "科技园",
      longitude: 113.9501,
    });
  });

  it("calls the backend reverse geocode endpoint for current location", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          formattedAddress: "广东省广州市天河区天园街道天河公园",
          latitude: 23.128003,
          longitude: 113.366739,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await reverseGeocodeLocation(113.366739, 23.128003);

    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/app/map/regeo?longitude=113.366739&latitude=23.128003",
    );
    expect(result?.formattedAddress).toContain("天河公园");
  });
});
