import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import centralApi from '../services/centralApi';

const WebsiteThemeContext = createContext();

const VALID_THEMES = ['classic-ai', 'modern-business-os'];

export function WebsiteThemeProvider({ children }) {
  const cached = localStorage.getItem('website_theme');
  const hasTrustedCache = cached && VALID_THEMES.includes(cached);

  const [activeTheme, setActiveTheme] = useState(() => {
    return hasTrustedCache ? cached : 'classic-ai';
  });
  // If we have a trusted cached theme, don't block rendering — render instantly.
  // Only block on the first ever visit (no cache) until the API responds.
  const [loading, setLoading] = useState(!hasTrustedCache);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await centralApi.get('public/theme');
        const theme = res.data.website_theme || 'classic-ai';
        setActiveTheme(theme);
        localStorage.setItem('website_theme', theme);
      } catch (err) {
        // On network failure, fall back to cached or default — already set above.
      } finally {
        setLoading(false);
      }
    };
    fetchTheme();
  }, []);

  const updateTheme = useCallback((theme) => {
    setActiveTheme(theme);
    localStorage.setItem('website_theme', theme);
  }, []);

  const isModernBusinessOS = activeTheme === 'modern-business-os';
  const isClassicAI = activeTheme === 'classic-ai';

  return (
    <WebsiteThemeContext.Provider value={{ activeTheme, updateTheme, isModernBusinessOS, isClassicAI, loading }}>
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
