import React, { useState } from 'react';
import { Seed } from '../types';
import { Check, Loader2, Send } from 'lucide-react';

interface DistributionFormProps {
  seeds: Seed[];
  onComplete: () => void;
}

export default function DistributionForm({ seeds, onComplete }: DistributionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    seed_id: '',
    recipient: '',
    address: '',
    contact_number: '',
    quantity: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seed_id) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/distributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          seed_id: parseInt(formData.seed_id)
        }),
      });
      if (res.ok) {
        onComplete();
        setFormData({ seed_id: '', recipient: '', address: '', contact_number: '', quantity: 0 });
      } else {
        const data = await res.json();
        setError(data.error || 'Distribution failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedSeed = seeds.find(s => s.id === parseInt(formData.seed_id));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Select Seed</label>
        <select
          required
          value={formData.seed_id}
          onChange={(e) => setFormData({ ...formData, seed_id: e.target.value })}
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">Choose a seed...</option>
          {seeds.map(seed => (
            <option key={seed.id} value={seed.id} disabled={seed.quantity <= 0}>
              {seed.name} ({seed.variety}) - {seed.quantity} {seed.unit} available
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Recipient Name</label>
        <input
          type="text"
          required
          value={formData.recipient}
          onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          placeholder="e.g. Juan Dela Cruz"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Address</label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          placeholder="e.g. Brgy. San Jose, City"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Contact Number</label>
        <input
          type="text"
          required
          value={formData.contact_number}
          onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          placeholder="e.g. 09123456789"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Quantity to Distribute</label>
        <div className="flex gap-2">
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            max={selectedSeed?.quantity}
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
            className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <div className="bg-stone-100 px-4 py-3 rounded-xl text-stone-500 font-medium flex items-center">
            {selectedSeed?.unit || 'unit'}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading || !formData.seed_id}
        className="w-full bg-[#5A5A40] text-white py-4 rounded-full hover:bg-[#4A4A30] transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Record Distribution</>}
      </button>
    </form>
  );
}
