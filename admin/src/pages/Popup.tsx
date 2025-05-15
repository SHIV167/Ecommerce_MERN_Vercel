import React, { useState, useEffect } from 'react';
import { DateRange, Range } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { apiRequest } from '@/lib/queryClient';

export default function Popup() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [range, setRange] = useState<Range[]>([
    { startDate: new Date(), endDate: new Date(), key: 'selection' }
  ]);
  const [bgImage, setBgImage] = useState<string>("");
  const [showSaved, setShowSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // newsletter subscribers
  const [subscribers, setSubscribers] = useState<{ email: string; subscribedAt: string }[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/popup-settings')
      .then(res => res.json())
      .then(data => {
        setEnabled(data.enabled);
        setRange([{ startDate: new Date(data.startDate), endDate: new Date(data.endDate), key: 'selection' }]);
        setBgImage(data.bgImage);
      });
  }, []);

  // fetch newsletter subscribers
  useEffect(() => {
    apiRequest('GET', '/api/newsletter/subscribers')
      .then(res => res.json())
      .then(data => {
        setSubscribers(data);
        setSubsLoading(false);
      })
      .catch(() => setSubsLoading(false));
  }, []);

  const toggleEnabled = () => {
    setEnabled(v => !v);
  };

  const onRangeChange = (item: any) => {
    const sel = item.selection;
    setRange([sel]);
  };

  const onBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBgImage(e.target.value);
  };

  const handleSave = async () => {
    setFormError(null);
    if (!bgImage || !range[0]?.startDate || !range[0]?.endDate) {
      setFormError('All fields are required.');
      return;
    }
    const res = await fetch('/api/popup-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enabled,
        startDate: range[0]?.startDate?.toISOString(),
        endDate: range[0]?.endDate?.toISOString(),
        bgImage,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFormError(data.message || 'Failed to save settings.');
      return;
    }
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Popup</h1>
      <div className="flex items-center mb-4">
        <label className="mr-2">Enable Popup:</label>
        <input type="checkbox" checked={enabled} onChange={toggleEnabled} />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Popup Background Image URL:</label>
        <input
          type="text"
          value={bgImage}
          onChange={onBgImageChange}
          className="border px-2 py-1 rounded w-full"
          placeholder="https://example.com/image.jpg"
        />
        {bgImage && (
          <img src={bgImage} alt="Popup Preview" className="mt-2 max-h-32 rounded shadow" />
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-2">Select Date Range:</label>
        <DateRange
          editableDateInputs={true}
          onChange={onRangeChange}
          moveRangeOnFirstSelection={false}
          ranges={range}
        />
      </div>
      <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">Save</button>
      {showSaved && <span className="ml-4 text-green-600">Saved!</span>}
      {formError && <div className="text-red-600 mt-2">{formError}</div>}

      {/* Newsletter Subscribers Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Newsletter Subscribers</h2>
        {subsLoading ? (
          <div>Loading subscribers...</div>
        ) : (
          <div className="overflow-auto max-h-64">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr><th className="border p-2">Email</th><th className="border p-2">Subscribed At</th></tr>
              </thead>
              <tbody>
                {subscribers.map(sub => (
                  <tr key={sub.email}>
                    <td className="border p-2">{sub.email}</td>
                    <td className="border p-2">{new Date(sub.subscribedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
