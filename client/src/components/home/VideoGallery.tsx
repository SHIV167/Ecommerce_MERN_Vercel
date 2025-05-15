import React, { useState, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Sample video data
const exploreItems = [
  {
    id: 1,
    title: 'Rejuvenating Saffron Therapy',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    description: 'Rejuvenating saffron therapy',
    startingFrom: '₹985',
  },
  {
    id: 2,
    title: 'Kumkumadi Youth Illumination',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    description: 'Kumkumadi Youth Illumination',
    startingFrom: '₹1195',
  },
  {
    id: 3,
    title: 'Rose Essential Oil Box',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    description: 'Rose Essential Oil Box',
    startingFrom: '₹1995',
  },
  {
    id: 4,
    title: 'Kumkumadi Youth Revolution',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    description: 'Brighter skin',
    startingFrom: '₹1195',
  },
  {
    id: 5,
    title: 'Kumkumadi Youth Revolution',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    description: 'Brighter skin',
    startingFrom: '₹1195',
  },
  {
    id: 6,
    title: 'Kumkumadi Youth Revolution',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    description: 'Brighter skin',
    startingFrom: '₹1195',
  }
];

export default function VideoGallery() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const sliderRef = useRef<Slider | null>(null);

  const handleMouseEnter = (id: number) => {
    setHoveredItem(id);
    if (videoRefs.current[id]) {
      videoRefs.current[id]?.play().catch(e => console.error('Error playing video:', e));
    }
  };

  const handleMouseLeave = (id: number) => {
    setHoveredItem(null);
    if (videoRefs.current[id]) {
      videoRefs.current[id]?.pause();
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ],
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />
  };

  function PrevArrow(props: any) {
    const { className, onClick } = props;
    return (
      <div className="explore-arrow explore-prev-arrow" onClick={onClick}>
        <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
      </div>
    );
  }

  function NextArrow(props: any) {
    const { className, onClick } = props;
    return (
      <div className="explore-arrow explore-next-arrow" onClick={onClick}>
        <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-center mb-10">
          <span className="font-heading text-2xl text-primary">Explore & Shop</span>
        </h2>

        <div className="explore-gallery-wrapper relative mx-auto" style={{ maxWidth: '1200px' }}>
          <Slider ref={sliderRef} {...sliderSettings} className="explore-slider">
            {exploreItems.map((item) => (
              <div key={item.id} className="explore-slide-item px-2">
                <div
                  className="explore-product-card h-[460px] flex flex-col rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseLeave={() => handleMouseLeave(item.id)}
                >
                  {/* Media Container */}
                  <div className="relative h-96 w-full bg-gray-100 flex-shrink-0">
                    {hoveredItem === item.id ? (
                      <video
                        ref={el => videoRefs.current[item.id] = el}
                        src={item.videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        loop
                      />
                    ) : (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Description overlay */}
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 px-3 py-1 rounded-md text-white">
                      <p className="text-sm font-medium">{item.description}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                      <button className="bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                      <button className="bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-100 transition-all duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col h-[150px] p-3 bg-white">
                    <div className="mb-2">
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</h3>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Starting from</p>
                      <p className="text-sm font-bold text-gray-800">{item.startingFrom}</p>
                    </div>
                    <div className="mt-auto pt-2 border-t border-gray-100">
                      <button className="w-full flex justify-between items-center text-primary text-xs font-medium hover:opacity-80 transition-opacity duration-200">
                        <span>Explore More</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          /* Container styles */
          .explore-gallery-wrapper {
            position: relative;
            padding: 0 10px;
            box-sizing: border-box;
          }

          /* Slider global styles */
          .explore-slider {
            padding-bottom: 40px;
          }

          /* Navigation arrows */
          .explore-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            cursor: pointer;
          }

          .explore-prev-arrow {
            left: -40px;
          }

          .explore-next-arrow {
            right: -20px;
          }

          /* Override slick-slider default styles */
          .slick-track {
            display: flex !important;
            margin: 0 -10px;
          }

          .slick-slide {
            height: inherit !important;
            display: flex !important;
            padding: 0 5px;
          }

          .slick-slide > div {
            width: 100%;
            display: flex;
          }

          /* Dots styling */
          .slick-dots {
            bottom: 0px;
          }

          .slick-dots li button:before {
            font-size: 8px;
          }

          .slick-dots li.slick-active button:before {
            color: #558076;
          }

          /* Product card styles */
          .explore-product-card {
            flex: 1;
            height: 460px;
            display: flex;
            flex-direction: column;
          }

          /* Fix for Safari */
          @supports (-webkit-touch-callout: none) {
            .explore-slider .slick-track {
              display: flex !important;
            }
            .explore-slider .slick-slide {
              height: unset !important;
              display: flex !important;
            }
          }
        ` }} />
      </div>
    </section>
  );
}
