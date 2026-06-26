import React, { useState, useEffect } from 'react';
import {Plus, Edit2, Trash2, CheckCircle, X, Loader2, Clock, DollarSign, Star, Calendar, Hash, TrendingUp, Save, Phone, GripVertical} from 'lucide-react';
import api from '../../services/centralApi';

const defaultPlan = {
  plan_name: '',
  plan_description: '',
  monthly_price: '',
  yearly_price: '',
  currency: 'USD',
  trial_days: 0,
  included_minutes_monthly: '',
  included_minutes_yearly: '',
  extra_minute_rate: '',
  max_call_duration_minutes: '',
  max_calls_per_month: '',
  features: '{}',
  is_popular: false,
  is_active: true,
  sort_order: 0,
};

export default function VoiceAgentPlanListView() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('saas/voice-agent-plans');
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch voice agent plans', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openNew = () => setEditingPlan({ ...defaultPlan });
  const openEdit = (plan) => setEditingPlan({ ...plan });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...editingPlan,
        monthly_price: editingPlan.monthly_price === '' ? null : parseFloat(editingPlan.monthly_price),
        yearly_price: editingPlan.yearly_price === '' ? null : parseFloat(editingPlan.yearly_price),
        trial_days: editingPlan.trial_days === '' ? 0 : parseInt(editingPlan.trial_days, 10),
        included_minutes_monthly: editingPlan.included_minutes_monthly === '' ? null : parseInt(editingPlan.included_minutes_monthly, 10),
        included_minutes_yearly: editingPlan.included_minutes_yearly === '' ? null : parseInt(editingPlan.included_minutes_yearly, 10),
        extra_minute_rate: editingPlan.extra_minute_rate === '' ? null : parseFloat(editingPlan.extra_minute_rate),
        max_call_duration_minutes: editingPlan.max_call_duration_minutes === '' ? null : parseInt(editingPlan.max_call_duration_minutes, 10),
        max_calls_per_month: editingPlan.max_calls_per_month === '' ? null : parseInt(editingPlan.max_calls_per_month, 10),
        sort_order: editingPlan.sort_order === '' ? 0 : parseInt(editingPlan.sort_order, 10),
      };
      if (editingPlan.id) {
        await api.put(`saas/voice-agent-plans/${editingPlan.id}`, payload);
      } else {
        await api.post('saas/voice-agent-plans', payload);
      }
      setMessage({ type: 'success', text: 'Voice agent plan saved successfully!' });
      setEditingPlan(null);
      fetchPlans();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save voice agent plan.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this voice agent plan? This action cannot be undone.')) return;
    try {
      await api.delete(`/saas/voice-agent-plans/${id}`);
      setMessage({ type: 'success', text: 'Voice agent plan deleted.' });
      fetchPlans();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete voice agent plan.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Voice Agent Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure voice AI subscription tiers, minute allocations, and pricing.</p>
        </div>
        <button
          onClick={openNew}
          className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(plans.length === 0 ? [] : plans).map(plan => (
            <div key={plan.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-primary/30 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><Phone className="w-4 h-4" /></div>
                    <span className="text-lg font-bold text-foreground">{plan.plan_name}</span>
                    {plan.is_popular && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Popular
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground">${parseFloat(plan.monthly_price || 0).toFixed(2)}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  {parseFloat(plan.yearly_price || 0) > 0 && (
                    <div className="text-xs text-muted-foreground mt-0.5 font-medium">${parseFloat(plan.yearly_price).toFixed(2)}/yr</div>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                  <div className="text-lg font-black text-foreground">{plan.included_minutes_monthly ?? <span className="text-emerald-500">∞</span>}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Min/mo</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                  <div className="text-lg font-black text-foreground">{plan.included_minutes_yearly ?? <span className="text-emerald-500">∞</span>}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Min/yr</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                  <div className="text-lg font-black text-foreground">${parseFloat(plan.extra_minute_rate || 0).toFixed(2)}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Extra/min</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                  <div className="text-lg font-black text-foreground">{plan.trial_days || 0}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Trial Days</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                  plan.is_active
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-muted/50 border-border text-muted-foreground'
                }`}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60 ml-auto">#{plan.sort_order}</span>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="lg:col-span-3 py-20 text-center text-muted-foreground italic border-2 border-dashed border-border rounded-3xl">
              No voice agent plans yet. Click "Add Plan" to get started.
            </div>
          )}
        </div>
      )}

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
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Plan Name</label>
                    <input required value={editingPlan.plan_name} onChange={e => setEditingPlan(p => ({ ...p, plan_name: e.target.value }))}
                      placeholder="e.g. Voice Pro" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description</label>
                    <textarea value={editingPlan.plan_description} onChange={e => setEditingPlan(p => ({ ...p, plan_description: e.target.value }))}
                      placeholder="Describe what this plan includes"
                      rows={3} className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none" />
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
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Currency</label>
                    <select value={editingPlan.currency} onChange={e => setEditingPlan(p => ({ ...p, currency: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="NGN">NGN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Trial Days</label>
                    <input type="number" min="0" value={editingPlan.trial_days} onChange={e => setEditingPlan(p => ({ ...p, trial_days: e.target.value }))}
                      placeholder="0" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Minute Allocation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">Included Minutes (Monthly)</label>
                      <input type="number" min="0" value={editingPlan.included_minutes_monthly} onChange={e => setEditingPlan(p => ({ ...p, included_minutes_monthly: e.target.value }))}
                        placeholder="Leave blank for unlimited" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 text-sm transition-all" />
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Leave blank = ∞ unlimited</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">Included Minutes (Yearly)</label>
                      <input type="number" min="0" value={editingPlan.included_minutes_yearly} onChange={e => setEditingPlan(p => ({ ...p, included_minutes_yearly: e.target.value }))}
                        placeholder="Leave blank for unlimited" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 text-sm transition-all" />
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Leave blank = ∞ unlimited</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">Extra Minute Rate ($)</label>
                      <input type="number" min="0" step="0.001" value={editingPlan.extra_minute_rate} onChange={e => setEditingPlan(p => ({ ...p, extra_minute_rate: e.target.value }))}
                        placeholder="e.g. 0.05" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 text-sm transition-all" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Call Limits</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">Max Call Duration (minutes)</label>
                      <input type="number" min="0" value={editingPlan.max_call_duration_minutes} onChange={e => setEditingPlan(p => ({ ...p, max_call_duration_minutes: e.target.value }))}
                        placeholder="e.g. 60" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">Max Calls Per Month</label>
                      <input type="number" min="0" value={editingPlan.max_calls_per_month} onChange={e => setEditingPlan(p => ({ ...p, max_calls_per_month: e.target.value }))}
                        placeholder="e.g. 500" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 text-sm transition-all" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Features (JSON)</h4>
                  <textarea value={editingPlan.features} onChange={e => setEditingPlan(p => ({ ...p, features: e.target.value }))}
                    placeholder='{"voice_mail": true, "call_recording": true, "custom_voice": false}'
                    rows={4} className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none font-mono text-xs" />
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={editingPlan.is_active} onChange={e => setEditingPlan(p => ({ ...p, is_active: e.target.checked }))} />
                    <div className="w-11 h-6 bg-muted border border-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:border-primary" />
                  </label>
                  <span className="text-sm font-semibold text-foreground">Plan is Active</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={editingPlan.is_popular} onChange={e => setEditingPlan(p => ({ ...p, is_popular: e.target.checked }))} />
                    <div className="w-11 h-6 bg-muted border border-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:border-amber-500" />
                  </label>
                  <span className="text-sm font-semibold text-foreground">Mark as <span className="text-amber-500">Popular</span></span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Sort Order</label>
                  <input type="number" min="0" value={editingPlan.sort_order} onChange={e => setEditingPlan(p => ({ ...p, sort_order: e.target.value }))}
                    placeholder="0" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
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
