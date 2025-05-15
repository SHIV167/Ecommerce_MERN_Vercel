import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Banner } from "@shared/schema";

export default function HeroCarousel() {
  // Fetch banners from backend
  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await fetch('/api/banners?enabled=true');
      if (!res.ok) throw new Error('Failed to fetch banners');
      return res.json();
    }
  });
  // Carousel index state
  const [current, setCurrent] = useState(0);

  // Define goPrev/goNext before useEffect to avoid initialization error
  const goPrev = () => setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const goNext = () => setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));

  // Auto-slide every 5s
  useEffect(() => {
    const timer = setInterval(() => goNext(), 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (isLoading || banners.length === 0) {
    // Loader animation while banners load
    return (
      <div className="flex items-center justify-center w-full h-64 bg-[#f8f4ea]">
        <svg
          className="animate-spin h-12 w-12 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-full border border-neutral-sand overflow-hidden bg-[#f8f4ea]">
      <div className="flex w-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map((banner, idx) => (
          <picture key={idx} className="w-full flex-shrink-0">
            <source media="(max-width: 767px)" srcSet={banner.mobileImageUrl} />
            <img
              src={banner.desktopImageUrl}
              alt={banner.alt}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '480px' }}
            />
          </picture>
        ))}
      </div>
      {/* Slider Controls */}
      <button
        aria-label="Previous banner"
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow transition pointer-events-auto z-20"
      >
        <span className="sr-only">Previous</span>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        aria-label="Next banner"
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow transition pointer-events-auto z-20"
      >
        <span className="sr-only">Next</span>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
      </button>
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto z-20">
        {banners.map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${current === idx ? 'bg-[#A72B1D]' : 'bg-neutral-300'} inline-block transition-all`}
          />
        ))}
      </div>
    </div>
  );
}
