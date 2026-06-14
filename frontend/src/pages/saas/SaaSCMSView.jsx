import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {Plus, Edit3, Trash2, Globe, FileText, Briefcase, BookOpen, X, CheckCircle, AlertTriangle, Home, Save, RefreshCw, Eye, PlugZap, ToggleLeft, ToggleRight, ChevronDown, ChevronUp} from 'lucide-react';
import centralApi from '../../services/centralApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';

// ─── Landing Page Settings Panel ─────────────────────────────────────
function LandingPageEditor() {
    const [form, setForm] = useState({
        landing_badge_text: '',
        landing_hero_title: '',
        landing_hero_subtitle: '',
        landing_cta_primary: '',
        landing_cta_secondary: '',
        landing_trial_tagline: '',
        landing_hero_image_url: '',
        landing_social_proof_label: '',
        landing_social_proof_brands: '',
        landing_feature1_title: '',
        landing_feature1_subtitle: '',
        landing_feature1_bullets: '',
        landing_feature1_image_url: '',
        landing_feature2_title: '',
        landing_feature2_subtitle: '',
        landing_feature2_bullets: '',
        landing_feature2_image_url: '',
        landing_bento_heading: '',
        landing_bento_subheading: '',
        landing_bento_items: '',
        landing_app_image_url: '',
        landing_cta_section_title: '',
        landing_cta_section_body: '',
        landing_cta_section_button: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        centralApi.get('saas/settings').then(res => {
            setForm(prev => ({ ...prev, ...(res.data || {}) }));
            setIsLoading(false);
        }).catch(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await centralApi.post('saas/settings', form);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            alert('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const field = (label, key, help = '', multiline = false) => (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
            {multiline ? (
                <textarea
                    value={form[key] || ''}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm min-h-[90px] font-mono shadow-sm"
                    placeholder={help}
                />
            ) : (
                <input
                    type="text"
                    value={form[key] || ''}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm shadow-sm"
                    placeholder={help}
                />
            )}
        </div>
    );

    if (isLoading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading landing page settings...</div>;

    return (
        <div className="space-y-10 p-6">
            {/* Hero */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    Hero Section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {field('Badge Text (top pill)', 'landing_badge_text', 'e.g. Now serving restaurants in 30+ cities')}
                    {field('Primary CTA Button', 'landing_cta_primary', 'e.g. Start Free Trial')}
                    {field('Secondary CTA Button', 'landing_cta_secondary', 'e.g. Explore Features')}
                    {field('Tagline below buttons', 'landing_trial_tagline', 'e.g. No credit card required • 14-day free trial')}
                </div>
                {field('Hero Title', 'landing_hero_title', 'e.g. The Intelligent Guest Retention Platform')}
                {field('Hero Subtitle', 'landing_hero_subtitle', 'One line that sells your product...', true)}
                {field('Hero Preview Image URL', 'landing_hero_image_url', 'Paste a screenshot/image URL to show in the hero mockup box')}
            </div>

            {/* Social Proof */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Social Proof Strip
                </h3>
                {field('Label Text', 'landing_social_proof_label', 'e.g. Trusted by scaling hospitality brands')}
                {field('Brand Names (comma separated)', 'landing_social_proof_brands', 'e.g. The Grill House, Bistro Uno, Saveur, Urban Plates, Coast')}
            </div>

            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                    Feature Section 1 (Table Management)
                </h3>
                {field('Feature Title', 'landing_feature1_title', 'e.g. Effortless Reservations')}
                {field('Feature Description', 'landing_feature1_subtitle', 'Short paragraph...', true)}
                {field('Bullet Points (one per line)', 'landing_feature1_bullets', 'Online booking widgets\nSmart table management\nWaitlist & SMS alerts', true)}
                {field('Feature Image URL', 'landing_feature1_image_url', 'Optional image to replace the mock UI')}
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    Feature Section 2 (Booking Widget)
                </h3>
                {field('Feature Title', 'landing_feature2_title', 'e.g. Smart Guest Intelligence')}
                {field('Feature Description', 'landing_feature2_subtitle', 'Short paragraph...', true)}
                {field('Bullet Points (one per line)', 'landing_feature2_bullets', 'Guest preference tracking\nAutomated follow-ups\nLoyalty & repeat booking', true)}
                {field('Feature Image URL', 'landing_feature2_image_url', 'Optional image to replace the mock UI')}
            </div>

            {/* Bento Grid */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                    Features Grid Section
                </h3>
                {field('Section Heading', 'landing_bento_heading', 'e.g. Everything you need to grow')}
                {field('Section Subheading', 'landing_bento_subheading', 'e.g. Built for restaurant operators, not IT teams.')}
                {field('Feature tiles (one per line: "Title | description")', 'landing_bento_items', 'Smart Reservations | Accept bookings 24/7\nTable Management | Visual floor plan control\nGuest Profiles | Know your regulars\nMarketing Tools | Email & SMS campaigns', true)}
                {field('Mobile App Preview Image URL', 'landing_app_image_url', 'Paste image URL for the mobile app section mockup')}
            </div>

            {/* Bottom CTA */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                    Final CTA Section
                </h3>
                {field('CTA Heading', 'landing_cta_section_title', 'e.g. Ready to grow your restaurant?')}
                {field('CTA Body Text', 'landing_cta_section_body', 'e.g. Join hundreds of restaurants using Sectros. Setup in 5 minutes.', true)}
                {field('CTA Button Text', 'landing_cta_section_button', 'e.g. Start your 14-day free trial')}
            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${saved ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'}`}
                >
                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Landing Page'}
                </button>
            </div>
        </div>
    );
}

// ─── Integrations Manager Panel ──────────────────────────────────────
const DEFAULT_INTEGRATIONS = [
    {
        id: 'facebook',
        name: 'Facebook',
        category: 'Social Media',
        enabled: true,
        badge: 'Official Partner',
        description: 'Sync your business page, accept reservations directly from Facebook, and automate customer messaging.',
        logo_url: '',
        color: '#1877F2',
        features: ['Facebook Page Sync', 'Messenger Chatbot', 'Booking Button on Page', 'Review Aggregation'],
    },
    {
        id: 'instagram',
        name: 'Instagram',
        category: 'Social Media',
        enabled: true,
        badge: 'Popular',
        description: 'Link your Instagram profile to accept bookings via DMs, display your menu, and showcase your brand.',
        logo_url: '',
        color: '#E1306C',
        features: ['Instagram DM Booking', 'Story Booking Link', 'Profile Bio Link', 'Auto-Reply Messages'],
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        category: 'Messaging',
        enabled: true,
        badge: 'Most Used',
        description: 'Send automated booking confirmations, reminders, and updates to guests directly via WhatsApp.',
        logo_url: '',
        color: '#25D366',
        features: ['WhatsApp Confirmations', 'Automated Reminders', 'Two-Way Messaging', 'Business API Integration'],
    },
    {
        id: 'gmail',
        name: 'Gmail',
        category: 'Email',
        enabled: true,
        badge: 'Email',
        description: 'Connect your Gmail to send branded email confirmations, manage guest communications, and sync your inbox.',
        logo_url: '',
        color: '#EA4335',
        features: ['Branded Email Templates', 'Two-Way Email Sync', 'Auto-Reply Flows', 'Guest Email Threads'],
    },
];

const BRAND_COLORS = { facebook: '#1877F2', instagram: '#E1306C', whatsapp: '#25D366', gmail: '#EA4335' };
const BRAND_BG = { facebook: 'bg-blue-500/10 border-blue-500/30 text-blue-400', instagram: 'bg-pink-500/10 border-pink-500/30 text-pink-400', whatsapp: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', gmail: 'bg-red-500/10 border-red-500/30 text-red-400' };

const PlatformLogo = ({ id, className }) => {
    const logos = {
        facebook: <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
        instagram: <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
        whatsapp: <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
        gmail: <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>,
    };
    return logos[id] || <Globe className={className} />;
};

function IntegrationsEditor() {
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
                    // Merge saved data onto defaults so we never lose a platform
                    setIntegrations(DEFAULT_INTEGRATIONS.map(def => {
                        const saved = parsed.find(s => s.id === def.id);
                        return saved ? { ...def, ...saved } : def;
                    }));
                } catch (_) {}
            }
        }).catch(() => {}).finally(() => setIsLoading(false));
    }, []);

    const update = (id, field, value) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const addFeature = (id) => {
        const text = (newFeatureMap[id] || '').trim();
        if (!text) return;
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, features: [...(i.features || []), text] } : i));
        setNewFeatureMap(prev => ({ ...prev, [id]: '' }));
    };

    const removeFeature = (id, idx) => {
        setIntegrations(prev => prev.map(i => i.id === id ? { ...i, features: i.features.filter((_, fi) => fi !== idx) } : i));
    };

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

    if (isLoading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading integration settings...</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Info Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
                <PlugZap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-foreground mb-1">Manage Platform Integrations</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">Enable or disable each platform, customise descriptions, badges, feature lists and logo URLs. Changes are reflected instantly on the public <strong>/integrations</strong> page.</p>
                </div>
            </div>

            {/* Integration cards */}
            {integrations.map(intg => {
                const isExpanded = expandedId === intg.id;
                const colorClass = BRAND_BG[intg.id] || 'bg-muted border-border text-muted-foreground';
                return (
                    <div key={intg.id} className={`rounded-2xl border bg-card shadow-sm transition-all duration-300 overflow-hidden ${intg.enabled ? 'border-border' : 'border-border/40 opacity-60'}`}>
                        {/* Card Header */}
                        <div className="flex items-center gap-4 p-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass.split(' ').slice(0, 2).join(' ')} shrink-0`}>
                                <PlatformLogo id={intg.id} className={`w-6 h-6 ${colorClass.split(' ')[2]}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-black text-foreground">{intg.name}</h3>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${colorClass}`}>{intg.category}</span>
                                    {intg.badge && <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">{intg.badge}</span>}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 truncate">{intg.description}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                {/* Toggle */}
                                <button
                                    onClick={() => update(intg.id, 'enabled', !intg.enabled)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                                        intg.enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    {intg.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                    {intg.enabled ? 'Enabled' : 'Disabled'}
                                </button>
                                {/* Expand */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : intg.id)}
                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                                >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Expandable Edit Form */}
                        {isExpanded && (
                            <div className="border-t border-border bg-muted/20 p-5 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Display Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Name</label>
                                        <input
                                            type="text"
                                            value={intg.name}
                                            onChange={e => update(intg.id, 'name', e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    {/* Badge */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Badge Label</label>
                                        <input
                                            type="text"
                                            value={intg.badge || ''}
                                            onChange={e => update(intg.id, 'badge', e.target.value)}
                                            placeholder="e.g. Official Partner, Popular, New"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    {/* Category */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                                        <input
                                            type="text"
                                            value={intg.category || ''}
                                            onChange={e => update(intg.id, 'category', e.target.value)}
                                            placeholder="e.g. Social Media, Messaging, Email"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    {/* Brand Hex Color */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Brand Colour (hex)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={intg.color || '#6366f1'}
                                                onChange={e => update(intg.id, 'color', e.target.value)}
                                                className="w-12 h-10 rounded-lg border border-border bg-background cursor-pointer p-1"
                                            />
                                            <input
                                                type="text"
                                                value={intg.color || ''}
                                                onChange={e => update(intg.id, 'color', e.target.value)}
                                                className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-mono focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    {/* Logo URL */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom Logo Image URL <span className="text-muted-foreground/50 normal-case font-medium">(overrides built-in SVG)</span></label>
                                        <input
                                            type="text"
                                            value={intg.logo_url || ''}
                                            onChange={e => update(intg.id, 'logo_url', e.target.value)}
                                            placeholder="https://example.com/facebook-logo.png"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                                        />
                                        {intg.logo_url && (
                                            <div className="mt-2 w-12 h-12 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden">
                                                <img src={intg.logo_url} alt="logo preview" className="w-8 h-8 object-contain" onError={e => e.target.style.display='none'} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={intg.description || ''}
                                        onChange={e => update(intg.id, 'description', e.target.value)}
                                        rows={3}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                    />
                                </div>

                                {/* Features list */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Feature Bullet Points</label>
                                    <div className="space-y-2">
                                        {(intg.features || []).map((feat, fi) => (
                                            <div key={fi} className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-2.5">
                                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <input
                                                    type="text"
                                                    value={feat}
                                                    onChange={e => {
                                                        const updated = [...intg.features];
                                                        updated[fi] = e.target.value;
                                                        update(intg.id, 'features', updated);
                                                    }}
                                                    className="flex-1 bg-transparent text-foreground text-sm focus:outline-none"
                                                />
                                                <button onClick={() => removeFeature(intg.id, fi)} className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {/* Add new feature */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add a feature bullet..."
                                                value={newFeatureMap[intg.id] || ''}
                                                onChange={e => setNewFeatureMap(prev => ({ ...prev, [intg.id]: e.target.value }))}
                                                onKeyDown={e => e.key === 'Enter' && addFeature(intg.id)}
                                                className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary"
                                            />
                                            <button
                                                onClick={() => addFeature(intg.id)}
                                                className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-all active:scale-95"
                                            >
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

            {/* Save button */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                        saved ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                    }`}
                >
                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Integrations'}
                </button>
            </div>
        </div>
    );
}

// Theme Store Grid Component removed to SaaSThemeAdminView.jsx

// ─── Main CMS View ─────────────────────────────────────────────────────
export default function SaaSCMSView() {
    const [activeTab, setActiveTab] = useState('landing');
    const [data, setData] = useState({ blogs: [], stories: [], docs: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [previewTheme, setPreviewTheme] = useState(null);
    const [previewThemeContent, setPreviewThemeContent] = useState(null);

    const processPreviewContent = (html) => {
        if (!html) return '';
        let processed = html;
        processed = processed.replace(/{{restaurant_name}}/g, 'Sectros Prime Bistro');
        processed = processed.replace(/{{establishment_year}}/g, '2024');
        processed = processed.replace(/\[\[BUSINESS_PHONE\]\]/g, '+1 (555) 999-8888');
        processed = processed.replace(/\[\[BUSINESS_ADDRESS\]\]/g, '456 Innovation Blvd, Tech City');
        
        const demoMenu = `
          <div class="space-y-12">
            <div>
              <h3 class="text-2xl font-black uppercase tracking-widest text-[#E8730C] border-b-2 border-[#E8730C] pb-2 mb-6">Chef's Table Selection</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="flex justify-between items-start gap-4">
                  <div class="flex-1">
                    <p class="font-bold text-lg text-inherit">Pan-Seared Scallops</p>
                    <p class="text-xs opacity-60 mt-1">U-10 scallops with cauliflower silk and caviar.</p>
                  </div>
                  <p class="font-black text-[#E8730C]">$32.00</p>
                </div>
                <div class="flex justify-between items-start gap-4">
                  <div class="flex-1">
                    <p class="font-bold text-lg text-inherit">Vintage Duck Confit</p>
                    <p class="text-xs opacity-60 mt-1">Heritage duck with orange reduction and star anise.</p>
                  </div>
                  <p class="font-black text-[#E8730C]">$48.00</p>
                </div>
              </div>
            </div>
          </div>
        `;

        const demoHours = `
          <table class="w-full text-sm opacity-60 font-medium">
            <tr className="border-b border-border"><td className="py-2 font-bold uppercase">Weekdays</td><td className="py-2 text-right">10:00 AM - 11:00 PM</td></tr>
            <tr className="border-b border-border"><td className="py-2 font-bold uppercase">Weekends</td><td className="py-2 text-right">10:00 AM - 01:00 AM</td></tr>
          </table>
        `;

        processed = processed.replace(/\[\[DYNAMIC_MENU\]\]/g, demoMenu);
        processed = processed.replace(/\[\[OPENING_HOURS\]\]/g, demoHours);
        
        return processed;
    };

    useEffect(() => {
        if (activeTab !== 'landing') fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [blogsRes, storiesRes, docsRes, themesRes] = await Promise.all([
                centralApi.get('saas/cms/blogs'),
                centralApi.get('saas/cms/stories'),
                centralApi.get('saas/cms/docs'),
                centralApi.get('saas/cms/themes')
            ]);
            setData({ 
                blogs: blogsRes.data, 
                stories: storiesRes.data, 
                docs: docsRes.data,
                themes: themesRes.data
            });
        } catch (error) {
            console.error('Failed to load CMS data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            if (activeTab === 'stories' && item.metrics) {
                setFormData({ ...item, metrics: JSON.stringify(item.metrics, null, 2) });
            } else {
                setFormData(item);
            }
        } else {
            if (activeTab === 'blogs') {
                setFormData({ title: '', slug: '', excerpt: '', content: '', author: '', is_published: true });
            } else if (activeTab === 'stories') {
                setFormData({ client_name: '', slug: '', metrics: '{\n  "key": "value"\n}', content: '', is_published: true });
            } else if (activeTab === 'docs') {
                setFormData({ title: '', slug: '', category: 'Core Concepts', order_index: 0, content: '', is_published: true });
            } else if (activeTab === 'themes') {
                setFormData({ name: '', slug: '', category: 'General', price: 0, is_free: true, html_content: '', css_content: '', preview_image_url: '', is_active: true });
            }
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const submitData = { ...formData };
            if (activeTab === 'stories' && submitData.metrics) {
                try { submitData.metrics = JSON.parse(submitData.metrics); }
                catch (e) { alert('Invalid JSON in metrics'); return; }
            }
            if (editingItem) {
                await centralApi.put(`/saas/cms/${activeTab}/${editingItem.id}`, submitData);
            } else {
                await centralApi.post(`/saas/cms/${activeTab}`, submitData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Failed to save. Check unique slugs or missing fields.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await centralApi.delete(`/saas/cms/${activeTab}/${id}`);
            fetchData();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const confirmDelete = (id) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(id);
    };

    const handlePreview = async (theme) => {
        setPreviewTheme(theme);
        try {
            const res = await centralApi.get(`saas/cms/themes/${theme.id}`);
            setPreviewThemeContent(res.data);
        } catch (e) {
            alert("Failed to load theme preview content.");
        }
    };

    const tabs = [
        { id: 'landing', label: 'Landing Page', icon: Home },
        { id: 'integrations', label: 'Integrations', icon: PlugZap },
        { id: 'blogs', label: 'Sectros Insights', icon: FileText, count: data.blogs.length },
        { id: 'stories', label: 'Success Stories', icon: Briefcase, count: data.stories.length },
        { id: 'docs', label: 'Product Manuals', icon: BookOpen, count: data.docs.length },
    ];

    const currentData = data[activeTab] || [];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-card p-8 rounded-[2rem] border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">Content Management</h1>
                    <p className="text-muted-foreground max-w-2xl">Manage everything visible on your public website — from the landing page hero down to every blog post and guide.</p>
                </div>
                {activeTab !== 'landing' && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="relative z-10 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        New Entry
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2 p-1 bg-card rounded-2xl border border-border w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                            activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-card border border-border rounded-3xl overflow-x-auto shadow-2xl">
                {activeTab === 'landing' ? (
                    <LandingPageEditor />
                ) : activeTab === 'integrations' ? (
                    <IntegrationsEditor />
                ) : isLoading ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse font-mono text-sm uppercase tracking-widest">Loading CMS Pipeline...</div>
                ) : currentData.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <FileText className="w-16 h-16 text-muted-foreground/20 mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No {activeTab} defined yet</h3>
                        <p className="text-muted-foreground text-sm">Click "New Entry" to publish your first post.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-muted-foreground min-w-[800px]">
                        <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Entry Details</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {(Array.isArray(currentData) ? currentData : []).map(item => (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">
                                            {item.title || item.client_name || item.name}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">/{item.slug}</code>
                                            {item.category && <span className="text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full">{item.category}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {item.is_published ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Live
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Draft</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                             <button onClick={() => confirmDelete(item.id)} className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-20"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                                <div>
                                    <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">{editingItem ? 'Edit Content' : 'Create New Content'}</h2>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">Drafting for {activeTab}</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1">
                                <form id="cms-form" onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{activeTab === 'stories' ? 'Client Name' : activeTab === 'themes' ? 'Theme Name' : 'Primary Title'}</label>
                                            <input
                                                required type="text"
                                                value={formData.title || formData.client_name || formData.name || ''}
                                                onChange={e => setFormData({...formData, [activeTab === 'stories' ? 'client_name' : activeTab === 'themes' ? 'name' : 'title']: e.target.value})}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">URL Slug <AlertTriangle className="w-3 h-3 text-amber-500" /></label>
                                            <input
                                                required type="text"
                                                value={formData.slug || ''}
                                                onChange={e => setFormData({...formData, slug: e.target.value})}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {activeTab === 'docs' && (
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Group Category</label>
                                                <input required type="text" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary font-medium shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Index (Sort)</label>
                                                <input type="number" value={formData.order_index || 0} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary font-medium shadow-sm" />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'blogs' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Short Excerpt</label>
                                            <textarea value={formData.excerpt || ''} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary min-h-[80px]" />
                                        </div>
                                    )}

                                    {activeTab === 'stories' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">JSON Metrics</label>
                                            <textarea value={formData.metrics || ''} onChange={e => setFormData({...formData, metrics: e.target.value})} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary min-h-[120px] font-mono text-xs shadow-inner" />
                                        </div>
                                    )}

                                    {activeTab === 'themes' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Theme Price ($)</label>
                                                    <input type="number" value={formData.price || 0} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary font-medium shadow-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preview Image URL</label>
                                                    <input type="text" value={formData.preview_image_url || ''} onChange={e => setFormData({...formData, preview_image_url: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary font-medium shadow-sm" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                 <div className="flex items-center gap-3 bg-muted/50 border border-border p-4 rounded-xl">
                                                    <input type="checkbox" id="is_free" checked={formData.is_free} onChange={e => setFormData({...formData, is_free: e.target.checked})} className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-blue-500" />
                                                    <label htmlFor="is_free" className="text-sm font-bold text-foreground cursor-pointer select-none">Free Theme</label>
                                                </div>
                                                <div className="flex items-center gap-3 bg-muted/50 border border-border p-4 rounded-xl">
                                                    <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-blue-500" />
                                                    <label htmlFor="is_active" className="text-sm font-bold text-foreground cursor-pointer select-none">Active / Enabled</label>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-primary uppercase tracking-wider">HTML Content</label>
                                                <textarea value={formData.html_content || ''} onChange={e => setFormData({...formData, html_content: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500 min-h-[300px] font-mono text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-primary uppercase tracking-wider">CSS Overrides</label>
                                                <textarea value={formData.css_content || ''} onChange={e => setFormData({...formData, css_content: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-blue-500 min-h-[150px] font-mono text-xs" />
                                            </div>
                                        </>
                                    )}

                                    {activeTab !== 'themes' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Content (Markdown)</label>
                                            <textarea
                                                required
                                                value={formData.content || ''}
                                                onChange={e => setFormData({...formData, content: e.target.value})}
                                                className="w-full bg-background border border-border rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all min-h-[300px] font-mono text-sm leading-relaxed shadow-inner"
                                                placeholder="# Start writing markdown here..."
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 bg-muted/50 border border-border p-4 rounded-xl">
                                        <input
                                            type="checkbox" id="publish"
                                            checked={formData.is_published || formData.is_active}
                                            onChange={e => setFormData({...formData, [activeTab === 'themes' ? 'is_active' : 'is_published']: e.target.checked})}
                                            className="w-5 h-5 rounded border-border bg-muted text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="publish" className="text-sm font-bold text-foreground cursor-pointer select-none">
                                            {activeTab === 'themes' ? 'Active in Gallery' : 'Publish immediately (visible on public site)'}
                                        </label>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                                    Cancel
                                </button>
                                <button type="submit" form="cms-form" className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-primary/20">
                                    <CheckCircle className="w-5 h-5" />
                                    Save & Publish
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => handleDelete(itemToDelete)}
                title={`Delete ${activeTab === 'blogs' ? 'Blog' : activeTab === 'stories' ? 'Story' : activeTab === 'themes' ? 'Theme' : 'Doc'}?`}
                message={`This will permanently remove this ${activeTab === 'themes' ? 'theme' : 'content'} from your public website. This action cannot be undone.`}
                confirmText="Delete Permanently"
                type="danger"
            />

            {/* Theme Preview Modal */}
            <AnimatePresence>
                {previewTheme && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/90 backdrop-blur-sm" onClick={() => setPreviewTheme(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-background border border-border rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col relative z-20"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-card/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-foreground italic tracking-tight">{previewTheme.name}</h2>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{previewTheme.category || 'General Blueprint'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => {
                                            handleOpenModal(previewTheme);
                                            setPreviewTheme(null);
                                        }}
                                        className="px-6 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                    >
                                        <Edit3 className="w-4 h-4" /> Edit Code
                                    </button>
                                    <button onClick={() => setPreviewTheme(null)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex-1 bg-white relative">
                                {previewThemeContent ? (
                                    <iframe 
                                        title="Admin Theme Preview"
                                        className="w-full h-full border-0"
                                        srcDoc={`
                                            <!DOCTYPE html>
                                            <html>
                                                <head>
                                                    <meta charset="utf-8">
                                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                                    <link rel="preconnect" href="https://fonts.googleapis.com">
                                                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap" rel="stylesheet">
                                                    <script src="https://cdn.tailwindcss.com"></script>
                                                    <style>
                                                        body { font-family: 'Inter', sans-serif; }
                                                        ${previewThemeContent.css_content || ''}
                                                        ::-webkit-scrollbar { width: 8px; }
                                                        ::-webkit-scrollbar-track { background: transparent; }
                                                        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                                                    </style>
                                                </head>
                                                <body class="antialiased">
                                                    ${processPreviewContent(previewThemeContent.html_content)}
                                                </body>
                                            </html>
                                        `}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background text-muted-foreground gap-4">
                                        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Assembling Blueprint Data...</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
