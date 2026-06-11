import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Globe, Eye, Smartphone, Monitor, Palette, Layers, 
  ChevronRight, ChevronDown, Check, Loader2, Image as ImageIcon, Plus, Trash2, 
  EyeOff, Globe as GlobeIcon
} from 'lucide-react';
import api from '../services/api';
import SectionRenderer from '../components/builder/SectionRenderer';
import { exportToHtml, exportToCss } from '../utils/builderExport';
import { FALLBACK_BLUEPRINTS } from '../components/builder/BlueprintData';
import { useBusinessConfig } from '../hooks/useBusinessConfig';

const DEFAULT_SECTIONS = [
  { id: 'nav-1', type: 'Navbar', content: { layout: 'tastenest-dark', logo: 'SECTROS', buttonText: 'Book Now', links: [] }, visible: true },
  { id: 'hero-1', type: 'Hero', content: { layout: 'tastenest-dark', title: 'CULINARY ARTISTRY', subtitle: 'Experience a symphony of flavors in a space designed for the senses.', buttonText: 'Reserve Now', imageUrl: 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5?auto=format&fit=crop&q=80' }, visible: true },
  { id: 'res-1', type: 'ReservationForm', content: { layout: 'tastenest-dark', title: 'Table Reservations', subtitle: 'Book your experience with us and we will prepare a special table.' }, visible: true },
  { id: 'serv-1', type: 'Services', content: { layout: 'tastenest-dark', title: 'Exceptional Services', subtitle: 'We go beyond dining to provide an unforgettable atmosphere.' }, visible: true },
  { id: 'feat-1', type: 'FeaturedCards', content: { layout: 'tastenest-dark', title: 'Our Specialties', subtitle: 'Hand-picked dishes that define our culinary philosophy.' }, visible: true },
  { id: 'abt-1', type: 'About', content: { layout: 'tastenest-light', title: 'Our Story', subtitle: 'A legacy of flavor and hospitality.', text: 'Diam sit amet nisl suscipit adipiscing bibendum est ultricies integer. Dictumst quisque sagittis purus sit amet. Viverra justo nec ultrices dui sapien.', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80' }, visible: true },
  { id: 'stats-1', type: 'Stats', content: {}, visible: true },
  { id: 'menu-1', type: 'Menu', content: { layout: 'tastenest-dark', title: 'Our Signature Menu', subtitle: 'A curated selection of seasonal delights.' }, visible: true },
  { id: 'gal-1', type: 'Gallery', content: { layout: 'tastenest-light', title: 'A Glimpse of the Experience' }, visible: true },
  { id: 'test-1', type: 'Testimonials', content: { layout: 'tastenest-dark', title: 'What Our Guests Say' }, visible: true },
  { id: 'cta-1', type: 'CTABanner', content: { layout: 'tastenest-dark', title: 'READY FOR AN UNFORGETTABLE DINING EXPERIENCE?' }, visible: true },
  { id: 'blog-1', type: 'Blog', content: { layout: 'tastenest-dark', title: 'Journal & Recipes' }, visible: true },
  { id: 'foot-1', type: 'Footer', content: { layout: 'tastenest-dark', title: 'SECTROS', subtitle: 'Mastering the art of hospitality.' }, visible: true },
];

const LAYOUT_OPTIONS = {
  Navbar: ['tastenest-dark', 'tastenest-light', 'coffee-house', 'salon-elegance', 'hotel-boutique'],
  Hero: ['tastenest-dark', 'tastenest-light', 'coffee-house', 'salon-elegance', 'hotel-boutique'],
  Services: ['tastenest-dark', 'tastenest-light', 'coffee-house', 'salon-elegance', 'hotel-boutique'],
  About: ['tastenest-light', 'coffee-house'],
  FeaturedCards: ['tastenest-dark', 'tastenest-light', 'coffee-house'],
  Menu: ['tastenest-dark', 'tastenest-light', 'coffee-house'],
  Gallery: ['tastenest-light', 'coffee-house', 'salon-elegance'],
  Testimonials: ['tastenest-dark', 'coffee-house', 'salon-elegance', 'hotel-boutique'],
  Blog: ['tastenest-dark', 'coffee-house'],
  Footer: ['tastenest-dark', 'tastenest-light', 'coffee-house', 'salon-elegance', 'hotel-boutique'],
  CTABanner: ['tastenest-dark', 'tastenest-light'],
  ReservationForm: ['tastenest-dark', 'tastenest-light', 'salon-elegance'],
};

const SECTION_TYPE_OPTIONS = [
  { type: 'Navbar', label: 'Navbar' },
  { type: 'Hero', label: 'Hero' },
  { type: 'ReservationForm', label: 'Reservation Form' },
  { type: 'Services', label: 'Services' },
  { type: 'FeaturedCards', label: 'Featured Cards' },
  { type: 'About', label: 'About' },
  { type: 'Stats', label: 'Stats' },
  { type: 'Menu', label: 'Menu' },
  { type: 'Gallery', label: 'Gallery' },
  { type: 'Testimonials', label: 'Testimonials' },
  { type: 'CTABanner', label: 'CTA Banner' },
  { type: 'Blog', label: 'Blog' },
  { type: 'Footer', label: 'Footer' },
];

const DEFAULT_THEME = {
  primaryColor: '#18A0FB',
  secondaryColor: '#000000',
  fontFamily: 'Inter',
  cookieConsentEnabled: false,
};

export default function RestrictedBuilderView() {
  const { slug = 'home' } = useParams();
  const [searchParams] = useSearchParams();
  const initialTitle = searchParams.get('title') || 'Untitled Page';
  const templateId = searchParams.get('template');
  const navigate = useNavigate();

  const config = useBusinessConfig();
  const b = config.labels;

  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  // Account Data for Binding
  const [accountData, setAccountData] = useState({
    branding: null,
    menus: [],
    navMenus: [],
    reviews: [],
    gallery: [],
    rooms: [],
    services: [],
    blogPosts: [],
    teamMembers: []
  });
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'theme'
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeDevice, setActiveDevice] = useState('Desktop');

  useEffect(() => {
    const id = Date.now() + Math.random().toString(36).slice(2,6);
    console.log(`[EFFECT ${id}] RUN slug=${slug} templateId=${templateId}`);

    const fetchData = async () => {
      try {
        const [brandingRes, menusRes, navMenusRes, reviewsRes, galleryRes, roomsRes, servicesRes, blogRes, teamRes] = await Promise.allSettled([
          api.get('branding'),
          api.get('menu'),
          api.get('navigation-menus'),
          api.get('reviews'),
          api.get('gallery'),
          api.get('rooms'),
          api.get('services'),
          api.get('blog-posts'),
          api.get('team-members')
        ]);
        setAccountData({
          branding: brandingRes.status === 'fulfilled' ? brandingRes.value.data : null,
          menus: menusRes.status === 'fulfilled' ? menusRes.value.data : [],
          navMenus: navMenusRes.status === 'fulfilled' ? navMenusRes.value.data : [],
          reviews: reviewsRes.status === 'fulfilled' ? reviewsRes.value.data : [],
          gallery: galleryRes.status === 'fulfilled' ? galleryRes.value.data : [],
          rooms: roomsRes.status === 'fulfilled' ? roomsRes.value.data : [],
          services: servicesRes.status === 'fulfilled' ? servicesRes.value.data : [],
          blogPosts: blogRes.status === 'fulfilled' ? blogRes.value.data : [],
          teamMembers: teamRes.status === 'fulfilled' ? teamRes.value.data : []
        });
      } catch (error) {
        console.error("Failed to fetch account data for binding:", error);
      }
    };
    fetchData();

    const loadContent = async () => {
      console.log(`[EF ${id}] loadContent START templateId=${templateId}`);
      if (templateId) {
        try {
          console.log(`[EF ${id}] calling website-themes/${templateId}`);
          const templateRes = await api.get(`website-themes/${templateId}`);
          console.log(`[EF ${id}] website-themes response:`, templateRes.data);
          if (templateRes.data && templateRes.data.sections_json) {
            console.log(`[EF ${id}] SETTING sections from website-themes`);
            setSections(templateRes.data.sections_json);
            setTheme(templateRes.data.theme_json || { primaryColor: '#000000', fontFamily: 'Inter' });
            return;
          }
          console.log(`[EF ${id}] sections_json missing, falling through`);
        } catch (e) {
          console.warn(`[EF ${id}] website-themes FAILED:`, e);
        }

        console.log(`[EF ${id}] checking FALLBACK_BLUEPRINTS for`, templateId);
        const blueprint = FALLBACK_BLUEPRINTS.find(b => b.id === templateId || b.id === `blueprint-${templateId}`);
        if (blueprint) {
          console.log(`[EF ${id}] using FALLBACK_BLUEPRINTS`);
          setSections(blueprint.sections);
          setTheme(blueprint.theme);
          return;
        }
        console.log(`[EF ${id}] no fallback match`);
      }

      console.log(`[EF ${id}] calling builder/load/${slug}`);
      try {
        const { data } = await api.get(`builder/load/${slug}`);
        console.log(`[EF ${id}] builder/load response:`, data);
        if (data.sections_json) {
          console.log(`[EF ${id}] SETTING sections from builder/load`);
          setSections(JSON.parse(data.sections_json));
          if (data.theme_json) {
            setTheme(JSON.parse(data.theme_json));
          }
        }
      } catch (e) {
        console.warn(`[EF ${id}] No saved page found`);
      }
      console.log(`[EF ${id}] loadContent END`);
    };
    loadContent();
  }, [slug, templateId]);

  const handleSave = async (silent = false) => {
    if (!silent) setIsSaving(true);
    try {
      const html_content = exportToHtml(sections, theme, accountData.branding);
      const css_content = exportToCss(theme);

      await api.post(`builder/save/${slug}`, {
        title: initialTitle,
        sections_json: JSON.stringify(sections),
        theme_json: JSON.stringify(theme),
        html_content,
        css_content,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await handleSave(true);
      await api.post(`builder/publish/${slug}`);
      setSaveStatus('published');
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsPublishing(false);
    }
  };

  const updateSectionContent = (sectionId, field, value) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, content: { ...s.content, [field]: value } } : s
    ));
  };

  const updateSectionLayout = (sectionId, layout) => {
    updateSectionContent(sectionId, 'layout', layout);
  };

  const toggleSectionVisibility = (sectionId) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    ));
  };

  const removeSection = (sectionId) => {
    if (sections.length <= 1) return;
    setSections(prev => prev.filter(s => s.id !== sectionId));
    if (selectedSectionId === sectionId) setSelectedSectionId(null);
  };

  const moveSection = (sectionId, direction) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === sectionId);
      if (idx < 0) return prev;
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const addSection = (sectionType) => {
    const id = `${sectionType.toLowerCase()}-${Date.now()}`;
    const newSection = { id, type: sectionType, content: { layout: 'tastenest-dark' }, visible: true };
    setSections(prev => [...prev, newSection]);
    setSelectedSectionId(id);
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  return (
    <div className="flex flex-col h-screen w-screen fixed inset-0 z-100 bg-background font-sans text-foreground overflow-hidden selection:bg-primary/30">
      
      {/* HEADER */}
      <header className="h-[48px] bg-card border-b border-border flex items-center justify-between px-3 shrink-0 z-100 shadow-xl">
        <div className="flex items-center gap-4 w-[280px]">
          <button onClick={() => navigate('/dashboard/website')} className="p-1.5 hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} />
          </button>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-foreground truncate leading-tight">{initialTitle}</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">Home Page</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 px-3 rounded-full border border-border">
          <button onClick={() => setActiveDevice('Desktop')} className={`p-1 rounded-md transition-colors ${activeDevice === 'Desktop' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}><Monitor size={12} /></button>
          <button onClick={() => setActiveDevice('Mobile')} className={`p-1 rounded-md transition-colors ${activeDevice === 'Mobile' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}><Smartphone size={12} /></button>
          <div className="w-px h-3 bg-border mx-1" />
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{activeDevice} PREVIEW</span>
        </div>

        <div className="flex items-center gap-3 w-[280px] justify-end">
          {saveStatus === 'saved' && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse px-2 py-1 bg-emerald-500/10 rounded-md ring-1 ring-emerald-500/30">Changes Saved</span>}
          {saveStatus === 'published' && <span className="text-[9px] font-black text-primary uppercase tracking-widest animate-pulse px-2 py-1 bg-primary/10 rounded-md ring-1 ring-primary/30">Site Published</span>}
          {saveStatus === 'error' && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest px-2 py-1 bg-red-500/10 rounded-md ring-1 ring-red-500/30">Save Failed</span>}
          <button onClick={() => handleSave()} disabled={isSaving} className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-md text-[11px] font-bold border border-border transition-all">
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save
          </button>
          <button onClick={handlePublish} disabled={isPublishing} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md text-[11px] font-bold transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
            {isPublishing ? <Loader2 size={12} className="animate-spin" /> : <GlobeIcon size={12} />}
            Publish
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - SECTION LIST */}
        <aside className="w-[280px] bg-card border-r border-background flex flex-col shrink-0 z-50 shadow-2xl">
          <div className="flex bg-background/50 backdrop-blur-md border-b border-border p-1">
            <button 
              onClick={() => setActiveTab('sections')} 
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                activeTab === 'sections' 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Layers size={14} className="mr-2" />
              <span className="text-[9px] font-black uppercase tracking-widest">Sections</span>
            </button>
            <button 
              onClick={() => setActiveTab('theme')} 
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                activeTab === 'theme' 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Palette size={14} className="mr-2" />
              <span className="text-[9px] font-black uppercase tracking-widest">Theme</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 custom-figma-scroll">
            {activeTab === 'sections' && (
              <div className="space-y-1">
                {sections.map((section, idx) => (
                  <div 
                    key={section.id} 
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${selectedSectionId === section.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${section.visible ? 'bg-green-500' : 'bg-gray-600 opacity-50'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest truncate">{section.type === 'Menu' ? b.menu : section.type}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, -1); }} disabled={idx === 0} className="p-1 hover:text-blue-300 disabled:opacity-20 disabled:cursor-not-allowed" title="Move up">
                        ↑
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 1); }} disabled={idx === sections.length - 1} className="p-1 hover:text-blue-300 disabled:opacity-20 disabled:cursor-not-allowed" title="Move down">
                        ↓
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id); }} className="p-1 hover:text-blue-300" title={section.visible ? 'Hide' : 'Show'}>
                        {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="p-1 hover:text-red-400" title="Remove section">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-border/50 mt-3">
                  <div className="flex gap-2 items-center">
                    <select
                      id="add-section-select"
                      className="flex-1 bg-background border border-border rounded-lg p-2 text-[10px] font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                      defaultValue=""
                    >
                      <option value="" disabled>Add section...</option>
                      {SECTION_TYPE_OPTIONS.map(opt => (
                        <option key={opt.type} value={opt.type}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const select = document.getElementById('add-section-select');
                        const val = select.value;
                        if (val) { addSection(val); select.value = ''; }
                      }}
                      className="px-3 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shrink-0"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="p-4 space-y-8">
                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Global Colors</span>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-muted p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-muted-foreground">Primary Color</span>
                      <input 
                        type="color" 
                        value={theme.primaryColor} 
                        onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-8 h-8 rounded-lg bg-transparent border-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Fine Typography</span>
                  <div className="flex flex-col gap-4">
                    <div className="bg-muted p-3 rounded-xl border border-border space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-widest">Font Family</span>
                      <select 
                        value={theme.fontFamily} 
                        onChange={(e) => setTheme(prev => ({ ...prev, fontFamily: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg p-2 text-[11px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Inter">Inter (Modern)</option>
                        <option value="Playfair Display">Playfair Display (Elegant)</option>
                        <option value="Roboto">Roboto (Clean)</option>
                        <option value="Outfit">Outfit (Geometric)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Compliance & Legal</span>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-muted p-3 rounded-xl border border-border">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground">Cookie Consent</span>
                        <span className="text-[8px] text-muted-foreground/40 uppercase tracking-widest">Show banner on load</span>
                      </div>
                      <button 
                        onClick={() => setTheme(prev => ({ ...prev, cookieConsentEnabled: !prev.cookieConsentEnabled }))}
                        className={`w-10 h-5 rounded-full transition-all relative ${theme.cookieConsentEnabled ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-foreground rounded-full transition-all ${theme.cookieConsentEnabled ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main className="flex-1 relative bg-[#1E1E1E] overflow-hidden flex flex-col">
          <SectionRenderer 
            sections={sections} 
            theme={theme} 
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            device={activeDevice}
            accountData={accountData}
          />
        </main>

        {/* RIGHT SIDEBAR - PROPERTY EDITOR */}
        <aside className="w-[320px] bg-card border-l border-background flex flex-col shrink-0 z-50 shadow-2xl">
          <div className="flex h-[40px] items-center px-4 border-b border-border bg-background">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Properties</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-figma-scroll">
            {selectedSection ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">{selectedSection.type === 'Menu' ? b.menu : selectedSection.type}</h3>
                  {!selectedSection.visible && (
                    <span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded text-[8px] font-black uppercase tracking-widest">Hidden</span>
                  )}
                </div>

                <div className="space-y-6">
                  {/* LAYOUT SWITCHER */}
                  {LAYOUT_OPTIONS[selectedSection.type] && (
                    <div className="space-y-2 bg-muted/50 p-4 rounded-2xl border border-border">
                      <div className="flex items-center gap-2 mb-2">
                         <Layers size={12} className="text-muted-foreground" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Layout</span>
                      </div>
                      <select
                        value={selectedSection.content.layout || 'tastenest-dark'}
                        onChange={(e) => updateSectionLayout(selectedSection.id, e.target.value)}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-[11px] font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                      >
                        {LAYOUT_OPTIONS[selectedSection.type].map(layout => (
                          <option key={layout} value={layout}>{layout.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* DYNAMIC BINDING (SOURCE) */}
                  {(selectedSection.type === 'Navbar' || selectedSection.type === 'Menu') && (
                    <div className="space-y-2 bg-primary/10 p-4 rounded-2xl border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                         <Globe size={12} className="text-primary" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary">Source Management</span>
                      </div>
                      <select 
                        value={selectedSection.sourceId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSections(prev => prev.map(s => 
                            s.id === selectedSectionId ? { ...s, sourceId: val } : s
                          ));
                        }}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-[11px] font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Static Content (Manual)</option>
                        {selectedSection.type === 'Navbar' && accountData.navMenus.map(m => (
                          <option key={m.id} value={m.id}>Dynamic: {m.name}</option>
                        ))}
                        {selectedSection.type === 'Menu' && accountData.menus.map(cat => (
                          <option key={cat.id} value={cat.id}>{b.menu} Category: {cat.name}</option>
                        ))}
                      </select>
                      <p className="text-[9px] text-muted-foreground mt-1">Connecting to a dynamic source will override manual content.</p>
                    </div>
                  )}

                  {Object.entries(selectedSection.content).map(([field, value]) => {
                    const isText = typeof value === 'string' && value.length > 30;
                    const isColor = field.toLowerCase().includes('color');
                    const isImage = field.toLowerCase().includes('image') || field.toLowerCase().includes('logo');

                    if (field === 'layout') return null;

                    if (Array.isArray(value)) {
                      return (
                        <div key={field} className="space-y-2">
                          <div className="flex items-center justify-between ml-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{field.replace(/([A-Z])/g, ' $1')}</label>
                            <button
                              onClick={() => {
                                const newItem = prompt(`Add item to "${field}":`);
                                if (newItem) {
                                  updateSectionContent(selectedSectionId, field, [...value, newItem]);
                                }
                              }}
                              className="text-[8px] font-black uppercase tracking-widest text-primary hover:text-foreground flex items-center gap-1 transition-colors"
                            >
                              <Plus size={8} /> Add
                            </button>
                          </div>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {value.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 group/item">
                                <GripVertical size={10} className="text-muted-foreground/30 shrink-0" />
                                <span className="text-[10px] font-medium text-foreground flex-1 truncate">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                                <button
                                  onClick={() => {
                                    const updated = value.filter((_, i) => i !== idx);
                                    updateSectionContent(selectedSectionId, field, updated);
                                  }}
                                  className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                            {value.length === 0 && (
                              <p className="text-[9px] text-muted-foreground italic px-1">Empty list — click "Add" to add items</p>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={field} className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                           <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{field.replace(/([A-Z])/g, ' $1')}</label>
                           {/* IDENTITY SYNC BUTTONS */}
                           {['title', 'subtitle', 'logo', 'buttonText'].includes(field) && (
                              <button 
                                onClick={() => {
                                   let token = '';
                                   if (field === 'title' || field === 'logo') token = '{{restaurant_name}}';
                                   if (field === 'subtitle') token = `{{restaurant_name}} provides exceptional ${(b.sidebar || 'business').toLowerCase()} services.`;
                                   updateSectionContent(selectedSectionId, field, token);
                                }}
                                className="text-[8px] font-black uppercase tracking-widest text-primary hover:text-foreground flex items-center gap-1 transition-colors"
                              >
                                 <Plus size={8} /> Sync IDENTITY
                              </button>
                           )}
                        </div>
                        {isImage ? (
                          <div className="space-y-4">
                             <div className="w-full h-32 rounded-2xl bg-background border border-border overflow-hidden relative group">
                                {value ? (
                                   <img src={value} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Preview" />
                                ) : (
                                   <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                                      <ImageIcon size={24} className="mb-2" />
                                      <span className="text-[9px] font-black tracking-widest uppercase">No Image Set</span>
                                   </div>
                                )}
                             </div>
                             <input 
                                type="text"
                                value={value || ''}
                                placeholder="Paste Image URL"
                                onChange={(e) => updateSectionContent(selectedSectionId, field, e.target.value)}
                                className="w-full bg-background border border-border rounded-xl p-3 text-[11px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                             />
                          </div>
                        ) : isText ? (
                          <textarea 
                            value={value} 
                            onChange={(e) => updateSectionContent(selectedSectionId, field, e.target.value)}
                            className="w-full bg-background border border-border rounded-xl p-4 text-[11px] font-medium leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px] resize-none shadow-inner"
                          />
                        ) : (
                          <input 
                            type={isColor ? 'color' : 'text'} 
                            value={value} 
                            onChange={(e) => updateSectionContent(selectedSectionId, field, e.target.value)}
                            className="w-full bg-background border border-border rounded-xl p-3 text-[11px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
                 <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground mb-6 flex items-center justify-center italic text-4xl font-serif">!</div>
                 <h4 className="text-xl font-black italic tracking-tighter uppercase mb-4 text-foreground">No Section Selected</h4>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed text-muted-foreground">Select a layer from the left panel or click a section in the canvas to start editing contents.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <style>{`
        .custom-figma-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-figma-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-figma-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        .custom-figma-scroll::-webkit-scrollbar-thumb:hover { background: var(--muted-foreground); }
      `}</style>
    </div>
  );
}
