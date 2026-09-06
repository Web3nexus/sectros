import React, { useState, useEffect } from 'react'
import { MessageSquare, Save, Globe, Smartphone, Facebook, Instagram, Loader2, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, ChevronDown, ChevronRight, RefreshCw, ExternalLink, Shield, Layers, Users, Clock, Activity } from 'lucide-react'
import centralApi from '../services/centralApi'

const STATUS_VARIANTS = {
  connected: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  disconnected: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  not_submitted: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  submitted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  not_configured: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

function StatusBadge({ status, label }) {
  const variant = STATUS_VARIANTS[status] || STATUS_VARIANTS.disconnected
  return <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${variant}`}>{label || status}</span>
}

function Section({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors">
        <h2 className="text-lg font-bold flex items-center gap-2">{Icon && <Icon className="w-5 h-5" />} {title}</h2>
        {open ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  )
}

export default function MessagingIntegrationView() {
  const [settings, setSettings] = useState({
    integration_mode: 'meta_direct',
    meta_direct_enabled: true,
    legacy_tech_provider_enabled: false,
    legacy_external_bsp_enabled: false,
    meta_app_id: '',
    meta_app_secret: '',
    meta_business_id: '',
    meta_webhook_verify_token: '',
    meta_webhook_callback_url: '/api/social/webhook',
    meta_oauth_redirect_url: '',
    meta_required_permissions: 'pages_messaging,pages_manage_metadata,instagram_basic,instagram_manage_messages',
    whatsapp_embedded_signup_enabled: true,
    whatsapp_coexistence_enabled: false,
    coexistence_status: 'not_configured',
    data_deletion_callback_url: '',
    privacy_policy_url: '',
    terms_of_service_url: '',
    app_review_status: 'not_submitted',
    whatsapp_cloud_api_status: 'not_configured',
    embedded_signup_status: 'not_configured',
    instagram_messaging_status: 'not_configured',
    facebook_messaging_status: 'not_configured',
  })
  const [health, setHealth] = useState(null)
  const [legacyProviders, setLegacyProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [showSecrets, setShowSecrets] = useState({})

  useEffect(() => {
    Promise.all([fetchSettings(), fetchHealth(), fetchLegacyProviders()])
      .finally(() => setLoading(false))
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await centralApi.get('saas/messaging/settings')
      setSettings(prev => ({ ...prev, ...res.data }))
    } catch (err) {
      console.error('Failed to fetch settings', err)
    }
  }

  const fetchHealth = async () => {
    try {
      const res = await centralApi.get('saas/messaging/health')
      setHealth(res.data)
    } catch (err) {
      console.error('Failed to fetch health', err)
    }
  }

  const fetchLegacyProviders = async () => {
    try {
      const res = await centralApi.get('saas/messaging/legacy-providers')
      setLegacyProviders(res.data.legacy_providers || [])
    } catch (err) {
      console.error('Failed to fetch legacy providers', err)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await centralApi.post('saas/messaging/settings', settings)
      setMessage({ type: 'success', text: 'Integration settings saved' })
      fetchSettings()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const refreshHealth = async () => {
    try {
      await centralApi.post('saas/messaging/health/refresh')
      await fetchHealth()
      setMessage({ type: 'success', text: 'Health data refreshed' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to refresh health' })
    }
  }

  const retryWebhook = async (channelId) => {
    try {
      const res = await centralApi.post(`saas/messaging/channels/${channelId}/retry-webhook`)
      setMessage({ type: res.data.success ? 'success' : 'error', text: res.data.success ? 'Webhook resubscribed' : 'Webhook retry failed' })
      fetchHealth()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Webhook retry failed' })
    }
  }

  const statCard = (label, value, Icon, color) => (
    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value ?? '-'}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </div>
  )

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messaging Integration</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Meta Direct integration — WhatsApp Cloud API, Facebook Messenger, Instagram Messaging
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refreshHealth} className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-muted text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh Health
          </button>
          <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      {message && (
        <div className={`px-6 py-3 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Integration Mode */}
      <Section title="Integration Mode" icon={Layers} defaultOpen={false}>
        <div className="space-y-3">
          <label className="flex items-start gap-4 p-4 border rounded-xl border-border cursor-pointer hover:bg-muted">
            <input type="radio" name="integration_mode" value="meta_direct" checked={settings.integration_mode === 'meta_direct'} onChange={e => setSettings({ ...settings, integration_mode: e.target.value })} className="mt-1" />
            <div>
              <div className="font-semibold">Meta Direct (Default)</div>
              <div className="text-sm text-gray-500">Tenants connect via WhatsApp Embedded Signup, Facebook OAuth, or Instagram OAuth — all direct to Meta.</div>
            </div>
          </label>
          <label className="flex items-start gap-4 p-4 border rounded-xl border-border cursor-pointer hover:bg-muted">
            <input type="radio" name="integration_mode" value="legacy_tech_provider" checked={settings.integration_mode === 'legacy_tech_provider'} onChange={e => setSettings({ ...settings, integration_mode: e.target.value })} className="mt-1" />
            <div>
              <div className="font-semibold">Legacy Tech Provider</div>
              <div className="text-sm text-gray-500">Use an existing Meta Tech Provider / Partner Program. Admin manages system-level tokens.</div>
            </div>
          </label>
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.whatsapp_embedded_signup_enabled} onChange={e => setSettings({ ...settings, whatsapp_embedded_signup_enabled: e.target.checked })} />
              Enable WhatsApp Embedded Signup
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.whatsapp_coexistence_enabled} onChange={e => setSettings({ ...settings, whatsapp_coexistence_enabled: e.target.checked })} />
              Enable WhatsApp Coexistence (requires Meta approval)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.legacy_external_bsp_enabled} onChange={e => setSettings({ ...settings, legacy_external_bsp_enabled: e.target.checked })} />
              Enable Legacy External BSP (read-only)
            </label>
          </div>
          {settings.whatsapp_coexistence_enabled && (
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Coexistence Status</label>
              <select value={settings.coexistence_status} onChange={e => setSettings({ ...settings, coexistence_status: e.target.value })} className="px-4 py-2 border rounded-xl dark:bg-muted dark:border-border text-sm">
                <option value="not_configured">Not Configured</option>
                <option value="pending_review">Pending Meta Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>
      </Section>

      {/* Meta App Settings */}
      <Section title="Meta App Settings" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Meta App ID</label>
            <input type="text" value={settings.meta_app_id} onChange={e => setSettings({ ...settings, meta_app_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-muted dark:border-border" placeholder="1234567890123456" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta App Secret</label>
            <div className="relative">
              <input type={showSecrets.appSecret ? 'text' : 'password'} value={settings.meta_app_secret} onChange={e => setSettings({ ...settings, meta_app_secret: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-muted dark:border-border pr-10" />
              <button onClick={() => setShowSecrets({ ...showSecrets, appSecret: !showSecrets.appSecret })} className="absolute right-3 top-2.5 text-gray-400">
                {showSecrets.appSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Business ID</label>
            <input type="text" value={settings.meta_business_id} onChange={e => setSettings({ ...settings, meta_business_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-muted dark:border-border" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">OAuth Redirect URL</label>
            <input type="text" value={settings.meta_oauth_redirect_url} onChange={e => setSettings({ ...settings, meta_oauth_redirect_url: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-muted dark:border-border" placeholder="https://sectrosweb.test/api/auth/facebook/callback" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Webhook Verify Token</label>
            <div className="relative">
              <input type={showSecrets.webhookToken ? 'text' : 'password'} value={settings.meta_webhook_verify_token} onChange={e => setSettings({ ...settings, meta_webhook_verify_token: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-muted dark:border-border pr-10" />
              <button onClick={() => setShowSecrets({ ...showSecrets, webhookToken: !showSecrets.webhookToken })} className="absolute right-3 top-2.5 text-gray-400">
                {showSecrets.webhookToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Webhook Callback URL</label>
            <input type="text" value={settings.meta_webhook_callback_url} onChange={e => setSettings({ ...settings, meta_webhook_callback_url: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-muted dark:border-border" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Required Permissions (comma-separated)</label>
            <input type="text" value={settings.meta_required_permissions} onChange={e => setSettings({ ...settings, meta_required_permissions: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-muted dark:border-border" />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold mb-4">Privacy & Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Privacy Policy URL</label>
              <input type="text" value={settings.privacy_policy_url} onChange={e => setSettings({ ...settings, privacy_policy_url: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-muted dark:border-border" placeholder="https://example.com/privacy" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Terms of Service URL</label>
              <input type="text" value={settings.terms_of_service_url} onChange={e => setSettings({ ...settings, terms_of_service_url: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-muted dark:border-border" placeholder="https://example.com/terms" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Deletion Callback URL</label>
              <input type="text" value={settings.data_deletion_callback_url} onChange={e => setSettings({ ...settings, data_deletion_callback_url: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-muted dark:border-border" placeholder="https://example.com/data-deletion" />
            </div>
          </div>
        </div>
      </Section>

      {/* App Review Status */}
      <Section title="App Review & Platform Status" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <div className="font-semibold text-sm">App Review</div>
              <div className="text-xs text-gray-500">Meta App Review submission</div>
            </div>
            <StatusBadge status={settings.app_review_status} label={settings.app_review_status?.replace(/_/g, ' ')} />
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <div className="font-semibold text-sm">Facebook Messenger</div>
              <div className="text-xs text-gray-500">pages_messaging permission</div>
            </div>
            <StatusBadge status={settings.facebook_messaging_status} label={settings.facebook_messaging_status?.replace(/_/g, ' ')} />
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <div className="font-semibold text-sm">Instagram Messaging</div>
              <div className="text-xs text-gray-500">instagram_manage_messages</div>
            </div>
            <StatusBadge status={settings.instagram_messaging_status} label={settings.instagram_messaging_status?.replace(/_/g, ' ')} />
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <div className="font-semibold text-sm">WhatsApp Cloud API</div>
              <div className="text-xs text-gray-500">WABA approval status</div>
            </div>
            <StatusBadge status={settings.whatsapp_cloud_api_status} label={settings.whatsapp_cloud_api_status?.replace(/_/g, ' ')} />
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <div className="font-semibold text-sm">Embedded Signup</div>
              <div className="text-xs text-gray-500">WhatsApp Embedded Signup</div>
            </div>
            <StatusBadge status={settings.embedded_signup_status} label={settings.embedded_signup_status?.replace(/_/g, ' ')} />
          </div>
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <div className="font-semibold text-sm">Coexistence</div>
              <div className="text-xs text-gray-500">WhatsApp Coexistence migration</div>
            </div>
            <StatusBadge status={settings.coexistence_status} label={settings.coexistence_status?.replace(/_/g, ' ')} />
          </div>
        </div>
      </Section>

      {/* Integration Health */}
      {health && (
        <Section title="Integration Health" icon={Activity}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statCard('Connected Workspaces', health.connected_workspaces, Users, 'bg-blue-100 dark:bg-blue-900/30 text-blue-600')}
            {statCard('WhatsApp Numbers', health.connected_whatsapp_numbers, Smartphone, 'bg-green-100 dark:bg-green-900/30 text-green-600')}
            {statCard('Facebook Pages', health.connected_facebook_pages, Facebook, 'bg-blue-100 dark:bg-blue-900/30 text-blue-600')}
            {statCard('Instagram Accounts', health.connected_instagram_accounts, Instagram, 'bg-pink-100 dark:bg-pink-900/30 text-pink-600')}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statCard('Total Channels', health.total_channels, Layers, 'bg-gray-100 dark:bg-gray-800 text-gray-600')}
            {statCard('Connected', health.connected_channels, CheckCircle, 'bg-green-100 dark:bg-green-900/30 text-green-600')}
            {statCard('Disconnected', health.disconnected_channels, XCircle, 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600')}
            {statCard('Errors', health.error_channels, AlertTriangle, 'bg-red-100 dark:bg-red-900/30 text-red-600')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statCard('Expiring Tokens (< 7 days)', health.expiring_tokens, Clock, 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600')}
            {statCard('Expired Tokens', health.expired_tokens, XCircle, 'bg-red-100 dark:bg-red-900/30 text-red-600')}
            {statCard('Webhook Errors', health.webhook_errors, AlertTriangle, 'bg-red-100 dark:bg-red-900/30 text-red-600')}
          </div>
        </Section>
      )}

      {/* Connected Workspaces */}
      {health?.connected_workspaces_list?.length > 0 && (
        <Section title={`Connected Workspaces (${health.connected_workspaces_list.length})`} icon={Users}>
          <div className="space-y-3">
            {health.connected_workspaces_list.map((ws, i) => (
              <div key={ws.tenant_id} className="border border-border rounded-xl p-4">
                <div className="font-semibold text-sm mb-2">Tenant #{ws.tenant_id}</div>
                <div className="space-y-2">
                  {ws.channels.map(ch => (
                    <div key={`${ws.tenant_id}-${ch.channel_type}-${ch.display_phone_number || ch.page_name || ''}`} className="flex items-center justify-between text-sm pl-4 border-l-2 border-border">
                      <div className="flex items-center gap-3">
                        {ch.channel_type === 'whatsapp' && <Smartphone className="w-4 h-4 text-green-600" />}
                        {ch.channel_type === 'facebook' && <Facebook className="w-4 h-4 text-blue-600" />}
                        {ch.channel_type === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                        <span>{ch.display_phone_number || ch.page_name || ch.instagram_username || ch.channel_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={ch.connection_status} />
                        {ch.last_error && <span className="text-xs text-red-500 max-w-[200px] truncate" title={ch.last_error}>{ch.last_error}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Expiring Tokens */}
      {health?.expiring_tokens_list?.length > 0 && (
        <Section title={`Expiring Tokens (${health.expiring_tokens_list.length})`} icon={Clock}>
          <div className="space-y-2">
            {health.expiring_tokens_list.map((token, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border rounded-xl text-sm">
                <div className="flex items-center gap-3">
                  {token.channel_type === 'whatsapp' && <Smartphone className="w-4 h-4 text-green-600" />}
                  {token.channel_type === 'facebook' && <Facebook className="w-4 h-4 text-blue-600" />}
                  {token.channel_type === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                  <span>Tenant #{token.tenant_id}</span>
                  <span className="text-gray-500 capitalize">{token.channel_type}</span>
                  <span className="text-yellow-600">{new Date(token.token_expires_at).toLocaleDateString()}</span>
                </div>
                <StatusBadge status={token.connection_status} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Webhook Errors */}
      {health?.webhook_errors_list?.length > 0 && (
        <Section title={`Webhook Errors (${health.webhook_errors_list.length})`} icon={AlertTriangle}>
          <div className="space-y-2">
            {health.webhook_errors_list.map((err, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-red-200 dark:border-red-800 rounded-xl text-sm">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {err.channel_type === 'whatsapp' && <Smartphone className="w-4 h-4 text-green-600 shrink-0" />}
                  {err.channel_type === 'facebook' && <Facebook className="w-4 h-4 text-blue-600 shrink-0" />}
                  {err.channel_type === 'instagram' && <Instagram className="w-4 h-4 text-pink-600 shrink-0" />}
                  <span className="shrink-0">Tenant #{err.tenant_id}</span>
                  <span className="text-gray-500 capitalize shrink-0">{err.channel_type}</span>
                  {err.last_error && <span className="text-red-500 truncate" title={err.last_error}>{err.last_error}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={err.webhook_status === 'subscribed' ? 'connected' : 'error'} label={err.webhook_status} />
                  <button onClick={() => retryWebhook(err.id)} className="p-1.5 border border-border rounded-lg hover:bg-muted" title="Retry Webhook">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Legacy Providers (read-only) */}
      {legacyProviders.length > 0 && (
        <Section title={`Legacy BSP Providers (${legacyProviders.length})`} icon={Shield} defaultOpen={false}>
          <div className="space-y-3">
            {legacyProviders.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div>
                  <div className="font-semibold">{p.provider_name}</div>
                  <div className="text-sm text-gray-500">{p.provider_key} &middot; {p.provider_type}{p.is_default && ' &middot; Default'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.is_active ? 'connected' : 'disconnected'} label={p.is_active ? 'Active' : 'Inactive'} />
                  {p.has_api_key && <CheckCircle className="w-4 h-4 text-green-500" title="Has API key" />}
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-500 pt-2">Legacy BSP providers are read-only. New connections use Meta Direct only.</p>
          </div>
        </Section>
      )}
    </div>
  )
}
