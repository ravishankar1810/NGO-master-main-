import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    optimizeDeps: {
      include: [
        'react', 'react-dom', 'react-router-dom',
        'framer-motion', 'axios',
        'react-toastify', 'lucide-react',
        'recharts', 'date-fns'
      ]
    },
    build: {
      chunkSizeWarningLimit: 1500,
      sourcemap: false,
    },
    server: {
      port: 5173,
      https: false,
    },
    // Add this to ensure the variable is defined!
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
