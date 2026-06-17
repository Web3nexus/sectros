import axios from 'axios';

const getCsrfToken = () => {
  const meta = typeof document !== 'undefined' && document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : null;
};

const CENTRAL_HOSTNAMES = ['sectros.com', 'www.sectros.com', 'sectrosweb.test', 'Sectros.test', 'sectrosweb.Sectros.test', 'localhost', '51.21.32.161'];

const getBaseURL = () => {
  const storedTenantDomain = localStorage.getItem('tenant_domain');
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';

  const isLocalDev = import.meta.env.DEV && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.test'));

  // On localhost, always route through Vite proxy (relative paths)
  if (isLocalDev) {
    if (storedTenantDomain && storedTenantDomain !== 'no-domain') {
      return `${protocol}//${window.location.host}/local-tenant-api/`;
    }
    return `${protocol}//${window.location.host}/central-api/`;
  }

  const isActuallyCentralDashboard = CENTRAL_HOSTNAMES.includes(hostname);

  if (isActuallyCentralDashboard) {
    // Priority: If we are impersonating a tenant on a central domain, use the Tenant API
    const isTenantSpecificPath = pathname.startsWith('/builder') || pathname.startsWith('/dashboard') || pathname.startsWith('/calendar') || pathname.startsWith('/reservations');
    if (isTenantSpecificPath && storedTenantDomain && storedTenantDomain !== 'no-domain') {
      return `${protocol}//${storedTenantDomain}/tenant-api/`;
    }

    return import.meta.env.VITE_CENTRAL_API_BASE_URL || `${protocol}//${hostname}/central-api/`;
  }

  // Priority 3 - If we are on a tenant subdomain (e.g. test.sectrosweb.test), use Tenant API.
  return `${protocol}//${hostname}/tenant-api/`;
};

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Dynamically set baseURL on every request so it respects any
// tenant_domain that was set in localStorage after module initialization
// (e.g. right after a cross-domain login redirect).
api.interceptors.request.use((config) => {
  const baseURL = getBaseURL();
  
  // Only set baseURL if not already explicitly provided in the request config
  if (!config.baseURL || config.baseURL === api.defaults.baseURL) {
    config.baseURL = baseURL;
  }

  // Prevent double-prefixing if the URL already starts with api routes
  if (config.url && baseURL) {
    if (baseURL.endsWith('/local-tenant-api/') && config.url.startsWith('/local-tenant-api/')) {
        config.url = config.url.replace('/local-tenant-api/', '');
    } else if (baseURL.endsWith('/tenant-api/') && config.url.startsWith('/tenant-api/')) {
        config.url = config.url.replace('/tenant-api/', '');
    } else if (baseURL.endsWith('/central-api/') && config.url.startsWith('/central-api/')) {
        config.url = config.url.replace('/central-api/', '');
    }
  }

  // Determine if we should use admin token or tenant token.
  // Priority 1: Check if the current browser path is an admin path.
  // Priority 2: Check if the request URL itself is an admin route.
  const isSaaSPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/securegate');
  const isAdminRequest = isSaaSPath || config.url?.includes('/saas/') || config.url?.includes('/central-api') || (config.baseURL && (config.baseURL.includes('/central-api') || config.baseURL.includes('/saas/')));
  
  const token = isAdminRequest
    ? localStorage.getItem('admin_token')
    : localStorage.getItem('token');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // CSRF token for stateful requests
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }

  // Pass custom header for the local Vite proxy to rewrite the Host header
  const tenantDomain = localStorage.getItem('tenant_domain');
  if (tenantDomain && tenantDomain !== 'no-domain') {
     config.headers['x-tenant-domain'] = tenantDomain;
  }
  
  return config;
});

export default api;
