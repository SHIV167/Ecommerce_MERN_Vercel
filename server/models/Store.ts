import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  latitude: number;
  longitude: number;
  email: string;
  website: string;
  hours: string;
  type: 'Standalone' | 'Mall' | 'Partner';
  notes: string;
  isActive: boolean;
}

const StoreSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  phone: { type: String, required: false, match: [/^\+?[0-9\-\s]{7,20}$/, 'Invalid phone number'] },
  email: { type: String, required: false, match: [/.+@.+\..+/, 'Invalid email'] },
  website: { type: String, required: false },
  hours: { type: String, required: false },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  type: { type: String, enum: ['Standalone', 'Mall', 'Partner'], default: 'Standalone' },
  notes: { type: String, required: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IStore>('Store', StoreSchema);
