import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  // Password reset fields
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Store reset token and expiry
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  phone: { type: String },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);