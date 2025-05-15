import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  featured: boolean;
}

const CollectionSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  imageUrl: { type: String },
  desktopImageUrl: { type: String },
  mobileImageUrl: { type: String },
  featured: { type: Boolean, default: false }
});

export default mongoose.model<ICollection>('Collection', CollectionSchema);