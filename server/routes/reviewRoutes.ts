import express, { Request, Response } from 'express';
import { authenticateJWT, isAdmin, AuthRequest } from '../middleware/auth';
import Review from '../models/Review';
import Product from '../models/Product';
import User from '../models/User';

const router = express.Router();

// Get all approved reviews for a product (public facing)
router.get('/products/:id/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({
      productId: req.params.id,
      status: 'approved'
    }).sort({ createdAt: -1 });

    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await User.findOne({ id: review.userId });
        const obj: any = review.toObject();
        obj.userName = user?.name || 'Anonymous Customer';
        return obj;
      })
    );

    return res.status(200).json(enrichedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Get all reviews for admin (including pending and rejected)
router.get('/admin/reviews', authenticateJWT, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const query = status ? { status } : {};

    const reviews = await Review.find(query).sort({ createdAt: -1 });

    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const product = await Product.findById(review.productId);
        const user = await User.findOne({ id: review.userId });
        const obj: any = review.toObject();
        obj.productName = product?.name || '';
        obj.userName = user?.name || 'Anonymous';
        return obj;
      })
    );

    return res.status(200).json(enrichedReviews);
  } catch (error) {
    console.error('Error fetching reviews for admin:', error);
    return res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Add a review to a product
router.post('/products/:id/reviews', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const productId = req.params.id;

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Create new review
    const review = new Review({
      userId,
      productId,
      rating,
      comment
    });

    await review.save();

    // Don't update product rating yet, as review needs approval
    // Admin will update ratings when approving reviews

    // Product rating will be updated when review is approved

    return res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ message: 'Error adding review' });
  }
});

// Delete a review
router.delete('/reviews/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is authorized to delete this review
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const productId = review.productId;
    
    // Delete the review
    await Review.findByIdAndDelete(req.params.id);
    
    // Update product rating
    const allReviews = await Review.find({ productId });
    
    if (allReviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        totalReviews: 0
      });
    } else {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      
      await Product.findByIdAndUpdate(productId, {
        rating: averageRating,
        totalReviews: allReviews.length
      });
    }
    
    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ message: 'Error deleting review' });
  }
});

// Admin routes to approve/reject reviews
router.patch('/admin/reviews/:id/status', authenticateJWT, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update review status
    review.status = status;
    await review.save();

    // If approving, update product rating with all approved reviews
    if (status === 'approved') {
      const productId = review.productId;
      const approvedReviews = await Review.find({ productId, status: 'approved' });
      
      if (approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / approvedReviews.length;
        
        await Product.findByIdAndUpdate(productId, {
          rating: averageRating,
          totalReviews: approvedReviews.length
        });
      }
    }

    return res.status(200).json({ message: `Review ${status} successfully` });
  } catch (error) {
    console.error('Error updating review status:', error);
    return res.status(500).json({ message: 'Error updating review status' });
  }
});

export default router;
