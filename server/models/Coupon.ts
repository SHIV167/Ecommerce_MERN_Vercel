import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  minimumCartValue: number;
  maxUses: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountAmount: { type: Number, required: true, min: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    minimumCartValue: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, default: -1 }, // -1 means unlimited
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICoupon>('Coupon', CouponSchema); 