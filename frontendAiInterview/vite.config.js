import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy:{
      '/api': 'https://backend-ai-interview.vercel.app'
    }
  },
  plugins: [react()],
})
