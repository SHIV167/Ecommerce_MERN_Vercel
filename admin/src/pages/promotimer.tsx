import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

interface PromoTimer {
  _id: string;
  productId: string;
  endTime: string;
  enabled: boolean;
}

export default function PromoTimerPage(): JSX.Element {
  const [timers, setTimers] = useState<PromoTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<PromoTimer>>({ enabled: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTimers();
  }, []);

  async function fetchTimers() {
    setLoading(true);
    const res = await apiRequest("GET", "/api/promotimers");
    setTimers(await res.json());
    setLoading(false);
  }

  function startEdit(timer: PromoTimer) {
    setEditingId(timer._id);
    setForm({ ...timer });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ enabled: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productId || !form.endTime) return;
    if (editingId) {
      await apiRequest("PUT", `/api/promotimers/${editingId}`, form);
    } else {
      await apiRequest("POST", "/api/promotimers", form);
    }
    resetForm();
    fetchTimers();
  }

  async function handleDelete(id: string) {
    await apiRequest("DELETE", `/api/promotimers/${id}`);
    fetchTimers();
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Promo Timer Management</h1>
      <form onSubmit={handleSubmit} className="mb-8 bg-white rounded shadow p-4 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product ID or Slug</label>
          <input
            className="input"
            value={form.productId || ""}
            onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
            placeholder="Product ID or slug"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input
            className="input"
            type="datetime-local"
            value={form.endTime ? form.endTime.slice(0, 16) : ""}
            onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!form.enabled}
            onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
            id="enabled"
          />
          <label htmlFor="enabled" className="text-sm">Enabled</label>
        </div>
        <div className="flex gap-2">
          <Button type="submit">{editingId ? "Update" : "Add"} Promo Timer</Button>
          {editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
        </div>
      </form>
      <h2 className="text-lg font-semibold mb-2">Current Promo Timers</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Product</th>
              <th className="p-2">End Time</th>
              <th className="p-2">Enabled</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timers.map(timer => (
              <tr key={timer._id} className="border-b">
                <td className="p-2">{timer.productId}</td>
                <td className="p-2">{new Date(timer.endTime).toLocaleString()}</td>
                <td className="p-2">{timer.enabled ? "Yes" : "No"}</td>
                <td className="p-2 flex gap-2">
                  <Button type="button" size="sm" onClick={() => startEdit(timer)}>Edit</Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(timer._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
