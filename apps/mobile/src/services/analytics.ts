const DEFAULT_ANALYTICS_ORIGIN = "https://find.lucasishere.top";
const DEVICE_ID_STORAGE_KEY = "car_mobile_device_id";
const DEVICE_FIRST_SEEN_STORAGE_KEY = "car_mobile_device_first_seen";
const DEVICE_ID_PREFIX = "car-";

type AnalyticsEnv = Partial<Record<string, string | boolean | undefined>>;

type AnalyticsLocation = Pick<Location, "hostname" | "pathname" | "search">;

type AnalyticsStorage = Pick<Storage, "getItem" | "setItem">;

type AnalyticsDocument = Pick<Document, "title" | "visibilityState" | "addEventListener">;

type AnalyticsWindow = Pick<Window, "addEventListener">;

type TrackEvent = typeof trackCarEvent;

interface TrackCarEventOptions {
  env?: AnalyticsEnv;
  fetchImpl?: typeof fetch;
  location?: AnalyticsLocation;
  markFirstVisit?: boolean;
  now?: () => number;
  randomId?: () => string;
  source?: string;
  storage?: AnalyticsStorage | null;
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
} as const;

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
  return `${location.pathname || "/"}${location.search || ""}`;
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
  const enrichedPayload: Record<string, unknown> = {
    app: "car-mobile",
    project: "car",
    ...payload,
  };

  if (options.markFirstVisit) {
    enrichedPayload.firstVisit = identity.isNew;
  }

  try {
    await fetchImpl(`${getAnalyticsOrigin(env)}${path}`, {
      body: JSON.stringify({
        t: eventType,
        s: options.source || getSourcePath(location),
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
    void trackCarEvent(CAR_ANALYTICS_EVENTS.pageStay, {
      durationMs,
      durationSeconds: Math.round(durationMs / 1000),
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

export function initCarAnalytics(options: InitCarAnalyticsOptions = {}) {
  const documentRef = options.documentRef ?? (typeof document !== "undefined" ? document : null);
  attachPageStayTracker(options);

  return trackCarEvent(CAR_ANALYTICS_EVENTS.pageView, {
    title: documentRef?.title ?? "",
  }, {
    ...options,
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
