import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Product, Category as CategoryType } from '@shared/schema';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Helmet } from 'react-helmet';
import HeaderBanner from '@/components/layout/HeaderBanner';

export default function CategoryPage() {
  const { slug } = useParams();
  if (!slug) return null;

  const [sortBy, setSortBy] = useState('featured');

  const { data: category, isLoading: catLoading } = useQuery<CategoryType>({
    queryKey: [`/api/categories/${slug}`],
    enabled: !!slug,
  });

  const productsQuery = useQuery<Product[]>({
    queryKey: ['products', category?._id],
    queryFn: async () => {
      const res = await fetch(`/api/products?categoryId=${category?._id}`);
      const json = await res.json();
      // API returns { products, total, ... }
      return (json.products ?? json.data ?? []) as Product[];
    },
    enabled: Boolean(category?._id),
  });
  const products = productsQuery.data ?? [];
  const productsLoading = productsQuery.isLoading;

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'rating': return (b.rating ?? 0) - (a.rating ?? 0);
      default:
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
    }
  });

  const isLoading = catLoading || productsLoading;

  if (isLoading) return <div>Loading...</div>;
  if (!category) return <div>Category not found</div>;

  return (
    <>
      <Helmet>
        <title>{category.name} | Shop</title>
        <meta name="description" content={category.description || ''} />
      </Helmet>
      <HeaderBanner slug={slug} />
      <div className="bg-neutral-cream py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl md:text-4xl text-primary mb-4">{category.name}</h1>
          {category.description && <p className="text-neutral-gray max-w-2xl mx-auto">{category.description}</p>}
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <p className="text-neutral-gray mb-4 md:mb-0">{sortedProducts.length} products</p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price, low to high</SelectItem>
              <SelectItem value="price-high">Price, high to low</SelectItem>
              <SelectItem value="name-asc">Name, A-Z</SelectItem>
              <SelectItem value="name-desc">Name, Z-A</SelectItem>
              <SelectItem value="rating">Best Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map(product => (
            <ProductCard key={product._id!} product={product} showAddToCart />
          ))}
        </div>
      </div>
    </>
  );
}
