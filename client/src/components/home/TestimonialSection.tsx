import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Testimonial } from "../../../../shared/schema";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// Sample fallback testimonials matching Testimonial type
const sampleTestimonials: Testimonial[] = [
  { id: "1", name: "Priya S.", content: "The Kumkumadi face oil has transformed my skin.", rating: 5, featured: true, createdAt: new Date() },
  { id: "2", name: "Rahul M.", content: "I was skeptical about Ayurvedic hair care but Bringadi oil has proven me wrong.", rating: 5, featured: true, createdAt: new Date() },
  { id: "3", name: "Anita K.", content: "The Rose Jasmine face cleanser is gentle yet effective.", rating: 4, featured: true, createdAt: new Date() },
];

export default function TestimonialSection() {
  const sliderRef = useRef<Slider>(null);
  const { data: testimonials = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/testimonials/featured?limit=6'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/testimonials/featured?limit=6');
      return res.json();
    },
  });
  const displayTestimonials = testimonials.length > 0 ? testimonials : sampleTestimonials;
  
  // Custom arrow components for the slider
  const SliderArrow = ({ className, style, onClick, isNext = false }: any) => {
    return (
      <button
        className={`custom-nav-arrow absolute z-20 top-1/2 transform -translate-y-1/2 ${isNext ? 'right-4' : 'left-4'} rounded-full w-12 h-12 flex items-center justify-center focus:outline-none ${className}`}
        style={{
          ...style,
          backgroundColor: 'rgba(85, 128, 118, 0.85)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease',
        }}
        onClick={onClick}
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
          <ChevronRight className="w-6 h-6 text-white" />
        ) : (
          <ChevronLeft className="w-6 h-6 text-white" />
        )}
      </button>
    );
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false, // Disable default arrows
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    customPaging: () => (
      <div className="h-2 w-2 rounded-full bg-neutral-300 hover:bg-secondary mt-8"></div>
    ),
  };

  return (
    <section className="py-12 bg-white overflow-hidden testimonial-section">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl text-primary text-center mb-10">What Our Customers Say</h2>
        
        <div className="px-4 relative">
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
            // Render skeleton cards when loading
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 shadow-sm p-6 rounded-md animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 mb-4"></div>
                  <div className="w-24 h-4 bg-secondary/20 mb-4"></div>
                  <div className="w-full h-24 bg-gray-100 mb-4"></div>
                  <div className="w-32 h-4 bg-gray-100 mb-1"></div>
                  <div className="w-20 h-3 bg-gray-100"></div>
                </div>
              ))}
            </div>
          ) : (
            <Slider ref={sliderRef} {...sliderSettings}>
              {displayTestimonials.map((testimonial: any) => (
                <div key={testimonial.id || testimonial._id} className="p-3">
                  <div className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-lg p-6 h-full flex flex-col relative">
                    {/* Quote icon */}
                    <div className="absolute top-4 right-4 text-secondary/20">
                      <Quote className="w-10 h-10" />
                    </div>
                    
                    {/* Stars */}
                    <div className="flex text-yellow-400 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    
                    {/* Testimonial content */}
                    <p className="italic text-neutral-gray mb-6 flex-grow">"{testimonial.content}"</p>
                    
                    {/* Customer info with fancy line */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-medium">
                            {testimonial.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-primary">{testimonial.name}</p>
                          <p className="text-xs text-neutral-gray">
                            {testimonial.createdAt 
                              ? new Date(testimonial.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                              : 'Verified Customer'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </div>
    </section>
  );
}
