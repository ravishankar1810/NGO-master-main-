import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  // ── Speed: pre-bundle heavy deps so Dev-HMR stays fast ──────────────
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'framer-motion', 'axios',
      'react-toastify', 'lucide-react',
      'recharts', 'date-fns'
    ]
  },

  build: {
    // ── Code-split: one chunk per logical group ──────────────────────
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react'
          }
          // Maps (heavy – Leaflet + react-globe)
          if (id.includes('leaflet') || id.includes('react-leaflet') || id.includes('react-globe')) {
            return 'vendor-maps'
          }
          // Charts
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts'
          }
          // Animations
          if (id.includes('framer-motion')) {
            return 'vendor-motion'
          }
          // Everything else in node_modules → single vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
        }
      }
    },
    // Warn when any chunk exceeds 700 kB
    chunkSizeWarningLimit: 700,
    // Fastest source-maps in production (none = best perf)
    sourcemap: false,
  },

  // ── Dev: faster file serving ─────────────────────────────────────────
  server: {
    port: 5173,
    // Enable HTTP/2 for multiplexed asset loading
    https: false,
  }
})
