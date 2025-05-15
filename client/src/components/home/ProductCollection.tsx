import { useState, useRef } from "react";
import { Link } from "wouter";
import ProductCard from "@/components/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { Product, Collection } from "@shared/schema";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface ProductCollectionProps {
  collectionSlug: string;
  title?: string;
  slider?: boolean;
}

export default function ProductCollection({ collectionSlug, title, slider = false }: ProductCollectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: collection } = useQuery<Collection>({
    queryKey: [`/api/collections/${collectionSlug}`],
  });
  
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: [`/api/collections/${collectionSlug}/products`],
  });

  // Define demo product data - used only when API returns no results
  const demoProducts: Product[] = [
    {
      _id: '1',
      name: "Kumkumadi Youth-Clarifying Mask-Scrub",
      slug: "kumkumadi-youth-clarifying-mask-scrub",
      description: "Gently cleanses and clears skin while enhancing radiance",
      shortDescription: "Gently Cleanses And Clears Skin",
      price: 3695,
      discountedPrice: null,
      stock: 10,
      imageUrl: "https://images.unsplash.com/photo-1621172944995-91b4f95e6e44",
      rating: 4.8,
      totalReviews: 18,
      featured: true,
      bestseller: true,
      isNew: false,
      categoryId: '1',
      createdAt: new Date(),
      sku: "KUM-MAS-001",
      images: []
    },
    {
      _id: '2',
      name: "Kumkumadi Youth-Illuminating Silky Serum",
      slug: "kumkumadi-youth-illuminating-silky-serum",
      description: "The botanical alternative to vitamin C",
      shortDescription: "The Botanical Alternative To Vitamin C",
      price: 2695,
      discountedPrice: null,
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1610705267928-1b9f2fa7f1c5",
      rating: 5.0,
      totalReviews: 7,
      featured: true,
      bestseller: true,
      isNew: true,
      categoryId: '1',
      createdAt: new Date(),
      sku: "KUM-SER-002",
      images: []
    },
    {
      _id: '3',
      name: "Kumkumadi Glow Discovery Set",
      slug: "kumkumadi-glow-discovery-set",
      description: "Glow trio powered with saffron",
      shortDescription: "Glow Trio | Powered With Saffron",
      price: 4250,
      discountedPrice: null,
      stock: 8,
      imageUrl: "https://images.unsplash.com/photo-1598662972299-5408ddb9a0ce",
      rating: 4.9,
      totalReviews: 12,
      featured: true,
      bestseller: true,
      isNew: false,
      categoryId: '1',
      createdAt: new Date(),
      sku: "KUM-SET-003",
      images: []
    },
    {
      _id: '4',
      name: "Kumkumadi Brightening Face Oil",
      slug: "kumkumadi-brightening-face-oil",
      description: "Luxurious Ayurvedic facial oil for brightening",
      shortDescription: "Luxurious Ayurvedic facial oil for brightening",
      price: 1995,
      discountedPrice: null,
      stock: 12,
      imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
      rating: 4.7,
      totalReviews: 156,
      featured: true,
      bestseller: true,
      isNew: false,
      categoryId: '1',
      createdAt: new Date(),
      sku: "KUM-OIL-004",
      images: []
    }
  ];

  const productsToDisplay = products.length > 0 ? products : demoProducts;
  const productsPerPage = 3;
  const totalPages = Math.ceil(productsToDisplay.length / productsPerPage);
  
  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const displayProducts = productsToDisplay.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );
  
  const collectionTitle = title || collection?.name || "Kumkumadi Collection";

  // Custom arrows (copied from NewLaunchSection for consistency)
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
  const sliderSettings = {
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
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-heading text-2xl text-primary">{collectionTitle}</h2>
          <Link href={`/collections/${collectionSlug}`} className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors duration-300 text-sm font-medium">
            VIEW ALL
          </Link>
        </div>
        
        {slider ? (
          <Slider {...sliderSettings} className="px-4">
            {productsToDisplay.map((product) => (
              <div key={product._id} className="p-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="relative" ref={containerRef}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            {/* Collection Navigation Controls - only show if there are multiple pages */}
            {totalPages > 1 && (
              <>
                <button 
                  className={`absolute -left-4 md:-left-6 top-1/2 transform -translate-y-1/2 bg-white border border-neutral-sand ${currentPage === 0 ? 'text-neutral-gray' : 'hover:border-primary text-primary'} rounded-full p-2 shadow-sm z-10`}
                  aria-label="Previous products"
                  onClick={handlePrev}
                  disabled={currentPage === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className={`absolute -right-4 md:-right-6 top-1/2 transform -translate-y-1/2 bg-white border border-neutral-sand ${currentPage === totalPages - 1 ? 'text-neutral-gray' : 'hover:border-primary text-primary'} rounded-full p-2 shadow-sm z-10`}
                  aria-label="Next products"
                  onClick={handleNext}
                  disabled={currentPage === totalPages - 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
