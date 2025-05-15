import express, { Request, Response, NextFunction } from 'express';
import { adminLogin, adminLogout, verifyAdminToken } from '../controllers/authController';

// Custom request interface with user property
interface AuthRequest extends Request {
  user?: any;
}

// Helper to get cookie domain
function getCookieDomain(req: Request): string | undefined {
  const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
  if (COOKIE_DOMAIN) return COOKIE_DOMAIN;
  if (process.env.NODE_ENV === 'production') {
    const parts = req.hostname.split('.');
    const root = parts.slice(-2).join('.');
    return `.${root}`;
  }
  return undefined;
}

const router = express.Router();

// Middleware for authentication
const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const decoded = process.env.JWT_SECRET ? 
      require('jsonwebtoken').verify(token, process.env.JWT_SECRET) : 
      require('jsonwebtoken').verify(token, 'default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Not authenticated' });
  }
};

// Middleware for admin check
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

// Admin auth routes
router.post('/admin/auth/login', adminLogin);
router.post('/admin/auth/logout', adminLogout);
router.get('/admin/auth/verify', verifyAdminToken);

// Route to refresh authentication token
router.post('/admin/auth/refresh', isAuthenticated, (req: AuthRequest, res: Response) => {
  try {
    // Generate a new token with the existing user data
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = process.env.JWT_SECRET ? 
      require('jsonwebtoken').sign(req.user, process.env.JWT_SECRET, { expiresIn: '7d' }) : 
      require('jsonwebtoken').sign(req.user, 'default_secret', { expiresIn: '7d' });
    
    // Set the new token as a cookie
    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: getCookieDomain(req),
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000') // 7 days default
    });
    
    return res.status(200).json({ message: 'Token refreshed successfully', user: req.user });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ message: 'Server error during token refresh' });
  }
});

export default router;
