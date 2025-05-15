import React, { useRef, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "../../../../shared/schema";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { CartContext } from "@/contexts/CartContext";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Extended Product type with our custom fields for UI display
interface ProductDisplay extends Partial<Product> {
  rating?: number;
  reviewCount?: number;
  // Using the correct property name from Product schema
  stock?: number;
}

// Sample fallback products
const sampleProducts: ProductDisplay[] = [
  {
    _id: "1",
    name: "Thyrobik Capsule - Ayurvedic Thyroid Capsule",
    price: 1990,
    imageUrl: "/images/products/thyrobik.jpg",
    rating: 4.8,
    reviewCount: 343,
    stock: 10
  },
  {
    _id: "2",
    name: "Sheepala Curtail - Best Weight Loss Capsules for Fast & Effective Results",
    price: 1499,
    imageUrl: "/images/products/curtail.jpg",
    rating: 4.6,
    reviewCount: 471,
    stock: 15
  },
  {
    _id: "3",
    name: "Diabtose+ - Ayurvedic Diabetes Management",
    price: 1699,
    imageUrl: "/images/products/diabtose.jpg",
    rating: 4.7,
    reviewCount: 298,
    stock: 8
  }
];

export default function FeaturedProductsSection() {
  const sliderRef = useRef<Slider>(null);
  const { addItem } = useContext(CartContext);
  const { data: products = [], isLoading } = useQuery<ProductDisplay[]>({
    queryKey: ['/api/products/featured?limit=4'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/products/featured?limit=4');
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Error fetching featured products:", error);
        return [];
      }
    },
  });

  const displayProducts = products.length > 0 ? products : sampleProducts;

  // Custom arrow components for the slider
  const SliderArrow = ({ className, style, onClick, isNext = false }: any) => {
    return (
      <button
        onClick={onClick}
        className={`custom-nav-arrow absolute z-20 top-1/2 transform -translate-y-1/2 ${isNext ? 'right-4' : 'left-4'} rounded-full w-12 h-12 flex items-center justify-center focus:outline-none ${className}`}
        style={{
          backgroundColor: 'rgba(85, 128, 118, 0.85)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease',
        }}
        aria-label={isNext ? 'Next slide' : 'Previous slide'}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 1)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 0.85)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        {isNext ? (
          <ChevronRight className="h-6 w-6 text-white" />
        ) : (
          <ChevronLeft className="h-6 w-6 text-white" />
        )}
      </button>
    );
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    nextArrow: <SliderArrow isNext={true} />,
    prevArrow: <SliderArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ],
    customPaging: () => (
      <div className="h-2 w-2 rounded-full bg-neutral-300 hover:bg-primary mt-4"></div>
    ),
  };

  return (
    <section className="py-12 bg-white featured-products-section">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl text-primary text-center mb-8">Featured Ayurvedic Products</h2>
        
        <div className="flex flex-col md:flex-row gap-6">          
          {/* Left side - Product slider (2/3 width on desktop) */}
          <div className="w-full md:w-2/3 relative">
            {/* Custom navigation buttons */}
            <button 
              onClick={() => sliderRef.current?.slickPrev()}
              className="custom-nav-arrow absolute z-20 top-1/2 transform -translate-y-1/2 left-4 rounded-full w-12 h-12 flex items-center justify-center focus:outline-none"
              style={{
                backgroundColor: 'rgba(85, 128, 118, 0.85)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease',
              }}
              aria-label="Previous slide"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 1)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 0.85)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button 
              onClick={() => sliderRef.current?.slickNext()}
              className="custom-nav-arrow absolute z-20 top-1/2 transform -translate-y-1/2 right-4 rounded-full w-12 h-12 flex items-center justify-center focus:outline-none"
              style={{
                backgroundColor: 'rgba(85, 128, 118, 0.85)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease',
              }}
              aria-label="Next slide"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 1)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 0.85)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            {isLoading ? (
              // Skeleton loading state
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="w-full p-4 border border-neutral-sand rounded-lg animate-pulse">
                    <div className="w-full h-48 bg-neutral-sand mb-4 rounded"></div>
                    <div className="h-4 bg-neutral-sand rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-neutral-sand rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-neutral-sand rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 relative">
                <Slider ref={sliderRef} {...sliderSettings}>
                  {displayProducts.map((product) => (
                    <div key={product._id} className="px-2">
                      <div className="border border-neutral-sand rounded-lg hover:shadow-md transition-shadow p-4">
                        <Link href={`/products/${product.slug || product._id}`}>
                          <div className="w-full h-48 mb-4 relative">
                            <img 
                              src={product.imageUrl || '/images/placeholder-product.jpg'} 
                              alt={product.name} 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                        </Link>
                        
                        <Link href={`/products/${product.slug || product._id}`} className="block">
                          <h3 className="text-lg font-medium text-primary mb-1 hover:text-secondary transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg 
                              key={i}
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-neutral-sand'}`} 
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-sm text-neutral-gray ml-1">{product.reviewCount || 0}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-medium text-primary">
                            {formatCurrency(product.price || 0)}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              if (product._id) {
                                addItem({ 
                                  _id: product._id, 
                                  name: product.name || '', 
                                  price: product.price || 0,
                                  imageUrl: product.imageUrl || '',
                                  sku: product.sku || '',
                                  description: product.description || '',
                                  stock: product.stock || 0,
                                  slug: product.slug || '',
                                  categoryId: product.categoryId || '',
                                  images: product.images || []
                                });
                              }
                            }}
                            className="px-3 py-2 bg-primary hover:bg-primary-light text-white rounded-md text-sm transition-colors"
                            disabled={!(product.stock && product.stock > 0)}
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            )}
          </div>
          
          {/* Right side - Banner (1/3 width on desktop) */}
          <div className="w-full md:w-1/3 mt-6 md:mt-0">
            <div className="h-full rounded-lg overflow-hidden border border-neutral-sand">
              <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-4">AYURVEDIC<br />GOODNESS</h3>
                  <p className="text-lg text-primary uppercase mb-6">FOR YOUR HEALTH</p>
                  <img 
                    src="/uploads/sections/New_Kama_is_Kind_page_1.png" 
                    alt="Ayurvedic Products Collection" 
                    className="max-w-full h-auto rounded-md shadow-sm" 
                  />
                  <Link href="/collections/ayurvedic-essentials" className="mt-6 inline-block px-6 py-2 bg-primary hover:bg-primary-light text-white rounded-md transition-colors">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dot indicators for mobile */}
        <div className="flex justify-center mt-4 md:hidden">
          <span className="h-2 w-2 rounded-full bg-primary mx-1"></span>
          <span className="h-2 w-2 rounded-full bg-gray-300 mx-1"></span>
          <span className="h-2 w-2 rounded-full bg-gray-300 mx-1"></span>
        </div>
      </div>
    </section>
  );
}