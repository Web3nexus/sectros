import React, { useState, useEffect } from 'react'
import {Save, Upload, Palette, Globe, Shield, Loader2, Check, RefreshCw, Settings, Bell, Truck, Percent, BookOpen, ShoppingBag, Clock, Calendar, Users, DollarSign, XCircle, Award, BedDouble, Brush, Wrench, Table, Utensils, Package, FormInput, Plus, Trash2, GripVertical, ToggleLeft, ToggleRight} from 'lucide-react'
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
  const [bookingForm, setBookingForm] = useState(null)
  const [bookingFormSaving, setBookingFormSaving] = useState(false)
  const [newField, setNewField] = useState({ name: '', label: '', type: 'text', required: false, enabled: true })

  useEffect(() => {
    Promise.all([fetchSettings(), fetchSchema(), fetchBookingForm()])
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

  const fetchBookingForm = async () => {
    try {
      const res = await api.get('configuration/booking-form')
      setBookingForm(res.data)
    } catch (e) {
      console.warn('Booking form fetch failed:', e)
    }
  }

  const toggleField = (idx) => {
    setBookingForm(prev => {
      const fields = [...prev.fields]
      fields[idx] = { ...fields[idx], enabled: !fields[idx].enabled }
      return { ...prev, fields }
    })
  }

  const updateField = (idx, key, value) => {
    setBookingForm(prev => {
      const fields = [...prev.fields]
      fields[idx] = { ...fields[idx], [key]: value }
      return { ...prev, fields }
    })
  }

  const removeField = (idx) => {
    setBookingForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== idx)
    }))
  }

  const addField = () => {
    if (!newField.label.trim()) return
    setBookingForm(prev => ({
      ...prev,
      fields: [...prev.fields, {
        name: newField.name || newField.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        label: newField.label,
        type: newField.type,
        required: newField.required,
        enabled: true,
      }]
    }))
    setNewField({ name: '', label: '', type: 'text', required: false, enabled: true })
  }

  const moveField = (idx, dir) => {
    setBookingForm(prev => {
      const fields = [...prev.fields]
      const target = idx + dir
      if (target < 0 || target >= fields.length) return prev
      ;[fields[idx], fields[target]] = [fields[target], fields[idx]]
      return { ...prev, fields }
    })
  }

  const saveBookingForm = async () => {
    setBookingFormSaving(true)
    try {
      await api.post('configuration/booking-form', bookingForm)
    } catch (e) {
      console.error('Save booking form failed:', e)
      alert('Failed to save booking form')
    } finally {
      setBookingFormSaving(false)
    }
  }

  const tabs = [
    { key: 'general', label: 'General', icon: Globe },
    { key: 'branding', label: 'Branding', icon: Palette },
    { key: 'booking', label: 'Booking Form', icon: BookOpen },
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

      {/* Booking Form Tab */}
      {activeTab === 'booking' && (
        <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm flex items-center gap-2">
              <FormInput size={18} className="text-primary" /> Booking Form Fields
            </h3>
            <button onClick={saveBookingForm} disabled={bookingFormSaving || !bookingForm}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
              {bookingFormSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Form
            </button>
          </div>

          {bookingForm ? (
            <>
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-border">
                <div>
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Form Title</label>
                  <input type="text" value={bookingForm.title || ''}
                    onChange={e => setBookingForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all"
                    placeholder="Reserve Your Table" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Form Subtitle</label>
                  <input type="text" value={bookingForm.subtitle || ''}
                    onChange={e => setBookingForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full bg-white border-2 border-border rounded-2xl px-5 py-3 font-bold text-slate-700 focus:border-blue-600 transition-all"
                    placeholder="Experience our seasonal menu..." />
                </div>
              </div>

              {/* Fields List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Form Fields ({bookingForm.fields?.length || 0})</span>
                  <span className="text-[9px] text-muted-foreground italic">Drag to reorder via arrows</span>
                </div>

                {bookingForm.fields?.map((field, idx) => (
                  <div key={field.name} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${field.enabled ? 'bg-white border-border' : 'bg-slate-50 border-dashed border-slate-200 opacity-60'}`}>
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><span className="text-[8px]">▲</span></button>
                      <button onClick={() => moveField(idx, 1)} disabled={idx === bookingForm.fields.length - 1} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><span className="text-[8px]">▼</span></button>
                    </div>
                    <button onClick={() => toggleField(idx)} className="text-slate-400 hover:text-blue-600 transition-colors">
                      {field.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <input type="text" value={field.label}
                        onChange={e => updateField(idx, 'label', e.target.value)}
                        className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:border-blue-600 transition-all outline-none"
                        placeholder="Label" />
                      <input type="text" value={field.name}
                        onChange={e => updateField(idx, 'name', e.target.value)}
                        className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs font-mono focus:border-blue-600 transition-all outline-none"
                        placeholder="field_name" />
                      <select value={field.type}
                        onChange={e => updateField(idx, 'type', e.target.value)}
                        className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:border-blue-600 transition-all outline-none">
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="time">Time</option>
                        <option value="select">Select</option>
                        <option value="textarea">Textarea</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={field.required} onChange={e => updateField(idx, 'required', e.target.checked)} className="rounded" />
                      Req
                    </label>
                    <button onClick={() => removeField(idx)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Field */}
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4">
                <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Add Custom Field</span>
                <div className="flex items-center gap-3">
                  <input type="text" placeholder="Field Label (e.g. Wedding Date)" value={newField.label}
                    onChange={e => setNewField(prev => ({ ...prev, label: e.target.value, name: prev.name || e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') }))}
                    className="flex-1 bg-white border border-blue-200 rounded-2xl px-5 py-3 text-sm font-bold focus:border-blue-600 transition-all outline-none" />
                  <select value={newField.type} onChange={e => setNewField(prev => ({ ...prev, type: e.target.value }))}
                    className="bg-white border border-blue-200 rounded-2xl px-4 py-3 text-xs font-bold focus:border-blue-600 transition-all outline-none">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="time">Time</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                  </select>
                  <label className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 cursor-pointer whitespace-nowrap">
                    <input type="checkbox" checked={newField.required} onChange={e => setNewField(prev => ({ ...prev, required: e.target.checked }))} className="rounded" />
                    Required
                  </label>
                  <button onClick={addField} className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground font-bold uppercase tracking-widest text-xs italic">
              <Loader2 size={24} className="animate-spin mx-auto mb-4" />
              Loading form configuration...
            </div>
          )}
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
