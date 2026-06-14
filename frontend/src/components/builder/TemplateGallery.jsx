import React, { useState, useEffect } from 'react';
import {Check, Eye, Lock, ShoppingCart, RefreshCw, Briefcase, Layout, Box, ChevronRight} from 'lucide-react';
import api from '../../services/api';
import { FALLBACK_BLUEPRINTS } from './BlueprintData';
import { useBusinessConfig } from '../../hooks/useBusinessConfig';

export default function TemplateGallery({ onSelect, onPreview }) {
  const config = useBusinessConfig();
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [purchasingId, setPurchasingId] = useState(null);

  const fetchThemes = async () => {
    setIsLoading(true);
    const mapBlueprint = (t) => ({ ...t, is_free: true, is_unlocked: true, preview_image_url: t.preview_image_url || t.preview });
    try {
      const response = await api.get('website-themes');
      const data = response.data;
      
      // Filter logic: Match business_type or category
      const filterThemes = (list) => list.filter(t => 
        !t.category || t.category === config.type || (config.type === 'hospitality' && t.category === 'hotel')
      );

      if (Array.isArray(data) && data.length > 0) {
        setThemes(filterThemes(data));
      } else {
        setThemes(filterThemes(FALLBACK_BLUEPRINTS.map(mapBlueprint)));
      }
    } catch (error) {
      console.error("Failed to fetch themes, using blueprints", error);
      const filterThemes = (list) => list.filter(t => 
        !t.category || t.category === config.type || (config.type === 'hospitality' && t.category === 'hotel')
      );
      setThemes(filterThemes(FALLBACK_BLUEPRINTS.map(mapBlueprint)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [config.type]);

  const handlePurchase = async (e, theme) => {
    e.stopPropagation();
    if (theme.id.startsWith('blueprint-')) {
       onSelect(theme);
       return;
    }
    setPurchasingId(theme.id);
    try {
      const response = await api.post(`website-themes/${theme.id}/purchase`);
      if (response.data.unlocked) {
        await fetchThemes();
      } else if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
       alert(error.response?.data?.message || "Failed to initialize purchase.");
    } finally {
      setPurchasingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4 text-muted-foreground">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase">Streaming Blueprint Gallery...</p>
      </div>
    );
  }

  return (
    <div id="template-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 scroll-mt-24">
      {themes.map((theme) => {
        const isHovered = hoveredId === theme.id;
        const isUnlocked = theme.is_unlocked;
        
        return (
          <div
            key={theme.id}
            className="group relative bg-white border border-border rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] cursor-pointer"
            onMouseEnter={() => setHoveredId(theme.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Template Image (The "Artboard") */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <img
                src={theme.preview_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600'}
                alt={theme.name}
                className={`w-full h-full object-cover transition-all duration-1000 ease-out ${isHovered ? 'scale-110 brightness-50' : 'scale-100 brightness-100'}`}
              />

              {!isUnlocked && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                   <div className="bg-white border border-slate-200 p-4 rounded-full shadow-2xl">
                      <Lock className="w-5 h-5 text-amber-500" />
                   </div>
                </div>
              )}

              {/* Status Bar UI Look */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm ${isUnlocked ? 'bg-primary text-white border-blue-500' : 'bg-white text-slate-500 border-slate-200'}`}>
                   {isUnlocked ? 'Ready to Build' : 'Premium Frame'}
                </span>
              </div>

              {/* Actions Overlay */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {isUnlocked ? (
                  <button
                    onClick={() => onSelect(theme)}
                    className="w-48 bg-primary text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4" /> Initialize
                  </button>
                ) : (
                  <button
                    onClick={(e) => handlePurchase(e, theme)}
                    disabled={purchasingId === theme.id}
                    className="w-48 bg-white text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50 border border-slate-200"
                  >
                    {purchasingId === theme.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                    Unlock ${theme.price}
                  </button>
                )}
                <button
                  onClick={() => onPreview(theme)}
                  className="w-48 bg-white/20 backdrop-blur-md text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20 flex items-center justify-center gap-2 hover:bg-white/30"
                >
                  <Eye className="w-4 h-4" /> Quick Look
                </button>
              </div>
            </div>

            {/* Figma-style Meta info */}
            <div className="p-8 border-t border-slate-200 bg-white">
               <div className="flex items-center justify-between mb-2">
                  <h3 className="text-slate-900 font-black text-xl uppercase tracking-tighter italic group-hover:text-primary transition-colors">{theme.name}</h3>
                  <Briefcase className={`w-4 h-4 transition-all duration-500 ${isHovered ? 'text-blue-500 scale-125' : 'text-slate-200'}`} />
               </div>
               <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
                  {theme.description || 'Professional multi-section restaurant blueprint for high-fidelity deployment.'}
               </p>
               
               <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-6 text-slate-300">
                     <div className="flex items-center gap-2 group/icon">
                        <Box size={14} className="group-hover/icon:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase text-slate-500">12 Sections</span>
                     </div>
                     <div className="flex items-center gap-2 group/icon">
                        <Layout size={14} className="group-hover/icon:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-black uppercase text-slate-500">Responsive</span>
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:border-blue-200 group-hover:text-primary transition-all">
                     <ChevronRight size={14} />
                  </div>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
