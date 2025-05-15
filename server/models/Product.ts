import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  imageUrl: string;
  stock: number;
  rating?: number;
  totalReviews?: number;
  slug: string;
  categoryId: string;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  createdAt: Date;
  images: string[];
  videoUrl: string;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  imageUrl: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  slug: { type: String, required: true, unique: true },
  categoryId: { type: String, required: true },
  featured: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  images: { type: [String], default: [] },
  videoUrl: { type: String, default: '' },
});

export default mongoose.model<IProduct>('Product', ProductSchema);