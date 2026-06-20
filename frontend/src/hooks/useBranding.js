import { useState, useEffect } from 'react';
import api from '../services/centralApi';

const CACHE_TTL = 3600000; // 1 hour in ms

function getCachedOrNull(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed._expiry && Date.now() > parsed._expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch { return null; }
}

function setWithExpiry(key, data, ttl = CACHE_TTL) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, _expiry: Date.now() + ttl }));
  } catch { /* storage full */ }
}

export function useBranding() {
  const cached = getCachedOrNull('branding_cache');
  const [settings, setSettings] = useState(cached || {
    platform_name: localStorage.getItem('platform_name') || import.meta.env.VITE_APP_NAME || 'Sectros',
    platform_logo_url: '',
    platform_favicon_url: '',
    turnstile_site_key: import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('public/branding');
        const data = res.data;
        setWithExpiry('branding_cache', data);
        setSettings({
          platform_name: data.platform_name || import.meta.env.VITE_APP_NAME || 'Sectros',
          platform_logo_url: data.platform_logo_url || '',
          platform_favicon_url: data.platform_favicon_url || '',
          turnstile_site_key: data.turnstile_site_key || import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
        });

        // Update localStorage for immediate use elsewhere
        if (data.platform_name) {
          localStorage.setItem('platform_name', data.platform_name);
        }

        try {
          const normalized = Array.isArray(data.disabled_features)
            ? data.disabled_features
            : (typeof data.disabled_features === 'string' ? JSON.parse(data.disabled_features) : []);

          if (Array.isArray(normalized)) {
            localStorage.setItem('disabled_features', JSON.stringify(normalized));
          } else {
            localStorage.removeItem('disabled_features');
          }
        } catch {
          localStorage.removeItem('disabled_features');
        }

        // Update Favicon
        if (data.platform_favicon_url) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.platform_favicon_url;
        }

        // Update Title if it's the landing page
        if (window.location.pathname === '/' && data.platform_name) {
             document.title = data.platform_name;
        }
      } catch (err) {
        console.error("Failed to fetch branding settings", err);
      }
    };

    fetchSettings();
  }, []);

  return settings;
}
