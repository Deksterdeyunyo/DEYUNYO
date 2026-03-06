import React, { useState, useEffect } from 'react';
import { User, Seed, Distribution } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  Send, 
  LogOut, 
  Plus, 
  Search, 
  TrendingUp, 
  Users,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InventoryList from './InventoryList';
import DistributionForm from './DistributionForm';
import DistributionList from './DistributionList';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'distributions' | 'overview'>('overview');
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [seedsRes, distRes] = await Promise.all([
        fetch('/api/seeds'),
        fetch('/api/distributions')
      ]);
      if (seedsRes.ok) setSeeds(await seedsRes.json());
      if (distRes.ok) setDistributions(await distRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalSeeds: seeds.reduce((acc, s) => acc + s.quantity, 0),
    varieties: seeds.length,
    recentDist: distributions.slice(0, 5).length,
    lowStock: seeds.filter(s => s.quantity < 10).length
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-800">MAO Seed</h2>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Inventory v1.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              activeTab === 'overview' ? 'bg-[#5A5A40] text-white' : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              activeTab === 'inventory' ? 'bg-[#5A5A40] text-white' : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Inventory</span>
          </button>
          <button
            onClick={() => setActiveTab('distributions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              activeTab === 'distributions' ? 'bg-[#5A5A40] text-white' : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            <Send className="w-5 h-5" />
            <span className="font-medium">Distributions</span>
          </button>
        </nav>

        <div className="p-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-stone-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-stone-800 truncate">{user.username}</p>
                <p className="text-[10px] uppercase text-stone-400 font-bold">{user.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-medium text-stone-800">
              {activeTab === 'overview' && 'System Overview'}
              {activeTab === 'inventory' && 'Seed Inventory'}
              {activeTab === 'distributions' && 'Seed Distribution'}
            </h1>
            <p className="text-stone-500">Welcome back, {user.username}. Here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'inventory' && (
              <button 
                onClick={() => fetchData()}
                className="bg-white border border-stone-200 text-stone-700 px-6 py-2.5 rounded-full hover:bg-stone-50 transition-all font-medium flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Refresh
              </button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Stock" 
                  value={stats.totalSeeds.toLocaleString()} 
                  unit="Units"
                  icon={<Package className="text-emerald-600" />}
                  color="bg-emerald-50"
                />
                <StatCard 
                  title="Seed Varieties" 
                  value={stats.varieties} 
                  unit="Types"
                  icon={<TrendingUp className="text-blue-600" />}
                  color="bg-blue-50"
                />
                <StatCard 
                  title="Recent Distributions" 
                  value={stats.recentDist} 
                  unit="Last 30 days"
                  icon={<Send className="text-amber-600" />}
                  color="bg-amber-50"
                />
                <StatCard 
                  title="Low Stock Alert" 
                  value={stats.lowStock} 
                  unit="Varieties"
                  icon={<AlertCircle className="text-red-600" />}
                  color="bg-red-50"
                  alert={stats.lowStock > 0}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-stone-100">
                  <h3 className="text-xl font-serif font-medium mb-6">Recent Distributions</h3>
                  <DistributionList distributions={distributions.slice(0, 5)} compact />
                </div>
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-stone-100">
                  <h3 className="text-xl font-serif font-medium mb-6">Quick Distribution</h3>
                  <DistributionForm seeds={seeds} onComplete={fetchData} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <InventoryList seeds={seeds} onUpdate={fetchData} />
            </motion.div>
          )}

          {activeTab === 'distributions' && (
            <motion.div
              key="distributions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white rounded-[32px] p-8 shadow-sm border border-stone-100 h-fit">
                  <h3 className="text-xl font-serif font-medium mb-6">New Distribution</h3>
                  <DistributionForm seeds={seeds} onComplete={fetchData} />
                </div>
                <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-stone-100">
                  <h3 className="text-xl font-serif font-medium mb-6">Distribution History</h3>
                  <DistributionList distributions={distributions} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ title, value, unit, icon, color, alert }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
        {alert && (
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
        )}
      </div>
      <p className="text-stone-400 text-xs uppercase tracking-widest font-bold mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-3xl font-serif font-bold text-stone-800">{value}</h4>
        <span className="text-stone-400 text-sm">{unit}</span>
      </div>
    </div>
  );
}
