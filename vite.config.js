import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind runs via PostCSS (postcss.config.js), not @tailwindcss/vite — the Vite
// plugin uses Node worker hooks that often fail on cPanel with EAGAIN / ERR_WORKER_INIT_FAILED.

// https://vite.dev/config/
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
