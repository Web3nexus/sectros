import React, { useState, useEffect } from 'react'
import { Phone, Search, X, Loader2, AlertCircle, ChevronLeft, ChevronRight, Eye, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../services/api'

function VoiceAgentCallDetailModal({ call, onClose }) {
  const [showRawPayload, setShowRawPayload] = useState(false)

  if (!call) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="font-black text-foreground text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Call Detail
          </h2>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Call Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer</p>
              <p className="font-bold text-foreground mt-1">{call.customer_name || 'Unknown'}</p>
              {call.customer_phone_number && (
                <p className="text-sm text-muted-foreground font-mono">{call.customer_phone_number}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</p>
              <p className="font-bold text-foreground mt-1">
                {call.call_duration_seconds ? `${Math.floor(call.call_duration_seconds / 60)}m ${call.call_duration_seconds % 60}s` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Direction</p>
              <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                call.call_direction === 'inbound'
                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                  : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
              }`}>
                {call.call_direction || '—'}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
              <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                call.call_status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : call.call_status === 'in_progress' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : call.call_status === 'failed' ? 'bg-red-500/10 text-red-600 border-red-500/20'
                : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
              }`}>
                {call.call_status?.replace(/_/g, ' ') || '—'}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Outcome</p>
              <p className="font-bold text-foreground mt-1">{call.outcome || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date & Time</p>
              <p className="font-bold text-foreground mt-1 text-sm">
                {call.call_started_at ? new Date(call.call_started_at).toLocaleString() : '—'}
              </p>
            </div>
          </div>

          {/* Summary */}
          {call.summary && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Summary</p>
              <div className="bg-slate-50 rounded-2xl p-4 border border-border">
                <p className="text-sm text-foreground">{call.summary}</p>
              </div>
            </div>
          )}

          {/* Transcript */}
          {call.transcript && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Transcript</p>
              <pre className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-xs font-mono leading-relaxed overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
                {call.transcript}
              </pre>
            </div>
          )}

          {/* Recording */}
          {call.recording_url && call.recording_url.startsWith('http') && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Recording</p>
              <audio controls src={call.recording_url} className="w-full rounded-xl">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Raw Provider Payload */}
          {call.raw_provider_payload && (
            <div>
              <button
                onClick={() => setShowRawPayload(!showRawPayload)}
                className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
              >
                {showRawPayload ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Raw Provider Payload
              </button>
              {showRawPayload && (
                <pre className="mt-2 bg-slate-900 text-green-400 rounded-2xl p-4 text-xs font-mono leading-relaxed overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {typeof call.raw_provider_payload === 'string'
                    ? call.raw_provider_payload
                    : JSON.stringify(call.raw_provider_payload, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VoiceAgentCallLogs() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [calls, setCalls] = useState([])
  const [pagination, setPagination] = useState(null)
  const [selectedCall, setSelectedCall] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchCalls()
  }, [page, statusFilter, dateFrom, dateTo])

  const fetchCalls = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page }
      if (search.trim()) params.search = search.trim()
      if (statusFilter) params.status = statusFilter
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const res = await api.get('voice-agent/calls', { params })
      const data = res.data?.data || res.data || []
      setCalls(Array.isArray(data) ? data : [])
      setPagination(res.data?.meta || res.data?.pagination || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load call logs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchCalls()
  }

  const handleViewCall = async (call) => {
    try {
      const res = await api.get(`voice-agent/calls/${call.id}`)
      setSelectedCall(res.data?.call || res.data)
    } catch (err) {
      setError('Failed to load call details')
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

  const directionBadge = (dir) => {
    if (dir === 'inbound') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-blue-500/10 text-blue-600 border-blue-500/20">
          Inbound
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-purple-500/10 text-purple-600 border-purple-500/20">
        Outbound
      </span>
    )
  }

  const totalPages = pagination?.last_page || pagination?.total_pages || 1

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
          <Phone className="w-8 h-8 text-primary" />
          Call Logs
        </h1>
        <p className="text-muted-foreground text-sm mt-1">View and analyze all voice agent calls.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customer, phone, or summary..."
              className="w-full bg-slate-50 border-2 border-border rounded-2xl pl-10 pr-4 py-3 font-bold text-foreground focus:border-blue-600 transition-all text-sm" />
          </div>
          <select value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="bg-slate-50 border-2 border-border rounded-2xl px-4 py-3 font-bold text-foreground focus:border-blue-600 transition-all text-sm"
          >
            <option value="" className="bg-white">All Statuses</option>
            <option value="completed" className="bg-white">Completed</option>
            <option value="in_progress" className="bg-white">In Progress</option>
            <option value="failed" className="bg-white">Failed</option>
            <option value="missed" className="bg-white">Missed</option>
            <option value="busy" className="bg-white">Busy</option>
            <option value="no_answer" className="bg-white">No Answer</option>
          </select>
          <input type="date" value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1) }}
            className="bg-slate-50 border-2 border-border rounded-2xl px-4 py-3 font-bold text-foreground focus:border-blue-600 transition-all text-sm" />
          <input type="date" value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1) }}
            className="bg-slate-50 border-2 border-border rounded-2xl px-4 py-3 font-bold text-foreground focus:border-blue-600 transition-all text-sm" />
          <button type="submit"
            className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95">
            Search
          </button>
        </form>
      </div>

      {/* Calls Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="font-medium animate-pulse">Loading call logs...</p>
        </div>
      ) : calls.length > 0 ? (
        <>
          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Direction</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Outcome</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-foreground">{call.customer_name || 'Unknown'}</div>
                      {call.customer_phone_number && (
                        <div className="text-xs text-muted-foreground font-mono">{call.customer_phone_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">{directionBadge(call.call_direction)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">{formatDuration(call.call_duration_seconds)}</td>
                    <td className="px-6 py-4">{statusBadge(call.call_status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-foreground">{call.outcome || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(call.call_started_at)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewCall(call)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 text-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl bg-white border border-border hover:bg-slate-50 transition-all disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl bg-white border border-border hover:bg-slate-50 transition-all disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-border rounded-3xl p-12 text-center shadow-sm">
          <Phone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-black text-muted-foreground">No calls found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search || statusFilter || dateFrom || dateTo
              ? 'Try adjusting your search filters.'
              : 'No calls have been logged yet.'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCall && (
        <VoiceAgentCallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  )
}
