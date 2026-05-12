import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    https: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5100',
        changeOrigin: true,
      }
    }
  }
})
