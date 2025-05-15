import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import OffersPopup from "@/components/offers/OffersPopup";
import { useCoupon } from "@/hooks/useCoupon";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "../common/AuthModal";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const { applyCoupon } = useCoupon();
  const [offersPopupOpen, setOffersPopupOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch recommended products (bestsellers as example)
  const { data: recommendedProducts = [], isLoading: recLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/bestsellers?limit=6'],
  });

  React.useEffect(() => {
    if (cartItems.length === 0) {
      let interval = setInterval(() => {
        const nextBtn = document.querySelector('.carousel [aria-roledescription="carousel"] button[aria-label="Next slide"]');
        if (nextBtn) (nextBtn as HTMLButtonElement).click();
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [cartItems.length]);

  if (!isOpen) return null;

  const handleApplyCoupon = async (code: string) => {
    const subtotal = cartItems.reduce((sum, item) =>
      sum + (item.product && typeof item.product.price === 'number' ? item.product.price * item.quantity : 0)
    , 0);
    
    applyCoupon(code, subtotal * 0.1); // Example discount calculation
    setOffersPopupOpen(false);
  };

  const handleApplyVoucher = async (code: string) => {
    setOffersPopupOpen(false);
  };

  return (
    <>
      {/* Offers Popup */}
      <OffersPopup 
        isOpen={offersPopupOpen} 
        onClose={() => setOffersPopupOpen(false)}
        onApplyCoupon={handleApplyCoupon}
        onApplyVoucher={handleApplyVoucher}
        openAuthModal={() => {
          setOffersPopupOpen(false);
          setAuthModalOpen(true);
        }}
      />
      
      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      
      {/* Overlay - covers entire viewport, closes on click, sits below drawer */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 z-[60] transition-opacity duration-300"
        onClick={onClose}
        aria-label="Close minicart overlay"
      />
      {/* Drawer - fixed, right, above overlay, w-[380px], pointer-events-auto */}
      <aside
        className="fixed top-0 right-0 h-full w-[380px] bg-white shadow-2xl z-[70] flex flex-col transition-transform duration-300 pointer-events-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-2 border-b border-gray-200 px-6">
          <Link href="/cart" onClick={onClose} className="text-sm text-neutral-600 font-medium hover:text-primary hover:underline">View Total In Bag</Link>
          <button
            className="ml-2 text-neutral-700 hover:text-black p-1"
            onClick={onClose}
            aria-label="Close minicart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {cartItems.length === 0 ? (
            <>
              <div className="flex flex-col items-center justify-center py-12">
                <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-4 text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-13z" />
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Your Shopping Bag Is Empty</h3>
                <button className="bg-neutral-800 text-white px-6 py-2 rounded font-semibold mt-2" onClick={onClose}>
                  Continue Shopping
                </button>
              </div>
              <div className="mt-6">
                <h4 className="text-base font-semibold mb-3">Recommendations</h4>
                <div className="relative min-h-[170px]">
                  {recLoading ? (
                    <div className="flex gap-4">
                      {Array.from({ length: 2 }).map((_, idx) => (
                        <div key={idx} className="min-w-[140px] bg-gray-100 rounded-lg shadow p-2 animate-pulse h-[170px]" />
                      ))}
                    </div>
                  ) : (
                    <Carousel opts={{ loop: true, align: "start" }}>
                      <CarouselContent>
                        {recommendedProducts.map((rec, idx) => (
                          <CarouselItem key={rec._id || idx} className="basis-1/2 max-w-[180px]">
                            <div className="bg-white rounded-lg shadow p-2 flex flex-col items-center">
                              <img src={rec.imageUrl} alt={rec.name} className="w-24 h-24 object-cover rounded mb-2" />
                              <div className="text-sm font-medium text-center mb-1">{rec.name}</div>
                              <div className="text-xs text-gray-500 mb-1">₹{rec.price}</div>
                              <Link 
                                href={`/product/${rec.slug || rec._id}`}
                                className="bg-primary hover:bg-primary-light text-white px-3 py-1 rounded text-xs mt-1 block text-center"
                                style={{ minWidth: '48px' }}
                                onClick={onClose}
                              >
                                View
                              </Link>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="!left-0 top-1/2 -translate-y-1/2 !-translate-x-1/2 z-10 bg-white shadow border border-gray-200" />
                      <CarouselNext className="!right-0 top-1/2 -translate-y-1/2 !translate-x-1/2 z-10 bg-white shadow border border-gray-200" />
                    </Carousel>
                  )}
                </div>
              </div>
            </>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 py-2">
                {item.product && item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded" />
                )}
                <div className="flex-1">
                  <Link href={`/products/${item.product?.slug ?? ""}`} onClick={onClose}>
                    <h4 className="text-sm font-medium text-gray-900">{item.product?.name ?? "Unknown Product"}</h4>
                  </Link>
                  {!item.product?.isFreeProduct ? (
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        className="w-6 h-6 flex items-center justify-center border rounded text-gray-600 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-2 text-sm">{item.quantity}</span>
                      <button
                        className="w-6 h-6 flex items-center justify-center border rounded text-gray-600 hover:bg-gray-100"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-primary font-medium">Free Product</span>
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {item.quantity} &times; {item.product?.isFreeProduct ? "Free" : formatCurrency(item.product?.price ?? 0)}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {item.product?.isFreeProduct ? "Free" : formatCurrency((item.product?.price ?? 0) * item.quantity)}
                </p>
              </div>
            ))
          )}
        </div>
        {/* Sticky Footer for Cart Items */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 py-6 bg-white sticky bottom-0 px-6">
            {/* Apply Offers button */}
            <button
              className="w-full mb-4 border border-primary text-primary hover:bg-primary-light hover:text-white py-2 rounded text-sm font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setOffersPopupOpen(true);
              }}
            >
              APPLY OFFERS
            </button>
            
            {/* Subtotal with border */}
            <div className="flex justify-between items-center font-medium mb-4 py-3 border-y border-gray-200">
              <span>Subtotal</span>
              <span>{formatCurrency(cartItems.reduce((sum, item) =>
                sum + (item.product && typeof item.product.price === 'number' ? item.product.price * item.quantity : 0)
              , 0))}</span>
            </div>
            
            {/* Checkout button */}
            <Link href="/checkout">
              <button
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-base font-semibold py-4 shadow-md transition-all duration-200"
                onClick={() => {
                  onClose();
                }}
              >
                Checkout
              </button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

function ButtonLink({ onClick }: { onClick: () => void }) {
  return (
    <Link href="/">
      <button
        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-base font-semibold py-4 shadow-md transition-all duration-200"
        onClick={onClick}
      >
        Continue Shopping
      </button>
    </Link>
  );
}
