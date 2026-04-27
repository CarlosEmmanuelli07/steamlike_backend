import { backendUrl } from "./env";
import { csrfToken } from "./csrf";

export type ApiError =
  | { error: string; message: string; details?: Record<string, string> }
  | { error: string; message: string };

async function parseJsonOrNull(res: Response): Promise<any | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: "invalid_json", message: "Respuesta no JSON del servidor." };
  }
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { json?: any } = {}
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: ApiError }> {
  const base = backendUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const headers = new Headers(opts.headers || {});
  if (opts.json !== undefined) headers.set("Content-Type", "application/json");

  // CSRF en métodos no seguros (requerido por Django)
  const method = (opts.method || "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    const token = csrfToken();
    if (token) headers.set("X-CSRFToken", token);
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    credentials: "include", // cookies de sesión Django
    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
  });

  if (res.status === 204) {
    return { ok: true, data: null as unknown as T };
  }

  const payload = await parseJsonOrNull(res);

  if (!res.ok) {
    return { ok: false, status: res.status, error: payload as ApiError };
  }

  return { ok: true, data: payload as T };
}
