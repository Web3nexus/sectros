import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, CheckCircle2, XCircle, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function KioskMenuManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const tenantId = window.location.hostname.split('.')[0] || 'demo';

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/central-api/kiosk/${tenantId}/menu`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load menu', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStock = async (item) => {
    try {
      const res = await axios.post(`/central-api/kiosk/${tenantId}/menu/${item.id}/toggle-stock`);
      // Update local state
      setCategories(prev => prev.map(cat => ({
        ...cat,
        items: cat.items.map(it => it.id === item.id ? { ...it, is_available: res.data.is_available } : it)
      })));
    } catch (err) {
      alert('Failed to toggle stock status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Utensils className="w-7 h-7 text-blue-500" />
            Kiosk Menu & 86 Item Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time digital menu availability. Tap to 86 / mark dishes out of stock instantly across all kiosks.
          </p>
        </div>

        <button
          onClick={fetchMenu}
          className="flex items-center gap-2 bg-secondary hover:bg-muted text-foreground border border-border text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Status
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search dish name (e.g. Ribeye, Burger, Pasta)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
        />
      </div>

      {/* Menu Categories Grid */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground text-sm">Loading kiosk dishes...</div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => {
            const filteredItems = cat.items?.filter(it => it.name.toLowerCase().includes(search.toLowerCase())) || [];
            if (filteredItems.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span>{cat.name}</span>
                  <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-md font-semibold text-foreground">
                    {filteredItems.length} items
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => {
                    const inStock = item.is_available !== false;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleStock(item)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                          inStock
                            ? 'bg-card border-border hover:border-blue-500/50 shadow-sm'
                            : 'bg-rose-500/5 border-rose-500/30 opacity-75'
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className={`font-bold text-sm ${inStock ? 'text-foreground' : 'text-rose-400 line-through'}`}>
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">€{parseFloat(item.price).toFixed(2)}</p>
                        </div>

                        <div className="shrink-0">
                          {inStock ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> IN STOCK
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                              <XCircle className="w-3.5 h-3.5" /> 86'D (OUT)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

