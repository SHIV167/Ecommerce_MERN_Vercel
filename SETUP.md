# Setup & Configuration

This guide covers local development and Render deployment for the EcommercePro monorepo.

## Prerequisites

- Node.js v16+ and npm installed
- MongoDB connection URI (e.g. Atlas)
- SMTP credentials for email
- Render.com account (for production)

## Environment Variables

1. Copy the root `.env.example` to `.env` in the repo root:
   ```bash
   cp .env.example .env
   ```
2. Fill in your values:
   ```env
   MONGODB_URI=your-mongo-uri
   SMTP_HOST=...
   SMTP_PORT=...
   SMTP_SECURE=false
   SMTP_USER=...
   SMTP_PASS=...
   SMTP_FROM="EcommercePro <no-reply@yourdomain.com>"

   # URLs for CORS in server
   CLIENT_BASE_URL=http://localhost:5173
   ADMIN_BASE_URL=http://localhost:5174

   # API base URL for client and admin
   VITE_API_URL=http://localhost:5000

   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d
   COOKIE_MAX_AGE=86400000
   ```
3. Create `admin/.env` with:
   ```bash
   cp ../.env.example .env
   ```
   Ensure `VITE_API_URL` is present.

## Local Development

Open three terminals:

1. **Server (API + SSR)**
   ```bash
   npm install        # from repo root
   npm run dev:server # or npm run dev
   ```
2. **Storefront (client)**
   ```bash
   npm run dev:client
   ```
3. **Admin panel**
   ```bash
   npm run dev:admin
   ```

- API health check: http://localhost:5000/api/health
- Client UI: http://localhost:5173
- Admin UI:  http://localhost:5174

## Build & Production Locally

```bash
npm run build        # builds server, client, and admin
npm start            # starts server (serves API + static assets)
```

Access everything on http://localhost:5000

## Render Deployment

The provided `render.yaml` defines three services:

1. **EcommercePro-Server** (type: web)
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Reads root env vars (`MONGODB_URI`, SMTP_*, JWT_*, CLIENT_BASE_URL, ADMIN_BASE_URL)

2. **EcommercePro-Client** (type: static)
   - Build: `npm install && npm run build`
   - Publish path: `dist/public`
   - Env var: `VITE_API_URL` (point to your server URL)

3. **EcommercePro-Admin** (type: static)
   - Build: `npm install && npm run build`
   - Publish path: `dist/public/admin`
   - Env var: `VITE_API_URL`

Once pushed to your Git repo, Render will detect `render.yaml` and deploy all three services in parallel.
