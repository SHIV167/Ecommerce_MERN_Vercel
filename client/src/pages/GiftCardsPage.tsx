import GiftCardForm from '@/components/GiftCardForm';
import { Helmet } from 'react-helmet';
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';

export default function GiftCardsPage() {
  const [templates, setTemplates] = useState<{ _id: string; initialAmount: number; imageUrl?: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchTemplates() {
      const res = await apiRequest('GET', '/api/giftcards');
      const data = await res.json();
      setTemplates(data);
    }
    fetchTemplates();
  }, []);

  return (
    <>
      <Helmet>
        <title>eGift Card | Kama Ayurveda</title>
      </Helmet>
      <div className="container mx-auto py-12 px-4">
        {templates.length > 0 && (
          <div className="relative w-full h-64 mb-8 overflow-hidden">
            <img
              src={templates[currentIndex].imageUrl}
              alt={`Gift Card ${formatCurrency(templates[currentIndex].initialAmount)}`}
              className="w-full h-full object-cover rounded"
            />
            <button onClick={() => setCurrentIndex((currentIndex - 1 + templates.length) % templates.length)} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow">
              &#8592;
            </button>
            <button onClick={() => setCurrentIndex((currentIndex + 1) % templates.length)} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow">
              &#8594;
            </button>
          </div>
        )}
        <GiftCardForm />
        {/* Benefits Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-heading text-xl mb-4">Benefits</h2>
          <ul className="list-disc pl-6 text-neutral-gray space-y-2">
            <li>Seamless gifting solution, perfect for last-minute celebrations.</li>
            <li>eGift Card is sent directly via email for quick and easy gifting.</li>
            <li>Usable for purchasing from a wide selection of skincare, haircare, and wellness products.</li>
            <li>A sophisticated and thoughtful gift that offers a memorable indulgent experience.</li>
            <li>The Gift Card is valid for a period of 12 months from the date of issuance.</li>
          </ul>
          <div className="mt-4 text-xs text-neutral-gray">
            <span className="underline">Terms &amp; Conditions</span>
          </div>
        </div>
      </div>
    </>
  );
}
