import React, { useState, useEffect } from 'react';
import { Layout, Globe, Settings, Plus, LayoutGrid, Edit3, Trash2, ExternalLink, Activity, AlertCircle, Eye, ChevronRight, X, Sparkles, Box, Search, Save, Loader2, Phone, MapPin, Building2, Instagram, Facebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TemplateGallery from '../components/builder/TemplateGallery';
import DomainSetupView from './DomainSetupView';
import { exportToHtml, exportToCss } from '../utils/builderExport';
import { useBusinessConfig } from '../hooks/useBusinessConfig';

export default function WebsiteDashboardView() {
  const config = useBusinessConfig();
  const b = config.labels;
  const [activeTab, setActiveTab] = useState('templates');
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [siteStatus, setSiteStatus] = useState('draft');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [confirmTemplate, setConfirmTemplate] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'error'
  const navigate = useNavigate();

  // Branding Settings State
  const [branding, setBranding] = useState({
      business_name: '',
      business_phone: '',
      business_address: '',
      establishment_year: ''
  });
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('builder');
      setPages(response.data || []);
      const isAnyPublished = (response.data || []).some(p => p.is_published);
      setSiteStatus(isAnyPublished ? 'live' : 'draft');
    } catch (error) {
      console.error("Failed to fetch pages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranding = async () => {
      try {
          const res = await api.get('branding');
          setBranding(res.data);
      } catch (e) {
          console.error("Failed to fetch branding", e);
      }
  };

  useEffect(() => {
    fetchPages();
    fetchBranding();
  }, []);

  const handleUpdateBranding = async () => {
      setIsSavingBranding(true);
      try {
          await api.post('branding', branding);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 5000);
      } catch (e) {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus(null), 5000);
      } finally {
          setIsSavingBranding(false);
      }
  };

  const handleEditPage = (slug) => {
    navigate(`/builder/${slug}`);
  };

  const handleCreatePage = () => {
    const title = prompt("Enter page title (e.g. About Us):");
    if (!title) return;
    const slug = title.toLowerCase().replace(/\s+/g, '-', '').replace(/[^a-z0-9-]/g, '');
    navigate(`/builder/${slug}?title=${encodeURIComponent(title)}`);
  };

  const processPreviewContent = (html) => {
    if (!html) return '';
    return html.replace(/{{restaurant_name}}/g, branding.business_name || 'Business Name')
               .replace(/\[\[BUSINESS_PHONE\]\]/g, branding.business_phone || '+1 (555) 012-3456');
  };

  const getPublicUrl = (path = '') => {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const storedDomain = localStorage.getItem('tenant_domain');
      
      const isCentralOrLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.startsWith('sectrosweb');
      
      let tenantId = hostname.split('.')[0];
      
      if (isCentralOrLocal && storedDomain && storedDomain !== 'no-domain' && storedDomain !== 'localhost') {
          tenantId = storedDomain.split('.')[0];
      }

      if (branding.platform_site_domain && branding.platform_site_domain.trim() !== '') {
          const siteDomain = branding.platform_site_domain.trim().replace(/^https?:\/\//, '');
          return `${protocol}//${tenantId}.${siteDomain}${path}`;
      }

      if (storedDomain && storedDomain !== 'no-domain' && storedDomain !== 'localhost') {
          if (hostname === 'localhost' || hostname === '127.0.0.1') {
              return `http://${tenantId}.sectroslr.test${path}`;
          }
          return `${protocol}//${storedDomain}${path}`;
      }
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return `http://${tenantId}.sectroslr.test${path}`;
      }

      return `${protocol}//${hostname}${path}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8 pt-12 transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* === FIGMA STYLE DASHBOARD HEADER === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                <Layout className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">Design Suite</h1>
            </div>
            <p className="text-slate-500 font-medium text-lg ml-1">Architecting your digital legacy from the ground up.</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {saveStatus === 'saved' && (
              <div className="bg-emerald-500/10 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                Identity Synced Successfully
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="bg-red-500/10 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                Sync Failed
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.open(getPublicUrl('/'), '_blank')} 
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 active:scale-95"
              >
                <Eye size={16} /> Preview Site
              </button>
              <button 
                onClick={() => handleEditPage('home')}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95"
              >
                <Edit3 size={16} /> Launch Designer
              </button>
            </div>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: 'Network status', value: siteStatus === 'live' ? 'Online' : 'Staging', icon: Activity, color: siteStatus === 'live' ? 'text-emerald-400' : 'text-primary' },
             { label: 'Active Frames', value: pages.length, icon: Box, color: 'text-purple-400' },
             { label: 'Core Engine', value: 'V4.2.1-Stable', icon: Settings, color: 'text-amber-400' },
             { label: 'Gateway Host', value: window.location.hostname, icon: Globe, color: 'text-slate-500' },
           ].map((stat, i) => (
             <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl">
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className={`text-lg font-black uppercase tracking-tighter ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-5 h-5 ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity`} />
             </div>
           ))}
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200 w-fit shadow-inner backdrop-blur-sm">
           {[
             {id: 'templates', label: 'Blueprints', icon: LayoutGrid},
             {id: 'pages', label: 'Frames', icon: Layout},
             {id: 'brand', label: 'Identity', icon: Building2},
             {id: 'domain', label: 'Networking', icon: Globe},
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3 px-8 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                 activeTab === tab.id 
                  ? 'bg-white text-primary shadow-lg ring-1 ring-border border-none' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/5'
               }`}
             >
               <tab.icon size={15} />
               {tab.label}
             </button>
           ))}
        </div>

        {/* Dynamic Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'templates' && (
             <div className="space-y-12">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-12 overflow-hidden relative group shadow-2xl">
                   <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000 text-primary">
                      <Sparkles size={300} />
                   </div>
                   <div className="max-w-2xl relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                         <div className="w-8 h-1 bg-primary rounded-full" />
                         <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Foundation</span>
                      </div>
                      <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none mb-6 uppercase">Forge your Architecture</h2>
                      <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">Deploy high-fidelity design frames optimized for immediate business operations and premium brand presence.</p>
                      <button onClick={() => document.getElementById('template-grid')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-primary transition-all group/btn">
                         Browse BLUEPRINTS <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>

                <div id="template-grid">
                   <TemplateGallery 
                      onSelect={(template) => setConfirmTemplate(template)}
                      onPreview={async (template) => {
                        setPreviewTemplate(template);
                        try {
                          const res = await api.get(`website-themes/${template.id}`);
                          setPreviewContent(res.data);
                        } catch (e) {
                           // For fallbacks, content is handled in processPreviewContent
                        }
                      }}
                   />
                </div>
             </div>
           )}

           {activeTab === 'brand' && (
             <div className="max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] space-y-8 shadow-xl">
                      <div>
                         <h3 className="text-xl font-black italic tracking-tighter mb-2 uppercase text-slate-900">Brand Identity</h3>
                         <p className="text-slate-500 text-sm font-medium">These values automatically sync with all your active blueprints and frames.</p>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                               <Building2 size={12} /> {b.sidebar} Name
                            </label>
                            <input 
                              value={branding.business_name}
                              onChange={(e) => setBranding({...branding, business_name: e.target.value})}
                              className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 focus:border-primary transition-all outline-none font-bold italic text-slate-900" 
                              placeholder={`e.g. Noir ${b.sidebar}`}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                               <Phone size={12} /> Contact Number
                            </label>
                            <input 
                              value={branding.business_phone}
                              onChange={(e) => setBranding({...branding, business_phone: e.target.value})}
                              className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 focus:border-primary transition-all outline-none font-bold text-slate-900" 
                              placeholder="+1 (555) 000-0000"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                               <MapPin size={12} /> Physical Address
                            </label>
                            <textarea 
                              value={branding.business_address}
                              onChange={(e) => setBranding({...branding, business_address: e.target.value})}
                              className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 focus:border-primary transition-all outline-none font-medium h-24 text-slate-900" 
                              placeholder="123 Main St, NY"
                            />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                  <Instagram size={12} /> Instagram URL
                               </label>
                               <input 
                                 value={branding.social_instagram}
                                 onChange={(e) => setBranding({...branding, social_instagram: e.target.value})}
                                 className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 focus:border-primary transition-all outline-none text-xs font-bold text-slate-900" 
                                 placeholder="https://instagram.com/..."
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                  <Facebook size={12} /> Facebook URL
                               </label>
                               <input 
                                 value={branding.social_facebook}
                                 onChange={(e) => setBranding({...branding, social_facebook: e.target.value})}
                                 className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 focus:border-primary transition-all outline-none text-xs font-bold text-slate-900" 
                                 placeholder="https://facebook.com/..."
                               />
                            </div>
                         </div>

                         <button 
                            onClick={handleUpdateBranding}
                            disabled={isSavingBranding}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95"
                         >
                            {isSavingBranding ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                            Sync Identity
                         </button>
                      </div>
                   </div>

                    <div className="flex flex-col gap-6">
                        <div className="bg-primary border border-primary/20 p-8 rounded-[2.5rem] text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                             <Sparkles size={160} />
                          </div>
                          <div className="relative z-10">
                             <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-primary-foreground">Direct Booking Link</h4>
                             <p className="text-primary-foreground/80 text-sm font-medium leading-relaxed mb-8 opacity-80">Share this conversion-optimized link directly on Instagram, Facebook, or your email signatures to capture reservations instantly.</p>
                             
                             <div className="bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 p-2 rounded-2xl flex items-center gap-2 mb-4">
                                <div className="flex-1 px-4 py-3 font-mono text-[10px] truncate text-primary-foreground/80">
                                   {getPublicUrl('/book')}
                                </div>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(getPublicUrl('/book'));
                                  }}
                                  className="px-6 py-3 bg-primary-foreground text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-foreground/90 transition-all shadow-lg active:scale-95"
                                >
                                   Copy Link
                                </button>
                             </div>
                             <div className="flex items-center gap-2 text-primary-foreground/60 text-[9px] font-black uppercase tracking-widest px-2">
                                <Activity size={12} className="text-emerald-400" /> Engine Link is Live
                             </div>
                          </div>
                       </div>

                       <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] flex-1 shadow-2xl">
                          <h4 className="text-slate-900 font-black italic uppercase tracking-tighter text-lg mb-4">Identity Tokens</h4>
                          <div className="space-y-3 font-mono text-[10px]">
                             <div className="flex justify-between p-2 bg-slate-100/50 rounded-lg"><span className="text-slate-500">Name</span><span className="text-primary">{"{{restaurant_name}}"}</span></div>
                             <div className="flex justify-between p-2 bg-slate-100/50 rounded-lg"><span className="text-slate-500">Phone</span><span className="text-primary">{"[[BUSINESS_PHONE]]"}</span></div>
                             <div className="flex justify-between p-2 bg-slate-100/50 rounded-lg"><span className="text-slate-500">Address</span><span className="text-primary">{"[[BUSINESS_ADDRESS]]"}</span></div>
                             <div className="flex justify-between p-2 bg-slate-100/50 rounded-lg"><span className="text-slate-500">Instagram</span><span className="text-primary">{"{{social_instagram}}"}</span></div>
                             <div className="flex justify-between p-2 bg-slate-100/50 rounded-lg"><span className="text-slate-500">Facebook</span><span className="text-primary">{"{{social_facebook}}"}</span></div>
                          </div>
                       </div>
                    </div>
                </div>
             </div>
           )}            {activeTab === 'pages' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                  onClick={handleCreatePage}
                  className="aspect-[4/3] bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all shadow-xl"
                >
                   <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg text-slate-500">
                      <Plus className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 text-center">New Frame</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Start from Blank Canvas</p>
                   </div>
                </div>

                {pages.map(page => (
                  <div key={page.id} className="aspect-[4/3] bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between group hover:border-primary/20 transition-all shadow-xl">
                      <div className="flex justify-between items-start">
                         <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                             {page.slug.substring(0,2).toUpperCase()}
                         </div>
                         <div className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase border ${page.is_published ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                             {page.is_published ? 'Production' : 'Draft'}
                         </div>
                      </div>
                      
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 italic truncate tracking-tighter mb-1">{page.title}</h3>
                         <p className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">secure_gateway:/{page.slug}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                         <button onClick={() => handleEditPage(page.slug)} className="flex-1 py-2.5 bg-slate-100/50 hover:bg-primary hover:text-primary-foreground rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-slate-500 border border-slate-200">Edit Frame</button>
                         <button onClick={() => window.open(getPublicUrl(`/${page.slug}`), '_blank')} className="p-2.5 bg-slate-100/50 hover:bg-slate-100 rounded-xl transition-all text-slate-500 border border-slate-200">
                            <ExternalLink size={14} />
                         </button>
                      </div>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'domain' && <DomainSetupView />}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 p-2 rounded-[2.5rem] w-full max-w-6xl h-[90vh] shadow-2xl relative flex flex-col overflow-hidden transition-all">
            <header className="flex items-center justify-between p-8 shrink-0">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                     <Layout className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic text-slate-900 tracking-tighter">{previewTemplate.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Blueprint Inspection</p>
                  </div>
               </div>
               <button 
                onClick={() => { setPreviewTemplate(null); setPreviewContent(null); }}
                className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-all border border-slate-200"
              >
                <X size={24} />
              </button>
            </header>

            <div className="flex-1 rounded-2xl overflow-hidden bg-slate-100 mx-4 mb-24 border border-slate-200 shadow-inner">
              {previewContent ? (
                <iframe 
                  title="Preview"
                  className="w-full h-full bg-white border-0"
                  srcDoc={`
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Outfit:wght@400;700;900&family=Raleway:wght@400;700;900&display=swap" rel="stylesheet">
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                          body { font-family: '${previewContent?.theme_json?.fontFamily || 'Inter'}', sans-serif; }
                          ${previewContent?.sections_json ? exportToCss(previewContent.theme_json || {}) : (previewContent?.css_content || '')}
                        </style>
                      </head>
                      <body>
                        ${previewContent?.sections_json ? 
                          exportToHtml(previewContent.sections_json, previewContent.theme_json || {}, branding) : 
                          processPreviewContent(previewContent?.html_content || '')
                        }
                      </body>
                    </html>
                  `}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 gap-4">
                   <Loader2 className="animate-spin" />
                   <p className="text-[10px] uppercase font-black tracking-widest">Streaming Blueprint...</p>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-10 left-12 right-12 flex justify-between items-center pointer-events-none">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 pointer-events-auto shadow-2xl">
                   <p className="text-2xl font-black text-slate-900 italic mb-1 uppercase tracking-tighter">{previewTemplate.name}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{previewTemplate.category}</p>
                </div>
                <button 
                  onClick={() => { navigate(`/builder/home?template=${previewTemplate.id}`); }}
                  className="bg-primary hover:bg-blue-700 text-white px-10 py-5 rounded-3xl text-[12px] font-black uppercase tracking-widest transition-all shadow-2xl pointer-events-auto active:scale-95"
                >
                  Confirm & Build
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Selection Modal */}
      {confirmTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative border border-slate-200 p-10 text-center animate-in zoom-in-95">
             <div className="w-20 h-20 bg-blue-50 border border-blue-100 text-primary rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-sm">
                <LayoutGrid className="w-10 h-10" />
             </div>
             <h3 className="text-3xl font-black italic text-slate-900 tracking-tighter mb-4 uppercase">Initialize Frame?</h3>
             <p className="text-slate-500 font-medium mb-10 leading-relaxed">This will overwrite your current draft with the <strong className="text-slate-900">{confirmTemplate.name}</strong> blueprint. This action is permanent.</p>
             
             <div className="flex gap-4">
                <button onClick={() => setConfirmTemplate(null)} className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border border-slate-200">Abort</button>
                <button 
                   onClick={() => navigate(`/builder/home?template=${confirmTemplate.id}`)}
                   className="flex-1 py-4 bg-primary hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md shadow-blue-600/10"
                >Confirm</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
