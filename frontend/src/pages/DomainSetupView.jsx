import React, { useState, useEffect } from 'react';
import {CheckCircle, XCircle, Copy, ExternalLink, Globe, Loader2, RefreshCw, Lock} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DomainSetupView() {
  const { user } = useAuth();
  const [customDomain, setCustomDomain] = useState('');
  const [domains, setDomains] = useState([]);
  const [dnsInstructions, setDnsInstructions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  const platformName = localStorage.getItem('platform_name') || 'System';
  const hasDomainFeature = (() => {
    const features = user?.features || {};
    if (Array.isArray(features)) return features.includes('custom_domain');
    if (typeof features === 'object' && features !== null) return !!features.custom_domain;
    return false;
  })();

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('domain/status');
      setDomains(res.data.domains || []);
      setDnsInstructions(res.data.dns_instructions || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load domain status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleConnect = async () => {
    if (!customDomain.trim()) return;
    try {
      setConnecting(true);
      setError(null);
      const res = await api.post('domain/connect', { domain: customDomain });
      setVerifyResult({
        type: 'connected',
        message: res.data.message,
        token: res.data.verification_token,
      });
      setCustomDomain('');
      await fetchStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect domain.');
    } finally {
      setConnecting(false);
    }
  };

  const handleVerify = async (domain) => {
    try {
      setVerifying(true);
      setError(null);
      setVerifyResult(null);
      const res = await api.post('domain/verify', { domain });
      setVerifyResult({ type: 'verify', data: res.data });
      await fetchStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const StatusBadge = ({ connected }) => (
    connected
      ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
          <CheckCircle size={12} /> Connected
        </span>
      : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-500">
          <XCircle size={12} /> Pending
        </span>
  );

  if (!hasDomainFeature) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-12 text-center space-y-4">
          <Lock className="w-12 h-12 mx-auto text-stone-400" />
          <h1 className="text-2xl font-bold text-stone-900">Custom Domain</h1>
          <p className="text-stone-600 max-w-md mx-auto">
            Custom domains are available on Pro and Enterprise plans.
            <br />Upgrade your subscription to connect your own domain.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Domain & Hosting Settings</h1>
        <p className="text-stone-600">Connect your custom domain to your {platformName} published website.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Connect Custom Domain */}
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-stone-500" />
          Connect Custom Domain
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Domain Name</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="e.g., www.myrestaurant.com" 
                className="flex-1 rounded-lg border border-stone-300 px-4 py-2 focus:ring-2 focus:ring-[#C2410C] outline-none"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              />
              <button
                onClick={handleConnect}
                disabled={connecting || !customDomain.trim()}
                className="bg-stone-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {connecting ? <Loader2 size={16} className="animate-spin" /> : null}
                Add Domain
              </button>
            </div>
          </div>

          {verifyResult?.type === 'connected' && verifyResult?.token && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
              <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> Domain Added — Verify Ownership
              </h3>
              <p className="text-sm text-amber-700">Add this TXT record to your domain's DNS to verify ownership:</p>
              <div className="bg-white border border-amber-200 rounded-lg p-4 space-y-2 text-sm font-mono">
                <div className="flex justify-between"><span className="font-bold text-amber-800">Type:</span><span>TXT</span></div>
                <div className="flex justify-between"><span className="font-bold text-amber-800">Name:</span><span>@</span></div>
                <div className="flex justify-between items-center gap-4">
                  <span className="font-bold text-amber-800 shrink-0">Value:</span>
                  <span className="break-all text-xs">{verifyResult.token}</span>
                  <button onClick={() => navigator.clipboard.writeText(verifyResult.token)} className="shrink-0 text-amber-600 hover:text-amber-800">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-amber-600">After adding the record, click "Verify" to confirm ownership.</p>
            </div>
          )}

          {verifyResult?.type === 'verify' && (
            <div className={`rounded-xl p-6 space-y-3 border ${verifyResult.data.connected ? 'bg-green-50 border-green-200' : 'bg-stone-50 border-stone-200'}`}>
              <h3 className={`font-bold text-sm flex items-center gap-2 ${verifyResult.data.connected ? 'text-green-800' : 'text-stone-700'}`}>
                {verifyResult.data.connected ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {verifyResult.data.connected ? 'Domain Connected!' : 'Domain Not Resolving'}
              </h3>
              {verifyResult.data.checks?.map((check, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  {check.status === 'ok'
                    ? <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                    : <XCircle size={14} className="text-stone-400 mt-0.5 shrink-0" />
                  }
                  <div>
                    <span className="font-mono text-xs font-bold">{check.type}</span>
                    <p className="text-stone-600 text-xs mt-0.5">{check.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-stone-50 rounded-xl p-6 border border-stone-200 space-y-4">
            <h3 className="font-medium text-stone-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Required DNS Records
            </h3>
            <p className="text-sm text-stone-600">Log into your domain provider (GoDaddy, Namecheap, etc.) and add the following records to connect your domain.</p>
            
            <div className="bg-white border text-sm border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-stone-100 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Value</th>
                    <th className="px-4 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">A</td>
                    <td className="px-4 py-3 font-mono text-xs">@</td>
                    <td className="px-4 py-3 font-mono text-xs">{dnsInstructions?.server_ip || '—'}</td>
                    <td className="px-4 py-3">
                      <CopyValue value={dnsInstructions?.server_ip || ''} />
                    </td>
                  </tr>
                  {dnsInstructions?.platform_domain && (
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs">CNAME</td>
                      <td className="px-4 py-3 font-mono text-xs">www</td>
                      <td className="px-4 py-3 font-mono text-xs">{dnsInstructions.platform_domain}</td>
                      <td className="px-4 py-3">
                        <CopyValue value={dnsInstructions.platform_domain} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Note: DNS changes can take up to 48 hours to propagate globally.
            </p>
          </div>
        </div>
      </div>

      {/* Current Domains */}
      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Connected Domains</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-stone-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading domains...
          </div>
        ) : domains.length === 0 ? (
          <p className="text-stone-500 text-sm py-8 text-center">No domains connected yet.</p>
        ) : (
          <div className="space-y-4">
            {domains.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-sm truncate">{d.domain}</span>
                    <StatusBadge connected={d.is_verified} />
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-stone-400">
                    <span className="capitalize">{d.type}</span>
                    {d.last_checked_at && <span>Last checked: {new Date(d.last_checked_at).toLocaleDateString()}</span>}
                    <span className={`capitalize ${d.ssl_status === 'active' ? 'text-green-500' : 'text-stone-400'}`}>
                      SSL: {d.ssl_status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {d.type === 'custom' && (
                    <button
                      onClick={() => handleVerify(d.domain)}
                      disabled={verifying}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
                    >
                      {verifying ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      Verify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CopyValue({ value }) {
  if (!value) return null;
  return (
    <button onClick={() => navigator.clipboard.writeText(value)} className="text-stone-400 hover:text-stone-600 transition-colors">
      <Copy size={14} />
    </button>
  );
}
