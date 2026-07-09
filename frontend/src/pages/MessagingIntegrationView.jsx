import React, { useState, useEffect } from 'react'
import { MessageSquare, Save, Plus, Trash2, Globe, Smartphone, Facebook, Instagram, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import centralApi from '../services/centralApi'

export default function MessagingIntegrationView() {
  const [settings, setSettings] = useState({
    integration_mode: 'partner',
    partner_program_enabled: true,
    direct_meta_enabled: false,
    bsp_mode_enabled: false,
    meta_app_id: '',
    meta_app_secret: '',
    meta_webhook_verify_token: '',
    meta_oauth_redirect_url: '',
    meta_required_permissions: 'pages_messaging,pages_manage_metadata,instagram_basic,instagram_manage_messages',
    meta_webhook_callback_url: '/api/social/webhook',
  })
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [showProviderModal, setShowProviderModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)
  const [showSecrets, setShowSecrets] = useState({})

  useEffect(() => {
    fetchSettings()
    fetchProviders()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await centralApi.get('saas/messaging/settings')
      setSettings(prev => ({ ...prev, ...res.data }))
    } catch (err) {
      console.error('Failed to fetch messaging settings', err)
    }
  }

  const fetchProviders = async () => {
    try {
      const res = await centralApi.get('saas/messaging/providers')
      setProviders(res.data.providers || [])
    } catch (err) {
      console.error('Failed to fetch providers', err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await centralApi.post('saas/messaging/settings', settings)
      setMessage({ type: 'success', text: 'Integration settings saved' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const saveProvider = async (form) => {
    try {
      if (editingProvider) {
        await centralApi.put(`saas/messaging/providers/${editingProvider.id}`, form)
      } else {
        await centralApi.post('saas/messaging/providers', form)
      }
      setShowProviderModal(false)
      setEditingProvider(null)
      fetchProviders()
      setMessage({ type: 'success', text: 'Provider saved' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Failed to save provider' })
    }
  }

  const deleteProvider = async (id) => {
    if (!confirm('Delete this provider?')) return
    try {
      await centralApi.delete(`saas/messaging/providers/${id}`)
      fetchProviders()
      setMessage({ type: 'success', text: 'Provider deleted' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' })
    }
  }

  const testProvider = async (id) => {
    try {
      const res = await centralApi.post(`saas/messaging/providers/${id}/test`)
      setMessage({ type: res.data.status === 'connected' ? 'success' : 'error', text: res.data.message })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Test failed' })
    }
  }

  const ProviderForm = ({ provider, onSave, onCancel }) => {
    const [form, setForm] = useState({
      provider_key: provider?.provider_key || '360dialog',
      provider_name: provider?.provider_name || '',
      provider_type: provider?.provider_type || 'whatsapp_bsp',
      api_key: '',
      api_secret: '',
      webhook_secret: '',
      webhook_verify_token: '',
      config_json: provider?.config_json || {},
      is_active: provider?.is_active ?? true,
      is_default: provider?.is_default ?? false,
    })

    const configKeys = form.provider_key === 'meta_direct'
      ? ['app_id', 'api_base_url']
      : form.provider_key === 'twilio'
        ? ['account_sid', 'from_number']
        : ['api_base_url']

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <h3 className="text-xl font-bold mb-6">{provider ? 'Edit Provider' : 'Add Provider'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Provider Key</label>
              <select value={form.provider_key} onChange={e => setForm({ ...form, provider_key: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" disabled={!!provider}>
                <option value="360dialog">360dialog</option>
                <option value="twilio">Twilio</option>
                <option value="meta_direct">Meta Direct</option>
                <option value="bird">Bird/MessageBird</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Provider Name</label>
              <input type="text" value={form.provider_name} onChange={e => setForm({ ...form, provider_name: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder="My Provider" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Provider Type</label>
              <select value={form.provider_type} onChange={e => setForm({ ...form, provider_type: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700">
                <option value="meta_direct">Meta Direct (FB/IG/WA)</option>
                <option value="whatsapp_bsp">WhatsApp BSP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">API Key / Auth Token</label>
              <input type="password" value={form.api_key} onChange={e => setForm({ ...form, api_key: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder={provider ? 'Leave blank to keep existing' : 'Required'} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">API Secret</label>
              <input type="password" value={form.api_secret} onChange={e => setForm({ ...form, api_secret: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder={provider ? 'Leave blank to keep existing' : ''} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Webhook Secret</label>
              <input type="password" value={form.webhook_secret} onChange={e => setForm({ ...form, webhook_secret: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder={provider ? 'Leave blank to keep existing' : ''} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Webhook Verify Token</label>
              <input type="password" value={form.webhook_verify_token} onChange={e => setForm({ ...form, webhook_verify_token: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder={provider ? 'Leave blank to keep existing' : ''} />
            </div>
            {configKeys.map(key => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                <input type="text" value={form.config_json?.[key] || ''} onChange={e => setForm({ ...form, config_json: { ...form.config_json, [key]: e.target.value } })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" />
              </div>
            ))}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} className="rounded" />
                <span className="text-sm">Default</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={onCancel} className="px-6 py-2 border rounded-xl dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
            <button onClick={() => onSave(form)} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Save Provider</button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messaging Integration</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure Direct Meta + BSP MVP integration alongside Partner Program</p>
        </div>
      </div>

      {message && (
        <div className={`px-6 py-3 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border dark:border-gray-800">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Globe className="w-5 h-5" /> Integration Mode</h2>
        <div className="space-y-4">
          <label className="flex items-start gap-4 p-4 border rounded-xl dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <input type="radio" name="integration_mode" value="partner" checked={settings.integration_mode === 'partner'} onChange={e => setSettings({ ...settings, integration_mode: e.target.value })} className="mt-1" />
            <div>
              <div className="font-semibold">Partner Program Mode</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Use the existing Meta Tech Provider / Partner Program integration. Admin manages system-level tokens.</div>
            </div>
          </label>
          <label className="flex items-start gap-4 p-4 border rounded-xl dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <input type="radio" name="integration_mode" value="direct" checked={settings.integration_mode === 'direct'} onChange={e => setSettings({ ...settings, integration_mode: e.target.value })} className="mt-1" />
            <div>
              <div className="font-semibold">Direct Meta + BSP Mode</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Each workspace connects their own Facebook Pages, Instagram accounts, and WhatsApp Business numbers directly. Supports BSP providers.</div>
            </div>
          </label>
          <label className="flex items-start gap-4 p-4 border rounded-xl dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <input type="radio" name="integration_mode" value="workspace_choice" checked={settings.integration_mode === 'workspace_choice'} onChange={e => setSettings({ ...settings, integration_mode: e.target.value })} className="mt-1" />
            <div>
              <div className="font-semibold">Allow Workspace Admin to Choose</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Each workspace admin decides whether to use Partner Program or Direct/BSP mode.</div>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border dark:border-gray-800">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Facebook className="w-5 h-5" /> <Instagram className="w-5 h-5" /> Meta Direct API Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Meta App ID</label>
            <input type="text" value={settings.meta_app_id} onChange={e => setSettings({ ...settings, meta_app_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder="1234567890123456" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta App Secret</label>
            <div className="relative">
              <input type={showSecrets.appSecret ? 'text' : 'password'} value={settings.meta_app_secret} onChange={e => setSettings({ ...settings, meta_app_secret: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700 pr-10" placeholder="App Secret" />
              <button onClick={() => setShowSecrets({ ...showSecrets, appSecret: !showSecrets.appSecret })} className="absolute right-3 top-2.5 text-gray-400">
                {showSecrets.appSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">OAuth Redirect URL</label>
            <input type="text" value={settings.meta_oauth_redirect_url} onChange={e => setSettings({ ...settings, meta_oauth_redirect_url: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder="https://sectrosweb.test/api/auth/facebook/callback" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Webhook Verify Token</label>
            <div className="relative">
              <input type={showSecrets.webhookToken ? 'text' : 'password'} value={settings.meta_webhook_verify_token} onChange={e => setSettings({ ...settings, meta_webhook_verify_token: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700 pr-10" placeholder="sectros_webhook_verify" />
              <button onClick={() => setShowSecrets({ ...showSecrets, webhookToken: !showSecrets.webhookToken })} className="absolute right-3 top-2.5 text-gray-400">
                {showSecrets.webhookToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Required Permissions (comma-separated)</label>
            <input type="text" value={settings.meta_required_permissions} onChange={e => setSettings({ ...settings, meta_required_permissions: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Webhook Callback URL</label>
            <input type="text" value={settings.meta_webhook_callback_url} onChange={e => setSettings({ ...settings, meta_webhook_callback_url: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder="/api/social/webhook" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2"><Smartphone className="w-5 h-5" /> WhatsApp BSP Providers</h2>
          <button onClick={() => { setEditingProvider(null); setShowProviderModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm">
            <Plus className="w-4 h-4" /> Add Provider
          </button>
        </div>
        {providers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No providers configured. Add a WhatsApp BSP or Meta Direct provider.</p>
        ) : (
          <div className="space-y-3">
            {providers.map(provider => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-xl dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${provider.provider_type === 'meta_direct' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    {provider.provider_type === 'meta_direct' ? <Globe className="w-5 h-5 text-blue-600" /> : <Smartphone className="w-5 h-5 text-green-600" />}
                  </div>
                  <div>
                    <div className="font-semibold">{provider.provider_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {provider.provider_key} &middot; {provider.provider_type}
                      {provider.is_default && ' &middot; Default'}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${provider.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {provider.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${provider.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {provider.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => testProvider(provider.id)} className="p-2 text-sm border rounded-xl dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" title="Test Connection">
                    <Loader2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setEditingProvider(provider); setShowProviderModal(true) }} className="p-2 text-sm border rounded-xl dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Edit
                  </button>
                  <button onClick={() => deleteProvider(provider.id)} className="p-2 text-sm border rounded-xl dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Integration Settings
        </button>
      </div>

      {showProviderModal && <ProviderForm provider={editingProvider} onSave={saveProvider} onCancel={() => { setShowProviderModal(false); setEditingProvider(null) }} />}
    </div>
  )
}
