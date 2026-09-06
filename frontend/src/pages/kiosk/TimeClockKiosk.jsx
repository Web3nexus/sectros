import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Square, Coffee, CheckCircle2, User, AlertCircle, LogOut } from 'lucide-react';
import axios from 'axios';

export default function TimeClockKiosk() {
  const [pin, setPin] = useState('');
  const [staff, setStaff] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const tenantId = window.location.hostname.split('.')[0] || 'demo';

  const handlePinSubmit = async (enteredPin) => {
    setError(null);
    try {
      const res = await axios.post(`/central-api/kiosk/${tenantId}/punch-clock/pin`, { pin: enteredPin });
      setStaff(res.data.staff);
      setIsClockedIn(res.data.is_clocked_in);
    } catch (err) {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const next = pin + num;
      setPin(next);
      if (next.length === 4) {
        handlePinSubmit(next);
      }
    }
  };

  const handleAction = async (action) => {
    if (!staff) return;
    try {
      const res = await axios.post(`/central-api/kiosk/${tenantId}/punch-clock/action`, {
        staff_profile_id: staff.id,
        action,
      });
      setMessage(res.data.message);
      setTimeout(() => {
        setStaff(null);
        setPin('');
        setMessage(null);
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-8 select-none font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between z-10 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Staff Time Clock Terminal</h1>
            <p className="text-xs text-slate-400">Wall punch clock for team shift attendance</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-mono font-black text-white">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <span className="text-xs text-slate-400">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-sm w-full mx-auto py-8 z-10">
        <AnimatePresence mode="wait">
          {!staff ? (
            <motion.div
              key="pin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center text-center space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black text-white">Enter Your 4-Digit PIN</h2>
                <p className="text-xs text-slate-400 mt-1">Tap your employee passcode to punch clock</p>
              </div>

              <div className="flex items-center gap-4 py-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full transition-all duration-200 ${
                      pin.length > i
                        ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/50'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))}
              </div>

              {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

              <div className="grid grid-cols-3 gap-3 w-full pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    className="h-16 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-2xl font-bold transition-all active:scale-95 shadow-sm"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setPin('')}
                  className="h-16 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/50 text-xs font-bold text-slate-400"
                >
                  CLEAR
                </button>
                <button
                  onClick={() => handleKeyPress('0')}
                  className="h-16 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-2xl font-bold transition-all active:scale-95 shadow-sm"
                >
                  0
                </button>
                <button
                  onClick={() => setPin(prev => prev.slice(0, -1))}
                  className="h-16 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/50 text-xs font-bold text-slate-400"
                >
                  DEL
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="action"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto text-xl font-black">
                {staff.name?.charAt(0)}
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">{staff.name}</h2>
                <p className="text-xs text-slate-400 mt-1 capitalize">{staff.role || 'Service Staff'}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                  Status: {isClockedIn ? 'Currently Clocked In' : 'Currently Off Shift'}
                </div>
              </div>

              {message ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {message}
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {!isClockedIn ? (
                    <button
                      onClick={() => handleAction('clock_in')}
                      className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all active:scale-95"
                    >
                      <Play className="w-5 h-5 fill-white" /> CLOCK IN (START SHIFT)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('clock_out')}
                      className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 transition-all active:scale-95"
                    >
                      <Square className="w-5 h-5 fill-white" /> CLOCK OUT (END SHIFT)
                    </button>
                  )}

                  <button
                    onClick={() => { setStaff(null); setPin(''); }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 z-10">
        Sectros Wall Time Clock Terminal
      </footer>
    </div>
  );
}

