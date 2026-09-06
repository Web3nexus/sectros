export const FEATURE_LABELS = {
  // Sectros Entitlement Keys
  'booking.core': 'Core Reservations & Calendar',
  'booking.public_page': 'Public Online Booking Page (/book)',
  'booking.floor_plan': 'Interactive 2D Floor Plan Editor',
  'booking.deposits': 'Stripe Table & Group Deposits',
  'staff.management': 'Shift Planner, Attendance & Sick Notes',
  'staff.time_tracking': 'PIN Time Clock (Live Clock-In/Out)',
  'staff.payroll': 'Digital Payslip Canvas Signing & Tip Tracker',
  'inbox.unified': 'Unified Social & Email Inbox',
  'inbox.whatsapp': 'WhatsApp Cloud API Integration',
  'inbox.facebook': 'Facebook Messenger Direct',
  'inbox.instagram': 'Instagram Direct Integration',
  'inbox.ai_reply': 'AI Response Suggestions',
  'finance.cash_register': 'TSE Cash Book & Daily Closings (Z-Bons)',
  'finance.receipt_scanner': 'AI Receipt & Supplier Invoice OCR Scanner',
  'finance.dashboard': 'Financial Metrics, VAT Split & Gross Margin',
  'finance.exports': 'Tax Advisor Portal & DATEV Export',
  'kiosk.mode': 'Guest Self-Check-in Kiosk (/kiosk)',
  'kiosk.takeout_orders': 'Self-Ordering Food Terminal (/kiosk-order)',
  'kiosk.menu_manager': 'Digital Menu & 86 Item Manager',
  'ai.assistant': 'Conversational Business AI Assistant',
  'ai.voice_agent': 'AI Phone Voice Receptionist (24/7)',
  'locations.max': 'Multi-Location Outlets',
  'branding.white_label': 'Custom Domain & White-Label Branding',
  'api.access': 'External Public Developer API Access',

  // Legacy & UI Compatibility Aliases
  insights: 'Dashboard & Insights',
  reservations: 'Reservation Management',
  configuration: 'Settings & Configuration',
  provisioning: 'Account Provisioning',
  billing_plan: 'Billing & Plan Management',
  social_integration: 'Unified Social Inbox',
  pos_terminal: 'POS Terminal',
  menu_builder: 'Menu Builder',
  floor_plan: 'Floor Plan Management',
  staff_management: 'Staff Management',
  financial_reports: 'Financial Reports & Analytics',
  ai_automation: 'AI Automation & Assistant',
  online_ordering: 'Online Ordering Portal',
  inventory_tracking: 'Inventory Tracking & Procurement',
  branch_management: 'Multi-Branch Management',
  waitlist_automation: 'Waitlist Pro',
  public_api: 'Public API',
  franchise_tools: 'Franchise Tools',
  ai_voice_agent: 'AI Phone Voice Agent',
  kiosk_mode: 'Self-Service Kiosk',
};

export const defaultPlans = [
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    monthly: 29,
    yearly: 24,
    description: 'Essential tools to launch reservations at your venue.',
    is_popular: false,
    max_staff: 3,
    max_locations: 1,
    features: [
      'Core Reservations & Calendar',
      'Public Online Booking Page',
      'Interactive 2D Floor Plan Editor',
      'Guest CRM & Notes',
      'Up to 3 Staff Accounts',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    slug: 'pro',
    monthly: 69,
    yearly: 59,
    description: 'Complete operating system for serious hospitality venues.',
    is_popular: true,
    max_staff: 15,
    max_locations: 1,
    features: [
      'Everything in Starter',
      'Unified Social Inbox (WhatsApp / IG / FB)',
      'Shift Planner, Payslips & Time Clock',
      'AI Voice Receptionist (24/7)',
      'TSE Cash Book, Z-Bons & DATEV Export',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    monthly: null,
    yearly: null,
    description: 'Tailored pricing for hospitality groups & franchise chains.',
    is_popular: false,
    max_staff: null,
    max_locations: null,
    features: [
      'Everything in Professional',
      'Unlimited Staff & Multi-Location Outlets',
      'Custom Domain & White-Label Branding',
      'Public Developer API Access',
      'Dedicated SLA & Priority Support',
    ],
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
  if (name.includes('starter') || name.includes('free')) {
    return defaultPlans.find(d => d.name === 'Starter')?.features || [];
  }
  if (name.includes('pro') || name.includes('professional') || name.includes('growth')) {
    return defaultPlans.find(d => d.name === 'Professional')?.features || [];
  }
  if (name.includes('enterprise')) {
    return defaultPlans.find(d => d.name === 'Enterprise')?.features || [];
  }
  return [];
};
