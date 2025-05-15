import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  id: string;
  title: string;
  subtitle?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  alt: string;
  linkUrl?: string;
  enabled: boolean;
  position: number;
}

const BannerSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  desktopImageUrl: { type: String, required: true },
  mobileImageUrl: { type: String, required: true },
  alt: { type: String, required: true },
  linkUrl: { type: String },
  enabled: { type: Boolean, default: true },
  position: { type: Number, default: 0 }
});

export default mongoose.model<IBanner>('Banner', BannerSchema);