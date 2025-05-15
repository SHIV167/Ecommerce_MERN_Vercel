import { useQuery } from "@tanstack/react-query";
import { Product, Category, Collection } from "@shared/schema";

interface UseProductsOptions {
  limit?: number;
  categoryId?: number;
  collectionId?: number;
  featured?: boolean;
  bestsellers?: boolean;
  newArrivals?: boolean;
}

export const useProducts = ({
  limit,
  categoryId,
  collectionId,
  featured = false,
  bestsellers = false,
  newArrivals = false,
}: UseProductsOptions = {}) => {
  let queryKey: (string | number)[] = ['/api/products'];
  let queryUrl = '/api/products';
  
  // Handle special product types
  if (featured) {
    queryKey = ['/api/products/featured'];
    queryUrl = '/api/products/featured';
  } else if (bestsellers) {
    queryKey = ['/api/products/bestsellers'];
    queryUrl = '/api/products/bestsellers';
  } else if (newArrivals) {
    queryKey = ['/api/products/new'];
    queryUrl = '/api/products/new';
  }
  
  // Add parameters to the query
  const params = new URLSearchParams();
  if (limit) {
    params.append('limit', limit.toString());
    queryKey.push('limit', limit);
  }
  if (categoryId) {
    params.append('categoryId', categoryId.toString());
    queryKey.push('categoryId', categoryId);
  }
  if (collectionId) {
    params.append('collectionId', collectionId.toString());
    queryKey.push('collectionId', collectionId);
  }
  
  const paramString = params.toString();
  if (paramString) {
    queryUrl += `?${paramString}`;
  }
  
  return useQuery<Product[]>({
    queryKey,
  });
};

export const useProduct = (slug: string) => {
  return useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
  });
};

export const useCategories = (featuredOnly: boolean = false) => {
  const queryKey = featuredOnly 
    ? ['/api/categories/featured'] 
    : ['/api/categories'];
  
  return useQuery<Category[]>({
    queryKey,
  });
};

export const useCollections = (featuredOnly: boolean = false) => {
  const queryKey = featuredOnly 
    ? ['/api/collections/featured'] 
    : ['/api/collections'];
  
  return useQuery<Collection[]>({
    queryKey,
  });
};

export const useCollection = (slug: string) => {
  return useQuery<Collection>({
    queryKey: [`/api/collections/${slug}`],
  });
};

export const useCollectionProducts = (slug: string) => {
  return useQuery<Product[]>({
    queryKey: [`/api/collections/${slug}/products`],
    enabled: !!slug,
  });
};
