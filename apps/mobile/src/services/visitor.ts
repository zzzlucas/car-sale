const VISITOR_KEY_STORAGE = "car.visitor.key";

function createVisitorKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorKey() {
  if (typeof localStorage === "undefined") {
    return "visitor-server";
  }

  const existing = localStorage.getItem(VISITOR_KEY_STORAGE)?.trim();
  if (existing) {
    return existing;
  }

  const nextKey = createVisitorKey();
  localStorage.setItem(VISITOR_KEY_STORAGE, nextKey);
  return nextKey;
}

export function getVisitorHeaders() {
  return {
    "X-Visitor-Key": getVisitorKey(),
  };
}
