import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['bc56-2409-40e0-1031-31ee-dc1c-3900-9828-c929.ngrok-free.app']
  }
})