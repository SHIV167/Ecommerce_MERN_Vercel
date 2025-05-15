import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function BestsellerSection() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/bestsellers?limit=5'],
  });

  // Use demo products if none are returned from API
  const demoProducts: Product[] = [
    {
      _id: '101',
      name: "Kumkumadi Brightening Ayurvedic Face Scrub",
      slug: "kumkumadi-brightening-ayurvedic-face-scrub",
      description: "Gently exfoliates and improves skin radiance",
      shortDescription: "Gently Exfoliates And Improves Skin Radiance",
      price: 1895,
      discountedPrice: null,
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1566958769312-82cef41d19ef",
      rating: 4.7,
      totalReviews: 42,
      featured: true,
      bestseller: true,
      isNew: false,
      categoryId: '1',
      createdAt: new Date(),
      sku: "KUM-SCR-101",
      images: [],
    },
    {
      _id: '102',
      name: "Kumkumadi Hair Cleanser",
      slug: "kumkumadi-hair-cleanser",
      description: "Strengthens hair and reduces hair fall",
      shortDescription: "Strengthens Hair And Reduces Hair Fall",
      price: 1295,
      discountedPrice: null,
      stock: 33,
      imageUrl: "https://images.unsplash.com/photo-1599751449732-39a19320f0c2",
      rating: 4.9,
      totalReviews: 28,
      featured: true,
      bestseller: true,
      isNew: false,
      categoryId: '2',
      createdAt: new Date(),
      sku: "KUM-CLN-102",
      images: [],
    },
    {
      _id: '103',
      name: "Kumkumadi Body Cleanser",
      slug: "kumkumadi-body-cleanser",
      description: "Organic body wash with floral essence",
      shortDescription: "Organic Body Wash With Kumkumadi Essence",
      price: 1795,
      discountedPrice: null,
      stock: 18,
      imageUrl: "https://images.unsplash.com/photo-1611080541599-8c6c79cdf95f",
      rating: 4.8,
      totalReviews: 36,
      featured: true,
      bestseller: true,
      isNew: false,
      categoryId: '3',
      createdAt: new Date(),
      sku: "KUM-BDY-103",
      images: [],
    },
    {
      _id: '104',
      name: "Kumkumadi Toner",
      slug: "kumkumadi-toner",
      description: "Balances skin pH and improves texture",
      shortDescription: "Balances Skin pH And Improves Texture",
      price: 1195,
      discountedPrice: null,
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b",
      rating: 5.0,
      totalReviews: 54,
      featured: true,
      bestseller: true,
      isNew: true,
      categoryId: '1',
      createdAt: new Date(),
      sku: "KUM-TNR-104",
      images: [],
    }
  ];

  const displayProducts = products.length > 0 ? products : demoProducts;

  // Custom arrow components
  const PrevArrow = ({ onClick }: any) => (
    <button onClick={onClick} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow z-10">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
  const NextArrow = ({ onClick }: any) => (
    <button onClick={onClick} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow z-10">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl text-primary mb-3">Bestsellers</h2>
          <p className="text-neutral-gray max-w-2xl mx-auto">
            Our most popular products loved by customers for their exceptional quality and effectiveness
          </p>
        </div>
        
        {/* Slick slider */}
        <Slider {...settings} className="px-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-2 bg-white animate-pulse">
                  <div className="mb-4 w-full h-64 bg-neutral-sand"></div>
                  <div className="w-24 h-3 bg-neutral-sand mb-2"></div>
                </div>
              ))
            : displayProducts.map((product) => (
                <div key={product._id || product.slug} className="p-2">
                  <ProductCard product={product} showAddToCart />
                </div>
              ))}
        </Slider>
        
        <div className="text-center mt-12">
          <Button 
            asChild
            variant="outline"
            className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-wider py-3 px-8 font-medium text-sm transition-colors duration-300"
          >
            <Link href="/collections/bestsellers">View All Bestsellers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
