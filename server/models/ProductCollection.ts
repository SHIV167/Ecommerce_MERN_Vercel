import mongoose, { Schema, Document } from 'mongoose';

export interface IProductCollection extends Document {
  productId: string;
  collectionId: string;
}

const ProductCollectionSchema: Schema = new Schema({
  productId: { type: String, required: true },
  collectionId: { type: String, required: true }
});

// Compound index to ensure uniqueness of product-collection pairs
ProductCollectionSchema.index({ productId: 1, collectionId: 1 }, { unique: true });

export default mongoose.model<IProductCollection>('ProductCollection', ProductCollectionSchema);