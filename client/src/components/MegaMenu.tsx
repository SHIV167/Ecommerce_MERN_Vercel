import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Types for collections and products
interface Collection {
  name: string;
  slug: string;
}

interface Product {
  name: string;
  imageUrl?: string;
  // Add other fields as needed
}

const bestSellerStaticImages = [
  '/blog_01.jpg',
  '/blog_03.jpg',
  '/blog_02.jpg',
  '/blog_05.jpg',
];

export default function MegaMenu() {
  // Fetch collections dynamically
  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ['/api/collections'],
    queryFn: async () => {
      const res = await fetch('/api/collections');
      const json = await res.json();
      return json.data ?? json;
    },
  });

  // Update the slug to match 'best-sellers'
  const bestsellers = collections.find((col: Collection) => col.slug === 'best-sellers');
  const kumkumadi = collections.find((col: Collection) => col.slug === 'kumkumadi');

  const { data: bestsellerProducts = [] } = useQuery<Product[]>({
    queryKey: bestsellers ? ['/api/collections/' + bestsellers.slug + '/products'] : [],
    queryFn: async () => {
      if (!bestsellers) return [];
      const res = await fetch(`/api/collections/${bestsellers.slug}/products`);
      const json = await res.json();
      return json.data ?? json;
    },
    enabled: !!bestsellers,
  });

  const { data: kumkumadiProducts = [] } = useQuery<Product[]>({
    queryKey: kumkumadi ? ['/api/collections/' + kumkumadi.slug + '/products'] : [],
    queryFn: async () => {
      if (!kumkumadi) return [];
      const res = await fetch(`/api/collections/${kumkumadi.slug}/products`);
      const json = await res.json();
      return json.data ?? json;
    },
    enabled: !!kumkumadi,
  });

  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav className="relative w-full bg-white">
      <ul className="flex items-center justify-center gap-4 border-b border-gray-200 bg-transparent text-[15px] font-serif font-normal tracking-wide">
        {collections.map((col: Collection) => (
          <li
            key={col.slug}
            className={`py-4 px-2 cursor-pointer transition-colors duration-150 hover:text-[#c05a36] ${hovered === col.slug ? 'text-[#c05a36]' : ''}`}
            onMouseEnter={() => setHovered(col.slug)}
            onMouseLeave={() => setHovered(null)}
          >
            <a href={`/collections/${col.slug}`}>{col.name}</a>
            {/* Best Sellers MegaMenu */}
            {col.slug === 'best-sellers' && hovered === 'best-sellers' && (
              <div
                className="fixed left-1/2 -translate-x-1/2 top-[169px] z-[1000] bg-[#f8f6f2] border border-gray-200 shadow-xl w-[920px] rounded-none px-8 py-7 text-[15px] text-black"
                onMouseEnter={() => setHovered('best-sellers')}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex flex-row gap-8 justify-center">
                  <div className="flex flex-col items-center min-w-[190px]">
                    <img src="/blog_01.jpg" alt="Kumkumadi Youth-Revitalising Facial Oil" className="w-[170px] h-[140px] object-cover rounded mb-2 border border-gray-200" />
                    <div className="font-serif text-[15px] mb-1 mt-1 text-center">Kumkumadi Youth-Revitalising Facial Oil</div>
                  </div>
                  <div className="flex flex-col items-center min-w-[190px]">
                    <img src="/blog_03.jpg" alt="Bringadi thailam intensive scalp & hair Oil" className="w-[170px] h-[140px] object-cover rounded mb-2 border border-gray-200" />
                    <div className="font-serif text-[15px] mb-1 mt-1 text-center">Bringadi thailam intensive scalp & hair Oil</div>
                  </div>
                  <div className="flex flex-col items-center min-w-[190px]">
                    <img src="/blog_02.jpg" alt="Kumkumadi Youth-Recovering Night Balm" className="w-[170px] h-[140px] object-cover rounded mb-2 border border-gray-200" />
                    <div className="font-serif text-[15px] mb-1 mt-1 text-center">Kumkumadi Youth-Recovering Night Balm</div>
                  </div>
                  <div className="flex flex-col items-center min-w-[190px]">
                    <img src="/blog_05.jpg" alt="Bringadi Hair Cleanser | Nourishing Shampoo" className="w-[170px] h-[140px] object-cover rounded mb-2 border border-gray-200" />
                    <div className="font-serif text-[15px] mb-1 mt-1 text-center">Bringadi Hair Cleanser | Nourishing Shampoo</div>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <a className="font-serif text-[15px] font-medium text-center hover:underline cursor-pointer" href={`/collections/best-sellers`}>View All Best Sellers &gt;</a>
                </div>
              </div>
            )}
            {/* Haircare (now Kumkumadi) MegaMenu */}
            {col.slug === 'kumkumadi' && hovered === 'kumkumadi' && (
              <div
                className="fixed left-1/2 -translate-x-1/2 top-[169px] z-[1000] bg-[#f8f6f2] border border-gray-200 shadow-xl w-[920px] rounded-none px-8 py-7 text-[15px] text-black"
                onMouseEnter={() => setHovered('kumkumadi')}
                onMouseLeave={() => setHovered(null)}
                style={{ minHeight: '260px' }}
              >
                <div className="flex flex-row gap-8">
                  {/* By Collection (show all collections as links) */}
                  <div className="min-w-[170px] flex flex-col">
                    <div className="font-serif font-semibold mb-3 text-[16px]">By Collection</div>
                    <ul className="space-y-2">
                      {collections.map((c: Collection) => (
                        <li key={c.slug}>
                          <a href={`/collections/${c.slug}`} className="hover:underline cursor-pointer">{c.name}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* By Concern (static for now) */}
                  <div className="min-w-[170px] flex flex-col">
                    <div className="font-serif font-semibold mb-3 text-[16px]">By Concern</div>
                    <ul className="space-y-2">
                      <li className="hover:underline cursor-pointer">Hair Loss & Thinning</li>
                      <li className="hover:underline cursor-pointer">Dandruff</li>
                      <li className="hover:underline cursor-pointer">Dryness & Damage</li>
                      <li className="hover:underline cursor-pointer">Premature Graying</li>
                      <li className="hover:underline cursor-pointer">Color Protection</li>
                    </ul>
                  </div>
                  {/* Featured Images (static) */}
                  <div className="flex flex-row gap-4">
                    <div className="flex flex-col items-center min-w-[200px]">
                      <img src="/sample-organic-kit.jpg" alt="Organic Kit" className="w-[170px] h-[140px] object-cover rounded mb-2 border border-gray-200" />
                      <div className="font-serif text-[15px] mb-1 mt-1 text-center">Organic Hair Color Kit</div>
                      <a className="text-[#c05a36] font-semibold text-[15px] hover:underline cursor-pointer">Shop Now &gt;</a>
                    </div>
                    <div className="flex flex-col items-center min-w-[200px]">
                      <img src="/sample-dandruff-remedy.jpg" alt="Dandruff Blog" className="w-[170px] h-[140px] object-cover rounded mb-2 border border-gray-200" />
                      <div className="font-serif text-[15px] mb-1 mt-1 text-center">How To Get Rid Of Dandruff Naturally - 10 Best Remedies</div>
                      <a className="text-[#c05a36] font-semibold text-[15px] hover:underline cursor-pointer">Read Blog</a>
                    </div>
                  </div>
                  {/* View All */}
                  <div className="flex flex-col justify-end min-w-[120px] items-end self-stretch">
                  </div>
                </div>
                {/* All Haircare Button (now Kumkumadi) */}
                <div className="flex justify-center mt-6">
                  <button className="font-serif border border-[#c05a36] text-[#c05a36] bg-white px-6 py-2 rounded-none text-[15px] font-semibold hover:bg-[#f1e7e2] transition">All Kumkumadi</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
