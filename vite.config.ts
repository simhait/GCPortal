import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://apitests.primeroedge.co/GCQAAPIS',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true
      },
      '/usda-api': {
        target: 'https://api.nal.usda.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/usda-api/, ''),
        secure: true
      },
      '/usda-portal': {
        target: 'https://fdc.nal.usda.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/usda-portal/, ''),
        secure: true
      }
    }
  }
})