/**
 * Resolución de la URL base del backend.
 *
 * - En Docker: el entrypoint genera /env.js que inyecta window.__ENV__.BACKEND_URL
 * - En desarrollo local: define VITE_BACKEND_URL en .env.local
 * - Fallback: http://localhost:8000
 */
declare global {
  interface Window {
    __ENV__?: { BACKEND_URL?: string };
  }
}

export function backendUrl(): string {
  const runtime = window.__ENV__?.BACKEND_URL;
  const buildTime = import.meta.env.VITE_BACKEND_URL as string | undefined;
  return (runtime || buildTime || "http://localhost:8000").replace(/\/$/, "");
}

/** @deprecated usa backendUrl() */
export const apiBaseUrl = backendUrl;
