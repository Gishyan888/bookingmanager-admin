import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Tailwind via PostCSS (v3) — avoids @tailwindcss/vite workers that break on cPanel (EAGAIN / ERR_WORKER_INIT_FAILED).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
