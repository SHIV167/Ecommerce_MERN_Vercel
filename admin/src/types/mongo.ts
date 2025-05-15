import { Product, Category, Collection } from "@shared/schema";

// MongoDB adds _id in addition to our schema's id field
export interface MongoProduct extends Omit<Product, 'id'> {
  _id?: string;
  id?: number;
  // Link to collection
  collectionId?: string | number;
}

export interface MongoCategory extends Omit<Category, 'id'> {
  _id?: string;
  id?: number;
}

export interface MongoCollection extends Omit<Collection, 'id'> {
  _id?: string;
  id?: number;
} 