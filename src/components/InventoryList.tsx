import React, { useState } from 'react';
import { Seed } from '../types';
import { Plus, Edit2, Trash2, Search, X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryListProps {
  seeds: Seed[];
  onUpdate: () => void;
}

export default function InventoryList({ seeds, onUpdate }: InventoryListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    quantity: 0,
    unit: 'kg',
    category: 'Vegetable'
  });

  const filteredSeeds = seeds.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.variety.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingId ? `/api/seeds/${editingId}` : '/api/seeds';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onUpdate();
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', variety: '', quantity: 0, unit: 'kg', category: 'Vegetable' });
      }
    } catch (err) {
      console.error('Operation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`/api/seeds/${id}`, { method: 'DELETE' });
      if (res.ok) onUpdate();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const startEdit = (seed: Seed) => {
    setEditingId(seed.id);
    setFormData({
      name: seed.name,
      variety: seed.variety,
      quantity: seed.quantity,
      unit: seed.unit,
      category: seed.category
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search seeds or varieties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ name: '', variety: '', quantity: 0, unit: 'kg', category: 'Vegetable' });
          }}
          className="bg-[#5A5A40] text-white px-8 py-3 rounded-full hover:bg-[#4A4A30] transition-all font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Seed
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-[32px] p-8 border border-stone-200 shadow-sm overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-medium">{editingId ? 'Edit Seed' : 'Add New Seed'}</h3>
              <button onClick={() => setIsAdding(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Seed Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Rice, Corn, Tomato"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Variety</label>
                <input
                  type="text"
                  required
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. NSIC Rc 222"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option>Vegetable</option>
                  <option>Cereal</option>
                  <option>Legume</option>
                  <option>Fruit</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option>kg</option>
                  <option>bags (20kg)</option>
                  <option>bags (40kg)</option>
                  <option>packets</option>
                  <option>grams</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-all font-medium flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> {editingId ? 'Update' : 'Save'} Seed</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[32px] overflow-hidden border border-stone-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="px-8 py-5 text-xs uppercase tracking-widest font-bold text-stone-400">Seed & Variety</th>
              <th className="px-8 py-5 text-xs uppercase tracking-widest font-bold text-stone-400">Category</th>
              <th className="px-8 py-5 text-xs uppercase tracking-widest font-bold text-stone-400">Stock Level</th>
              <th className="px-8 py-5 text-xs uppercase tracking-widest font-bold text-stone-400">Last Updated</th>
              <th className="px-8 py-5 text-xs uppercase tracking-widest font-bold text-stone-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {filteredSeeds.map((seed) => (
              <tr key={seed.id} className="hover:bg-stone-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="font-medium text-stone-800">{seed.name}</div>
                  <div className="text-sm text-stone-400 italic">{seed.variety}</div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-full uppercase">
                    {seed.category}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${seed.quantity < 10 ? 'text-red-500' : 'text-stone-800'}`}>
                      {seed.quantity}
                    </span>
                    <span className="text-xs text-stone-400 uppercase font-bold">{seed.unit}</span>
                  </div>
                  {seed.quantity < 10 && (
                    <div className="text-[10px] text-red-400 font-bold uppercase mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Low Stock
                    </div>
                  )}
                </td>
                <td className="px-8 py-5 text-sm text-stone-500">
                  {new Date(seed.last_updated).toLocaleDateString()}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(seed)}
                      className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(seed.id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSeeds.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-stone-400 italic">
                  No seeds found in inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
