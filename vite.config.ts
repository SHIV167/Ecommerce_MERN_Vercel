import { defineConfig, loadEnv } from 'vite';
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const backend = env.VITE_API_URL || 'http://localhost:5000';
  return {
    // Serve static assets from root public directory
    publicDir: path.resolve(import.meta.dirname, "public"),
    root: path.resolve(import.meta.dirname, "client"),
    base: '/',
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    server: {
      port: 5173,
      open: '/',
      proxy: {
        '/api': {
          target: backend,
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
  };
});
