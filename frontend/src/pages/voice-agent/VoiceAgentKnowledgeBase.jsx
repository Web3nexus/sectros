import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit3, Trash2, X, Loader2, AlertCircle, CheckCircle, Save } from 'lucide-react'
import api from '../../services/api'

const CATEGORIES = [
  { value: 'business_info', label: 'Business Info' },
  { value: 'menu', label: 'Menu' },
  { value: 'services', label: 'Services' },
  { value: 'hours', label: 'Hours' },
  { value: 'faq', label: 'FAQ' },
  { value: 'other', label: 'Other' },
]

const CATEGORY_COLORS = {
  business_info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  menu: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  services: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  hours: 'bg-green-500/10 text-green-600 border-green-500/20',
  faq: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  other: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
}

export default function VoiceAgentKnowledgeBase() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'business_info',
    is_active: true,
  })

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('voice-agent/knowledge-base')
      const data = res.data?.data || res.data || []
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load knowledge base')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingItem(null)
    setForm({ title: '', content: '', category: 'business_info', is_active: true })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm({
      title: item.title || '',
      content: item.content || '',
      category: item.category || 'business_info',
      is_active: item.is_active ?? true,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    setError(null)
    try {
      if (editingItem) {
        await api.put(`voice-agent/knowledge-base/${editingItem.id}`, form)
        setSuccess('Knowledge base item updated')
      } else {
        await api.post('voice-agent/knowledge-base', form)
        setSuccess('Knowledge base item created')
      }
      setShowModal(false)
      fetchItems()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    setError(null)
    try {
      await api.delete(`voice-agent/knowledge-base/${item.id}`)
      setSuccess('Knowledge base item deleted')
      fetchItems()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="font-medium animate-pulse">Loading knowledge base...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Knowledge Base
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage information your AI voice agent can reference during calls.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95">
          <Plus className="w-4 h-4" /> Add Item
        </button>
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

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-foreground text-sm truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other}`}>
                      {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                    </span>
                    {item.is_active ? (
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                    ) : (
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Inactive</span>
                    )}
                  </div>
                </div>
              </div>

              {item.content && (
                <p className="text-xs text-muted-foreground mb-4 flex-1 line-clamp-3">{item.content}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <span className="text-[10px] text-muted-foreground">{formatDate(item.created_at)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-border rounded-3xl p-12 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-black text-muted-foreground">No knowledge base items</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Add information so your voice agent can answer customer questions intelligently.</p>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Add Your First Item
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-black text-foreground text-lg">
                {editingItem ? 'Edit Item' : 'Add Knowledge Base Item'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Title *</label>
                <input type="text" value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all"
                  placeholder="e.g. Business Hours" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Category</label>
                <select value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-bold text-foreground focus:border-blue-600 transition-all"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value} className="bg-white">{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Content</label>
                <textarea value={form.content}
                  onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full bg-slate-50 border-2 border-border rounded-2xl px-5 py-3 font-mono text-xs font-bold text-foreground focus:border-blue-600 transition-all"
                  placeholder="The information the agent should reference..." />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active</label>
                <button type="button"
                  onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-blue-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !form.title.trim()}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
