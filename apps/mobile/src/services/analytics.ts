const DEVICE_ID_STORAGE_KEY = "car_mobile_device_id";
const DEVICE_FIRST_SEEN_STORAGE_KEY = "car_mobile_device_first_seen";
const DEVICE_ATTRIBUTION_STORAGE_KEY = "car_mobile_visitor_attribution";
const DEVICE_ID_PREFIX = "car-";
const ANALYTICS_APP = "car-mobile";
const ANALYTICS_PROJECT = "car";
const DEFAULT_ANALYTICS_ORIGIN = "https://find.lucasishere.top";
const CAMPAIGN_QUERY_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "channel",
  "shareId",
  "share_id",
  "demo",
  "demoId",
  "client",
  "clientId",
]);
const VISITOR_ATTRIBUTION_QUERY_KEYS = new Set(["shareId", "share_id", "demo", "demoId", "client", "clientId"]);

type AnalyticsEnv = Partial<Record<string, string | boolean | undefined>>;

type AnalyticsLocation = Pick<Location, "hostname" | "pathname" | "search">;

type AnalyticsStorage = Pick<Storage, "getItem" | "setItem">;

type AnalyticsDocument = Pick<Document, "title" | "visibilityState" | "addEventListener"> & Partial<Pick<Document, "referrer">>;

type AnalyticsNavigator = Partial<Pick<Navigator, "language" | "maxTouchPoints" | "platform">>;

type AnalyticsScreen = Partial<Pick<Screen, "height" | "width">>;

type AnalyticsWindow = Pick<Window, "addEventListener"> & Partial<Pick<Window, "devicePixelRatio">>;

type TrackEvent = typeof trackCarEvent;

interface TrackCarEventOptions {
  env?: AnalyticsEnv;
  fetchImpl?: typeof fetch;
  location?: AnalyticsLocation;
  markFirstVisit?: boolean;
  navigatorRef?: AnalyticsNavigator | null;
  now?: () => number;
  randomId?: () => string;
  screenRef?: AnalyticsScreen | null;
  sessionId?: string;
  source?: string;
  storage?: AnalyticsStorage | null;
  timezone?: () => string;
  windowRef?: AnalyticsWindow | null;
}

interface InitCarAnalyticsOptions extends TrackCarEventOptions {
  documentRef?: AnalyticsDocument | null;
  sessionStartedAt?: number;
  windowRef?: AnalyticsWindow | null;
}

interface RouterLike {
  afterEach: (callback: (to: { fullPath?: string; path: string; meta?: { title?: unknown } }) => void) => void;
}

interface BindCarAnalyticsOptions extends TrackCarEventOptions {
  skipInitialNavigation?: boolean;
  trackEvent?: TrackEvent;
}

interface DeviceIdentity {
  deviceId: string;
  isNew: boolean;
  firstSeenAt: string | null;
}

export const CAR_ANALYTICS_EVENTS = {
  pageView: 5101,
  valuationSubmitSuccess: 5102,
  supportChatOpen: 5103,
  recordsOpen: 5104,
  pageStay: 5105,
  firstInteraction: 5111,
  scrollDepth: 5112,
  valuationFormStart: 5113,
  quickExit: 5114,
  ctaClick: 5115,
  sourceViewAttempt: 5116,
  savePageAttempt: 5117,
  devtoolsShortcut: 5118,
} as const;

const QUICK_EXIT_THRESHOLD_MS = 3_000;

function getRuntimeEnv(options: TrackCarEventOptions = {}) {
  return options.env ?? import.meta.env ?? {};
}

function normalizeOrigin(value: unknown) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function getAnalyticsOrigin(env: AnalyticsEnv) {
  return (
    normalizeOrigin(env.VITE_CAR_ANALYTICS_ORIGIN) ||
    normalizeOrigin(env.VITE_READ_FIND_SERVICE_ORIGIN) ||
    DEFAULT_ANALYTICS_ORIGIN
  );
}

function getCurrentLocation(options: TrackCarEventOptions = {}): AnalyticsLocation {
  if (options.location) {
    return options.location;
  }

  if (typeof window !== "undefined") {
    return window.location;
  }

  return {
    hostname: "",
    pathname: "/",
    search: "",
  };
}

function isLocalLocation(location: AnalyticsLocation) {
  return ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
}

function isEnvFlagTrue(value: unknown) {
  return value === true || value === "true";
}

function shouldSendAnalytics(env: AnalyticsEnv, location: AnalyticsLocation) {
  if (env.VITE_CAR_ANALYTICS_ENABLED === "false") {
    return false;
  }

  if (isLocalLocation(location)) {
    return isEnvFlagTrue(env.VITE_CAR_ANALYTICS_ENABLE_LOCAL);
  }

  return true;
}

function getStorage(options: TrackCarEventOptions = {}) {
  if ("storage" in options) {
    return options.storage ?? null;
  }

  if (typeof window !== "undefined") {
    return window.localStorage;
  }

  return null;
}

function createRandomId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createSessionId(options: TrackCarEventOptions = {}) {
  return `${DEVICE_ID_PREFIX}session-${options.randomId?.() ?? createRandomId()}`;
}

function getDeviceIdentity(options: TrackCarEventOptions = {}): DeviceIdentity {
  const storage = getStorage(options);
  const stored = storage?.getItem(DEVICE_ID_STORAGE_KEY);

  if (stored) {
    return {
      deviceId: stored,
      firstSeenAt: storage?.getItem(DEVICE_FIRST_SEEN_STORAGE_KEY) ?? null,
      isNew: false,
    };
  }

  const deviceId = `${DEVICE_ID_PREFIX}${options.randomId?.() ?? createRandomId()}`;
  const firstSeenAt = String(options.now?.() ?? Date.now());
  storage?.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
  storage?.setItem(DEVICE_FIRST_SEEN_STORAGE_KEY, firstSeenAt);

  return {
    deviceId,
    firstSeenAt,
    isNew: true,
  };
}

function generateSignature(payload: string, deviceId: string) {
  const salt = "fNd_s1gN@l#47";
  const raw = `${salt}:${payload}:@:${deviceId}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw.charCodeAt(index);
    h1 = Math.imul(h1 ^ char, 2654435761);
    h2 = Math.imul(h2 ^ char, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return [h1, h2, h1 ^ h2, ~h1 ^ h2, h1 ^ ~h2, h1 + h2, h1 - h2, h2 - h1]
    .map((part) => (part >>> 0).toString(16).padStart(8, "0"))
    .join("");
}

function resolveFetch(options: TrackCarEventOptions = {}) {
  if (options.fetchImpl) {
    return options.fetchImpl;
  }

  if (typeof fetch === "function") {
    return fetch.bind(globalThis);
  }

  return null;
}

function getSourcePath(location: AnalyticsLocation) {
  return sanitizeSourcePath(`${location.pathname || "/"}${location.search || ""}`);
}

function getAnalyticsEnvName(env: AnalyticsEnv) {
  return String(env.MODE || env.VITE_CAR_ANALYTICS_ENV || "").trim() || "production";
}

function normalizeRoute(pathname: string) {
  return (pathname || "/")
    .replace(/\/customer\/progress\/[^/?#]+$/, "/customer/progress/:orderId")
    .replace(/\/operator\/tasks\/[^/?#]+$/, "/operator/tasks/:taskId");
}

function extractReferrerHost(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function getCampaignQuery(search: string) {
  const query: Record<string, string> = {};
  const params = new URLSearchParams(search || "");

  CAMPAIGN_QUERY_KEYS.forEach((key) => {
    const value = sanitizeQueryValue(params.get(key));
    if (value) {
      query[key] = value;
    }
  });

  return query;
}

function sanitizeQueryValue(value: string | null) {
  return String(value || "").trim().slice(0, 120);
}

function sanitizeSourcePath(source: string) {
  const [path = "/", rawSearch = ""] = String(source || "/").split("?", 2);
  const params = new URLSearchParams(rawSearch.split("#", 1)[0] || "");
  const safeParams = new URLSearchParams();

  CAMPAIGN_QUERY_KEYS.forEach((key) => {
    const value = sanitizeQueryValue(params.get(key));
    if (value) {
      safeParams.set(key, value);
    }
  });

  const query = safeParams.toString();
  return `${normalizeRoute(path.split("#", 1)[0] || "/")}${query ? `?${query}` : ""}`;
}

function getStoredAttribution(storage: AnalyticsStorage | null) {
  const raw = storage?.getItem(DEVICE_ATTRIBUTION_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([key, value]) => [key, String(value || "").trim()])
        .filter(([key, value]) => CAMPAIGN_QUERY_KEYS.has(key) && Boolean(value)),
    );
  } catch {
    return {};
  }
}

function mergeAndPersistAttribution(query: Record<string, string>, storage: AnalyticsStorage | null) {
  const stored = getStoredAttribution(storage);
  const next = { ...stored, ...query };

  if (hasVisitorAttribution(query)) {
    storage?.setItem(DEVICE_ATTRIBUTION_STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

function hasVisitorAttribution(query: Record<string, string>) {
  return Object.keys(query).some((key) => VISITOR_ATTRIBUTION_QUERY_KEYS.has(key));
}

function resolveNavigator(options: TrackCarEventOptions = {}) {
  if ("navigatorRef" in options) {
    return options.navigatorRef ?? null;
  }

  if (typeof navigator !== "undefined") {
    return navigator;
  }

  return null;
}

function resolveScreen(options: TrackCarEventOptions = {}) {
  if ("screenRef" in options) {
    return options.screenRef ?? null;
  }

  if (typeof screen !== "undefined") {
    return screen;
  }

  return null;
}

function resolveWindow(options: TrackCarEventOptions = {}) {
  if ("windowRef" in options) {
    return options.windowRef ?? null;
  }

  if (typeof window !== "undefined") {
    return window;
  }

  return null;
}

function getClientProfile(options: TrackCarEventOptions = {}) {
  const navigatorRef = resolveNavigator(options);
  const screenRef = resolveScreen(options);
  const windowRef = resolveWindow(options);
  const profile: Record<string, string | number> = {};

  if (screenRef && Number.isFinite(screenRef.width)) profile.screenWidth = Number(screenRef.width);
  if (screenRef && Number.isFinite(screenRef.height)) profile.screenHeight = Number(screenRef.height);
  if (windowRef && Number.isFinite(windowRef.devicePixelRatio)) profile.devicePixelRatio = Number(windowRef.devicePixelRatio);
  if (navigatorRef?.language) profile.language = navigatorRef.language;
  if (navigatorRef?.platform) profile.platform = navigatorRef.platform;
  if (Number.isFinite(navigatorRef?.maxTouchPoints)) profile.maxTouchPoints = Number(navigatorRef?.maxTouchPoints);

  try {
    const timezone = options.timezone?.() ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) profile.timezone = timezone;
  } catch {}

  return profile;
}

function buildEngagementPayload(intentSignal: string, state: { firstInteractionAt: number | null; interactionCount: number; maxScrollDepth: number }, extra: Record<string, unknown> = {}) {
  return {
    ...extra,
    engagement: {
      firstInteractionAt: state.firstInteractionAt,
      interactionCount: state.interactionCount,
      maxScrollDepth: state.maxScrollDepth,
    },
    intentSignal,
  };
}

export async function trackCarEvent(
  eventType: number,
  payload: Record<string, unknown> = {},
  options: TrackCarEventOptions = {},
) {
  if (!Number.isFinite(eventType)) {
    return false;
  }

  const env = getRuntimeEnv(options);
  const location = getCurrentLocation(options);

  if (!shouldSendAnalytics(env, location)) {
    return false;
  }

  const fetchImpl = resolveFetch(options);

  if (!fetchImpl) {
    return false;
  }

  const identity = getDeviceIdentity(options);
  const timestamp = options.now?.() ?? Date.now();
  const path = "/collect";
  const route = normalizeRoute(location.pathname);
  const query = mergeAndPersistAttribution(getCampaignQuery(location.search), getStorage(options));
  const shouldAttachClientProfile = hasVisitorAttribution(query) || options.markFirstVisit;
  const clientProfile = shouldAttachClientProfile ? getClientProfile(options) : {};
  const envName = getAnalyticsEnvName(env);
  const site = location.hostname || "unknown";
  const enrichedPayload: Record<string, unknown> = {
    app: ANALYTICS_APP,
    env: envName,
    project: ANALYTICS_PROJECT,
    route,
    site,
    ...payload,
  };

  if (hasVisitorAttribution(query)) {
    enrichedPayload.query = query;
  }

  if (Object.keys(clientProfile).length > 0) {
    enrichedPayload.client = clientProfile;
  }

  if (options.sessionId) {
    enrichedPayload.sessionId = options.sessionId;
  }

  if (options.markFirstVisit) {
    enrichedPayload.firstVisit = identity.isNew;
  }

  try {
    await fetchImpl(`${getAnalyticsOrigin(env)}${path}`, {
      body: JSON.stringify({
        app: ANALYTICS_APP,
        env: envName,
        project: ANALYTICS_PROJECT,
        query,
        route,
        site,
        t: eventType,
        s: options.source ? sanitizeSourcePath(options.source) : getSourcePath(location),
        p: enrichedPayload,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": identity.deviceId,
        "X-Signature": generateSignature(`${timestamp}:${path}`, identity.deviceId),
        "X-Timestamp": String(timestamp),
      },
      keepalive: true,
      method: "POST",
    });

    return true;
  } catch {
    return false;
  }
}

export function trackCarCtaClick(
  cta: string,
  payload: Record<string, unknown> = {},
  options: TrackCarEventOptions = {},
) {
  const normalizedCta = String(cta || "").trim().slice(0, 80);
  if (!normalizedCta) {
    return Promise.resolve(false);
  }

  const eventType = normalizedCta.includes("support")
    ? CAR_ANALYTICS_EVENTS.supportChatOpen
    : (normalizedCta.includes("record") || normalizedCta.includes("records"))
      ? CAR_ANALYTICS_EVENTS.recordsOpen
      : CAR_ANALYTICS_EVENTS.ctaClick;

  return trackCarEvent(eventType, {
    ...payload,
    cta: normalizedCta,
    intentSignal: "cta_click",
  }, options);
}

function attachPageStayTracker(options: InitCarAnalyticsOptions = {}) {
  const documentRef = options.documentRef ?? (typeof document !== "undefined" ? document : null);
  const windowRef = options.windowRef ?? (typeof window !== "undefined" ? window : null);

  if (!documentRef || !windowRef) {
    return;
  }

  const startedAt = options.sessionStartedAt ?? options.now?.() ?? Date.now();
  let sent = false;

  const sendStayEvent = (reason: string) => {
    if (sent) {
      return;
    }

    sent = true;
    const durationMs = Math.max(0, (options.now?.() ?? Date.now()) - startedAt);
    const durationSeconds = Math.round(durationMs / 1000);
    void trackCarEvent(CAR_ANALYTICS_EVENTS.pageStay, {
      durationMs,
      durationSeconds,
      visibleDurationMs: durationMs,
      visibleDurationSeconds: durationSeconds,
      durationBasis: "foreground_visible",
      stayEndReason: reason,
      isFinalLikely: reason === "pagehide" || reason === "beforeunload",
      reason,
    }, options);
  };

  windowRef.addEventListener("pagehide", () => sendStayEvent("pagehide"));
  windowRef.addEventListener("beforeunload", () => sendStayEvent("beforeunload"));
  documentRef.addEventListener("visibilitychange", () => {
    if (documentRef.visibilityState === "hidden") {
      sendStayEvent("hidden");
    }
  });
}

function attachEngagementTracker(options: InitCarAnalyticsOptions = {}) {
  const windowRef = options.windowRef ?? (typeof window !== "undefined" ? window : null);

  if (!windowRef) {
    return;
  }

  const startedAt = options.sessionStartedAt ?? options.now?.() ?? Date.now();
  const state = {
    firstInteractionAt: null as number | null,
    interactionCount: 0,
    maxScrollDepth: 0,
  };
  const reportedScrollDepths = new Set<number>();
  let sentQuickExit = false;

  const sendFirstInteraction = (interactionType: string) => {
    state.interactionCount += 1;
    if (state.firstInteractionAt !== null) {
      return;
    }

    const timestamp = options.now?.() ?? Date.now();
    state.firstInteractionAt = timestamp;
    void trackCarEvent(CAR_ANALYTICS_EVENTS.firstInteraction, buildEngagementPayload("first_interaction", state, {
      interactionType,
      latencyMs: Math.max(0, timestamp - startedAt),
    }), options);
  };

  const sendScrollDepth = () => {
    const documentElement = typeof document !== "undefined" ? document.documentElement : null;
    const body = typeof document !== "undefined" ? document.body : null;
    const scrollTop = Math.max(documentElement?.scrollTop || 0, body?.scrollTop || 0);
    const scrollHeight = Math.max(documentElement?.scrollHeight || 0, body?.scrollHeight || 0);
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    const scrollableHeight = Math.max(1, scrollHeight - viewportHeight);
    const depth = Math.min(100, Math.max(0, Math.round((scrollTop / scrollableHeight) * 100)));
    const milestone = [90, 75, 50, 25].find(value => depth >= value);

    if (!milestone || reportedScrollDepths.has(milestone)) {
      return;
    }

    reportedScrollDepths.add(milestone);
    state.maxScrollDepth = Math.max(state.maxScrollDepth, milestone);
    void trackCarEvent(CAR_ANALYTICS_EVENTS.scrollDepth, buildEngagementPayload("scroll_depth", state, {
      scrollDepth: milestone,
    }), options);
  };

  const sendQuickExit = (reason: string) => {
    if (sentQuickExit || state.interactionCount > 0 || state.maxScrollDepth > 0) {
      return;
    }

    const durationMs = Math.max(0, (options.now?.() ?? Date.now()) - startedAt);
    if (durationMs > QUICK_EXIT_THRESHOLD_MS) {
      return;
    }

    sentQuickExit = true;
    void trackCarEvent(CAR_ANALYTICS_EVENTS.quickExit, buildEngagementPayload("quick_exit", state, {
      durationMs,
      durationSeconds: Math.round(durationMs / 1000),
      reason,
    }), options);
  };

  ["click", "touchstart", "keydown"].forEach(eventName => {
    windowRef.addEventListener(eventName, () => sendFirstInteraction(eventName));
  });
  windowRef.addEventListener("scroll", () => {
    sendFirstInteraction("scroll");
    sendScrollDepth();
  });
  windowRef.addEventListener("pagehide", () => sendQuickExit("pagehide"));
  windowRef.addEventListener("beforeunload", () => sendQuickExit("beforeunload"));
}

function attachCopyRiskTracker(options: InitCarAnalyticsOptions = {}) {
  const windowRef = options.windowRef ?? (typeof window !== "undefined" ? window : null);

  if (!windowRef) {
    return;
  }

  const reportedSignals = new Set<string>();
  const sendCopyRiskSignal = (eventType: number, copyRiskSignal: string, payload: Record<string, unknown>) => {
    if (reportedSignals.has(copyRiskSignal)) {
      return;
    }

    reportedSignals.add(copyRiskSignal);
    void trackCarEvent(eventType, {
      ...payload,
      copyRiskSignal,
      intentSignal: "copy_research",
    }, options);
  };

  windowRef.addEventListener("keydown", (event: KeyboardEvent) => {
    const key = String(event.key || "").toLowerCase();
    const shortcut = [
      event.ctrlKey ? "Ctrl" : "",
      event.metaKey ? "Meta" : "",
      event.shiftKey ? "Shift" : "",
      event.altKey ? "Alt" : "",
      event.key || "",
    ].filter(Boolean).join("+");

    if ((event.ctrlKey || event.metaKey) && key === "u") {
      sendCopyRiskSignal(CAR_ANALYTICS_EVENTS.sourceViewAttempt, "source_view_shortcut", {
        shortcut,
        copyRiskReason: "source_view_shortcut",
      });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && key === "s") {
      sendCopyRiskSignal(CAR_ANALYTICS_EVENTS.savePageAttempt, "save_page_shortcut", {
        shortcut,
        copyRiskReason: "save_page_shortcut",
      });
      return;
    }

    if (
      key === "f12" ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && ["i", "j", "c"].includes(key))
    ) {
      sendCopyRiskSignal(CAR_ANALYTICS_EVENTS.devtoolsShortcut, "devtools_shortcut", {
        shortcut,
        copyRiskReason: "devtools_shortcut",
      });
    }
  });
}

export function initCarAnalytics(options: InitCarAnalyticsOptions = {}) {
  const documentRef = options.documentRef ?? (typeof document !== "undefined" ? document : null);
  const entryAt = options.now?.() ?? Date.now();
  const sessionId = createSessionId(options);
  const sessionOptions = { ...options, sessionId } as InitCarAnalyticsOptions & { sessionId: string };
  attachPageStayTracker(sessionOptions);
  attachEngagementTracker(sessionOptions);
  attachCopyRiskTracker(sessionOptions);

  return trackCarEvent(CAR_ANALYTICS_EVENTS.pageView, {
    entryAt,
    entryRoute: normalizeRoute(getCurrentLocation(options).pathname),
    referrerHost: extractReferrerHost(documentRef?.referrer),
    sessionId,
    title: documentRef?.title ?? "",
    visibilityState: documentRef?.visibilityState ?? "unknown",
  }, {
    ...sessionOptions,
    markFirstVisit: true,
  });
}

export function bindCarAnalyticsToRouter(router: RouterLike, options: BindCarAnalyticsOptions = {}) {
  const trackEvent = options.trackEvent ?? trackCarEvent;
  let shouldSkipNextNavigation = options.skipInitialNavigation ?? true;

  router.afterEach((to) => {
    if (shouldSkipNextNavigation) {
      shouldSkipNextNavigation = false;
      return;
    }

    void trackEvent(CAR_ANALYTICS_EVENTS.pageView, {
      title: typeof to.meta?.title === "string" ? to.meta.title : "",
    }, {
      ...options,
      source: to.fullPath || to.path,
    });
  });
}
