import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import promoTimerRoutes from './routes/promoTimerRoutes';
import storeRoutes from './routes/storeRoutes';
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase, closeDatabaseConnection } from "./db";
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const allowedOriginsEnv = process.env.CORS_ORIGINS;
const allowedOrigins = allowedOriginsEnv ? allowedOriginsEnv.split(',').map(s => s.trim()) : [];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || process.env.NODE_ENV === 'development' || origin.includes('-admin') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked')); // Disallow other origins
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};

app.use(cors(corsOptions));

// Handle preflight requests globally
app.options('*', cors(corsOptions));

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.url;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  // @ts-ignore - We need to override the json method
  res.json = function(bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    // @ts-ignore - Apply with arguments
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // @ts-ignore - Express types are incomplete
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      // @ts-ignore - Express types are incomplete
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  let dbConnected = false;
  
  // Connect to MongoDB but continue even if it fails
  try {
    const connection = await connectToDatabase();
    if (connection) {
      log('MongoDB connected successfully', 'mongodb');
      dbConnected = true;
    } else {
      log('MongoDB connection failed but continuing with limited functionality', 'mongodb');
    }
  } catch (error) {
    log(`MongoDB connection error: ${error}`, 'mongodb');
    // Continue even without MongoDB
  }
  // Initialize demo data regardless of database connection
  try {
    const { initDemoData } = await import('./initData');
    await initDemoData();
  } catch (error) {
    log(`Error initializing demo data: ${error}`, 'initData');
  }
  
  // Add a health check route
  app.get('/api/health', (req, res) => {
    // @ts-ignore - Express types are incomplete
    res.status(200).json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected'
    });
  });

  app.use('/api/promotimers', promoTimerRoutes);
  app.use('/api/stores', storeRoutes);

  // Register API routes
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // @ts-ignore - Express types are incomplete
    res.status(status).json({ message });
    console.error(err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  console.log('NODE_ENV=', process.env.NODE_ENV, 'express env=', app.get('env'));

  if (process.env.NODE_ENV === "development") {
    try {
      await setupVite(app, server);
      log('Vite dev server initialized successfully', 'vite');
    } catch (error) {
      console.error('Failed to initialize Vite dev server:', error);
    }
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server running at http://localhost:${port}`, 'express');
    log('Frontend available at http://localhost:5000', 'express');
    log('Admin panel available at http://localhost:5000/admin', 'express');
  });
})();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keep the process running but log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the process running but log the error
});