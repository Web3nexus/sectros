import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Phone, BookOpen, BarChart3, CreditCard, Loader2, AlertCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import api from '../../services/api'

export default function VoiceAgentSettings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [settings, setSettings] = useState(null)
  const [providers, setProviders] = useState([])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('voice-agent/settings')
      setSettings(res.data.settings || null)
      setProviders(res.data.providers || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.id === providerId)
    return provider?.provider_name || '—'
  }

  const LANGUAGES = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German',
    pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese',
  }

  const VOICE_STYLES = {
    friendly_receptionist: 'Friendly Receptionist',
    professional: 'Professional',
    casual: 'Casual',
    luxury: 'Luxury',
    energetic: 'Energetic',
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Loading settings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Voice Agent Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">View your current voice agent configuration and manage related settings.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/voice-agent/setup')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Settings className="w-4 h-4" /> Edit Settings
        </button>
      </div>

      {/* Current Configuration */}
      <div className="bg-white rounded-[32px] border border-border shadow-sm p-8 space-y-6">
        <h3 className="font-black text-foreground uppercase tracking-tight text-sm flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" /> Configuration Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</p>
            {settings?.is_active ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle className="w-3 h-3" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-muted-foreground border border-border text-[10px] font-black uppercase tracking-widest">
                <XCircle className="w-3 h-3" /> Inactive
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Provider</p>
            <p className="font-bold text-foreground">{getProviderName(settings?.provider_id)}</p>
          </div>
          {settings?.provider_agent_id && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Agent ID</p>
              <p className="font-bold text-foreground text-sm font-mono">{settings.provider_agent_id}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Business Name</p>
            <p className="font-bold text-foreground">{settings?.business_name || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Business Type</p>
            <p className="font-bold text-foreground">{settings?.business_type || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Business Phone</p>
            <p className="font-bold text-foreground font-mono">{settings?.business_phone_number || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Language</p>
            <p className="font-bold text-foreground">{LANGUAGES[settings?.language] || settings?.language || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Voice Style</p>
            <p className="font-bold text-foreground">{VOICE_STYLES[settings?.voice_style] || settings?.voice_style || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Booking Enabled</p>
            <p className="font-bold text-foreground">{settings?.booking_enabled ? 'Yes' : 'No'}</p>
          </div>
          {settings?.assigned_voice_phone_number && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Assigned Voice Number</p>
              <p className="font-bold text-foreground font-mono">{settings.assigned_voice_phone_number}</p>
            </div>
          )}
          {settings?.escalation_phone_number && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Escalation Number</p>
              <p className="font-bold text-foreground font-mono">{settings.escalation_phone_number}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/dashboard/voice-agent/knowledge-base')}
          className="bg-white border border-border rounded-3xl p-6 text-left hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="font-black text-foreground text-sm mb-1">Knowledge Base</h3>
          <p className="text-xs text-muted-foreground">Manage information your agent references</p>
          <div className="flex items-center gap-1 mt-3 text-[10px] font-black text-primary uppercase tracking-widest">
            Manage <ExternalLink className="w-3 h-3" />
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/voice-agent/calls')}
          className="bg-white border border-border rounded-3xl p-6 text-left hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="font-black text-foreground text-sm mb-1">Call Logs</h3>
          <p className="text-xs text-muted-foreground">Review call history and transcripts</p>
          <div className="flex items-center gap-1 mt-3 text-[10px] font-black text-primary uppercase tracking-widest">
            View <ExternalLink className="w-3 h-3" />
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/voice-agent/usage')}
          className="bg-white border border-border rounded-3xl p-6 text-left hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
            <CreditCard className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="font-black text-foreground text-sm mb-1">Usage & Billing</h3>
          <p className="text-xs text-muted-foreground">Monitor usage and manage your plan</p>
          <div className="flex items-center gap-1 mt-3 text-[10px] font-black text-primary uppercase tracking-widest">
            Manage <ExternalLink className="w-3 h-3" />
          </div>
        </button>
      </div>
    </div>
  )
}
