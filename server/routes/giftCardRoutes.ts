import express, { Request, Response, NextFunction, Router } from 'express';
import { getAllGiftCards, getGiftCardById, createGiftCard, updateGiftCard, deleteGiftCard } from '../controllers/giftCardController';
import jwt from 'jsonwebtoken';
import upload from '../utils/upload';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

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
router.get('/admin/giftcards', isAuthenticated, isAdmin, getAllGiftCards);
router.get('/admin/giftcards/:id', isAuthenticated, isAdmin, getGiftCardById);
router.post('/admin/giftcards', isAuthenticated, isAdmin, upload.single('image'), createGiftCard);
router.put('/admin/giftcards/:id', isAuthenticated, isAdmin, upload.single('image'), updateGiftCard);
router.delete('/admin/giftcards/:id', isAuthenticated, isAdmin, deleteGiftCard);

export default router;
