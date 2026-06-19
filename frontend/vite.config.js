import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-core'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query'
            }
            if (id.includes('lucide-react') || id.includes('aos') || id.includes('react-hot-toast')) {
              return 'ui-libs'
            }
            if (id.includes('recharts')) {
              return 'charts'
            }
            if (id.includes('i18next') || id.includes('react-i18next') || id.includes('i18next-browser-languagedetector') || id.includes('i18next-http-backend')) {
              return 'i18n'
            }
            if (id.includes('zustand') || id.includes('axios')) {
              return 'store'
            }
            return 'vendor'
          }
        }
      }
    },
    // Increase chunk warning limit
    chunkSizeWarningLimit: 600,
  },
  esbuild: {
    drop: ['console', 'debugger'], // Remove console logs and debugger in production build
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'lucide-react',
      'aos',
      'react-hot-toast',
      'zustand',
    ]
  }
})
