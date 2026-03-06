import React from 'react';
import { Distribution } from '../types';
import { Calendar, User, Package } from 'lucide-react';

interface DistributionListProps {
  distributions: Distribution[];
  compact?: boolean;
}

export default function DistributionList({ distributions, compact }: DistributionListProps) {
  if (distributions.length === 0) {
    return (
      <div className="py-12 text-center text-stone-400 italic">
        No distributions recorded yet.
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {distributions.map((dist) => (
          <div key={dist.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-stone-100">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-800">{dist.seed_name}</p>
                <p className="text-xs text-stone-400">to {dist.recipient}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-stone-800">-{dist.quantity}</p>
              <p className="text-[10px] text-stone-400 uppercase font-bold">{new Date(dist.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-100">
            <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-400">Date</th>
            <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-400">Recipient</th>
            <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-400">Seed Variety</th>
            <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-400 text-right">Quantity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {distributions.map((dist) => (
            <tr key={dist.id} className="hover:bg-stone-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-stone-600">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span className="text-sm">{new Date(dist.date).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-stone-800 font-medium">
                  <User className="w-4 h-4 text-stone-400" />
                  <span>{dist.recipient}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-stone-600">{dist.seed_name}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="font-mono font-bold text-red-500">-{dist.quantity}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
