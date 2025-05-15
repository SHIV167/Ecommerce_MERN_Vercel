import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Collection } from "@shared/schema";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Helmet } from 'react-helmet';
import CollectionBanner from '@/components/layout/CollectionBanner';
import GreenBoxSlider from '@/components/home/GreenBoxSlider';

export default function CollectionPage() {
  const { slug } = useParams();
  
  if (!slug) return null;

  const [sortBy, setSortBy] = useState("featured");
  
  const specialSlugs = ["featured", "bestsellers", "new"];
  const isSpecial = specialSlugs.includes(slug);
  
  const { data: collection, isLoading: collectionLoading } = !isSpecial
    ? useQuery<Collection>({
        queryKey: [`/api/collections/${slug}`],
        enabled: !!slug,
      })
    : { data: undefined, isLoading: false as boolean };
  
  const productsQuery = isSpecial
    ? useQuery<Product[]>({
        queryKey: [`/api/products/${slug}`],
        queryFn: async () => {
          const res = await fetch(`/api/products/${slug}`);
          const json = await res.json();
          return (json.data ?? json) as Product[];
        },
        enabled: !!slug,
        staleTime: 0,
        refetchOnMount: true,
      })
    : useQuery<Product[]>({
        queryKey: [`/api/collections/${slug}/products`],
        queryFn: async () => {
          const res = await fetch(`/api/collections/${slug}/products`);
          const json = await res.json();
          return (json.data ?? json) as Product[];
        },
        enabled: !!slug,
        staleTime: 0,
        refetchOnMount: true,
      });
  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const productsLoading = productsQuery.isLoading;
  
  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      default:
        // featured - show featured products first, then bestsellers, then new
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (a.bestseller && !b.bestseller) return -1;
        if (!a.bestseller && b.bestseller) return 1;
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
    }
  });
  
  const isLoading = collectionLoading || productsLoading;
  
  useEffect(() => {
    async function fetchPromoTimers() {
      const res = await fetch("/api/promotimers");
      const timers = await res.json();
      (window as any).PROMO_TIMERS = timers;
    }
    fetchPromoTimers();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse h-10 w-1/3 bg-neutral-sand mb-6"></div>
        <div className="animate-pulse h-6 w-2/3 bg-neutral-sand mb-12"></div>
        
        <div className="flex justify-between items-center mb-8">
          <div className="animate-pulse h-6 w-32 bg-neutral-sand"></div>
          <div className="animate-pulse h-10 w-48 bg-neutral-sand"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border border-neutral-sand p-6 animate-pulse">
              <div className="mb-4 w-full h-64 bg-neutral-sand"></div>
              <div className="w-24 h-3 bg-neutral-sand mb-2"></div>
              <div className="w-full h-5 bg-neutral-sand mb-1"></div>
              <div className="w-3/4 h-4 bg-neutral-sand mb-3"></div>
              <div className="w-16 h-4 bg-neutral-sand"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!collection && !isSpecial) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-heading text-primary mb-4">Collection Not Found</h1>
        <p className="text-neutral-gray mb-8">Sorry, the collection you're looking for could not be found.</p>
        <Button className="bg-primary hover:bg-primary-light text-white">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isSpecial
            ? slug.charAt(0).toUpperCase() + slug.slice(1)
            : collection?.name} {"|"} Kama Ayurveda
        </title>
        <meta
          name="description"
          content={
            isSpecial
              ? `Explore our ${slug} products.`
              : collection?.description ||
                `Explore our ${collection?.name} collection of premium Ayurvedic beauty products.`
          }
        />
      </Helmet>
      <CollectionBanner slug={slug!} />
      
      <div className="bg-neutral-cream py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl md:text-4xl text-primary mb-4">
            {isSpecial
              ? slug.charAt(0).toUpperCase() + slug.slice(1)
              : collection?.name}
          </h1>
          {collection?.description && (
            <p className="text-neutral-gray max-w-2xl mx-auto">{collection.description}</p>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <p className="text-neutral-gray mb-4 md:mb-0">{sortedProducts.length} products</p>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
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
        
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product._id!} product={product} showAddToCart />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-gray mb-6">No products found in this collection.</p>
            <Button className="bg-primary hover:bg-primary-light text-white">
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
      <GreenBoxSlider />
    </>
  );
}
