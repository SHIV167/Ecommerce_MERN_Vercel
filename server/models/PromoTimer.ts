import mongoose, { Schema, Document } from 'mongoose';

export interface IPromoTimer extends Document {
  productId: string; // Reference to Product._id or slug
  endTime: Date;
  enabled: boolean;
}

const PromoTimerSchema: Schema = new Schema({
  productId: { type: String, required: true },
  endTime: { type: Date, required: true },
  enabled: { type: Boolean, default: true },
});

export default mongoose.model<IPromoTimer>('PromoTimer', PromoTimerSchema);
