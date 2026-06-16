import React, { useState, useEffect } from 'react'
import {Save, Upload, Palette, Globe, Shield, Loader2, Check, RefreshCw, Settings, Bell, Truck, Percent, BookOpen, ShoppingBag, Clock, Calendar, Users, DollarSign, XCircle, Award, BedDouble, Brush, Wrench, Table, Utensils, Package} from 'lucide-react'
import api from '../services/api'
import { useBusinessConfig } from '../hooks/useBusinessConfig'

const ICON_MAP = {
  Table, Utensils, BookOpen, ShoppingBag, Truck, Package, Percent, Shield, Bell,
  Calendar, Users, Clock, DollarSign, XCircle, Award, BedDouble, Brush, Wrench,
}

export default function SettingsView() {
  const config = useBusinessConfig()
  const b = config.labels
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [schema, setSchema] = useState({})
  const [settings, setSettings] = useState({
    business_name: '',
    primary_color: '#2563EB',
    currency_symbol: '$',
    booking_phone: '',
    contact_email: '',
    notification_email: '',
    auto_responder: true,
  })

  useEffect(() => {
    Promise.all([fetchSettings(), fetchSchema()])
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await api.get('configuration')
      if (Object.keys(res.data).length > 0) {
        setSettings(prev => ({ ...prev, ...res.data }))
      }
    } catch (err) {
      console.error('Settings fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchema = async () => {
    try {
      const res = await api.get('configuration/schema')
      setSchema(res.data || {})
    } catch (err) {
      console.error('Schema fetch error:', err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('configuration', settings)
    } catch (err) {
      console.error('Save Failed:', err)
    } finally {
      setTimeout(() => setSaving(false), 800)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const tabs = [
    { key: 'general', label: 'General', icon: Globe },
    { key: 'branding', label: 'Branding', icon: Palette },
    { key: 'business', label: 'Business Settings', icon: Settings, badge: Object.keys(schema).length },
    { key: 'engine', label: 'Engine', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">Configuration</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage your {config.type} settings</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-3 bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
          {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-border p-1.5 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.key ? 'bg-slate-900 text-white shadow-lg' : 'text-muted-foreground hover:text-slate-600'
              }`}>
              <Icon size={16} />
              {tab.label}
              {tab.badge ? <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{tab.badge}</span> : null}
            </button>
          )
        })}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-6">
          <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm flex items-center gap-2">
            <Globe size={18} className="text-primary" /> Business Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Business Name</label>
              <input type="text" value={settings.business_name || settings.restaurant_name || ''}
                onChange={e => handleSettingChange('business_name', e.target.value)}
                className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all"
                placeholder={`${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Name`} />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Currency Symbol</label>
              <input type="text" value={settings.currency_symbol || '$'}
                onChange={e => handleSettingChange('currency_symbol', e.target.value)}
                className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Contact Phone</label>
              <input type="tel" value={settings.business_phone || settings.booking_phone || ''}
                onChange={e => handleSettingChange('business_phone', e.target.value)}
                className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all font-mono"
                placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Contact Email</label>
              <input type="email" value={settings.contact_email || ''}
                onChange={e => handleSettingChange('contact_email', e.target.value)}
                className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all"
                placeholder={`contact@${config.type}.com`} />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Notification Email</label>
              <input type="email" value={settings.notification_email || ''}
                onChange={e => handleSettingChange('notification_email', e.target.value)}
                className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all"
                placeholder="orders@example.com" />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Business Address</label>
              <input type="text" value={settings.business_address || ''}
                onChange={e => handleSettingChange('business_address', e.target.value)}
                className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all"
                placeholder="123 Main St, City" />
            </div>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-6">
          <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm flex items-center gap-2">
            <Palette size={18} className="text-primary" /> Visual Architecture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Primary Color</label>
              <div className="flex items-center gap-4">
                <input type="color" value={settings.primary_color || '#2563EB'}
                  onChange={e => handleSettingChange('primary_color', e.target.value)}
                  className="h-14 w-14 rounded-2xl cursor-pointer border-4 border-slate-50 overflow-hidden" />
                <div className="flex-1 px-5 py-3 bg-slate-50 border-2 border-border rounded-2xl font-mono text-sm font-bold text-muted-foreground uppercase">
                  {settings.primary_color || '#2563EB'}
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Brand Logo</label>
              <div className="border-2 border-dashed border-border rounded-[28px] p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <Upload size={24} className="mx-auto text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-slate-600">Upload Logo</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Settings Tab */}
      {activeTab === 'business' && (
        <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-6">
          <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm flex items-center gap-2">
            <Settings size={18} className="text-primary" /> {config.type.charAt(0).toUpperCase() + config.type.slice(1)} Settings
          </h3>
          {Object.keys(schema).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(schema).map(([key, item]) => {
                const Icon = ICON_MAP[item.icon] || Settings
                return (
                  <div key={key} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-border hover:border-blue-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white border border-border flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="font-black text-foreground text-xs uppercase tracking-tight">{item.label}</div>
                        {item.type === 'textarea' && (
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Configure rules</p>
                        )}
                      </div>
                    </div>
                    <button className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border bg-white hover:border-blue-200 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100">
                      Edit
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground font-bold uppercase tracking-widest text-xs italic">
              No business-specific settings loaded.
            </div>
          )}
        </div>
      )}

      {/* Engine Tab */}
      {activeTab === 'engine' && (
        <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-6">
          <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm flex items-center gap-2">
            <Shield size={18} className="text-primary" /> Engine Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-border">
              <div>
                <div className="font-black text-foreground text-sm uppercase tracking-tight">Auto-Responder</div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">AI social & message replies</p>
              </div>
              <button onClick={() => handleSettingChange('auto_responder', !settings.auto_responder)}
                className={`h-8 w-14 rounded-full transition-all relative ${settings.auto_responder ? 'bg-primary' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${settings.auto_responder ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-border opacity-50 cursor-not-allowed">
              <div>
                <div className="font-black text-foreground text-sm uppercase tracking-tight">Predictive Analytics</div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">AI demand anticipation</p>
              </div>
              <div className="bg-slate-200 h-8 w-14 rounded-full relative">
                <div className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 flex items-center gap-4">
        <div className="h-10 w-10 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0">
          <Check size={20} />
        </div>
        <div>
          <div className="font-black text-blue-900 uppercase tracking-tight text-sm">Settings Active</div>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Configuration syncs across all channels.</p>
        </div>
      </div>
    </div>
  )
}
