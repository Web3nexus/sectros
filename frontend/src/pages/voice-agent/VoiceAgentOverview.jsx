import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight, Zap, Calendar, Activity, CreditCard, Smartphone, Copy, DollarSign, Plus, BookOpen } from 'lucide-react'
import api from '../../services/api'

export default function VoiceAgentOverview() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const [creditAmount, setCreditAmount] = useState(100)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('voice-agent/overview')
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load voice agent overview')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusBadge = (status) => {
    const statusColors = {
      completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      in_progress: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      failed: 'bg-red-500/10 text-red-600 border-red-500/20',
      missed: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
      busy: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      no_answer: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    }
    const color = statusColors[status] || 'bg-slate-500/10 text-slate-600 border-slate-500/20'
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${color}`}>
        {status?.replace(/_/g, ' ')}
      </span>
    )
  }

  const handleCopy = (num) => {
    if (!num) return
    navigator.clipboard.writeText(num)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePurchaseCredits = async () => {
    setPurchasing(true)
    try {
      await api.post('voice-agent/purchase-credits', { amount: creditAmount })
      setShowBuyCredits(false)
      fetchOverview()
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Loading voice agent dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      </div>
    )
  }

  const { settings, subscription, total_calls, today_calls, ai_reservations, recent_calls, recent_ai_reservations, usage, phone_number, credits } = data || {}
  const isActive = settings?.is_active
  const includedMinutes = usage?.included_minutes || subscription?.included_minutes_snapshot || 0
  const usedMinutes = usage?.used_minutes || 0
  const hasSubscription = !!subscription && subscription.status !== 'cancelled'

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Phone className="w-8 h-8 text-primary" />
            Voice Agent
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Monitor and manage your AI voice agent.</p>
        </div>
      </div>

      {/* Active Status & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isActive ? 'bg-emerald-500/10' : 'bg-slate-100'}`}>
            <Activity className={`w-6 h-6 ${isActive ? 'text-emerald-500' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="text-sm font-black text-foreground">Agent Status</p>
            <div className="flex items-center gap-2 mt-1">
              {isActive ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-muted-foreground border border-border text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Inactive
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => navigate('/dashboard/voice-agent/setup')}
            className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
            Configure Agent
          </button>
          <button onClick={() => navigate('/dashboard/voice-agent/calls')}
            className="px-6 py-3 bg-slate-100 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
            View Call Logs
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Calls</p>
          </div>
          <p className="text-4xl font-black text-foreground">{total_calls || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{today_calls || 0} today</p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">AI Reservations</p>
          </div>
          <p className="text-4xl font-black text-foreground">{ai_reservations || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Created by AI voice agent</p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Voice Credits</p>
          </div>
          <p className="text-4xl font-black text-foreground">{credits?.remaining ?? 0}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">of {credits?.total ?? 0} credits remaining</span>
            {(credits?.total ?? 0) > 0 && (
              <span className="text-[10px] font-black text-muted-foreground">
                ({Math.round(((credits?.total - credits?.remaining) / credits?.total) * 100)}% used)
              </span>
            )}
          </div>
          {(credits?.total ?? 0) > 0 && (
            <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                style={{ width: `${Math.min((((credits?.total - credits?.remaining) / credits?.total) * 100), 100)}%` }} />
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Minutes Used</p>
          </div>
          <p className="text-4xl font-black text-foreground">{usedMinutes}</p>
          <p className="text-xs text-muted-foreground mt-1">this month</p>
        </div>
      </div>

      {/* Phone Number + Credits Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone Number Card */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Assigned AI Phone Number</p>
          </div>
          {phone_number ? (
            <div>
              <p className="text-2xl font-black text-foreground font-mono tracking-tight">{phone_number.phone_number}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  phone_number.status === 'active' || phone_number.status === 'assigned'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                }`}>
                  {phone_number.status}
                </span>
                <button onClick={() => handleCopy(phone_number.phone_number)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <button onClick={() => navigate('/dashboard/voice-agent/phone-number')}
                className="mt-4 text-xs font-black text-primary uppercase tracking-widest hover:underline">
                View Details & Forwarding Instructions →
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-muted-foreground">Not Assigned</p>
              <p className="text-xs text-muted-foreground mt-1">Contact admin or activate agent</p>
            </div>
          )}
        </div>

        {/* Credits Card */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Credit Balance</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-foreground">{credits?.remaining ?? 0} credits</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>{credits?.used ?? 0} used</span>
                <span>·</span>
                <span>{credits?.topup ?? 0} from top-ups</span>
              </div>
            </div>
            <button onClick={() => setShowBuyCredits(true)}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
              <Plus className="w-4 h-4" /> Buy Credits
            </button>
          </div>
        </div>
      </div>

      {/* No Credits Warning */}
      {(credits?.total ?? 0) === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black text-foreground">No Voice Credits</h3>
              <p className="text-sm text-muted-foreground mt-1">You need voice credits to use the AI voice agent. Each minute of a call consumes one credit. Purchase credits to get started.</p>
              <button onClick={() => setShowBuyCredits(true)}
                className="mt-3 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all">
                Purchase Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Calls */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Phone className="w-6 h-6 text-primary" /> Recent Calls
          </h2>
          <button onClick={() => navigate('/dashboard/voice-agent/calls')}
            className="text-xs font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recent_calls && recent_calls.length > 0 ? (
          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Outcome</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent_calls.map((call) => (
                  <tr key={call.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-foreground">{call.customer_name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground font-mono">{call.customer_phone_number || '—'}</div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(call.call_status)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">{formatDuration(call.call_duration_seconds)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{call.outcome || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs text-muted-foreground">{formatDate(call.call_started_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-3xl p-12 text-center shadow-sm">
            <Phone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-black text-muted-foreground">No calls yet</p>
            <p className="text-sm text-muted-foreground mt-1">Once your voice agent starts receiving calls, they will appear here.</p>
          </div>
        )}
      </div>

      {/* Recent AI Reservations */}
      {recent_ai_reservations && recent_ai_reservations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" /> Recent AI-Created Reservations
            </h2>
            <button onClick={() => navigate('/dashboard/reservations')}
              className="text-xs font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Guests</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Created</th>
                </tr>
              </thead>
              <tbody>
                {recent_ai_reservations.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-foreground">{r.customer_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{r.customer_phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                      {new Date(r.reservation_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{r.party_size}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        r.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : r.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : 'bg-slate-100 text-muted-foreground border-border'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Buy Credits Modal */}
      {showBuyCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowBuyCredits(null)} />
          <div className="relative bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-6">
            <h3 className="text-lg font-black text-foreground">Purchase Voice Credits</h3>
            <p className="text-sm text-muted-foreground">Each credit equals one minute of AI voice agent call time.</p>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Number of Credits</label>
              <div className="flex gap-2">
                {[50, 100, 500, 1000].map(amt => (
                  <button key={amt} onClick={() => setCreditAmount(amt)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm border transition-all ${
                      creditAmount === amt ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border text-foreground hover:bg-muted/80'
                    }`}>
                    {amt}
                  </button>
                ))}
              </div>
              <input type="number" value={creditAmount} onChange={e => setCreditAmount(Number(e.target.value))}
                min={1} className="mt-3 w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowBuyCredits(null)}
                className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-all">
                Cancel
              </button>
              <button onClick={handlePurchaseCredits} disabled={purchasing || creditAmount < 1}
                className="flex-1 py-3 rounded-xl bg-primary hover:brightness-110 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50">
                {purchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                {purchasing ? 'Purchasing...' : `Buy ${creditAmount} Credits`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
