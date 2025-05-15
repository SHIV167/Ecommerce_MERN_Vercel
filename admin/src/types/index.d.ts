export {};

declare module '@/types/mongo' {
  // @ts-ignore: suppress shared schema import resolution error
  import type { Product, Category, Collection } from "../../../shared/schema";

  // MongoDB adds _id in addition to our schema's id field
  export interface MongoProduct extends Omit<Product, 'id'> {
    _id?: string | number;
    id?: number;
  }

  export interface MongoCategory extends Omit<Category, 'id'> {
    _id?: string | number;
    id?: number;
  }

  export interface MongoCollection extends Omit<Collection, 'id'> {
    _id?: string | number;
    id?: number;
  }

  // Contact submissions
  export interface Contact {
    _id: string;
    name: string;
    email: string;
    country: string;
    mobile: string;
    comments: string;
    createdAt: string;
  }
}

declare module '@/types' {
  export interface Blog {
    _id: string;
    title: string;
    slug: string;
    author: string;
    publishedAt: string;
    summary: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface Contact {
    _id: string;
    name: string;
    email: string;
    country: string;
    mobile: string;
    comments: string;
    createdAt: string;
  }
}