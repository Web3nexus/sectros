import React, { useState, useEffect } from 'react'
import {
  Save, Upload, Palette, Globe, Shield, Loader2, Check, RefreshCw,
  Bell, Clock, Calendar, DollarSign, BookOpen, FormInput, Plus,
  Trash2, ToggleLeft, ToggleRight, FileText, Percent, CheckCircle2
} from 'lucide-react'
import api from '../services/api'
import { useBusinessConfig } from '../hooks/useBusinessConfig'
import { COUNTRY_CURRENCY_MAP, COMMON_CURRENCIES } from '../hooks/useCurrency'

export default function SettingsView() {
  const config = useBusinessConfig()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('venue')
  
  const [settings, setSettings] = useState({
    business_name: '',
    business_phone: '',
    booking_phone: '',
    contact_email: '',
    notification_email: '',
    business_address: '',
    country: 'US',
    currency_code: 'USD',
    currency_symbol: '$',
    primary_color: '#11c685',
    business_hours: 'Mon-Sun: 10:00 AM - 10:00 PM',
    booking_slot_duration: 90,
    auto_confirm_bookings: true,
    auto_responder: false,
    tax_rate: 0,
    service_charge: 0,
    reservations_deposit_required: false,
    reservations_deposit_amount: 0,
    cancellation_policy: 'Free cancellation up to 2 hours before scheduled booking.',
    special_instructions: '',
  })

  const [bookingForm, setBookingForm] = useState(null)
  const [bookingFormSaving, setBookingFormSaving] = useState(false)
  const [newField, setNewField] = useState({ name: '', label: '', type: 'text', required: false, enabled: true })

  useEffect(() => {
    Promise.all([fetchSettings(), fetchBookingForm()])
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await api.get('configuration')
      if (res.data && Object.keys(res.data).length > 0) {
        setSettings(prev => ({ ...prev, ...res.data }))
      }
    } catch (err) {
      console.error('Settings fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookingForm = async () => {
    try {
      const res = await api.get('configuration/booking-form')
      setBookingForm(res.data)
    } catch (e) {
      console.warn('Booking form fetch failed:', e)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleCountrySelect = (countryCode) => {
    const match = COUNTRY_CURRENCY_MAP[countryCode]
    setSettings(prev => ({
      ...prev,
      country: countryCode,
      ...(match ? { currency_code: match.code, currency_symbol: match.symbol } : {})
    }))
  }

  const handleCurrencySelect = (currencyCode) => {
    const match = COMMON_CURRENCIES.find(c => c.code === currencyCode)
    if (match) {
      setSettings(prev => ({
        ...prev,
        currency_code: match.code,
        currency_symbol: match.symbol,
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      await api.post('configuration', settings)
      if (settings.currency_symbol) localStorage.setItem('tenant_currency_symbol', settings.currency_symbol)
      if (settings.currency_code) localStorage.setItem('tenant_currency_code', settings.currency_code)
      if (settings.country) localStorage.setItem('tenant_country', settings.country)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Save Failed:', err)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
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
      alert('Booking form updated successfully!')
    } catch (e) {
      console.error('Save booking form failed:', e)
      alert('Failed to save booking form')
    } finally {
      setBookingFormSaving(false)
    }
  }

  const tabs = [
    { key: 'venue', label: 'Venue & Profile', icon: Globe },
    { key: 'operations', label: 'Operations & Hours', icon: Clock },
    { key: 'financials', label: 'Tax & Deposits', icon: DollarSign },
    { key: 'policies', label: 'Guest Policies', icon: Shield },
    { key: 'booking', label: 'Booking Form', icon: BookOpen },
    { key: 'branding', label: 'Branding', icon: Palette },
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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Business Configuration</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage your {config.type} venue details, currency, tax, and guest policies.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2.5 bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : saveSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-card rounded-2xl border border-border p-1.5 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 1. Venue & Profile Tab */}
      {activeTab === 'venue' && (
        <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 space-y-6">
          <div>
            <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
              <Globe size={18} className="text-primary" /> Venue Identity & Regional Settings
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select your business country to automatically configure your currency and symbols throughout the app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Business / Venue Name</label>
              <input
                type="text"
                value={settings.business_name || settings.restaurant_name || ''}
                onChange={e => handleSettingChange('business_name', e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder={`${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Name`}
              />
            </div>

            {/* Country Selector */}
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Country (Auto-Sets Currency)</label>
              <select
                value={settings.country || 'US'}
                onChange={e => handleCountrySelect(e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                {Object.entries(COUNTRY_CURRENCY_MAP).map(([code, c]) => (
                  <option key={code} value={code}>
                    {c.name} ({c.code} · {c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Code Selector */}
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Primary Currency</label>
              <select
                value={settings.currency_code || 'USD'}
                onChange={e => handleCurrencySelect(e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                {COMMON_CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Symbol Override */}
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Currency Symbol (Display)</label>
              <input
                type="text"
                value={settings.currency_symbol || '$'}
                onChange={e => handleSettingChange('currency_symbol', e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
                placeholder="$"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Contact Phone</label>
              <input
                type="tel"
                value={settings.business_phone || settings.booking_phone || ''}
                onChange={e => handleSettingChange('business_phone', e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={e => handleSettingChange('contact_email', e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder={`contact@${config.type}.com`}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Notification Email</label>
              <input
                type="email"
                value={settings.notification_email || ''}
                onChange={e => handleSettingChange('notification_email', e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="notifications@example.com"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Business Address</label>
              <input
                type="text"
                value={settings.business_address || ''}
                onChange={e => handleSettingChange('business_address', e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="123 Main St, City"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Operations & Hours Tab */}
      {activeTab === 'operations' && (
        <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 space-y-6">
          <div>
            <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
              <Clock size={18} className="text-primary" /> Operating Hours & Booking Logic
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure your operational schedule and booking turn times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Operating Hours Schedule</label>
              <input
                type="text"
                value={settings.business_hours || ''}
                onChange={e => handleSettingChange('business_hours', e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Mon-Fri: 09:00 - 22:00, Sat-Sun: 10:00 - 23:00"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Displayed to guests on the booking widget and receipts.</p>
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Default Table / Slot Duration</label>
              <select
                value={settings.booking_slot_duration || 90}
                onChange={e => handleSettingChange('booking_slot_duration', parseInt(e.target.value) || 90)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 hour)</option>
                <option value={90}>90 Minutes (1.5 hours)</option>
                <option value={120}>120 Minutes (2 hours)</option>
                <option value={180}>180 Minutes (3 hours)</option>
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">How long a table is reserved before becoming available again.</p>
            </div>

            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border">
              <div>
                <div className="font-black text-foreground text-sm uppercase tracking-tight">Auto-Confirm Bookings</div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Instantly confirm online reservations</p>
              </div>
              <button
                onClick={() => handleSettingChange('auto_confirm_bookings', !settings.auto_confirm_bookings)}
                className={`h-8 w-14 rounded-full transition-all relative ${settings.auto_confirm_bookings ? 'bg-primary' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${settings.auto_confirm_bookings ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border">
              <div>
                <div className="font-black text-foreground text-sm uppercase tracking-tight">AI Auto-Responder</div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">AI automated replies to guest inquiries</p>
              </div>
              <button
                onClick={() => handleSettingChange('auto_responder', !settings.auto_responder)}
                className={`h-8 w-14 rounded-full transition-all relative ${settings.auto_responder ? 'bg-primary' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${settings.auto_responder ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tax & Deposits Tab */}
      {activeTab === 'financials' && (
        <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 space-y-6">
          <div>
            <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
              <Percent size={18} className="text-primary" /> Tax, Service Charge & Reservation Deposits
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure your default VAT / sales tax rates and reservation deposit policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Default Tax / VAT Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.tax_rate ?? 0}
                  onChange={e => handleSettingChange('tax_rate', parseFloat(e.target.value) || 0)}
                  className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-10"
                />
                <span className="absolute right-4 top-3.5 text-sm font-bold text-muted-foreground">%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Applied automatically to item prices and invoices.</p>
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Service Charge (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.service_charge ?? 0}
                  onChange={e => handleSettingChange('service_charge', parseFloat(e.target.value) || 0)}
                  className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-10"
                />
                <span className="absolute right-4 top-3.5 text-sm font-bold text-muted-foreground">%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Discretionary service charge for orders or large parties.</p>
            </div>

            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border">
              <div>
                <div className="font-black text-foreground text-sm uppercase tracking-tight">Require Deposit for Reservations</div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Guests pay a deposit before confirmation</p>
              </div>
              <button
                onClick={() => handleSettingChange('reservations_deposit_required', !settings.reservations_deposit_required)}
                className={`h-8 w-14 rounded-full transition-all relative ${settings.reservations_deposit_required ? 'bg-primary' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${settings.reservations_deposit_required ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="p-6 bg-muted/30 rounded-3xl border border-border">
              <div className="font-black text-foreground text-sm uppercase tracking-tight mb-2">Deposit Amount per Booking</div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-primary">{settings.currency_symbol || '$'}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={!settings.reservations_deposit_required}
                  value={settings.reservations_deposit_amount || 0}
                  onChange={e => handleSettingChange('reservations_deposit_amount', parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-card border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-40"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Policies & Instructions Tab */}
      {activeTab === 'policies' && (
        <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 space-y-6">
          <div>
            <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
              <Shield size={18} className="text-primary" /> Guest Policies & Special Instructions
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Clear rules shown to customers when reserving a table or room.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Cancellation Policy</label>
              <textarea
                rows={3}
                value={settings.cancellation_policy || ''}
                onChange={e => handleSettingChange('cancellation_policy', e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                placeholder="e.g. Free cancellation up to 2 hours before scheduled booking. Late cancellations may incur a fee."
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Special Arrival Instructions & Notes</label>
              <textarea
                rows={4}
                value={settings.special_instructions || ''}
                onChange={e => handleSettingChange('special_instructions', e.target.value)}
                className="w-full bg-muted/40 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                placeholder="e.g. Smart casual dress code. Valet parking available at the entrance. Please notify staff upon arrival for dietary accommodations."
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Booking Form Tab */}
      {activeTab === 'booking' && (
        <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
                <FormInput size={18} className="text-primary" /> Booking Form Customizer
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Configure what details you request from guests during booking.</p>
            </div>
            <button
              onClick={saveBookingForm}
              disabled={bookingFormSaving || !bookingForm}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              {bookingFormSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Form
            </button>
          </div>

          {bookingForm ? (
            <>
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-3xl border border-border">
                <div>
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Form Title</label>
                  <input
                    type="text"
                    value={bookingForm.title || ''}
                    onChange={e => setBookingForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-card border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Reserve Your Table"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Form Subtitle</label>
                  <input
                    type="text"
                    value={bookingForm.subtitle || ''}
                    onChange={e => setBookingForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full bg-card border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Experience our seasonal dining..."
                  />
                </div>
              </div>

              {/* Fields List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Form Fields ({bookingForm.fields?.length || 0})</span>
                  <span className="text-[9px] text-muted-foreground italic">Use arrows to reorder fields</span>
                </div>

                {bookingForm.fields?.map((field, idx) => (
                  <div
                    key={field.name}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      field.enabled ? 'bg-card border-border' : 'bg-muted/20 border-dashed border-border/50 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveField(idx, -1)}
                        disabled={idx === 0}
                        className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                      >
                        <span className="text-[8px]">▲</span>
                      </button>
                      <button
                        onClick={() => moveField(idx, 1)}
                        disabled={idx === bookingForm.fields.length - 1}
                        className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                      >
                        <span className="text-[8px]">▼</span>
                      </button>
                    </div>
                    <button
                      onClick={() => toggleField(idx)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {field.enabled ? <ToggleRight size={20} className="text-primary" /> : <ToggleLeft size={20} />}
                    </button>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={field.label}
                        onChange={e => updateField(idx, 'label', e.target.value)}
                        className="bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:border-primary outline-none"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={field.name}
                        onChange={e => updateField(idx, 'name', e.target.value)}
                        className="bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:border-primary outline-none"
                        placeholder="field_name"
                      />
                      <select
                        value={field.type}
                        onChange={e => updateField(idx, 'type', e.target.value)}
                        className="bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:border-primary outline-none"
                      >
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
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => updateField(idx, 'required', e.target.checked)}
                        className="rounded"
                      />
                      Req
                    </label>
                    <button
                      onClick={() => removeField(idx)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Field */}
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 space-y-4">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Add Custom Field</span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Field Label (e.g. Dietary Notes, Occasion)"
                    value={newField.label}
                    onChange={e => setNewField(prev => ({
                      ...prev,
                      label: e.target.value,
                      name: prev.name || e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                    }))}
                    className="flex-1 bg-card border border-border rounded-2xl px-5 py-3 text-sm font-bold text-foreground focus:border-primary outline-none"
                  />
                  <select
                    value={newField.type}
                    onChange={e => setNewField(prev => ({ ...prev, type: e.target.value }))}
                    className="bg-card border border-border rounded-2xl px-4 py-3 text-xs font-bold text-foreground focus:border-primary outline-none"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="time">Time</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                  </select>
                  <label className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={e => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                      className="rounded"
                    />
                    Required
                  </label>
                  <button
                    onClick={addField}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:opacity-90 transition-all active:scale-95"
                  >
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

      {/* 6. Branding Tab */}
      {activeTab === 'branding' && (
        <div className="bg-card rounded-[32px] border border-border shadow-sm p-8 space-y-6">
          <div>
            <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
              <Palette size={18} className="text-primary" /> Visual Architecture & Colors
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Customize your brand color and logo displayed on customer-facing pages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Primary Brand Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.primary_color || '#11c685'}
                  onChange={e => handleSettingChange('primary_color', e.target.value)}
                  className="h-14 w-14 rounded-2xl cursor-pointer border-4 border-card overflow-hidden"
                />
                <div className="flex-1 px-5 py-3 bg-muted/30 border-2 border-border rounded-2xl font-mono text-sm font-bold text-foreground uppercase">
                  {settings.primary_color || '#11c685'}
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Brand Logo</label>
              <div className="border-2 border-dashed border-border rounded-[28px] p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                <Upload size={24} className="mx-auto text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground">Upload Logo</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Sync Note */}
      <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/20 flex items-center gap-4">
        <div className="h-10 w-10 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0">
          <Check size={20} />
        </div>
        <div>
          <div className="font-black text-foreground uppercase tracking-tight text-sm">Realtime Multi-Channel Sync</div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            Your currency, tax, and venue settings automatically sync across POS, Online Booking, Mobile Apps, and Invoices.
          </p>
        </div>
      </div>
    </div>
  )
}
