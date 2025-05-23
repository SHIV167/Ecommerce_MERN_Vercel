# EcommercePro

A standalone monorepo scaffold for the EcommercePro project, containing three independent apps:

- **server/**: Express API server
- **client/**: React storefront
- **admin/**: React admin panel

---

## Prerequisites

- Node.js v16+ and npm installed
- MongoDB URI (e.g. Atlas)
- Environment variables configured in `.env`

## Environment Variables

Create `depolylive/.env` with:

```env
# CORS origins (comma-separated)
CORS_ORIGINS=https://your-vercel-app.vercel.app

# Server settings
PORT=5000
HOST_URL=http://localhost:5000

# Frontend API base
VITE_API_BASE=https://your-vercel-deployment-url
VITE_PORT=5173
VITE_ADMIN_PORT=5174

# MongoDB connection
MONGODB_URI=your-mongo-uri
JWT_SECRET=your-jwt-secret
``` 

## Installation

From repo root:

```bash
# Install dependencies
npm install        # install root dependencies

# Install app dependencies
cd server && npm install
cd ../client && npm install
cd ../admin && npm install
``` 

## Development

Open three terminals:

1. **Server**
   ```bash
   cd server
   npm run dev
   ```
2. **Client**
   ```bash
   cd client
   npm run dev
   ```
3. **Admin**
   ```bash
   cd admin
   npm run dev
   ```

Each app will run on its configured port:
- Server: `http://localhost:5000`
- Client: `http://localhost:5173`
- Admin:  `http://localhost:5174`

## Build & Production

1. Build all apps:
   ```bash
   cd depolylive/server && npm run build
   cd ../client && npm run build
   cd ../admin && npm run build
   ```
2. Start server in production mode:
   ```bash
   cd server
   npm start
   ```
3. Serve static files from `client/dist` and `admin/dist` as needed (e.g. via Nginx or Express static middleware).

## Deployment to Vercel

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Make sure you have the `vercel.json` configuration file in your project root (it's already included).

4. Deploy to Vercel:
   ```bash
   vercel
   ```

5. Configure Environment Variables in Vercel Dashboard:
   - Go to your project settings in Vercel
   - Add all the environment variables from your `.env` file
   - Update `CORS_ORIGINS` to include your Vercel deployment URLs
   - Update `VITE_API_BASE` to point to your Vercel deployment URL

6. For production deployment:
   ```bash
   vercel --prod
   ```

The deployment will create three URLs:
- Main URL: Your client application
- /admin: Your admin panel
- /api: Your server API

## Deployment Instructions

This project is configured to deploy the **main application** (server and client) on one URL and the **admin panel** on a separate URL.

### Main Application

The main application includes both the server (API routes) and the client (UI). Its Vercel configuration (defined in `vercel.json`) is as follows:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/index.html"
    }
  ]
}
```

Deploy this configuration as a Vercel project to serve the main application at your desired URL (for example, `https://ecommerce-mern-vercel.vercel.app/`).

### Admin Panel

The admin panel is deployed separately. Create a new Vercel project with the following configuration (for example, in a file named `admin-vercel.json`):

```json
{
  "version": 2,
  "buildCommand": "vite build --config vite.admin.config.ts",
  "builds": [
    {
      "src": "admin/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/admin/dist/index.html"
    }
  ]
}
```

Deploy this second project on Vercel so that your admin panel is available at a different URL (for example, `https://admin.ecommerce-mern-vercel.vercel.app/`).

This setup allows you to manage deployments independently, ensuring that the main application and admin panel are served from separate URLs.

## Project Structure

```
├── server/         # Express.js backend
├── client/         # React.js frontend
├── admin/          # React.js admin panel
├── vercel.json     # Vercel deployment config
└── package.json    # Root dependencies and scripts
```

---

Happy coding! Feel free to update this README with additional details.
