import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, Phone, User, Calendar, Clock, Utensils, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function WalkInCheckInKiosk() {
  const [step, setStep] = useState(1); // 1: Party size, 2: Details, 3: Success
  const [partySize, setPartySize] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [seatingPref, setSeatingPref] = useState('any');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const tenantId = window.location.hostname.split('.')[0] || 'demo';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`/central-api/kiosk/${tenantId}/walk-in`, {
        customer_name: customerName,
        phone,
        party_size: partySize,
        seating_preference: seatingPref,
        dietary_notes: dietaryNotes,
      });
      setSuccessInfo(res.data);
      setStep(3);
    } catch (err) {
      alert('Could not register walk-in. Please speak to our host.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPartySize(2);
    setCustomerName('');
    setPhone('');
    setSeatingPref('any');
    setDietaryNotes('');
    setSuccessInfo(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 select-none relative overflow-hidden font-sans">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between z-10 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/30">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Walk-in Table Check-in</h1>
            <p className="text-xs text-slate-400">Instant host seating & table assignment</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">Current Time</span>
          <p className="text-sm font-bold text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </header>

      {/* Main Form Flow */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-lg w-full mx-auto py-8 z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full text-center space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white">How many guests in your party?</h2>
                <p className="text-sm text-slate-400 mt-2">Select the number of seats you need</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => { setPartySize(num); setStep(2); }}
                    className={`h-20 rounded-3xl text-2xl font-black border transition-all active:scale-95 shadow-lg ${
                      partySize === num
                        ? 'bg-blue-600 border-blue-500 text-white shadow-blue-600/30'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl space-y-6 shadow-2xl"
            >
              <div className="text-center">
                <h2 className="text-2xl font-black text-white">Party of {partySize} Guests</h2>
                <p className="text-xs text-slate-400 mt-1">Please enter your contact details for SMS notification</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Your Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Mobile Phone (for Table SMS)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+49 170 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Seating Preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['any', 'indoor', 'outdoor'].map((pref) => (
                      <button
                        type="button"
                        key={pref}
                        onClick={() => setSeatingPref(pref)}
                        className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                          seatingPref === pref
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Assigning Table...' : 'Confirm Walk-In Check-In'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-3xl font-black text-white">You're Checked In!</h2>
                <p className="text-sm text-slate-300 mt-2 font-medium">{successInfo?.message}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400">Assigned Seating:</span>
                <p className="text-2xl font-black text-emerald-400">{successInfo?.assigned_table || 'Table #4'}</p>
              </div>

              <button
                onClick={resetForm}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
              >
                Done (Reset Kiosk)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 z-10">
        Sectros Smart Kiosk Terminal • Touch anywhere to interact
      </footer>
    </div>
  );
}

