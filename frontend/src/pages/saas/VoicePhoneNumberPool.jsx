import React, { useState, useEffect } from 'react'
import { Phone, Plus, Edit2, Trash2, CheckCircle, X, Loader2, Search, Save, UserPlus, PhoneOff, Smartphone, Globe, ShoppingCart } from 'lucide-react'
import api from '../../services/centralApi'

export default function VoicePhoneNumberPool() {
  const [numbers, setNumbers] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [showAssign, setShowAssign] = useState(null)
  const [tenants, setTenants] = useState([])
  const [selectedTenant, setSelectedTenant] = useState('')
  const [tenantSearch, setTenantSearch] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [showTwilioSearch, setShowTwilioSearch] = useState(false)
  const [twilioSearchParams, setTwilioSearchParams] = useState({ country_code: 'US', type: 'local', area_code: '', limit: 10 })
  const [twilioResults, setTwilioResults] = useState([])
  const [twilioSearching, setTwilioSearching] = useState(false)
  const [twilioPurchasing, setTwilioPurchasing] = useState(null)
  const [twilioError, setTwilioError] = useState(null)

  const fetchNumbers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await api.get(`saas/voice-phone-numbers?${params.toString()}`)
      setNumbers(res.data.numbers || [])
      setMeta(res.data.meta)
    } catch (e) {
      console.error('Failed to fetch phone numbers', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchNumbers() }, [search, statusFilter])

  const fetchTenants = async (q) => {
    try {
      const res = await api.get(`saas/voice-phone-numbers/tenants?search=${encodeURIComponent(q || '')}`)
      setTenants(res.data.tenants || [])
    } catch (e) {
      console.error('Failed to fetch tenants', e)
    }
  }

  const openNew = () => setEditingItem({
    phone_number: '',
    provider: 'elevenlabs',
    phone_number_source: 'platform_owned',
    status: 'available',
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (editingItem.id) {
        await api.put(`saas/voice-phone-numbers/${editingItem.id}`, editingItem)
      } else {
        await api.post('saas/voice-phone-numbers', editingItem)
      }
      setMessage({ type: 'success', text: 'Phone number saved!' })
      setEditingItem(null)
      fetchNumbers()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Failed to save' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this phone number from the pool?')) return
    try {
      await api.delete(`saas/voice-phone-numbers/${id}`)
      setMessage({ type: 'success', text: 'Phone number removed' })
      fetchNumbers()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Failed to delete' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const openAssign = (num) => {
    setShowAssign(num)
    setSelectedTenant('')
    setTenantSearch('')
    fetchTenants('')
  }

  const handleAssign = async () => {
    if (!selectedTenant) return
    setAssigning(true)
    try {
      const res = await api.post(`saas/voice-phone-numbers/${showAssign.id}/assign`, { tenant_id: selectedTenant })
      setMessage({ type: 'success', text: res.data.message || 'Assigned successfully' })
      setShowAssign(null)
      fetchNumbers()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Failed to assign' })
    } finally {
      setAssigning(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleTwilioSearch = async () => {
    setTwilioSearching(true)
    setTwilioError(null)
    setTwilioResults([])
    try {
      const params = new URLSearchParams()
      if (twilioSearchParams.country_code) params.set('country_code', twilioSearchParams.country_code)
      if (twilioSearchParams.type) params.set('type', twilioSearchParams.type)
      if (twilioSearchParams.area_code) params.set('area_code', twilioSearchParams.area_code)
      if (twilioSearchParams.limit) params.set('limit', twilioSearchParams.limit)
      const res = await api.get(`saas/voice-phone-numbers/search-twilio?${params.toString()}`)
      if (res.data.success) {
        setTwilioResults(res.data.numbers || [])
      } else {
        setTwilioError(res.data.message || 'Search failed')
      }
    } catch (e) {
      setTwilioError(e.response?.data?.message || 'Failed to search Twilio')
    } finally {
      setTwilioSearching(false)
    }
  }

  const handleTwilioPurchase = async (phoneNumber, provider) => {
    setTwilioPurchasing(phoneNumber)
    setTwilioError(null)
    try {
      const res = await api.post('saas/voice-phone-numbers/purchase-twilio', { phone_number: phoneNumber, provider: provider || 'elevenlabs' })
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message || 'Number purchased and added to pool!' })
        setTwilioResults(prev => prev.filter(n => n.phone_number !== phoneNumber))
        fetchNumbers()
      } else {
        setTwilioError(res.data.message || 'Purchase failed')
      }
    } catch (e) {
      setTwilioError(e.response?.data?.message || 'Failed to purchase number')
    } finally {
      setTwilioPurchasing(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleRelease = async (id) => {
    if (!window.confirm('Release this number back to the pool? The tenant will lose their AI phone number.')) return
    try {
      const res = await api.post(`saas/voice-phone-numbers/${id}/release`)
      setMessage({ type: 'success', text: res.data.message || 'Released successfully' })
      fetchNumbers()
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.message || 'Failed to release' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Phone Number Pool</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage platform-owned AI phone numbers for voice agent tenants.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTwilioSearch(true)}
            className="bg-emerald-500 hover:brightness-110 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2"
          >
            <Globe className="w-4 h-4" /> Search Twilio
          </button>
          <button onClick={openNew}
            className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Number
          </button>
        </div>
      </div>

      {meta && (
        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Total: {meta.total}</span>
          <span className="flex items-center gap-1.5 text-emerald-500"><CheckCircle className="w-3.5 h-3.5" /> Available: {meta.available_count}</span>
          <span className="flex items-center gap-1.5 text-blue-500"><UserPlus className="w-3.5 h-3.5" /> Assigned: {meta.assigned_count}</span>
        </div>
      )}

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search phone number..."
            className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-background border border-border rounded-xl py-2 px-4 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none transition-all">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <th className="text-left py-4 px-6">Phone Number</th>
                <th className="text-left py-4 px-6">Provider</th>
                <th className="text-left py-4 px-6">Tenant</th>
                <th className="text-left py-4 px-6">Status</th>
                <th className="text-left py-4 px-6">Assigned At</th>
                <th className="text-right py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {numbers.map(num => (
                <tr key={num.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-bold text-foreground font-mono">{num.phone_number}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs font-bold text-muted-foreground uppercase">{num.provider}</span>
                  </td>
                  <td className="py-4 px-6">
                    {num.tenant_name ? (
                      <span className="font-semibold text-foreground">{num.tenant_name}</span>
                    ) : (
                      <span className="text-muted-foreground italic text-sm">— Available —</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      num.status === 'available' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : num.status === 'assigned' || num.status === 'active' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                        : num.status === 'inactive' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-500 border border-red-500/30'
                    }`}>
                      {num.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-muted-foreground">
                      {num.assigned_at ? new Date(num.assigned_at).toLocaleDateString() : '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {num.tenant_id ? (
                        <button onClick={() => handleRelease(num.id)}
                          className="p-2 hover:bg-amber-500/10 rounded-lg text-muted-foreground hover:text-amber-500 transition-colors"
                          title="Release number">
                          <PhoneOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => openAssign(num)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg text-muted-foreground hover:text-blue-500 transition-colors"
                          title="Assign to tenant">
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(num.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {numbers.length === 0 && (
                <tr><td colSpan={6} className="py-20 text-center text-muted-foreground italic">No phone numbers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
          <div className="relative bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl">
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-bold text-foreground">{editingItem.id ? 'Edit Number' : 'Add Phone Number'}</h3>
                <button type="button" onClick={() => setEditingItem(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone Number *</label>
                  <input required value={editingItem.phone_number} onChange={e => setEditingItem(p => ({ ...p, phone_number: e.target.value }))}
                    placeholder="+1234567890" className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Provider</label>
                  <select value={editingItem.provider} onChange={e => setEditingItem(p => ({ ...p, provider: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all">
                    <option value="elevenlabs">elevenlabs</option>
                    <option value="vapi">vapi</option>
                    <option value="retell">retell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Source</label>
                  <select value={editingItem.phone_number_source} onChange={e => setEditingItem(p => ({ ...p, phone_number_source: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all">
                    <option value="platform_owned">Platform Owned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Twilio SID <span className="text-[10px] text-muted-foreground/50">(optional)</span></label>
                  <input value={editingItem.external_phone_number_id || ''} onChange={e => setEditingItem(p => ({ ...p, external_phone_number_id: e.target.value }))}
                    placeholder="PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all font-mono text-sm" />
                  <p className="text-[10px] text-muted-foreground/50 mt-1">Twilio Phone Number SID. If omitted, the system will look it up by number.</p>
                </div>
              </div>
              <div className="p-6 border-t border-border flex gap-3">
                <button type="button" onClick={() => setEditingItem(null)}
                  className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-primary hover:brightness-110 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Twilio Search & Purchase Modal */}
      {showTwilioSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowTwilioSearch(false)} />
          <div className="relative bg-card border border-border w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" /> Search Twilio Numbers
              </h3>
              <button type="button" onClick={() => setShowTwilioSearch(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Country</label>
                  <select value={twilioSearchParams.country_code} onChange={e => setTwilioSearchParams(p => ({ ...p, country_code: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all">
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Type</label>
                  <select value={twilioSearchParams.type} onChange={e => setTwilioSearchParams(p => ({ ...p, type: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all">
                    <option value="local">Local</option>
                    <option value="tollfree">Toll-Free</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Area Code</label>
                  <input value={twilioSearchParams.area_code} onChange={e => setTwilioSearchParams(p => ({ ...p, area_code: e.target.value }))}
                    maxLength={3} placeholder="415"
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Result Limit</label>
                  <select value={twilioSearchParams.limit} onChange={e => setTwilioSearchParams(p => ({ ...p, limit: Number(e.target.value) }))}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <button onClick={handleTwilioSearch} disabled={twilioSearching}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:brightness-110 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                {twilioSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {twilioSearching ? 'Searching...' : 'Search Available Numbers'}
              </button>

              {twilioError && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-sm text-red-400 font-medium">
                  {twilioError}
                </div>
              )}

              {twilioResults.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/50">
                        <th className="text-left py-3 px-4">Number</th>
                        <th className="text-left py-3 px-4">Location</th>
                        <th className="text-left py-3 px-4">Voice</th>
                        <th className="text-left py-3 px-4">SMS</th>
                        <th className="text-right py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {twilioResults.map(n => (
                        <tr key={n.phone_number} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-foreground">{n.phone_number}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{n.locality ? `${n.locality}, ` : ''}{n.region}</td>
                          <td className="py-3 px-4">{n.capabilities.voice ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-500" />}</td>
                          <td className="py-3 px-4">{n.capabilities.sms ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-500" />}</td>
                          <td className="py-3 px-4 text-right">
                            <button onClick={() => handleTwilioPurchase(n.phone_number, twilioSearchParams.type === 'tollfree' ? 'vapi' : 'elevenlabs')} disabled={twilioPurchasing === n.phone_number}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50">
                              {twilioPurchasing === n.phone_number ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingCart className="w-3 h-3" />}
                              {twilioPurchasing === n.phone_number ? 'Buying...' : 'Purchase'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {twilioResults.length === 0 && !twilioSearching && !twilioError && (
                <p className="text-center text-sm text-muted-foreground italic py-8">Search for available numbers above.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAssign(null)} />
          <div className="relative bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Assign Phone Number</h3>
              <button type="button" onClick={() => setShowAssign(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                <Phone className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground font-mono">{showAssign.phone_number}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Search Tenant</label>
                <input value={tenantSearch} onChange={e => { setTenantSearch(e.target.value); fetchTenants(e.target.value) }}
                  placeholder="Search by business name or email..."
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {tenants.map(t => (
                  <button key={t.id} type="button" onClick={() => setSelectedTenant(t.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedTenant === t.id ? 'bg-primary/10 border border-primary/30 text-primary' : 'bg-muted/50 hover:bg-muted border border-transparent'
                    }`}>
                    <div className="font-bold text-sm">{t.business_name}</div>
                    <div className="text-xs text-muted-foreground">{t.owner_email} · {t.id}</div>
                  </button>
                ))}
                {tenants.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4 italic">No active tenants found</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button type="button" onClick={() => setShowAssign(null)}
                className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-muted transition-all">
                Cancel
              </button>
              <button onClick={handleAssign} disabled={!selectedTenant || assigning}
                className="flex-1 py-3 rounded-xl bg-primary hover:brightness-110 text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {assigning ? 'Assigning...' : 'Assign to Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
