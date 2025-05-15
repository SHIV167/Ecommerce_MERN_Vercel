import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingPincode?: string;
  shippingIsBilling?: boolean;
  billingCustomerName?: string;
  billingLastName?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPincode?: string;
  billingEmail?: string;
  billingPhone?: string;
  packageLength?: number;
  packageBreadth?: number;
  packageHeight?: number;
  packageWeight?: number;
  shiprocketOrderId?: string;
  paymentMethod: string;
  paymentStatus: string;
  couponCode: string | null;
  discountAmount: number;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: String, required: true },
  status: { type: String, required: true, default: 'pending' },
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  shippingCity: { type: String },
  shippingState: { type: String },
  shippingCountry: { type: String },
  shippingPincode: { type: String },
  shippingIsBilling: { type: Boolean, default: true },
  billingCustomerName: { type: String },
  billingLastName: { type: String },
  billingAddress: { type: String },
  billingCity: { type: String },
  billingState: { type: String },
  billingCountry: { type: String },
  billingPincode: { type: String },
  billingEmail: { type: String },
  billingPhone: { type: String },
  packageLength: { type: Number },
  packageBreadth: { type: Number },
  packageHeight: { type: Number },
  packageWeight: { type: Number },
  shiprocketOrderId: { type: String },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, required: true, default: 'pending' },
  couponCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>('Order', OrderSchema);