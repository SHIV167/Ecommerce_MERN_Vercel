import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [bg, setBg] = useState<string>('');
  const [enabled, setEnabled] = useState(false);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/popup-settings')
      .then(res => {
        // Check if response is OK and has content
        if (res.ok && res.headers.get('content-length') !== '0') {
          return res.json();
        }
        // Return default settings if empty response
        console.warn('Empty or invalid popup settings response');
        return { enabled: false };
      })
      .then(data => {
        console.log('Popup settings from API:', data);
        if (data) {
          setBg(data.bgImage || '');
          setEnabled(data.enabled || false);
          setStart(data.startDate || null);
          setEnd(data.endDate || null);
        }
      })
      .catch(error => {
        console.error('Error fetching popup settings:', error);
        // Disable popup on error
        setEnabled(false);
      });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const now = new Date();
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    if ((s && now < s) || (e && now > e)) return;
    setShow(true);
  }, [enabled, start, end]);

  if (!show) return null;

  const onClose = () => {
    setShow(false);
    setMessage(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email');
      return;
    }
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Subscribed successfully');
        setTimeout(() => onClose(), 2000);
      } else {
        setMessage(data.message || 'Failed to subscribe');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen">
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full relative flex flex-col items-center justify-center"
           style={{
             backgroundImage: bg ? `url(${bg})` : 'url(/images/newsletter-bg.jpg)',
             backgroundSize: 'cover',
             height: '50vh'
           }}>
        <button onClick={onClose} className="absolute top-2 right-2 text-black">✕</button>
        <div className="p-6 bg-white bg-opacity-90">
          <h2 className="text-2xl mb-4">Subscribe to our Newsletter</h2>
          <form onSubmit={onSubmit} className="flex flex-col items-center justify-center space-y-4">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border p-2 rounded mb-4"
            />
            <button type="submit" className="bg-primary text-white p-2 rounded">Subscribe</button>
          </form>
          {message && <div className="mt-4 text-center text-sm text-white bg-black bg-opacity-50 p-2 rounded">{message}</div>}
        </div>
      </div>
    </div>
  );
}
