import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {LayoutGrid, LayoutDashboard, Building2, CreditCard, PackageOpen, MessageSquare, Mail, Shield, Globe, Settings, Users, LogOut, Bell, AlertTriangle, CheckCircle, Menu, X, Palette, PlugZap, Phone, Radio, Smartphone, ChevronDown, Headphones} from 'lucide-react';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import { useBranding } from '../hooks/useBranding';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import centralApi from '../services/centralApi';

export function SaaSAdminLayout() {
  const location = useLocation();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [unresolvedTickets, setUnresolvedTickets] = useState(0);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState(['ai-voice']);
  const intervalRef = useRef(null);
  const settings = useBranding();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await centralApi.get('saas/notifications');
      setAdminNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unread_count || 0);
    } catch (e) { /* silent */ }
  }, []);

  const fetchUnresolved = useCallback(async () => {
    try {
      const res = await centralApi.get('saas/tickets/unresolved-count');
      setUnresolvedTickets(res.data?.count ?? 0);
    } catch (e) { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnresolved();
    intervalRef.current = setInterval(() => {
      fetchNotifications();
      fetchUnresolved();
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifications, fetchUnresolved]);

  const markRead = useCallback(async (id) => {
    const ticketId = id.replace('ticket_', '');
    setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    try {
      await centralApi.post(`saas/notifications/${ticketId}/dismiss`);
      fetchUnresolved();
    } catch (e) { /* silent */ }
  }, [fetchUnresolved]);

  const markAllRead = useCallback(async () => {
    setAdminNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    setUnreadCount(0);
    try {
      await centralApi.post('saas/notifications/dismiss-all');
      fetchUnresolved();
    } catch (e) { /* silent */ }
  }, [fetchUnresolved]);

  useInactivityLogout();

  const toggleGroup = (group) => {
    setExpandedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
  };

  const itemsBeforeVoice = [
    { name: 'Overview', path: '/securegate/dashboard', icon: LayoutDashboard },
    { name: 'Tenants', path: '/securegate/tenants', icon: Building2 },
    { name: 'Subscriptions', path: '/securegate/subscriptions', icon: CreditCard },
    { name: 'Support', path: '/securegate/tickets', icon: MessageSquare },
    { name: 'Email Hub', path: '/securegate/email-templates', icon: Mail },
  ];

  const itemsAfterVoice = [
    { name: 'Content & Theme Store', path: '/securegate/cms', icon: LayoutGrid },
    { name: 'Website Templates', path: '/securegate/website-themes', icon: Palette },
    { name: 'Translations', path: '/securegate/translations', icon: Globe },
    { name: 'Plan Management', path: '/securegate/plans', icon: PackageOpen },
    { name: 'Integrations', path: '/securegate/integrations', icon: PlugZap },
    { name: 'Admin Management', path: '/securegate/admins', icon: Shield },
    { name: 'System Settings', path: '/securegate/settings', icon: Settings },
    { name: 'My Account', path: '/securegate/account', icon: Users },
  ];

  const aiVoiceChildren = [
    { name: 'AI Voice Providers', path: '/securegate/voice-providers', icon: Phone },
    { name: 'AI Phone Numbers', path: '/securegate/voice-phone-numbers', icon: Smartphone },
    { name: 'Voice Agent Plans', path: '/securegate/voice-agent-plans', icon: Radio },
  ];

  const isVoiceActive = aiVoiceChildren.some(c => location.pathname === c.path);
  const allNavItems = [...itemsBeforeVoice, ...itemsAfterVoice, ...aiVoiceChildren];

  return (
    <div className="min-h-screen bg-background flex text-muted-foreground">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-card/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside className={`bg-card border-r border-border flex flex-col h-screen fixed lg:sticky top-0 z-50 transition-all duration-300 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-4 md:p-6 border-b border-border bg-card flex items-center justify-between lg:justify-center transition-colors`}>
           <Link to="/securegate/dashboard" className={`flex flex-col items-center ${isSidebarCollapsed ? '' : 'w-full'}`} onClick={() => setIsMobileSidebarOpen(false)}>
              {settings.platform_logo_url ? (
                 <img src={settings.platform_logo_url} alt={settings.platform_name} className="h-10 w-auto object-contain mb-2" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center ring-2 ring-blue-600/20 mb-2">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
              {!isSidebarCollapsed && (
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold text-center">Super Admin</p>
              )}
           </Link>
           <button className="lg:hidden text-muted-foreground hover:text-foreground shrink-0" onClick={() => setIsMobileSidebarOpen(false)}>
              <X size={20} />
           </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {isSidebarCollapsed ? (
            <>
              {[...itemsBeforeVoice, ...itemsAfterVoice].map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 group ${
                      isActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}>
                    <Icon className="w-5 h-5 shrink-0" />
                  </Link>
                );
              })}
              <Link to="/securegate/voice-providers" onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 group ${
                  isVoiceActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                <Headphones className="w-5 h-5 shrink-0" />
              </Link>
            </>
          ) : (
            <>
              {itemsBeforeVoice.map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 overflow-hidden active:scale-[0.97] group ${
                      isActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}>
                    <div className="relative">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'}`} />
                      {item.name === 'Support' && unresolvedTickets > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[8px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
                          {unresolvedTickets > 99 ? '99+' : unresolvedTickets}
                        </span>
                      )}
                    </div>
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
              <button onClick={() => toggleGroup('ai-voice')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group ${
                  isVoiceActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                <Headphones className={`w-5 h-5 shrink-0 ${isVoiceActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'}`} />
                <span className="flex-1 text-left truncate">AI Voice</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedGroups.includes('ai-voice') ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              {expandedGroups.includes('ai-voice') && (
                <div className="ml-4 pl-3 border-l-2 border-border space-y-0.5">
                  {aiVoiceChildren.map(child => {
                    const isChildActive = location.pathname === child.path;
                    const ChildIcon = child.icon;
                    return (
                      <Link key={child.path} to={child.path} onClick={() => setIsMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                          isChildActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}>
                        <ChildIcon className={`w-4 h-4 shrink-0 ${isChildActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                        <span className="truncate text-sm">{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
              {itemsAfterVoice.map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 overflow-hidden active:scale-[0.97] group ${
                      isActive ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}>
                    <div className="relative">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'}`} />
                    </div>
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className={`p-4 border-t border-border flex ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
          <Link
            to="/securegate"
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-3'} rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-muted-foreground w-full active:scale-[0.97] group`}
            title={t('auth.logout')}
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
            {!isSidebarCollapsed && <span className="truncate">{t('auth.logout')}</span>}
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="bg-card shrink-0">
          <header className="h-16 border-b border-border/50 bg-card flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 mt-4 md:mt-6">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-all active:scale-90" onClick={() => setIsMobileSidebarOpen(true)}>
                  <Menu size={24} />
                </button>
                <button className="hidden lg:block p-2 text-muted-foreground hover:bg-muted rounded-lg transition-all active:scale-90" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                  <Menu size={24} />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold text-foreground leading-none">
                       {allNavItems.find(i => i.path === location.pathname)?.name || 'Control Panel'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">System Infrastructure</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <ThemeToggle />
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-xl border transition-all ${showNotifications ? 'bg-primary/10 border-primary/50 text-primary' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></span>}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                            <div className="absolute right-0 mt-3 w-80 bg-card rounded-2xl shadow-2xl border border-border p-4 z-50 animate-in zoom-in-95 duration-200 origin-top-right">
                                <div className="flex justify-between items-center mb-4 px-1">
                                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Support Tickets</h3>
                                    {unreadCount > 0 && <span className="text-[10px] text-amber-400 font-bold">{unreadCount} NEW</span>}
                                </div>
                                <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {adminNotifications.length === 0 ? (
                                        <div className="text-center py-10">
                                            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hub Clear</p>
                                        </div>
                                    ) : (Array.isArray(adminNotifications) ? adminNotifications : []).map(n => (
                                        <button
                                            key={n.id}
                                            onClick={() => { markRead(n.id); }}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${n.status === 'unread' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-background border-border hover:bg-muted'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 p-1 rounded-lg ${n.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {n.type === 'error' ? <AlertTriangle size={12} /> : <MessageSquare size={12} />}
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-foreground leading-tight mb-0.5">{n.title}</div>
                                                    <div className="text-[10px] text-muted-foreground leading-normal">{n.message}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {adminNotifications.length > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="w-full mt-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-amber-400 transition-colors border-t border-border pt-3"
                                    >
                                        Dismiss All
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <span className="text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    System Operational
                </span>
            </div>
        </header>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
