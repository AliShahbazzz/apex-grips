import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Must match STORE_CORS in server/.env
  server: { port: 8000, strictPort: true },
})
