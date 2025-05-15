import mongoose, { Schema, Document } from 'mongoose';

export interface IGiftCardTemplate extends Document {
  initialAmount: number;
  expiryDate: Date;
  isActive: boolean;
  imageUrl?: string;     // URL for template image
  createdAt: Date;
  updatedAt: Date;
}

const GiftCardTemplateSchema: Schema = new Schema(
  {
    initialAmount: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    imageUrl: { type: String, default: '' },  // store image path
  },
  { timestamps: true }
);

export default mongoose.model<IGiftCardTemplate>('GiftCardTemplate', GiftCardTemplateSchema);
