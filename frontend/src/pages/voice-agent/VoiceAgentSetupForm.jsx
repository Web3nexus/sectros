import React, { useState, useEffect, useCallback } from 'react'
import { Save, RefreshCw, Phone, Loader2, AlertCircle, CheckCircle, ChevronDown, Play, ToggleLeft, ToggleRight, Headphones } from 'lucide-react'
import api from '../../services/api'

export default function VoiceAgentSetupForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [providers, setProviders] = useState([])
  const [voices, setVoices] = useState([])
  const [voicesLoading, setVoicesLoading] = useState(false)
  const [showTestCall, setShowTestCall] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [form, setForm] = useState({
    provider_id: '',
    business_name: '',
    business_type: '',
    business_phone_number: '',
    assigned_voice_phone_number: '',
    escalation_phone_number: '',
    language: 'en',
    voice_style: 'friendly_receptionist',
    voice_id: '',
    opening_hours: '',
    booking_enabled: false,
    booking_rules: '',
    max_party_size: 10,
    reservation_duration_minutes: 60,
    advance_booking_days: 30,
    off_hours_behavior: 'pending_review',
    fallback_message: '',
    system_prompt: '',
    is_active: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await api.get('voice-agent/settings')
      const s = res.data.settings || {}
      setProviders(res.data.providers || [])
      setForm({
        provider_id: s.provider_id || '',
        business_name: s.business_name || '',
        business_type: s.business_type || '',
        business_phone_number: s.business_phone_number || '',
        assigned_voice_phone_number: s.assigned_voice_phone_number || '',
        escalation_phone_number: s.escalation_phone_number || '',
        language: s.language || 'en',
        voice_style: s.voice_style || 'friendly_receptionist',
        voice_id: s.voice_id || '',
        opening_hours: s.opening_hours ? (typeof s.opening_hours === 'string' ? s.opening_hours : JSON.stringify(s.opening_hours, null, 2)) : '',
        booking_enabled: s.booking_enabled || false,
        booking_rules: s.booking_rules ? (typeof s.booking_rules === 'string' ? s.booking_rules : JSON.stringify(s.booking_rules, null, 2)) : '',
        max_party_size: s.max_party_size ?? 10,
        reservation_duration_minutes: s.reservation_duration_minutes ?? 60,
        advance_booking_days: s.advance_booking_days ?? 30,
        off_hours_behavior: s.off_hours_behavior || 'pending_review',
        fallback_message: s.fallback_message || '',
        system_prompt: s.system_prompt || '',
        is_active: s.is_active || false,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchVoices = useCallback(async () => {
    setVoicesLoading(true)
    try {
      const res = await api.get('voice-agent/voices')
      if (res.data.success && res.data.voices) {
        setVoices(res.data.voices)
      }
    } catch {
      setVoices([])
    } finally {
      setVoicesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (form.provider_id) {
      const provider = providers.find(p => p.id === Number(form.provider_id))
      if (provider && provider.provider_key === 'elevenlabs') {
        fetchVoices()
      } else {
        setVoices([])
      }
    } else {
      setVoices([])
    }
  }, [form.provider_id, providers, fetchVoices])

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const parseJsonField = (value) => {
    if (!value || !value.trim()) return null
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        ...form,
        provider_id: form.provider_id || null,
        opening_hours: parseJsonField(form.opening_hours),
        booking_rules: parseJsonField(form.booking_rules),
        booking_enabled: Boolean(form.booking_enabled),
        is_active: Boolean(form.is_active),
      }
      const res = await api.post('voice-agent/settings', payload)
      setForm(prev => ({
        ...prev,
        ...res.data.settings,
        opening_hours: res.data.settings.opening_hours ? (typeof res.data.settings.opening_hours === 'string' ? res.data.settings.opening_hours : JSON.stringify(res.data.settings.opening_hours, null, 2)) : '',
        booking_rules: res.data.settings.booking_rules ? (typeof res.data.settings.booking_rules === 'string' ? res.data.settings.booking_rules : JSON.stringify(res.data.settings.booking_rules, null, 2)) : '',
      }))
      setSuccess('Settings saved successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await api.post('voice-agent/sync')
      setSuccess(res.data.message || 'Agent synced successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync agent')
    } finally {
      setSyncing(false)
    }
  }

  const handleTestCall = async () => {
    if (!testPhone.trim()) return
    setTesting(true)
    setError(null)
    setTestResult(null)
    try {
      const res = await api.post('voice-agent/test-call', { phone_number: testPhone })
      setTestResult(res.data.message || 'Test call initiated')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate test call')
    } finally {
      setTesting(false)
    }
  }

  const handleToggleActive = async () => {
    try {
      const res = await api.post('voice-agent/toggle', { is_active: !form.is_active })
      setForm(prev => ({ ...prev, is_active: res.data.settings?.is_active ?? !prev.is_active }))
      setSuccess(res.data.message || 'Toggled successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle')
    }
  }

  const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
  ]

  const VOICE_STYLES = [
    { value: 'friendly_receptionist', label: 'Friendly Receptionist' },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'energetic', label: 'Energetic' },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Loading voice agent settings...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Phone className="w-8 h-8 text-primary" />
            Voice Agent Setup
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Configure your AI voice agent settings and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleToggleActive}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
              form.is_active
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-100 text-muted-foreground hover:text-slate-600'
            }`}
          >
            {form.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {form.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Provider Selection */}
      <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-6">
        <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" /> Provider
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Voice Provider</label>
            <select
              value={form.provider_id}
              onChange={e => handleChange('provider_id', e.target.value)}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all appearance-none"
            >
              <option value="" className="bg-white">Select Provider</option>
              {providers.map(p => (
                <option key={p.id} value={p.id} className="bg-white">{p.provider_name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSync}
              disabled={syncing || !form.provider_id}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Agent'}
            </button>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-6">
        <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" /> Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Business Name</label>
            <input type="text" value={form.business_name}
              onChange={e => handleChange('business_name', e.target.value)}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all"
              placeholder="Your Business Name" />
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Business Type</label>
            <input type="text" value={form.business_type}
              onChange={e => handleChange('business_type', e.target.value)}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all"
              placeholder="restaurant, salon, clinic, etc." />
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Business Phone Number</label>
            <input type="text" value={form.business_phone_number}
              onChange={e => handleChange('business_phone_number', e.target.value)}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all font-mono"
              placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Assigned Voice Number</label>
            <input type="text" value={form.assigned_voice_phone_number}
              onChange={e => handleChange('assigned_voice_phone_number', e.target.value)}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all font-mono"
              placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Escalation Phone Number</label>
            <input type="text" value={form.escalation_phone_number}
              onChange={e => handleChange('escalation_phone_number', e.target.value)}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all font-mono"
              placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </div>

      {/* Voice Configuration */}
      <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-6">
        <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" /> Voice Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Language</label>
            <select
              value={form.language}
              onChange={e => handleChange('language', e.target.value)}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all"
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value} className="bg-white">{l.label}</option>
              ))}
            </select>
          </div>
          {voices.length > 0 ? (
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Voice</label>
              <div className="relative">
                <select
                  value={form.voice_id}
                  onChange={e => handleChange('voice_id', e.target.value)}
                  className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all appearance-none"
                >
                  <option value="" className="bg-white">Default Voice</option>
                  {voices.map(v => (
                    <option key={v.voice_id} value={v.voice_id} className="bg-white">
                      {v.name}{v.category === 'generated' ? ' (Generated)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Voice Style</label>
              <select
                value={form.voice_style}
                onChange={e => handleChange('voice_style', e.target.value)}
                className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all"
              >
                {VOICE_STYLES.map(s => (
                  <option key={s.value} value={s.value} className="bg-white">{s.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Booking & Advanced */}
      <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-6">
        <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" /> Booking & Advanced
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Booking Enabled</label>
            <button
              onClick={() => handleChange('booking_enabled', !form.booking_enabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.booking_enabled ? 'bg-blue-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.booking_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Opening Hours (JSON)</label>
            <textarea value={form.opening_hours}
              onChange={e => handleChange('opening_hours', e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-mono text-xs font-bold text-foreground focus:border-blue-600 transition-all"
              placeholder='{"monday":{"open":"09:00","close":"17:00"}}' />
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Booking Rules (JSON)</label>
            <textarea value={form.booking_rules}
              onChange={e => handleChange('booking_rules', e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-mono text-xs font-bold text-foreground focus:border-blue-600 transition-all"
              placeholder='{"min_notice_hours":2,"max_party_size":10}' />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Max Party Size</label>
            <input type="number" value={form.max_party_size}
              onChange={e => handleChange('max_party_size', Number(e.target.value))}
              min={1} max={100}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Reservation Duration (min)</label>
            <input type="number" value={form.reservation_duration_minutes}
              onChange={e => handleChange('reservation_duration_minutes', Number(e.target.value))}
              min={15} max={480} step={15}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Advance Booking (days)</label>
            <input type="number" value={form.advance_booking_days}
              onChange={e => handleChange('advance_booking_days', Number(e.target.value))}
              min={0} max={365}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Off-Hours Behavior</label>
            <select value={form.off_hours_behavior}
              onChange={e => handleChange('off_hours_behavior', e.target.value)}
              className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all">
              <option value="pending_review" className="bg-white">Take Message (Review Later)</option>
              <option value="allow_confirmed" className="bg-white">Allow Confirmed Booking</option>
              <option value="take_message" className="bg-white">Take Message Only</option>
              <option value="transfer_human" className="bg-white">Transfer to Human</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Fallback Message</label>
          <textarea value={form.fallback_message}
            onChange={e => handleChange('fallback_message', e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-mono text-xs font-bold text-foreground focus:border-blue-600 transition-all"
            placeholder="I'm sorry, I couldn't understand your request. Please try again or call back later." />
        </div>
        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">System Prompt</label>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-black text-primary">
                {({ restaurant: 'L', cafe: 'M', salon: 'S', spa: 'E', hotel: 'J', fitness: 'A', clinic: 'R' })[form.business_type] || '?'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {({ restaurant: 'Lucia', cafe: 'Maya', salon: 'Sophie', spa: 'Elena', hotel: 'James', fitness: 'Alex', clinic: 'Rachel' })[form.business_type] || 'Custom'} Profile
              </p>
              <p className="text-[10px] text-muted-foreground">
                {({ restaurant: 'Restaurant Receptionist', cafe: 'Cafe Barista & Host', salon: 'Salon Receptionist & Booking Coordinator', spa: 'Spa Concierge & Wellness Coordinator', hotel: 'Hotel Concierge & Reservation Specialist', fitness: 'Fitness Center Receptionist & Membership Coordinator', clinic: 'Medical Clinic Receptionist & Appointment Coordinator' })[form.business_type] || 'Custom voice agent'}
              </p>
            </div>
          </div>
          <textarea value={form.system_prompt}
            onChange={e => handleChange('system_prompt', e.target.value)}
            rows={6}
            className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-mono text-xs font-bold text-foreground focus:border-blue-600 transition-all"
            placeholder="You are a helpful receptionist for a business..." />
        </div>
      </div>

      {/* Test Call */}
      <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-6">
        <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" /> Test Call
        </h3>
        {!showTestCall ? (
          <button
            onClick={() => setShowTestCall(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
          >
            <Play className="w-4 h-4" /> Initiate Test Call
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Phone Number</label>
                <input type="text" value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all font-mono"
                  placeholder="+1 (555) 000-0000" />
              </div>
              <button
                onClick={handleTestCall}
                disabled={testing || !testPhone.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                {testing ? 'Calling...' : 'Call'}
              </button>
            </div>
            {testResult && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 font-medium">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {testResult}
              </div>
            )}
            <button
              onClick={() => { setShowTestCall(false); setTestPhone(''); setTestResult(null) }}
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
