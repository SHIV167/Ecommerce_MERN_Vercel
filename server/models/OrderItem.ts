import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem extends Document {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

const OrderItemSchema: Schema = new Schema({
  orderId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

export default mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);