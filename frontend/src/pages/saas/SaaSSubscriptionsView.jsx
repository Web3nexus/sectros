import React, { useState, useEffect } from 'react';
import {CreditCard, TrendingUp, Download, Search, CheckCircle, CircleX as XCircle, Loader2, Activity} from 'lucide-react';
import api from '../../services/centralApi';

export default function SaaSSubscriptionsView() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('saas/billing/metrics');
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch billing metrics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen bg-card flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  const { metrics, recent_tenants } = data || { metrics: {}, recent_tenants: [] };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Billing & Subscriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage tenant plans, monitor MRR, and view recent activity.</p>
        </div>
        
        <button className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-border">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <p className="text-muted-foreground text-sm font-medium flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Monthly MRR
              </p>
              <p className="text-2xl font-bold text-foreground">${metrics.total_mrr?.toLocaleString() ?? '0'}</p>
              <p className="text-xs text-emerald-500 mt-1">Live Engine Data</p>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <p className="text-muted-foreground text-sm font-medium mb-2">Active Paid</p>
              <p className="text-2xl font-bold text-foreground">{metrics.active_paid ?? '0'}</p>
              <p className="text-xs text-muted-foreground mt-1">SaaS Revenue Stream</p>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <p className="text-muted-foreground text-sm font-medium mb-2">Free Pier</p>
              <p className="text-2xl font-bold text-foreground">{metrics.free_tier ?? '0'}</p>
              <p className="text-xs text-muted-foreground mt-1">Freemium Conversion</p>
          </div>
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <p className="text-muted-foreground text-sm font-medium mb-2 flex items-center justify-between">
                  Churn Rate <span className="text-emerald-500 text-xs text-right">Healthy</span>
              </p>
              <p className="text-2xl font-bold text-foreground">{metrics.churn_rate ?? '0.0%'}</p>
              <p className="text-xs text-muted-foreground mt-1">Retention Metrics</p>
          </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-sm w-full scrollbar-thin">
        <div className="p-4 border-b border-border flex items-center justify-between min-w-[1400px]">
             <div className="flex items-center gap-3">
               <Activity className="w-5 h-5 text-primary" />
               <h3 className="text-foreground font-semibold">Recent Subscription Activity</h3>
             </div>
        </div>
        
        <table className="w-full text-left text-sm min-w-[1400px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground">
              <th className="p-4 font-medium">Tenant Business</th>
              <th className="p-4 font-medium">Owner Email</th>
              <th className="p-4 font-medium">Plan</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Deployment Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
             {(Array.isArray(recent_tenants) && recent_tenants.length > 0) ? recent_tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium text-primary">{tenant.business_name}</td>
                  <td className="p-4 text-muted-foreground">{tenant.owner_email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      tenant.plan === 'enterprise' ? 'text-purple-600 bg-purple-100 border border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800' :
                      tenant.plan === 'pro' ? 'text-blue-600 bg-blue-100 border border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800' :
                      'text-muted-foreground bg-muted border border-border'
                    }`}>
                      {tenant.plan ?? 'free'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> 
                      <span className="capitalize text-muted-foreground font-medium">{tenant.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right text-muted-foreground font-medium">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </td>
              </tr>
             )) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-muted-foreground italic">No recent subscription activity.</td>
              </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
