import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCart } from "@/hooks/useCart";
import { Product } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const recommendedProducts = [
  {
    _id: 'r1',
    name: 'Rose And Jasmine Body Cleanser',
    slug: 'rose-jasmine-body-cleanser',
    imageUrl: 'https://images.unsplash.com/photo-1611080541599-8c6c79cdf95f',
    price: 495,
  },
  {
    _id: 'r2',
    name: 'Rose & Jasmine Hair Cleanser',
    slug: 'rose-jasmine-hair-cleanser',
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b',
    price: 445,
  },
  {
    _id: 'r3',
    name: 'Pure Rose Water Toner',
    slug: 'pure-rose-water-toner',
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b',
    price: 350,
  },
];

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, subtotal, removeItem, updateQuantity, isEmpty } = useCart();
  const [recIndex, setRecIndex] = useState(0);

  const showRecommendations = isEmpty;
  const visibleRecs = recommendedProducts.slice(recIndex, recIndex + 2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md p-0 bg-white border-l shadow-xl overflow-auto h-full \
          data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
      >
        {/* Header with View Bag */}
        <div className="pt-6 pb-4 px-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex-1 text-center font-medium text-[15px]">Items in your bag</div>
          <Link href="/cart" className="text-[15px] text-[#c05a36] font-medium hover:underline ml-auto">View Bag</Link>
          <button 
            className="ml-2 text-foreground" 
            onClick={onClose}
            aria-label="Close cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col h-[calc(100%-160px)] overflow-auto">
          {isEmpty ? (
            <>
              <div className="flex flex-col items-center justify-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-neutral-400 mb-8" fill="none" viewBox="0 0 64 64" stroke="currentColor">
                  <rect x="12" y="20" width="40" height="32" rx="6" strokeWidth="2.5" fill="none"/>
                  <path d="M20 20V16a12 12 0 0 1 24 0v4" strokeWidth="2.5" fill="none"/>
                </svg>
                <div className="text-lg font-bold text-neutral-700 mb-4">Your Shopping Bag Is Empty</div>
                <Button 
                  className="w-full max-w-xs bg-neutral-800 hover:bg-neutral-700 text-white rounded-none text-base font-semibold py-4 mb-8"
                  onClick={onClose}
                  asChild
                >
                  <Link href="/collections/all">Continue Shopping</Link>
                </Button>
              </div>
              {/* Recommendations Slider */}
              <div className="px-6 pb-6">
                <div className="font-serif font-medium text-[16px] text-neutral-700 mb-3">Recommendations</div>
                <div className="relative">
                  <button
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-neutral-200 rounded-full p-1 shadow z-10"
                    onClick={() => setRecIndex((i) => Math.max(i - 1, 0))}
                    disabled={recIndex === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex gap-4 justify-center ml-8 mr-8">
                    {visibleRecs.map((rec) => (
                      <div key={rec._id} className="w-28 flex-shrink-0 flex flex-col items-center">
                        <Link href={`/products/${rec.slug}`} className="block mb-2">
                          <img src={rec.imageUrl} alt={rec.name} className="w-24 h-24 object-contain rounded bg-neutral-100" />
                        </Link>
                        <div className="text-xs text-center font-medium mb-1 line-clamp-2" style={{minHeight: '2.5em'}}>{rec.name}</div>
                        <div className="text-xs text-neutral-700 font-semibold">₹{rec.price}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-neutral-200 rounded-full p-1 shadow z-10"
                    onClick={() => setRecIndex((i) => Math.min(i + 1, recommendedProducts.length - 2))}
                    disabled={recIndex >= recommendedProducts.length - 2}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="divide-y divide-border">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-md overflow-hidden">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <Link 
                          href={`/products/${item.product.slug}`}
                          className="font-heading text-sm text-primary hover:text-primary-light line-clamp-2"
                          onClick={onClose}
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-auto">
                        {formatCurrency(item.product.price)}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-foreground"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-foreground"
                            aria-label="Increase quantity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <p className="font-medium text-foreground">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {!isEmpty && (
          <div className="border-t border-border mt-auto p-4 space-y-4">
            <div className="flex justify-between items-center font-medium">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping, taxes, and discounts calculated at checkout
            </p>
            <Separator />
            <Button
              className="w-full bg-primary hover:bg-primary-light text-white uppercase tracking-wider py-6 font-medium"
              disabled={isEmpty}
              onClick={onClose}
              asChild
            >
              <Link href="/checkout">Checkout</Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-wider py-2 font-medium text-sm"
              onClick={onClose}
              asChild
            >
              <Link href="/collections/all">Continue Shopping</Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
