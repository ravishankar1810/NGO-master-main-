import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  // Keep your optimization - this is good for dev speed
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'framer-motion', 'axios',
      'react-toastify', 'lucide-react',
      'recharts', 'date-fns'
    ]
  },

  build: {
    // Increased the warning limit so your console stays clean
    // but removed manualChunks so Vite can safely map dependencies!
    chunkSizeWarningLimit: 1500, 
    sourcemap: false,
  },

  server: {
    port: 5173,
    https: false,
  }
})
