import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Clock, Zap, CheckCircle, Loader2, AlertCircle, ArrowRight, XCircle, BarChart3, DollarSign, Calendar } from 'lucide-react'
import api from '../../services/api'

export default function VoiceAgentUsageBilling() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [currentUsage, setCurrentUsage] = useState(null)
  const [plans, setPlans] = useState([])
  const [usageHistory, setUsageHistory] = useState([])
  const [subscribing, setSubscribing] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [billingInterval, setBillingInterval] = useState('monthly')

  useEffect(() => {
    fetchData()
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

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [currentRes, plansRes, historyRes] = await Promise.allSettled([
        api.get('voice-agent/usage/current'),
        api.get('voice-agent/plans'),
        api.get('voice-agent/usage'),
      ])

      if (currentRes.status === 'fulfilled') setCurrentUsage(currentRes.value.data)
      if (plansRes.status === 'fulfilled') {
        const plansData = plansRes.value.data?.plans || plansRes.value.data || []
        setPlans(Array.isArray(plansData) ? plansData : [])
      }
      if (historyRes.status === 'fulfilled') {
        const hData = historyRes.value.data?.data || historyRes.value.data || []
        setUsageHistory(Array.isArray(hData) ? hData : [])
      }
    } catch (err) {
      setError('Failed to load usage and billing data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId) => {
    setSubscribing(planId)
    setError(null)
    try {
      const res = await api.post('voice-agent/subscribe', {
        plan_id: planId,
        billing_interval: billingInterval,
      })
      setSuccess(res.data.message || 'Subscribed successfully')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to subscribe')
    } finally {
      setSubscribing(null)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your voice agent subscription? You will lose access at the end of the current billing period.')) return
    setCancelling(true)
    setError(null)
    try {
      const res = await api.post('voice-agent/cancel')
      setSuccess(res.data.message || 'Subscription cancelled')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0m'
    const mins = Math.floor(seconds / 60)
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Loading usage and billing...</p>
      </div>
    )
  }

  const sub = currentUsage?.subscription
  const usage = currentUsage?.usage
  const totalCallsThisMonth = currentUsage?.total_calls_this_month || 0
  const avgDuration = currentUsage?.average_call_duration_seconds || 0
  const includedMinutes = usage?.included_minutes || sub?.included_minutes_snapshot || 0
  const usedMinutes = usage?.used_minutes || 0
  const extraMinutes = usage?.extra_minutes || 0
  const estimatedCharge = usage?.estimated_extra_charge || 0
  const hasActiveSub = sub && sub.status !== 'cancelled'

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            Usage & Billing
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Monitor your voice agent usage and manage your subscription.</p>
        </div>
        {hasActiveSub && (
          <div className="flex items-center gap-3 bg-white border border-border p-3 rounded-2xl shadow-sm">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                billingInterval === 'monthly' ? 'bg-slate-900 text-white shadow-lg' : 'text-muted-foreground hover:text-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                billingInterval === 'yearly' ? 'bg-slate-900 text-white shadow-lg' : 'text-muted-foreground hover:text-slate-600'
              }`}
            >
              Yearly
            </button>
          </div>
        )}
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

      {/* Current Month Usage */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-4">
            <BarChart3 className="w-3 h-3" /> Current Month Usage
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Used / Included</p>
              <p className="text-3xl font-black mt-1">{usedMinutes} <span className="text-lg text-blue-200">/ {includedMinutes} min</span></p>
              {includedMinutes > 0 && (
                <div className="mt-2 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-300 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((usedMinutes / includedMinutes) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
            <div>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Extra Minutes</p>
              <p className="text-3xl font-black mt-1">{extraMinutes}</p>
            </div>
            <div>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Estimated Extra Charge</p>
              <p className="text-3xl font-black mt-1">${Number(estimatedCharge).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Avg Call Duration</p>
              <p className="text-3xl font-black mt-1">{formatDuration(avgDuration)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl">
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Total Calls This Month</p>
              <p className="text-2xl font-black mt-1">{totalCallsThisMonth}</p>
            </div>
          </div>
        </div>
        <CreditCard className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
      </div>

      {/* Active Subscription */}
      {hasActiveSub && (
        <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                Active Subscription
              </div>
              <h2 className="text-2xl font-black text-foreground">{sub.plan?.plan_name || 'Voice Agent Plan'}</h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                  {sub.status}
                </span>
                <span className="text-muted-foreground">{sub.billing_interval} billing</span>
              </div>
              {sub.current_period_start && (
                <p className="text-xs text-muted-foreground">
                  Period: {new Date(sub.current_period_start).toLocaleDateString()} — {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'Ongoing'}
                </p>
              )}
              {sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date() && (
                <p className="text-xs text-amber-600 font-bold">
                  Trial ends {new Date(sub.trial_ends_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {/* Plan Selection */}
      <div>
        <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" /> Choose a Plan
        </h2>

        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const price = billingInterval === 'yearly' ? plan.yearly_price : plan.monthly_price
              const includedMin = billingInterval === 'yearly' ? plan.included_minutes_yearly : plan.included_minutes_monthly
              const isCurrentPlan = sub?.plan_id === plan.id

              return (
                <div key={plan.id} className={`bg-white border-2 rounded-3xl p-8 flex flex-col transition-all group relative shadow-sm ${
                  isCurrentPlan ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-border hover:border-slate-300'
                }`}>
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-black text-foreground mb-2">{plan.plan_name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground">${Number(price).toFixed(2)}</span>
                      <span className="text-muted-foreground text-sm">/{billingInterval === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">What's included</p>
                    <ul className="space-y-3">
                      {plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features)
                        ? Object.entries(plan.features)
                            .filter(([, v]) => v === true)
                            .map(([key]) => (
                              <li key={key} className="flex items-center gap-3 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                              </li>
                            ))
                        : Array.isArray(plan.features) && plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                            </li>
                          ))
                      }
                      <li className="flex items-center gap-3 text-sm font-bold text-primary pt-2 border-t border-border mt-2">
                        <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{includedMin != null ? `${includedMin.toLocaleString()} minutes/mo` : 'Custom minutes'}</span>
                      </li>
                      {plan.extra_minute_rate > 0 && (
                        <li className="flex items-center gap-3 text-sm font-bold text-primary">
                          <DollarSign className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>${Number(plan.extra_minute_rate).toFixed(4)}/extra minute</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan || subscribing === plan.id}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-slate-100 text-muted-foreground cursor-default'
                        : 'bg-slate-100 text-foreground hover:bg-primary hover:text-white active:scale-95'
                    }`}
                  >
                    {subscribing === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        Subscribe <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-border rounded-3xl p-12 text-center">
            <Zap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-black text-muted-foreground">No plans available</p>
            <p className="text-sm text-muted-foreground mt-1">Voice agent plans are not configured yet. Contact support for more information.</p>
          </div>
        )}
      </div>

      {/* Usage History */}
      {usageHistory.length > 0 && (
        <div>
          <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" /> Usage History
          </h2>
          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Billing Month</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Included</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Used</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Remaining</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Extra Min</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Extra Charge</th>
                </tr>
              </thead>
              <tbody>
                {usageHistory.map((record) => (
                  <tr key={record.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-foreground">{record.billing_month}</td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-foreground">{record.included_minutes || 0}</td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-foreground">{record.used_minutes || 0}</td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-foreground">{record.remaining_minutes || 0}</td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-foreground">{record.extra_minutes || 0}</td>
                    <td className="px-6 py-4 text-right font-bold text-sm text-foreground">${Number(record.estimated_extra_charge || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
