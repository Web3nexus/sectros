import React, { useState, useEffect } from 'react'
import {Plus, Search, Filter, Edit2, Trash2, Briefcase, X, Minus, Plus as PlusIcon, Package, Loader2, AlertTriangle, TrendingDown, DollarSign} from 'lucide-react'
import api from '../services/api'
import { useBusinessConfig } from '../hooks/useBusinessConfig'

const INVENTORY_CATEGORIES = {
  restaurant: ['Produce', 'Meat & Poultry', 'Seafood', 'Dairy', 'Dry Goods', 'Beverages', 'Spices & Seasonings', 'Condiments', 'Bakery', 'Other'],
  cafe: ['Coffee & Tea', 'Syrups & Flavors', 'Pastry', 'Dairy', 'Dry Goods', 'Beverages', 'Snacks', 'Other'],
  salon: ['Hair Color', 'Styling Products', 'Hair Care', 'Skincare', 'Nail Products', 'Tools & Equipment', 'Towels & Supplies', 'Retail', 'Other'],
  hotel: ['Linens & Towels', 'Toiletries', 'Cleaning Supplies', 'Mini-Bar', 'Maintenance', 'Amenities', 'Kitchen', 'Stationery', 'Other'],
}

const UNIT_OPTIONS = ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack', 'bottle', 'can', 'bag', 'carton', 'roll', 'pair']

export default function InventoryView() {
  const config = useBusinessConfig()
  const b = config.labels
  const categories = INVENTORY_CATEGORIES[config.type] || INVENTORY_CATEGORIES.restaurant

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', category: '', sku: '', unit: 'pcs',
    stock_qty: 0, min_stock_level: 0, cost_per_unit: 0, supplier: '', image_url: '', is_active: true,
  })

  const [adjustingId, setAdjustingId] = useState(null)
  const [adjustQty, setAdjustQty] = useState(0)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await api.get('inventory')
      if (res.data) setItems(Array.isArray(res.data) ? res.data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ name: '', description: '', category: categories[0] || '', sku: '', unit: 'pcs', stock_qty: 0, min_stock_level: 0, cost_per_unit: 0, supplier: '', image_url: '', is_active: true })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({ ...item })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`inventory/${editingId}`, form)
      } else {
        await api.post('inventory', form)
      }
      setShowModal(false)
      fetchItems()
    } catch {
      alert('Failed to save item')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this inventory item?')) return
    try {
      await api.delete(`inventory/${id}`)
      fetchItems()
    } catch {
      alert('Failed to delete')
    }
  }

  const handleAdjustStock = async (id) => {
    if (adjustQty === 0) return
    try {
      await api.post(`inventory/${id}/adjust-stock`, { adjustment: adjustQty })
      setAdjustingId(null)
      setAdjustQty(0)
      fetchItems()
    } catch {
      alert('Failed to adjust stock')
    }
  }

  const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.stock_qty) || 0) * (parseFloat(i.cost_per_unit) || 0), 0)
  const lowStockItems = items.filter(i => parseFloat(i.stock_qty) <= parseFloat(i.min_stock_level) && parseFloat(i.min_stock_level) > 0)
  const totalItems = items.length

  const filteredItems = items.filter(i => {
    if (searchQuery && !i.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (categoryFilter && i.category !== categoryFilter) return false
    return true
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">{b.inventory || 'Inventory'}</h2>
          <p className="text-[11px] font-bold text-muted-foreground tracking-wider mt-1">Track stock levels, costs, and suppliers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-48 pl-9 pr-3 py-2 bg-muted/30 border border-border rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50 uppercase tracking-wider" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-muted/30 border border-border rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase tracking-wider">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={openCreate}
            className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-foreground px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition tracking-widest shadow-sm">
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Package size={20} />
          </div>
          <div>
            <div className="font-black text-2xl text-foreground tracking-tight">{totalItems}</div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Items</div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="font-black text-2xl text-foreground tracking-tight">{lowStockItems.length}</div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Low Stock Items</div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="font-black text-2xl text-foreground tracking-tight">${totalValue.toFixed(2)}</div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Inventory Value</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4 text-left">Item</th>
                <th className="px-5 py-4 text-left">Category</th>
                <th className="px-5 py-4 text-right">Stock</th>
                <th className="px-5 py-4 text-right">Min Level</th>
                <th className="px-5 py-4 text-right">Cost/Unit</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center w-32">Adjust</th>
                <th className="px-5 py-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-20 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? filteredItems.map(item => {
                const isLow = parseFloat(item.stock_qty) <= parseFloat(item.min_stock_level) && parseFloat(item.min_stock_level) > 0
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-border" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/40">
                            <Package size={16} />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-foreground text-sm">{item.name}</div>
                          {item.sku && <div className="text-[9px] text-muted-foreground font-mono">{item.sku}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-[9px] font-black uppercase tracking-wider">{item.category || '-'}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-black text-sm ${isLow ? 'text-amber-600' : 'text-foreground'}`}>
                        {parseFloat(item.stock_qty).toFixed(1)}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">{item.unit}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-muted-foreground text-sm">
                      {parseFloat(item.min_stock_level).toFixed(1)} {item.unit}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-foreground text-sm">
                      ${parseFloat(item.cost_per_unit).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600">
                          <AlertTriangle size={10} /> Low
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          item.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Briefcase size={5} fill="currentColor" />
                          {item.is_active !== false ? 'In Stock' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {adjustingId === item.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setAdjustQty(Math.max(-999, adjustQty - 1))}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                            <Minus size={12} />
                          </button>
                          <div className="flex items-center border border-border rounded-lg">
                            <input type="number" value={adjustQty}
                              onChange={e => setAdjustQty(parseInt(e.target.value) || 0)}
                              className="w-16 text-center text-xs font-bold py-1 bg-transparent outline-none" />
                          </div>
                          <button onClick={() => setAdjustQty(adjustQty + 1)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                            <PlusIcon size={12} />
                          </button>
                          <button onClick={() => handleAdjustStock(item.id)}
                            className="p-1 rounded bg-primary text-white hover:bg-primary/90 transition-all">
                            <Briefcase size={8} fill="currentColor" />
                          </button>
                          <button onClick={() => { setAdjustingId(null); setAdjustQty(0) }}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setAdjustingId(item.id); setAdjustQty(0) }}
                          className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                          Adjust
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-muted">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan="8" className="px-5 py-20 text-center">
                    <Package size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">No inventory items found</p>
                    <button onClick={openCreate} className="mt-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Add your first item</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-border max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-foreground tracking-tight uppercase text-sm">{editingId ? 'Edit' : 'Add'} Inventory Item</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Item Name *</label>
                  <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">SKU</label>
                  <input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Unit</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Supplier</label>
                  <input type="text" value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" rows="2" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Stock Qty</label>
                  <input required type="number" step="0.01" min="0" value={form.stock_qty} onChange={e => setForm({...form, stock_qty: parseFloat(e.target.value) || 0})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Min Level</label>
                  <input type="number" step="0.01" min="0" value={form.min_stock_level} onChange={e => setForm({...form, min_stock_level: parseFloat(e.target.value) || 0})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Cost/Unit ($)</label>
                  <input type="number" step="0.01" min="0" value={form.cost_per_unit} onChange={e => setForm({...form, cost_per_unit: parseFloat(e.target.value) || 0})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Image URL</label>
                <input type="text" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})}
                    className="rounded border-border text-primary focus:ring-primary/20" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-border">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-lg text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted transition">Cancel</button>
                <button type="submit"
                  className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition shadow-sm">
                  {editingId ? 'Update' : 'Create'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
