import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { cn } from '@/lib/utils';

// Sample brand data
const brands = [
  {
    id: 1,
    name: 'JOYOLOGY',
    logoText: 'JOYOLOGY BEAUTY',
    imageUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '50% OFF',
    backgroundColor: '#FFD6E0',
    logoBackground: '#FFFFFF',
  },
  {
    id: 2,
    name: 'ARCELIA',
    logoText: 'ARCELIA',
    imageUrl: '/uploads/brands/Brand_Carousel_Web_karrot.png',
    discount: 'UP TO 60% OFF',
    backgroundColor: '#E0E0E0',
    logoBackground: '#FFFFFF',
  },
  {
    id: 3,
    name: 'LUXE',
    logoText: 'LUXE',
    imageUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: 'UP TO 50% OFF',
    backgroundColor: '#F5F5F5',
    logoBackground: '#000000',
  },
  {
    id: 4,
    name: 'HOMESHOP',
    logoText: 'HOME SHOP',
    imageUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '40% OFF',
    backgroundColor: '#D6E0FF',
    logoBackground: '#FFFFFF',
  },
  {
    id: 5,
    name: 'SASSY',
    logoText: 'SASSY',
    imageUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '60% OFF',
    backgroundColor: '#FFD6D6',
    logoBackground: '#FFFFFF',
  },
  {
    id: 6,
    name: 'SASSY',
    logoText: 'SASSY',
    imageUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '60% OFF',
    backgroundColor: '#FFD6D6',
    logoBackground: '#FFFFFF',
  },
  {
    id: 7,
    name: 'SASSY',
    logoText: 'SASSY',
    imageUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '60% OFF',
    backgroundColor: '#FFD6D6',
    logoBackground: '#FFFFFF',
  },
  {
    id: 9,
    name: 'SASSY',
    logoText: 'SASSY',
    imageUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '60% OFF',
    backgroundColor: '#FFD6D6',
    logoBackground: '#FFFFFF',
  },
  {
    id: 10,
    name: 'SASSY',
    logoText: 'SASSY',
    imageUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '60% OFF',
    backgroundColor: '#FFD6D6',
    logoBackground: '#FFFFFF',
  },
  {
    id: 11,
    name: 'SASSY',
    logoText: 'SASSY',
    imageUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '60% OFF',
    backgroundColor: '#FFD6D6',
    logoBackground: '#FFFFFF',
  }
];

export default function BrandsCarousel() {
  return (
    <section className="py-12 bg-black relative overflow-hidden">
      <div className="container mx-auto">
        <h2 className="text-center mb-10">
          <span className="font-heading text-2xl text-white">Our </span>
          <span className="font-heading text-2xl text-white font-bold">Homegrown </span>
          <span className="font-heading text-2xl text-white">Brands</span>
        </h2>

        <div className="relative">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 200,
              modifier: 3,
              slideShadows: true,
            }}
            initialSlide={2}
            pagination={{ clickable: true }}
            navigation={true}
            loop={true}
            // @ts-ignore - loopedSlides is a valid Swiper prop but might have type issues
            loopedSlides={5}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="brands-swiper"
          >
            {brands.map((brand, index) => (
              <SwiperSlide key={brand.id} className="brand-slide w-[320px] h-[480px] relative overflow-hidden">
                {({ isActive }) => (
                  <div className="relative rounded-lg w-full h-full flex flex-col items-center justify-center">
                    {/* Brand Image */}
                    <div className="absolute inset-0 w-full h-full">
                      <img 
                        src={brand.imageUrl} 
                        alt={brand.name}
                        className={cn(
                          "w-full h-full object-cover object-center transition-all duration-300",
                          !isActive && "grayscale brightness-75"
                        )}
                        style={{ objectPosition: "center 30%" }}
                      />
                    </div>
                    
                    {/* Overlay Content */}
                    <div className="relative z-10 p-4 text-center flex flex-col items-center justify-between h-full w-full">
                      {/* Logo */}
                      <div className="h-16 w-40 flex items-center justify-center bg-white bg-opacity-90 rounded-md p-2 mb-auto mt-6">
                        <div className="font-bold text-xl text-center">
                          {brand.logoText}
                        </div>
                      </div>
                      
                      {/* Discount Tag */}
                      <div className="mt-auto mb-8 bg-white bg-opacity-90 text-black font-bold py-2 px-6 rounded-md text-lg tracking-wider">
                        {brand.discount}
                      </div>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      
      <style>{`
        .brands-swiper {
          padding: 30px 0 60px !important;
          width: 100vw !important;
          margin-left: calc(-50vw + 50%) !important;
          overflow: visible !important;
        }
        .swiper-pagination {
          bottom: 0 !important;
        }
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
        }
        .swiper-button-prev, .swiper-button-next {
          color: white !important;
          background: rgba(0, 0, 0, 0.5) !important;
          width: 44px !important;
          height: 44px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3) !important;
          transform: translateY(-50%) !important;
          top: 50% !important;
        }
        .swiper-button-prev {
          left: calc(50% - 165px) !important;
        }
        .swiper-button-next {
          right: calc(50% - 165px) !important;
        }
        .swiper-button-prev:hover, .swiper-button-next:hover {
          background: rgba(0, 0, 0, 0.7) !important;
        }
        .swiper-button-prev:after, .swiper-button-next:after {
          font-size: 18px !important;
          font-weight: bold !important;
        }
        .brand-slide {
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          filter: brightness(0.7);
        }
        .swiper-slide-active {
          transform: scale(1.15) !important;
          z-index: 2;
          filter: brightness(1);
        }
        .swiper-slide-prev, .swiper-slide-next {
          transform: scale(0.92);
          z-index: 1;
        }
        .swiper-slide-prev + .swiper-slide-prev,
        .swiper-slide-next + .swiper-slide-next {
          transform: scale(0.84);
          z-index: 0;
        }
      `}</style>
    </section>
  );
}
