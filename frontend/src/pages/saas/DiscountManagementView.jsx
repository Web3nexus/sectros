import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Tag, RefreshCw, CheckCircle, Ticket, History } from 'lucide-react';
import api from '../../services/centralApi';

const EMPTY_DISCOUNT = {
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  currency_code: '',
  min_subtotal: '',
  max_discount: '',
  restrict_to: { scopes: ['subscription'], plan_slugs: [], addon_ids: [], template_ids: [] },
  usage_limit: '',
  per_customer_limit: '',
  starts_at: '',
  expires_at: '',
  is_active: true,
  is_recurring: false,
  maximum_recurring_intervals: '',
};

export default function DiscountManagementView() {
  const [discounts, setDiscounts] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_DISCOUNT);
  const [error, setError] = useState(null);
  const [syncErrors, setSyncErrors] = useState(null);
  const [redemptions, setRedemptions] = useState(null);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('saas/discounts');
      setDiscounts(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_DISCOUNT });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      code: d.code,
      description: d.description || '',
      type: d.type,
      value: d.value,
      currency_code: d.currency_code || '',
      min_subtotal: d.min_subtotal ?? '',
      max_discount: d.max_discount ?? '',
      restrict_to: d.restrict_to || { scopes: [], plan_slugs: [], addon_ids: [], template_ids: [] },
      usage_limit: d.usage_limit ?? '',
      per_customer_limit: d.per_customer_limit ?? '',
      starts_at: d.starts_at ? String(d.starts_at).slice(0, 16) : '',
      expires_at: d.expires_at ? String(d.expires_at).slice(0, 16) : '',
      is_active: !!d.is_active,
      is_recurring: !!d.is_recurring,
      maximum_recurring_intervals: d.maximum_recurring_intervals ?? '',
    });
    setError(null);
    setModalOpen(true);
  };

  const toggleScope = (scope) => {
    const scopes = form.restrict_to.scopes.includes(scope)
      ? form.restrict_to.scopes.filter(s => s !== scope)
      : [...form.restrict_to.scopes, scope];
    setForm(f => ({ ...f, restrict_to: { ...f.restrict_to, scopes } }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSyncErrors(null);
    const payload = {
      code: form.code,
      description: form.description,
      type: form.type,
      value: form.value,
      currency_code: form.type === 'fixed' ? form.currency_code : null,
      min_subtotal: form.min_subtotal || null,
      max_discount: form.max_discount || null,
      restrict_to: {
        scopes: form.restrict_to.scopes,
        plan_slugs: form.restrict_to.plan_slugs.filter(Boolean),
        addon_ids: form.restrict_to.addon_ids.filter(Boolean),
        template_ids: form.restrict_to.template_ids.filter(Boolean),
      },
      usage_limit: form.usage_limit || null,
      per_customer_limit: form.per_customer_limit || null,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      is_active: !!form.is_active,
      is_recurring: !!form.is_recurring,
      maximum_recurring_intervals: form.maximum_recurring_intervals || null,
    };
    try {
      const res = editing
        ? await api.put(`saas/discounts/${editing.id}`, payload)
        : await api.post('saas/discounts', payload);
      setSyncErrors(res.data.sync_errors && Object.keys(res.data.sync_errors).length ? res.data.sync_errors : null);
      setModalOpen(false);
      fetchDiscounts();
    } catch (e) {
      setError(e.response?.data?.errors ? Object.values(e.response.data.errors)[0][0] : (e.response?.data?.message || 'Failed to save discount'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete discount ${d.code}? Redemptions will also be removed.`)) return;
    try {
      await api.delete(`saas/discounts/${d.id}`);
      fetchDiscounts();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete discount');
    }
  };

  const handleSync = async (d, gateway) => {
    try {
      await api.post(`saas/discounts/${d.id}/sync`, { gateway });
      fetchDiscounts();
    } catch (e) {
      alert(e.response?.data?.message || `Failed to sync to ${gateway}`);
    }
  };

  const viewRedemptions = async (d) => {
    try {
      const res = await api.get(`saas/discounts/${d.id}/redemptions`);
      setRedemptions({ discount: d, data: res.data });
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to load redemptions');
    }
  };

  const input = (label, key, opts = {}) => (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
      <input
        type={opts.type || 'text'}
        value={form[key]}
        disabled={opts.disabled}
        onChange={e => setForm(f => ({ ...f, [key]: opts.type === 'checkbox' ? e.target.checked : e.target.value }))}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
        placeholder={opts.placeholder || ''}
      />
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Ticket className="h-6 w-6 text-primary" /> Discount Codes</h1>
          <p className="text-sm text-muted-foreground">Create gateway-aware coupons applied at checkout (Paddle, Stripe, Paystack, Flutterwave, Dodo).</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">
          <Plus className="h-4 w-4" /> New Discount
        </button>
      </div>

      {error && !modalOpen && <div className="mb-4 rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</div>}
      {syncErrors && (
        <div className="mb-4 rounded-lg bg-amber-500/10 text-amber-600 text-sm px-4 py-3">
          Some gateway syncs failed: {Object.entries(syncErrors).map(([g, m]) => <div key={g}><b>{g}:</b> {m}</div>)}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : redemptions ? (
        <div>
          <button onClick={() => setRedemptions(null)} className="mb-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <X className="h-4 w-4" /> Back to discounts
          </button>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><History className="h-5 w-5" /> Redemptions for {redemptions.discount.code}</h2>
          {redemptions.data.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No redemptions yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Tenant</th>
                    <th className="px-4 py-2 text-left">Scope</th>
                    <th className="px-4 py-2 text-left">Gateway</th>
                    <th className="px-4 py-2 text-left">Transaction</th>
                    <th className="px-4 py-2 text-left">Amount Off</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.data.data.map(r => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-2">{r.tenant_id}</td>
                      <td className="px-4 py-2 capitalize">{r.scope}</td>
                      <td className="px-4 py-2 capitalize">{r.gateway}</td>
                      <td className="px-4 py-2 font-mono text-xs">{r.transaction_id}</td>
                      <td className="px-4 py-2">{r.amount_off}</td>
                      <td className="px-4 py-2 text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Value</th>
                <th className="px-4 py-3 text-left">Scopes</th>
                <th className="px-4 py-3 text-left">Usage</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Gateway</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.data.map(d => (
                <tr key={d.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-bold flex items-center gap-2"><Tag className="h-4 w-4 text-primary" />{d.code}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{d.description || d.display}</div>
                  </td>
                  <td className="px-4 py-3">{d.display}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(d.scopes || []).map(s => <span key={s} className="rounded bg-muted px-2 py-0.5 text-xs capitalize">{s}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3">{d.usage_count}{d.usage_limit ? ` / ${d.usage_limit}` : ''}</td>
                  <td className="px-4 py-3">
                    {d.usable ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-xs font-semibold">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="rounded bg-destructive/10 text-destructive px-2 py-0.5 text-xs font-semibold">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {d.paddle_id && <span className="rounded bg-blue-500/10 text-blue-600 px-2 py-0.5 text-xs">Paddle</span>}
                      {d.stripe_coupon_id && <span className="rounded bg-purple-500/10 text-purple-600 px-2 py-0.5 text-xs">Stripe</span>}
                      {!d.paddle_id && !d.stripe_coupon_id && <span className="text-xs text-muted-foreground">local only</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(d)} className="rounded p-1.5 hover:bg-muted" title="Edit"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleSync(d, 'paddle')} className="rounded p-1.5 hover:bg-muted" title="Sync to Paddle"><RefreshCw className="h-4 w-4 text-blue-500" /></button>
                      <button onClick={() => viewRedemptions(d)} className="rounded p-1.5 hover:bg-muted" title="Redemptions"><History className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(d)} className="rounded p-1.5 hover:bg-muted" title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {discounts.data.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No discounts yet. Create your first code.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-card/60 p-4 pt-10">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? `Edit ${editing.code}` : 'New Discount'}</h2>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              {input('Code', 'code', { placeholder: 'e.g. SAVE20' })}
              {input('Description', 'description', { placeholder: '20% off Pro plan' })}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
              {input(form.type === 'fixed' ? 'Value (in minor units)' : 'Value (%)', 'value', { placeholder: form.type === 'fixed' ? 'e.g. 500' : 'e.g. 20' })}
              {form.type === 'fixed' && input('Currency', 'currency_code', { placeholder: 'USD', disabled: Boolean(editing?.currency_code) })}
              {input('Min Subtotal', 'min_subtotal', { type: 'number' })}
              {input('Max Discount', 'max_discount', { type: 'number' })}
              {input('Usage Limit', 'usage_limit', { type: 'number' })}
              {input('Per-Customer Limit', 'per_customer_limit', { type: 'number' })}
              {input('Starts At', 'starts_at', { type: 'datetime-local' })}
              {input('Expires At', 'expires_at', { type: 'datetime-local' })}
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Applies to</label>
              <div className="flex flex-wrap gap-2">
                {['subscription', 'addon', 'theme'].map(s => (
                  <button key={s} onClick={() => toggleScope(s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold border ${form.restrict_to.scopes.includes(s) ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card'}`}>
                    {s === 'subscription' ? 'Plans' : s === 'addon' ? 'Add-ons' : 'Themes'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_recurring} onChange={e => setForm(f => ({ ...f, is_recurring: e.target.checked }))} />
                Recurring (Paddle)
              </label>
              {form.is_recurring && (
                <label className="text-sm">Max recurring intervals
                  <input type="number" value={form.maximum_recurring_intervals} onChange={e => setForm(f => ({ ...f, maximum_recurring_intervals: e.target.value }))} className="ml-2 w-24 rounded-lg border border-border bg-card px-3 py-1.5 text-sm" />
                </label>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}