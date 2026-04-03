function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

const raw = import.meta.env.VITE_API_BASE_URL?.trim()

/**
 * Base URL для API.
 * - По умолчанию `/api` — запросы идут на тот же origin (Vite dev), прокси в vite.config → backend.
 * - В docker-compose задайте VITE_API_BASE_URL=/api и API_PROXY_TARGET=http://backend:8000
 * - Явный URL (http://127.0.0.1:8000) — если нужен прямой доступ без прокси.
 */
export const API_BASE_URL = normalizeBaseUrl(raw || '/api')
