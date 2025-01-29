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
  // server: {
  //   port: 5173,
  //   fs: {
  //     strict: false,
  //     allow: [".."],
  //   },
  // },
});
