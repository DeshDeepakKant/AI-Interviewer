import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any request to /api will be forwarded to the target
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // no rewrite: /api/users → https://backend-ai-interview.vercel.app/api/users
      },
    },
  },
})
