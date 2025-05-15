import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  featured: boolean;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  imageUrl: { type: String },
  featured: { type: Boolean, default: false },
  desktopImageUrl: { type: String },
  mobileImageUrl: { type: String },
});

export default mongoose.model<ICategory>('Category', CategorySchema);