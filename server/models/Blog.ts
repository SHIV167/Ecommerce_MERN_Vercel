import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  author: string;
  publishedAt: Date;
  summary: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
}, { timestamps: true });

export default mongoose.model<IBlog>('Blog', BlogSchema);
