import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem extends Document {
  cartId: string;
  productId: string;
  quantity: number;
  isFree: boolean;
}

const CartItemSchema: Schema = new Schema({
  cartId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isFree: { type: Boolean, required: true, default: false }
});

// Ensure unique per cartId/productId/isFree
CartItemSchema.index({ cartId: 1, productId: 1, isFree: 1 }, { unique: true });

export default mongoose.model<ICartItem>('CartItem', CartItemSchema);