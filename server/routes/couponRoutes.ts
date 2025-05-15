import express, { Request, Response, NextFunction } from 'express';
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon
} from '../controllers/couponController';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware for authentication
const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
};

// Middleware for admin check
const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!(req as any).user?.isAdmin) {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
    return;
  }
  next();
};

// Admin routes (protected)
router.get('/admin/coupons', isAuthenticated, isAdmin, getAllCoupons);
router.get('/admin/coupons/:id', isAuthenticated, isAdmin, getCouponById);
router.post('/admin/coupons', isAuthenticated, isAdmin, createCoupon);
router.put('/admin/coupons/:id', isAuthenticated, isAdmin, updateCoupon);
router.delete('/admin/coupons/:id', isAuthenticated, isAdmin, deleteCoupon);

// Public routes
router.post('/coupons/validate', validateCoupon);
router.post('/coupons/apply', isAuthenticated, applyCoupon);

export default router; 