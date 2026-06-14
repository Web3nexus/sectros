import React, { useEffect, useState } from 'react';
import {X, CheckCircle, AlertCircle, Info, Activity} from 'lucide-react';

/**
 * Modern Toast notification component with Tailwind animations.
 */
export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow animation to finish
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'text-emerald-400'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-400" />,
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-400'
        };
      case 'loading':
        return {
          icon: <Activity className="w-5 h-5 text-blue-400 animate-spin" />,
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          text: 'text-blue-400'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-400" />,
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          text: 'text-blue-400'
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
      className={`fixed bottom-6 right-6 z-9999 flex items-center gap-3 px-4 py-3 rounded-2xl border ${styles.bg} ${styles.border} ${styles.text} shadow-2xl backdrop-blur-md transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="shrink-0">{styles.icon}</div>
      <p className="text-sm font-medium pr-6">{message}</p>
      <button 
        onClick={handleClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
