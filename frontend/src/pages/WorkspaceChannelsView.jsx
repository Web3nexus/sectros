import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Facebook, Instagram, Smartphone, Link, Unlink, Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, Globe } from 'lucide-react'
import api from '../services/api'

export default function WorkspaceChannelsView() {
  const [channels, setChannels] = useState([])
  const [integrationMode, setIntegrationMode] = useState('partner')
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(null)
  const [message, setMessage] = useState(null)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsAppForm, setWhatsAppForm] = useState({
    provider_name: '360dialog',
    phone_number: '',
    phone_number_id: '',
    waba_id: '',
    api_key: '',
    display_phone_number: '',
  })
  // Keep interval id so we can clear it on unmount
  const oauthIntervalRef = useRef(null)

  useEffect(() => {
    fetchChannels()
    const params = new URLSearchParams(window.location.search)
    if (params.get('oauth') === 'success') {
      setMessage({ type: 'success', text: `Channels connected successfully! (${params.get('count') || ''})` })
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (params.get('oauth') === 'error') {
      setMessage({ type: 'error', text: 'OAuth failed: ' + (params.get('reason') || 'Unknown error') })
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    return () => {
      if (oauthIntervalRef.current) clearInterval(oauthIntervalRef.current)
    }
  }, [])

  const fetchChannels = async () => {
    try {
      const res = await api.get('channels')
      setChannels(res.data.channels || [])
      setIntegrationMode(res.data.integration_mode || 'partner')
    } catch (err) {
      console.error('Failed to fetch channels', err)
    } finally {
      setLoading(false)
    }
  }

  // Shared helper: open an OAuth popup and watch for close
  const openOAuthPopup = (oauthUrl, channel) => {
    const width = 600, height = 800
    const left = window.screenX + (window.innerWidth - width) / 2
    const top = window.screenY + (window.innerHeight - height) / 2
    const popup = window.open(oauthUrl, 'meta-oauth', `width=${width},height=${height},left=${left},top=${top}`)
    if (!popup) {
      setMessage({ type: 'error', text: 'Popup blocked. Please allow popups for this site and try again.' })
      setConnecting(null)
      return
    }
    if (oauthIntervalRef.current) clearInterval(oauthIntervalRef.current)
    oauthIntervalRef.current = setInterval(async () => {
      if (popup.closed) {
        clearInterval(oauthIntervalRef.current)
        oauthIntervalRef.current = null
        fetchChannels()
        setConnecting(null)
      }
    }, 1000)
  }

  const initiateFacebookOAuth = async () => {
    setConnecting('facebook')
    try {
      const res = await api.post('channels/facebook/initiate')
      openOAuthPopup(res.data.oauth_url, 'facebook')
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to initiate Facebook OAuth' })
      setConnecting(null)
    }
  }

  const initiateInstagramOAuth = async () => {
    setConnecting('instagram')
    try {
      const res = await api.post('channels/instagram/initiate')
      openOAuthPopup(res.data.oauth_url, 'instagram')
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to initiate Instagram OAuth' })
      setConnecting(null)
    }
  }

  const connectWhatsApp = async () => {
    setConnecting('whatsapp')
    try {
      await api.post('channels/whatsapp/connect', whatsAppForm)
      setShowWhatsAppModal(false)
      setWhatsAppForm({ provider_name: '360dialog', phone_number: '', phone_number_id: '', waba_id: '', api_key: '', display_phone_number: '' })
      setMessage({ type: 'success', text: 'WhatsApp channel connected' })
      fetchChannels()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to connect WhatsApp' })
    } finally {
      setConnecting(null)
    }
  }

  const disconnectChannel = async (id) => {
    if (!confirm('Disconnect this channel?')) return
    try {
      await api.post(`channels/${id}/disconnect`)
      setMessage({ type: 'success', text: 'Channel disconnected' })
      fetchChannels()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to disconnect' })
    }
  }

  const getChannelIcon = (type) => {
    switch (type) {
      case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-600" />
      case 'whatsapp': return <Smartphone className="w-5 h-5 text-green-600" />
      default: return <MessageSquare className="w-5 h-5" />
    }
  }

  const getChannelName = (ch) => {
    switch (ch.channel_type) {
      case 'facebook': return ch.page_name || ch.page_id || 'Facebook Page'
      case 'instagram': return ch.instagram_username || ch.instagram_account_id || 'Instagram Account'
      case 'whatsapp': return ch.display_phone_number || ch.phone_number_id || 'WhatsApp Number'
      default: return ch.channel_type
    }
  }

  const getStatusBadge = (ch) => {
    if (ch.is_expired) return <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"><AlertTriangle className="w-3 h-3" /> Expired</span>
    if (ch.connection_status === 'connected') return <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30"><CheckCircle className="w-3 h-3" /> Connected</span>
    if (ch.connection_status === 'error') return <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30"><XCircle className="w-3 h-3" /> Error</span>
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500"><Loader2 className="w-3 h-3 animate-spin" /> {ch.connection_status}</span>
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>

  const connectedChannels = channels.filter(c => c.connection_status === 'connected')

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connected Channels</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Integration Mode: {integrationMode === 'partner' ? 'Partner Program' : integrationMode === 'direct' ? 'Direct Meta + BSP' : 'Workspace Choice'}
          </p>
        </div>
      </div>

      {message && (
        <div className={`px-6 py-3 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {connectedChannels.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border dark:border-gray-800 text-center">
          <Globe className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Channels Connected</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Connect your Facebook Page, Instagram Business account, or WhatsApp Business number to start receiving messages in your inbox.</p>
        </div>
      )}

      {connectedChannels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {connectedChannels.map(ch => (
            <div key={ch.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getChannelIcon(ch.channel_type)}
                  <div>
                    <div className="font-semibold">{getChannelName(ch)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{ch.channel_type} &middot; {ch.integration_mode}</div>
                  </div>
                </div>
                {getStatusBadge(ch)}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => disconnectChannel(ch.id)} className="flex items-center gap-1 text-sm px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Unlink className="w-3 h-3" /> Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border dark:border-gray-800">
        <h2 className="text-lg font-bold mb-6">Add New Channel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={initiateFacebookOAuth} disabled={connecting !== null} className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50">
            <Facebook className="w-10 h-10 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold">Facebook Page</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Connect a Facebook Page for Messenger</div>
            </div>
            {connecting === 'facebook' ? <Loader2 className="w-5 h-5 animate-spin mt-2" /> : <Link className="w-5 h-5 text-blue-600 mt-2" />}
          </button>
          <button onClick={initiateInstagramOAuth} disabled={connecting !== null} className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-pink-200 dark:border-pink-800 rounded-2xl hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors disabled:opacity-50">
            <Instagram className="w-10 h-10 text-pink-600" />
            <div className="text-center">
              <div className="font-semibold">Instagram</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Connect Instagram Business/Creator account</div>
            </div>
            {connecting === 'instagram' ? <Loader2 className="w-5 h-5 animate-spin mt-2" /> : <Link className="w-5 h-5 text-pink-600 mt-2" />}
          </button>
          <button onClick={() => setShowWhatsAppModal(true)} disabled={connecting !== null} className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-green-200 dark:border-green-800 rounded-2xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50">
            <Smartphone className="w-10 h-10 text-green-600" />
            <div className="text-center">
              <div className="font-semibold">WhatsApp Business</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Connect via BSP (360dialog, Twilio, etc.)</div>
            </div>
            {connecting === 'whatsapp' ? <Loader2 className="w-5 h-5 animate-spin mt-2" /> : <Link className="w-5 h-5 text-green-600 mt-2" />}
          </button>
        </div>
      </div>

      {channels.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border dark:border-gray-800">
          <h2 className="text-lg font-bold mb-4">All Channels</h2>
          <div className="space-y-3">
            {channels.map(ch => (
              <div key={ch.id} className="flex items-center justify-between p-4 border rounded-xl dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {getChannelIcon(ch.channel_type)}
                  <div>
                    <div className="font-medium">{getChannelName(ch)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {ch.provider_name} &middot; {ch.integration_mode} &middot; {ch.webhook_status}
                      {ch.last_error && <span className="text-red-500 ml-2">Error: {ch.last_error}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(ch)}
                  {ch.connection_status === 'connected' ? (
                    <button onClick={() => disconnectChannel(ch.id)} className="p-2 text-sm border border-red-200 dark:border-red-800 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Unlink className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => { /* reconnect logic */ }} className="p-2 text-sm border rounded-xl dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Connect WhatsApp Business</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Provider</label>
                <select value={whatsAppForm.provider_name} onChange={e => setWhatsAppForm({ ...whatsAppForm, provider_name: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700">
                  <option value="360dialog">360dialog</option>
                  <option value="twilio">Twilio</option>
                  <option value="meta">Meta Direct (WhatsApp Cloud API)</option>
                  <option value="bird">Bird/MessageBird</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input type="text" value={whatsAppForm.display_phone_number} onChange={e => setWhatsAppForm({ ...whatsAppForm, display_phone_number: e.target.value, phone_number: e.target.value.replace(/[^0-9]/g, '') })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder="+1234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                <input type="text" value={whatsAppForm.phone_number_id} onChange={e => setWhatsAppForm({ ...whatsAppForm, phone_number_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder="From Meta or BSP dashboard" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WABA ID (optional)</label>
                <input type="text" value={whatsAppForm.waba_id} onChange={e => setWhatsAppForm({ ...whatsAppForm, waba_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">API Key / Auth Token</label>
                <input type="password" value={whatsAppForm.api_key} onChange={e => setWhatsAppForm({ ...whatsAppForm, api_key: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder="From BSP dashboard" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowWhatsAppModal(false)} className="px-6 py-2 border rounded-xl dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={connectWhatsApp} disabled={connecting === 'whatsapp'} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50">
                {connecting === 'whatsapp' && <Loader2 className="w-4 h-4 animate-spin" />}
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
