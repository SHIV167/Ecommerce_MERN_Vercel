import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface BuyNowButtonProps {
  productId: string;
  className?: string;
}

const BuyNowButton: React.FC<BuyNowButtonProps> = ({ productId, className }) => {
  const [loading, setLoading] = useState(false);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    
    // Add the product to the cart
    axios.post('/api/cart/add', { productId, quantity: 1 })
      .then(() => {
        toast.success('Added to cart');
        
        // Use a direct browser navigation to checkout
        window.location.href = '/checkout';
      })
      .catch((error) => {
        console.error('Error during Buy Now:', error);
        toast.error('Failed to process your request');
        setLoading(false);
      });
  };

  return (
    <button 
      onClick={handleBuyNow} 
      disabled={loading} 
      className={className || "bg-primary hover:bg-primary-light text-white uppercase tracking-wider py-6 font-medium"}
    >
      {loading ? 'Processing...' : 'Buy Now'}
    </button>
  );
};

export default BuyNowButton;
