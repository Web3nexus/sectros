import React, { useState, useEffect } from 'react';
import {Plus, Edit2, Trash2, CheckCircle, X, Loader2, Phone, Wifi, WifiOff, Key, ShieldCheck, Star, Globe, Save, RefreshCw} from 'lucide-react';
import api from '../../services/centralApi';

const defaultProvider = {
  provider_name: '',
  provider_key: 'vapi',
  api_key: '',
  webhook_secret: '',
  is_active: true,
  is_default: false,
};

export default function VoiceProviderListView() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('saas/voice-providers');
      setProviders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch voice providers', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const openNew = () => setEditingItem({ ...defaultProvider });
  const openEdit = (item) => setEditingItem({ ...item, api_key: '', webhook_secret: '' });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...editingItem };
      if (editingItem.id) {
        await api.put(`saas/voice-providers/${editingItem.id}`, payload);
      } else {
        await api.post('saas/voice-providers', payload);
      }
      setMessage({ type: 'success', text: 'Voice provider saved successfully!' });
      setEditingItem(null);
      fetchProviders();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save voice provider.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this voice provider? This action cannot be undone.')) return;
    try {
      await api.delete(`saas/voice-providers/${id}`);
      setMessage({ type: 'success', text: 'Voice provider deleted.' });
      fetchProviders();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete voice provider.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleTestConnection = async (id) => {
    setIsTesting(id);
    try {
      const res = await api.post(`saas/voice-providers/${id}/test`);
      setMessage({ type: res.data.success ? 'success' : 'error', text: res.data.message || 'Connection test completed.' });
      fetchProviders();
    } catch {
      setMessage({ type: 'error', text: 'Connection test failed.' });
    } finally {
      setIsTesting(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Voice Providers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage voice AI provider integrations (Vapi, Retell, etc.).</p>
        </div>
        <button
          onClick={openNew}
          className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Provider
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
          {(providers.length === 0 ? [] : providers).map(provider => (
            <div key={provider.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-primary/30 transition-all shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${provider.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">{provider.provider_name}</span>
                      {provider.is_default && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-1">
                          <Star className="w-3 h-3" /> Default
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground uppercase">{provider.provider_key}</span>
                  </div>
                </div>
                <div className="flex gap-1 mt-1">
                  <button onClick={() => openEdit(provider)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(provider.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border">
                  {provider.status === 'connected' ? (
                    <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={`text-xs font-bold ${provider.status === 'connected' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {provider.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border">
                  {provider.has_api_key ? (
                    <Key className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Key className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={`text-xs font-bold ${provider.has_api_key ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {provider.has_api_key ? 'API Key Set' : 'No API Key'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border">
                  {provider.has_webhook_secret ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={`text-xs font-bold ${provider.has_webhook_secret ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {provider.has_webhook_secret ? 'Webhook Set' : 'No Webhook'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-bold text-muted-foreground">
                    {provider.last_tested_at
                      ? new Date(provider.last_tested_at).toLocaleDateString()
                      : 'Not tested'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleTestConnection(provider.id)}
                disabled={isTesting === provider.id}
                className="w-full py-2 rounded-xl border border-border text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTesting === provider.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {isTesting === provider.id ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          ))}
          {providers.length === 0 && (
            <div className="lg:col-span-3 py-20 text-center text-muted-foreground italic border-2 border-dashed border-border rounded-3xl">
              No voice providers configured. Click "Add Provider" to get started.
            </div>
          )}
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
          <div className="relative bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-bold text-foreground">{editingItem.id ? 'Edit Provider' : 'Add Voice Provider'}</h3>
                <button type="button" onClick={() => setEditingItem(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Provider Name</label>
                    <input required value={editingItem.provider_name} onChange={e => setEditingItem(p => ({ ...p, provider_name: e.target.value }))}
                      placeholder="e.g. Vapi AI" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Provider Key</label>
                    <select value={editingItem.provider_key} onChange={e => setEditingItem(p => ({ ...p, provider_key: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all">
                       <option value="vapi">vapi</option>
                      <option value="retell">retell</option>
                      <option value="elevenlabs">elevenlabs</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">API Key</label>
                    <input type="password" value={editingItem.api_key} onChange={e => setEditingItem(p => ({ ...p, api_key: e.target.value }))}
                      placeholder={editingItem.id ? 'Leave blank to keep existing' : 'Enter API key'}
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Webhook Secret</label>
                    <input type="password" value={editingItem.webhook_secret} onChange={e => setEditingItem(p => ({ ...p, webhook_secret: e.target.value }))}
                      placeholder={editingItem.id ? 'Leave blank to keep existing' : 'Enter webhook secret'}
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={editingItem.is_active} onChange={e => setEditingItem(p => ({ ...p, is_active: e.target.checked }))} />
                    <div className="w-11 h-6 bg-muted border border-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:border-primary" />
                  </label>
                  <span className="text-sm font-semibold text-foreground">Provider is Active</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={editingItem.is_default} onChange={e => setEditingItem(p => ({ ...p, is_default: e.target.checked }))} />
                    <div className="w-11 h-6 bg-muted border border-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:border-amber-500" />
                  </label>
                  <span className="text-sm font-semibold text-foreground">Set as <span className="text-amber-500">Default</span> Provider</span>
                </div>
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 rounded-xl bg-primary hover:brightness-110 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
