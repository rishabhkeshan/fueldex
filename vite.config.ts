import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  root: "./",
  build: {
    outDir: "dist",
  },
  publicDir: "public",
  server: {
    allowedHosts: [
        "37ab-101-0-63-28.ngrok-free.app",
        // You might want to keep 'localhost' and '127.0.0.1' if needed
        // 'localhost',
        // '127.0.0.1',
    ],
  },
});
