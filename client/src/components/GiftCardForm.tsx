import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCart } from '@/hooks/useCart';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface GiftCardTemplate {
  _id: string;
  initialAmount: number;
  expiryDate: string;
  isActive: boolean;
  imageUrl?: string;
}

export default function GiftCardForm() {
  const [templates, setTemplates] = useState<GiftCardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<GiftCardTemplate | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [message, setMessage] = useState('');
  const { addItem } = useCart();
  const [, navigate] = useLocation();

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await apiRequest('GET', '/api/giftcards');
        const data = (await res.json()) as GiftCardTemplate[];
        // Sort templates by amount
        const sorted = data.sort((a, b) => a.initialAmount - b.initialAmount);
        setTemplates(sorted);
        
        if (sorted.length) {
          // Initialize to first option (lowest amount)
          const defaultTemplate = sorted[0];
          setSelectedTemplate(defaultTemplate);
          setAmount(defaultTemplate.initialAmount);
        }
      } catch (err) {
        console.error('Failed to load gift card templates:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  if (loading) return <div className="text-center">Loading...</div>;
  if (!selectedTemplate) return <div className="text-center">No gift cards available.</div>;

  const handleAddToBag = async () => {
    await addItem({
      _id: selectedTemplate._id,
      name: `Gift Card ${formatCurrency(selectedTemplate.initialAmount)}`,
      price: selectedTemplate.initialAmount,
      imageUrl: selectedTemplate.imageUrl,
    } as any);
  };

  const handleBuyNow = async () => {
    await handleAddToBag();
    navigate('/checkout');
  };

  return (
    <div className="flex flex-col md:flex-row gap-12 items-start">
      <div className="flex flex-col items-center w-full md:w-1/2">
        <img
          src={selectedTemplate.imageUrl || '/giftcard_main.png'}
          alt="eGift Card"
          className="w-80 h-56 object-contain rounded shadow mb-2 border"
        />
        {selectedTemplate.imageUrl && (
          <div className="flex justify-center mt-2">
            <img
              src={selectedTemplate.imageUrl}
              alt="eGift Card Thumbnail"
              className="w-12 h-12 object-contain rounded border"
            />
          </div>
        )}
      </div>

      <div className="w-full md:w-1/2 max-w-lg">
        <h1 className="font-heading text-2xl mb-2">eGift Card</h1>
        <p className="text-sm text-neutral-gray mb-2">
          Country of Origin: <span className="text-black">India</span>
        </p>
        <p className="mb-4 text-neutral-gray">
          An exceptional gift that promises a touch of personalized luxury! Give the gift of choice with Kama Ayurveda eGift Card.
        </p>
        <label className="block font-medium mb-1">Select Gift Card Amount *</label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={selectedTemplate?._id}
          onChange={(e) => {
            const tpl = templates.find(t => t._id === e.target.value);
            if (tpl) {
              setSelectedTemplate(tpl);
              setAmount(tpl.initialAmount);
            }
          }}
        >
          {templates.map(tpl => (
            <option key={tpl._id} value={tpl._id}>
              ₹{formatCurrency(tpl.initialAmount)}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            className="border p-2 rounded"
            placeholder="Sender's Name*"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Sender's Email Id*"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            type="email"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            className="border p-2 rounded"
            placeholder="Receiver's Name*"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Receiver's Email Id*"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            type="email"
          />
        </div>
        <textarea
          className="border p-2 rounded w-full mb-4"
          placeholder="Message*"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
        <div className="flex gap-4">
          <Button className="bg-white text-black border border-black px-8" onClick={handleBuyNow}>
            Buy Now
          </Button>
          <Button className="bg-black text-white px-8" onClick={handleAddToBag}>
            Add To Bag
          </Button>
        </div>
      </div>
    </div>
  );
}
