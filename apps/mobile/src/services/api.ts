const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8001";

interface ApiEnvelope<T> {
  code?: number;
  message?: string;
  data?: T;
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T> | T;

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}
