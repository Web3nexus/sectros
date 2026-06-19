import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {Settings, Save, Globe, Shield, Mail, Database, Loader2, Bot, Layout, FileText, CreditCard, CheckCircle, CircleX as XCircle, MessageSquare, Copy, ExternalLink, Briefcase, PenSquare, Trash2, Timer, Eye, EyeOff} from 'lucide-react';
import axios from 'axios';
import api from '../../services/centralApi';
import StatusModal from '../../components/common/StatusModal';
import { useWebsiteTheme } from '../../context/WebsiteThemeContext';
import CMSContentManager from './CMSContentManager';

export default function SaaSSettingsView() {
  const { updateTheme } = useWebsiteTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    platform_name: '',
    central_domain: '',
    platform_site_domain: '',
    require_2fa: false,
    disable_public_signups: false,
    mail_mailer: 'resend',
    mail_host: '',
    mail_port: '',
    mail_username: '',
    mail_password: '',
    mail_encryption: 'tls',
    from_address: '',
    openai_api_key: '',
    claude_api_key: '',
    gemini_api_key: '',
    ai_provider: 'openai',
    global_ai_enabled: true,
    default_system_prompt: '',
    landing_hero_title: '',
    landing_hero_subtitle: '',
    terms_of_service: '',
    privacy_policy: '',
    social_verify_token: '',
    meta_app_secret: '',
    facebook_client_id: '',
    facebook_client_secret: '',
    test_recipient: '',
    stripe_enabled: false,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    paystack_enabled: false,
    paystack_public_key: '',
    paystack_secret_key: '',
    flutterwave_enabled: false,
    flutterwave_public_key: '',
    flutterwave_secret_key: '',
    flutterwave_encryption_key: '',
    dodo_enabled: false,
    dodo_publishable_key: '',
    dodo_secret_key: '',
    dodo_webhook_secret: '',
    default_currency: 'USD',
    platform_logo_url: '',
    platform_favicon_url: '',
    email_logo_url: '',
    turnstile_site_key: '',
    turnstile_secret_key: '',
    sales_email: '',
    trial_days: 14,
    require_card_for_trial: false,
    website_theme: 'classic-ai',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const secretKeys = ['social_verify_token', 'mail_password', 'openai_api_key', 'claude_api_key', 'gemini_api_key', 'meta_app_secret', 'facebook_client_secret',
    'stripe_secret_key', 'stripe_webhook_secret', 'paystack_secret_key', 'flutterwave_secret_key',
    'flutterwave_encryption_key', 'dodo_secret_key', 'dodo_webhook_secret', 'turnstile_secret_key',
    'namesilo_api_key'];

  const displayValue = (key, val) => {
    if (!secretKeys.includes(key)) return val;
    if (!val) return '';
    return showSecrets ? val : '••••••••';
  };

  const showModal = (title, message, type = 'success') => {
    setModal({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('saas/settings');
        setSettings(prev => ({ ...prev, ...(response.data || {}) }));
      } catch (error) {
        console.error("Failed to fetch SaaS settings", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('saas/settings', settings);
      updateTheme(settings.website_theme);
      showModal("Success", "All system configurations have been saved successfully.", "success");
    } catch (error) {
      console.error("Failed to save settings", error);
      showModal("Save Error", error.response?.data?.message || "There was a problem saving your changes. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin" /> Loading system config...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure global application parameters and defaults.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'branding', label: 'Branding', icon: Briefcase },
            { id: 'security', label: 'Security & Auth', icon: Shield },
            { id: 'trial', label: 'Trial & Subscriptions', icon: Timer },
            { id: 'smtp', label: 'Email (SMTP)', icon: Mail },
            { id: 'ai', label: 'AI Engine', icon: Bot },
             { id: 'social', label: 'Social Webhooks', icon: MessageSquare },
            { id: 'legal', label: 'Legal & Privacy', icon: FileText },
            { id: 'external_links', label: 'Social & Community', icon: ExternalLink },
            { id: 'database', label: 'Database Routing', icon: Database },
            { id: 'domains', label: 'Domains', icon: Globe },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'website_theme', label: 'Website Theme', icon: Briefcase },
            { id: 'cms', label: 'Content CMS', icon: PenSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-[0.97] group border ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary shadow-sm border-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground border-transparent'
              }`}
            >
              <tab.icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-foreground mb-4">General Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Platform Name</label>
                    <input 
                      type="text" 
                      value={settings.platform_name} 
                      onChange={e => setSettings({...settings, platform_name: e.target.value})}
                      className="w-full max-w-md bg-background border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2 font-semibold">Central Domain Name</label>
                    <input 
                      type="text" 
                      value={settings.central_domain} 
                      onChange={e => setSettings({...settings, central_domain: e.target.value})}
                      className="w-full max-w-md bg-background border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                    />
                    <p className="text-xs text-muted-foreground mt-2 font-medium">SaaS Dashboard domain — tenant logins run on <span className="font-mono text-muted-foreground/60">&lt;id&gt;.{settings.central_domain || 'central-domain'}</span></p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2 font-semibold">
                      Platform Site Domain <span className="ml-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Public Websites</span>
                    </label>
                    <input 
                      type="text" 
                      value={settings.platform_site_domain || ''} 
                      onChange={e => setSettings({...settings, platform_site_domain: e.target.value})}
                      placeholder="e.g. sectros.com"
                      className="w-full max-w-md bg-primary text-primary-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none font-mono" 
                    />
                    <p className="text-xs text-blue-400 mt-2">Restaurant websites will be served at <span className="font-mono">&lt;id&gt;.{settings.platform_site_domain || 'your-site-domain.com'}</span></p>
                    {!settings.platform_site_domain && (
                      <p className="text-[10px] text-muted-foreground mt-1 italic mb-4">💡 For local dev: leave blank — tenant sites will use the Central Domain instead.</p>
                    )}

                    <div className="mt-6 p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Globe className="w-5 h-5 text-primary" />
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-foreground uppercase tracking-tight">DNS Infrastructure Guide</h4>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Connect your Public Site Network</p>
                         </div>
                      </div>

                      <div className="space-y-4 pt-2">
                         <p className="text-xs text-slate-400 leading-relaxed">
                            To serve restaurant websites on <span className="text-blue-400 font-bold">*.{settings.platform_site_domain || 'your-site-domain.com'}</span>, you must configure a 
                            <span className="text-foreground italic mx-1">Wildcard DNS Record</span> at your provider.
                         </p>

                         <div className="overflow-hidden rounded-2xl border border-blue-500/20 bg-[#0f172a]">
                            <table className="w-full text-[10px] text-left">
                               <thead className="bg-blue-500/10 text-blue-400 font-black uppercase tracking-widest border-b border-blue-500/10">
                                  <tr>
                                     <th className="px-4 py-3">Type</th>
                                     <th className="px-4 py-3">Hostname</th>
                                     <th className="px-4 py-3">Value</th>
                                  </tr>
                               </thead>
                               <tbody className="text-slate-300 font-mono">
                                  <tr>
                                     <td className="px-4 py-3 border-b border-blue-500/5">A</td>
                                     <td className="px-4 py-3 border-b border-blue-500/5">*</td>
                                     <td className="px-4 py-3 border-b border-blue-500/5">51.21.32.161</td>
                                  </tr>
                               </tbody>
                            </table>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-2">
                               <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                               <p className="text-[9px] text-emerald-400/80 leading-normal">
                                  <span className="font-bold text-emerald-400 block mb-0.5">SSL Ready</span>
                                  The server is already configured to secure these domains.
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-2">
                               <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                               <p className="text-[9px] text-amber-400/80 leading-normal">
                                  <span className="font-bold text-amber-400 block mb-0.5">Proxy Note</span>
                                  Disable Cloudflare Proxy (Orange Cloud) for wildcard records.
                               </p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'branding' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">Platform Branding</h3>
                  <p className="text-sm text-muted-foreground">Upload your platform logo and favicon to reflect across the entire OS.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-muted-foreground font-semibold">Platform Logo</label>
                    <div className="bg-background border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-colors hover:border-primary/50">
                      {settings.platform_logo_url ? (
                        <div className="relative group">
                          <img src={settings.platform_logo_url} alt="Platform Logo" className="h-16 w-auto object-contain bg-white border border-border p-2 rounded-lg" />
                          <button 
                            onClick={() => setSettings({ ...settings, platform_logo_url: '' })}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                          <Layout className="w-8 h-8" />
                        </div>
                      )}
                      <div className="text-center">
                        <label className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-bold transition-all block mb-2 shadow-md shadow-primary/20">
                          {settings.platform_logo_url ? 'Replace Logo' : 'Upload Logo'}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', 'logo');
                              try {
                                const token = localStorage.getItem('admin_token');
                                const res = await axios.post('/central-api/saas/settings/upload-branding', formData, {
                                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
                                });
                                setSettings({ ...settings, platform_logo_url: res.data.url });
                                showModal("Logo Uploaded", "Your platform logo has been updated.", "success");
                              } catch (err) {
                                showModal("Upload Failed", "Failed to upload logo.", "error");
                              }
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">SVG, PNG or JPG (Max 2MB)</p>
                      </div>
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-muted-foreground font-semibold">Browser Favicon</label>
                    <div className="bg-muted/50 border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-colors hover:border-primary/50 shadow-inner">
                      {settings.platform_favicon_url ? (
                        <div className="relative group">
                          <img src={settings.platform_favicon_url} alt="Favicon" className="w-12 h-12 object-contain bg-background p-2 rounded-lg border border-border" />
                          <button 
                            onClick={() => setSettings({ ...settings, platform_favicon_url: '' })}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-muted-foreground border border-border">
                          <Globe className="w-6 h-6" />
                        </div>
                      )}
                      <div className="text-center">
                        <label className="cursor-pointer bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all block mb-2 shadow-md shadow-primary/20">
                          {settings.platform_favicon_url ? 'Replace Favicon' : 'Upload Favicon'}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*,.ico"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', 'favicon');
                              try {
                                const token = localStorage.getItem('admin_token');
                                const res = await axios.post('/central-api/saas/settings/upload-branding', formData, {
                                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
                                });
                                setSettings({ ...settings, platform_favicon_url: res.data.url });
                                showModal("Favicon Uploaded", "Your browser favicon has been updated.", "success");
                              } catch (err) {
                                showModal("Upload Failed", "Failed to upload favicon.", "error");
                              }
                            }}
                          />
                        </label>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">ICO, SVG or PNG (32x32 recommended)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 flex gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground mb-1 uppercase tracking-tight">Branding Tip</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      Changes to the logo and platform name will reflect across the landing page, 
                      transactional emails, and all dashboard headers. Use a transparent PNG or SVG for the best visual experience.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-foreground mb-4">Security Policies</h3>
                 
                 <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={settings.require_2fa} 
                              onChange={e => setSettings({...settings, require_2fa: e.target.checked})}
                              className="sr-only" 
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors border ${settings.require_2fa ? 'bg-primary border-primary' : 'bg-muted border-border'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${settings.require_2fa ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-foreground block">Require 2FA for Super Admins</span>
                            <span className="text-xs text-muted-foreground">Enforce multi-factor auth on /securegate</span>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group mt-4">
                        <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={settings.disable_public_signups} 
                              onChange={e => setSettings({...settings, disable_public_signups: e.target.checked})}
                              className="sr-only" 
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors border ${settings.disable_public_signups ? 'bg-primary border-primary' : 'bg-muted border-border'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${settings.disable_public_signups ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-foreground block">Disable Public Signups</span>
                            <span className="text-xs text-muted-foreground">Restricts tenant creation to API/Invite only.</span>
                        </div>
                    </label>
                 </div>

                 {/* Cloudflare Turnstile */}
                 <div className="mt-8 pt-6 border-t border-border">
                   <div className="flex items-center gap-3 mb-1">
                     <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                       <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                     </div>
                     <h4 className="text-sm font-bold text-foreground">Cloudflare Turnstile (CAPTCHA)</h4>
                   </div>
                   <p className="text-xs text-muted-foreground mb-5 ml-10">Used on the public signup page to block bots. Get your keys from the <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Cloudflare Dashboard</a>.</p>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                     <div>
                       <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Site Key (Public)</label>
                       <input
                         type="text"
                         value={settings.turnstile_site_key || ''}
                         onChange={e => setSettings({...settings, turnstile_site_key: e.target.value})}
                         placeholder="0x4AAA..."
                         className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none font-mono"
                       />
                       <p className="text-[10px] text-muted-foreground mt-1">Used in the frontend signup widget.</p>
                     </div>
                     <div>
                       <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Secret Key (Server)</label>
                       <input
                         type="password"
                         value={settings.turnstile_secret_key || ''}
                         onChange={e => setSettings({...settings, turnstile_secret_key: e.target.value})}
                         placeholder="0x4AAA..."
                         className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none font-mono"
                       />
                       <p className="text-[10px] text-muted-foreground mt-1">Used server-side to verify tokens.</p>
                     </div>
                   </div>
                 </div>
              </div>
            )}

            {activeTab === 'trial' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Trial & Subscriptions</h3>
                <p className="text-sm text-muted-foreground mb-6">Configure free trial settings and subscription behavior for new tenants.</p>

                <div className="space-y-6">
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2 font-semibold">Trial Duration (Days)</label>
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={settings.trial_days}
                        onChange={e => setSettings({...settings, trial_days: e.target.value === '' ? 0 : parseInt(e.target.value) || 0})}
                        className="w-full max-w-xs bg-background border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-2 font-medium">Number of days for the free trial. Set to 0 to disable trial period.</p>
                    </div>
                  </div>

                  <div className="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={settings.require_card_for_trial}
                          onChange={e => setSettings({...settings, require_card_for_trial: e.target.checked})}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors border ${settings.require_card_for_trial ? 'bg-primary border-primary' : 'bg-muted border-border'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${settings.require_card_for_trial ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground block">Require Credit Card for Trial Signup</span>
                        <span className="text-xs text-muted-foreground">When enabled, users must enter their credit card details during registration. The \"No credit card required\" text will be hidden on the landing page and registration form.</span>
                      </div>
                    </label>
                  </div>

                  <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                    <Timer className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground mb-1">Trial Email Reminders</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        The system will automatically send trial reminder emails based on these settings. Three emails are sent during the trial: a welcome when the trial starts, a midpoint reminder, and a final-day prompt to subscribe. You can customize these email templates in the Email Templates section.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'smtp' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-foreground mb-4">System Email Delivery</h3>
                 <p className="text-sm text-muted-foreground mb-6">Configure the primary driver for SaaS welcome emails and password resets.</p>
                 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2 font-semibold">Mail Mailer</label>
                        <select 
                          value={settings.mail_mailer} 
                          onChange={e => setSettings({...settings, mail_mailer: e.target.value})}
                          className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                        >
                            <option value="resend">Resend</option>
                            <option value="mailgun">Mailgun</option>
                            <option value="smtp">SMTP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2 font-semibold">From Address</label>
                        <input 
                          type="email" 
                          value={settings.from_address} 
                          onChange={e => setSettings({...settings, from_address: e.target.value})}
                          className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                        />
                      </div>

                      {settings.mail_mailer === 'smtp' && (
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-muted rounded-2xl border border-border mt-2">
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">SMTP Host</label>
                              <input 
                                type="text" 
                                value={settings.mail_host} 
                                onChange={e => setSettings({...settings, mail_host: e.target.value})}
                                placeholder="smtp.mailtrap.io"
                                className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Port</label>
                              <input 
                                type="text" 
                                value={settings.mail_port} 
                                onChange={e => setSettings({...settings, mail_port: e.target.value})}
                                placeholder="2525"
                                className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                              />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Username</label>
                                <input 
                                  type="text" 
                                  value={settings.mail_username} 
                                  onChange={e => setSettings({...settings, mail_username: e.target.value})}
                                  className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Password</label>
                                <input 
                                  type="password" 
                                  value={settings.mail_password} 
                                  onChange={e => setSettings({...settings, mail_password: e.target.value})}
                                  className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Encryption</label>
                                <select 
                                  value={settings.mail_encryption} 
                                  onChange={e => setSettings({...settings, mail_encryption: e.target.value})}
                                  className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="null">None</option>
                                    <option value="tls">TLS</option>
                                    <option value="ssl">SSL</option>
                                </select>
                            </div>
                        </div>
                      )}
                  </div>
                  
                  <div className="pt-6 border-t border-border/50 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-end gap-4">
                        <div className="flex-1 max-w-sm">
                            <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Test Recipient Email</label>
                            <input 
                              type="email" 
                              value={settings.test_recipient} 
                              onChange={e => setSettings({...settings, test_recipient: e.target.value})}
                              placeholder="your-email@example.com"
                              className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                            />
                        </div>
                        <button 
                            onClick={async () => {
                                if(!settings.test_recipient) return showModal("Missing Recipient", "Please enter a test recipient email.", "error");
                                try {
                                    const res = await api.post('saas/settings/test-email', { email: settings.test_recipient });
                                    showModal("Email Sent", res.data.message, "success");
                                } catch (err) {
                                    showModal("Email Failed", err.response?.data?.message || "Failed to send test email.", "error");
                                }
                            }}
                            className="bg-primary/10 hover:bg-primary/20 text-primary px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-primary/20 h-[42px] active:scale-95"
                        >
                            <Mail className="w-4 h-4" />
                            Send Test Email
                        </button>
                      </div>
                      
                       <div className="flex items-center justify-between">
                         <p className="text-[10px] text-muted-foreground italic">Save configuration before testing if you changed SMTP settings.</p>
                         <Link 
                             to="/securegate/email-templates" 
                             className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                         >
                             Manage Email Templates
                         </Link>
                       </div>
                   </div>

                   <div className="pt-6 border-t border-border/50 space-y-4">
                     <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Email Logo</h3>
                     <p className="text-xs text-muted-foreground">Upload a logo specifically for email headers. Leave empty to use the platform logo.</p>
                     <div className="bg-background border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-colors hover:border-primary/50 max-w-sm">
                       {settings.email_logo_url ? (
                         <div className="relative group">
                           <img src={settings.email_logo_url} alt="Email Logo" className="h-14 w-auto object-contain bg-white border border-border p-2 rounded-lg" />
                           <button
                             onClick={() => setSettings({ ...settings, email_logo_url: '' })}
                             className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                           >
                             <Trash2 className="w-3 h-3" />
                           </button>
                         </div>
                       ) : (
                         <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                           <Mail className="w-7 h-7" />
                         </div>
                       )}
                       <div className="text-center">
                         <label className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold transition-all block mb-2 shadow-md shadow-primary/20">
                           {settings.email_logo_url ? 'Replace Email Logo' : 'Upload Email Logo'}
                           <input
                             type="file"
                             className="hidden"
                             accept="image/*"
                             onChange={async (e) => {
                               const file = e.target.files[0];
                               if (!file) return;
                               const formData = new FormData();
                               formData.append('file', file);
                               formData.append('type', 'email_logo');
                               try {
                                 const token = localStorage.getItem('admin_token');
                                 const res = await axios.post('/central-api/saas/settings/upload-branding', formData, {
                                   headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
                                 });
                                 setSettings({ ...settings, email_logo_url: res.data.url });
                                 showModal("Email Logo Uploaded", "Your email logo has been updated.", "success");
                               } catch (err) {
                                 showModal("Upload Failed", "Failed to upload email logo.", "error");
                               }
                             }}
                           />
                         </label>
                         <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">PNG or SVG (Max 2MB)</p>
                       </div>
                     </div>
                   </div>

                  <div className="pt-6 border-t border-border/50">
                      {/* Removed misplaced AI verify button from here */}
                  </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-foreground mb-4">Global AI Engine Settings</h3>
                 <p className="text-sm text-muted-foreground mb-6">Configure the master OpenAI credentials and default behavior across all tenants.</p>
                 
                 <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={settings.global_ai_enabled} 
                              onChange={e => setSettings({...settings, global_ai_enabled: e.target.checked})}
                              className="sr-only" 
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors border ${settings.global_ai_enabled ? 'bg-primary border-primary' : 'bg-muted border-border'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${settings.global_ai_enabled ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-foreground block">Enable AI Engine Globally</span>
                            <span className="text-xs text-muted-foreground">If disabled, no AI models will be invoked for any tenant.</span>
                        </div>
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-muted-foreground mb-2 font-semibold">Primary AI Provider</label>
                            <select 
                                value={settings.ai_provider} 
                                onChange={e => setSettings({...settings, ai_provider: e.target.value})}
                                className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                            >
                                <option value="openai">OpenAI (GPT-4o)</option>
                                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                                <option value="gemini">Google Gemini (Gemini 1.5 Flash)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-muted-foreground mb-2 font-semibold">Master OpenAI API Key</label>
                            <input 
                              type="password" 
                              value={displayValue('openai_api_key', settings.openai_api_key)} 
                              onChange={e => setSettings({...settings, openai_api_key: e.target.value})}
                              placeholder="sk-..."
                              className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 transition-all shadow-sm" 
                            />
                        </div>
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-muted-foreground mb-2 font-semibold">Anthropic Claude API Key</label>
                            <input 
                              type="password" 
                              value={displayValue('claude_api_key', settings.claude_api_key)} 
                              onChange={e => setSettings({...settings, claude_api_key: e.target.value})}
                              placeholder="sk-ant-..."
                              className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 transition-all shadow-sm" 
                            />
                        </div>
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-muted-foreground mb-2 font-semibold">Google Gemini API Key</label>
                            <input 
                              type="password" 
                              value={displayValue('gemini_api_key', settings.gemini_api_key)} 
                              onChange={e => setSettings({...settings, gemini_api_key: e.target.value})}
                              placeholder="AIzaSy..."
                              className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/30 transition-all shadow-sm" 
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-2 font-semibold">Default System Prompt</label>
                        <textarea 
                          value={settings.default_system_prompt} 
                          onChange={e => setSettings({...settings, default_system_prompt: e.target.value})}
                          rows={6}
                          className="w-full bg-background border border-border text-foreground rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                        />
                        <p className="text-xs text-muted-foreground mt-2 font-medium">This is the base intent-analysis prompt that the restaurant owners will build upon.</p>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                        <button 
                          onClick={async () => {
                              try {
                                  const res = await api.post('saas/settings/test-ai', { 
                                      openai_api_key: settings.openai_api_key,
                                      claude_api_key: settings.claude_api_key,
                                      gemini_api_key: settings.gemini_api_key,
                                      ai_provider: settings.ai_provider
                                  });
                                  showModal("AI Connected", res.data.message, "success");
                              } catch (err) {
                                  showModal("Connection Failed", err.response?.data?.message || "AI Connection Failed.", "error");
                              }
                          }}
                          className="bg-primary/10 hover:bg-primary/20 text-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-primary/20 shadow-sm"
                        >
                            <Bot className="w-4 h-4" />
                            Verify {settings.ai_provider === 'anthropic' || settings.ai_provider === 'claude' ? 'Claude' : (settings.ai_provider === 'gemini' ? 'Gemini' : 'OpenAI')} Connection
                        </button>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-foreground mb-4">Landing Page CMS</h3>
                 <p className="text-sm text-muted-foreground mb-6">Manage the high-level marketing content for the public root page.</p>
                 
                 <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Hero Main Title</label>
                        <input 
                          type="text" 
                          value={settings.landing_hero_title} 
                          onChange={e => setSettings({...settings, landing_hero_title: e.target.value})}
                          placeholder="e.g. Next-Generation Restaurant OS"
                          className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Hero Sub-subtitle</label>
                        <textarea 
                          value={settings.landing_hero_subtitle} 
                          onChange={e => setSettings({...settings, landing_hero_subtitle: e.target.value})}
                          rows={3}
                          placeholder="Describe your platform's value proposition..."
                          className="w-full bg-card border border-border text-foreground rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-medium text-foreground">Central Social Webhooks & Meta OAuth</h3>
                 </div>
                 <p className="text-sm text-muted-foreground mb-6 font-medium">Configure the master OAuth and Webhook parameters for the entire platform.</p>
                 
                 <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
                    {/* Webhook Connection */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">1. Webhook Handshake</h4>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Master Webhook URL</label>
                                <button 
                                    onClick={() => {
                                        const url = `${window.location.origin}/central-api/social/webhook`;
                                        navigator.clipboard.writeText(url);
                                        showModal("URL Copied", "The master webhook URL has been copied.", "info");
                                    }}
                                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 transition-colors"
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy URL
                                </button>
                            </div>
                            <div className="bg-muted border border-border rounded-xl py-3 px-4 font-mono text-xs text-primary break-all shadow-inner">
                                {window.location.origin}/central-api/social/webhook
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2 font-medium italic">Paste this into the <b>Callback URL</b> field in your Meta App settings.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Verify Token</label>
                            <div className="relative">
                                <input 
                                    type={showSecrets ? "text" : "password"}
                                    value={displayValue('social_verify_token', settings.social_verify_token)}
                                    onChange={e => setSettings({...settings, social_verify_token: e.target.value})}
                                    placeholder="sectros_secret_token"
                                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground font-mono text-sm focus:ring-2 focus:ring-primary outline-none pr-10"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowSecrets(!showSecrets)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Same value as <b>Verify Token</b> in Meta App configuration.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Meta App Secret (HMAC)</label>
                            <input 
                                type="password"
                                value={settings.meta_app_secret}
                                onChange={e => setSettings({...settings, meta_app_secret: e.target.value})}
                                placeholder="Required for security..."
                                className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                            <p className="text-[10px] text-muted-foreground mt-2 font-medium italic">Found in <b>App Settings &gt; Basic</b>. Used to secure incoming webhook data.</p>
                        </div>
                    </div>

                    {/* OAuth Connection */}
                    <div className="space-y-4 pt-6 border-t border-border">
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">2. Meta OAuth (Onboarding)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">App ID (Client ID)</label>
                                <input 
                                    type="text"
                                    value={settings.facebook_client_id}
                                    onChange={e => setSettings({...settings, facebook_client_id: e.target.value})}
                                    placeholder="Meta App ID"
                                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">App Secret (Client Secret)</label>
                                <input 
                                    type="password"
                                    value={settings.facebook_client_secret}
                                    onChange={e => setSettings({...settings, facebook_client_secret: e.target.value})}
                                    placeholder="Meta App Secret"
                                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 font-medium">Both found in <b>App Settings &gt; Basic</b>. Enables the "Connect with Meta" feature.</p>
                    </div>

                    <div className="pt-6 border-t border-border bg-primary/5 -mx-6 -mb-6 p-6 rounded-b-2xl">
                        <h4 className="text-[12px] font-black text-foreground uppercase tracking-widest mb-4">Meta Dashboard Checklist</h4>
                        <ul className="space-y-3">
                            {[
                                { t: "Valid OAuth Redirect URIs", d: "Add: https://{tenant_domain}/tenant-api/auth/facebook/callback" },
                                { t: "Webhook Subscriptions", d: "Subscribe to 'messages' (WhatsApp) and 'messaging_postbacks' (Messenger)." },
                                { t: "App Mode", d: "Switch from 'Development' to 'Live' once permissions are approved." }
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="h-5 w-5 rounded-md bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle size={14} />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-foreground uppercase tracking-tight">{item.t}</span>
                                        <span className="text-[10px] text-muted-foreground leading-normal">{item.d}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'legal' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-foreground mb-4">Legal Documents</h3>
                 <p className="text-sm text-muted-foreground mb-6">Manage user agreements, terms of service and privacy policies.</p>
                 
                 <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Terms of Service (Markdown/HTML)</label>
                        <textarea 
                          value={settings.terms_of_service} 
                          onChange={e => setSettings({...settings, terms_of_service: e.target.value})}
                          rows={12}
                          className="w-full bg-background border border-border font-mono text-xs text-foreground rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Privacy Policy (Markdown/HTML)</label>
                        <textarea 
                          value={settings.privacy_policy} 
                          onChange={e => setSettings({...settings, privacy_policy: e.target.value})}
                          rows={12}
                          className="w-full bg-background border border-border font-mono text-xs text-foreground rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                        />
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Database className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-medium text-foreground">Database Routing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Configure multi-tenant database routing and central domain settings.</p>
                </div>

                {/* Central Domain Configuration */}
                <div className="p-8 bg-muted border border-border rounded-[2rem] space-y-6 shadow-sm">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" /> Platform Domains Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Central Domain (System/Dashboard)</label>
                      <input
                        type="text"
                        value={settings.central_domain || ''}
                        onChange={e => setSettings({...settings, central_domain: e.target.value})}
                        placeholder="sectrosweb.test"
                        className="w-full bg-background border border-border text-foreground rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none font-mono"
                      />
                      <p className="text-[10px] text-slate-600 mt-1">SaaS Dashboard runs on &lt;tenant&gt;.central_domain.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Platform Site Domain (Public Sites)</label>
                      <input
                        type="text"
                        value={settings.platform_site_domain || ''}
                        onChange={e => setSettings({...settings, platform_site_domain: e.target.value})}
                        placeholder="sectros.com"
                        className="w-full bg-background border border-border text-foreground rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary outline-none font-mono transition-all shadow-sm"
                      />
                      <p className="text-[10px] text-primary mt-1">Tenant websites run on &lt;tenant&gt;.site_domain.</p>
                    </div>
                  </div>

                  {/* DNS Instructions Block */}
                  {settings.platform_site_domain && (
                    <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="flex gap-3">
                        <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                        <div>
                          <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">DNS Configuration Required</h5>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                            Because you have assigned <strong className="text-blue-300">{settings.platform_site_domain}</strong> as a custom platform site domain, you must configure a Wildcard A Record in your DNS provider (e.g., Cloudflare, GoDaddy) to ensure all tenant sites resolve to this server.
                          </p>
                          <div className="mt-3 bg-card rounded border border-border p-2 font-mono text-[10px] text-slate-300">
                            Type: <strong className="text-foreground">A</strong> &nbsp;|&nbsp; Name: <strong className="text-foreground">*.{settings.platform_site_domain}</strong> &nbsp;|&nbsp; Content: <strong className="text-foreground">YOUR_SERVER_IP</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-border">
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 mt-4">Tenant Subdomain Pattern</label>
                    <input
                      type="text"
                      value={settings.tenant_subdomain_pattern || ''}
                      onChange={e => setSettings({...settings, tenant_subdomain_pattern: e.target.value})}
                      placeholder="{tenant}.sectrosweb.test"
                      className="w-full max-w-md bg-muted border border-border text-foreground/50 rounded-xl py-2.5 px-4 text-sm font-mono"
                      disabled
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">This pattern is automatically derived from your Central and Site Domains.</p>
                  </div>
                </div>

                {/* DB Connection */}
                <div className="p-8 bg-muted border border-border rounded-[2rem] space-y-6 shadow-sm">
                  <h4 className="text-sm font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
                    <Database className="w-5 h-5 text-primary" /> Central Database Connection
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">DB Host</label>
                      <input
                        type="text"
                        value={settings.db_host || ''}
                        onChange={e => setSettings({...settings, db_host: e.target.value})}
                        placeholder="127.0.0.1"
                        className="w-full bg-background border border-border text-foreground rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/50 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">DB Port</label>
                      <input
                        type="text"
                        value={settings.db_port || ''}
                        onChange={e => setSettings({...settings, db_port: e.target.value})}
                        placeholder="3306"
                        className="w-full bg-background border border-border text-foreground rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/50 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Database Name</label>
                      <input
                        type="text"
                        value={settings.db_database || ''}
                        onChange={e => setSettings({...settings, db_database: e.target.value})}
                        placeholder="Sectros"
                        className="w-full bg-background border border-border text-foreground rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/50 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">DB Username</label>
                      <input
                        type="text"
                        value={settings.db_username || ''}
                        onChange={e => setSettings({...settings, db_username: e.target.value})}
                        placeholder="root"
                        className="w-full bg-background border border-border text-foreground rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-green-500/50 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">DB Password</label>
                      <input
                        type="password"
                        value={settings.db_password || ''}
                        onChange={e => setSettings({...settings, db_password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full bg-background border border-border text-foreground rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary outline-none font-mono transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Tenancy Architecture Info Card */}
                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-foreground mb-2">Tenancy Architecture</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        This platform uses <span className="text-blue-400 font-semibold">single-database multi-tenancy</span>. Every tenant shares the same MySQL instance, with data isolated by <code className="text-xs bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded">tenant_id</code> on all tables. Routing happens via subdomain matching on every request.
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                          { label: 'Isolation Mode', value: 'Column (tenant_id)' },
                          { label: 'DB Driver', value: 'MySQL / MariaDB' },
                          { label: 'Routing', value: 'Subdomain → Tenant' },
                        ].map(item => (
                          <div key={item.label} className="bg-card/70 rounded-xl p-3">
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-xs text-foreground font-semibold">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'domains' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <Globe className="w-6 h-6 text-primary" />
                   <h3 className="text-lg font-medium text-foreground">Domain Registration (NameSilo)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Configure NameSilo API integration so admins can register domains directly for tenants. Domain purchases are charged to your NameSilo account balance.</p>

                <div className="space-y-6">
                  {/* NameSilo */}
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                          <Globe className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="text-foreground font-bold">NameSilo</h4>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Domain Registration / DNS Management</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.namesilo_enabled}
                          onChange={e => setSettings({...settings, namesilo_enabled: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    {settings.namesilo_enabled && (
                      <div className="space-y-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">API Key</label>
                          <input 
                            type="password" 
                            value={settings.namesilo_api_key || ''}
                            onChange={e => setSettings({...settings, namesilo_api_key: e.target.value})}
                            placeholder="Your NameSilo API key"
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">Find in your NameSilo account: Account → API Manager.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Sell Price (Annual)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={settings.namesilo_domain_price || 15}
                              onChange={e => setSettings({...settings, namesilo_domain_price: parseFloat(e.target.value) || 15})}
                              className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">What you charge tenants. Profit = Sell − Cost.</p>
                          </div>
                          <div>
                            <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Cost Price (Annual)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={settings.namesilo_cost_price || 11.05}
                              onChange={e => setSettings({...settings, namesilo_cost_price: parseFloat(e.target.value) || 11.05})}
                              className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">What NameSilo charges you per domain. Current margin: <strong className="text-emerald-500">{'$'}{((settings.namesilo_domain_price || 15) - (settings.namesilo_cost_price || 11.05)).toFixed(2)}</strong></p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Server IP</label>
                          <input 
                            type="text"
                            value={settings.server_ip || ''}
                            onChange={e => setSettings({...settings, server_ip: e.target.value})}
                            placeholder="Server IP address"
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none font-mono" 
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">Used for A record DNS configuration.</p>
                        </div>

                        <div className="border-t border-border pt-4">
                          <h5 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Default Registrant Contact</h5>
                          <p className="text-[10px] text-muted-foreground mb-4">Used as the WHOIS contact for all domains registered via NameSilo.</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">First Name</label>
                              <input type="text" value={settings.namesilo_registrant_first_name || 'Sectros'} onChange={e => setSettings({...settings, namesilo_registrant_first_name: e.target.value})} className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Last Name</label>
                              <input type="text" value={settings.namesilo_registrant_last_name || 'Admin'} onChange={e => setSettings({...settings, namesilo_registrant_last_name: e.target.value})} className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Email</label>
                              <input type="email" value={settings.namesilo_registrant_email || ''} onChange={e => setSettings({...settings, namesilo_registrant_email: e.target.value})} placeholder="admin@sectros.com" className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Address</label>
                              <input type="text" value={settings.namesilo_registrant_address || '123 Main St'} onChange={e => setSettings({...settings, namesilo_registrant_address: e.target.value})} className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">City</label>
                              <input type="text" value={settings.namesilo_registrant_city || 'New York'} onChange={e => setSettings({...settings, namesilo_registrant_city: e.target.value})} className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">State</label>
                              <input type="text" value={settings.namesilo_registrant_state || 'NY'} onChange={e => setSettings({...settings, namesilo_registrant_state: e.target.value})} className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">ZIP / Postal Code</label>
                              <input type="text" value={settings.namesilo_registrant_zip || '10001'} onChange={e => setSettings({...settings, namesilo_registrant_zip: e.target.value})} className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Country</label>
                              <input type="text" value={settings.namesilo_registrant_country || 'US'} onChange={e => setSettings({...settings, namesilo_registrant_country: e.target.value})} placeholder="US" className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Phone</label>
                              <input type="text" value={settings.namesilo_registrant_phone || ''} onChange={e => setSettings({...settings, namesilo_registrant_phone: e.target.value})} placeholder="+1.2125550100" className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                   <CreditCard className="w-6 h-6 text-blue-400" />
                   <h3 className="text-lg font-medium text-foreground">Payment Gateways</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Configure global payment integrations for tenant subscriptions and billing.</p>
                
                <div className="space-y-6">
                  {/* Stripe */}
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 flex items-center justify-center border border-[#635BFF]/20">
                          <CreditCard className="w-5 h-5 text-[#635BFF]" />
                        </div>
                        <div>
                          <h4 className="text-foreground font-bold">Stripe</h4>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Global Default</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.stripe_enabled}
                          onChange={e => setSettings({...settings, stripe_enabled: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    {settings.stripe_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Publishable Key</label>
                          <input 
                            type="text" 
                            value={settings.stripe_publishable_key}
                            onChange={e => setSettings({...settings, stripe_publishable_key: e.target.value})}
                            placeholder="pk_test_..."
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Secret Key</label>
                          <input 
                            type="password" 
                            value={settings.stripe_secret_key}
                            onChange={e => setSettings({...settings, stripe_secret_key: e.target.value})}
                            placeholder="sk_test_..."
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Webhook Secret</label>
                          <input 
                            type="password" 
                            value={settings.stripe_webhook_secret}
                            onChange={e => setSettings({...settings, stripe_webhook_secret: e.target.value})}
                            placeholder="whsec_..."
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Paystack */}
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#011B33]/10 flex items-center justify-center border border-[#011B33]/20">
                           <div className="w-5 h-5 bg-[#00C3DA] rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-foreground font-bold">Paystack</h4>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Africa / Nigeria / Ghana</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.paystack_enabled}
                          onChange={e => setSettings({...settings, paystack_enabled: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    {settings.paystack_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Public Key</label>
                          <input 
                            type="text" 
                            value={settings.paystack_public_key}
                            onChange={e => setSettings({...settings, paystack_public_key: e.target.value})}
                            placeholder="pk_test_..."
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Secret Key</label>
                          <input 
                            type="password" 
                            value={settings.paystack_secret_key}
                            onChange={e => setSettings({...settings, paystack_secret_key: e.target.value})}
                            placeholder="sk_test_..."
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flutterwave */}
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center border border-[#F5A623]/20">
                           <CreditCard className="w-5 h-5 text-[#F5A623]" />
                        </div>
                        <div>
                          <h4 className="text-foreground font-bold">Flutterwave</h4>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Multicurrency / Africa</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.flutterwave_enabled}
                          onChange={e => setSettings({...settings, flutterwave_enabled: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    {settings.flutterwave_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Public Key</label>
                          <input 
                            type="text" 
                            value={settings.flutterwave_public_key}
                            onChange={e => setSettings({...settings, flutterwave_public_key: e.target.value})}
                            placeholder="FLWPUBK_TEST-..."
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Secret Key</label>
                          <input 
                            type="password" 
                            value={settings.flutterwave_secret_key}
                            onChange={e => setSettings({...settings, flutterwave_secret_key: e.target.value})}
                            placeholder="FLWSECK_TEST-..."
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Encryption Key</label>
                          <input 
                            type="password" 
                            value={settings.flutterwave_encryption_key}
                            onChange={e => setSettings({...settings, flutterwave_encryption_key: e.target.value})}
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dodo Payments */}
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <CreditCard className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="text-foreground font-bold">Dodo Payments</h4>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Emerging Markets / Asia / Latin America</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings.dodo_enabled}
                          onChange={e => setSettings({...settings, dodo_enabled: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    {settings.dodo_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Publishable Key</label>
                          <input 
                            type="text" 
                            value={settings.dodo_publishable_key}
                            onChange={e => setSettings({...settings, dodo_publishable_key: e.target.value})}
                            placeholder="dodo_pub_..."
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Secret Key</label>
                          <input 
                            type="password" 
                            value={settings.dodo_secret_key}
                            onChange={e => setSettings({...settings, dodo_secret_key: e.target.value})}
                            placeholder="dodo_sec_..."
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Webhook Secret</label>
                          <input 
                            type="password" 
                            value={settings.dodo_webhook_secret}
                            onChange={e => setSettings({...settings, dodo_webhook_secret: e.target.value})}
                            placeholder="dodo_whsec_..."
                            className="w-full bg-background border border-border text-foreground rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'cms' && (
              <CMSContentManager settings={settings} onSettingsChange={setSettings} />
            )}

            {activeTab === 'website_theme' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Website Theme</h3>
                <p className="text-sm text-muted-foreground mb-6">Choose the visual theme for the public-facing website. Changes take effect immediately after saving.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Classic AI Theme */}
                  <label className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    settings.website_theme === 'classic-ai'
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
                  }`}>
                    <input
                      type="radio"
                      name="website_theme"
                      value="classic-ai"
                      checked={settings.website_theme === 'classic-ai'}
                      onChange={e => setSettings({...settings, website_theme: e.target.value})}
                      className="sr-only"
                    />
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        settings.website_theme === 'classic-ai' ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                        {settings.website_theme === 'classic-ai' && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Classic AI Theme</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The original dark-themed AI-first design with vibrant gradients, glassmorphism panels, and tech-forward aesthetic. Best for showcasing AI capabilities.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">Dark</span>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">Gradients</span>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">Glassmorphism</span>
                    </div>
                  </label>

                  {/* Modern Business OS Theme */}
                  <label className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    settings.website_theme === 'modern-business-os'
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
                  }`}>
                    <input
                      type="radio"
                      name="website_theme"
                      value="modern-business-os"
                      checked={settings.website_theme === 'modern-business-os'}
                      onChange={e => setSettings({...settings, website_theme: e.target.value})}
                      className="sr-only"
                    />
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
                        <Layout className="w-6 h-6 text-white" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        settings.website_theme === 'modern-business-os' ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                        {settings.website_theme === 'modern-business-os' && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Modern Business OS</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      A clean, product-led light theme built for conversions. White backgrounds, blue accents, centered navigation, and professional business-focused layouts.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">Light</span>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">Product-led</span>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">Conversion</span>
                    </div>
                  </label>
                </div>

                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                  <Briefcase className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground mb-1">Live Preview</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Save this setting to apply the theme across all public pages (home, pricing, features, solutions, about, blog, and contact). The dashboard and admin panel are not affected.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'external_links' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-medium text-foreground mb-4">Social & Community Links</h3>
                 <p className="text-sm text-muted-foreground mb-6">Manage the links that appear on your public website and community pages.</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp Channel URL</label>
                        <input 
                          type="text" 
                          value={settings.whatsapp_channel_url || ''} 
                          onChange={e => setSettings({...settings, whatsapp_channel_url: e.target.value})}
                          placeholder="https://whatsapp.com/channel/..."
                          className="w-full bg-card border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Community URL (Owners Group)</label>
                        <input 
                          type="text" 
                          value={settings.community_url || ''} 
                          onChange={e => setSettings({...settings, community_url: e.target.value})}
                          placeholder="https://community.sectros.com"
                          className="w-full bg-card border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Instagram Profile</label>
                        <input 
                          type="text" 
                          value={settings.instagram_url || ''} 
                          onChange={e => setSettings({...settings, instagram_url: e.target.value})}
                          placeholder="https://instagram.com/sectros"
                          className="w-full bg-card border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Twitter / X Profile</label>
                        <input 
                          type="text" 
                          value={settings.twitter_url || ''} 
                          onChange={e => setSettings({...settings, twitter_url: e.target.value})}
                          placeholder="https://twitter.com/sectros"
                          className="w-full bg-card border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Facebook Page</label>
                        <input 
                          type="text" 
                          value={settings.facebook_url || ''} 
                          onChange={e => setSettings({...settings, facebook_url: e.target.value})}
                          placeholder="https://facebook.com/sectros"
                          className="w-full bg-card border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">YouTube Channel</label>
                        <input 
                          type="text" 
                          value={settings.youtube_url || ''} 
                          onChange={e => setSettings({...settings, youtube_url: e.target.value})}
                          placeholder="https://youtube.com/@sectros"
                          className="w-full bg-card border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">TikTok Profile</label>
                        <input 
                          type="text" 
                          value={settings.tiktok_url || ''} 
                          onChange={e => setSettings({...settings, tiktok_url: e.target.value})}
                          placeholder="https://tiktok.com/@sectros"
                          className="w-full bg-card border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Contact Sales Email</label>
                        <input 
                          type="email" 
                          value={settings.sales_email || ''} 
                          onChange={e => setSettings({...settings, sales_email: e.target.value})}
                          placeholder="sales@sectros.com"
                          className="w-full bg-card border border-border text-foreground rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none" 
                        />
                    </div>
                 </div>
              </div>
            )}

            {activeTab !== 'cms' && (
              <div className="mt-8 pt-8 border-t border-border flex justify-between items-center">
                <button
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  {showSecrets ? 'Hide Secret Values' : 'Show Secret Values'}
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl shadow-primary/30 disabled:opacity-50 flex items-center gap-3 active:scale-95 group"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                    {isSaving ? 'Saving Configurations...' : 'Save All Settings'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      <StatusModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
