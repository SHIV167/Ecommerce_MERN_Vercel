import mongoose, { Schema, Document } from "mongoose";

export interface IScanner extends Document {
  data: string;
  productId?: string;
  scannedAt?: Date;
  scanCount: number;
  couponCode?: string;
}

const ScannerSchema: Schema = new Schema({
  data: { type: String, required: true },
  productId: { type: String },
  scannedAt: { type: Date },
  scanCount: { type: Number, default: 0 },
  couponCode: { type: String },
});

const ScannerModel = mongoose.model<IScanner>("Scanner", ScannerSchema);

export default ScannerModel;
