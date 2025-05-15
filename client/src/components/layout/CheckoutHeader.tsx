import React from 'react';
import { Link } from 'wouter';

export default function CheckoutHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 py-4 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <Link href="/" className="block">
          <div className="flex flex-col items-center">
            <h1 className="text-primary font-heading text-2xl md:text-3xl font-medium">KAMA</h1>
            <p className="text-primary font-accent text-sm tracking-widest">AYURVEDA</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
