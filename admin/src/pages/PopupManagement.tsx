import React, { useState, useEffect } from 'react';
import { DateRange, Range } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// --- Helper for validation ---
function validatePopupSettings(settings: any) {
  if (typeof settings.enabled !== 'boolean') return 'Enabled/Disabled is required';
  if (!settings.startDate) return 'Start date is required';
  if (!settings.endDate) return 'End date is required';
  if (!settings.bgImage) return 'Background image is required';
  return null;
}

export default function Popup() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [range, setRange] = useState<Range[]>([
    { startDate: new Date(), endDate: new Date(), key: 'selection' }
  ]);
  const [bg, setBg] = useState<string>('');
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<{ email: string; subscribedAt: string }[]>([]);

  // --- Fetch settings from API on mount ---
  useEffect(() => {
    setLoading(true);
    fetch('/api/popup-settings')
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data) {
          setEnabled(!!data.enabled);
          if (data.startDate && data.endDate) {
            setRange([{ startDate: new Date(data.startDate), endDate: new Date(data.endDate), key: 'selection' }]);
          }
          setBg(data.bgImage || '');
          setMode(data.bgImage?.startsWith('http') ? 'url' : 'upload');
          setUrlInput(data.bgImage || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // --- Fetch newsletter subscribers ---
  useEffect(() => {
    fetch('/admin/api/newsletter/subscribers')
      .then(res => res.json())
      .then(data => setSubscribers(data))
      .catch(() => {});
  }, []);

  // --- Edit and Save logic ---
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const payload = {
      enabled,
      startDate: range[0]?.startDate?.toISOString(),
      endDate: range[0]?.endDate?.toISOString(),
      bgImage: bg,
    };
    // Validate before sending
    const err = validatePopupSettings(payload);
    if (err) {
      setMessage(err);
      setSaving(false);
      return;
    }
    try {
      const res = await fetch('/api/popup-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Popup settings saved!');
        // Update UI with saved settings
        setEnabled(!!data.enabled);
        if (data.startDate && data.endDate) {
          setRange([{ startDate: new Date(data.startDate), endDate: new Date(data.endDate), key: 'selection' }]);
        }
        setBg(data.bgImage || '');
        setMode(data.bgImage?.startsWith('http') ? 'url' : 'upload');
        setUrlInput(data.bgImage || '');
        setEditMode(false);
      } else {
        setMessage('Error: ' + (data.message || 'Failed to save'));
      }
    } catch (err) {
      setMessage('Network or server error');
    } finally {
      setSaving(false);
    }
  };

  // --- Handlers only update state in edit mode ---
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editMode) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBg(dataUrl);
      setUrlInput(dataUrl);
    };
    reader.readAsDataURL(file);
  };
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editMode) return;
    const val = e.target.value;
    setUrlInput(val);
    setBg(val);
  };
  const toggleEnabled = () => {
    if (!editMode) return;
    setEnabled((prev) => !prev);
  };
  const onRangeChange = (item: any) => {
    if (!editMode) return;
    const sel = item.selection;
    setRange([sel]);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Popup Settings</h1>
      <div className="flex items-center mb-4">
        <label className="mr-2">Enable Popup:</label>
        <input type="checkbox" checked={enabled} onChange={toggleEnabled} disabled={!editMode} />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Select Date Range:</label>
        <DateRange
          editableDateInputs={editMode}
          onChange={onRangeChange}
          moveRangeOnFirstSelection={false}
          ranges={range}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Popup Background:</label>
        <div className="flex items-center space-x-4 mb-2">
          <label className="flex items-center"><input type="radio" checked={mode==='upload'} onChange={()=>editMode && setMode('upload')} className="mr-1" disabled={!editMode}/> Upload</label>
          <label className="flex items-center"><input type="radio" checked={mode==='url'} onChange={()=>editMode && setMode('url')} className="mr-1" disabled={!editMode}/> URL</label>
        </div>
        {mode === 'upload' ? (
          <input type="file" accept="image/*" onChange={handleFile} disabled={!editMode}/>
        ) : (
          <input type="text" value={urlInput} onChange={handleUrlChange} placeholder="Image URL" className="w-full mt-2" disabled={!editMode}/>
        )}
        {bg && <img src={bg} alt="Popup background" className="h-24 mt-2 rounded" />}  
      </div>
      <div className="mt-6 flex items-center space-x-4">
        {!editMode ? (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={()=>setEditMode(true)}
          >Edit</button>
        ) : (
          <>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >{saving ? 'Saving...' : 'Save'}</button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              onClick={()=>setEditMode(false)}
              disabled={saving}
            >Cancel</button>
          </>
        )}
        {message && <div className="ml-4 text-sm text-red-600">{message}</div>}
      </div>
      {/* Newsletter Subscribers List */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Newsletter Subscribers</h2>
        {subscribers.length ? (
          <ul className="list-disc list-inside space-y-1 max-h-40 overflow-auto">
            {subscribers.map((s, i) => (
              <li key={i} className="text-sm">
                {s.email} &ndash; {new Date(s.subscribedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No subscribers yet.</p>
        )}
      </div>
    </div>
  );
}
