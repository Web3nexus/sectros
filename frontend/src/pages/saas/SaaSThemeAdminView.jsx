import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Globe, Eye, X, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import centralApi from '../../services/centralApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { exportToHtml, exportToCss } from '../../utils/builderExport';

// ─── Theme Store Grid Component ──────────────────────────────────────────
const ThemeStoreGrid = ({ themes, onEdit, onDelete, onPreview }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map(theme => (
            <div key={theme.id} className="group bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm">
                <div className="relative aspect-video bg-background">
                    <img 
                        src={theme.preview_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600'} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        alt={theme.name}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                        {theme.is_active ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Active</span>
                        ) : (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Inactive</span>
                        )}
                        {theme.is_free && (
                            <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Free</span>
                        )}
                    </div>
                    <div className="absolute top-4 right-4 bg-muted/80 backdrop-blur-md text-foreground px-2 py-1 rounded-lg text-xs font-bold border border-border">
                        ${parseFloat(theme.price || 0).toFixed(2)}
                    </div>
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button 
                            onClick={() => onPreview(theme)}
                            className="p-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-xl shadow-primary/20"
                            title="Preview Theme"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="p-5">
                    <h3 className="text-foreground font-bold text-lg mb-1">{theme.name}</h3>
                    <p className="text-muted-foreground text-xs mb-4 uppercase tracking-widest font-black">{theme.category || 'General'}</p>
                    <div className="flex gap-2">
                        <button onClick={() => onEdit(theme)} className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-border">
                            <Edit3 className="w-4 h-4" /> Manage
                        </button>
                        <button onClick={() => onDelete(theme.id)} className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-border">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// ─── Main Theme Admin View ─────────────────────────────────────────────
export default function SaaSThemeAdminView() {
    const [themes, setThemes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        setIsLoading(true);
        try {
            const res = await centralApi.get('saas/cms/themes');
            setThemes(res.data);
        } catch (error) {
            console.error('Failed to load themes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            setFormData(item);
        } else {
            setFormData({ name: '', slug: '', category: 'General', price: 0, is_free: true, html_content: '', css_content: '', preview_image_url: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const submitData = { ...formData };
            if (editingItem) {
                await centralApi.put(`/saas/cms/themes/${editingItem.id}`, submitData);
            } else {
                await centralApi.post(`/saas/cms/themes`, submitData);
            }
            setIsModalOpen(false);
            fetchThemes();
        } catch (error) {
            alert('Failed to save theme. Check unique slugs or missing fields.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await centralApi.delete(`/saas/cms/themes/${id}`);
            fetchThemes();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const confirmDelete = (id) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
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

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-card p-8 rounded-[2rem] border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">Website Templates</h1>
                    <p className="text-muted-foreground max-w-2xl">Manage the Blueprint Library available to your tenants. Add new themes, edit existing code, and set pricing.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="relative z-10 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    New Theme
                </button>
            </div>

            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl p-6">
                {isLoading ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse font-mono text-sm">LOADING THEMES...</div>
                ) : themes.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <Globe className="w-16 h-16 text-muted-foreground/20 mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No themes defined yet</h3>
                        <p className="text-muted-foreground text-sm">Click "New Theme" to add a new template to the library.</p>
                    </div>
                ) : (
                    <ThemeStoreGrid themes={themes} onEdit={handleOpenModal} onDelete={confirmDelete} onPreview={handlePreview} />
                )}
            </div>

            {/* Editor Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-20"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/50">
                                <div>
                                    <h2 className="text-2xl font-black text-foreground">{editingItem ? 'Edit Theme' : 'Create New Theme'}</h2>
                                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mt-1">Drafting for Blueprint Library</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1">
                                <form id="theme-form" onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Theme Name</label>
                                            <input
                                                required type="text"
                                                value={formData.name || ''}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
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
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                                            <input type="text" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary font-medium" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Theme Price ($)</label>
                                            <input type="number" value={formData.price || 0} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preview Image URL</label>
                                            <input type="text" value={formData.preview_image_url || ''} onChange={e => setFormData({...formData, preview_image_url: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary font-medium" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                         <div className="flex items-center gap-3 bg-muted p-4 rounded-xl border border-border">
                                            <input type="checkbox" id="is_free" checked={formData.is_free} onChange={e => setFormData({...formData, is_free: e.target.checked})} className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary" />
                                            <label htmlFor="is_free" className="text-sm font-bold text-foreground cursor-pointer select-none">Free Theme</label>
                                        </div>
                                        <div className="flex items-center gap-3 bg-muted p-4 rounded-xl border border-border">
                                            <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary" />
                                            <label htmlFor="is_active" className="text-sm font-bold text-foreground cursor-pointer select-none">Active / Enabled</label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary uppercase tracking-wider">HTML Content</label>
                                        <textarea value={formData.html_content || ''} onChange={e => setFormData({...formData, html_content: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary min-h-[300px] font-mono text-xs" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-primary uppercase tracking-wider">CSS Overrides</label>
                                        <textarea value={formData.css_content || ''} onChange={e => setFormData({...formData, css_content: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary min-h-[150px] font-mono text-xs" />
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                                    Cancel
                                </button>
                                <button type="submit" form="theme-form" className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                                    <CheckCircle className="w-5 h-5" />
                                    Save Theme
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    handleDelete(itemToDelete);
                    setIsDeleteModalOpen(false);
                }}
                title="Delete Theme?"
                message="This will permanently remove this theme from the Blueprint Library. Existing tenants using this theme will not be affected. This action cannot be undone."
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
                                        className="px-6 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                    >
                                        <Edit3 className="w-4 h-4" /> Edit Code
                                    </button>
                                    <button onClick={() => setPreviewTheme(null)} className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
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
                                                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Outfit:wght@400;700;900&family=Raleway:wght@400;700;900&display=swap" rel="stylesheet">
                                                    <script src="https://cdn.tailwindcss.com"></script>
                                                    <style>
                                                        body { font-family: '${previewThemeContent.theme_json?.fontFamily || 'Inter'}', sans-serif; }
                                                        ${previewThemeContent.sections_json ? exportToCss(previewThemeContent.theme_json || {}) : (previewThemeContent.css_content || '')}
                                                        ::-webkit-scrollbar { width: 8px; }
                                                        ::-webkit-scrollbar-track { background: transparent; }
                                                        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                                                    </style>
                                                </head>
                                                <body class="antialiased">
                                                    ${previewThemeContent.sections_json ? 
                                                        exportToHtml(previewThemeContent.sections_json, previewThemeContent.theme_json || {}, { business_name: 'Sectros Prime' }) : 
                                                        processPreviewContent(previewThemeContent.html_content)
                                                    }
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
