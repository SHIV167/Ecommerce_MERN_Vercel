import React from "react";
import { Link } from "wouter";
import { Dialog } from "@/components/ui/dialog";
import { X, ChevronRight, Home, Heart, ShoppingBag, User, Package, PhoneCall } from "react-feather";

interface MobileNavProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  // Hardcoded sample categories for demo
  const categories = [
    { name: "Wellness", slug: "wellness" },
    { name: "Herbs & Supplements", slug: "herbs-supplements" },
    { name: "Skin Care", slug: "skin-care" },
    { name: "Hair Care", slug: "hair-care" },
    { name: "Body Care", slug: "body-care" }
  ];

  // Quick links
  const quickLinks = [
    { name: "Home", slug: "/", icon: Home },
    { name: "My Account", slug: "/account", icon: User },
    { name: "My Orders", slug: "/orders", icon: Package },
    { name: "Wishlist", slug: "/wishlist", icon: Heart },
    { name: "Cart", slug: "/cart", icon: ShoppingBag },
    { name: "Contact Us", slug: "/contact", icon: PhoneCall },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className={`fixed inset-y-0 left-0 max-w-[320px] w-full bg-white shadow-lg z-[9999] transform transition-transform duration-300 ease-in-out h-full overflow-hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-lg text-gray-900">Menu</h2>
          <button 
            className="text-gray-500 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
            aria-label="Close menu"
            tabIndex={0}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="py-4 px-6 border-b border-gray-100">
            <h3 className="font-medium text-sm uppercase tracking-wider text-gray-500 mb-3">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link 
                    href={`/categories/${category.slug}`} 
                    className="flex items-center justify-between py-2 text-gray-800 hover:text-primary transition-colors"
                    onClick={onClose}
                  >
                    <span>{category.name}</span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="py-4 px-6">
            <h3 className="font-medium text-sm uppercase tracking-wider text-gray-500 mb-3">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.slug}>
                  <Link 
                    href={link.slug} 
                    className="flex items-center py-2 text-gray-800 hover:text-primary transition-colors"
                    onClick={onClose}
                  >
                    <link.icon size={18} className="mr-3" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-auto p-6 border-t border-gray-100">
            <Link 
              href="/login" 
              className="block w-full py-3 px-4 bg-primary text-white text-center rounded-md font-medium hover:bg-primary-dark transition-colors"
              onClick={onClose}
            >
              Sign In / Register
            </Link>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
