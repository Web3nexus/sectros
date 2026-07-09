export const FEATURE_LABELS = {
  insights: 'Dashboard & Insights',
  reservations: 'Reservation Management',
  configuration: 'Settings & Configuration',
  provisioning: 'Account Provisioning',
  billing_plan: 'Billing & Plan Management',
  social_integration: 'Social Media Integration',
  pos_terminal: 'POS Terminal',
  menu_builder: 'Menu Builder',
  service_builder: 'Service Builder',
  room_manager: 'Room Manager',
  floor_plan: 'Floor Plan Management',
  staff_management: 'Staff Management',
  financial_reports: 'Financial Reports & Analytics',
  ai_automation: 'AI Automation',
  online_ordering: 'Online Ordering',
  inventory_tracking: 'Inventory Tracking',
  directory_featured: 'Featured Listing',
  branch_management: 'Multi-Branch',
  waitlist_automation: 'Waitlist Pro',
  public_api: 'Public API',
  franchise_tools: 'Franchise Tools',
  kiosk_mode: 'Self-Service Kiosk',
};

export const defaultPlans = [
  {
    name: 'Starter', monthly: 0, yearly: 0, description: 'For new venues getting started.', is_popular: false,
    features: ['Online booking page', 'Basic reservation management', 'Guest list', 'Email confirmations', 'Up to 50 bookings/mo'],
  },
  {
    name: 'Growth', monthly: 29, yearly: 290, description: 'For growing restaurants.', is_popular: false,
    features: ['Everything in Starter', 'Floor plan management', 'Guest CRM', 'Automated reminders', 'Deposits & payments', 'Analytics dashboard', 'Up to 500 bookings/mo'],
  },
  {
    name: 'Professional', monthly: 79, yearly: 790, description: 'For established hospitality businesses.', is_popular: true,
    features: ['Everything in Growth', 'Advanced automation', 'Multi-channel messaging', 'Advanced analytics', 'Team roles (up to 10)', 'Priority support', 'Unlimited bookings'],
  },
  {
    name: 'Enterprise', monthly: null, yearly: null, description: 'For multi-location groups.', is_popular: false,
    features: ['Everything in Professional', 'Multi-location management', 'Custom integrations', 'Dedicated onboarding', 'Enterprise reporting', 'Custom contract', 'SLA guarantee'],
  },
];

export const mapFeaturesToList = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Object.entries(parsed)
          .filter(([, v]) => v === true || v === 'true' || v === 1)
          .map(([k]) => FEATURE_LABELS[k] || k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
      }
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return features.split(',').map(f => f.trim()).filter(Boolean);
  }
  if (typeof features === 'object') {
    return Object.entries(features)
      .filter(([, v]) => v === true || v === 'true' || v === 1)
      .map(([k]) => FEATURE_LABELS[k] || k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  }
  return [];
};

export const getDefaultFeatures = (planName) => {
  const name = planName.toLowerCase();
  if (name.includes('free') || name.includes('starter')) {
    return defaultPlans.find(d => d.name === 'Starter')?.features || [];
  }
  if (name.includes('growth')) {
    return defaultPlans.find(d => d.name === 'Growth')?.features || [];
  }
  if (name.includes('pro') || name.includes('professional')) {
    return defaultPlans.find(d => d.name === 'Professional')?.features || [];
  }
  if (name.includes('enterprise')) {
    return defaultPlans.find(d => d.name === 'Enterprise')?.features || [];
  }
  return [];
};
