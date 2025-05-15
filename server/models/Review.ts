import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Ensure one review per user per product
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);