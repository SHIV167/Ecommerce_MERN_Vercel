import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  getAllFreeProducts,
  getFreeProductById,
  createFreeProduct,
  updateFreeProduct,
  deleteFreeProduct,
} from '../controllers/freeProductController';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// Middleware for authentication
const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Not authenticated' });
  }
};

// Middleware for admin check
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

// Admin routes (protected)
router.get('/admin/free-products', isAuthenticated, isAdmin, getAllFreeProducts);
router.get('/admin/free-products/:id', isAuthenticated, isAdmin, getFreeProductById);
router.post('/admin/free-products', isAuthenticated, isAdmin, createFreeProduct);
router.put('/admin/free-products/:id', isAuthenticated, isAdmin, updateFreeProduct);
router.delete('/admin/free-products/:id', isAuthenticated, isAdmin, deleteFreeProduct);

// Public routes
router.get('/free-products', getAllFreeProducts);

export default router;
