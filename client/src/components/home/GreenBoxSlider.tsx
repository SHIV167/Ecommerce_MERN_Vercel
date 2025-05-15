import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
    title: "Kumkumadi Thailam Review – Is The Ayurvedic Face Oil Effective?",
    desc: "Recently, Kumkumadi Thailam has gained popularity as a miracle Ayurvedic...",
    date: "BEAUTY | 1 APRIL 2025 | 6 MIN READ"
  },
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    title: "The Secret Benefits of Ayurveda for Your Skin",
    desc: "Discover how Ayurveda transforms your skin health with natural remedies...",
    date: "SKINCARE | 2 APRIL 2025 | 5 MIN READ"
  },
  {
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    title: "Why Herbal Oils are Trending in 2025",
    desc: "Herbal oils are making a comeback in beauty and wellness circles...",
    date: "WELLNESS | 3 APRIL 2025 | 4 MIN READ"
  }
];

// Robust Arrow component for react-slick
const Arrow = (props: any) => {
  const { className, style, onClick, direction } = props;
  return (
    <button
      className={`absolute top-1/2 z-20 transform -translate-y-1/2 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center pointer-events-auto ${direction === 'left' ? 'left-2 md:left-4' : 'right-2 md:right-4'} ${className || ''}`}
      style={{ ...style, display: 'flex' }}
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      type="button"
    >
      {direction === 'left' ? (
        <svg width="24" height="24" fill="none" stroke="green" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
      ) : (
        <svg width="24" height="24" fill="none" stroke="green" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      )}
    </button>
  );
};

// Wrapper to inject direction prop
const ArrowWrapper = (arrowProps: any) => <Arrow {...arrowProps} direction={arrowProps.direction} />;

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  autoplay: true,
  autoplaySpeed: 3500,
  pauseOnHover: true,
  fade: false,             // use slide transition
  cssEase: 'ease-in-out',  // smooth slide animation
  responsive: [
    {
      breakpoint: 768,
      settings: {
        arrows: true,
      }
    }
  ]
};

export default function GreenBoxSlider() {
  return (
    <div className="w-full flex justify-center mt-6">
      <div className="rounded-lg p-0 bg-white w-[97vw] max-w-6xl relative overflow-visible" style={{ boxSizing: 'border-box' }}>
        <Slider
          {...(sliderSettings as any)}
          prevArrow={<ArrowWrapper direction="left" />}
          nextArrow={<ArrowWrapper direction="right" />}
        >
          {slides.map((slide, idx) => (
            <div key={idx} className="relative min-h-[330px] md:min-h-[370px] flex flex-col md:flex-row items-center md:items-stretch justify-center px-0 md:px-8 py-8 md:py-10">
              {/* Image (not full width) */}
              <div className="relative w-full md:w-[60%] flex-shrink-0 flex items-center justify-center">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="rounded-lg shadow-lg w-full h-[220px] md:h-[340px] object-cover object-center"
                />
              </div>
              {/* Text card - overlaps right edge of image on desktop */}
              <div
                className="w-full md:w-[55%] bg-white shadow-2xl rounded-lg p-6 flex flex-col justify-center items-start md:absolute md:top-1/2 md:right-12 md:-translate-y-1/2 md:z-20 md:ml-[-80px] md:mr-0"
                style={{
                  boxShadow: '0 6px 32px 0 rgba(0,0,0,0.14)',
                  ...(window.innerWidth >= 768 ? { left: 'calc(50% + 80px)' } : {})
                }}
              >
                <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">{slide.date}</div>
                <div className="text-xl md:text-2xl font-bold mb-3 text-gray-800 leading-snug">{slide.title}</div>
                <div className="text-gray-600 mb-6">{slide.desc}</div>
                <button className="bg-gray-800 text-white px-6 py-2 rounded font-semibold hover:bg-gray-700 transition">Read Article</button>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
