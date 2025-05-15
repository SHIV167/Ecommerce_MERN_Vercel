import { Request, Response } from 'express';
import Coupon from '../models/Coupon';

// Get all coupons
export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({ message: 'Error fetching coupons', error });
  }
};

// Get coupon by ID
export const getCouponById = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    return res.status(200).json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return res.status(500).json({ message: 'Error fetching coupon', error });
  }
};

// Create new coupon
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      description,
      discountAmount,
      discountType,
      minimumCartValue,
      maxUses,
      startDate,
      endDate,
      isActive
    } = req.body;

    // Validate coupon code (unique)
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Validate discount amount
    if (discountType === 'percentage' && (discountAmount <= 0 || discountAmount > 100)) {
      return res.status(400).json({ message: 'Percentage discount must be between 1 and 100' });
    }

    if (discountType === 'fixed' && discountAmount <= 0) {
      return res.status(400).json({ message: 'Fixed discount must be greater than 0' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountAmount,
      discountType,
      minimumCartValue: minimumCartValue || 0,
      maxUses: maxUses || -1,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      usedCount: 0
    });

    await newCoupon.save();
    return res.status(201).json(newCoupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(500).json({ message: 'Error creating coupon', error });
  }
};

// Update coupon
export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      description,
      discountAmount,
      discountType,
      minimumCartValue,
      maxUses,
      startDate,
      endDate,
      isActive
    } = req.body;

    // Check if the coupon exists
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // If code is being changed, check for uniqueness
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }

    // Validate discount amount
    if (discountType === 'percentage' && (discountAmount <= 0 || discountAmount > 100)) {
      return res.status(400).json({ message: 'Percentage discount must be between 1 and 100' });
    }

    if (discountType === 'fixed' && discountAmount <= 0) {
      return res.status(400).json({ message: 'Fixed discount must be greater than 0' });
    }

    // Validate dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        ...(code && { code: code.toUpperCase() }),
        ...(description && { description }),
        ...(discountAmount && { discountAmount }),
        ...(discountType && { discountType }),
        ...(minimumCartValue !== undefined && { minimumCartValue }),
        ...(maxUses !== undefined && { maxUses }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true }
    );

    return res.status(200).json(updatedCoupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    return res.status(500).json({ message: 'Error updating coupon', error });
  }
};

// Delete coupon
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    return res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return res.status(500).json({ message: 'Error deleting coupon', error });
  }
};

// Validate coupon for a user
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    console.log('Received request to validate coupon:', req.body);
    const { code, cartValue } = req.body;
    
    if (!code) {
      console.log('No coupon code provided');
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      console.log('Coupon not found:', code);
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      console.log('Coupon is inactive:', code);
      return res.status(400).json({ message: 'This coupon is inactive' });
    }

    // Check dates
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      console.log('Coupon is not active within the given dates:', code);
      return res.status(400).json({ message: 'This coupon has expired or is not yet active' });
    }

    // Check usage limit
    if (coupon.maxUses !== -1 && coupon.usedCount >= coupon.maxUses) {
      console.log('Coupon has reached its usage limit:', code);
      return res.status(400).json({ message: 'This coupon has reached its usage limit' });
    }

    // Check minimum cart value
    if (cartValue < coupon.minimumCartValue) {
      console.log('Minimum cart value not met:', code);
      return res.status(400).json({ 
        message: `Minimum cart value of ${coupon.minimumCartValue} required for this coupon`,
        minimumCartValue: coupon.minimumCartValue
      });
    }

    // Calculate discount
    let discountValue = 0;
    if (coupon.discountType === 'percentage') {
      discountValue = (cartValue * coupon.discountAmount) / 100;
    } else {
      discountValue = coupon.discountAmount;
    }

    console.log('Coupon is valid:', code);
    return res.status(200).json({
      valid: true,
      coupon,
      discountValue,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(500).json({ message: 'Error validating coupon', error });
  }
};

// Apply coupon - increment usage counter
export const applyCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Increment used count
    coupon.usedCount += 1;
    await coupon.save();

    return res.status(200).json({ 
      message: 'Coupon applied successfully',
      coupon
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    return res.status(500).json({ message: 'Error applying coupon', error });
  }
}; 