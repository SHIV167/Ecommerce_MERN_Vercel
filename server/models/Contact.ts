import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  country: string;
  mobile: string;
  comments: string;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  mobile: { type: String, required: true },
  comments: { type: String, required: true },
}, { timestamps: { createdAt: 'createdAt' } });

export default mongoose.model<IContact>('Contact', ContactSchema);
