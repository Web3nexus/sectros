import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check, X, Briefcase, Building2, Crown, ChevronRight, Plus,
  MessageSquare, DollarSign, Bot, Calendar, Component, Utensils,
  Table, LayoutDashboard, Users, CreditCard, Settings, ShoppingBag,
  Package, Infinity, HelpCircle, Shield, Phone, Calculator, HeartPulse,
  Receipt, FileText, Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/centralApi';
import BackgroundParticles from '../../components/common/BackgroundParticles';

/* ──────────────────────────────────────────────────────────
   Sectros Feature catalogue — 24 Entitlement Keys
   ────────────────────────────────────────────────────────── */
const FEATURE_CATALOGUE = [
  // Booking & Floor Plan
  { key: 'booking.core',          label: 'Core Reservations & Calendar',         icon: Calendar,        alwaysOn: true,  category: 'Booking & Space' },
  { key: 'booking.public_page',   label: 'Public Online Booking Page',           icon: Calendar,        alwaysOn: true,  category: 'Booking & Space' },
  { key: 'booking.floor_plan',    label: 'Interactive 2D Floor Plan Editor',      icon: Table,           alwaysOn: true,  category: 'Booking & Space' },
  { key: 'booking.deposits',      label: 'Stripe Table & Group Deposits',         icon: DollarSign,      alwaysOn: false, category: 'Booking & Space' },

  // Staff & Payroll (Lohnbüro)
  { key: 'staff.management',      label: 'Shift Planner & AU Sick Notes',        icon: Users,           alwaysOn: false, category: 'Staff & Payroll' },
  { key: 'staff.time_tracking',   label: 'PIN Time Clock (Live Punch Clock)',      icon: Users,           alwaysOn: false, category: 'Staff & Payroll' },
  { key: 'staff.payroll',         label: 'Digital Payslip Signing & Tip Tracker',icon: FileText,        alwaysOn: false, category: 'Staff & Payroll' },

  // Omnichannel Messaging
  { key: 'inbox.unified',         label: 'Unified Social & Email Inbox',          icon: MessageSquare,   alwaysOn: false, category: 'Messaging & Inbox' },
  { key: 'inbox.whatsapp',        label: 'WhatsApp Cloud API Integration',        icon: MessageSquare,   alwaysOn: false, category: 'Messaging & Inbox' },
  { key: 'inbox.facebook',        label: 'Facebook Messenger Direct',             icon: MessageSquare,   alwaysOn: false, category: 'Messaging & Inbox' },
  { key: 'inbox.instagram',       label: 'Instagram Direct Integration',          icon: MessageSquare,   alwaysOn: false, category: 'Messaging & Inbox' },
  { key: 'inbox.ai_reply',        label: 'AI Response Suggestions (GPT)',         icon: Bot,             alwaysOn: false, category: 'Messaging & Inbox' },

  // TSE Finance & Tax Advisor
  { key: 'finance.cash_register', label: 'TSE Cash Book & Z-Bons',             icon: Calculator,      alwaysOn: false, category: 'TSE Finance & Tax' },
  { key: 'finance.receipt_scanner',label: 'AI Receipt & Invoice OCR Scanner',    icon: Receipt,         alwaysOn: false, category: 'TSE Finance & Tax' },
  { key: 'finance.dashboard',     label: 'Financial Margins & 7%/19% VAT Split', icon: DollarSign,      alwaysOn: false, category: 'TSE Finance & Tax' },
  { key: 'finance.exports',       label: 'Tax Advisor Portal & DATEV Export',    icon: DownloadIcon,    alwaysOn: false, category: 'TSE Finance & Tax' },

  // Kiosks & Self-Service
  { key: 'kiosk.takeout_orders',  label: 'Self-Ordering Menu Kiosk (/kiosk-order)',icon: ShoppingBag,    alwaysOn: false, category: 'Kiosks & Terminals' },
  { key: 'kiosk.menu_manager',    label: 'Digital Menu & 86 Item Manager',       icon: Utensils,        alwaysOn: false, category: 'Kiosks & Terminals' },
  { key: 'kiosk.mode',            label: 'Guest Walk-in Check-in Kiosk (/kiosk)',icon: Component,       alwaysOn: false, category: 'Kiosks & Terminals' },

  // AI & Enterprise
  { key: 'ai.assistant',          label: 'Conversational Business AI Assistant', icon: Bot,             alwaysOn: false, category: 'AI & Enterprise' },
  { key: 'ai.voice_agent',        label: 'AI Phone Voice Receptionist (24/7)',   icon: Phone,           alwaysOn: false, category: 'AI & Enterprise' },
  { key: 'branding.white_label',  label: 'Custom Domain & White-Label Branding',  icon: Shield,          alwaysOn: false, category: 'AI & Enterprise' },
  { key: 'api.access',            label: 'External Public Developer API Access',  icon: Settings,        alwaysOn: false, category: 'AI & Enterprise' },
];

function DownloadIcon(props) {
  return <Receipt {...props} />;
}

const LIMIT_ROWS = [
  { key: 'reservation_limit', label: 'Monthly Reservations' },
  { key: 'max_staff',         label: 'Staff Member Quota' },
  { key: 'ai_credits_limit',  label: 'Monthly AI Voice/Text Credits' },
  { key: 'sms_credits_limit', label: 'Monthly SMS Credits' },
];

const defaultPlans = [
  {
    id: 'starter', name: 'Starter', slug: 'starter',
    monthly_price: 29, yearly_price: 24, popular: false,
    description: 'Essential table reservations, public booking page, and 2D floor plan.',
    reservation_limit: 200, max_staff: 3, ai_credits_limit: 100, sms_credits_limit: 20,
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
      'insights': true,
      'reservations': true,
      'configuration': true,
      'billing_plan': true,
      'menu_builder': true,
      'floor_plan': true,
    }
  },
  {
    id: 'pro', name: 'Professional', slug: 'pro',
    monthly_price: 69, yearly_price: 59, popular: true,
    description: 'Complete operating system with TSE Cash Book, AI Receptionist, Staff & Payroll.',
    reservation_limit: 1500, max_staff: 15, ai_credits_limit: 1000, sms_credits_limit: 200,
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
      'insights': true,
      'reservations': true,
      'configuration': true,
      'billing_plan': true,
      'menu_builder': true,
      'floor_plan': true,
      'social_integration': true,
      'pos_terminal': true,
      'staff_management': true,
      'financial_reports': true,
      'ai_automation': true,
      'online_ordering': true,
      'inventory_tracking': true,
      'ai_voice_agent': true,
      'waitlist_automation': true,
    }
  },
  {
    id: 'enterprise', name: 'Enterprise', slug: 'enterprise',
    monthly_price: 149, yearly_price: 129, popular: false,
    description: 'Full-scale solution for multi-outlet groups, franchises and high-volume venues.',
    reservation_limit: null, max_staff: null, ai_credits_limit: 5000, sms_credits_limit: 1000,
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
      'insights': true,
      'reservations': true,
      'configuration': true,
      'billing_plan': true,
      'menu_builder': true,
      'floor_plan': true,
      'social_integration': true,
      'pos_terminal': true,
      'staff_management': true,
      'financial_reports': true,
      'ai_automation': true,
      'online_ordering': true,
      'inventory_tracking': true,
      'ai_voice_agent': true,
      'waitlist_automation': true,
      'branch_management': true,
      'public_api': true,
      'franchise_tools': true,
      'white_label_website': true,
    }
  }
];

const planAccentMap = {
  starter: { border: 'border-border', badge: 'bg-muted text-foreground', btn: 'bg-transparent hover:bg-muted border-2 border-border text-foreground' },
  pro: { border: 'border-primary/50', badge: 'bg-primary text-white', btn: 'bg-primary hover:opacity-90 text-white shadow-xl shadow-primary/30' },
  professional: { border: 'border-primary/50', badge: 'bg-primary text-white', btn: 'bg-primary hover:opacity-90 text-white shadow-xl shadow-primary/30' },
  enterprise: { border: 'border-purple-500/40', badge: 'bg-purple-600 text-white', btn: 'bg-purple-700 hover:bg-purple-600 text-white shadow-xl shadow-purple-600/20' },
};

const getAccent = (slug, i, total) => {
  if (planAccentMap[slug]) return planAccentMap[slug];
  if (i === 0) return planAccentMap.starter;
  if (i === total - 1) return planAccentMap.enterprise;
  return planAccentMap.pro;
};

const getPlanIcon = (slug) => {
  if (!slug) return <Briefcase className="w-5 h-5 text-primary" />;
  if (slug.includes('enterprise')) return <Building2 className="w-5 h-5 text-purple-400" />;
  if (slug.includes('pro')) return <Crown className="w-5 h-5 text-amber-400" />;
  return <Briefcase className="w-5 h-5 text-primary" />;
};

const parseFeatures = (features) => {
  if (!features) return {};
  if (typeof features === 'string') {
    try { features = JSON.parse(features); } catch { return {}; }
  }
  if (Array.isArray(features)) {
    return Object.fromEntries(features.map(k => [k, true]));
  }
  return features;
};

const LimitCell = ({ value }) => {
  if (value === null || value === undefined)
    return <span className="flex items-center justify-center gap-1 text-emerald-400 font-bold"><Infinity className="w-4 h-4" /> Unlimited</span>;
  if (value === 0)
    return <span className="text-muted-foreground">—</span>;
  return <span className="font-semibold text-foreground">{value.toLocaleString()}</span>;
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('saas/plans');
        const rawData = response.data;
        const plansArray = Array.isArray(rawData) ? rawData : (rawData?.data || []);
        const activePlans = plansArray.filter(p => p.is_active);
        setPlans(activePlans.length > 0 ? activePlans : defaultPlans);
      } catch {
        setPlans(defaultPlans);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const categories = [...new Set(FEATURE_CATALOGUE.map(f => f.category))];

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <BackgroundParticles count={25} />

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Shield className="w-3.5 h-3.5" />
          Transparent Pricing • GoBD & TSE Compliant
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
          Restaurant OS Plans for Every Scale
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          From independent bistro reservations to full enterprise TSE cash registers and 24/7 AI voice receptionist.
        </p>

        {/* Billing toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
              billingCycle === 'yearly' ? 'bg-primary' : 'bg-muted border border-border'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual Billing
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Save ~20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        {plans.map((plan, index) => {
          const accent = getAccent(plan.slug, index, plans.length);
          const monthlyPrice = billingCycle === 'yearly'
            ? (plan.yearly_price ? Math.round(plan.yearly_price / 12) : plan.monthly_price)
            : plan.monthly_price;

          return (
            <motion.div
              key={plan.id || plan.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-card rounded-3xl border ${accent.border} p-8 flex flex-col justify-between shadow-xl backdrop-blur-sm ${
                plan.is_popular ? 'ring-2 ring-primary/50 shadow-primary/10 scale-[1.02]' : ''
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-primary/30">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {getPlanIcon(plan.slug)}
                    <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground min-h-[32px]">{plan.description}</p>

                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">€{monthlyPrice}</span>
                  <span className="text-xs text-muted-foreground font-medium">/ month</span>
                </div>

                {/* Quota limit bullets */}
                <div className="pt-4 border-t border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reservations</span>
                    <span className="font-bold text-foreground">{plan.reservation_limit ? `${plan.reservation_limit}/mo` : 'Unlimited'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Staff Accounts</span>
                    <span className="font-bold text-foreground">{plan.max_staff ? `Up to ${plan.max_staff}` : 'Unlimited (∞)'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">AI Credits</span>
                    <span className="font-bold text-foreground">{plan.ai_credits_limit ? `${plan.ai_credits_limit} credits` : '5,000 credits'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to="/register"
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${accent.btn}`}
                >
                  Start 14-Day Free Trial
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Feature Comparison Table */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-foreground">Compare Full Feature Matrix</h2>
          <p className="text-xs text-muted-foreground">Detailed breakdown of all 24 system modules and role entitlements</p>
        </div>

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="p-4 w-2/5">Feature & Module</th>
                  {plans.map(p => (
                    <th key={p.slug} className="p-4 text-center">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map(category => (
                  <React.Fragment key={category}>
                    <tr className="bg-muted/20">
                      <td colSpan={plans.length + 1} className="p-3.5 font-black text-xs uppercase tracking-wider text-primary">
                        {category}
                      </td>
                    </tr>
                    {FEATURE_CATALOGUE.filter(f => f.category === category).map(feat => {
                      const Icon = feat.icon;
                      return (
                        <tr key={feat.key} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 flex items-center gap-2.5 font-medium text-foreground">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            {feat.label}
                          </td>
                          {plans.map(plan => {
                            const featMap = parseFeatures(plan.features);
                            const hasFeat = featMap[feat.key] ?? false;
                            return (
                              <td key={plan.slug} className="p-4 text-center">
                                {hasFeat ? (
                                  <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
