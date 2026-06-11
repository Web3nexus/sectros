import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Image as ImageIcon, BedDouble, Loader2, Star, Users, Circle, ChevronRight, X } from 'lucide-react'
import api from '../services/api'
import { useBusinessLabels } from '../hooks/useBusinessLabels'

function formatPrice(val) {
  const n = parseFloat(val)
  return isNaN(n) ? '$0.00' : `$${n.toFixed(2)}`
}

export function MenuView() {
  const b = useBusinessLabels()
  const [activeTab, setActiveTab] = useState('categories')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image_url: '' })

  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemForm, setItemForm] = useState({
    menu_category_id: '', name: '', description: '', image_url: '', price: '0.00', is_available: true
  })

  useEffect(() => {
    fetchMenuData()
  }, [])

  const fetchMenuData = async () => {
    setLoading(true)
    try {
      const response = await api.get('menu')
      if (response.data) {
        setCategories(Array.isArray(response.data) ? response.data : [])
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const openCategoryModal = (cat = null) => {
    setEditingCategory(cat)
    setCategoryForm(cat ? { name: cat.name, description: cat.description || '', image_url: cat.image_url || '' } : { name: '', description: '', image_url: '' })
    setShowCategoryModal(true)
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await api.put(`menu/categories/${editingCategory.id}`, categoryForm)
      } else {
        await api.post('menu/categories', categoryForm)
      }
      setShowCategoryModal(false)
      setEditingCategory(null)
      fetchMenuData()
    } catch (err) {
      console.error('Failed to save category', err)
      alert('Failed to save category')
    }
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category and all its items?')) return
    try {
      await api.delete(`menu/categories/${id}`)
      fetchMenuData()
    } catch (err) {
      console.error('Failed to delete category', err)
    }
  }

  const openItemModal = (item = null) => {
    setEditingItem(item)
    setItemForm(item ? {
      menu_category_id: item.menu_category_id,
      name: item.name,
      description: item.description || '',
      image_url: item.image_url || '',
      price: item.price,
      is_available: item.is_available ?? true
    } : { menu_category_id: '', name: '', description: '', image_url: '', price: '0.00', is_available: true })
    setShowItemModal(true)
  }

  const handleItemSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!itemForm.menu_category_id && !editingItem) {
        alert('Please select a category.')
        return
      }
      if (editingItem) {
        await api.put(`menu/items/${editingItem.id}`, itemForm)
      } else {
        await api.post('menu/items', itemForm)
      }
      setShowItemModal(false)
      setEditingItem(null)
      fetchMenuData()
    } catch (err) {
      console.error('Failed to save item', err)
      alert('Failed to save item')
    }
  }

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await api.delete(`menu/items/${id}`)
      fetchMenuData()
    } catch (err) {
      console.error('Failed to delete item', err)
    }
  }

  const allItems = (Array.isArray(categories) ? categories : []).flatMap(cat =>
    (Array.isArray(cat.items) ? cat.items : []).map(item => ({ ...item, category_name: cat.name }))
  )

  const filteredItems = allItems.filter(item =>
    !searchQuery || item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCategories = (Array.isArray(categories) ? categories : []).filter(cat =>
    !searchQuery || cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">{b.menu}</h2>
          <p className="text-[11px] font-bold text-muted-foreground tracking-wider mt-1">{b.menuDescription}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-56 pl-9 pr-3 py-2 bg-muted/30 border border-border rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50 uppercase tracking-wider"
            />
          </div>
          <button className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground px-3 py-2 border border-border rounded-lg hover:bg-muted transition tracking-widest">
            <Filter size={14} /> Filter
          </button>
          <button
            onClick={() => activeTab === 'categories' ? openCategoryModal() : openItemModal()}
            className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-foreground px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition tracking-widest shadow-sm"
          >
            <Plus size={15} /> Add {activeTab === 'categories' ? b.category : b.item}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'categories' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {b.categories}
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'items' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {b.items}
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 size={36} className="animate-spin mb-4 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest">Loading...</p>
            </div>
          ) : activeTab === 'categories' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.length > 0 ? filteredCategories.map(cat => {
                const itemCount = cat.items?.length || 0
                const prices = (cat.items || []).map(i => parseFloat(i.price)).filter(p => !isNaN(p))
                const minPrice = prices.length ? Math.min(...prices) : null
                const maxPrice = prices.length ? Math.max(...prices) : null
                return (
                  <div key={cat.id} className="group relative bg-muted/30 border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
                    {cat.image_url ? (
                      <div className="h-32 bg-muted overflow-hidden">
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                        <BedDouble size={36} className="text-primary/30" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-black text-foreground text-sm tracking-tight">{cat.name}</h3>
                          {cat.description && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openCategoryModal(cat)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted"><Edit2 size={14} /></button>
                          <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-muted"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BedDouble size={12} />
                          {itemCount} {itemCount === 1 ? b.item : b.items}
                        </span>
                        {minPrice !== null && (
                          <span>{formatPrice(minPrice)}{maxPrice !== minPrice ? ` - ${formatPrice(maxPrice)}` : ''}</span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          cat.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Circle size={5} fill="currentColor" />
                          {cat.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }) : (
                <div className="col-span-full text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                  <BedDouble size={36} className="mx-auto mb-3 text-muted-foreground/40" />
                  <p className="font-black text-[10px] uppercase tracking-widest">No {b.categories?.toLowerCase()} found</p>
                  <button onClick={() => openCategoryModal()} className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                    Add your first {b.category?.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-3 text-left w-14"></th>
                    <th className="px-4 py-3 text-left">{b.item} Name</th>
                    <th className="px-4 py-3 text-left">{b.category}</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.length > 0 ? filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/40">
                            <BedDouble size={16} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground text-sm">{item.name}</div>
                        {item.description && <div className="text-[10px] text-muted-foreground truncate max-w-[220px]">{item.description}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-[9px] font-black uppercase tracking-wider">
                          {item.category_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-foreground text-sm">{formatPrice(item.price)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          item.is_available !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          <Circle size={5} fill="currentColor" />
                          {item.is_available !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openItemModal(item)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted"><Edit2 size={14} /></button>
                          <button onClick={() => deleteItem(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-muted"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-16 text-center text-muted-foreground">
                        <BedDouble size={28} className="mx-auto mb-2 text-muted-foreground/30" />
                        <p className="font-black text-[10px] uppercase tracking-widest">No {b.items?.toLowerCase()} found</p>
                        <button onClick={() => openItemModal()} className="mt-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                          Add your first {b.item?.toLowerCase()}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-foreground tracking-tight uppercase text-sm">{editingCategory ? 'Edit' : 'New'} {b.category}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Name</label>
                <input required type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder={b.category === 'Room Category' ? 'e.g. Deluxe Suite' : 'e.g. Starters'} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" rows="2" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Image URL</label>
                <input type="text" value={categoryForm.image_url} onChange={e => setCategoryForm({...categoryForm, image_url: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="https://..." />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2.5 rounded-lg text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition shadow-sm">
                  {editingCategory ? 'Save' : 'Create'} {b.category}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setShowItemModal(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-foreground tracking-tight uppercase text-sm">{editingItem ? 'Edit' : 'New'} {b.item}</h3>
              <button onClick={() => setShowItemModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Name</label>
                  <input required type="text" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">{b.category}</label>
                  <select required value={itemForm.menu_category_id} onChange={e => setItemForm({...itemForm, menu_category_id: e.target.value})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="">Select {b.category}</option>
                    {(Array.isArray(categories) ? categories : []).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" rows="2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Price ($)</label>
                  <input required type="number" step="0.01" min="0" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Image URL</label>
                  <input type="text" value={itemForm.image_url} onChange={e => setItemForm({...itemForm, image_url: e.target.value})}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="https://..." />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={itemForm.is_available} onChange={e => setItemForm({...itemForm, is_available: e.target.checked})}
                    className="rounded border-border text-primary focus:ring-primary/20" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowItemModal(false)}
                  className="px-4 py-2.5 rounded-lg text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition shadow-sm">
                  {editingItem ? 'Save' : 'Create'} {b.item}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
