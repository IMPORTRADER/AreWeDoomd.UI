import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7118',
        changeOrigin: true,
        secure: false, // self-signed sertifikayı kabul et
      },
    },
  },
})
