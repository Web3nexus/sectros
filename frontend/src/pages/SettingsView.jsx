import React, { useState, useEffect } from 'react'
import { Save, Upload, Palette, Globe, Shield, Loader2, Check, RefreshCw } from 'lucide-react'
import api from '../services/api'
import { useBusinessConfig } from '../hooks/useBusinessConfig'

export default function SettingsView() {
  const config = useBusinessConfig();
  const b = config.labels;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    restaurant_name: '',
    primary_color: '#2563EB',
    currency_symbol: '$',
    booking_phone: '',
    contact_email: '',
    notification_email: '',
    auto_responder: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('branding');
      if (Object.keys(res.data).length > 0) {
         // Merge with defaults
         setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Settings Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('branding', settings);
      // Optional: show toast or success state
    } catch (err) {
      console.error('Save Failed:', err);
    } finally {
      setTimeout(() => setSaving(false), 800);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
         <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">Control Panel</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage your global {config.type} identity and engine parameters.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Synchronizing...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Identity Section */}
         <div className="bg-white p-8 rounded-[32px] border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <Globe size={18} className="text-primary" />
               <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{config.type.charAt(0).toUpperCase() + config.type.slice(1)} Identity</h3>
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Business Name</label>
                  <input 
                    type="text" 
                    value={settings.restaurant_name}
                    onChange={(e) => setSettings({...settings, restaurant_name: e.target.value})}
                    placeholder={`${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Name`}
                    className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all" 
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Currency Symbol</label>
                  <input 
                    type="text" 
                    value={settings.currency_symbol}
                    onChange={(e) => setSettings({...settings, currency_symbol: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all" 
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Contact Phone Number</label>
                  <input 
                    type="tel" 
                    value={settings.booking_phone || ''}
                    onChange={(e) => setSettings({...settings, booking_phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all font-mono" 
                  />
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5">Used in AI fallback messages when the AI cannot process a request.</p>
               </div>
               <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Contact Email</label>
                  <input 
                    type="email" 
                    value={settings.contact_email || ''}
                    onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                    placeholder={`contact@${config.type}.com`}
                    className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all" 
                  />
               </div>
            </div>
         </div>

         {/* Visual Section */}
         <div className="bg-white p-8 rounded-[32px] border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <Palette size={18} className="text-primary" />
               <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Visual Architecture</h3>
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Primary Core Color</label>
                  <div className="flex items-center gap-4">
                     <input 
                       type="color" 
                       value={settings.primary_color}
                       onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                       className="h-14 w-14 rounded-2xl cursor-pointer border-4 border-slate-50 overflow-hidden" 
                     />
                     <div className="flex-1 px-5 py-3 bg-slate-50 border-2 border-border rounded-2xl font-mono text-sm font-bold text-muted-foreground uppercase">
                        {settings.primary_color}
                     </div>
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Brand Assets</label>
                  <div className="border-2 border-dashed border-border rounded-[28px] p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                     <Upload size={24} className="mx-auto text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-slate-600">Upload High-Res Logo</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Intelligence Section */}
         <div className="bg-white p-8 rounded-[32px] border border-border shadow-sm space-y-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
               <Shield size={18} className="text-primary" />
               <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Engine Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-border">
                  <div>
                     <div className="font-black text-foreground text-sm uppercase tracking-tight">Social Auto-Responder</div>
                     <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Autonomous interaction engine</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, auto_responder: !settings.auto_responder})}
                    className={`h-8 w-14 rounded-full transition-all relative ${settings.auto_responder ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                     <div className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${settings.auto_responder ? 'left-7' : 'left-1'}`}></div>
                  </button>
               </div>

               <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-border opacity-50 cursor-not-allowed">
                  <div>
                     <div className="font-black text-foreground text-sm uppercase tracking-tight">Predictive Analytics</div>
                     <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">AI {config.type === 'hospitality' ? 'Occupancy' : 'Demand'} anticipation</p>
                  </div>
                  <div className="bg-slate-200 h-8 w-14 rounded-full relative">
                     <div className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-blue-50 p-8 rounded-[32px] border border-blue-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary text-white rounded-2xl flex items-center justify-center">
               <Check size={20} />
            </div>
            <div>
               <div className="font-black text-blue-900 uppercase tracking-tight text-sm">Multi-Tenant Sync Enabled</div>
               <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Your settings reflect instantly across all channels.</p>
            </div>
         </div>
      </div>
    </div>
  )
}
