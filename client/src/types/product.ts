export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number | null;
  stock: number;
  imageUrl?: string;
  videoUrl?: string;
  [key: string]: any;
}
