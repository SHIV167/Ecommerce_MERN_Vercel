import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger, type ServerOptions } from "vite";
import type { ConfigEnv, UserConfig } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export async function setupVite(app: Express, server: Server) {
  // Resolve root Vite config to a UserConfig
  let rootConfig: UserConfig;
  if (typeof viteConfig === "function") {
    rootConfig = await viteConfig({ command: "serve", mode: process.env.NODE_ENV || "development" } as ConfigEnv);
  } else {
    rootConfig = await viteConfig;
  }

  // Dev middleware options with proxy from root config
  const serverOptions: ServerOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
    proxy: rootConfig.server?.proxy,
  };

  // Create client Vite dev server from root config
  const clientConfigFile = path.resolve(__dirname, '..', 'vite.config.ts');
  const clientVite = await createViteServer({
    configFile: clientConfigFile,
    server: serverOptions,
    appType: 'custom',
  });

  // Create admin Vite dev server from admin config
  const adminConfigFile = path.resolve(__dirname, '..', 'vite.admin.config.ts');
  const adminVite = await createViteServer({
    configFile: adminConfigFile,
    server: serverOptions,
    appType: 'custom',
  });

  // Mount admin middleware and HTML fallback
  app.use('/admin', adminVite.middlewares);
  app.use('/admin', async (req, res, next) => {
    try {
      const adminRoot = path.resolve(__dirname, '..', 'admin');
      const templatePath = path.resolve(adminRoot, 'index.html');
      let template = await fs.promises.readFile(templatePath, 'utf-8');
      const url = req.originalUrl.replace(/^\/admin/, '') || '/';
      const html = await adminVite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      adminVite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  // Mount client middleware and HTML fallback
  app.use(clientVite.middlewares);
  app.use(async (req, res, next) => {
    if (req.originalUrl.startsWith('/admin')) return next();
    try {
      const clientRoot = path.resolve(__dirname, '..', 'client');
      const templatePath = path.resolve(clientRoot, 'index.html');
      let template = await fs.promises.readFile(templatePath, 'utf-8');
      const url = req.originalUrl.replace(/^\/api/, '') || '/';
      const html = await clientVite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      clientVite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  const clientDist = path.resolve(__dirname, "../dist/public");
  const adminDist = path.resolve(__dirname, "../dist/public/admin");

  // Serve admin static and fallback
  if (fs.existsSync(adminDist)) {
    app.use("/admin", express.static(adminDist));
    app.use("/admin/*", (_req, res) => {
      res.sendFile(path.resolve(adminDist, "index.html"));
    });
  }

  // Serve client static and fallback
  if (!fs.existsSync(clientDist)) {
    throw new Error(
      `Could not find the client build directory: ${clientDist}, make sure to build the client first`
    );
  }
  app.use(express.static(clientDist));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(clientDist, "index.html"));
  });
}
