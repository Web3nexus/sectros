import React, { useState, useEffect } from 'react'
import {Plus, Users, Mail, User, Store, MoreHorizontal, Loader2, Check, X} from 'lucide-react'
import api from '../services/api'

export function FranchiseView() {
  const [loading, setLoading] = useState(true)
  const [franchises, setFranchises] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', owner_name: '', contact_email: '', is_active: true })

  useEffect(() => {
    fetchFranchises()
  }, [])

  const fetchFranchises = async () => {
    try {
      const res = await api.get('franchises')
      setFranchises(res.data || [])
    } catch (err) {
      console.error('Franchise fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', owner_name: '', contact_email: '', is_active: true })
    setShowModal(true)
  }

  const openEdit = (f) => {
    setEditing(f)
    setForm({ name: f.name, owner_name: f.owner_name || '', contact_email: f.contact_email || '', is_active: f.is_active })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`franchises/${editing.id}`, form)
      } else {
        await api.post('franchises', form)
      }
      setShowModal(false)
      fetchFranchises()
    } catch (err) {
      console.error('Failed to save franchise:', err)
      alert(err.response?.data?.message || 'Failed to save franchise.')
    }
  }

  const handleDelete = async (f) => {
    if (!confirm(`Delete franchise "${f.name}"? This cannot be undone.`)) return
    try {
      await api.delete(`franchises/${f.id}`)
      fetchFranchises()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete franchise.')
    }
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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">Franchise Tools</h2>
          <p className="text-muted-foreground text-sm font-medium">Central management for your franchise group</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all w-max active:scale-95">
          <Plus size={18} strokeWidth={3} /> Add Franchise
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-border shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left min-w-[900px] whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-border text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Franchise</th>
              <th className="px-8 py-5">Owner</th>
              <th className="px-8 py-5">Contact</th>
              <th className="px-8 py-5">Branches</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.isArray(franchises) && franchises.length > 0 ? franchises.map(f => (
              <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-border flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <Store size={24} />
                    </div>
                    <div className="font-black text-foreground tracking-tight uppercase text-sm">{f.name}</div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  {f.owner_name ? (
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                      <User size={14} className="text-slate-400 shrink-0" />
                      {f.owner_name}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-[10px] italic">—</span>
                  )}
                </td>
                <td className="px-8 py-5">
                  {f.contact_email ? (
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] uppercase tracking-tight">
                      <Mail size={12} className="text-blue-500" /> {f.contact_email}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-[10px] italic">—</span>
                  )}
                </td>
                <td className="px-8 py-5">
                  <span className="flex items-center gap-2 text-slate-600 font-black text-sm">
                    <Store size={16} className="text-slate-400" />
                    {f.branches_count ?? 0}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                    f.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-muted-foreground border border-border'
                  }`}>
                    {f.is_active ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
                    {f.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => openEdit(f)}
                    className="p-2.5 text-muted-foreground hover:text-primary rounded-xl hover:bg-white border border-transparent hover:border-border transition-all">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-8 py-32 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs italic">No franchises configured. Add your first franchise group.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Franchise Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-border">
            <h3 className="font-black text-xl uppercase tracking-tighter text-slate-800 mb-6">{editing ? 'Edit Franchise' : 'Add Franchise'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Franchise Name</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="Franchise Group Name" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Owner Name</label>
                  <input type="text" value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="John Doe" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Contact Email</label>
                  <input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="owner@franchise.com" />
                </div>
              </div>
              {editing && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active</span>
                </label>
              )}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-slate-600 transition-all">Cancel</button>
                <button type="submit"
                  className="flex-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98]">{editing ? 'Update' : 'Create'} Franchise</button>
              </div>
            </form>
            {editing && (
              <div className="mt-6 pt-6 border-t border-border">
                <button type="button" onClick={() => handleDelete(editing)}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-all">
                  Delete this franchise
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
