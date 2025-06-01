import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Expose all env variables to your app
      'import.meta.env.VITE_APP_LIVEKIT_URL': JSON.stringify(env.VITE_APP_LIVEKIT_URL),
      'import.meta.env.VITE_APP_LIVEKIT_API_KEY': JSON.stringify(env.VITE_APP_LIVEKIT_API_KEY),
      'process.env': {}
    },
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
  };
});
