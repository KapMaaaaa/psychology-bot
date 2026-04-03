import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/** Прокси с хоста (локальный uvicorn / Docker Desktop) */
const DEFAULT_PROXY_TARGET = 'http://127.0.0.1:8000'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // В Docker: API_PROXY_TARGET=http://backend:8000 (имя сервиса в сети compose)
  const apiTarget = (
    env.API_PROXY_TARGET?.trim() || DEFAULT_PROXY_TARGET
  ).replace(/\/+$/, '')

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})

