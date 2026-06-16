import React, { useState, useEffect } from 'react'
import {Plus, Users, Clock, Phone, User, Bell, Check, X, Loader2, MoreHorizontal, ChevronRight, ChevronLeft, UserPlus} from 'lucide-react'
import api from '../services/api'

export function WaitlistView() {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', party_size: 2, notes: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const fetchWaitlist = async () => {
    try {
      const res = await api.get('waitlist')
      setEntries(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Waitlist fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('waitlist', form)
      setShowModal(false)
      setForm({ customer_name: '', customer_phone: '', party_size: 2, notes: '' })
      fetchWaitlist()
    } catch (err) {
      console.error('Failed to add:', err)
      alert('Failed to add to waitlist.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async (id, action) => {
    try {
      await api.post(`waitlist/${id}/${action}`)
      fetchWaitlist()
    } catch (err) {
      console.error(`Failed to ${action}:`, err)
    }
  }

  const waiting = entries.filter(e => e.status === 'waiting')
  const notified = entries.filter(e => e.status === 'notified')
  const seated = entries.filter(e => e.status === 'seated')

  const estimatedWait = waiting.length > 0 ? `${Math.max(waiting.length * 10, 15)}-${Math.max(waiting.length * 15, 25)} min` : '—'

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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">Waitlist Pro</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage guest waitlist with automated SMS notifications</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all w-max active:scale-95">
          <UserPlus size={18} strokeWidth={3} /> Add Guest
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Waiting</div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">{waiting.length}</div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Notified</div>
          <div className="text-2xl font-black text-blue-600 tracking-tight">{notified.length}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Seated</div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">{seated.length}</div>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Est. Wait</div>
          <div className="text-2xl font-black text-purple-600 tracking-tight text-base">{estimatedWait}</div>
        </div>
      </div>

      {/* Waiting List */}
      <div className="bg-white rounded-[24px] border border-border shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left min-w-[800px] whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-border text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Guest</th>
              <th className="px-8 py-5">Party</th>
              <th className="px-8 py-5">Contact</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Wait Time</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.length > 0 ? entries.map(entry => (
              <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-border flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <User size={24} />
                    </div>
                    <div>
                      <div className="font-black text-foreground tracking-tight uppercase text-sm">{entry.customer_name}</div>
                      {entry.notes && (
                        <div className="text-[10px] text-muted-foreground italic mt-0.5 max-w-[200px] truncate">{entry.notes}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-slate-600 font-black text-sm">
                    <Users size={16} className="text-slate-400" />
                    {entry.party_size}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] uppercase tracking-tight">
                    <Phone size={12} className="text-blue-500" /> {entry.customer_phone}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    entry.status === 'waiting' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    entry.status === 'notified' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    entry.status === 'seated' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-slate-50 text-muted-foreground border-border'
                  }`}>{entry.status}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Clock size={12} />
                    {entry.notified_at 
                      ? new Date(entry.notified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : entry.created_at 
                        ? `${Math.floor((Date.now() - new Date(entry.created_at).getTime()) / 60000)}m`
                        : '—'}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {entry.status === 'waiting' && (
                      <>
                        <button onClick={() => handleAction(entry.id, 'notify')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Notify">
                          <Bell size={16} />
                        </button>
                        <button onClick={() => handleAction(entry.id, 'seat')}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Seat">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleAction(entry.id, 'cancel')}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all" title="Cancel">
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {entry.status === 'notified' && (
                      <button onClick={() => handleAction(entry.id, 'seat')}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Seat">
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-8 py-32 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs italic">No guests on the waitlist.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Guest Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-border">
            <h3 className="font-black text-xl uppercase tracking-tighter text-slate-800 mb-6">Add to Waitlist</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Guest Name</label>
                <input required type="text" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="Guest Name" />
              </div>
              <div className="flex gap-4">
                <div className="flex-[2]">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                  <input required type="tel" value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="+1 555-0123" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Party Size</label>
                  <input required type="number" min="1" value={form.party_size} onChange={e => setForm({...form, party_size: parseInt(e.target.value) || 1})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm resize-none"
                  rows={2} placeholder="Allergies, preferences..." />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-slate-600 transition-all">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add to Waitlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
