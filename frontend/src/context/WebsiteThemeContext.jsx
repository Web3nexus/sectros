import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import centralApi from '../services/centralApi';

const WebsiteThemeContext = createContext();

export function WebsiteThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('website_theme') || 'classic-ai';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await centralApi.get('public/theme');
        const theme = res.data.website_theme || 'classic-ai';
        setActiveTheme(theme);
        localStorage.setItem('website_theme', theme);
      } catch (err) {
        const cached = localStorage.getItem('website_theme');
        if (cached) setActiveTheme(cached);
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
