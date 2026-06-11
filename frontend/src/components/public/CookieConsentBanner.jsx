import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('sectros_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (type) => {
    localStorage.setItem('sectros_cookie_consent', type);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-6 left-6 right-6 z-[9999] md:left-auto md:right-8 md:max-w-md"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl shadow-black/50 p-6 flex flex-col gap-5">
            {/* Subtle glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="text-foreground font-black text-base tracking-tight leading-snug mb-1">
                  Compliance &amp; Privacy
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We use cookies to enhance your experience, analyze traffic, and personalize content. Your privacy is our priority.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={() => handleConsent('accepted')}
                className="flex-1 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-95"
              >
                <Check className="w-4 h-4" /> Accept All
              </button>
              <button
                onClick={() => handleConsent('declined')}
                className="px-5 py-2.5 bg-muted text-muted-foreground border border-border rounded-xl font-bold text-sm hover:bg-muted/80 transition-all active:scale-95"
              >
                Decline
              </button>
            </div>

            <p className="text-[9px] text-muted-foreground text-center uppercase tracking-[0.2em] font-bold relative z-10">
              Powered by {localStorage.getItem('platform_name') || import.meta.env.VITE_APP_NAME || 'Sectros'} Trust Framework
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
