import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extended request interface with user property
export interface AuthRequest extends Request {
  user?: any;
}

// Authentication middleware
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin role check middleware
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
