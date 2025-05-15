import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Product } from '@shared/schema';

export default function SearchBar({
  show,
  onClose
}: { show: boolean; onClose: () => void }) {
  const [query, setQuery] = useState<string>('');
  const { data = [], isLoading } = useQuery<Product[], Error>({
    queryKey: ['search', query],
    queryFn: async (): Promise<Product[]> => {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      const json = await res.json();
      return json.products || [];
    },
    enabled: show && query.length > 2,
  });

  // --- Typewriter States ---
  const typewriterPhrases = [
    'Search for Ubtan',
    'Search for Kumkumadi',
    'Search for Bringadi'
  ];
  const [placeholder, setPlaceholder] = useState(typewriterPhrases[0]);
  const [typingIndex, setTypingIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length > 0) return;
    if (charIndex < typewriterPhrases[phraseIndex].length) {
      typingTimeout.current = setTimeout(() => {
        setPlaceholder(typewriterPhrases[phraseIndex].slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 70);
    } else {
      typingTimeout.current = setTimeout(() => {
        setCharIndex(0);
        setPhraseIndex((phraseIndex + 1) % typewriterPhrases.length);
      }, 1400);
    }
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [charIndex, phraseIndex, query]);

  useEffect(() => {
    if (query.length > 0) setPlaceholder('Search products...');
  }, [query]);

  if (!show) return null;

  return (
    <div
      className="fixed top-[100px] left-0 w-full z-50 bg-white shadow-lg border-t border-gray-200"
    >
      <div className="container mx-auto">
        <div className="flex items-center w-full relative bg-white rounded-md my-2">
          <div className="absolute left-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full border-none outline-none px-12 py-4 bg-gray-50 rounded-md text-base focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            autoFocus
          />
          <button 
            onClick={onClose} 
            className="absolute right-4 p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {isLoading && (
          <div className="absolute right-16 top-5 animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
        )}
        {query.length > 2 && (
          <div className="w-full bg-white shadow-xl max-h-96 overflow-auto rounded-md border border-gray-100 mt-0">
            {data.length > 0 ? (
              data.map((prod: Product) => (
                <Link
                  key={prod._id}
                  href={`/products/${prod.slug}`}
                  className="block pointer-events-auto"
                  onClick={onClose}
                >
                  <div className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                    {prod.imageUrl && (
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900">{prod.name}</p>
                      <p className="text-sm text-green-600 font-semibold">${prod.price.toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No products found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
