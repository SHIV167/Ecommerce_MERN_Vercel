import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/giftCardTemplateController';
import upload from '../utils/upload';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Auth middlewares (duplicate from giftCardRoutes)
const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Not authenticated' });
  }
};
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin required' });
  next();
};

// Public: get all gift card templates
router.get('/giftcards', getAllTemplates);

// Admin: manage templates
router.get('/admin/giftcard-templates', isAuthenticated, isAdmin, getAllTemplates);
router.post('/admin/giftcard-templates', isAuthenticated, isAdmin, upload.single('image'), createTemplate);
router.put('/admin/giftcard-templates/:id', isAuthenticated, isAdmin, upload.single('image'), updateTemplate);
router.delete('/admin/giftcard-templates/:id', isAuthenticated, isAdmin, deleteTemplate);

export default router;
