import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {Check, X, Briefcase, Building2, Crown, ChevronRight, Plus, MessageSquare, DollarSign, Bot, Calendar, Component, Utensils, Table, LayoutDashboard, Users, CreditCard, Settings, ShoppingBag, Package, Infinity, HelpCircle} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/centralApi';
import BackgroundParticles from '../../components/common/BackgroundParticles';

/* ──────────────────────────────────────────────────────────
   Feature catalogue — kept in sync with PlanManagementView
   ────────────────────────────────────────────────────────── */
const FEATURE_CATALOGUE = [
  // Always-on
  { key: 'insights',          label: 'Insights Dashboard',        icon: LayoutDashboard, alwaysOn: true,  category: 'Core' },
  { key: 'reservations',      label: 'Reservations',              icon: Calendar,        alwaysOn: true,  category: 'Core' },
  { key: 'configuration',     label: 'Business Configuration',    icon: Settings,        alwaysOn: true,  category: 'Core' },
  { key: 'provisioning',      label: 'Provisioning & Onboarding', icon: Plus,            alwaysOn: true,  category: 'Core' },
  { key: 'billing_plan',      label: 'Billing & Plan Management', icon: CreditCard,      alwaysOn: true,  category: 'Core' },
  // Engagement
  { key: 'social_integration',label: 'Unified Chat (WA/IG/FB)',   icon: MessageSquare,   alwaysOn: false, category: 'Engagement' },
  { key: 'online_ordering',   label: 'Online Ordering Portal',    icon: ShoppingBag,     alwaysOn: false, category: 'Engagement' },
  { key: 'directory_featured',label: 'Featured Directory Ad',     icon: Briefcase,        alwaysOn: false, category: 'Engagement' },
  // Operations
  { key: 'pos_terminal',      label: 'POS Terminal',              icon: Component,       alwaysOn: false, category: 'Operations' },
  { key: 'menu_builder',      label: 'Menu Builder (F&B)',        icon: Utensils,        alwaysOn: false, category: 'Operations' },
  { key: 'service_builder',   label: 'Service Builder (Salons)',  icon: Briefcase,        alwaysOn: false, category: 'Operations' },
  { key: 'room_manager',      label: 'Room Manager (Hotels)',     icon: Building2,       alwaysOn: false, category: 'Operations' },
  { key: 'floor_plan',        label: 'Space & Layout Manager',    icon: Table,           alwaysOn: false, category: 'Operations' },
  { key: 'inventory_tracking',label: 'Inventory Management',      icon: Package,         alwaysOn: false, category: 'Operations' },
  { key: 'waitlist_automation',label: 'Automated Waitlist',       icon: Plus,            alwaysOn: false, category: 'Operations' },
  // Enterprise
  { key: 'branch_management', label: 'Multi-Branch Support',      icon: Building2,       alwaysOn: false, category: 'Enterprise' },
  { key: 'public_api',        label: 'Public Developer API',      icon: Settings,        alwaysOn: false, category: 'Enterprise' },
  { key: 'franchise_tools',   label: 'Franchise Group Control',   icon: Users,           alwaysOn: false, category: 'Enterprise' },
  // AI & Team
  { key: 'staff_management',  label: 'Staff Profiles & Roles',   icon: Users,           alwaysOn: false, category: 'Team' },
  { key: 'financial_reports', label: 'Financial Reports',         icon: DollarSign,      alwaysOn: false, category: 'Analytics' },
  { key: 'ai_automation',     label: 'AI Command Centre',         icon: Bot,             alwaysOn: false, category: 'AI' },
];

const LIMIT_ROWS = [
  { key: 'reservation_limit', label: 'Monthly Reservations' },
  { key: 'max_staff',         label: 'Staff Accounts' },
  { key: 'ai_credits_limit',  label: 'Monthly AI Credits' },
];

const defaultPlans = [
  {
    id: 'default-1', name: 'Starter', slug: 'starter',
    monthly_price: 29, yearly_price: 24, popular: false,
    description: 'Perfect for local shops and new businesses.',
    reservation_limit: 100, max_staff: 2, ai_credits_limit: 50,
    features: { insights: true, reservations: true, configuration: true, billing_plan: true, menu_builder: true, staff_management: true }
  },
  {
    id: 'default-2', name: 'Professional', slug: 'professional',
    monthly_price: 79, yearly_price: 64, popular: true,
    description: 'Grow your brand with advanced AI & marketplace tools.',
    reservation_limit: 1000, max_staff: 10, ai_credits_limit: 1000,
    features: {
      insights: true, reservations: true, configuration: true, billing_plan: true,
      social_integration: true, pos_terminal: true, menu_builder: true,
      service_builder: true, room_manager: true,
      floor_plan: true, staff_management: true, financial_reports: true,
      directory_featured: true, waitlist_automation: true, online_ordering: true
    }
  },
  {
    id: 'default-3', name: 'Enterprise', slug: 'enterprise',
    monthly_price: 249, yearly_price: 199, popular: false,
    description: 'Scalable infrastructure for franchises and large groups.',
    reservation_limit: null, max_staff: null, ai_credits_limit: 10000,
    features: {
      insights: true, reservations: true, configuration: true, billing_plan: true,
      social_integration: true, pos_terminal: true, menu_builder: true, floor_plan: true,
      service_builder: true, room_manager: true,
      staff_management: true, financial_reports: true, ai_automation: true,
      online_ordering: true, inventory_tracking: true, directory_featured: true,
      waitlist_automation: true, branch_management: true, public_api: true, franchise_tools: true
    }
  }
];

const planAccentMap = {
  starter: { border: 'border-border', badge: 'bg-muted text-foreground', btn: 'bg-transparent hover:bg-muted border-2 border-border text-foreground' },
  professional: { border: 'border-blue-500/50', badge: 'bg-blue-600 text-white', btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30' },
  enterprise: { border: 'border-purple-500/40', badge: 'bg-purple-600 text-white', btn: 'bg-purple-700 hover:bg-purple-600 text-white shadow-xl shadow-purple-600/20' },
};

const getAccent = (slug, i, total) => {
  if (planAccentMap[slug]) return planAccentMap[slug];
  if (i === 0) return planAccentMap.starter;
  if (i === total - 1) return planAccentMap.enterprise;
  return planAccentMap.professional;
};

const getPlanIcon = (slug) => {
  if (!slug) return <Briefcase className="w-5 h-5 text-blue-400" />;
  if (slug.includes('enterprise')) return <Building2 className="w-5 h-5 text-purple-400" />;
  if (slug.includes('pro')) return <Crown className="w-5 h-5 text-amber-400" />;
  return <Briefcase className="w-5 h-5 text-blue-400" />;
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

  return (
    <div className="w-full relative overflow-hidden">
      {/* ── Background ── */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3" />
      <BackgroundParticles count={30} color="rgba(99, 102, 241, 0.08)" />

      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative z-10">

        {/* ── Header ── */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6"
          >
            <Briefcase className="w-4 h-4" /> Transparent Pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-6"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            No hidden fees. No per-booking commissions. Choose the plan that fits your business's growth stage.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center p-1 bg-card border border-border rounded-full"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-primary text-primary-foreground shadow-xl' : 'text-muted-foreground hover:text-foreground'}`}
            >Monthly</button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-primary text-primary-foreground shadow-xl' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Annually <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] uppercase font-bold tracking-wider">Save 20%</span>
            </button>
          </motion.div>
        </div>

        {/* ── Plan Cards ── */}
        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="animate-pulse flex gap-2">
              {[...Array(3)].map((_, i) => <div key={i} className="w-3 h-3 bg-blue-500 rounded-full" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto mb-24"
          >
            {plans.map((plan, i) => {
              const accent = getAccent(plan.slug, i, plans.length);
              const isYearly = billingCycle === 'yearly';
              const monthlyPrice = parseFloat(plan.monthly_price);
              const yearlyPrice = parseFloat(plan.yearly_price);
              
              const displayPrice = isYearly 
                ? (yearlyPrice > 0 ? Math.round(yearlyPrice / 12) : Math.round(monthlyPrice * 0.8))
                : monthlyPrice;

              const features = parseFeatures(plan.features);
              const isPopular = plan.popular || (i === 1 && plans.length === 3);

              return (
                <motion.div
                  key={plan.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-3xl p-8 bg-card/50 backdrop-blur-xl border flex flex-col transition-all duration-300 w-full md:w-[calc(33.33%-1rem)] min-w-[280px] max-w-md ${accent.border} ${isPopular ? 'shadow-2xl shadow-blue-900/20 md:scale-105 z-10' : 'hover:bg-card/70'}`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-linear-to-r from-blue-600 to-indigo-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-muted rounded-xl border border-border">{getPlanIcon(plan.slug)}</div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{plan.description || 'Professional features for your business.'}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-foreground">${displayPrice}</span>
                      <span className="text-muted-foreground font-medium">/mo</span>
                    </div>
                    {isYearly && (
                      <p className="text-xs text-emerald-400 mt-1.5 font-medium">Billed annually (${yearlyPrice || Math.round(monthlyPrice * 9.6)}/yr)</p>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    to="/register"
                    className={`w-full py-4 rounded-xl font-black text-sm transition-all mb-8 flex justify-center items-center gap-2 group active:scale-95 ${accent.btn}`}
                  >
                    Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {/* Feature Highlights */}
                  <div className="space-y-3 flex-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50 pb-3 mb-3">What's included</p>
                    {Object.entries(features)
                      .filter(([, v]) => v)
                      .map(([key]) => {
                        const feat = FEATURE_CATALOGUE.find(f => f.key === key);
                        return feat ? (
                          <div key={key} className="flex items-start gap-3">
                            <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <Check className="w-3 h-3 text-blue-400" />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium leading-relaxed">{feat.label}</span>
                          </div>
                        ) : null;
                      })
                      .filter(Boolean)
                      .slice(0, 7)}
                    {/* Limits Summary */}
                    <div className="pt-4 mt-2 border-t border-border/30 space-y-2">
                      {LIMIT_ROWS.map(row => {
                        const v = plan[row.key];
                        return (
                          <div key={row.key} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-bold text-foreground">
                              {v === null || v === undefined ? '∞ Unlimited' : v === 0 ? '—' : v.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Full Comparison Table ── */}
        {!isLoading && plans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="max-w-6xl mx-auto"
          >
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">Full Feature Comparison</h2>
              <p className="text-muted-foreground">See exactly what you get on every plan before you commit.</p>
            </div>

            {/* Build unified feature list from all plans + FEATURE_CATALOGUE */}
            {(() => {
              const allKeys = new Set(FEATURE_CATALOGUE.map(f => f.key));
              plans.forEach(p => {
                const pf = parseFeatures(p.features);
                Object.keys(pf).forEach(k => allKeys.add(k));
              });
              const unifiedFeatures = FEATURE_CATALOGUE.slice();
              allKeys.forEach(k => {
                if (!unifiedFeatures.find(f => f.key === k)) {
                  unifiedFeatures.push({
                    key: k,
                    label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    icon: Check,
                    alwaysOn: false,
                    category: 'Other',
                  });
                }
              });
              const categories = [...new Set(unifiedFeatures.map(f => f.category))];

              return (
            <div className="overflow-x-auto rounded-3xl border border-border bg-card/30 backdrop-blur-xl shadow-2xl">
              <table className="w-full min-w-[640px]">
                {/* Table Head — Plan Columns */}
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-6 text-sm font-bold text-muted-foreground uppercase tracking-widest w-[40%]">Feature</th>
                    {plans.map((plan, i) => {
                      const isPopular = plan.popular || (i === 1 && plans.length === 3);
                      const accent = getAccent(plan.slug, i, plans.length);
                      const isYearly = billingCycle === 'yearly';
                      const monthlyPrice = parseFloat(plan.monthly_price);
                      const yearlyPrice = parseFloat(plan.yearly_price);
                      const displayPrice = isYearly 
                        ? (yearlyPrice > 0 ? Math.round(yearlyPrice / 12) : Math.round(monthlyPrice * 0.8))
                        : monthlyPrice;

                      return (
                        <th key={plan.id || i} className={`p-6 text-center ${isPopular ? 'bg-blue-500/5' : ''}`}>
                          <div className="flex flex-col items-center gap-2">
                            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${accent.badge}`}>{plan.name}</span>
                            <span className="text-2xl font-black text-foreground">
                              ${displayPrice}
                              <span className="text-sm font-medium text-muted-foreground">/mo</span>
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {/* Usage Limits Section */}
                  <tr>
                    <td colSpan={plans.length + 1} className="px-6 pt-6 pb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Usage Limits</span>
                    </td>
                  </tr>
                  {LIMIT_ROWS.map(row => (
                    <tr key={row.key} className="border-t border-border/30 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground font-medium">{row.label}</td>
                      {plans.map((plan, i) => (
                        <td key={plan.id || i} className={`px-6 py-4 text-center text-sm ${(plan.popular || (i === 1 && plans.length === 3)) ? 'bg-blue-500/5' : ''}`}>
                          <LimitCell value={plan[row.key]} />
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Feature Categories */}
                  {categories.map(cat => {
                    const catFeatures = unifiedFeatures.filter(f => f.category === cat);
                    return (
                      <React.Fragment key={cat}>
                        <tr>
                          <td colSpan={plans.length + 1} className="px-6 pt-6 pb-2">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{cat}</span>
                          </td>
                        </tr>
                        {catFeatures.map((feat, fi) => (
                          <tr
                            key={feat.key}
                            className={`border-t border-border/30 hover:bg-muted/50 transition-colors`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <feat.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-sm text-muted-foreground font-medium">{feat.label}</span>
                                {feat.alwaysOn && (
                                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-600/30 rounded-full px-2 py-0.5">All Plans</span>
                                )}
                              </div>
                            </td>
                            {plans.map((plan, i) => {
                              const planFeatures = parseFeatures(plan.features);
                              const included = planFeatures[feat.key] === true;
                              const isPopular = plan.popular || (i === 1 && plans.length === 3);
                              return (
                                <td key={plan.id || i} className={`px-6 py-4 text-center ${isPopular ? 'bg-blue-500/5' : ''}`}>
                                  {included ? (
                                    <div className="flex justify-center">
                                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex justify-center">
                                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}

                  {/* CTA Row */}
                  <tr className="border-t border-border">
                    <td className="px-6 py-8" />
                    {plans.map((plan, i) => {
                      const accent = getAccent(plan.slug, i, plans.length);
                      const isPopular = plan.popular || (i === 1 && plans.length === 3);
                      return (
                        <td key={plan.id || i} className={`px-6 py-8 text-center ${isPopular ? 'bg-blue-500/5' : ''}`}>
                          <Link
                            to="/register"
                            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all active:scale-95 group ${accent.btn}`}
                          >
                            Get {plan.name} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
              );
            })()}
          </motion.div>
        )}

        {/* ── Enterprise Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 max-w-4xl mx-auto bg-card border border-border rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-primary/5"
        >
          <div>
            <h4 className="text-2xl font-bold text-foreground mb-2">Need a custom enterprise setup?</h4>
            <p className="text-muted-foreground">For chains with 10+ locations needing custom SLA guarantees and dedicated account management.</p>
          </div>
          <Link
            to="/contact"
            className="whitespace-nowrap px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Contact Sales
          </Link>
        </motion.div>

        {/* ── FAQ Snippet ── */}
        <div className="mt-20 max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            All plans include a <span className="text-foreground font-semibold">14-day free trial</span>. No credit card required. Cancel any time.
            Questions? <Link to="/contact" className="text-primary hover:underline font-semibold">Talk to us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
