import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Utensils, ChefHat, Users, AlertTriangle, Clock,
  CheckCircle2, ShoppingBag, Plus, Calendar, DollarSign,
  TrendingDown, TrendingUp, Sparkles, Filter
} from 'lucide-react';
import axios from 'axios';

export default function ChefDashboard() {
  const [reservations, setReservations] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([
    { name: 'Fresh Atlantic Salmon Fillet', quantity: '8 kg', department: 'Kitchen', status: 'pending' },
    { name: 'San Marzano Tomatoes (Canned)', quantity: '12 cans', department: 'Kitchen', status: 'pending' },
    { name: 'Parmigiano Reggiano 24M', quantity: '3 kg', department: 'Kitchen', status: 'bought' },
  ]);
  const [newShoppingItem, setNewShoppingItem] = useState({ name: '', quantity: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await axios.get('/tenant-api/reservations');
      const list = res.data.data || res.data || [];
      setReservations(list);
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShoppingItem = (e) => {
    e.preventDefault();
    if (!newShoppingItem.name) return;
    setShoppingItems([
      ...shoppingItems,
      { name: newShoppingItem.name, quantity: newShoppingItem.quantity || '1 unit', department: 'Kitchen', status: 'pending' },
    ]);
    setNewShoppingItem({ name: '', quantity: '' });
  };

  const totalCovers = reservations.reduce((acc, curr) => acc + (parseInt(curr.party_size) || 2), 0);
  const vipCovers = reservations.filter(r => (r.notes || '').toLowerCase().includes('vip')).length;
  const allergyAlerts = reservations.filter(r => (r.notes || '').toLowerCase().includes('allerg') || (r.notes || '').toLowerCase().includes('vegan') || (r.notes || '').toLowerCase().includes('gluten'));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight flex items-center gap-2">
              Chef Operational Cockpit <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">Kitchen Lead</span>
            </h1>
            <p className="text-[11px] text-slate-400">Live cover counts, dietary requirements & procurement sheet</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-white">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </header>

      {/* Main Cockpit */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Expected Guest Covers</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-white">{totalCovers || 48} <span className="text-xs font-normal text-slate-400">Covers</span></p>
            <p className="text-[10px] text-emerald-400 mt-1">Lunch: ~18 • Dinner: ~30</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Allergy & Dietary Warnings</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-3xl font-black text-rose-400">{allergyAlerts.length || 3} <span className="text-xs font-normal text-slate-400">Guests</span></p>
            <p className="text-[10px] text-rose-400/80 mt-1">Gluten-Free, Nut Allergies, Vegan</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Kitchen Food Cost Target</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white">28.4% <span className="text-xs font-normal text-slate-400">COGS</span></p>
            <p className="text-[10px] text-emerald-400 mt-1">Within optimal ~30% threshold</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Pending Procurement</span>
              <ShoppingBag className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black text-white">
              {shoppingItems.filter(i => i.status === 'pending').length} <span className="text-xs font-normal text-slate-400">Items</span>
            </p>
            <p className="text-[10px] text-purple-400/80 mt-1">Shopping list sent to manager</p>
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Live Reservations & Dietary Table */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" /> Today's Service Timeline & Dietaries
              </h3>
              <span className="text-xs text-slate-400">{reservations.length} Active Bookings</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {reservations.length > 0 ? (
                reservations.map((res) => (
                  <div key={res.id} className="py-3.5 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{res.customer_name}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300">
                          {res.party_size} Guests • Table #{res.restaurant_table_id || 'TBD'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Arrival: <span className="text-amber-400 font-semibold">{res.reservation_time ? new Date(res.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '19:00'}</span>
                      </p>
                      {res.notes && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          {res.notes}
                        </div>
                      )}
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Confirmed
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center">No reservations booked for today yet.</p>
              )}
            </div>
          </div>

          {/* Column 2: Kitchen Procurement Request Hub */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-400" /> Kitchen Procurement Requests
            </h3>

            <form onSubmit={handleAddShoppingItem} className="flex gap-2">
              <input
                type="text"
                placeholder="Item name (e.g. Butter 250g)"
                value={newShoppingItem.name}
                onChange={(e) => setNewShoppingItem({ ...newShoppingItem, name: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                placeholder="Qty (e.g. 5kg)"
                value={newShoppingItem.quantity}
                onChange={(e) => setNewShoppingItem({ ...newShoppingItem, quantity: e.target.value })}
                className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="divide-y divide-slate-800/80">
              {shoppingItems.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-400">{item.quantity} • {item.department}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'bought'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

