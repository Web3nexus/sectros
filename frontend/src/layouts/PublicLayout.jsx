import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ChevronDown, Sparkles, Book, Star, FileText, HelpCircle, Users, MessageCircle, ArrowRight, Layout, Calendar, Globe, Box, Grid, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../hooks/useBranding';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CookieConsentBanner from '../components/public/CookieConsentBanner';
import ThemeToggle from '../components/ThemeToggle';

export function PublicLayout() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Track which mega menu is open
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();

  let hideTimeout;
  const handleMouseEnter = (menu) => {
    clearTimeout(hideTimeout);
    setActiveMenu(menu);
  };
  const handleMouseLeave = () => {
    hideTimeout = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMenu(null);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const settings = useBranding();

  const megaMenus = {
    product: {
      items: [
        { title: 'Reservation System', desc: 'Accept bookings 24/7', icon: Calendar, path: '/features#reservations', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { title: 'Calendar & Floor Plan', desc: 'Manage your operations', icon: Grid, path: '/features#calendar', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { title: 'Website Builder', desc: 'Create a branded site', icon: Globe, path: '/features#website', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { title: 'Guest Profiles', desc: 'Know your regulars', icon: Users, path: '/features#crm', color: 'text-purple-400', bg: 'bg-purple-500/10' },
      ],
      footer: { title: 'See all features', path: '/features' }
    },
    solutions: {
      items: [
        { title: 'For Restaurants', desc: 'Fine dining to casual', icon: UtensilsIcon, path: '/solutions/restaurants', color: 'text-rose-400', bg: 'bg-rose-500/10' },
        { title: 'For Cafes', desc: 'High volume, fast pace', icon: CoffeeIcon, path: '/solutions/cafes', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { title: 'For Salons', desc: 'Appointment scheduling', icon: ScissorsIcon, path: '/solutions/salons', color: 'text-pink-400', bg: 'bg-pink-500/10' },
        { title: 'For Hospitality', desc: 'Hotels and resorts', icon: Briefcase, path: '/solutions/hospitality', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      ],
      footer: { title: 'Explore all solutions', path: '/solutions' }
    },
    resources: {
      items: [
        { title: 'Blog', desc: 'Latest industry insights', icon: Book, path: '/blog', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { title: 'Documentation', desc: 'Technical guides', icon: FileText, path: '/docs', color: 'text-muted-foreground', bg: 'bg-slate-500/10' },
        { title: 'Help Center', desc: 'Support & tutorials', icon: HelpCircle, path: '/help', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { title: 'Community', desc: 'Join the conversation', icon: MessageCircle, path: '/community', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
      ],
      footer: { title: 'Read customer stories', path: '/customers' }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30 selection:text-blue-200 flex flex-col transition-colors duration-300">
      {/* Navigation */}
      <header 
        className={`fixed top-6 left-1/2 -translate-x-1/2 w-[98%] max-w-[1400px] z-50 transition-all duration-300 rounded-[2.2rem] border border-border overflow-visible ${
          scrolled 
            ? 'bg-card/80 backdrop-blur-2xl py-3 px-1 mx-auto shadow-lg shadow-primary/5' 
            : 'bg-card/40 backdrop-blur-md py-4 px-1 mx-auto shadow-sm shadow-primary/5'
        }`}
      >
        <div className="w-full mx-auto px-2 lg:px-8 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 group shrink-0 min-w-fit">
            {settings.platform_logo_url ? (
              <img src={settings.platform_logo_url} alt={settings.platform_name || 'Logo'} className="h-7 lg:h-8 w-auto object-contain" />
            ) : (
              <>
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="text-lg lg:text-xl font-bold text-foreground tracking-tight whitespace-nowrap">{settings.platform_name}</span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-6">
            {/* Product Dropdown */}
            <div className="relative py-4" onMouseEnter={() => handleMouseEnter('product')} onMouseLeave={handleMouseLeave}>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Product <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'product' ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              <MegaMenuDropDown isOpen={activeMenu === 'product'} menuData={megaMenus.product} setActiveMenu={setActiveMenu} />
            </div>

            {/* Solutions Dropdown */}
            <div className="relative py-4" onMouseEnter={() => handleMouseEnter('solutions')} onMouseLeave={handleMouseLeave}>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Solutions <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'solutions' ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              <MegaMenuDropDown isOpen={activeMenu === 'solutions'} menuData={megaMenus.solutions} setActiveMenu={setActiveMenu} />
            </div>

            {/* Resources Dropdown */}
            <div className="relative py-4" onMouseEnter={() => handleMouseEnter('resources')} onMouseLeave={handleMouseLeave}>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Resources <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'resources' ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              <MegaMenuDropDown isOpen={activeMenu === 'resources'} menuData={megaMenus.resources} setActiveMenu={setActiveMenu} />
            </div>

            <Link to="/directory" className={`text-[13px] lg:text-sm font-bold transition-all px-2 lg:px-4 py-2 rounded-xl active:scale-95 whitespace-nowrap ${location.pathname === '/directory' ? 'text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,102,255,0.1)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>Discover</Link>
            <Link to="/pricing" className={`text-[13px] lg:text-sm font-bold transition-all px-2 lg:px-4 py-2 rounded-xl active:scale-95 whitespace-nowrap ${location.pathname === '/pricing' ? 'text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,102,255,0.1)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>Pricing</Link>
            <Link to="/about" className={`text-[13px] lg:text-sm font-bold transition-all px-2 lg:px-4 py-2 rounded-xl active:scale-95 whitespace-nowrap ${location.pathname === '/about' ? 'text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,102,255,0.1)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>Company</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center justify-end gap-2 xl:gap-5 shrink-0 border-l border-white/5 pl-4 xl:pl-6 ml-2 xl:ml-4">
            {loading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-xl" />
            ) : user ? (
              <Link 
                to={user.role === 'admin' ? '/securegate/dashboard' : '/dashboard'}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/25 flex items-center gap-2 group active:scale-95"
              >
                Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="px-3 lg:px-5 py-2.5 rounded-xl text-[11px] lg:text-xs font-black text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all uppercase tracking-widest active:scale-95 whitespace-nowrap">
                  Sign In
                </Link>
                <Link 
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 lg:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/30 active:scale-95 border border-blue-500/50"
              >
                Join {settings.platform_name}
              </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 lg:hidden overflow-y-auto pb-8"
          >
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">Product</p>
                <div className="grid grid-cols-1 gap-2">
                  {megaMenus.product.items.map(item => (
                    <Link key={item.path} to={item.path} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted text-foreground transition-colors">
                      <item.icon className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-semibold text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="h-px bg-border w-full" />
              <Link to="/pricing" className="text-xl font-bold text-foreground px-2">Pricing</Link>
              <Link to="/about" className="text-xl font-bold text-foreground px-2">Company</Link>
              
              <div className="h-px bg-border w-full mt-4" />
              {!loading && (
                user ? (
                  <Link 
                    to={user.role === 'admin' ? '/securegate/dashboard' : '/dashboard'}
                    className="w-full bg-primary text-white text-center py-4 rounded-xl font-bold text-lg"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link 
                      to="/login"
                      className="w-full bg-card border border-border text-foreground hover:bg-muted text-center py-4 rounded-xl font-bold text-lg transition-colors"
                    >
                      Log in
                    </Link>
                    <Link 
                      to="/register"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-center py-4 rounded-xl font-bold text-lg transition-colors"
                    >
                      Get Started Free
                    </Link>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="flex-1 relative pt-[110px]">
        <Outlet />
      </main>

      {/* Enhanced Modern Footer */}
      <footer className="bg-muted/30 border-t border-border/50 pt-24 pb-12 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-16 mb-16">
            <div className="col-span-2 md:col-span-2 pr-8">
              <Link to="/" className="flex items-center gap-2 mb-6">
                {settings.platform_logo_url ? (
                  <img src={settings.platform_logo_url} alt={settings.platform_name || 'Logo'} className="h-8 w-auto object-contain" />
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-foreground tracking-tight">{settings.platform_name}</span>
                  </>
                )}
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                A unified operating system for ambitious businesses. Accept bookings, manage operations, and grow your brand with intelligent tools designed for modern hospitality.
              </p>
              <div className="flex gap-4">
                <a href={settings.twitter_url || "#"} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm active:scale-95">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                </a>
                <a href={settings.instagram_url || "#"} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-pink-500 hover:text-white transition-all shadow-sm active:scale-95">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
              </div>
              {/* Language Switcher in footer */}
              <div className="mt-5">
                <LanguageSwitcher dropUp={true} />
              </div>
            </div>
            
            <div className="col-span-1">
              <h4 className="text-foreground font-bold mb-6 tracking-tight">Products</h4>
              <ul className="space-y-4">
                <li><Link to="/features#reservations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reservations</Link></li>
                <li><Link to="/features#pos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Point of Sale</Link></li>
                <li><Link to="/features#table-management" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Table Management</Link></li>
                <li><Link to="/features#website-builder" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Website Builder</Link></li>
                <li><Link to="/features#crm" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Guest Profiles</Link></li>
                <li><Link to="/integrations" className="text-sm text-muted-foreground hover:text-primary transition-colors font-semibold">Integrations</Link></li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h4 className="text-foreground font-bold mb-6 tracking-tight">Solutions</h4>
              <ul className="space-y-4">
                <li><Link to="/solutions/restaurants" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Restaurants</Link></li>
                <li><Link to="/solutions/cafes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Cafes & Bakeries</Link></li>
                <li><Link to="/solutions/salons" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Salons & Spas</Link></li>
                <li><Link to="/solutions/hospitality" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Hotels</Link></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="text-foreground font-bold mb-6 tracking-tight">Marketplace</h4>
              <ul className="space-y-4">
                <li><Link to="/directory" className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]">Business Directory</Link></li>
                <li><Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">List your business</Link></li>
                <li><Link to="/customers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h4 className="text-foreground font-bold mb-6 tracking-tight">Company</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Sales</Link></li>
                <li><Link to="/partners" className="text-sm text-muted-foreground hover:text-primary transition-colors">Partners</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {settings.platform_name} Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
      <CookieConsentBanner />
    </div>
  );
}

function MegaMenuDropDown({ isOpen, menuData, setActiveMenu }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[640px] z-50"
        >
          <div className="bg-card backdrop-blur-[40px] border border-border shadow-2xl rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            <div className="grid grid-cols-2 gap-4 p-8">
              {menuData.items.map((item, idx) => (
                <Link 
                  key={idx} 
                  to={item.path}
                  onClick={() => setActiveMenu(null)}
                  className="group flex gap-4 p-5 rounded-2xl hover:bg-muted transition-all duration-300"
                >
                  <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg.replace('/10', '/20')} shadow-inner transition-transform group-hover:scale-110 border border-border`}>
                    <item.icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium opacity-80">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="bg-muted/50 p-8 flex items-center justify-between border-t border-border">
              <Link to={menuData.footer.path} onClick={() => setActiveMenu(null)} className="text-sm font-black text-primary hover:text-primary/80 flex items-center gap-2 group w-full justify-between tracking-wide px-2">
                {menuData.footer.title} 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple internal icons for the solutions menu
const UtensilsIcon = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>;
const CoffeeIcon = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" x2="6" y1="2" y2="4" /><line x1="10" x2="10" y1="2" y2="4" /><line x1="14" x2="14" y1="2" y2="4" /></svg>;
const ScissorsIcon = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" x2="8.12" y1="4" y2="15.88" /><line x1="14.47" x2="14.48" y1="14.48" y2="14.47" /><line x1="8.12" x2="20" y1="8.12" y2="20" /></svg>;
