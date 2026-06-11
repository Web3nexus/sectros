import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { CMS_DEFAULTS } from '../data/cmsDefaults';

const cachedSettings = {};

function deepMerge(defaults, overrides) {
  if (!overrides || typeof overrides !== 'object') return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (overrides[key] && typeof overrides[key] === 'object' && !Array.isArray(overrides[key]) && defaults[key] && typeof defaults[key] === 'object') {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

export function useCmsContent(pageKey) {
  const [content, setContent] = useState(CMS_DEFAULTS[pageKey] || {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cachedSettings._cmsContent) {
      const merged = deepMerge(CMS_DEFAULTS[pageKey] || {}, cachedSettings._cmsContent[pageKey] || {});
      setContent(merged);
      setLoading(false);
      return;
    }

    let cancelled = false;
    api.get('saas/settings')
      .then(res => {
        if (cancelled) return;
        const data = res.data || {};
        const cms = {};
        for (const key of Object.keys(CMS_DEFAULTS)) {
          try {
            cms[key] = data[`cms_${key}`] ? JSON.parse(data[`cms_${key}`]) : {};
          } catch {
            cms[key] = {};
          }
        }
        cachedSettings._cmsContent = cms;
        const merged = deepMerge(CMS_DEFAULTS[pageKey] || {}, cms[pageKey] || {});
        setContent(merged);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setContent(CMS_DEFAULTS[pageKey] || {});
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [pageKey]);

  const get = useCallback((path, fallback = '') => {
    const parts = path.split('.');
    let val = content;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) {
        val = val[p];
      } else {
        return fallback;
      }
    }
    return typeof val === 'string' ? val : fallback;
  }, [content]);

  const getArray = useCallback((path, fallback = []) => {
    const parts = path.split('.');
    let val = content;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) {
        val = val[p];
      } else {
        return fallback;
      }
    }
    return Array.isArray(val) ? val : fallback;
  }, [content]);

  return { content, loading, get, getArray };
}

export function buildCmsPayload(pageKey, values) {
  return { [`cms_${pageKey}`]: JSON.stringify(values) };
}
