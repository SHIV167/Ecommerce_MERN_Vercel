import mongoose, { Schema, Document } from "mongoose";

export interface IFreeProduct extends Document {
  productId: string;
  minOrderValue: number;
  createdAt: Date;
}

const FreeProductSchema: Schema = new Schema({
  productId: { type: String, required: true, unique: true },
  minOrderValue: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFreeProduct>("FreeProduct", FreeProductSchema);
