import React from 'react';
import {Sun, Moon} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden border border-border/50 bg-slate-800/30 backdrop-blur-md group ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: 45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: -45 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400 group-hover:text-amber-300" />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Subtle glow effect */}
      <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${theme === 'light' ? 'bg-indigo-500' : 'bg-amber-500'}`}></div>
    </button>
  );
}
