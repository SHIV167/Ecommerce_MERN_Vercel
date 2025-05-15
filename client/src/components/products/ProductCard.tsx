import { Link } from "wouter";
import { Product } from "@shared/schema";
import RatingStars from "./RatingStars";
import PromoTimerBadge from "./PromoTimerBadge";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import VideoModal from "@/components/common/VideoModal";

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export default function ProductCard({ product, showAddToCart = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = async () => {
    try {
      await addItem(product);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`
      });
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to add ${product.name} to cart. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const [showVideo, setShowVideo] = useState(false);

  // Helper to check if a URL is YouTube
  const isYouTubeUrl = (url?: string) => url && /youtu(be)?\.([a-z]+)/i.test(url);

  // Calculate discount percentage if discounted price exists
  const calculateDiscountPercentage = () => {
    if (!product.discountedPrice) return null;
    const discount = product.price - product.discountedPrice;
    const percentage = Math.round((discount / product.price) * 100);
    return percentage > 0 ? percentage : null;
  };

  const discountPercentage = calculateDiscountPercentage();

  // Find promo timer for this product
  const promoTimers = (window as any).PROMO_TIMERS as { productId: string; endTime: string; enabled: boolean }[] | undefined;
  const promoTimer = promoTimers?.find(t => t.enabled && (t.productId === product._id || t.productId === product.slug));

  return (
    <div className="product-card bg-white border border-neutral-sand hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative pt-6 px-6 flex flex-col items-center">
        {/* Promo Timer Badge */}
        {promoTimer && <PromoTimerBadge endTime={promoTimer.endTime} />}
        {/* Badge */}
        {product.isNew && (
          <span className="absolute top-2 left-2 bg-[#A72B1D] text-white text-xs px-2 py-1 uppercase tracking-wider z-10 rounded">
            New
          </span>
        )}
        {!product.isNew && product.featured && (
          <span className="absolute top-2 left-2 bg-neutral-darkGray text-white text-xs px-2 py-1 uppercase tracking-wider z-10 rounded">
            Featured
          </span>
        )}
        {/* Discount Badge */}
        {discountPercentage && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm z-20">
            -{discountPercentage}%
          </span>
        )}
        {/* Wishlist Heart */}
        <button className="absolute top-14 right-2 p-1 rounded-full hover:bg-neutral-cream transition-colors group" aria-label="Add to Wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-gray group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
        </button>
        {/* Video Icon - show only if videoUrl exists */}
        {product.videoUrl && (
          <button
            className="absolute top-14 right-12 bg-white rounded-full border-2 border-green-500 p-1 z-20 shadow"
            style={{ boxShadow: '0 2px 8px rgba(0,128,0,0.12)' }}
            aria-label="Play Product Video"
            onClick={e => { e.preventDefault(); setShowVideo(true); }}
          >
            {/* Play Icon SVG */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="10" stroke="#22c55e" strokeWidth="2" fill="white" />
              <polygon points="9,7 16,11 9,15" fill="#22c55e" />
            </svg>
          </button>
        )}
        {/* Product Image */}
        <Link href={`/products/${product.slug}`} className="block w-full mb-4">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="mx-auto w-[180px] h-[180px] object-contain rounded bg-neutral-cream"
          />
        </Link>
      </div>
      <div className="flex flex-col flex-1 px-6 pb-6">
        {/* Rating */}
        <div className="mb-2 flex items-center justify-center">
          <RatingStars rating={product.rating} reviews={product.totalReviews} />
        </div>
        {/* Product Name */}
        <h3 className="font-heading text-primary hover:text-primary-light mb-1 text-base text-center line-clamp-2 min-h-[3rem]">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        {/* Short Description */}
        <div className="min-h-[3rem] mb-3">
          {product.shortDescription ? (
            <p className="text-sm text-neutral-gray text-center line-clamp-2">{product.shortDescription}</p>
          ) : <div className="h-full"></div>}
        </div>
        {/* Price */}
        <div className="flex items-center justify-center gap-2 mb-4 min-h-[2rem]">
          <span className="font-semibold text-lg text-primary">{formatCurrency(product.price)}</span>
          {product.discountedPrice && (
            <span className="text-sm text-neutral-gray line-through">{formatCurrency(product.discountedPrice)}</span>
          )}
        </div>
        {/* Add to Bag Button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full bg-black text-white border-0 rounded-none font-medium uppercase tracking-wide hover:bg-neutral-darkGray py-3 mt-auto"
          onClick={handleAddToCart}
        >
          Add to Bag
        </Button>
      </div>
      <VideoModal open={showVideo && !!product.videoUrl} onClose={() => setShowVideo(false)}>
        <div className="w-full aspect-video bg-black flex items-center justify-center">
          {product.videoUrl && isYouTubeUrl(product.videoUrl) ? (
            <iframe
              className="w-full h-full rounded-b-xl"
              src={product.videoUrl.replace("watch?v=", "embed/")}
              title="Product Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : product.videoUrl ? (
            <video src={product.videoUrl} controls className="w-full h-full rounded-b-xl" />
          ) : null}
        </div>
      </VideoModal>
    </div>
  );
}
