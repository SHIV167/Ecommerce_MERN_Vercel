import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

interface Store {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  type: string;
  notes: string;
  isActive: boolean;
  latitude: number;
  longitude: number;
}

export default function StoreLocator() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/stores`)
      .then(res => res.json())
      .then(data => {
        setStores(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch stores");
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-primary">Store Locator</h1>
      {loading && <div>Loading stores...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map(store => (
          <div key={store._id} className="bg-white rounded shadow p-6 border border-neutral-200">
            <h2 className="text-xl font-semibold mb-2 text-primary">{store.name}</h2>
            <div className="mb-1 text-neutral-700">{store.address}</div>
            <div className="mb-1 text-neutral-600">{store.city}, {store.state}</div>
            <div className="mb-1 text-neutral-600">Phone: {store.phone}</div>
            <div className="mb-1 text-neutral-600">Email: {store.email}</div>
            <div className="mb-1 text-neutral-600">Website: <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{store.website}</a></div>
            <div className="mb-1 text-neutral-600">Hours: {store.hours}</div>
            <div className="mb-1 text-neutral-600">Type: {store.type}</div>
            <div className="mb-1 text-neutral-600">Notes: {store.notes}</div>
            <div className="mb-1 text-neutral-600">Status: {store.isActive ? <span className="text-green-700 font-semibold">Open</span> : <span className="text-red-700 font-semibold">Closed</span>}</div>
            <div className="mt-2 text-xs text-neutral-400">Lat: {store.latitude}, Lng: {store.longitude}</div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.latitude + ',' + store.longitude)}&destination_place_id=`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Go to Directions
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
