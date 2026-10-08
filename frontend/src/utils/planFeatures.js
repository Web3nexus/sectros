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
  pos_terminal: 'TSE Cash Book / POS Terminal',
  menu_builder: 'Digital Menu Builder',
  floor_plan: 'Floor Plan Editor',
  staff_management: 'Staff Management & Shifts',
  financial_reports: 'Financial Reports & DATEV',
  ai_automation: 'AI Automation & Assistant',
  online_ordering: 'Online Ordering Portal',
  inventory_tracking: 'Inventory Tracking & Procurement',
  branch_management: 'Multi-Branch Management',
  waitlist_automation: 'Waitlist Pro & Notifications',
  public_api: 'Public Developer API',
  franchise_tools: 'Franchise Tools',
  ai_voice_agent: 'AI Phone Voice Receptionist',
  kiosk_mode: 'Self-Service Kiosk Terminal',
};

export const defaultPlans = [
  {
    id: 1,
    name: 'Starter',
    slug: 'starter',
    monthly_price: 29,
    yearly_price: 288,
    reservation_limit: 200,
    max_staff: 3,
    ai_credits_limit: 100,
    sms_credits_limit: 20,
    voice_credits_limit: 0,
    description: 'Essential tools to launch reservations and floor management at your venue.',
    is_popular: false,
    is_active: true,
    features: {
      'booking.core': true,
      'booking.public_page': true,
      'booking.floor_plan': true,
      'booking.deposits': false,
      'staff.management': false,
      'staff.time_tracking': false,
      'staff.payroll': false,
      'inbox.unified': false,
      'inbox.whatsapp': false,
      'inbox.facebook': false,
      'inbox.instagram': false,
      'inbox.ai_reply': false,
      'finance.cash_register': false,
      'finance.receipt_scanner': false,
      'finance.dashboard': false,
      'finance.exports': false,
      'kiosk.mode': false,
      'kiosk.takeout_orders': false,
      'kiosk.menu_manager': false,
      'ai.assistant': false,
      'ai.voice_agent': false,
      'branding.white_label': false,
      'api.access': false,
      reservations: true,
      floor_plan: true,
      configuration: true,
    },
  },
  {
    id: 2,
    name: 'Professional',
    slug: 'pro',
    monthly_price: 69,
    yearly_price: 708,
    reservation_limit: 1500,
    max_staff: 15,
    ai_credits_limit: 1000,
    sms_credits_limit: 200,
    voice_credits_limit: 100,
    description: 'Complete operating system with TSE cash book, AI receptionist, and team payroll.',
    is_popular: true,
    is_active: true,
    features: {
      'booking.core': true,
      'booking.public_page': true,
      'booking.floor_plan': true,
      'booking.deposits': true,
      'staff.management': true,
      'staff.time_tracking': true,
      'staff.payroll': true,
      'inbox.unified': true,
      'inbox.whatsapp': true,
      'inbox.facebook': true,
      'inbox.instagram': true,
      'inbox.ai_reply': true,
      'finance.cash_register': true,
      'finance.receipt_scanner': true,
      'finance.dashboard': true,
      'finance.exports': true,
      'kiosk.mode': false,
      'kiosk.takeout_orders': true,
      'kiosk.menu_manager': true,
      'ai.assistant': true,
      'ai.voice_agent': true,
      'branding.white_label': false,
      'api.access': false,
      reservations: true,
      floor_plan: true,
      social_integration: true,
      pos_terminal: true,
      staff_management: true,
      financial_reports: true,
      online_ordering: true,
      ai_voice_agent: true,
    },
  },
  {
    id: 3,
    name: 'Enterprise',
    slug: 'enterprise',
    monthly_price: null,
    yearly_price: null,
    reservation_limit: null,
    max_staff: null,
    ai_credits_limit: 5000,
    sms_credits_limit: 1000,
    voice_credits_limit: 500,
    description: 'Tailored pricing for hospitality groups, franchise chains and high-volume venues.',
    is_popular: false,
    is_active: true,
    features: {
      'booking.core': true,
      'booking.public_page': true,
      'booking.floor_plan': true,
      'booking.deposits': true,
      'staff.management': true,
      'staff.time_tracking': true,
      'staff.payroll': true,
      'inbox.unified': true,
      'inbox.whatsapp': true,
      'inbox.facebook': true,
      'inbox.instagram': true,
      'inbox.ai_reply': true,
      'finance.cash_register': true,
      'finance.receipt_scanner': true,
      'finance.dashboard': true,
      'finance.exports': true,
      'kiosk.mode': true,
      'kiosk.takeout_orders': true,
      'kiosk.menu_manager': true,
      'ai.assistant': true,
      'ai.voice_agent': true,
      'branding.white_label': true,
      'api.access': true,
      reservations: true,
      floor_plan: true,
      social_integration: true,
      pos_terminal: true,
      staff_management: true,
      financial_reports: true,
      ai_automation: true,
      online_ordering: true,
      kiosk_mode: true,
      ai_voice_agent: true,
      public_api: true,
      white_label_website: true,
    },
  },
];

/**
 * Robustly parses a plan's features into an object mapping key => boolean.
 */
export const parseFeaturesMap = (features) => {
  if (!features) return {};
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (typeof parsed === 'object' && parsed !== null) {
        if (Array.isArray(parsed)) {
          return Object.fromEntries(parsed.map(k => [k, true]));
        }
        return Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k, v === true || v === 'true' || v === 1])
        );
      }
    } catch {
      return Object.fromEntries(
        features.split(',').map(s => [s.trim(), true]).filter(([k]) => Boolean(k))
      );
    }
  }
  if (Array.isArray(features)) {
    return Object.fromEntries(features.map(k => [k, true]));
  }
  if (typeof features === 'object' && features !== null) {
    return Object.fromEntries(
      Object.entries(features).map(([k, v]) => [k, v === true || v === 'true' || v === 1])
    );
  }
  return {};
};

/**
 * Checks if a specific feature is enabled on a given plan.
 */
export const hasPlanFeature = (plan, key, aliases = [], alwaysOn = false) => {
  if (alwaysOn) return true;
  if (!plan) return false;
  const featMap = plan._featMap || parseFeaturesMap(plan.features);

  if (featMap[key] === true) return true;
  for (const alias of aliases) {
    if (featMap[alias] === true) return true;
  }
  return false;
};

/**
 * Maps raw features into an array of human-readable label strings.
 */
export const mapFeaturesToList = (features) => {
  if (!features) return [];
  if (Array.isArray(features) && features.every(f => typeof f === 'string' && f.includes(' '))) {
    return features;
  }
  const featMap = parseFeaturesMap(features);
  return Object.entries(featMap)
    .filter(([, v]) => v === true)
    .map(([k]) => FEATURE_LABELS[k] || k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
};

/**
 * Formats pricing for display according to billing cycle and plan fields.
 */
export const formatPlanPrice = (plan, isAnnual) => {
  if (!plan) {
    return { isCustom: true, displayPrice: 'Custom', period: '', note: null, monthlyEquivalent: null };
  }

  const monthly = plan.monthly_price != null ? Number(plan.monthly_price) : null;
  const yearly = plan.yearly_price != null ? Number(plan.yearly_price) : null;

  const isCustom = monthly == null && (plan.slug?.includes('enterprise') || plan.name?.toLowerCase().includes('enterprise'));
  const isFree = monthly === 0;

  if (isCustom) {
    return {
      isCustom: true,
      isFree: false,
      displayPrice: 'Custom',
      period: '',
      note: 'Tailored to your venue group.',
      monthlyEquivalent: null,
      annualTotal: null,
    };
  }

  if (isFree) {
    return {
      isCustom: false,
      isFree: true,
      displayPrice: 0,
      period: '/mo',
      note: 'Free forever, no credit card required.',
      monthlyEquivalent: 0,
      annualTotal: 0,
    };
  }

  if (!isAnnual) {
    return {
      isCustom: false,
      isFree: false,
      displayPrice: monthly,
      period: '/mo',
      note: null,
      monthlyEquivalent: monthly,
      annualTotal: yearly || (monthly ? monthly * 12 : null),
    };
  }

  // Annual mode
  let effectiveMonthly;
  let annualTotal;

  if (yearly != null && yearly > 0) {
    if (yearly > (monthly || 0) * 2) {
      // yearly is stored as full annual price (e.g. 708 or 470)
      annualTotal = yearly;
      effectiveMonthly = Math.round(yearly / 12);
    } else {
      // yearly is stored as monthly rate with annual billing (e.g. 59)
      effectiveMonthly = yearly;
      annualTotal = yearly * 12;
    }
  } else if (monthly != null) {
    // Default 20% savings if yearly not explicitly set
    effectiveMonthly = Math.round(monthly * 0.8);
    annualTotal = effectiveMonthly * 12;
  } else {
    effectiveMonthly = 0;
    annualTotal = 0;
  }

  return {
    isCustom: false,
    isFree: false,
    displayPrice: effectiveMonthly,
    period: '/mo',
    note: annualTotal ? `billed $${annualTotal.toLocaleString()} / year` : 'billed annually (save 20%)',
    monthlyEquivalent: effectiveMonthly,
    annualTotal,
  };
};

/**
 * Returns a balanced, high-impact array of 4-6 bullet features for card display.
 */
export const getPlanCardFeatures = (plan) => {
  if (!plan) return [];
  const bullets = [];
  const featMap = plan._featMap || parseFeaturesMap(plan.features);

  // 1. Quota highlights
  if (plan.max_staff == null) {
    bullets.push('Unlimited Staff Accounts & Multi-Outlet');
  } else {
    bullets.push(`Up to ${plan.max_staff} Staff Accounts`);
  }

  if (plan.reservation_limit == null) {
    bullets.push('Unlimited Table Reservations');
  } else {
    bullets.push(`Up to ${plan.reservation_limit.toLocaleString()} Reservations / mo`);
  }

  // 2. High-value feature highlights
  if (hasPlanFeature(plan, 'inbox.unified', ['social_integration'])) {
    bullets.push('Unified Social Inbox (WhatsApp / IG / FB)');
  }
  if (hasPlanFeature(plan, 'ai.voice_agent', ['ai_voice_agent'])) {
    bullets.push('24/7 AI Phone Voice Receptionist');
  }
  if (hasPlanFeature(plan, 'finance.cash_register', ['pos_terminal'])) {
    bullets.push('TSE Cash Book, Z-Bons & DATEV Export');
  } else if (hasPlanFeature(plan, 'booking.floor_plan', ['floor_plan'])) {
    bullets.push('Interactive 2D Floor Plan Editor');
  }

  if (hasPlanFeature(plan, 'staff.management', ['staff_management'])) {
    bullets.push('Shift Planner, Time Clock & Payslips');
  } else if (hasPlanFeature(plan, 'booking.public_page')) {
    bullets.push('Public Online Booking Portal (/book)');
  }

  if (hasPlanFeature(plan, 'branding.white_label', ['white_label_website'])) {
    bullets.push('Custom Domain & White-Label Branding');
  } else if (hasPlanFeature(plan, 'api.access', ['public_api'])) {
    bullets.push('Public Developer REST API Access');
  } else if (hasPlanFeature(plan, 'booking.deposits')) {
    bullets.push('Stripe Table & Group Deposits');
  } else if (plan.sms_credits_limit > 0) {
    bullets.push(`${plan.sms_credits_limit} SMS Booking Reminders / mo`);
  }

  // Ensure 5 items minimum if we have features
  if (bullets.length < 5) {
    const allLabels = mapFeaturesToList(featMap);
    for (const label of allLabels) {
      if (!bullets.includes(label)) {
        bullets.push(label);
        if (bullets.length >= 5) break;
      }
    }
  }

  return bullets.slice(0, 6);
};

/**
 * Normalizes an array of raw plans from the backend or fallbacks.
 */
export const normalizePlans = (rawPlans) => {
  const arr = Array.isArray(rawPlans) ? rawPlans : (rawPlans?.data || rawPlans?.plans || []);
  const active = arr.filter(p => p.is_active !== false);

  const source = active.length > 0 ? active : defaultPlans;

  return source.map((p, idx) => {
    const monthly = p.monthly_price != null ? Number(p.monthly_price) : null;
    const yearly = p.yearly_price != null ? Number(p.yearly_price) : null;
    const featMap = parseFeaturesMap(p.features);

    const isEnterprise = monthly == null && (p.slug?.includes('enterprise') || p.name?.toLowerCase().includes('enterprise'));
    const isPopular = Boolean(p.is_popular || (p.slug === 'pro' && !source.some(s => s.is_popular)));

    return {
      ...p,
      id: p.id || p.slug || idx + 1,
      name: p.name || 'Plan',
      slug: p.slug || p.name?.toLowerCase().replace(/\s+/g, '-') || `plan-${idx + 1}`,
      description: p.description || getDefaultDescription(p.name, p.slug),
      monthly_price: monthly,
      yearly_price: yearly,
      reservation_limit: p.reservation_limit != null ? Number(p.reservation_limit) : null,
      max_staff: p.max_staff != null ? Number(p.max_staff) : null,
      ai_credits_limit: p.ai_credits_limit != null ? Number(p.ai_credits_limit) : null,
      sms_credits_limit: p.sms_credits_limit != null ? Number(p.sms_credits_limit) : null,
      voice_credits_limit: p.voice_credits_limit != null ? Number(p.voice_credits_limit) : null,
      is_popular: isPopular,
      isEnterprise,
      _featMap: featMap,
      bulletFeatures: getPlanCardFeatures({ ...p, _featMap: featMap }),
    };
  });
};

export const getDefaultDescription = (name = '', slug = '') => {
  const lower = (name + ' ' + slug).toLowerCase();
  if (lower.includes('free')) return 'Core reservations and public booking page for small spots.';
  if (lower.includes('starter')) return 'Essential tools to launch reservations and floor management at your venue.';
  if (lower.includes('pro') || lower.includes('growth')) return 'Complete operating system with TSE cash book, AI receptionist, and team payroll.';
  if (lower.includes('enterprise')) return 'Tailored pricing for hospitality groups, franchise chains and high-volume venues.';
  return 'Full suite of modern tools for seamless hospitality operations.';
};

export const getDefaultFeatures = (planName) => {
  const name = planName?.toLowerCase() || '';
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

/**
 * Complete structured feature matrix for the Sectros comparison table.
 */
export const COMPARISON_SECTIONS = [
  {
    category: 'Core Operations & Space',
    items: [
      {
        name: 'Core Reservations & Calendar',
        key: 'booking.core',
        aliases: ['reservations'],
        alwaysOn: true,
      },
      {
        name: 'Public Online Booking Page (/book)',
        key: 'booking.public_page',
        aliases: ['booking.core'],
        alwaysOn: true,
      },
      {
        name: 'Interactive 2D Floor Plan Editor',
        key: 'booking.floor_plan',
        aliases: ['floor_plan'],
        alwaysOn: true,
      },
      {
        name: 'Stripe Table & Group Deposits',
        key: 'booking.deposits',
        aliases: [],
      },
      {
        name: 'Guest Walk-in Check-in Kiosk (/kiosk)',
        key: 'kiosk.mode',
        aliases: ['kiosk_mode'],
      },
      {
        name: 'Self-Ordering Food Kiosk (/kiosk-order)',
        key: 'kiosk.takeout_orders',
        aliases: ['online_ordering'],
      },
      {
        name: 'Digital Menu & 86 Item Manager',
        key: 'kiosk.menu_manager',
        aliases: ['menu_builder'],
      },
    ],
  },
  {
    category: 'Guest Experience & Inbox',
    items: [
      {
        name: 'Unified Social Inbox (WhatsApp / IG / FB)',
        key: 'inbox.unified',
        aliases: ['social_integration', 'inbox.whatsapp'],
      },
      {
        name: 'WhatsApp Cloud API Direct Integration',
        key: 'inbox.whatsapp',
        aliases: ['social_integration'],
      },
      {
        name: 'Instagram Direct & Facebook Messenger',
        key: 'inbox.instagram',
        aliases: ['inbox.facebook', 'social_integration'],
      },
      {
        name: 'AI Chat Auto-Response Suggestions',
        key: 'inbox.ai_reply',
        aliases: ['ai_automation'],
      },
      {
        name: '24/7 AI Phone Voice Receptionist',
        key: 'ai.voice_agent',
        aliases: ['ai_voice_agent'],
      },
    ],
  },
  {
    category: 'Finance, TSE & Compliance',
    items: [
      {
        name: 'TSE Cash Book & Daily Closings (Z-Bons)',
        key: 'finance.cash_register',
        aliases: ['pos_terminal'],
      },
      {
        name: 'AI Supplier Invoice OCR Scanner',
        key: 'finance.receipt_scanner',
        aliases: [],
      },
      {
        name: 'Financial Margins & 7%/19% VAT Split',
        key: 'finance.dashboard',
        aliases: ['financial_reports'],
      },
      {
        name: 'Tax Advisor Portal & DATEV Export',
        key: 'finance.exports',
        aliases: ['financial_reports'],
      },
    ],
  },
  {
    category: 'Staff Management & HR',
    items: [
      {
        name: 'Shift Planner & AU Sick Notes',
        key: 'staff.management',
        aliases: ['staff_management'],
      },
      {
        name: 'PIN Time Clock (Live Punch Clock)',
        key: 'staff.time_tracking',
        aliases: [],
      },
      {
        name: 'Digital Payslips & Signature Canvas',
        key: 'staff.payroll',
        aliases: [],
      },
    ],
  },
  {
    category: 'Platform & Enterprise',
    items: [
      {
        name: 'Conversational Business AI Assistant',
        key: 'ai.assistant',
        aliases: ['ai_automation'],
      },
      {
        name: 'Custom Domain & White-Label Branding',
        key: 'branding.white_label',
        aliases: ['white_label_website'],
      },
      {
        name: 'Public Developer REST API Access',
        key: 'api.access',
        aliases: ['public_api'],
      },
    ],
  },
  {
    category: 'Capacity & Quotas',
    isQuota: true,
    items: [
      {
        name: 'Monthly Reservations',
        quotaKey: 'reservation_limit',
        formatter: (val) => (val == null ? 'Unlimited (∞)' : `${val.toLocaleString()} / mo`),
      },
      {
        name: 'Staff Member Quota',
        quotaKey: 'max_staff',
        formatter: (val) => (val == null ? 'Unlimited (∞)' : `${val} Staff`),
      },
      {
        name: 'Monthly SMS Credits',
        quotaKey: 'sms_credits_limit',
        formatter: (val) => (val == null ? 'Included' : val === 0 ? '—' : `${val.toLocaleString()} SMS`),
      },
      {
        name: 'Monthly AI Voice/Text Credits',
        quotaKey: 'ai_credits_limit',
        formatter: (val) => (val == null ? 'Included' : val === 0 ? '—' : `${val.toLocaleString()} credits`),
      },
    ],
  },
];
