import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {CreditCard, CheckCircle, Zap, Shield, Globe, ArrowRight, Loader2, AlertCircle, Smartphone, Users, Globe as GlobeIcon, ShoppingCart, X, ExternalLink, Tag} from 'lucide-react';
import api from '../services/api';
import { COUNTRIES } from '../utils/countries';

const ADDON_ICONS = {
  sms_credits: Smartphone,
  additional_staff: Users,
  white_label_website: GlobeIcon,
};

export default function BillingView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState(null);
  const [addons, setAddons] = useState([]);
  const [activeAddons, setActiveAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [purchasingTopup, setPurchasingTopup] = useState(false);
  const [purchasingAddon, setPurchasingAddon] = useState(null);
  const [cancellingAddon, setCancellingAddon] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [country, setCountry] = useState('US');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [discountCode, setDiscountCode] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    let plansLoaded = false;

    // Fetch Plans (Public)
    try {
      const plansRes = await api.get('billing/plans');
      const planList = Array.isArray(plansRes.data)
        ? plansRes.data
        : (plansRes.data?.plans || []);

      if (Array.isArray(planList) && planList.length > 0) {
        setPlans(planList);
        plansLoaded = true;
      }

      if (plansRes.data?.usage) {
        setStatus(plansRes.data.usage);
      }
    } catch (err) {
      console.error("Failed to fetch plans", err);
    }

    // Fetch Status (Protected)
    try {
      const statusRes = await api.get('billing/status');
      if (statusRes.data) {
        setStatus(statusRes.data);
        if (statusRes.data.country) {
          setCountry(statusRes.data.country);
        }
      }
    } catch (err) {
      console.error("Failed to fetch billing status", err);
      // Only show error if BOTH failed.
      if (!plansLoaded) {
        setError("Unable to load billing information. Please try again later.");
      }
    }

    // Fetch Add-ons
    try {
      const [addonsRes, activeRes] = await Promise.allSettled([
        api.get('addons'),
        api.get('addons/active'),
      ]);
      if (addonsRes.status === 'fulfilled') setAddons(addonsRes.value.data);
      if (activeRes.status === 'fulfilled') setActiveAddons(activeRes.value.data);
    } catch (err) {
      console.error("Failed to fetch add-ons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    if (success === 'true') {
      setSuccessMsg('Payment successful! Your purchase has been processed.');
      setSearchParams({}, { replace: true });
    } else if (canceled === 'true') {
      setError('Payment was cancelled. You can try again anytime.');
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleSubscribe = async (planSlug, cycle = billingCycle) => {
    const selectedCountry = country || status?.country || 'US';
    if (!country) {
      setCountry(selectedCountry);
    }

    setSubscribing(planSlug);
    setError(null);
    try {
      const res = await api.post('billing/subscribe', {
        plan_slug: planSlug,
        interval: cycle,
        country: selectedCountry,
        discount_code: discountCode || null
      });
      
      const redirectUrl = res.data?.url || res.data?.checkout_url || res.data?.payment_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (res.data?.status === 'success' || res.data?.message) {
        setSuccessMsg(res.data.message || "Plan updated successfully!");
        fetchData();
      } else {
        setError("Payment initialization failed. Please contact support.");
      }
    } catch (err) {
      console.error("Subscription upgrade error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to start payment process.";
      setError(msg);
      setTimeout(() => {
        const errorEl = document.getElementById('billing-error-banner');
        if (errorEl) {
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    } finally {
      setSubscribing(null);
    }
  };

  const handleOpenPortal = async () => {
    setOpeningPortal(true);
    setError(null);
    try {
      const res = await api.post('billing/portal');
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        setError('Unable to open billing portal at this time.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate billing portal session.');
    } finally {
      setOpeningPortal(false);
    }
  };

  const handleTopUp = async (amount) => {
    setPurchasingTopup(true);
    setError(null);
    try {
      await api.post('billing/purchase-credits', { amount });
      await fetchData(); // Refresh the credit count
    } catch (err) {
      setError(err.response?.data?.message || "Failed to purchase credits.");
    } finally {
      setPurchasingTopup(false);
    }
  };

  const handlePurchaseAddon = async (addon, quantity = 1) => {
    if (!country) {
      setError("Please select your country first to determine the best payment gateway.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setPurchasingAddon(addon.slug);
    setError(null);
    try {
      const res = await api.post(`addons/${addon.id}/purchase`, { quantity, country });
      if (res.data.url) {
        window.location.href = res.data.url;
      } else if (res.data.message) {
        await fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to purchase add-on.");
    } finally {
      setPurchasingAddon(null);
    }
  };

  const handleCancelAddon = async (addon) => {
    setCancellingAddon(addon.id);
    setError(null);
    try {
      await api.post(`addons/${addon.id}/cancel`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel add-on.");
    } finally {
      setCancellingAddon(null);
    }
  };

  const isAddonActive = (addonId) => {
    return activeAddons.some(a => a.addon_id === addonId && a.status === 'active');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="font-medium animate-pulse">Syncing billing registry...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your commercial plan and payment methods.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white border border-border p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Regional Gateway</p>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <select 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold text-sm outline-none cursor-pointer"
                >
                  <option value="" disabled className="bg-white">Select Country</option>
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code} className="bg-white">
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Promo Code</p>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.trim().toUpperCase())}
                  placeholder="SAVE20"
                  className="bg-transparent text-slate-800 font-bold text-sm outline-none w-28 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-400 font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Current Plan Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-950/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Current Active Tier
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">{status?.plan_name || 'Free'}</h2>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed">
              Your account is currently running on the <span className="text-white font-medium">{status?.plan_name || 'Free'}</span> plan. Features and quotas adapt to this tier.
            </p>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 p-6 rounded-2xl w-full md:w-auto min-w-[260px] shadow-inner">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Subscription Status</div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${status?.status === 'canceled' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className="text-xs font-bold text-white uppercase tracking-tight">{status?.status || 'Active'}</span>
              </div>
              <Shield className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-semibold">Billing Provider</div>
            <div className="font-bold text-sm text-slate-200 capitalize">{status?.provider || 'Standard'}</div>

            {status?.provider === 'paddle' && (
              <button
                type="button"
                onClick={handleOpenPortal}
                disabled={openingPortal}
                className="mt-3 w-full py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-600 shadow-sm"
              >
                {openingPortal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                Manage Subscription
              </button>
            )}

            {/* AI Credits Usage Indicator */}
            <div className="mt-5 pt-5 border-t border-slate-700/70">
              <div className="flex justify-between items-end mb-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Credits Used</div>
                <div className="text-xs font-bold text-white">{status?.ai_credits_used || 0} / {status?.ai_credits_limit ?? '∞'}</div>
              </div>
              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-500 rounded-full" 
                  style={{ width: `${Math.min(((status?.ai_credits_used || 0) / (status?.ai_credits_limit || 1)) * 100, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between items-end">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Top-Up Balance</div>
                <div className="text-xs font-bold text-amber-400">{status?.ai_credits_topup || 0} credits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Call to Action for Free Users */}
        {(status?.plan_slug === 'free' || !status?.plan_slug) && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between p-5 bg-slate-800/60 rounded-2xl border border-slate-700/80 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-300">Unlock high-performance AI automations, increased team seats, and premium features.</p>
            </div>
            <button 
              onClick={() => document.getElementById('plans-selection').scrollIntoView({ behavior: 'smooth' })}
              className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors shadow shrink-0 cursor-pointer"
            >
              View Premium Plans
            </button>
          </div>
        )}
        
        {/* Subtle Background Watermark */}
        <CreditCard className="absolute -bottom-10 -right-10 w-64 h-64 text-white/[0.03] rotate-12 pointer-events-none" />
      </div>

      {/* Plan Selection — MUST come before Top Up so scroll-to works correctly */}
      <div id="plans-selection" className="scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-slate-800" /> Choose Your Plan
          </h2>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                billingCycle === 'yearly' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}>
                Save ~20%
              </span>
            </button>
          </div>
        </div>
        
        {/* Inline Error Banner for Plan Selection */}
        {error && (
          <div id="billing-error-banner" className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-between gap-3 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 p-1 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Responsive Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(Array.isArray(plans) ? plans : []).map((plan) => {
            const isCurrentPlan = 
              (status?.plan_slug && plan.slug && status.plan_slug.toLowerCase() === plan.slug.toLowerCase()) ||
              Boolean(plan.is_current);

            const monthlyPrice = Number(plan.monthly_price ?? plan.price ?? 0);
            const yearlyPrice = Number(plan.yearly_price && plan.yearly_price > 0 ? plan.yearly_price : (monthlyPrice * 10));
            const displayedPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;
            const isEnterprise = plan.slug === 'enterprise' || (!displayedPrice && !plan.is_free && plan.slug !== 'free');

            return (
              <div
                key={plan.id || plan.slug}
                className={`bg-white border-2 rounded-3xl p-8 flex flex-col transition-all group relative ${
                  isCurrentPlan
                    ? 'border-slate-900 bg-slate-50/50 shadow-md ring-1 ring-slate-900/10'
                    : 'border-border hover:border-slate-400 hover:shadow-lg'
                }`}
              >
                {isCurrentPlan ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Current Plan
                  </div>
                ) : plan.is_popular ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    Most Popular
                  </div>
                ) : null}

                <div className="mb-8">
                  <h3 className="text-xl font-black text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    {isEnterprise ? (
                      <span className="text-3xl font-black text-foreground">Custom</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-foreground">${displayedPrice}</span>
                        <span className="text-muted-foreground text-sm">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                      </>
                    )}
                  </div>
                  {billingCycle === 'yearly' && displayedPrice > 0 && !isEnterprise && (
                    <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                      Approx. ${Math.round(displayedPrice / 12)}/mo billed annually
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">What's included</p>
                  <ul className="space-y-3">
                    {plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features)
                      ? Object.entries(plan.features)
                          .filter(([, v]) => v === true)
                          .map(([key]) => (
                            <li key={key} className="flex items-center gap-3 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                            </li>
                          ))
                      : Array.isArray(plan.features) && plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                          </li>
                        ))
                    }
                    <li className="flex items-center gap-3 text-sm font-bold text-slate-800 pt-2 border-t border-border mt-2">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{plan.ai_credits_limit !== null && plan.ai_credits_limit !== undefined ? `${plan.ai_credits_limit.toLocaleString()} AI Credits/mo` : 'Unlimited AI Credits'}</span>
                    </li>
                  </ul>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    if (isCurrentPlan) return;
                    if (isEnterprise) {
                      window.location.href = `mailto:${status?.sales_email || 'sales@sectros.com'}?subject=Enterprise%20Tier%20Inquiry`;
                      return;
                    }
                    handleSubscribe(plan.slug, billingCycle);
                  }}
                  disabled={isCurrentPlan || subscribing === plan.slug}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-sm cursor-pointer'
                  }`}
                >
                  {subscribing === plan.slug ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : isEnterprise ? (
                    <>
                      Contact Sales <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      {status?.plan_slug && status.plan_slug !== 'free'
                        ? `Switch to ${plan.name}`
                        : `Upgrade to ${plan.name}`}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Enterprise Flex — Now explicitly UNDER the pricing plans */}
        <div className="max-w-xl mx-auto bg-slate-50 border-2 border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 mb-12">
          <Zap className="w-10 h-10 text-amber-500" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Enterprise Flex</h3>
            <p className="text-muted-foreground text-sm mt-1">Need a specialized setup for 50+ locations?</p>
          </div>
          <button 
            onClick={() => window.location.href = `mailto:${status?.sales_email || 'sales@sectros.com'}?subject=Enterprise%20Flex%20Inquiry`}
            className="px-8 py-3 bg-white border border-border text-primary font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
          >
            Contact Sales Team
          </button>
        </div>
      </div>

      {/* AI Credit Top-Up Section */}
      <div className="bg-white border text-center border-border rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
        <div>
           <h3 className="text-xl font-black text-foreground flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" /> Top Up AI Credits
           </h3>
           <p className="text-muted-foreground text-sm mt-2 max-w-lg mx-auto">
             Need more capacity before your cycle resets? Buy non-expiring AI credits that carry over until you use them all.
           </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
           {[ {amount: 250, price: 10}, {amount: 1000, price: 35}, {amount: 5000, price: 150} ].map(pack => (
              <button
                 key={pack.amount}
                 disabled={purchasingTopup}
                 onClick={() => handleTopUp(pack.amount)}
                 className="flex flex-col items-center p-4 bg-white border-2 border-border rounded-2xl hover:border-amber-500 hover:bg-amber-50 transition-all min-w-[140px] focus:outline-none focus:ring-4 focus:ring-amber-500/20 active:scale-95 disabled:opacity-50"
              >
                 <span className="text-2xl font-black text-foreground">{pack.amount.toLocaleString()}</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 mb-3">Credits</span>
                 <div className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg w-full">
                    ${pack.price}
                 </div>
              </button>
           ))}
        </div>
        {purchasingTopup && <p className="text-sm font-medium text-amber-600 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Provisioning credits...</p>}
      </div>

      {/* Add-ons Section */}
      {addons.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black text-foreground">Add-ons</h2>
          </div>
          <p className="text-muted-foreground text-sm -mt-4">Enhance your plan with additional capabilities.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addons.map((addon) => {
              const Icon = ADDON_ICONS[addon.slug] || ShoppingCart;
              const active = isAddonActive(addon.id);
              const activeRecord = activeAddons.find(a => a.addon_id === addon.id);

              return (
                <div key={addon.id} className={`bg-white border-2 rounded-3xl p-6 flex flex-col transition-all shadow-sm ${active ? 'border-emerald-500 bg-emerald-50/50' : 'border-border hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-black text-foreground text-sm">{addon.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{addon.category}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 flex-1">{addon.description}</p>

                  <div className="flex items-baseline gap-1 mb-4">
                    {addon.unit_price ? (
                      <>
                        <span className="text-2xl font-black text-foreground">${addon.unit_price}</span>
                        <span className="text-xs text-muted-foreground">{addon.unit_label}</span>
                      </>
                    ) : addon.price ? (
                      <>
                        <span className="text-2xl font-black text-foreground">${addon.price}</span>
                        <span className="text-xs text-muted-foreground">{addon.unit_label}</span>
                      </>
                    ) : null}
                  </div>

                  {active ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                        <CheckCircle className="w-4 h-4" />
                        Active {activeRecord?.quantity > 1 ? `(${activeRecord.quantity}x)` : ''}
                      </div>
                      <button
                        onClick={() => handleCancelAddon(addon)}
                        disabled={cancellingAddon === addon.id}
                        className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {cancellingAddon === addon.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePurchaseAddon(addon)}
                      disabled={purchasingAddon === addon.slug}
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-foreground hover:bg-primary hover:text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {purchasingAddon === addon.slug ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>Add to Plan <ArrowRight className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
