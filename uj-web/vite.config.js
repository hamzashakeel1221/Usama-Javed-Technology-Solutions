import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The API runs on http://localhost:5277 (see UJ.Api/Properties/launchSettings.json).
// In development Vite forwards /api and /uploads to it, so the browser sees one origin.
const API = process.env.VITE_API_TARGET || 'http://localhost:5277'

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
    // `npm run build` writes straight into the API's wwwroot so ASP.NET serves the site.
    outDir: '../UJ.Api/wwwroot',
    emptyOutDir: false, // keep wwwroot/uploads
  },
})
