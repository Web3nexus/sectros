import React, { useState, useEffect } from 'react'
import {ShoppingBag, Clock, Search, ExternalLink, Copy, Check, Loader2, ChevronDown, ChevronUp, MoreHorizontal, MapPin, Phone, Mail, CreditCard, Trash2} from 'lucide-react'
import api from '../services/api'
import { useBusinessConfig } from '../hooks/useBusinessConfig'

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'cancelled']
const PAYMENT_OPTIONS = ['unpaid', 'partially_paid', 'paid']

export function OnlineOrderingView() {
  const config = useBusinessConfig()
  const b = config.labels
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState({})
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ status: '', payment_status: '' })

  const portalUrl = `${window.location.origin}/order`

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get('orders')
      setOrders(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Orders fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrder = async (id) => {
    try {
      await api.put(`orders/${id}`, editForm)
      setEditing(null)
      fetchOrders()
    } catch (err) {
      console.error('Failed to update order:', err)
      alert('Failed to update order.')
    }
  }

  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const openEdit = (order) => {
    setEditing(order.id)
    setEditForm({ status: order.status, payment_status: order.payment_status })
  }

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const idMatch = String(o.id).includes(q)
      const totalMatch = String(o.total_amount).includes(q)
      return idMatch || totalMatch
    }
    return true
  })

  const todayOrders = orders.filter(o => {
    const d = new Date(o.created_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    today: todayOrders.length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_amount || 0), 0)
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
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">{b.onlineOrdering || 'Online Ordering'}</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage orders from your web shop</p>
        </div>
        <div className="flex items-center gap-3">
          <a href={portalUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border border-border px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
            <ExternalLink size={16} /> Open Shop
          </a>
          <button onClick={copyPortalLink}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95">
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          { label: "Today's Orders", value: stats.today, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' }
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border p-5 ${stat.bg}`}>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</div>
            <div className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-2xl pl-10 pr-5 py-3 text-sm text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm"
            placeholder="Search by ID or amount..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white border border-border rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all shadow-sm appearance-none">
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[24px] border border-border shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left min-w-[900px] whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-border text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">#</th>
              <th className="px-8 py-5">Items</th>
              <th className="px-8 py-5">Total</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5">Payment</th>
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? filtered.map(order => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => toggleExpand(order.id)}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-border flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <ShoppingBag size={18} />
                      </div>
                      <span className="font-black text-foreground text-sm">#{order.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">{Array.isArray(order.items) ? order.items.length : 0} item(s)</span>
                      {expanded[order.id] ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-800">${Number(order.total_amount || 0).toFixed(2)}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      order.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{order.status}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      order.payment_status === 'paid' ? 'text-emerald-600' :
                      order.payment_status === 'partially_paid' ? 'text-amber-600' :
                      'text-muted-foreground'
                    }`}>{order.payment_status || 'unpaid'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                      <Clock size={12} />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={e => { e.stopPropagation(); openEdit(order); }}
                      className="p-2.5 text-muted-foreground hover:text-primary rounded-xl hover:bg-white border border-transparent hover:border-border transition-all">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
                {expanded[order.id] && (
                  <tr key={`${order.id}-details`} className="bg-slate-50/50">
                    <td colSpan="7" className="px-8 py-6">
                      <div className="space-y-3">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Order Items</div>
                        <div className="grid gap-2">
                          {Array.isArray(order.items) && order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-border">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-slate-700">{item.menu_item?.name || `Item #${item.menu_item_id}`}</span>
                                <span className="text-[10px] text-muted-foreground font-bold">x{item.quantity}</span>
                              </div>
                              <span className="text-sm font-black text-slate-800">${Number(item.subtotal || item.unit_price || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        {order.table && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pt-2">
                            <MapPin size={12} /> Table: {order.table.number || order.table.name}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr>
                <td colSpan="7" className="px-8 py-32 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs italic">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Order Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-border">
            <h3 className="font-black text-xl uppercase tracking-tighter text-slate-800 mb-6">Update Order #{editing}</h3>
            <form onSubmit={e => { e.preventDefault(); handleUpdateOrder(editing); }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all shadow-sm appearance-none">
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Payment Status</label>
                <select value={editForm.payment_status} onChange={e => setEditForm({...editForm, payment_status: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all shadow-sm appearance-none">
                  {PAYMENT_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-slate-600 transition-all">Cancel</button>
                <button type="submit" className="flex-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98]">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
