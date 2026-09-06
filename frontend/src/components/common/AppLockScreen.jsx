import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ShieldCheck, Fingerprint, Delete } from 'lucide-react';

export default function AppLockScreen() {
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Check lock preferences from localStorage
  const isAppLockEnabled = localStorage.getItem('sectros_app_lock_enabled') === 'true';
  const storedPin = localStorage.getItem('sectros_app_lock_pin') || '1234';

  useEffect(() => {
    if (!isAppLockEnabled) return;

    let timeout;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsLocked(true);
      }
    };

    const resetIdleTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsLocked(true);
      }, 10 * 60 * 1000); // 10 minutes idle lock
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);

    resetIdleTimer();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      clearTimeout(timeout);
    };
  }, [isAppLockEnabled]);

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === storedPin) {
          setIsLocked(false);
          setPin('');
          setError(false);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleBiometricUnlock = () => {
    // Simulated native biometric bridge / FaceID
    setIsLocked(false);
    setPin('');
  };

  if (!isLocked) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white"
      >
        <div className="max-w-xs w-full flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight">Sectros App Lock</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your 4-digit PIN or use Biometrics</p>
          </div>

          {/* PIN Indicators */}
          <div className={`flex items-center gap-4 py-2 ${error ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  pin.length > i
                    ? error
                      ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-500/50'
                      : 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-semibold">Incorrect PIN. Try default (1234)</p>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xl font-bold transition-all active:scale-95 shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleBiometricUnlock}
              className="h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/50 flex items-center justify-center text-blue-400 transition-all active:scale-95"
              title="FaceID / TouchID"
            >
              <Fingerprint className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xl font-bold transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/50 flex items-center justify-center text-slate-400 transition-all active:scale-95"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

