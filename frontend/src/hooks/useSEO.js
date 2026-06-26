import centralApi from '../services/centralApi'
import { useBranding } from './useBranding'

const SEO_CACHE_TTL = 3600000

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed._expiry && Date.now() > parsed._expiry) {
      sessionStorage.removeItem(key)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

function setCache(key, data, ttl = SEO_CACHE_TTL) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, _expiry: Date.now() + ttl }))
  } catch { /* ignore */ }
}

const PAGE_META = {
  '/': { title: null, description: null },
  '/pricing': { title: 'Pricing', description: 'Simple, transparent pricing for businesses of all sizes. Start free, upgrade as you grow.' },
  '/features': { title: 'Features', description: 'Powerful features: online reservations, digital menus, staff management, POS, and more.' },
  '/about': { title: 'About Us', description: 'Learn about our mission to empower local businesses with modern technology.' },
  '/blog': { title: 'Blog', description: 'Latest insights, tips, and news for business owners.' },
  '/customers': { title: 'Customer Stories', description: 'See how businesses like yours thrive with our platform.' },
  '/contact': { title: 'Contact Us', description: 'Get in touch with our team. We\'re here to help.' },
  '/solutions': { title: 'Solutions', description: 'Tailored solutions for restaurants, cafes, salons, hotels, and more.' },
  '/integrations': { title: 'Integrations', description: 'Connect your favorite tools and services.' },
  '/directory': { title: 'Business Directory', description: 'Discover local businesses in our curated directory.' },
  '/docs': { title: 'Documentation', description: 'Comprehensive guides and API documentation.' },
  '/help': { title: 'Help Center', description: 'Find answers to common questions.' },
  '/privacy': { title: 'Privacy Policy', description: 'Our privacy policy and data handling practices.' },
}

export function useSEO(path) {
  const branding = useBranding()
  const pageMeta = PAGE_META[path]
  const platformName = branding.platform_name || 'Sectros'

  if (!pageMeta) {
    return {
      title: platformName,
      description: 'All-in-one business management platform.',
      path,
    }
  }

  const title = pageMeta.title
    ? `${pageMeta.title} — ${platformName}`
    : platformName

  return {
    title,
    description: pageMeta.description,
    path,
    siteName: platformName,
  }
}

export async function fetchSEOData(path) {
  const cacheKey = `seo_data_${path}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const res = await centralApi.get('/seo-data', { params: { path } })
    const data = res.data
    setCache(cacheKey, data)
    return data
  } catch {
    return null
  }
}
