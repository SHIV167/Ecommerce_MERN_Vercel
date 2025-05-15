import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SocialShare from '@/components/products/SocialShare';

// Removed ProductDetail.css import; using Tailwind for responsive layout

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get product ID from URL
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [, navigate] = useLocation(); // Define useLocation at the component level

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    // Check for a scanned coupon code in localStorage
    const couponCode = localStorage.getItem('scannedCouponCode');
    if (couponCode && product) {
      applyCoupon(couponCode);
      // Clear the coupon code from localStorage after attempting to apply it
      localStorage.removeItem('scannedCouponCode');
    }
  }, [product]);

  const applyCoupon = async (couponCode: string) => {
    try {
      const cartValue = product ? product.price : 0;
      const response = await axios.post('/api/coupons/validate', {
        code: couponCode,
        cartValue
      });
      if (response.data.valid) {
        const discountAmount = response.data.discountValue;
        setDiscount(discountAmount);
        toast.success(`Coupon ${couponCode} applied successfully! Discount: $${discountAmount}`);
      } else {
        toast.error(`Invalid coupon code: ${couponCode}`);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error(`Failed to apply coupon: ${couponCode}`);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    setCartLoading(true);
    try {
      await axios.post('/api/cart/add', { productId: id, quantity: 1 });
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  // Direct Buy Now functionality within component
  const handleBuyNow = () => {
    if (!product) return;
    
    setCartLoading(true);
    
    axios.post('/api/cart/add', { productId: id, quantity: 1 })
      .then(() => {
        toast.success('Added to cart');
        // Use direct browser navigation
        window.location.href = '/checkout';
      })
      .catch((error) => {
        console.error('Error buying now:', error);
        toast.error('Failed to process your request');
        setCartLoading(false);
      });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center h-screen">Product not found</div>;
  }

  const discountedPrice = discount > 0 ? product.price - discount : product.price;

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="container mx-auto p-4 pb-4"> {/* Desktop-only product details */}
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <img src={product.image} alt={product.name} className="w-full md:w-1/2 object-cover rounded-lg shadow-md" />
          <div className="flex flex-col gap-4 md:w-1/2">
            <p className="text-lg text-gray-700">{product.description}</p>
            <div className="price-section">
              {discount > 0 ? (
                <>
                  <p className="text-2xl font-semibold text-gray-500 line-through">${product.price}</p>
                  <p className="text-2xl font-semibold text-green-600">${discountedPrice} (Discount: ${discount})</p>
                </>
              ) : (
                <p className="text-2xl font-semibold text-green-600">${product.price}</p>
              )}
            </div>
            <div className="flex flex-col gap-4 mt-4 border border-red-500">
              <button
                onClick={addToCart}
                disabled={cartLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                id="desktop-buy-now"
                style={{ border: '2px solid green', zIndex: 50, position: 'relative', backgroundColor: 'yellow' }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Buy Now
              </button>
            </div>
            <div className="mt-4">
              <SocialShare
                url={window.location.href}
                title={product.name}
                description={product.description}
                image={product.image}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Mobile-only Add to Cart and Buy Now */}
      <div className="fixed bottom-0 left-0 right-0 block md:hidden bg-white border-t border-gray-200 p-4 z-10 md:z-50 shadow-lg">
        <div className="flex flex-col space-y-3">
          <button
            onClick={addToCart}
            disabled={cartLoading}
            className="w-full h-[60px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-lg text-lg shadow-md"
          >
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={cartLoading}
            className="w-full h-[60px] bg-green-600 hover:bg-green-700 text-white font-bold px-6 rounded-lg text-lg shadow-md"
          >
            {cartLoading ? 'Processing...' : 'Buy Now'}
          </button>
        </div>
      </div>
      {/* Back to Top button */}
      {/* <button
        onClick={scrollToTop}
        className="fixed bottom-24 md:bottom-32 right-4 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center rounded-full shadow-md z-50"
      >
        ↑
      </button> */}
    </>
  );
};

export default ProductDetail;
