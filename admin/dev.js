// This file is used to start the admin development server

import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Debug paths
console.log("__dirname:", __dirname);
console.log("rootDir:", rootDir);
console.log("Admin src path:", path.resolve(__dirname, "src"));

// Make sure the Vite server uses the correct src and index.html paths
const adminSrcDir = path.resolve(__dirname, "src");
const adminIndexHtml = path.resolve(__dirname, "index.html");

console.log("Files exist check:");
console.log(
  "src/main.tsx exists:",
  fs.existsSync(path.resolve(adminSrcDir, "main.tsx"))
);
console.log("index.html exists:", fs.existsSync(adminIndexHtml));

async function startServer() {
  const server = await createServer({
    // configure vite
    configFile: false,
    root: __dirname, // Use the admin directory as root
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Proxy all /api requests to the backend
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
          },
        },
      },
    },
    resolve: {
      alias: [
        { find: "@", replacement: adminSrcDir },
        { find: "@shared", replacement: path.resolve(rootDir, "shared") },
        {
          find: "@assets",
          replacement: path.resolve(rootDir, "attached_assets"),
        },
        {
          find: "@/components/ui",
          replacement: path.resolve(rootDir, "client/src/components/ui"),
        },
      ],
    },
    build: {
      outDir: path.resolve(__dirname, "dist"),
    },
  });

  await server.listen();
  console.log(`Admin server running at ${server.resolvedUrls.local[0]}`);
}

startServer();
