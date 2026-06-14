import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {LayoutGrid, LayoutDashboard, Building2, CreditCard, PackageOpen, MessageSquare, Mail, Shield, BookOpen, Globe, Settings, Users, LogOut, Bell, AlertTriangle, CheckCircle, Menu, X, Palette, PlugZap} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import { useBranding } from '../hooks/useBranding';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';

export function SaaSAdminLayout() {
  const location = useLocation();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(20000);
  const settings = useBranding();

  // Register inactivity logout monitoring
  useInactivityLogout();

  const navItems = [
    { name: t('admin.overview'), path: '/securegate/dashboard', icon: LayoutDashboard },
    { name: t('admin.tenants'), path: '/securegate/tenants', icon: Building2 },
    { name: t('admin.subscriptions'), path: '/securegate/subscriptions', icon: CreditCard },
    { name: 'Plan Management', path: '/securegate/plans', icon: PackageOpen },
    { name: t('admin.support'), path: '/securegate/tickets', icon: MessageSquare },
    { name: t('admin.emailHub'), path: '/securegate/email-templates', icon: Mail },
    { name: 'Admin Management', path: '/securegate/admins', icon: Shield },
    { name: t('admin.contentLandingPage'), path: '/securegate/cms', icon: LayoutGrid },
    { name: 'Integrations', path: '/securegate/integrations', icon: PlugZap },
    { name: 'Website Templates', path: '/securegate/website-themes', icon: Palette },
    { name: 'Translations', path: '/securegate/translations', icon: Globe },
    { name: t('admin.systemSettings'), path: '/securegate/settings', icon: Settings },
    { name: t('admin.myAccount'), path: '/securegate/account', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex text-muted-foreground">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-card/50 z-40 lg:hidden" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
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
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                title={item.name}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-3'} rounded-xl transition-all duration-200 overflow-hidden active:scale-[0.97] group ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
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

      {/* Main Content Area */}
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
                       {navItems.find(i => i.path === location.pathname)?.name || 'Control Panel'}
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
                                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Alerts</h3>
                                    {unreadCount > 0 && <span className="text-[10px] text-blue-400 font-bold">{unreadCount} NEW</span>}
                                </div>
                                <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-10">
                                            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hub Clear</p>
                                        </div>
                                    ) : (Array.isArray(notifications) ? notifications : []).map(n => (
                                        <button 
                                            key={n.id} 
                                            onClick={() => { markRead(n.id); }}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${n.status === 'unread' ? 'bg-primary/5 border-primary/20' : 'bg-background border-border hover:bg-muted'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 p-1 rounded-lg ${n.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                                                    {n.type === 'error' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-foreground leading-tight mb-0.5">{n.title}</div>
                                                    <div className="text-[10px] text-muted-foreground leading-normal">{n.message}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={markAllRead} 
                                        className="w-full mt-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-blue-400 transition-colors border-t border-border pt-3"
                                    >
                                        {t('common.markAllRead')}
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
