import React, { useState, useMemo } from 'react';
import { Distribution } from '../types';
import { Calendar, User, Package, Search, Printer, MapPin, Phone, Filter } from 'lucide-react';

interface DistributionListProps {
  distributions: Distribution[];
  compact?: boolean;
}

export default function DistributionList({ distributions, compact }: DistributionListProps) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredDistributions = useMemo(() => {
    return distributions.filter(dist => {
      const matchesSearch = 
        dist.recipient.toLowerCase().includes(search.toLowerCase()) ||
        (dist.seed_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (dist.address?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (dist.contact_number?.toLowerCase() || '').includes(search.toLowerCase());
      
      const matchesDate = !dateFilter || dist.date.startsWith(dateFilter);
      
      return matchesSearch && matchesDate;
    });
  }, [distributions, search, dateFilter]);

  const handlePrint = () => {
    window.print();
  };

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
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search recipient, seed, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <button
          onClick={handlePrint}
          className="bg-white border border-stone-200 text-stone-700 px-6 py-3 rounded-2xl hover:bg-stone-50 transition-all font-medium flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Report
        </button>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden border border-stone-100 shadow-sm print:border-none print:shadow-none">
        <div className="hidden print:block p-8 text-center border-b border-stone-100 mb-6">
          <h1 className="text-2xl font-serif font-bold text-stone-800">MAO Seed Distribution Report</h1>
          <p className="text-stone-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100 print:bg-transparent">
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-400 print:text-stone-800">Date</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-400 print:text-stone-800">Recipient Info</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-400 print:text-stone-800">Seed Variety</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest font-bold text-stone-400 text-right print:text-stone-800">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {filteredDistributions.map((dist) => (
              <tr key={dist.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 align-top">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Calendar className="w-4 h-4 text-stone-400 print:hidden" />
                    <span className="text-sm">{new Date(dist.date).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-stone-800 font-medium">
                      <User className="w-4 h-4 text-stone-400 print:hidden" />
                      <span>{dist.recipient}</span>
                    </div>
                    {dist.address && (
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <MapPin className="w-3 h-3 text-stone-300 print:hidden" />
                        <span>{dist.address}</span>
                      </div>
                    )}
                    {dist.contact_number && (
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Phone className="w-3 h-3 text-stone-300 print:hidden" />
                        <span>{dist.contact_number}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <span className="text-stone-600">{dist.seed_name}</span>
                </td>
                <td className="px-6 py-4 text-right align-top">
                  <span className="font-mono font-bold text-red-500">-{dist.quantity}</span>
                </td>
              </tr>
            ))}
            {filteredDistributions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-stone-400 italic">
                  No distributions match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
