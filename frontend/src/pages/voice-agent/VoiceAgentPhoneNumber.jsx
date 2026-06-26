import React, { useState, useEffect } from 'react'
import { Phone, Copy, CheckCircle, AlertCircle, Loader2, Play, ArrowLeftRight, PhoneForwarded, Smartphone, Info } from 'lucide-react'
import api from '../../services/api'

export default function VoiceAgentPhoneNumber() {
  const [loading, setLoading] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState(null)
  const [settings, setSettings] = useState(null)
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPhoneNumber()
  }, [])

  const fetchPhoneNumber = async () => {
    setLoading(true)
    try {
      const res = await api.get('voice-agent/phone-number')
      setPhoneNumber(res.data.phone_number)
      setSettings(res.data.settings)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load phone number info')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!phoneNumber?.phone_number) return
    navigator.clipboard.writeText(phoneNumber.phone_number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTestCall = async () => {
    if (!phoneNumber?.phone_number) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await api.post('voice-agent/test-call', { phone_number: phoneNumber.phone_number })
      setTestResult({ type: 'success', message: res.data.message || 'Test call initiated' })
    } catch (err) {
      setTestResult({ type: 'error', message: err.response?.data?.message || 'Test call failed' })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Loading phone number...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
          <Phone className="w-8 h-8 text-primary" />
          AI Phone Number
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your assigned AI voice phone number and forwarding instructions.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Assigned Number Card */}
      <div className="bg-white rounded-[32px] border border-border shadow-sm p-8">
        {phoneNumber ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Assigned AI Phone Number</p>
                  <p className="text-3xl font-black text-foreground tracking-tight">{phoneNumber.phone_number}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      phoneNumber.status === 'active' || phoneNumber.status === 'assigned'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                    }`}>
                      {phoneNumber.status === 'active' || phoneNumber.status === 'assigned' ? 'Active' : phoneNumber.status}
                    </span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {phoneNumber.provider === 'elevenlabs' ? 'ElevenLabs' : phoneNumber.provider}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Number'}
                </button>
                <button
                  onClick={handleTestCall}
                  disabled={testing}
                  className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {testing ? 'Calling...' : 'Test Call'}
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 font-medium ${
                testResult.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600'
                  : 'bg-red-500/10 border border-red-500/20 text-red-500'
              }`}>
                {testResult.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                {testResult.message}
              </div>
            )}

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-foreground text-sm uppercase tracking-widest">Forwarding Instructions</h3>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  To use the AI Voice Agent with your existing restaurant number, forward your business calls to this assigned AI number.
                </p>
                <div className="bg-white/50 rounded-xl p-4 border border-border">
                  <p className="font-bold text-foreground mb-2">How to forward calls:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Contact your current phone service provider (e.g., Twilio, Vonage, local carrier)</li>
                    <li>Ask them to forward calls from your business phone number to:</li>
                    <div className="flex items-center gap-3 mt-2 mb-2 ml-6 p-3 bg-slate-100 rounded-xl">
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="text-lg font-black text-foreground tracking-tight">{phoneNumber.phone_number}</span>
                      <button onClick={handleCopy} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                        {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                    <li>The AI will answer calls, take reservation requests, and save bookings to your dashboard</li>
                  </ol>
                </div>
                <p className="text-xs italic">
                  Note: The AI agent must be activated in Settings for calls to be answered. Test the agent by calling the number directly or using the Test Call button above.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="p-4 rounded-2xl bg-muted inline-flex mb-4">
              <Phone className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Phone Number Assigned</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              You don't have an AI phone number yet. Contact your administrator to assign one, or activate your voice agent to get one automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
