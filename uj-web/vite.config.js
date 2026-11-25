import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The API is the Cloudflare Worker (worker/index.js). Locally it runs with `npm run dev:api`
// on http://localhost:8787, and Vite forwards /api and /uploads to it so the browser sees one origin.
const API = process.env.VITE_API_TARGET || 'http://localhost:8787'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: API, changeOrigin: true },
      '/uploads': { target: API, changeOrigin: true },
    },
  },
  build: {
    // `npm run build` writes to ../dist, which Cloudflare serves as static assets (see wrangler.jsonc).
    outDir: '../dist',
    emptyOutDir: true,
  },
})
