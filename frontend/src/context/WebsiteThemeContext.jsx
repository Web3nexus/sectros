import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import centralApi from '../services/centralApi';
import api from '../services/api';

const WebsiteThemeContext = createContext();

const VALID_THEMES = ['classic-ai', 'modern-business-os', 'sectros-premium'];

export function WebsiteThemeProvider({ children }) {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlTheme = urlParams?.get('theme');
  const validUrlTheme = urlTheme && VALID_THEMES.includes(urlTheme) ? urlTheme : null;

  const cached = typeof localStorage !== 'undefined' ? localStorage.getItem('website_theme') : null;
  const hasTrustedCache = cached && VALID_THEMES.includes(cached);

  const [activeTheme, setActiveTheme] = useState(() => {
    if (validUrlTheme) {
      // Preview value is session-only: never persist ?theme= to storage.
      return validUrlTheme;
    }
    return hasTrustedCache ? cached : 'sectros-premium';
  });

  // Keep DOM attribute synced for global styling / debugging
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-website-theme', activeTheme);
    }
  }, [activeTheme]);

  const [loading, setLoading] = useState(!hasTrustedCache && !validUrlTheme);

  useEffect(() => {
    if (validUrlTheme) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    const fetchTheme = async () => {
      try {
        const cacheBust = `?_t=${Date.now()}`;
        let res;
        try {
          res = await centralApi.get(`public/theme${cacheBust}`);
        } catch {
          res = await api.get(`public/theme${cacheBust}`);
        }
        const theme = res?.data?.website_theme || 'sectros-premium';
        if (isMounted && VALID_THEMES.includes(theme)) {
          setActiveTheme(theme);
          if (typeof localStorage !== 'undefined') localStorage.setItem('website_theme', theme);
        }
      } catch {
        // Fall back gracefully
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTheme();
    return () => { isMounted = false; };
  }, [validUrlTheme]);

  const updateTheme = useCallback((theme) => {
    if (!VALID_THEMES.includes(theme)) return;
    setActiveTheme(theme);
    if (typeof localStorage !== 'undefined') localStorage.setItem('website_theme', theme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-website-theme', theme);
    }
  }, []);

  const isPremium = activeTheme === 'sectros-premium';
  const isModernBusinessOS = activeTheme === 'modern-business-os';
  const isClassicAI = activeTheme === 'classic-ai';

  return (
    <WebsiteThemeContext.Provider value={{ activeTheme, updateTheme, isPremium, isModernBusinessOS, isClassicAI, loading }}>
      {children}
    </WebsiteThemeContext.Provider>
  );
}

export function useWebsiteTheme() {
  const context = useContext(WebsiteThemeContext);
  if (!context) {
    throw new Error('useWebsiteTheme must be used within a WebsiteThemeProvider');
  }
  return context;
}
