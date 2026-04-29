import { afterEach, describe, expect, it, vi } from "vitest";

import {
  bindCarAnalyticsToRouter,
  CAR_ANALYTICS_EVENTS,
  initCarAnalytics,
  trackCarEvent,
} from "./analytics";

function createMemoryStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("car mobile analytics", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps local development silent unless explicitly enabled", async () => {
    const fetchImpl = vi.fn();

    const sent = await trackCarEvent(CAR_ANALYTICS_EVENTS.pageView, {}, {
      env: {},
      fetchImpl,
      location: { hostname: "localhost", pathname: "/customer", search: "" },
      storage: createMemoryStorage(),
    });

    expect(sent).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("sends namespaced events to the configured collector", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    const sent = await trackCarEvent(CAR_ANALYTICS_EVENTS.pageView, { title: "首页" }, {
      env: {
        VITE_CAR_ANALYTICS_ENABLE_LOCAL: "true",
        VITE_CAR_ANALYTICS_ORIGIN: "https://analytics.example.com/",
        MODE: "test",
      },
      fetchImpl,
      location: { hostname: "localhost", pathname: "/customer/progress/abc123", search: "?utm_source=demo&orderId=abc123" },
      now: () => 1_700_000_000_000,
      randomId: () => "device-1",
      storage: createMemoryStorage(),
    });

    expect(sent).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith("https://analytics.example.com/collect", expect.objectContaining({
      method: "POST",
      keepalive: true,
      headers: expect.objectContaining({
        "Content-Type": "application/json",
        "X-Device-Id": "car-device-1",
        "X-Timestamp": "1700000000000",
        "X-Signature": expect.any(String),
      }),
      body: JSON.stringify({
        app: "car-mobile",
        env: "test",
        project: "car",
        query: { utm_source: "demo" },
        route: "/customer/progress/:orderId",
        site: "localhost",
        t: CAR_ANALYTICS_EVENTS.pageView,
        s: "/customer/progress/abc123?utm_source=demo&orderId=abc123",
        p: {
          app: "car-mobile",
          env: "test",
          project: "car",
          route: "/customer/progress/:orderId",
          site: "localhost",
          title: "首页",
        },
      }),
    }));
  });

  it("marks first visits and records one page-stay event", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const listeners = new Map<string, () => void>();
    const documentRef = {
      title: "报废车预约平台",
      visibilityState: "visible",
      addEventListener: vi.fn((event: string, listener: () => void) => listeners.set(event, listener)),
    };
    const windowRef = {
      addEventListener: vi.fn((event: string, listener: () => void) => listeners.set(event, listener)),
    };

    await initCarAnalytics({
      documentRef,
      env: { VITE_CAR_ANALYTICS_ENABLE_LOCAL: "true" },
      fetchImpl,
      location: { hostname: "localhost", pathname: "/customer", search: "" },
      now: () => 1_700_000_000_000,
      randomId: () => "device-1",
      sessionStartedAt: 1_699_999_990_000,
      storage: createMemoryStorage(),
      windowRef,
    });

    listeners.get("pagehide")?.();
    listeners.get("beforeunload")?.();

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({
      t: CAR_ANALYTICS_EVENTS.pageView,
      p: { app: "car-mobile", firstVisit: true, project: "car" },
    });
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toMatchObject({
      t: CAR_ANALYTICS_EVENTS.pageStay,
      p: { app: "car-mobile", reason: "pagehide", project: "car" },
    });
  });

  it("tracks route changes after the initial router navigation", () => {
    const trackEvent = vi.fn();
    let afterEachCallback: ((to: { fullPath?: string; path: string; meta?: { title?: string } }) => void) | null = null;
    const router = {
      afterEach: vi.fn((callback) => {
        afterEachCallback = callback;
      }),
    };

    bindCarAnalyticsToRouter(router, { trackEvent });
    afterEachCallback?.({ fullPath: "/customer", path: "/customer", meta: { title: "首页" } });
    afterEachCallback?.({ fullPath: "/customer/guide", path: "/customer/guide", meta: { title: "报废流程指南" } });

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(CAR_ANALYTICS_EVENTS.pageView, {
      title: "报废流程指南",
    }, expect.objectContaining({ source: "/customer/guide" }));
  });

  it("keeps campaign query separately from the normalized route", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await trackCarEvent(CAR_ANALYTICS_EVENTS.pageView, {}, {
      env: { VITE_CAR_ANALYTICS_ENABLE_LOCAL: "true" },
      fetchImpl,
      location: { hostname: "localhost", pathname: "/customer/valuation", search: "?utm_campaign=spring&token=secret" },
      randomId: () => "device-1",
      storage: createMemoryStorage(),
    });

    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);

    expect(body.route).toBe("/customer/valuation");
    expect(body.query).toEqual({ utm_campaign: "spring" });
    expect(body.p).toMatchObject({ route: "/customer/valuation" });
  });
});
