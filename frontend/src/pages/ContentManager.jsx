import React, { useState, useEffect } from 'react'
import {Plus, Loader2, Briefcase, Image, BedDouble, Scissors, BookOpen, Users, Pencil, Trash2, GripVertical, X} from 'lucide-react'
import api from '../services/api'

const CONTENT_CONFIG = {
  reviews: {
    title: 'Reviews',
    icon: Briefcase,
    endpoint: 'reviews',
    defaultForm: { customer_name: '', rating: 5, text: '', location: '', customer_avatar: '', is_published: true },
    columns: [
      { key: 'customer_name', label: 'Customer', render: (item) => (
        <div className="flex items-center gap-3">
          {item.customer_avatar ? (
            <img src={item.customer_avatar} className="w-10 h-10 rounded-xl object-cover border" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
              {item.customer_name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-black text-sm">{item.customer_name}</div>
            {item.location && <div className="text-[10px] text-muted-foreground">{item.location}</div>}
          </div>
        </div>
      )},
      { key: 'rating', label: 'Rating', render: (item) => (
        <span className="flex items-center gap-1 text-amber-500 font-black text-xs">
          {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
        </span>
      )},
      { key: 'text', label: 'Review', render: (item) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-[300px]">{item.text}</span>
      )},
      { key: 'is_published', label: 'Status', render: (item) => (
        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
          item.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-muted-foreground'
        }`}>
          <Briefcase size={6} fill="currentColor" className={item.is_published ? 'animate-pulse' : ''} />
          {item.is_published ? 'Published' : 'Hidden'}
        </span>
      )},
    ],
    fields: [
      { key: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { key: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5 },
      { key: 'text', label: 'Review Text', type: 'textarea', required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'customer_avatar', label: 'Avatar URL', type: 'image' },
      { key: 'is_published', label: 'Published', type: 'toggle' },
    ],
  },
  gallery: {
    title: 'Gallery',
    icon: Image,
    endpoint: 'gallery',
    defaultForm: { title: '', image_url: '', caption: '', is_active: true },
    columns: [
      { key: 'image', label: 'Image', render: (item) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img src={item.image_url} className="w-16 h-12 rounded-xl object-cover border" alt="" />
          ) : (
            <div className="w-16 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
              <Image size={20} />
            </div>
          )}
        </div>
      )},
      { key: 'title', label: 'Title', render: (item) => (
        <span className="font-black text-sm">{item.title || 'Untitled'}</span>
      )},
      { key: 'is_active', label: 'Status', render: (item) => (
        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
          item.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-muted-foreground'
        }`}>
          <Briefcase size={6} fill="currentColor" className={item.is_active ? 'animate-pulse' : ''} />
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      )},
    ],
    fields: [
      { key: 'image_url', label: 'Image URL', type: 'image', required: true },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'caption', label: 'Caption', type: 'text' },
      { key: 'is_active', label: 'Active', type: 'toggle' },
    ],
  },
  rooms: {
    title: 'Rooms',
    icon: BedDouble,
    endpoint: 'rooms',
    defaultForm: { name: '', description: '', price: 0, image_url: '', capacity: 1, amenities: [], is_active: true },
    columns: [
      { key: 'image', label: 'Image', render: (item) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img src={item.image_url} className="w-16 h-12 rounded-xl object-cover border" alt="" />
          ) : (
            <div className="w-16 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
              <BedDouble size={20} />
            </div>
          )}
        </div>
      )},
      { key: 'name', label: 'Name', render: (item) => <span className="font-black text-sm">{item.name}</span> },
      { key: 'price', label: 'Price', render: (item) => <span className="font-black text-sm">${Number(item.price).toFixed(2)}</span> },
      { key: 'capacity', label: 'Capacity', render: (item) => <span className="text-sm">{item.capacity} guests</span> },
      { key: 'is_active', label: 'Status', render: (item) => (
        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
          item.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-muted-foreground'
        }`}>
          <Briefcase size={6} fill="currentColor" />
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      )},
    ],
    fields: [
      { key: 'name', label: 'Room Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'price', label: 'Price ($)', type: 'number', min: 0, step: '0.01' },
      { key: 'capacity', label: 'Capacity (guests)', type: 'number', min: 1 },
      { key: 'image_url', label: 'Image URL', type: 'image' },
      { key: 'is_active', label: 'Active', type: 'toggle' },
    ],
  },
  services: {
    title: 'Services',
    icon: Scissors,
    endpoint: 'services',
    defaultForm: { name: '', description: '', price: 0, duration_minutes: 60, image_url: '', category: '', is_active: true },
    columns: [
      { key: 'name', label: 'Service', render: (item) => (
        <div>
          <div className="font-black text-sm">{item.name}</div>
          {item.category && <div className="text-[10px] text-muted-foreground">{item.category}</div>}
        </div>
      )},
      { key: 'price', label: 'Price', render: (item) => <span className="font-black text-sm">${Number(item.price).toFixed(2)}</span> },
      { key: 'duration_minutes', label: 'Duration', render: (item) => <span className="text-sm">{item.duration_minutes} min</span> },
      { key: 'is_active', label: 'Status', render: (item) => (
        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
          item.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-muted-foreground'
        }`}>
          <Briefcase size={6} fill="currentColor" />
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      )},
    ],
    fields: [
      { key: 'name', label: 'Service Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'price', label: 'Price ($)', type: 'number', min: 0, step: '0.01' },
      { key: 'duration_minutes', label: 'Duration (minutes)', type: 'number', min: 1 },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'image_url', label: 'Image URL', type: 'image' },
      { key: 'is_active', label: 'Active', type: 'toggle' },
    ],
  },
  blog: {
    title: 'Blog',
    icon: BookOpen,
    endpoint: 'blog-posts',
    defaultForm: { title: '', content: '', excerpt: '', image_url: '', author: '', category: '', is_published: false, published_at: '' },
    columns: [
      { key: 'title', label: 'Title', render: (item) => (
        <div>
          <div className="font-black text-sm max-w-[250px] truncate">{item.title}</div>
          {item.author && <div className="text-[10px] text-muted-foreground">by {item.author}</div>}
        </div>
      )},
      { key: 'category', label: 'Category', render: (item) => item.category ? (
        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">{item.category}</span>
      ) : '-'},
      { key: 'is_published', label: 'Status', render: (item) => (
        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
          item.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-muted-foreground'
        }`}>
          <Briefcase size={6} fill="currentColor" className={item.is_published ? 'animate-pulse' : ''} />
          {item.is_published ? 'Published' : 'Draft'}
        </span>
      )},
      { key: 'published_at', label: 'Date', render: (item) => (
        <span className="text-[10px] text-muted-foreground">{item.published_at ? new Date(item.published_at).toLocaleDateString() : '-'}</span>
      )},
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { key: 'author', label: 'Author', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'image_url', label: 'Image URL', type: 'image' },
      { key: 'is_published', label: 'Published', type: 'toggle' },
    ],
  },
  team: {
    title: 'Team',
    icon: Users,
    endpoint: 'team-members',
    defaultForm: { name: '', role: '', bio: '', image_url: '', is_active: true },
    columns: [
      { key: 'name', label: 'Member', render: (item) => (
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img src={item.image_url} className="w-10 h-10 rounded-xl object-cover border" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
              {item.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-black text-sm">{item.name}</div>
            {item.role && <div className="text-[10px] text-muted-foreground">{item.role}</div>}
          </div>
        </div>
      )},
      { key: 'is_active', label: 'Status', render: (item) => (
        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
          item.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-muted-foreground'
        }`}>
          <Briefcase size={6} fill="currentColor" className={item.is_active ? 'animate-pulse' : ''} />
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      )},
    ],
    fields: [
      { key: 'name', label: 'Full Name', type: 'text', required: true },
      { key: 'role', label: 'Role / Title', type: 'text' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'image_url', label: 'Photo URL', type: 'image' },
      { key: 'is_active', label: 'Active', type: 'toggle' },
    ],
  },
};

function FormField({ field, value, onChange }) {
  if (field.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange(field.key, e.target.value)}
        rows={4}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm resize-none"
      />
    );
  }
  if (field.type === 'image') {
    return (
      <div className="space-y-3">
        {value && (
          <div className="w-full h-32 rounded-2xl bg-slate-100 border overflow-hidden">
            <img src={value} className="w-full h-full object-cover" alt="Preview" />
          </div>
        )}
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder="Paste image URL..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm"
        />
      </div>
    );
  }
  if (field.type === 'toggle') {
    return (
      <button
        type="button"
        onClick={() => onChange(field.key, !value)}
        className={`relative w-12 h-7 rounded-full transition-all ${value ? 'bg-primary' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
      </button>
    );
  }
  if (field.type === 'number') {
    return (
      <input
        type="number"
        value={value ?? ''}
        onChange={e => onChange(field.key, field.step ? parseFloat(e.target.value) : parseInt(e.target.value) || 0)}
        min={field.min}
        max={field.max}
        step={field.step}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm"
      />
    );
  }
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(field.key, e.target.value)}
      required={field.required}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm"
    />
  );
}

export function ContentManager({ contentType }) {
  const config = CONTENT_CONFIG[contentType];
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchItems(); }, [contentType]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(config.endpoint);
      setItems(res.data || []);
    } catch (err) {
      console.error(`Failed to fetch ${contentType}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...config.defaultForm });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`${config.endpoint}/${editingId}`, form);
      } else {
        await api.post(config.endpoint, form);
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save. Please check your input.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setDeletingId(id);
    try {
      await api.delete(`${config.endpoint}/${id}`);
      fetchItems();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Icon size={24} className="text-primary" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{config.title}</h2>
          </div>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage your {config.title.toLowerCase()} content</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all w-max active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Add {config.title.slice(0, -1)}
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-border shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-border text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            <tr>
              {config.columns.map(col => (
                <th key={col.key} className="px-6 py-5">{col.label}</th>
              ))}
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length > 0 ? items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                {config.columns.map(col => (
                  <td key={col.key} className="px-6 py-4">{col.render(item)}</td>
                ))}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-white border border-transparent hover:border-border transition-all">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="p-2 text-muted-foreground hover:text-red-500 rounded-xl hover:bg-white border border-transparent hover:border-border transition-all disabled:opacity-50">
                      {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={config.columns.length + 1} className="px-8 py-32 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs italic">
                  No {config.title.toLowerCase()} found. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl uppercase tracking-tighter text-slate-800">
                {editingId ? 'Edit' : 'Add'} {config.title.slice(0, -1)}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-muted-foreground hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              {config.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <FormField field={field} value={form[field.key]} onChange={updateForm} />
                </div>
              ))}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-slate-600 transition-all rounded-2xl hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98]">
                  {editingId ? 'Update' : 'Create'} {config.title.slice(0, -1)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
