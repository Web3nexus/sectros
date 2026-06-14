import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {Menu, X, ArrowRight, Briefcase, Book, FileText, HelpCircle, MessageCircle, Calendar, Grid, Globe, Users, ChevronDown} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useBranding } from '../../../hooks/useBranding';
import LanguageSwitcher from '../../LanguageSwitcher';
import CookieConsentBanner from '../../public/CookieConsentBanner';

export function ModernPublicLayout() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();

  let hideTimeout;
  const handleMouseEnter = (menu) => {
    clearTimeout(hideTimeout);
    setActiveMenu(menu);
  };
  const handleMouseLeave = () => {
    hideTimeout = setTimeout(() => setActiveMenu(null), 200);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveMenu(null);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const branding = useBranding();
  const platformName = branding.platform_name || 'Sectros';

  const navLinks = [
    { label: 'Product', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Solutions', path: '/solutions' },
    { label: 'Resources', path: '/blog' },
    { label: 'Company', path: '/about' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/60' : 'bg-white border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              {branding.platform_logo_url ? (
                <img src={branding.platform_logo_url} alt={platformName} className="h-7 lg:h-8 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">{platformName}</span>
                </>
              )}
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {loading ? (
                <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
              ) : user ? (
                <Link
                  to={user.role === 'admin' ? '/securegate/dashboard' : '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <button className="lg:hidden p-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 px-6 lg:hidden overflow-y-auto pb-8"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-lg font-semibold text-slate-900 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-slate-200 my-4" />
              {!loading && (
                user ? (
                  <Link to={user.role === 'admin' ? '/securegate/dashboard' : '/dashboard'} className="w-full bg-blue-600 text-white text-center py-4 rounded-xl font-semibold text-lg">
                    Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login" className="w-full border border-slate-300 text-slate-900 text-center py-4 rounded-xl font-semibold text-lg">
                      Sign In
                    </Link>
                    <Link to="/register" className="w-full bg-blue-600 text-white text-center py-4 rounded-xl font-semibold text-lg">
                      Get Started
                    </Link>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pt-16 lg:pt-20">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                {branding.platform_logo_url ? (
                  <img src={branding.platform_logo_url} alt={platformName} className="h-7 w-auto brightness-0 invert" />
                ) : (
                  <span className="text-lg font-bold text-white">{platformName}</span>
                )}
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                The operating system for modern hospitality businesses. Manage reservations, guests, tables, and operations from one platform.
              </p>
              <div className="flex gap-3">
                {['twitter', 'instagram', 'facebook'].map(social => (
                  <a key={social} href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-3">
                {['Reservations', 'Floor Plan', 'Guest CRM', 'Automation', 'Analytics', 'Integrations'].map(item => (
                  <li key={item}><Link to="/features" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Solutions</h4>
              <ul className="space-y-3">
                {['Restaurants', 'Lounges', 'Clubs', 'Hotels', 'Event Venues', 'Multi-location Groups'].map(item => (
                  <li key={item}><Link to="/solutions" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Resources</h4>
              <ul className="space-y-3">
                {['Blog', 'Help Center', 'Case Studies', 'Guides', 'API Docs'].map(item => (
                  <li key={item}><Link to="/blog" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-3">
                {['About', 'Contact', 'Careers', 'Partners', 'Privacy'].map(item => (
                  <li key={item}><Link to={item === 'Privacy' ? '/privacy' : '/about'} className="text-sm text-slate-400 hover:text-white transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} {platformName}. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
      <CookieConsentBanner />
    </div>
  );
}
