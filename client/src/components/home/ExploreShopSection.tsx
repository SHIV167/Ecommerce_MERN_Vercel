import React, { useRef, useContext } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { Link } from "wouter";
import { CartContext } from '@/contexts/CartContext';
import { Product } from '../../../../shared/schema';
import 'swiper/css';

// Sample products data - replace with API call in production
// Include all required fields according to the Product schema
const exploreProducts = [
  {
    _id: "1",
    name: "Sheopal's Diabdev: Herbal Diabetes Care",
    description: "Natural herbal remedy for diabetes management",
    sku: "DIABDEV-001",
    price: 1990,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3",
    stock: 100,
    rating: 4.8,
    totalReviews: 2856,
    slug: "sheopals-diabdev",
    categoryId: "herb123",
    images: [],
  },
  {
    _id: "2",
    name: "LiverX Factor: Detox Your Liver",
    description: "Complete liver detox and cleansing supplement",
    sku: "LIVERX-001",
    price: 949,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3",
    stock: 85,
    rating: 4.6,
    totalReviews: 1098,
    slug: "liverx-factor",
    categoryId: "detox123",
    images: [],
  },
  {
    _id: "3",
    name: "LiverX Factor: Detox Your Liver Plus",
    description: "Advanced liver detox and cleansing formula",
    sku: "LIVERX-002",
    price: 949,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3",
    stock: 70,
    rating: 4.7,
    totalReviews: 1050,
    slug: "liverx-factor-plus",
    categoryId: "detox123",
    images: [],
  },
  {
    _id: "4",
    name: "Diabiose: With goodness of herbs",
    description: "Herbal supplement for blood sugar management",
    sku: "DIABIOSE-001",
    price: 949,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3",
    stock: 120,
    rating: 4.5,
    totalReviews: 1249,
    slug: "diabiose",
    categoryId: "herb123",
    images: [],
  },
  {
    _id: "5",
    name: "LiverX Factor: Detox Your Liver Pro",
    description: "Professional-grade liver detoxification formula",
    sku: "LIVERX-003",
    price: 949,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3",
    stock: 55,
    rating: 4.8,
    totalReviews: 1590,
    slug: "liverx-factor-pro",
    categoryId: "detox123",
    images: [],
  }
];

export default function ExploreShopSection() {
  const swiperRef = useRef<any>(null);
  const { addItem } = useContext(CartContext);

  const handleAddToCart = async (product: Product) => {
    try {
      // Pass the product directly as it already has all required fields
      await addItem(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <section className="py-12 bg-white explore-shop-section">
      <div className="container mx-auto px-4 relative">
        {/* Custom navigation buttons positioned at absolute edges */}
        <button 
          onClick={() => swiperRef.current?.slidePrev()}
          className="custom-nav-arrow absolute top-0 left-0 rounded-full w-10 h-10 flex items-center justify-center z-10 focus:outline-none"
          style={{
            backgroundColor: 'rgba(85, 128, 118, 0.85)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
          }}
          aria-label="Previous products"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 0.85)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button 
          onClick={() => swiperRef.current?.slideNext()}
          className="custom-nav-arrow absolute top-0 right-0 rounded-full w-10 h-10 flex items-center justify-center z-10 focus:outline-none"
          style={{
            backgroundColor: 'rgba(85, 128, 118, 0.85)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
          }}
          aria-label="Next products"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(85, 128, 118, 0.85)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        <h2 className="font-heading text-2xl text-primary text-center mb-8">Watch & Shop</h2>
        
        <Swiper
          spaceBetween={24}
          slidesPerView={1.1}
          centeredSlides={false}
          breakpoints={{
            640: { slidesPerView: 2.05, spaceBetween: 24 },
            768: { slidesPerView: 3.05, spaceBetween: 24 },
            1024: { slidesPerView: 4.05, spaceBetween: 24 },
            1280: { slidesPerView: 5.05, spaceBetween: 24 },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          modules={[Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="explore-shop-swiper pb-8"
        >
          {exploreProducts.map((product) => (
            <SwiperSlide key={product._id} className="h-auto">
              <div className="flex flex-col rounded-lg overflow-hidden h-full">
                {/* Product image with video placeholder */}
                <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] bg-neutral-100 overflow-hidden group">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Wishlist and share buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button 
                      className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <button 
                      className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                      aria-label="Share product"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </Link>

                {/* Product info */}
                <div className="px-1 py-2">
                  <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-primary transition-colors">
                    {product.name}
                  </Link>
                  
                  {/* Rating */}
                  <div className="flex items-center my-1">
                    <span className="text-xs text-gray-600">★ {product.rating?.toFixed(1) || '4.5'}</span>
                    <span className="text-[10px] text-gray-400 ml-1">({product.totalReviews || 0})</span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="font-bold text-gray-900">₹ {product.price}</span>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary/90 transition-colors"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
