import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Review } from "@shared/schema";
// Extend Review type with server-enriched fields
type EnrichedReview = Review & { _id?: string; userName?: string };
import ReviewForm from "@/components/product/ReviewForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import RatingStars from "@/components/products/RatingStars";
import ProductCollection from "@/components/home/ProductCollection";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from 'react-helmet';
import { useEffect } from "react";
import StickyAddToCart from "@/components/products/StickyAddToCart";
import { apiRequest } from "@/lib/queryClient";
import SocialShare from "@/components/products/SocialShare";

export default function ProductPage() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [scannerEntry, setScannerEntry] = useState<any | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [pincode, setPincode] = useState('');
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [serviceData, setServiceData] = useState<any[] | null>(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  
  const { data: product, isLoading: productLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
    enabled: !!slug,
  });
  
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<EnrichedReview[]>({
    queryKey: [`/api/products/${product?._id}/reviews`],
    enabled: !!product?._id,
  });
  
  useEffect(() => {
    async function fetchPromoTimers() {
      const res = await fetch("/api/promotimers");
      const timers = await res.json();
      (window as any).PROMO_TIMERS = timers;
    }
    fetchPromoTimers();
  }, []);
  
  // Log QR scan event and apply coupon if available
  useEffect(() => {
    if (product?._id) {
      apiRequest("POST", "/api/scanners", { data: window.location.href, productId: product._id, scannedAt: new Date().toISOString() })
        .then(res => res.json())
        .then(entry => {
          setScannerEntry(entry);
          if (entry?.couponCode && !couponApplied) {
            // Here we would apply the coupon to the cart or store it for checkout
            (toast as any)("Coupon Applied");
            setCouponApplied(true);
            // Note: Actual coupon application logic would depend on backend API for cart or checkout
          }
        })
        .catch(err => console.error("Log scan error", err));
    }
  }, [product?._id, toast, couponApplied]);
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product!);
    }
    
    (toast as any)(`Added to cart`);
  };

  const handleBuyNow = async (product: Product) => {
    try {
      for (let i = 0; i < quantity; i++) {
        await addItem(product);
      }
      (toast as any)('Added to cart');
      navigate('/checkout');
    } catch (error) {
      console.error('Error in Buy Now:', error);
      (toast as any)('Failed to process your request');
    }
  };

  const handleCheckPincode = () => {
    setServiceLoading(true);
    setServiceError('');
    setServiceData(null);

    if (!pincode) {
      setServiceError('Please enter a pincode');
      setServiceLoading(false);
      return;
    }

    if (pincode.length !== 6 || !/^[0-9]{6}$/.test(pincode)) {
      setServiceError('Please enter a valid 6-digit pincode');
      setServiceLoading(false);
      return;
    }

    // Check against valid pincodes from settings
    import("../lib/settings").then(({ VALID_PINCODES, DELIVERY_ESTIMATION_DAYS }) => {
      if (VALID_PINCODES.includes(pincode)) {
        // Calculate estimated delivery date
        const now = new Date();
        let deliveryDays = DELIVERY_ESTIMATION_DAYS.STANDARD_DAYS;
        
        // First digit of pincode determines if it's eligible for faster delivery
        if (pincode.startsWith('4')) {
          deliveryDays = DELIVERY_ESTIMATION_DAYS.FAST_DAYS;
        }
        
        const estimatedDate = new Date(now);
        estimatedDate.setDate(now.getDate() + deliveryDays);
        
        setServiceData([{
          rate: 0,
          estimated_delivery_date: estimatedDate.toISOString(),
        }]);
      } else {
        setServiceError('Sorry, delivery is not available to this pincode');
      }
      setServiceLoading(false);
    });
  };

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-neutral-sand animate-pulse h-[500px]"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 w-3/4 bg-neutral-sand animate-pulse"></div>
            <div className="h-4 w-1/4 bg-neutral-sand animate-pulse"></div>
            <div className="h-24 w-full bg-neutral-sand animate-pulse"></div>
            <div className="h-8 w-1/3 bg-neutral-sand animate-pulse"></div>
            <div className="h-12 w-full bg-neutral-sand animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-heading text-primary mb-4">Product Not Found</h1>
        <p className="text-neutral-gray mb-8">Sorry, the product you're looking for could not be found.</p>
        <Button 
          onClick={() => navigate('/collections/all')}
          className="bg-primary hover:bg-primary-light text-white"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{product!.name} | Shiv Kumar jha</title>
        <meta name="description" content={product!.shortDescription || product!.description.substring(0, 160)} />
        <meta property="og:title" content={product!.name} />
        <meta property="og:description" content={product!.shortDescription || product!.description.substring(0, 160)} />
        <meta property="og:image" content={product!.images?.[selectedImageIndex] || product!.imageUrl} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
      </Helmet>
      {scannerEntry?.couponCode && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-yellow-100 p-4 rounded-md mb-4">
            <p className="text-xl font-semibold">Special Offer!</p>
            <p>Use code <span className="font-bold">{scannerEntry.couponCode}</span> at checkout for extra savings.</p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Image */}
          <div className="w-full md:w-1/2">
            <div className="border border-neutral-sand p-8 rounded-md">
              <img
                src={product!.images?.[selectedImageIndex] || product!.imageUrl}
                alt={product!.name}
                className="w-full h-auto max-h-[500px] object-contain mx-auto"
              />
              {product!.images && product!.images.length > 1 && (
                <div className="flex mt-4 space-x-2 justify-center">
                  {product!.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${product!.name} ${idx + 1}`}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 object-cover cursor-pointer rounded ${idx === selectedImageIndex ? 'ring-2 ring-primary' : 'ring-1 ring-neutral-sand'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Product Details */}
          <div className="w-full md:w-1/2">
            <h1 className="font-heading text-2xl md:text-3xl text-primary mb-2">{product!.name}</h1>
            
            <RatingStars rating={product!.rating} reviews={product!.totalReviews} size="md" />
            
            <p className="text-sm text-neutral-gray mb-6">{product!.shortDescription}</p>
            
            <div className="mb-6">
              <p className="font-heading text-xl text-primary">
                ₹{product!.price?.toFixed(2) ?? '0.00'}
                {product!.discountedPrice && (
                  <span className="ml-3 text-base text-neutral-gray line-through">
                    ₹{product!.discountedPrice?.toFixed(2) ?? '0.00'}
                  </span>
                )}
              </p>
              {product!.stock > 0 ? (
                <p className="text-sm text-green-600 mt-1">In Stock</p>
              ) : (
                <p className="text-sm text-red-500 mt-1">Out of Stock</p>
              )}
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <label htmlFor="quantity" className="mr-4 text-neutral-gray">Quantity:</label>
                <div className="flex items-center border border-neutral-sand rounded-md">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 flex items-center justify-center text-foreground"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-12 text-center border-x border-neutral-sand focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-foreground"
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-black hover:bg-primary-light text-white uppercase tracking-wider py-6 font-medium"
                  disabled={product!.stock <= 0}
                >
                  {product!.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button
                  onClick={() => handleBuyNow(product!)}
                  className="w-full bg-primary hover:bg-primary-light text-white uppercase tracking-wider py-6 font-medium"
                >
                  Buy Now
                </Button>
              </div>
              <SocialShare
                url={window.location.href}
                title={product!.name}
                description={product!.shortDescription || product!.description}
                image={product!.images?.[selectedImageIndex] || product!.imageUrl}
              />
            </div>
            {/* Serviceability Check */}
        <div className="mt-4 border-t pt-4">
          <h3 className="font-heading text-lg text-primary mb-2">Check Estimated Delivery</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pincode}
              onChange={e => setPincode(e.target.value)}
              placeholder="Enter your pincode"
              maxLength={6}
              className="border p-2 rounded w-32"
            />
            <button
              onClick={handleCheckPincode}
              disabled={serviceLoading}
              className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {serviceLoading ? 'Checking...' : 'Check'}
            </button>
          </div>
          {serviceError && <p className="text-red-500 mt-2">{serviceError}</p>}
          {serviceData && serviceData.length > 0 && (
            <div className="mt-2 space-y-1">
              {serviceData[0].rate === 0 && <p className="text-green-600">Free Delivery Available</p>}
              <p>Estimated Delivery by {new Date(serviceData[0].estimated_delivery_date).toLocaleDateString()}</p>
              {(() => {
                const estDate = new Date(serviceData[0].estimated_delivery_date);
                const now = new Date();
                if ((estDate.getTime() - now.getTime()) <= 24 * 60 * 60 * 1000) {
                  return <p className="text-green-600">Guaranteed Shipping Within 24 hours</p>;
                }
                return null;
              })()}
              {(() => {
                const now = new Date();
                const cutoff = new Date();
                cutoff.setHours(14, 0, 0, 0);
                const estDate = new Date(serviceData[0].estimated_delivery_date);
                const estDateStr = estDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                if (now < cutoff) {
                  return <p>Order before 2 PM for Delivery by {estDateStr}</p>;
                }
                return <p>Order now for Delivery by {estDateStr} (orders placed after 2 PM ship next day)</p>;
              })()}
            </div>
          )}
        </div>
            <div className="prose prose-sm max-w-none text-neutral-gray mt-6">
              <h3 className="text-primary font-heading text-lg">Product Description</h3>
              <p>{product!.description}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs - Description, Reviews, etc. */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="border-b border-neutral-sand w-full justify-start">
              <TabsTrigger value="description" className="font-heading text-primary">Description</TabsTrigger>
              <TabsTrigger value="reviews" className="font-heading text-primary">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="ingredients" className="font-heading text-primary">Ingredients</TabsTrigger>
              <TabsTrigger value="how-to-use" className="font-heading text-primary">How to Use</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="pt-6">
              <div className="prose prose-sm max-w-none text-neutral-gray">
                <p>{product!.description}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-6">
              {reviewsLoading ? (
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border-b border-neutral-sand pb-4">
                      <div className="h-4 w-24 bg-neutral-sand mb-2"></div>
                      <div className="h-3 w-12 bg-neutral-sand mb-4"></div>
                      <div className="h-16 w-full bg-neutral-sand"></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {isAuthenticated && !showReviewForm && (
                    <div className="flex justify-end mb-4">
                      <Button 
                        onClick={() => setShowReviewForm(true)}
                        className="bg-primary hover:bg-primary-light text-white"
                      >
                        Write a Review
                      </Button>
                    </div>
                  )}
                  
                  {showReviewForm && isAuthenticated && product?._id && (
                    <div className="mb-8">
                      <ReviewForm 
                        productId={product!._id} 
                        onClose={() => setShowReviewForm(false)} 
                      />
                    </div>
                  )}
                  
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-neutral-sand pb-6">
                      <RatingStars rating={review.rating} size="md" />
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        By {review.userName || 'Anonymous Customer'} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-neutral-gray">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-gray mb-4">This product has no reviews yet. Be the first to leave a review!</p>
                  {isAuthenticated ? (
                    showReviewForm && product?._id ? (
                      <ReviewForm 
                        productId={product!._id} 
                        onClose={() => setShowReviewForm(false)} 
                      />
                    ) : (
                      <Button 
                        onClick={() => setShowReviewForm(true)}
                        className="bg-primary hover:bg-primary-light text-white"
                      >
                        Write a Review
                      </Button>
                    )
                  ) : (
                    <Button className="bg-primary hover:bg-primary-light text-white" asChild>
                      <a href={`/login?redirect=/products/${slug}`}>Login to Write a Review</a>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ingredients" className="pt-6">
              <div className="prose prose-sm max-w-none text-neutral-gray">
                <p>
                  Our products are crafted with authentic Ayurvedic ingredients sourced directly 
                  from trusted suppliers across India. Each ingredient is carefully selected for 
                  its potency and purity, and is processed according to traditional Ayurvedic methods.
                </p>
                <p>
                  The key ingredients in this product include [placeholder for specific product ingredients], 
                  known for their [placeholder for benefits].
                </p>
                <p>
                  All Kama Ayurveda products are free from parabens, petroleum derivatives, synthetic colors, 
                  and fragrances. Our formulations are cruelty-free and environmentally conscious.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="how-to-use" className="pt-6">
              <div className="prose prose-sm max-w-none text-neutral-gray">
                <p>
                  For optimal results, follow these simple steps:
                </p>
                <ol>
                  <li>Start with clean skin/hair</li>
                  <li>Apply a small amount of product</li>
                  <li>Gently massage in circular motions</li>
                  <li>Leave on for recommended time if applicable</li>
                  <li>Follow with complementary products in your routine</li>
                </ol>
                <p>
                  For detailed instructions specific to this product, please refer to the packaging.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        
        
        {/* Related Products */}
        <div className="mt-16">
          <h2 className="font-heading text-2xl text-primary mb-8">You May Also Like</h2>
          <ProductCollection collectionSlug="bestsellers" title="" slider />
        </div>
      </div>
      <StickyAddToCart
        product={product!}
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
