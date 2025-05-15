import mongoose, { Schema, Document } from 'mongoose';

export interface IGiftCard extends Document {
  code: string;
  initialAmount: number;
  balance: number;
  expiryDate: Date;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GiftCardSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    initialAmount: { type: Number, required: true, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IGiftCard>('GiftCard', GiftCardSchema);
