import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Store {
  _id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  type: 'Standalone' | 'Mall' | 'Partner';
  notes: string;
  isActive: boolean;
  latitude: number;
  longitude: number;
}

const apiBase = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

export default function StoreManagePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Store>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    const res = await fetch(`${apiBase}/api/stores`);
    const data = await res.json();
    setStores(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city || !form.state || !form.latitude || !form.longitude) return;
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${apiBase}/api/stores/${editingId}`
      : `${apiBase}/api/stores`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({});
    setEditingId(null);
    fetchStores();
  };

  const handleEdit = (store: Store) => {
    setForm(store);
    setEditingId(store._id!);
  };

  const handleDelete = async (id: string) => {
    await fetch(`${apiBase}/api/stores/${id}`, { method: "DELETE" });
    fetchStores();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Store Manager</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <input
          className="input input-bordered"
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          placeholder="Store Name"
          required
        />
        <input
          className="input input-bordered"
          name="address"
          value={form.address || ""}
          onChange={handleChange}
          placeholder="Address"
          required
        />
        <input
          className="input input-bordered"
          name="city"
          value={form.city || ""}
          onChange={handleChange}
          placeholder="City"
          required
        />
        <input
          className="input input-bordered"
          name="state"
          value={form.state || ""}
          onChange={handleChange}
          placeholder="State"
          required
        />
        <input
          className="input input-bordered"
          name="phone"
          value={form.phone || ""}
          onChange={handleChange}
          placeholder="Phone"
          pattern="^\\+?[0-9()\\-\\s]{7,20}$"
          title="Enter a valid phone number (digits, spaces, dashes, parentheses, optional '+')"
        />
        <input
          className="input input-bordered"
          name="email"
          type="email"
          value={form.email || ""}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          className="input input-bordered"
          name="website"
          type="url"
          value={form.website || ""}
          onChange={handleChange}
          placeholder="Website"
        />
        <input
          className="input input-bordered"
          name="hours"
          value={form.hours || ""}
          onChange={handleChange}
          placeholder="Hours (e.g. 10am-9pm)"
        />
        <select
          className="input input-bordered"
          name="type"
          value={form.type || "Standalone"}
          onChange={e => setForm(prev => ({ ...prev, type: e.target.value as Store["type"] }))}
        >
          <option value="Standalone">Standalone</option>
          <option value="Mall">Mall</option>
          <option value="Partner">Partner</option>
        </select>
        <input
          className="input input-bordered"
          name="notes"
          value={form.notes || ""}
          onChange={handleChange}
          placeholder="Notes"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive !== false}
            onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
          />
          Active
        </label>
        <input
          className="input input-bordered"
          name="latitude"
          type="number"
          step="any"
          value={form.latitude || ""}
          onChange={handleChange}
          placeholder="Latitude"
          required
        />
        <input
          className="input input-bordered"
          name="longitude"
          type="number"
          step="any"
          value={form.longitude || ""}
          onChange={handleChange}
          placeholder="Longitude"
          required
        />
        <div className="col-span-full flex items-center gap-4 mt-4">
          <Button type="submit" className="bg-primary text-white">
            {editingId ? "Update Store" : "Add Store"}
          </Button>
          {editingId && (
            <Button type="button" onClick={() => { setForm({}); setEditingId(null); }} className="bg-gray-400 text-white">
              Cancel
            </Button>
          )}
        </div>
      </form>
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">All Stores</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-neutral-100">
                <th className="px-2 py-1 border">Name</th>
                <th className="px-2 py-1 border">Address</th>
                <th className="px-2 py-1 border">City</th>
                <th className="px-2 py-1 border">State</th>
                <th className="px-2 py-1 border">Phone</th>
                <th className="px-2 py-1 border">Email</th>
                <th className="px-2 py-1 border">Website</th>
                <th className="px-2 py-1 border">Hours</th>
                <th className="px-2 py-1 border">Type</th>
                <th className="px-2 py-1 border">Notes</th>
                <th className="px-2 py-1 border">Active</th>
                <th className="px-2 py-1 border">Latitude</th>
                <th className="px-2 py-1 border">Longitude</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store._id}>
                  <td className="border px-2 py-1">{store.name}</td>
                  <td className="border px-2 py-1">{store.address}</td>
                  <td className="border px-2 py-1">{store.city}</td>
                  <td className="border px-2 py-1">{store.state}</td>
                  <td className="border px-2 py-1">{store.phone}</td>
                  <td className="border px-2 py-1">{store.email}</td>
                  <td className="border px-2 py-1">{store.website}</td>
                  <td className="border px-2 py-1">{store.hours}</td>
                  <td className="border px-2 py-1">{store.type}</td>
                  <td className="border px-2 py-1">{store.notes}</td>
                  <td className="border px-2 py-1">{store.isActive ? 'Yes' : 'No'}</td>
                  <td className="border px-2 py-1">{store.latitude}</td>
                  <td className="border px-2 py-1">{store.longitude}</td>
                  <td className="border px-2 py-1 flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(store)} className="bg-yellow-400 text-white">Edit</Button>
                    <Button size="sm" onClick={() => handleDelete(store._id!)} className="bg-red-500 text-white">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
