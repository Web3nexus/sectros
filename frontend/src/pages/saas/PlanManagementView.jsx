import React, { useState, useEffect } from 'react';
import {Plus, Edit2, Trash2, CheckCircle, X, Loader2, MessageSquare, DollarSign, Bot, Calendar, Component, Utensils, Table, Save, Infinity, LayoutDashboard, Users, CreditCard, Settings, ShoppingBag, Package, Briefcase, Building2, Globe, Table2, LayoutGrid, Phone, Smartphone} from 'lucide-react';
import api from '../../services/centralApi';

const ALL_FEATURES = [
  { key: 'insights',         label: 'Insights',            description: 'Dashboard overview & analytics', icon: LayoutDashboard, alwaysOn: true },
  { key: 'reservations',     label: 'Reservations',        description: 'Accept and manage table bookings', icon: Calendar, alwaysOn: true },
  { key: 'configuration',    label: 'Configuration',        description: 'Store & platform settings', icon: Settings, alwaysOn: true },
  { key: 'provisioning',     label: 'Provisioning',         description: 'New setup & onboarding tools', icon: Plus, alwaysOn: true },
  { key: 'billing_plan',     label: 'Billing & Plan',       description: 'View & upgrade subscription', icon: CreditCard, alwaysOn: true },
  { key: 'social_integration', label: 'Unified Chat',        description: 'WhatsApp, Facebook, Instagram', icon: MessageSquare, alwaysOn: false },
  { key: 'pos_terminal',       label: 'POS Terminal',         description: 'In-house ordering & payments', icon: Component, alwaysOn: false },
  { key: 'menu_builder',       label: 'Menu Builder',         description: 'Digital catalog & QR ordering', icon: Utensils, alwaysOn: false },
  { key: 'service_builder',    label: 'Service Builder',      description: 'Treatment & service cataloging', icon: Briefcase, alwaysOn: false },
  { key: 'room_manager',       label: 'Room Manager',         description: 'Room inventory & categorization', icon: Building2, alwaysOn: false },
  { key: 'floor_plan',         label: 'Space Manager',        description: 'Visual layout & resource mapping', icon: Table, alwaysOn: false },
  { key: 'staff_management',   label: 'Staff Profiles',       description: 'Account access & role control', icon: Users, alwaysOn: false },
  { key: 'financial_reports',  label: 'Financials',          description: 'Revenue, expenses & profit metrics', icon: DollarSign, alwaysOn: false },
  { key: 'ai_automation',      label: 'AI Command',          description: 'AI workflow & intelligent responses', icon: Bot, alwaysOn: false },
  { key: 'online_ordering',    label: 'Online Ordering',      description: 'Customer ordering web portal', icon: ShoppingBag, alwaysOn: false },
  { key: 'inventory_tracking', label: 'Inventory Management', description: 'Stock levels & ingredient tracking', icon: Package, alwaysOn: false },
  { key: 'reservation_deposits', label: 'Reservation Deposits', description: 'Require deposits or payments on bookings', icon: DollarSign, alwaysOn: false },
  { key: 'directory_featured', label: 'Featured Listing',     description: 'Prioritized visibility in directory', icon: Briefcase, alwaysOn: false },
  { key: 'branch_management',  label: 'Multi-Branch',         description: 'Manage multiple physical locations', icon: Building2, alwaysOn: false },
  { key: 'waitlist_automation',label: 'Waitlist Pro',         description: 'Automated SMS & seating logic', icon: Plus, alwaysOn: false },
  { key: 'public_api',         label: 'Public API',           description: 'External integration access', icon: Settings, alwaysOn: false },
  { key: 'custom_domain',      label: 'Custom Domain',        description: 'Connect your own domain name', icon: Globe, alwaysOn: false },
  { key: 'franchise_tools',    label: 'Franchise Tools',      description: 'Central management for groups', icon: Users, alwaysOn: false },
];

const FEATURE_KEYS = ALL_FEATURES.map(f => f.key);
const GATED_FEATURES = ALL_FEATURES.filter(f => !f.alwaysOn);

const defaultFeatures = Object.fromEntries(FEATURE_KEYS.map(k => [k, false]));

const defaultPlan = {
  name: '',
  slug: '',
  monthly_price: '',
  yearly_price: '',
  reservation_limit: '',
  max_staff: '',
  ai_credits_limit: '',
  sms_credits_limit: '',
  voice_credits_limit: '',
  features: { ...defaultFeatures },
  is_active: true,
  is_popular: false,
};

export default function PlanManagementView() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [viewMode, setViewMode] = useState('cards');

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('saas/plans');
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch plans', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openNew = () => setEditingPlan({ ...defaultPlan, features: { ...defaultFeatures } });
  const openEdit = (plan) => setEditingPlan({
    ...plan,
    features: { ...defaultFeatures, ...(plan.features || {}) },
    reservation_limit: plan.reservation_limit ?? '',
    max_staff: plan.max_staff ?? '',
    ai_credits_limit: plan.ai_credits_limit ?? '',
    sms_credits_limit: plan.sms_credits_limit ?? '',
    voice_credits_limit: plan.voice_credits_limit ?? '',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...editingPlan,
        reservation_limit: editingPlan.reservation_limit === '' ? null : parseInt(editingPlan.reservation_limit, 10),
        max_staff: editingPlan.max_staff === '' ? null : parseInt(editingPlan.max_staff, 10),
        ai_credits_limit: editingPlan.ai_credits_limit === '' ? null : parseInt(editingPlan.ai_credits_limit, 10),
        sms_credits_limit: editingPlan.sms_credits_limit === '' ? null : parseInt(editingPlan.sms_credits_limit, 10),
        voice_credits_limit: editingPlan.voice_credits_limit === '' ? null : parseInt(editingPlan.voice_credits_limit, 10),
      };
      await api.post('saas/plans', payload);
      setMessage({ type: 'success', text: 'Plan saved successfully!' });
      setEditingPlan(null);
      fetchPlans();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save plan.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan? Tenants on it will remain but new signups cannot select it.')) return;
    try {
      await api.delete(`/saas/plans/${id}`);
      fetchPlans();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete plan.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const toggleFeature = (key) => {
    setEditingPlan(p => ({ ...p, features: { ...p.features, [key]: !p.features[key] } }));
  };

  const planColor = (slug) =>
    slug === 'enterprise' ? 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10' :
    slug === 'pro' ? 'text-primary border-primary/20 bg-primary/10' :
    'text-muted-foreground border-border bg-muted/50';

  const formatLimit = (val) => val != null ? val.toLocaleString() : <Infinity className="w-4 h-4 text-emerald-500 inline-block" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Plan Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure subscription tiers, features, and limits.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-muted rounded-xl p-0.5 flex">
            <button onClick={() => setViewMode('cards')} className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Table2 className="w-4 h-4" />
            </button>
          </div>
          <button onClick={openNew} className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Plan
          </button>
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : plans.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground italic border-2 border-dashed border-border rounded-3xl">
          No plans yet. Click "New Plan" to get started.
        </div>
      ) : viewMode === 'cards' ? (
        /* ===== CARD VIEW ===== */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-primary/30 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${planColor(plan.slug)}`}>{plan.name}</span>
                    {plan.is_popular && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500">Popular</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-foreground">${plan.monthly_price}</span>
                    <span className="text-muted-foreground text-sm ml-1">/mo</span>
                  </div>
                  {plan.yearly_price > 0 && (
                    <div className="text-xs text-muted-foreground mt-0.5 font-medium">${plan.yearly_price}/yr</div>
                  )}
                </div>
                <div className="flex gap-1 mt-1">
                  <button onClick={() => openEdit(plan)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-xl p-2.5 text-center border border-border">
                  <div className="text-base font-black text-foreground">{formatLimit(plan.reservation_limit)}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Reservations</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-2.5 text-center border border-border">
                  <div className="text-base font-black text-foreground">{formatLimit(plan.max_staff)}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Staff</div>
                </div>
                <div className="bg-primary/5 rounded-xl p-2.5 text-center border border-primary/10">
                  <div className="text-base font-black text-primary">{formatLimit(plan.ai_credits_limit)}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">AI Credits</div>
                </div>
              </div>

              {/* SMS + Voice credits row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-500/5 rounded-xl p-2.5 text-center border border-amber-500/10">
                  <div className="text-base font-black text-amber-600">{formatLimit(plan.sms_credits_limit)}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">SMS Credits</div>
                </div>
                <div className="bg-emerald-500/5 rounded-xl p-2.5 text-center border border-emerald-500/10">
                  <div className="text-base font-black text-emerald-600">{formatLimit(plan.voice_credits_limit)}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Voice Credits</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1 mt-auto">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Features</div>
                <div className="grid grid-cols-1 gap-1">
                  {ALL_FEATURES.map(f => {
                    const enabled = f.alwaysOn || !!plan.features?.[f.key];
                    return (
                      <div key={f.key} className={`flex items-center gap-2 text-[11px] font-semibold ${enabled ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                        <CheckCircle className={`w-3 h-3 shrink-0 ${enabled ? 'text-emerald-500' : 'text-muted-foreground/20'}`} />
                        {f.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ===== TABLE VIEW ===== */
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plan</th>
                  <th className="text-center px-3 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Price</th>
                  <th className="text-center px-3 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reservations</th>
                  <th className="text-center px-3 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Staff</th>
                  <th className="text-center px-3 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">AI Credits</th>
                  <th className="text-center px-3 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">SMS Credits</th>
                  <th className="text-center px-3 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Voice Credits</th>
                  {GATED_FEATURES.map(f => (
                    <th key={f.key} className="text-center px-2 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">{f.label}</th>
                  ))}
                  <th className="text-right px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${planColor(plan.slug)}`}>{plan.name}</span>
                        {plan.is_popular && <span className="text-[8px] font-black text-amber-500">POPULAR</span>}
                        {!plan.is_active && <span className="text-[8px] font-black text-muted-foreground">INACTIVE</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-sm font-black text-foreground">${plan.monthly_price}</span>
                      <span className="text-[10px] text-muted-foreground">/mo</span>
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-foreground">{formatLimit(plan.reservation_limit)}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-foreground">{formatLimit(plan.max_staff)}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-primary">{formatLimit(plan.ai_credits_limit)}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-amber-600">{formatLimit(plan.sms_credits_limit)}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-emerald-600">{formatLimit(plan.voice_credits_limit)}</td>
                    {GATED_FEATURES.map(f => {
                      const enabled = !!plan.features?.[f.key];
                      return (
                        <td key={f.key} className="px-2 py-3 text-center">
                          {enabled ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(plan)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(plan.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditingPlan(null)} />
          <div className="relative bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-bold text-foreground">{editingPlan.id ? 'Edit Plan' : 'Create New Plan'}</h3>
                <button type="button" onClick={() => setEditingPlan(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Plan Name</label>
                    <input required value={editingPlan.name} onChange={e => setEditingPlan(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Pro" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Slug (Internal ID)</label>
                    <input required value={editingPlan.slug} onChange={e => setEditingPlan(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      placeholder="e.g. pro" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Monthly Price ($)</label>
                    <input required type="number" min="0" step="0.01" value={editingPlan.monthly_price} onChange={e => setEditingPlan(p => ({ ...p, monthly_price: e.target.value }))}
                      placeholder="0.00" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Yearly Price ($)</label>
                    <input type="number" min="0" step="0.01" value={editingPlan.yearly_price} onChange={e => setEditingPlan(p => ({ ...p, yearly_price: e.target.value }))}
                      placeholder="0.00" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Usage Limits</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">Monthly Reservation Limit</label>
                      <input type="number" min="0" value={editingPlan.reservation_limit} onChange={e => setEditingPlan(p => ({ ...p, reservation_limit: e.target.value }))}
                        placeholder="Blank = unlimited" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">Max Staff Accounts</label>
                      <input type="number" min="0" value={editingPlan.max_staff} onChange={e => setEditingPlan(p => ({ ...p, max_staff: e.target.value }))}
                        placeholder="Blank = unlimited" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">Monthly AI Credits</label>
                      <input type="number" min="0" value={editingPlan.ai_credits_limit} onChange={e => setEditingPlan(p => ({ ...p, ai_credits_limit: e.target.value }))}
                        placeholder="Blank = unlimited" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-amber-500" /> Monthly SMS Credits
                      </label>
                      <input type="number" min="0" value={editingPlan.sms_credits_limit} onChange={e => setEditingPlan(p => ({ ...p, sms_credits_limit: e.target.value }))}
                        placeholder="Blank = unlimited" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 text-sm transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" /> Monthly Voice Agent Credits
                      </label>
                      <input type="number" min="0" value={editingPlan.voice_credits_limit} onChange={e => setEditingPlan(p => ({ ...p, voice_credits_limit: e.target.value }))}
                        placeholder="Blank = unlimited" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 text-sm transition-all" />
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Set to 0 to disable Voice Agent. Leave blank for unlimited.</p>
                    </div>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Always Included</h4>
                  <p className="text-[10px] text-muted-foreground/40 mb-3">These features are available on every plan and cannot be removed.</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {ALL_FEATURES.filter(f => f.alwaysOn).map(f => {
                      const Icon = f.icon;
                      return (
                        <div key={f.key} className="flex items-center gap-2 p-2.5 bg-muted/30 border border-border rounded-xl opacity-60">
                          <div className="p-1.5 bg-muted rounded-lg text-muted-foreground"><Icon className="w-3.5 h-3.5" /></div>
                          <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
                          <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto shrink-0" />
                        </div>
                      );
                    })}
                  </div>

                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Gated Features</h4>
                  <p className="text-[10px] text-muted-foreground/40 mb-3">Toggle which premium features this plan grants access to.</p>
                  <div className="space-y-2">
                    {GATED_FEATURES.map(f => {
                      const Icon = f.icon;
                      const enabled = !!editingPlan.features[f.key];
                      return (
                        <div key={f.key}
                          onClick={() => toggleFeature(f.key)}
                          className={`flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-all select-none shadow-sm ${
                            enabled ? 'bg-primary/5 border-primary/40' : 'bg-background/40 border-border hover:border-primary/20'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${enabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground/40'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold transition-colors ${enabled ? 'text-foreground' : 'text-muted-foreground/60'}`}>{f.label}</p>
                            <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-medium">{f.description}</p>
                          </div>
                          <div className={`w-10 h-5 rounded-full transition-all shrink-0 relative ${enabled ? 'bg-primary' : 'bg-muted border border-border'}`}>
                            <div className={`absolute top-0.5 h-4 w-4 bg-white rounded-full shadow transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active + Popular toggles */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={editingPlan.is_active} onChange={e => setEditingPlan(p => ({ ...p, is_active: e.target.checked }))} />
                      <div className="w-11 h-6 bg-muted border border-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:border-primary" />
                    </label>
                    <span className="text-sm font-semibold text-foreground">Plan is Active (visible to new subscribers)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={editingPlan.is_popular} onChange={e => setEditingPlan(p => ({ ...p, is_popular: e.target.checked }))} />
                      <div className="w-11 h-6 bg-muted border border-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:border-amber-500" />
                    </label>
                    <span className="text-sm font-semibold text-foreground">Mark as <span className="text-amber-500">Popular</span> (shows badge)</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <button type="button" onClick={() => setEditingPlan(null)} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 rounded-xl bg-primary hover:brightness-110 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
