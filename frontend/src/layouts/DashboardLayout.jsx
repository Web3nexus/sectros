import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {LayoutDashboard, Calendar, MessageSquare, Component, Utensils, Globe, Table, Users, DollarSign, CreditCard, Bot, Settings, Plus, LogOut, User, Shield, Bell, CheckCircle, CircleX as XCircle, ShoppingBag, Menu, X, Package, BookOpen, Coffee, Scissors, Briefcase, BedDouble, Hotel, Map, Image, ChevronDown} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import { useBranding } from '../hooks/useBranding';
import { useBusinessConfig } from '../hooks/useBusinessConfig';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';

const ICON_MAP = {
  LayoutDashboard, Calendar, MessageSquare, Component, Utensils, Globe, Table, Users, DollarSign, CreditCard, Bot, Settings, Plus, ShoppingBag, Package, BookOpen, Coffee, Scissors, Briefcase, BedDouble, Hotel, Map, Image
};

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(15000);
  const { user, logout, isImpersonating, stopImpersonating, refreshUser, businessType } = useAuth();
  const settings = useBranding();
  const config = useBusinessConfig();
  const b = config.labels;
  const cIcons = config.icons || {};
  
  useEffect(() => {
    if (refreshUser) refreshUser();
  }, []);
  
  // Register inactivity logout monitoring
  useInactivityLogout();
  
  const isActive = (path) => location.pathname === path;

  const navItemClass = (path) => `flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 p-3'} rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest overflow-hidden ${
    isActive(path) 
      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]' 
      : 'text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95'
  }`;
  
  const hasFeature = (feat) => {
    if (!feat) return true;
    if (user?.role === 'admin' || user?.role === 'owner' || user?.is_owner || isImpersonating) return true;
    
    const features = user?.features || {};
    if (Array.isArray(features)) return features.includes(feat);
    if (typeof features === 'object' && features !== null) return !!features[feat];
    return false;
  };

  const isAllowed = (item) => {
    // Strictly enforce business-type configuration even for admins/impersonators
    // This ensures that when an admin is impersonating a Salon, they see the Salon UI
    return config.sidebar.includes(item);
  };

  // Helper to get dynamic icon
  const getIcon = (key, fallback) => {
    const iconName = cIcons[key];
    return ICON_MAP[iconName] || fallback;
  };

  const SIDEBAR_DEFINITIONS = [
    { key: 'insights', path: '/dashboard', label: b.insights || 'Insights', alwaysOn: true, roleCheck: false, feature: null },
    { key: 'calendar', path: '/dashboard/calendar', label: b.calendar || 'Calendar', alwaysOn: false, roleCheck: false, feature: null },
    { key: 'reservations', path: '/dashboard/reservations', label: b.reservations || 'Reservations', alwaysOn: false, roleCheck: false, feature: 'reservations' },
    { key: 'messages', path: '/dashboard/messages', label: t('dashboard.unifiedChat'), alwaysOn: false, roleCheck: true, feature: 'social_integration' },
    { key: 'pos', path: '/dashboard/pos', label: b.pos || t('dashboard.posTerminal'), alwaysOn: false, roleCheck: true, feature: 'pos_terminal' },
    { key: 'menu', path: '/dashboard/menu', label: b.menu || 'Menu Builder', alwaysOn: false, roleCheck: false, feature: 'menu_builder' },
      { key: 'website', path: '/dashboard/website', label: t('dashboard.websiteBuilder') || 'Website Builder', alwaysOn: false, roleCheck: true, feature: 'white_label_website', children: [
            { key: 'reviews', path: '/dashboard/reviews', label: 'Reviews' },
            { key: 'gallery', path: '/dashboard/gallery', label: 'Gallery' },
            { key: 'services', path: '/dashboard/services', label: 'Services' },
            { key: 'blog', path: '/dashboard/blog', label: 'Blog' },
            { key: 'team', path: '/dashboard/team', label: 'Team' },
          ]},
    { key: 'tables', path: '/dashboard/tables', label: b.floorPlan || 'Floor Plan', alwaysOn: false, roleCheck: false, feature: 'floor_plan' },
    { key: 'franchises', path: '/dashboard/franchises', label: 'Franchise Tools', alwaysOn: false, roleCheck: true, feature: 'franchise_tools' },
    { key: 'waitlist', path: '/dashboard/waitlist', label: 'Waitlist Pro', alwaysOn: false, roleCheck: true, feature: 'waitlist_automation' },
    { key: 'integrations', path: '/dashboard/integrations', label: 'Public API', alwaysOn: false, roleCheck: true, feature: 'public_api' },
    { key: 'branches', path: '/dashboard/branches', label: 'Branches', alwaysOn: false, roleCheck: true, feature: 'branch_management' },
    { key: 'staff', path: '/dashboard/staff', label: b.staff || 'Staff Profiles', alwaysOn: false, roleCheck: true, feature: 'staff_management' },
    { key: 'financials', path: '/dashboard/financials', label: b.financials || 'Financials', alwaysOn: false, roleCheck: true, feature: 'financial_reports' },
    { key: 'billing', path: '/dashboard/billing', label: t('dashboard.billingPlan') || 'Billing & Plan', alwaysOn: true, roleCheck: true, feature: null },
    { key: 'automation', path: '/dashboard/automation', label: t('dashboard.aiCommand') || 'AI Command', alwaysOn: false, roleCheck: true, feature: 'ai_automation' },
    { key: 'online_ordering', path: '/dashboard/online-ordering', label: b.onlineOrdering || t('dashboard.onlineOrdering'), alwaysOn: false, roleCheck: true, feature: 'online_ordering' },
    { key: 'inventory', path: '/dashboard/inventory', label: b.inventory || t('dashboard.inventoryTracking'), alwaysOn: false, roleCheck: true, feature: 'inventory_tracking' },
    { key: 'settings', path: '/dashboard/settings', label: b.configuration || 'Configuration', alwaysOn: true, roleCheck: true, feature: null },
  ];

  // Route protection logic: Redirect if current path is not allowed for this business type
  useEffect(() => {
    const currentKey = SIDEBAR_DEFINITIONS.find(def => location.pathname === def.path)?.key;
    if (currentKey && !isAllowed(currentKey)) {
        navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, config.type]);

  return (
    <div className="flex h-screen w-full bg-background font-sans transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-card/50 z-40 lg:hidden" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-card text-foreground flex flex-col justify-between shadow-2xl z-50 border-r border-border transition-all duration-300 fixed lg:relative h-full ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="p-4 overflow-y-auto overflow-x-hidden no-scrollbar">
          <div className="flex items-center justify-between lg:justify-center mb-10 px-2 pt-4">
            <div className={`flex flex-col items-center ${isSidebarCollapsed ? '' : 'w-full'}`}>
              {settings.platform_logo_url ? (
                <img src={settings.platform_logo_url} alt={settings.platform_name} className="h-10 w-auto object-contain mb-2" />
              ) : (
                <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-blue-500/20 mb-2">
                  <span className="font-black text-xl leading-none">{settings.platform_name?.charAt(0) || 'R'}</span>
                </div>
              )}
              {!isSidebarCollapsed && (
                <>
                  <h2 className="text-base font-black text-foreground tracking-tighter truncate text-center">{settings.platform_name}</h2>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{businessType || config?.type || ''}</span>
                </>
              )}
            </div>
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setIsMobileSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-1">
            {SIDEBAR_DEFINITIONS.filter(def => isAllowed(def.key)).map(def => (
               def.children ? (
                 <SidebarGroup 
                   key={def.key}
                   def={def}
                   icon={getIcon(def.key, Settings)}
                   isCollapsed={isSidebarCollapsed}
                 />
               ) : (
                 <SidebarItem 
                   key={def.key}
                   to={def.path} 
                   icon={getIcon(def.key, Settings)} 
                   label={def.label} 
                   alwaysOn={def.alwaysOn} 
                   roleCheck={def.roleCheck} 
                   feature={def.feature}
                   isCollapsed={isSidebarCollapsed} 
                 />
               )
            ))}
            <SidebarItem to="/dashboard/onboarding" icon={Plus} label={t('dashboard.provisioning')} alwaysOn isCollapsed={isSidebarCollapsed} />
          </nav>
        </div>
        <div className={`p-6 border-t border-border flex ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
           <button onClick={logout} className={`flex items-center ${isSidebarCollapsed ? 'justify-center h-10 w-10 p-0' : 'gap-3 px-4 py-3'} text-muted-foreground hover:text-destructive w-full font-bold text-[10px] uppercase tracking-widest transition-all rounded-xl hover:bg-destructive/5`} title={t('dashboard.logout')}>
             <LogOut size={18} className="shrink-0" /> {!isSidebarCollapsed && <span className="truncate">{t('dashboard.logout')}</span>}
           </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background text-foreground">
        {/* Impersonation Banner */}
        {isImpersonating && (
          <div className="bg-amber-500 text-white px-8 py-2 flex items-center justify-between shadow-md z-40 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
               <div className="p-1.5 bg-white/20 rounded-lg">
                  <User size={16} />
               </div>
               <div>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{t('dashboard.impersonation.active')}</span>
                   <p className="text-xs font-bold leading-none">{t('dashboard.impersonation.logged_as', { name: user?.name || 'Owner' })}</p>
               </div>
            </div>
            <button 
              onClick={() => {
                stopImpersonating();
                window.location.href = '/securegate/tenants';
              }}
              className="px-4 py-1.5 bg-white text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-sm"
            >
               {t('dashboard.impersonation.terminate')}
            </button>
          </div>
        )}

        {/* Setup 2FA Banner */}
        {user?.two_factor_method === 'none' && !sessionStorage.getItem('dismissed_2fa_prompt') && (
          <div className="bg-primary text-white px-8 py-3 flex items-center justify-between shadow-md z-30 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
               <div className="p-1.5 bg-white/20 rounded-lg">
                  <Shield size={16} />
               </div>
               <div>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{t('dashboard.security_prompt.title')}</span>
                   <p className="text-xs font-bold leading-none mt-0.5">{t('dashboard.security_prompt.body')}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard/settings"
                onClick={() => sessionStorage.setItem('dismissed_2fa_prompt', 'true')}
                className="px-4 py-1.5 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
              >
                 {t('dashboard.security_prompt.button')}
              </Link>
              <button 
                onClick={(e) => {
                  e.currentTarget.parentElement.parentElement.style.display = 'none';
                  sessionStorage.setItem('dismissed_2fa_prompt', 'true');
                }}
                className="text-white/60 hover:text-white transition-colors"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="h-20 bg-card border-b border-border flex justify-between items-center px-4 md:px-8 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors" onClick={() => setIsMobileSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <button className="hidden lg:block p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                <span>{b.insights}</span>
                <span className="opacity-30">/</span>
                <span className="text-primary">{location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}</span>
              </div>
              <h1 className="text-xl font-black text-foreground tracking-tighter uppercase">
                {location.pathname.split('/').pop() === 'dashboard' ? 'Overview' : (b[location.pathname.split('/').pop()] || location.pathname.split('/').pop())}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <LanguageSwitcher />
             <ThemeToggle />
             {/* Notifications */}
             <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-xl transition-all active:scale-90 relative ${showNotifications ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  <Bell size={22} />
                  <span className={`absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 ${showNotifications ? 'bg-primary-foreground border-primary' : 'bg-red-500 border-background'}`}></span>
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-card rounded-[24px] shadow-2xl border border-border p-4 z-50 animate-in zoom-in-95 duration-200 origin-top-right">
                       <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex justify-between items-center px-2">
                          {t('common.notifications')}
                           {unreadCount > 0 && <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[9px]">{unreadCount} {t('common.new')}</span>}
                       </h3>
                       <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                          {notifications.length === 0 ? (
                            <p className="text-center py-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('common.noNotifications')}</p>
                          ) : (Array.isArray(notifications) ? notifications : []).map(n => (
                            <NotificationItem key={n.id} notification={n} onRead={() => markRead(n.id)} />
                          ))}
                       </div>
                       {notifications.length > 0 && (
                         <button onClick={markAllRead} className="w-full mt-4 py-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
                           {t('common.markAllRead')}
                         </button>
                       )}
                    </div>
                  </>
                )}
             </div>

             {/* Profile Menu */}
             <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-muted border border-border rounded-2xl hover:bg-muted/80 transition-all active:scale-95 group"
                >
                  <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                     A
                  </div>
                  <div className="text-left hidden lg:block">
                     <div className="text-xs font-black text-foreground tracking-tight uppercase leading-none mb-0.5">{user?.name || 'Staff User'}</div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{user?.role === 'owner' ? t('dashboard.role_admin') : t('dashboard.role_staff')}</div>
                  </div>
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                    <div className="absolute right-0 mt-3 w-64 bg-card rounded-[24px] shadow-2xl border border-border p-2 z-50 animate-in slide-in-from-top-2 duration-300 origin-top-right">
                       <div className="p-4 border-b border-border mb-2">
                          <div className="font-black text-foreground text-sm uppercase">{user?.name || 'Staff User'}</div>
                          <div className="text-[10px] text-muted-foreground font-bold tracking-tight">{user?.email || 'user@sectros.test'}</div>
                       </div>
                       <div className="space-y-1">
                          {user?.role === 'owner' && (
                            <>
                              <button 
                                onClick={() => { navigate('/dashboard/settings'); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors group"
                              >
                                 <div className="p-1.5 bg-background rounded-lg group-hover:bg-primary/10 transition-colors"><Settings size={16} /></div>
                                 <span className="text-[10px] font-black uppercase tracking-widest">{t('settings.title')}</span>
                              </button>
 
                              <button 
                                onClick={() => { navigate('/dashboard/account'); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-colors group"
                              >
                                 <div className="p-1.5 bg-background rounded-lg group-hover:bg-primary/10 transition-colors"><User size={16} /></div>
                                 <span className="text-[10px] font-black uppercase tracking-widest">{t('common.profile')}</span>
                              </button>
                            </>
                          )}
                       </div>
                       <div className="mt-2 pt-2 border-t border-border">
                          <button onClick={() => { logout(); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors group">
                            <LogOut size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('auth.logout')}</span>
                          </button>
                       </div>
                    </div>
                  </>
                )}
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function NotificationItem({ notification, onRead }) {
  const iconMap = {
    order: <ShoppingBag size={14} className="text-blue-500" />,
    reservation: <Calendar size={14} className="text-emerald-500" />,
    'check-circle': <CheckCircle size={14} className="text-emerald-500" />,
    'x-circle': <XCircle size={14} className="text-red-500" />,
  };
  const icon = iconMap[notification.icon] || iconMap[notification.type] || <Bell size={14} className="text-slate-400" />;
  const isUnread = notification.status === 'unread';

   const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t('dashboard.time.just_now');
    if (m < 60) return t('dashboard.time.minutes_ago', { count: m });
    const h = Math.floor(m / 60);
    if (h < 24) return t('dashboard.time.hours_ago', { count: h });
    return t('dashboard.time.days_ago', { count: Math.floor(h / 24) });
  };

  return (
    <div
      onClick={onRead}
      className={`flex items-center gap-3 p-3 rounded-2xl group transition-all cursor-pointer border ${
        isUnread ? 'bg-primary/5 border-primary/20 hover:border-primary/30' : 'bg-card border-border hover:border-primary/30'
      }`}
    >
      <div className={`p-2 rounded-xl group-hover:bg-primary/10 transition-colors ${isUnread ? 'bg-primary/10' : 'bg-background'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black text-foreground tracking-tight leading-tight truncate">{notification.title}</div>
        <div className="text-[9px] font-bold text-muted-foreground mt-0.5 truncate">{notification.message}</div>
        <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">{timeAgo(notification.created_at)}</div>
      </div>
      {isUnread && <div className="h-2 w-2 rounded-full bg-primary shrink-0 transition-transform group-hover:scale-125"></div>}
    </div>
  );
}

function SidebarGroup({ def, icon: Icon, isCollapsed }) {
  const location = useLocation();
  const config = useBusinessConfig();
  const isAllowed = (key) => config.sidebar.includes(key);
  const visibleChildren = def.children.filter(c => isAllowed(c.key));
  const [expanded, setExpanded] = useState(location.pathname === def.path || visibleChildren.some(c => location.pathname === c.path));
  const isSelfActive = location.pathname === def.path;

  if (isCollapsed || visibleChildren.length === 0) {
    return (
      <SidebarItem to={def.path} icon={Icon} label={def.label} alwaysOn={def.alwaysOn} roleCheck={def.roleCheck} feature={def.feature} isCollapsed />
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
          isSelfActive
            ? 'bg-primary text-primary-foreground shadow-lg shadow-blue-500/20'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <Icon size={20} className={`flex-shrink-0 ${isSelfActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest truncate">{def.label}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`} />
      </button>
      {expanded && (
        <div className="ml-4 pl-3 border-l-2 border-border space-y-0.5">
          <Link
            to={def.path}
            className={`block px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isSelfActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Builder
          </Link>
          {visibleChildren.map(child => (
            <Link
              key={child.key}
              to={child.path}
              className={`block px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                location.pathname === child.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarItem({ to, icon: Icon, label, feature, alwaysOn, roleCheck = true, isCollapsed }) {
  const { user, isImpersonating } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const hasFeature = (feat) => {
    if (!feat) return true;
    if (alwaysOn) return true;
    
    // We keep owner/admin bypass for PERMISSION checks, but VISIBILITY is handled by SidebarItem mapping
    if (user?.role === 'admin' || user?.role === 'owner' || user?.is_owner || isImpersonating) return true;
    
    const features = user?.features || {};
    if (Array.isArray(features)) return features.includes(feat);
    if (typeof features === 'object' && features !== null) return !!features[feat];
    return false;
  };

  const isLocked = !hasFeature(feature);
  const isActive = location.pathname === to;

  // If roleCheck is enabled, only owners can see gated features (even if locked)
  // Staff should only see what they have access to and what's alwaysOn
  if (roleCheck && user?.role !== 'owner' && !alwaysOn && isLocked) return null;

  return (
    <Link
      to={isLocked ? '#' : to}
      title={isCollapsed ? label : ''}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault();
        }
      }}
      className={`group flex items-center ${isCollapsed ? 'justify-center p-3 h-12 w-12 mx-auto' : 'justify-between px-4 py-3'} rounded-2xl transition-all duration-300 ${
        isActive 
          ? 'bg-primary text-primary-foreground shadow-lg shadow-blue-500/20 active:scale-95' 
          : isLocked 
            ? 'text-muted-foreground opacity-40 cursor-not-allowed hover:bg-muted' 
            : 'text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95'
      }`}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} overflow-hidden`}>
        <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-primary-foreground' : isLocked ? 'text-muted-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
        {!isCollapsed && (
           <span className="text-[10px] font-black uppercase tracking-widest truncate">{label}</span>
        )}
      </div>
      {!isCollapsed && isLocked && (
        <div className="bg-amber-500/10 p-1 rounded-lg border border-amber-500/20">
          <Shield size={12} className="text-amber-500" />
        </div>
      )}
    </Link>
  );
}
