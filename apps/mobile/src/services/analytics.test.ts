import { afterEach, describe, expect, it, vi } from "vitest";

import {
  bindCarAnalyticsToRouter,
  CAR_ANALYTICS_EVENTS,
  initCarAnalytics,
  trackCarCtaClick,
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
      body: expect.any(String),
    }));
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({
      app: "car-mobile",
      env: "test",
      project: "car",
      query: { utm_source: "demo" },
      route: "/customer/progress/:orderId",
      site: "localhost",
      t: CAR_ANALYTICS_EVENTS.pageView,
      s: "/customer/progress/:orderId?utm_source=demo",
      p: {
        app: "car-mobile",
        env: "test",
        project: "car",
        route: "/customer/progress/:orderId",
        site: "localhost",
        title: "首页",
      },
    });
  });

  it("marks first visits and records one page-stay event", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const listeners = new Map<string, Array<() => void>>();
    const addListener = (event: string, listener: () => void) => {
      listeners.set(event, [...(listeners.get(event) ?? []), listener]);
    };
    const documentRef = {
      referrer: "https://wechat.example.com/share?id=secret",
      title: "报废车预约平台",
      visibilityState: "visible",
      addEventListener: vi.fn(addListener),
    };
    const windowRef = {
      addEventListener: vi.fn(addListener),
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

    listeners.get("pagehide")?.forEach(listener => listener());
    listeners.get("beforeunload")?.forEach(listener => listener());

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({
      t: CAR_ANALYTICS_EVENTS.pageView,
      p: {
        app: "car-mobile",
        entryAt: 1_700_000_000_000,
        entryRoute: "/customer",
        firstVisit: true,
        project: "car",
        referrerHost: "wechat.example.com",
        sessionId: "car-session-device-1",
        visibilityState: "visible",
      },
    });
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toMatchObject({
      t: CAR_ANALYTICS_EVENTS.pageStay,
      p: {
        app: "car-mobile",
        durationBasis: "foreground_visible",
        durationMs: 10_000,
        durationSeconds: 10,
        isFinalLikely: true,
        project: "car",
        reason: "pagehide",
        stayEndReason: "pagehide",
        visibleDurationMs: 10_000,
        visibleDurationSeconds: 10,
      },
    });
  });

  it("records engagement signals and quick exits", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const listeners = new Map<string, Array<() => void>>();
    const addListener = (event: string, listener: () => void) => {
      listeners.set(event, [...(listeners.get(event) ?? []), listener]);
    };

    await initCarAnalytics({
      documentRef: {
        title: "报废车预约平台",
        visibilityState: "visible",
        addEventListener: vi.fn(),
      },
      env: { VITE_CAR_ANALYTICS_ENABLE_LOCAL: "true" },
      fetchImpl,
      location: { hostname: "localhost", pathname: "/customer", search: "" },
      now: () => 1_700_000_000_000,
      randomId: () => "device-1",
      sessionStartedAt: 1_699_999_999_000,
      storage: createMemoryStorage(),
      windowRef: { addEventListener: vi.fn(addListener) },
    });

    listeners.get("click")?.forEach(listener => listener());
    listeners.get("pagehide")?.forEach(listener => listener());

    expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toMatchObject({
      t: CAR_ANALYTICS_EVENTS.firstInteraction,
      p: {
        engagement: { interactionCount: 1, maxScrollDepth: 0 },
        intentSignal: "first_interaction",
        interactionType: "click",
      },
    });
    expect(fetchImpl.mock.calls.map(call => JSON.parse(call[1].body).t)).not.toContain(CAR_ANALYTICS_EVENTS.quickExit);
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

  it("tracks CTA clicks with intent semantics", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await trackCarCtaClick("home_hero_valuation", {
      ctaGroup: "home",
      targetRoute: "/customer/valuation",
    }, {
      env: { VITE_CAR_ANALYTICS_ENABLE_LOCAL: "true" },
      fetchImpl,
      location: { hostname: "localhost", pathname: "/customer", search: "" },
      randomId: () => "device-1",
      storage: createMemoryStorage(),
    });
    await trackCarCtaClick("home_header_support", {}, {
      env: { VITE_CAR_ANALYTICS_ENABLE_LOCAL: "true" },
      fetchImpl,
      location: { hostname: "localhost", pathname: "/customer", search: "" },
      randomId: () => "device-2",
      storage: createMemoryStorage(),
    });

    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({
      t: CAR_ANALYTICS_EVENTS.ctaClick,
      p: {
        cta: "home_hero_valuation",
        ctaGroup: "home",
        intentSignal: "cta_click",
        targetRoute: "/customer/valuation",
      },
    });
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toMatchObject({
      t: CAR_ANALYTICS_EVENTS.supportChatOpen,
      p: {
        cta: "home_header_support",
        intentSignal: "cta_click",
      },
    });
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
    expect(body.s).toBe("/customer/valuation?utm_campaign=spring");
    expect(body.p).toMatchObject({ route: "/customer/valuation" });
  });

  it("sanitizes explicit route sources before sending", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await trackCarEvent(CAR_ANALYTICS_EVENTS.pageView, {}, {
      env: { VITE_CAR_ANALYTICS_ENABLE_LOCAL: "true" },
      fetchImpl,
      location: { hostname: "localhost", pathname: "/customer", search: "" },
      randomId: () => "device-1",
      source: "/customer/records?shareId=demo_1&token=secret&orderId=abc123&utm_medium=wechat",
      storage: createMemoryStorage(),
    });

    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);

    expect(body.s).toBe("/customer/records?utm_medium=wechat&shareId=demo_1");
  });

  it("captures demo share attribution and lightweight client profile", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await trackCarEvent(CAR_ANALYTICS_EVENTS.pageView, {}, {
      env: { VITE_CAR_ANALYTICS_ENABLE_LOCAL: "true" },
      fetchImpl,
      location: {
        hostname: "localhost",
        pathname: "/customer",
        search: "?shareId=demo_zhangzong_0430&demo=car-preprod&client=zhang&token=secret",
      },
      navigatorRef: {
        language: "zh-CN",
        maxTouchPoints: 5,
        platform: "iPhone",
      },
      randomId: () => "device-1",
      screenRef: {
        height: 844,
        width: 390,
      },
      storage: createMemoryStorage(),
      timezone: () => "Asia/Shanghai",
      windowRef: {
        devicePixelRatio: 3,
      },
    });

    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);

    expect(body.query).toEqual({
      client: "zhang",
      demo: "car-preprod",
      shareId: "demo_zhangzong_0430",
    });
    expect(body.p).toMatchObject({
      client: {
        devicePixelRatio: 3,
        language: "zh-CN",
        maxTouchPoints: 5,
        platform: "iPhone",
        screenHeight: 844,
        screenWidth: 390,
        timezone: "Asia/Shanghai",
      },
      query: {
        client: "zhang",
        demo: "car-preprod",
        shareId: "demo_zhangzong_0430",
      },
    });
  });

  it("keeps demo attribution for later events after the shared link entry", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const storage = createMemoryStorage();

    await trackCarEvent(CAR_ANALYTICS_EVENTS.pageView, {}, {
      env: { VITE_CAR_ANALYTICS_ENABLE_LOCAL: "true" },
      fetchImpl,
      location: {
        hostname: "localhost",
        pathname: "/customer",
        search: "?shareId=demo_zhangzong_0430&client=zhang",
      },
      randomId: () => "device-1",
      storage,
    });
    await trackCarEvent(CAR_ANALYTICS_EVENTS.pageStay, { reason: "pagehide" }, {
      env: { VITE_CAR_ANALYTICS_ENABLE_LOCAL: "true" },
      fetchImpl,
      location: { hostname: "localhost", pathname: "/customer/progress/order-1", search: "" },
      randomId: () => "device-2",
      storage,
    });

    const laterBody = JSON.parse(fetchImpl.mock.calls[1][1].body);

    expect(laterBody.query).toMatchObject({
      client: "zhang",
      shareId: "demo_zhangzong_0430",
    });
    expect(laterBody.p.query).toMatchObject({
      client: "zhang",
      shareId: "demo_zhangzong_0430",
    });
  });
});
