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
      'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(env.VITE_CLOUDINARY_CLOUD_NAME),
      'import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET': JSON.stringify(env.VITE_CLOUDINARY_UPLOAD_PRESET),
      'process.env': {}
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://backend:8000/',
          changeOrigin: true,
          secure: true,
          // Remove /api prefix if your backend doesn’t use it
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
