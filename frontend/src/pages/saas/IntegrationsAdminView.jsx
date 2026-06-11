/**
 * IntegrationsAdminView — standalone wrapper that renders the
 * IntegrationsEditor from SaaSCMSView in its own route so it is
 * directly accessible at /securegate/integrations.
 */
import React, { useState, useEffect } from 'react';
import { PlugZap, Save, RefreshCw, CheckCircle, X, Plus, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Globe } from 'lucide-react';
import centralApi from '../../services/centralApi';

// ─── Brand assets ──────────────────────────────────────────────────────
const BRAND_BG = {
    facebook:  'bg-blue-500/10 border-blue-500/30 text-blue-400',
    instagram: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
    whatsapp:  'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    gmail:     'bg-red-500/10 border-red-500/30 text-red-400',
};

const PlatformLogo = ({ id, className }) => {
    const logos = {
        facebook: (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
        ),
        instagram: (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
        ),
        whatsapp: (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
        ),
        gmail: (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
            </svg>
        ),
    };
    return logos[id] || <Globe className={className} />;
};

const DEFAULT_INTEGRATIONS = [
    { id: 'facebook', name: 'Facebook', category: 'Social Media', enabled: true, badge: 'Official Partner', description: 'Connect your Facebook Page to receive and reply to messages in the unified inbox. Requires Meta App Review for live messaging.', logo_url: '', color: '#1877F2', features: ['Facebook Page Connection', 'Messenger Messages in Inbox', 'AI Reply Suggestions', 'Manual Reply from Dashboard'] },
    { id: 'instagram', name: 'Instagram', category: 'Social Media', enabled: true, badge: 'Popular', description: 'Link your Instagram Business account to receive DMs in the unified inbox. Requires Meta App Review for messaging access.', logo_url: '', color: '#E1306C', features: ['Instagram Business Account Link', 'DM Messages in Inbox', 'Manual Reply from Dashboard', 'Requires Meta App Review'] },
    { id: 'whatsapp', name: 'WhatsApp', category: 'Messaging', enabled: true, badge: 'Most Used', description: 'Connect WhatsApp Business API to receive and respond to customer messages. Requires a WhatsApp Business Account and Meta App Review.', logo_url: '', color: '#25D366', features: ['WhatsApp Messages in Inbox', 'Manual Reply from Dashboard', 'AI Reply Suggestions', 'Requires Meta App Review'] },
    { id: 'gmail', name: 'Gmail', category: 'Email', enabled: true, badge: 'Email', description: 'Connect your Gmail to send branded email confirmations, manage guest communications, and sync your inbox.', logo_url: '', color: '#EA4335', features: ['Branded Email Templates', 'Two-Way Email Sync', 'Auto-Reply Flows', 'Guest Email Threads'] },
];

export default function IntegrationsAdminView() {
    const [integrations, setIntegrations] = useState(DEFAULT_INTEGRATIONS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [newFeatureMap, setNewFeatureMap] = useState({});

    useEffect(() => {
        centralApi.get('saas/settings').then(res => {
            const data = res.data;
            if (data?.integrations_config) {
                try {
                    const parsed = JSON.parse(data.integrations_config);
                    setIntegrations(DEFAULT_INTEGRATIONS.map(def => {
                        const saved = parsed.find(s => s.id === def.id);
                        return saved ? { ...def, ...saved } : def;
                    }));
                } catch (_) {}
            }
        }).catch(() => {}).finally(() => setIsLoading(false));
    }, []);

    const update = (id, field, value) =>
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

    const addFeature = (id) => {
        const text = (newFeatureMap[id] || '').trim();
        if (!text) return;
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, features: [...(i.features || []), text] } : i));
        setNewFeatureMap(prev => ({ ...prev, [id]: '' }));
    };

    const removeFeature = (id, idx) =>
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, features: i.features.filter((_, fi) => fi !== idx) } : i));

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await centralApi.post('saas/settings', { integrations_config: JSON.stringify(integrations) });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (_) {
            alert('Save failed. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="max-w-4xl mx-auto py-20 text-center text-muted-foreground animate-pulse">
            Loading integrations...
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-card p-8 rounded-[2rem] border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <PlugZap className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Integrations Manager</h1>
                    </div>
                    <p className="text-muted-foreground max-w-xl">
                        Enable, disable, and customise each platform integration. Changes are reflected live on the public <span className="text-primary font-semibold">/integrations</span> page.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`relative z-10 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
                        saved ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                    }`}
                >
                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {integrations.map(intg => {
                    const cc = BRAND_BG[intg.id] || 'bg-muted border-border text-muted-foreground';
                    const [bgPart, borderPart, textPart] = cc.split(' ');
                    return (
                        <div key={intg.id} className={`rounded-2xl border ${bgPart} ${borderPart} p-5 flex items-center gap-4 transition-all`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgPart} border ${borderPart}`}>
                                <PlatformLogo id={intg.id} className={`w-5 h-5 ${textPart}`} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground">{intg.name}</p>
                                <span className={`text-xs font-black ${intg.enabled ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                                    {intg.enabled ? '● Active' : '○ Inactive'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Integration Editor Cards */}
            <div className="space-y-4">
                {integrations.map(intg => {
                    const isExpanded = expandedId === intg.id;
                    const cc = BRAND_BG[intg.id] || 'bg-muted border-border text-muted-foreground';
                    const [bgPart, borderPart, textPart] = cc.split(' ');

                    return (
                        <div
                            key={intg.id}
                            className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300 ${
                                intg.enabled ? 'border-border' : 'border-border/40 opacity-60'
                            }`}
                        >
                            {/* Card Header Row */}
                            <div className="flex items-center gap-4 p-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${bgPart} ${borderPart} shadow-inner shrink-0`}>
                                    {intg.logo_url ? (
                                        <img src={intg.logo_url} alt={intg.name} className="w-8 h-8 object-contain" />
                                    ) : (
                                        <PlatformLogo id={intg.id} className={`w-7 h-7 ${textPart}`} />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-base font-black text-foreground">{intg.name}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${bgPart} ${borderPart} ${textPart}`}>
                                            {intg.category}
                                        </span>
                                        {intg.badge && (
                                            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                                                {intg.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{intg.description}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => update(intg.id, 'enabled', !intg.enabled)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                                            intg.enabled
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                                : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                                        }`}
                                    >
                                        {intg.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                        {intg.enabled ? 'Enabled' : 'Disabled'}
                                    </button>
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : intg.id)}
                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                                    >
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Expandable Edit Panel */}
                            {isExpanded && (
                                <div className="border-t border-border bg-muted/20 p-6 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Display Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Name</label>
                                            <input type="text" value={intg.name} onChange={e => update(intg.id, 'name', e.target.value)}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
                                        </div>
                                        {/* Badge */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Badge Label</label>
                                            <input type="text" value={intg.badge || ''} onChange={e => update(intg.id, 'badge', e.target.value)}
                                                placeholder="e.g. Official Partner, Popular, New"
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
                                        </div>
                                        {/* Category */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                                            <input type="text" value={intg.category || ''} onChange={e => update(intg.id, 'category', e.target.value)}
                                                placeholder="Social Media, Messaging, Email…"
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
                                        </div>
                                        {/* Brand Colour */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Brand Colour</label>
                                            <div className="flex gap-2">
                                                <input type="color" value={intg.color || '#6366f1'} onChange={e => update(intg.id, 'color', e.target.value)}
                                                    className="w-12 h-10 rounded-lg border border-border bg-background cursor-pointer p-1" />
                                                <input type="text" value={intg.color || ''} onChange={e => update(intg.id, 'color', e.target.value)}
                                                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-mono focus:outline-none focus:border-primary" />
                                            </div>
                                        </div>

                                        {/* Logo URL */}
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                Custom Logo Image URL <span className="normal-case font-medium opacity-50">(replaces built-in SVG icon)</span>
                                            </label>
                                            <div className="flex gap-3 items-center">
                                                <input type="text" value={intg.logo_url || ''} onChange={e => update(intg.id, 'logo_url', e.target.value)}
                                                    placeholder="https://cdn.example.com/logo.png"
                                                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-mono focus:outline-none focus:border-primary" />
                                                {intg.logo_url && (
                                                    <div className="w-12 h-12 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                                        <img src={intg.logo_url} alt="preview" className="w-8 h-8 object-contain"
                                                            onError={e => { e.target.style.display = 'none'; }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                                        <textarea value={intg.description || ''} onChange={e => update(intg.id, 'description', e.target.value)}
                                            rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary resize-none" />
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Feature Bullet Points</label>
                                        <div className="space-y-2">
                                            {(intg.features || []).map((feat, fi) => (
                                                <div key={fi} className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-2.5">
                                                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                                    <input type="text" value={feat}
                                                        onChange={e => {
                                                            const updated = [...intg.features];
                                                            updated[fi] = e.target.value;
                                                            update(intg.id, 'features', updated);
                                                        }}
                                                        className="flex-1 bg-transparent text-foreground text-sm focus:outline-none" />
                                                    <button onClick={() => removeFeature(intg.id, fi)}
                                                        className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="Add a feature bullet and press Enter…"
                                                    value={newFeatureMap[intg.id] || ''}
                                                    onChange={e => setNewFeatureMap(prev => ({ ...prev, [intg.id]: e.target.value }))}
                                                    onKeyDown={e => e.key === 'Enter' && addFeature(intg.id)}
                                                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary" />
                                                <button onClick={() => addFeature(intg.id)}
                                                    className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all active:scale-95">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom save */}
            <div className="flex justify-end pb-6">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                        saved ? 'bg-emerald-600 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                    }`}
                >
                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Integrations'}
                </button>
            </div>
        </div>
    );
}
