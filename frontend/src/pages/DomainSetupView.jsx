import React, { useState } from 'react';
import { CheckCircle, Copy, ExternalLink, Globe } from 'lucide-react';

export default function DomainSetupView() {
  const [customDomain, setCustomDomain] = useState('');
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Domain & Hosting Settings</h1>
        <p className="text-stone-600">Connect your custom domain to your {localStorage.getItem('platform_name') || 'System'} published website.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-stone-500" />
          Connect Existing Domain
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
              />
              <button className="bg-stone-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-stone-800 transition-colors">
                Verify Connection
              </button>
            </div>
          </div>

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
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">A</td>
                    <td className="px-4 py-3 font-mono text-xs">@</td>
                    <td className="px-4 py-3 font-mono text-xs flex justify-between items-center group">
                      104.21.56.92
                      <button className="text-stone-400 opacity-0 group-hover:opacity-100"><Copy className="w-4 h-4"/></button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">CNAME</td>
                    <td className="px-4 py-3 font-mono text-xs">www</td>
                    <td className="px-4 py-3 font-mono text-xs flex justify-between items-center group">
                      cname.resev.it
                      <button className="text-stone-400 opacity-0 group-hover:opacity-100"><Copy className="w-4 h-4"/></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Note: DNS changes can take up to 48 hours to propagate globally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
