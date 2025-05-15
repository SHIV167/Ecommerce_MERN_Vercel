import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  getAllTestimonials,
  getFeaturedTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonialController';

const router = express.Router();

// Public routes
router.get('/testimonials', getAllTestimonials);
router.get('/testimonials/featured', getFeaturedTestimonials);
router.get('/testimonials/:id', getTestimonialById);

// Authentication middleware
enum MiddlewareResult { Continue }
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

const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!(req as any).user?.isAdmin) {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
    return;
  }
  next();
};

// Admin routes
router.post('/admin/testimonials', isAuthenticated, isAdmin, createTestimonial);
router.put('/admin/testimonials/:id', isAuthenticated, isAdmin, updateTestimonial);
router.delete('/admin/testimonials/:id', isAuthenticated, isAdmin, deleteTestimonial);

export default router;
