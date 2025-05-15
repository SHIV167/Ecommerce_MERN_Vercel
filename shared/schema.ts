import { z } from "zod";

// Product Zod schema and TypeScript type
export const productSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId as string
  sku: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string().optional(),
  price: z.number(),
  discountedPrice: z.number().optional().nullable(),
  imageUrl: z.string(),
  stock: z.number(),
  rating: z.number().optional(),
  totalReviews: z.number().optional(),
  slug: z.string(),
  categoryId: z.string(), // MongoDB ObjectId as string
  featured: z.boolean().optional(),
  bestseller: z.boolean().optional(),
  isNew: z.boolean().optional(),
  createdAt: z.date().optional(),
  images: z.array(z.string()).optional().default([]),
  videoUrl: z.string().optional(),
  minOrderValue: z.number().optional(), // For free products
  isFreeProduct: z.boolean().optional(), // Flag for free products
});
export type Product = z.infer<typeof productSchema>;

// InsertProduct type omits id, _id, and createdAt for creation
export type InsertProduct = Omit<Product, 'id' | '_id' | 'createdAt'>;

// User types
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: Date;
};
export type InsertUser = Omit<User, 'id' | '_id' | 'createdAt' | 'isAdmin'>;

// Order types
export type Order = {
  id?: string;
  userId: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  couponCode?: string | null;
  discountAmount?: number;
  packageLength?: number;
  packageBreadth?: number;
  packageHeight?: number;
  packageWeight?: number;
  createdAt: Date;
};
export type InsertOrder = Omit<Order, 'id' | '_id' | 'createdAt'>;

// OrderItem types
export type OrderItem = {
  id?: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
};
export type InsertOrderItem = Omit<OrderItem, 'id' | '_id'>;

// Review types
export type Review = {
  _id?: string;
  id?: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  userName?: string;
};
export type InsertReview = Omit<Review, 'id' | '_id' | 'createdAt'>;

// Testimonial types
export type Testimonial = {
  id?: string;
  name: string;
  content: string;
  rating: number;
  featured: boolean;
  createdAt: Date;
};
export type InsertTestimonial = Omit<Testimonial, 'id' | '_id' | 'createdAt'>;

// Cart types
export type Cart = {
  id?: string;
  userId?: string;
  sessionId?: string;
  createdAt: Date;
};
export type InsertCart = Omit<Cart, 'id' | '_id' | 'createdAt'>;

// CartItem types
export type CartItem = {
  id?: string;
  cartId: string;
  productId: string;
  quantity: number;
  isFree: boolean;
};
export type InsertCartItem = Omit<CartItem, 'id' | '_id'>;

// Banner types
export type Banner = {
  id?: string;
  title: string;
  subtitle?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  alt: string;
  linkUrl?: string;
  enabled: boolean;
  position: number;
};
export type InsertBanner = Omit<Banner, 'id' | '_id'>;

// Category Zod schema and TypeScript type
export const categorySchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  imageUrl: z.string().optional(),
  desktopImageUrl: z.string().url().optional(),
  mobileImageUrl: z.string().url().optional(),
  featured: z.boolean().optional(),
});
export type Category = z.infer<typeof categorySchema>;

// InsertCategory type for creating categories
export type InsertCategory = Omit<Category, 'id' | '_id'>;

// Collection Zod schema and TypeScript type
export const collectionSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  imageUrl: z.string().optional(),
  desktopImageUrl: z.string().optional(),
  mobileImageUrl: z.string().optional(),
  featured: z.boolean().optional(),
});
export type Collection = z.infer<typeof collectionSchema>;
export type InsertCollection = Omit<Collection, 'id' | '_id'>;

// ProductCollection join Zod schema and TypeScript type
export const productCollectionSchema = z.object({
  _id: z.string().optional(),
  productId: z.string(),
  collectionId: z.string(),
});
export type ProductCollection = z.infer<typeof productCollectionSchema>;

// InsertProductCollection type for creating product-collection mappings
export type InsertProductCollection = Omit<ProductCollection, 'id' | '_id'>;

// Scanner types
export type Scanner = {
  id?: string;
  data: string;
  productId?: string;
  scannedAt: Date;
};
export type InsertScanner = Omit<Scanner, 'id' | 'scannedAt'>;
