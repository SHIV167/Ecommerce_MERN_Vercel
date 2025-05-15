import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy admin API requests
      '/admin/api': {
        target: 'https://ecommercepro-0ukc.onrender.com',
        changeOrigin: true,
        secure: false,
        // Remove /admin from the path when forwarding to backend
        rewrite: (path) => path.replace(/^\/admin/, ''),
      },
      // Proxy static uploads to backend
      '/uploads': {
        target: 'https://ecommercepro-0ukc.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/public/admin"),
    emptyOutDir: false,
  },
}); 
