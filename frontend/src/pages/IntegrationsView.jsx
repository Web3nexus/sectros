import React, { useState, useEffect } from 'react'
import {Key, Plus, Copy, Check, Eye, EyeOff, X, Loader2, MoreHorizontal, Clock, Shield, AlertCircle} from 'lucide-react'
import api from '../services/api'

export function IntegrationsView() {
  const [loading, setLoading] = useState(true)
  const [keys, setKeys] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [createdKey, setCreatedKey] = useState(null)
  const [form, setForm] = useState({ name: '', scopes: ['*'], expires_at: '' })
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState({})

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      const res = await api.get('integrations')
      setKeys(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('API keys fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('integrations', {
        name: form.name,
        scopes: form.scopes,
        expires_at: form.expires_at || null
      })
      setCreatedKey(res.data)
      setShowModal(false)
      fetchKeys()
    } catch (err) {
      console.error('Failed to create API key:', err)
      alert('Failed to create API key.')
    }
  }

  const handleToggle = async (key, field) => {
    try {
      await api.put(`integrations/${key.id}`, { [field]: !key[field] })
      fetchKeys()
    } catch (err) {
      console.error('Failed to update key:', err)
    }
  }

  const handleDelete = async (key) => {
    if (!confirm(`Delete API key "${key.name}"? This cannot be undone. Any services using this key will lose access.`)) return
    try {
      await api.delete(`integrations/${key.id}`)
      fetchKeys()
    } catch (err) {
      alert('Failed to delete key.')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">Public API</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage API keys for external integrations</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all w-max active:scale-95">
          <Plus size={18} strokeWidth={3} /> Create API Key
        </button>
      </div>

      {/* Created key banner */}
      {createdKey && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600" />
            <span className="font-black text-amber-800 text-sm uppercase tracking-wider">Save this secret — it won't be shown again</span>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-amber-200 px-5 py-4">
            <code className="flex-1 text-xs font-mono font-bold text-slate-800 break-all select-all">
              {createdKey.api_key?.key}:{createdKey.plain_secret}
            </code>
            <button onClick={() => copyToClipboard(`${createdKey.api_key?.key}:${createdKey.plain_secret}`)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all shrink-0">
              {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-muted-foreground" />}
            </button>
          </div>
          <button onClick={() => setCreatedKey(null)}
            className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-slate-600 transition-all">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-[24px] border border-border shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left min-w-[800px] whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-border text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Name</th>
              <th className="px-8 py-5">Key</th>
              <th className="px-8 py-5">Scopes</th>
              <th className="px-8 py-5">Expires</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {keys.length > 0 ? keys.map(key => (
              <tr key={key.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-border flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <Key size={24} />
                    </div>
                    <div>
                      <div className="font-black text-foreground tracking-tight uppercase text-sm">{key.name}</div>
                      <div className="text-[10px] text-muted-foreground font-bold mt-0.5">
                        Last used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-border">
                      {revealed[key.id] ? key.key : `${key.key?.substring(0, 12)}...`}
                    </code>
                    <button onClick={() => setRevealed(prev => ({...prev, [key.id]: !prev[key.id]}))}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                      {revealed[key.id] ? <EyeOff size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                    </button>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(key.scopes) && key.scopes.map(s => (
                      <span key={s} className="text-[9px] font-black px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-wider border border-border">{s === '*' ? 'All' : s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Clock size={12} />
                    {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Never'}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <button onClick={() => handleToggle(key, 'is_active')}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      key.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-muted-foreground border-border'
                    }`}>
                    {key.is_active ? 'Active' : 'Revoked'}
                  </button>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => handleDelete(key)}
                    className="p-2.5 text-muted-foreground hover:text-red-500 rounded-xl hover:bg-white border border-transparent hover:border-red-200 transition-all">
                    <X size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-8 py-32 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs italic">No API keys created yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Key Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-border">
            <h3 className="font-black text-xl uppercase tracking-tighter text-slate-800 mb-6">Create API Key</h3>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Key Name</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="My Integration" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Expiry Date (optional)</label>
                <input type="date" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all shadow-sm" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-slate-600 transition-all">Cancel</button>
                <button type="submit"
                  className="flex-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98]">Create Key</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
