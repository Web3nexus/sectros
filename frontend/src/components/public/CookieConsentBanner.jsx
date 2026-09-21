import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('sectros_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-0 sm:bottom-6 sm:right-6 sm:inset-x-auto sm:w-[360px]"
        >
          <div className="max-w-md mx-auto sm:max-w-none rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/40 px-4 py-3.5">
            <div className="flex flex-col gap-3 sm:gap-3.5">
              <div className="flex items-start gap-3">
                <p className="flex-1 text-sm leading-snug text-foreground">
                  We use cookies to improve your experience &amp; keep our service secure.{' '}
                  <Link
                    to="/cookies"
                    className="text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground transition-colors"
                  >
                    Cookie policy
                  </Link>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleConsent('accepted')}
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
                >
                  Accept All
                </button>
                <button
                  onClick={() => handleConsent('declined')}
                  className="px-4 py-2.5 text-muted-foreground hover:text-foreground rounded-xl text-sm font-medium transition-colors active:scale-[0.98]"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}