import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {Building2, TrendingUp, Cpu, Activity, ArrowUpRight, CreditCard, Globe, DollarSign, Phone, Headphones} from 'lucide-react';
import api from '../../services/centralApi';

export default function SaaSDashboard() {
  const [stats, setStats] = useState({
    active_tenants: 0,
    subscribed_count: 0,
    non_subscribed_count: 0,
    monthly_mrr: 0,
    system_load: '0%',
    plan_performance: { labels: [], series: [] },
    domain_stats: {
      total_domains: 0, total_revenue: 0, total_cost: 0,
      total_profit: 0, profit_margin: 0,
      cost_per_domain: 11.05, sell_per_domain: 15, profit_per_domain: 3.95
    },
    voice_stats: {
      total_credits_purchased: 0, total_credits_used: 0,
      total_revenue: 0, total_cost: 0, total_profit: 0,
      profit_margin: 0, credit_price: 0.10, credit_cost: 0.05, profit_per_credit: 0.05
    },
    phone_stats: {
      total_numbers: 0, assigned_numbers: 0, available_numbers: 0,
      monthly_fee: 5, monthly_cost: 2,
      monthly_revenue: 0, monthly_cost_total: 0,
      monthly_profit: 0, profit_per_number: 3
    }
  });
  const [recentTenants, setRecentTenants] = useState([]);
  const [health, setHealth] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper for generating consistent colors for dynamic plans
  const getPlanColor = (index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    return colors[index % colors.length];
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('saas/stats');
        if (statsRes.data?.stats) {
          setStats({
            active_tenants: statsRes.data.stats.active_tenants ?? 0,
            tenant_growth: statsRes.data.stats.tenant_growth ?? 0,
            subscribed_count: statsRes.data.stats.subscribed_count ?? 0,
            non_subscribed_count: statsRes.data.stats.non_subscribed_count ?? 0,
            monthly_mrr: statsRes.data.stats.monthly_mrr ?? 0,
            system_load: statsRes.data.stats.system_load ?? '0%',
            plan_performance: statsRes.data.stats.plan_performance ?? { labels: [], series: [] },
            domain_stats: statsRes.data.stats.domain_stats ?? {
              total_domains: 0, total_revenue: 0, total_cost: 0,
              total_profit: 0, profit_margin: 0,
              cost_per_domain: 11.05, sell_per_domain: 15, profit_per_domain: 3.95
            },
            voice_stats: statsRes.data.stats.voice_stats ?? {
              total_credits_purchased: 0, total_credits_used: 0,
              total_revenue: 0, total_cost: 0, total_profit: 0,
              profit_margin: 0, credit_price: 0.10, credit_cost: 0.05, profit_per_credit: 0.05
            },
            phone_stats: statsRes.data.stats.phone_stats ?? {
              total_numbers: 0, assigned_numbers: 0, available_numbers: 0,
              monthly_fee: 5, monthly_cost: 2,
              monthly_revenue: 0, monthly_cost_total: 0,
              monthly_profit: 0, profit_per_number: 3
            }
          });
        }
        
        if (statsRes.data?.recent_tenants) setRecentTenants(statsRes.data.recent_tenants);

        const healthRes = await api.get('saas/health');
        if (healthRes.data) setHealth(healthRes.data);

        const ticketsRes = await api.get('saas/tickets');
        if (Array.isArray(ticketsRes.data)) setTickets(ticketsRes.data);
      } catch (error) {
        console.error("Failed to fetch SaaS dashboard data:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-primary" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">Active Tenants</p>
            <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-foreground">{isLoading ? '...' : (stats.active_tenants ?? 0)}</h3>
                <span className={`text-xs font-semibold ${Number(stats.tenant_growth || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isLoading ? '...' : (Number(stats.tenant_growth || 0) >= 0 ? `+${stats.tenant_growth || 0}%` : `${stats.tenant_growth || 0}%`)}
                </span>
            </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">Monthly MRR</p>
            <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-foreground">${isLoading ? '...' : (stats.monthly_mrr ?? 0)}</h3>
                <span className="text-muted-foreground text-xs">Projected</span>
            </div>
        </div>

        {/* New Conversion Card */}
        <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                    <CreditCard className="w-6 h-6 text-teal-500" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    {isLoading ? '...' : `${Math.round((stats.subscribed_count / (stats.active_tenants || 1)) * 100)}% Conversion`}
                  </span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-[10px] font-bold uppercase">Subscribed</p>
                <h3 className="text-xl font-bold text-foreground">{stats.subscribed_count ?? 0}</h3>
              </div>
              <div className="border-l border-border pl-4">
                <p className="text-muted-foreground text-[10px] font-bold uppercase">trialing</p>
                <h3 className="text-xl font-bold text-muted-foreground">{stats.non_subscribed_count ?? 0}</h3>
              </div>
            </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <Cpu className="w-6 h-6 text-purple-500" />
                </div>
                <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">System Usage</p>
            <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-bold text-foreground">{isLoading ? '...' : (stats?.system_load ?? '0%')}</h3>
                <span className={`text-xs font-bold uppercase tracking-tighter ${parseInt(stats?.system_load) > 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {parseInt(stats?.system_load) > 70 ? 'High' : 'Healthy'}
                </span>
            </div>
        </div>
      </div>

      {/* Domain Registration Profit Widget */}
      {stats.domain_stats && (
      <div className="rounded-2xl bg-card border border-amber-500/20 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Globe className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Domain Registration Revenue</h3>
              <p className="text-muted-foreground text-xs">NameSilo domains — profit tracking</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border/50">
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Domains Sold</p>
            <p className="text-2xl font-bold text-foreground">{stats.domain_stats.total_domains}</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-500">${stats.domain_stats.total_revenue.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">@ ${stats.domain_stats.sell_per_domain}/domain</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-red-500">${stats.domain_stats.total_cost.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">@ ${stats.domain_stats.cost_per_domain}/domain</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Profit</p>
            <p className="text-2xl font-bold text-foreground">${stats.domain_stats.total_profit.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">${stats.domain_stats.profit_per_domain}/domain margin</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Profit Margin</p>
            <p className={`text-2xl font-bold ${stats.domain_stats.profit_margin >= 20 ? 'text-emerald-500' : stats.domain_stats.profit_margin > 0 ? 'text-amber-500' : 'text-red-500'}`}>
              {stats.domain_stats.profit_margin}%
            </p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${stats.domain_stats.profit_margin >= 20 ? 'bg-emerald-500' : stats.domain_stats.profit_margin > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(stats.domain_stats.profit_margin, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* AI Voice Credits Revenue Widget */}
      {stats.voice_stats && (
      <div className="rounded-2xl bg-card border border-blue-500/20 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Headphones className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Voice Credits Revenue</h3>
              <p className="text-muted-foreground text-xs">Credit purchases & usage — profit tracking</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border/50">
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Credits Purchased</p>
            <p className="text-2xl font-bold text-foreground">{stats.voice_stats.total_credits_purchased.toLocaleString()}</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-500">${stats.voice_stats.total_revenue.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">@ ${stats.voice_stats.credit_price}/credit</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-red-500">${stats.voice_stats.total_cost.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">@ ${stats.voice_stats.credit_cost}/credit</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Profit</p>
            <p className="text-2xl font-bold text-foreground">${stats.voice_stats.total_profit.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">${stats.voice_stats.profit_per_credit}/credit margin</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Profit Margin</p>
            <p className={`text-2xl font-bold ${stats.voice_stats.profit_margin >= 20 ? 'text-emerald-500' : stats.voice_stats.profit_margin > 0 ? 'text-amber-500' : 'text-red-500'}`}>
              {stats.voice_stats.profit_margin}%
            </p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${stats.voice_stats.profit_margin >= 20 ? 'bg-emerald-500' : stats.voice_stats.profit_margin > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(stats.voice_stats.profit_margin, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Phone Number Renewal Revenue Widget */}
      {stats.phone_stats && (
      <div className="rounded-2xl bg-card border border-purple-500/20 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Phone className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Phone Number Renewal Revenue</h3>
              <p className="text-muted-foreground text-xs">Monthly recurring — assigned number profit tracking</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border/50">
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Assigned</p>
            <p className="text-2xl font-bold text-foreground">{stats.phone_stats.assigned_numbers}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stats.phone_stats.available_numbers} available</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Monthly Revenue</p>
            <p className="text-2xl font-bold text-emerald-500">${stats.phone_stats.monthly_revenue.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">@ ${stats.phone_stats.monthly_fee}/number</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Monthly Cost</p>
            <p className="text-2xl font-bold text-red-500">${stats.phone_stats.monthly_cost_total.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">@ ${stats.phone_stats.monthly_cost}/number</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Monthly Profit</p>
            <p className="text-2xl font-bold text-foreground">${stats.phone_stats.monthly_profit.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">${stats.phone_stats.profit_per_number}/number margin</p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Numbers</p>
            <p className="text-2xl font-bold text-foreground">{stats.phone_stats.total_numbers}</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${stats.phone_stats.total_numbers > 0 ? (stats.phone_stats.assigned_numbers / stats.phone_stats.total_numbers) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Chart and Recent activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col min-h-[450px]">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Plan Performance</h3>
                    <p className="text-muted-foreground text-sm font-medium">Market penetration by subscription tier (Last 7 Days).</p>
                </div>
                <div className="flex gap-4">
                  {(stats.plan_performance.series || []).map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getPlanColor(i) }} />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.name}</span>
                    </div>
                  ))}
                </div>
            </div>

            <div className="flex-1 relative flex items-end">
               {!stats.plan_performance.series.length || stats.plan_performance.series.every(s => s.data.every(d => d === 0)) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                     <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-border">
                        <TrendingUp className="w-8 h-8 text-slate-600" />
                     </div>
                     <p className="text-slate-500 text-sm font-medium">Awaiting subscription signals...</p>
                  </div>
               ) : (
                  <div className="absolute inset-x-0 inset-y-0 flex items-end justify-between px-2 gap-4 pb-8 border-b border-border/30">
                    {stats.plan_performance.labels.map((label, labelIdx) => {
                      const maxVal = Math.max(...stats.plan_performance.series.map(s => Math.max(...s.data)), 1);
                      return (
                        <div key={labelIdx} className="flex-1 relative h-full flex flex-col justify-end group">
                           <div className="flex items-end gap-1 px-1 h-full">
                              {stats.plan_performance.series.map((series, seriesIdx) => {
                                 const val = series.data[labelIdx] || 0;
                                 const height = (val / maxVal) * 100;
                                 return (
                                   <div 
                                      key={seriesIdx} 
                                      className="flex-1 rounded-t-sm transition-all duration-500 hover:brightness-125 relative group/bar"
                                      style={{ 
                                        height: `${Math.max(height, 2)}%`, 
                                        backgroundColor: getPlanColor(seriesIdx),
                                        opacity: height === 0 ? 0.1 : 1
                                      }}
                                    >
                                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 z-30 transition-opacity whitespace-nowrap shadow-xl">
                                          {series.name}: {val}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-600 uppercase">
                              {label}
                           </div>
                        </div>
                      );
                    })}
                  </div>
               )}
            </div>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col focus-within:border-primary transition-colors">
            <h3 className="text-lg font-semibold text-foreground mb-6">Security & Deployments</h3>
            <div className="flex-1 space-y-6 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-border">
                {isLoading ? (
                    <p className="text-muted-foreground text-sm italic">Scanning terminal...</p>
                ) : (Array.isArray(recentTenants) && recentTenants.length === 0) ? (
                    <div className="text-center py-10 text-muted-foreground italic text-sm">No recent signals.</div>
                  ) : (
                    (Array.isArray(recentTenants) ? recentTenants : []).map((tenant) => (
                    <div key={tenant.id} className="p-4 rounded-xl border border-border bg-muted/30 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                                <Activity className="w-4 h-4 text-teal-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-foreground text-sm font-bold truncate">{tenant.business_name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{tenant.plan || 'Free Tier'}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground uppercase">
                                   {tenant.owner_name?.[0]}
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">
                                {tenant.created_at ? new Date(tenant.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                            </span>
                        </div>
                    </div>
                    ))
                )}
            </div>
            <Link to="/securegate/tenants" className="mt-6 text-center text-[10px] font-black uppercase text-primary hover:text-primary/80 transition-colors tracking-[0.2em]">View All Clusters</Link>
        </div>
      </div>

      {/* Hardware Telemetry & Support Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Functional Hardware Telemetry */}
         <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-lg font-semibold text-foreground">Hardware Hub</h3>
                  <p className="text-muted-foreground text-sm font-medium">Real-time server telemetry and resource usage.</p>
               </div>
               <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
                 health?.status?.includes('warning') ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
               }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse capitalize ${health?.status?.includes('warning') ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{health?.status || 'Active'}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPU Gauge (Normalized) */}
                <div className="p-6 rounded-2xl bg-muted/30 border border-border">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">CPU USAGE</span>
                      <span className="text-sm font-bold text-foreground">{health?.metrics?.cpu_percent || '0%'}</span>
                   </div>
                   <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${parseInt(health?.metrics?.cpu_percent) > 80 ? 'bg-red-500' : 'bg-primary'}`} 
                        style={{ width: health?.metrics?.cpu_percent || '0%' }} 
                      />
                   </div>
                </div>

                {/* Disk Tracker */}
                <div className="p-6 rounded-2xl bg-muted/30 border border-border">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">STORAGE</span>
                      <span className="text-[10px] font-bold text-foreground uppercase">{health?.metrics?.disk_used} / {health?.metrics?.disk_total}</span>
                   </div>
                   <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${parseInt(health?.metrics?.disk_percent) > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: health?.metrics?.disk_percent || '0%' }} 
                      />
                   </div>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter text-right">{health?.metrics?.disk_percent} CAPACITY</p>
                </div>

                {/* Memory Analysis */}
                <div className="md:col-span-2 p-6 rounded-2xl bg-muted/30 border border-border relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-600 dark:text-purple-400">
                           <Activity className="w-4 h-4" />
                         </div>
                         <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">MEMORY ALLOCATION</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">{health?.metrics?.ram_used} <span className="text-muted-foreground font-normal">of</span> {health?.metrics?.ram_total}</span>
                   </div>
                   <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-1000" 
                        style={{ width: health?.metrics?.ram_percent || '0%' }} 
                      />
                   </div>
                </div>
            </div>
         </div>

         {/* Support Tickets */}
         <div className="p-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-lg font-semibold text-foreground">Active Support Tickets</h3>
                  <p className="text-muted-foreground text-sm font-medium">Direct signals from tenant operators.</p>
               </div>
               <span className="bg-muted text-primary text-[10px] font-black px-3 py-1 rounded border border-border uppercase tracking-[0.2em]">{tickets?.length ?? 0} Critical</span>
            </div>

            <div className="flex-1 space-y-4">
               {!Array.isArray(tickets) || tickets.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/30 border-2 border-dashed border-border rounded-3xl">
                     <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 border border-border">
                        <Activity className="w-6 h-6 text-muted-foreground" />
                     </div>
                     <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Clear Signal</p>
                     <p className="text-muted-foreground/60 text-xs mt-1">All tenant systems are nominal under current support.</p>
                  </div>
               ) : (
                  (Array.isArray(tickets) ? tickets : []).map(ticket => (
                     <div key={ticket.id} className="p-5 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all group cursor-pointer active:scale-[0.98]">
                        <div className="flex items-center justify-between mb-3">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                                 ticket.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500' : 'bg-primary/10 border-primary/20 text-primary'
                           }`}>{ticket.priority}</span>
                           <span className="text-[10px] font-mono text-muted-foreground">{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '--'}</span>
                        </div>
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{ticket.subject}</p>
                        <div className="flex items-center justify-between mt-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                           <span>BY {ticket.tenant_id || 'UNKNOWN CLUSTER'}</span>
                           <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
  
      <div className="p-8 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute left-0 top-0 w-64 h-full bg-primary/5 -skew-x-12 -translate-x-32" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30">
                <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-foreground font-black uppercase tracking-widest">Infrastructure Control</h3>
              <p className="text-muted-foreground text-xs font-medium">Gateways: Stripe (Live) | Paystack (Live) | Flutterwave (Operational)</p>
            </div>
          </div>
          <Link 
            to="/securegate/settings" 
            onClick={() => localStorage.setItem('saas_settings_active_tab', 'payments')}
            className="relative z-10 px-8 py-3 bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-primary/10 hover:brightness-110 active:scale-95 flex items-center gap-2"
          >
            Manage Clusters <ArrowUpRight className="w-4 h-4" />
          </Link>
      </div>
    </div>
  );
}
