const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL?.trim() || "").replace(/\/+$/, "");

interface ApiEnvelope<T> {
  code?: number;
  message?: string;
  data?: T;
}

function createHeaders(headersInit?: HeadersInit, contentType?: string) {
  const headers: Record<string, string> = {};

  if (headersInit instanceof Headers) {
    for (const [key, value] of headersInit.entries()) {
      headers[key] = value;
    }
  } else if (Array.isArray(headersInit)) {
    for (const [key, value] of headersInit) {
      headers[String(key)] = String(value);
    }
  } else if (headersInit) {
    for (const [key, value] of Object.entries(headersInit)) {
      headers[key] = String(value);
    }
  }

  const hasContentType = Object.keys(headers).some(
    (key) => key.toLowerCase() === "content-type",
  );

  if (contentType && !hasContentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T> | T;

  if (payload && typeof payload === "object" && "code" in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (typeof envelope.code === "number" && envelope.code !== 1000) {
      throw new Error(envelope.message || `Request failed: ${envelope.code}`);
    }

    return envelope.data as T;
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: createHeaders(init?.headers, "application/json"),
  });

  return parseResponse<T>(response);
}

export async function requestFormData<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: init?.headers,
  });

  return parseResponse<T>(response);
}
