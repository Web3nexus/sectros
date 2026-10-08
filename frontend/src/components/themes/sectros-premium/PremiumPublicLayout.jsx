import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, Menu, X, ArrowRight, CalendarDays, LayoutGrid, Users, Bot, BarChart3, Puzzle,
  Building2, UtensilsCrossed, BedDouble, Layers, TrendingUp, CalendarX2, Zap, Smile,
  BookOpen, HelpCircle, Award, FileText, Code2, PenLine, Mail, Newspaper,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useBranding } from '../../../hooks/useBranding';
import CookieConsentBanner from '../../public/CookieConsentBanner';
import { SectrosMark, EASE } from './primitives';
import './premium.css';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;550;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&display=swap';

function useThemeFonts() {
  useEffect(() => {
    if (document.querySelector('link[data-sp-fonts]')) return;
    const pre1 = Object.assign(document.createElement('link'), { rel: 'preconnect', href: 'https://fonts.googleapis.com' });
    const pre2 = Object.assign(document.createElement('link'), { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' });
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: FONT_HREF });
    link.setAttribute('data-sp-fonts', '');
    document.head.append(pre1, pre2, link);
  }, []);
}

/* Navigation data — same destinations as the existing site, editorial grouping */
const PRODUCT = [
  { label: 'Reservations', to: '/features', icon: CalendarDays, description: 'Smart booking & table management' },
  { label: 'Floor Plan', to: '/features', icon: LayoutGrid, description: 'Visual drag-and-drop layout' },
  { label: 'Guest CRM', to: '/features', icon: Users, description: 'Rich guest profiles & history' },
  { label: 'Automation', to: '/features', icon: Bot, description: 'Automated workflows & messages' },
  { label: 'Analytics', to: '/features', icon: BarChart3, description: 'Revenue & performance insights' },
  { label: 'Integrations', to: '/integrations', icon: Puzzle, description: 'Connect your existing tools' },
];

const SOLUTION_GROUPS = [
  {
    label: 'By business',
    items: [
      { label: 'For Restaurants', to: '/solutions/restaurants', icon: UtensilsCrossed },
      { label: 'For Hotels', to: '/solutions/hospitality', icon: BedDouble },
      { label: 'For Groups & Chains', to: '/solutions', icon: Layers },
    ],
  },
  {
    label: 'By goal',
    items: [
      { label: 'Increase Revenue', to: '/features', icon: TrendingUp },
      { label: 'Reduce No-Shows', to: '/features', icon: CalendarX2 },
      { label: 'Automate Operations', to: '/features', icon: Zap },
      { label: 'Improve Guest Experience', to: '/features', icon: Smile },
    ],
  },
];

const RESOURCE_GROUPS = [
  {
    label: 'Read & learn',
    items: [
      { label: 'Blog & Articles', to: '/blog', icon: BookOpen, description: 'Industry insights & product updates' },
      { label: 'Case Studies', to: '/case-studies', icon: Award, description: 'Success stories from real operators' },
      { label: 'Guides & Playbooks', to: '/guides', icon: FileText, description: 'Step-by-step setup tutorials' },
    ],
  },
  {
    label: 'Support & developers',
    items: [
      { label: 'Help Center', to: '/help', icon: HelpCircle, description: 'Knowledge base, FAQs & support' },
      { label: 'Developer API Docs', to: '/', icon: Code2, description: 'REST endpoints, auth & webhooks' },
    ],
  },
];

const COMPANY = [
  { label: 'About Sectros', to: '/about', icon: Building2 },
  { label: 'Our Story', to: '/about#story', icon: PenLine },
  { label: 'Careers', to: '/careers', icon: Users },
  { label: 'Contact Us', to: '/contact', icon: Mail },
];

const RESOURCE_TO = RESOURCE_GROUPS.flatMap((g) => g.items.map((i) => i.to));

function Logo({ branding, dark = false }) {
  const name = branding.platform_name || 'Sectros';
  if (branding.platform_logo_url) {
    return <img src={branding.platform_logo_url} alt={name} className={`h-7 w-auto object-contain ${dark ? 'brightness-0 invert' : ''}`} />;
  }
  return (
    <span className="flex items-center gap-2">
      <SectrosMark className="w-[22px] h-[22px]" color={dark ? '#2fa772' : 'var(--sp-green)'} />
      <span className={`text-[19px] font-semibold tracking-[-0.03em] lowercase ${dark ? 'text-white' : 'text-[color:var(--sp-ink)]'}`}>{name}</span>
    </span>
  );
}

/* ─── Editorial mega menu primitives ─────────────────────────────────────── */

function MegaPanel({ open, width, align = 'center', label, children }) {
  const pos =
    align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.18, ease: EASE }}
          className={`absolute top-full pt-2.5 ${pos}`}
          style={{ width, maxWidth: 'calc(100vw - 32px)' }}
        >
          <div className="sp-mega" role="group" aria-label={label}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MegaGroup({ id, menu, enter, leave, close, toggle, active, align, width, trigger, label, children }) {
  const open = menu === id;
  return (
    <div
      className="relative"
      onMouseEnter={() => enter(id)}
      onMouseLeave={() => leave()}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) leave(true); }}
      onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
    >
      <button
        type="button"
        className="sp-nav-link"
        data-open={open}
        data-active={active}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => toggle(id)}
      >
        {trigger}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <MegaPanel open={open} width={width} align={align} label={label}>{children}</MegaPanel>
    </div>
  );
}

function MegaItem({ to, icon: Icon, label, description }) {
  return (
    <Link to={to} className="sp-mega-item">
      <span className="sp-icon-chip sp-icon-chip-sm"><Icon className="w-[15px] h-[15px]" strokeWidth={1.7} /></span>
      <span className="min-w-0">
        <span className="sp-mega-item-title">{label}</span>
        {description && <span className="sp-mega-item-desc">{description}</span>}
      </span>
    </Link>
  );
}

function MegaCard({ to, eyebrow, title, body, cta = 'Visit', tone = 'white' }) {
  return (
    <Link to={to} className={`sp-mega-card sp-mega-card-${tone}`}>
      {eyebrow && <span className="sp-mega-label sp-mega-label-flush">{eyebrow}</span>}
      <span className="sp-mega-card-title sp-display">{title}</span>
      <span className="sp-mega-card-body">{body}</span>
      <span className="sp-link sp-mega-card-cta">
        {cta} <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}

export function PremiumPublicLayout() {
  useThemeFonts();
  const { user, loading } = useAuth();
  const branding = useBranding();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const hideTimer = useRef(null);
  const platformName = branding.platform_name || 'Sectros';

  const enter = (m) => { clearTimeout(hideTimer.current); setMenu(m); };
  const leave = (immediate = false) => {
    clearTimeout(hideTimer.current);
    if (immediate) { setMenu(null); return; }
    hideTimer.current = setTimeout(() => setMenu(null), 160);
  };
  const closeMenu = () => { clearTimeout(hideTimer.current); setMenu(null); };
  const toggle = (m) => { setMenu((cur) => (cur === m ? null : m)); };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenu(null);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const is = (paths) => paths.includes(location.pathname);
  const dashTo = user?.role === 'admin' ? '/securegate/dashboard' : '/dashboard';

  return (
    <div className="sp-root min-h-screen flex flex-col">
      {/* Announcement */}
      <div className="bg-[color:var(--sp-ink)] text-white/80 text-[12.5px]">
        <div className="sp-container h-9 flex items-center justify-center">
          <Link to="/features" className="group inline-flex items-center gap-2 hover:text-white transition-colors">
            <span className="inline-flex items-center h-5 px-2 rounded-full bg-white/10 text-[10.5px] font-semibold tracking-wide text-[color:var(--sp-green-300)] uppercase">New</span>
            <span className="truncate">AI Assistant for Restaurants is now available</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Header */}
      <header
        className={`sp-header sticky top-0 z-50 border-b ${scrolled ? 'bg-[rgba(248,246,241,0.86)] backdrop-blur-xl border-[color:var(--sp-line)]' : 'bg-[color:var(--sp-paper)] border-[color:var(--sp-line)]'}`}
      >
        <div className="sp-container">
          <div className="h-16 flex items-center justify-between gap-6">
            <Link to="/" className="shrink-0" aria-label={platformName}>
              <Logo branding={branding} />
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main">
              {/* Product */}
              <MegaGroup
                id="product"
                menu={menu}
                enter={enter}
                leave={leave}
                close={closeMenu}
                toggle={toggle}
                active={is(['/features', '/integrations'])}
                align="left"
                width={660}
                trigger="Product"
                label="Product menu"
              >
                <div className="grid grid-cols-[1.3fr_1fr]">
                  <div className="sp-mega-col">
                    <span className="sp-mega-label">Platform</span>
                    {PRODUCT.map((item) => (
                      <MegaItem key={item.label} {...item} />
                    ))}
                  </div>
                  <div className="sp-mega-col sp-mega-divider sp-mega-aside">
                    <span className="sp-mega-label">Explore</span>
                    <MegaCard
                      to="/features"
                      title="The full Sectros platform"
                      body="Reservations, tables, menus, staff and analytics — all in one place."
                      cta="View all features"
                      tone="mint"
                    />
                  </div>
                </div>
              </MegaGroup>

              {/* Solutions */}
              <MegaGroup
                id="solutions"
                menu={menu}
                enter={enter}
                leave={leave}
                close={closeMenu}
                toggle={toggle}
                active={location.pathname.startsWith('/solutions')}
                align="center"
                width={720}
                trigger="Solutions"
                label="Solutions menu"
              >
                <div className="grid grid-cols-[1fr_1fr_0.85fr]">
                  {SOLUTION_GROUPS.map((group) => (
                    <div key={group.label} className="sp-mega-col">
                      <span className="sp-mega-label">{group.label}</span>
                      {group.items.map((item) => (
                        <MegaItem key={item.label} {...item} />
                      ))}
                    </div>
                  ))}
                  <div className="sp-mega-col sp-mega-divider sp-mega-aside">
                    <span className="sp-mega-label">Explore</span>
                    <MegaCard
                      to="/solutions"
                      title="Find your fit"
                      body="Every venue type and every goal — see how hospitality teams run on Sectros."
                      cta="All solutions"
                      tone="white"
                    />
                  </div>
                </div>
              </MegaGroup>

              {/* Resources */}
              <MegaGroup
                id="resources"
                menu={menu}
                enter={enter}
                leave={leave}
                close={closeMenu}
                toggle={toggle}
                active={is(RESOURCE_TO)}
                align="center"
                width={640}
                trigger="Resources"
                label="Resources menu"
              >
                <div className="grid grid-cols-[1fr_1fr]">
                  {RESOURCE_GROUPS.map((group, i) => (
                    <div key={group.label} className={`sp-mega-col ${i > 0 ? 'sp-mega-divider sp-mega-aside' : ''}`}>
                      <span className="sp-mega-label">{group.label}</span>
                      {group.items.map((item) => (
                        <MegaItem key={item.label} {...item} />
                      ))}
                      {i > 0 && (
                        <div className="mt-3">
                          <MegaCard
                            to="/help"
                            title="Talk to support"
                            body="Answers, troubleshooting and setup help from the Sectros team."
                            cta="Visit the Help Center"
                            tone="mint"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </MegaGroup>

              <Link to="/pricing" className="sp-nav-link" data-active={is(['/pricing'])}>Pricing</Link>

              {/* About */}
              <MegaGroup
                id="about"
                menu={menu}
                enter={enter}
                leave={leave}
                close={closeMenu}
                toggle={toggle}
                active={is(['/about', '/careers', '/contact'])}
                align="right"
                width={640}
                trigger="About"
                label="About menu"
              >
                <div className="grid grid-cols-[1fr_1.15fr]">
                  <div className="sp-mega-col">
                    <span className="sp-mega-label">Company</span>
                    {COMPANY.map((item) => (
                      <MegaItem key={item.label} {...item} />
                    ))}
                  </div>
                  <div className="sp-mega-col sp-mega-divider sp-mega-cards">
                    <MegaCard
                      to="/about"
                      eyebrow="About"
                      title="About Sectros"
                      body="Built for hospitality. Powered by technology."
                      cta="Visit"
                      tone="mint"
                    />
                    <MegaCard
                      to="/about#press"
                      eyebrow="Press"
                      title="In the Press"
                      body="Sectros in hospitality, technology and the media."
                      cta="Visit"
                      tone="white"
                    />
                  </div>
                </div>
              </MegaGroup>
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              {loading ? (
                <div className="h-9 w-40 rounded-full bg-black/5 animate-pulse" />
              ) : user ? (
                <Link to={dashTo} className="sp-btn sp-btn-primary sp-btn-sm">Dashboard <ArrowRight className="sp-arrow w-3.5 h-3.5" /></Link>
              ) : (
                <>
                  <Link to="/login" className="sp-btn sp-btn-secondary sp-btn-sm">Login</Link>
                  <Link to="/register" className="sp-btn sp-btn-primary sp-btn-sm">Get Started</Link>
                </>
              )}
            </div>

            <button
              type="button"
              className="lg:hidden -mr-2 w-10 h-10 inline-flex items-center justify-center rounded-full text-[color:var(--sp-ink)] hover:bg-black/5"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'calc(100dvh - 64px)' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="lg:hidden overflow-y-auto bg-[color:var(--sp-paper)] border-t border-[color:var(--sp-line)]"
            >
              <div className="sp-container py-6 flex flex-col">
                <MobileGroup title="Product">
                  {PRODUCT.map(({ label, to, icon: Icon }) => (
                    <Link key={label} to={to} className="flex items-center gap-3 py-2.5">
                      <span className="sp-icon-chip" style={{ width: 32, height: 32 }}><Icon className="w-4 h-4" strokeWidth={1.8} /></span>
                      <span className="text-[15px] font-medium">{label}</span>
                    </Link>
                  ))}
                </MobileGroup>
                <MobileGroup title="Solutions">
                  {SOLUTION_GROUPS.map((group) => (
                    <div key={group.label} className="mb-3 last:mb-0">
                      <div className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[color:var(--sp-text-3)] py-1.5">{group.label}</div>
                      <div className="grid grid-cols-2 gap-x-4">
                        {group.items.map(({ label, to }) => (
                          <Link key={label} to={to} className="py-2 text-[15px] text-[color:var(--sp-text-2)]">{label}</Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </MobileGroup>
                <MobileGroup title="Resources">
                  <div className="grid grid-cols-2 gap-x-4">
                    {RESOURCE_GROUPS.flatMap((g) => g.items).map(({ label, to }) => (
                      <Link key={label} to={to} className="py-2 text-[15px] text-[color:var(--sp-text-2)]">{label}</Link>
                    ))}
                  </div>
                </MobileGroup>
                <MobileGroup title="Company">
                  <div className="grid grid-cols-2 gap-x-4">
                    {COMPANY.map(({ label, to }) => (
                      <Link key={label} to={to} className="py-2 text-[15px] text-[color:var(--sp-text-2)]">{label}</Link>
                    ))}
                  </div>
                </MobileGroup>
                <Link to="/pricing" className="py-4 border-b border-[color:var(--sp-line)] sp-display text-[24px]">Pricing</Link>
                <div className="grid grid-cols-2 gap-3 mt-8">
                  {!loading && (user ? (
                    <Link to={dashTo} className="sp-btn sp-btn-primary sp-btn-lg col-span-2">Dashboard</Link>
                  ) : (
                    <>
                      <Link to="/login" className="sp-btn sp-btn-secondary sp-btn-lg">Login</Link>
                      <Link to="/register" className="sp-btn sp-btn-primary sp-btn-lg">Get Started</Link>
                    </>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <PremiumFooter branding={branding} platformName={platformName} />
      <CookieConsentBanner />
    </div>
  );
}

function MobileGroup({ title, children }) {
  return (
    <div className="py-4 border-b border-[color:var(--sp-line)]">
      <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[color:var(--sp-text-3)] mb-2">{title}</div>
      {children}
    </div>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
const FOOTER_COLS = [
  { title: 'Product', links: [['Features', '/features'], ['Pricing', '/pricing'], ['Integrations', '/integrations'], ['Updates', '/blog']] },
  { title: 'Solutions', links: [['Restaurants', '/solutions'], ['Cafés', '/solutions'], ['Bars', '/solutions'], ['Hotels', '/solutions']] },
  { title: 'Resources', links: [['Blog', '/blog'], ['Help Center', '/help'], ['Guides', '/guides']] },
  { title: 'Company', links: [['About', '/about'], ['Careers', '/careers'], ['Contact', '/contact'], ['Partners', '/partners']] },
];

function PremiumFooter({ branding, platformName }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const socials = [
    { label: 'Instagram', href: branding.instagram_url, d: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5ZM17.6 5.4a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z' },
    { label: 'LinkedIn', href: branding.linkedin_url, d: 'M4.98 3.5A2.5 2.5 0 1 1 2.5 6a2.5 2.5 0 0 1 2.48-2.5ZM3 8.98h4V21H3ZM9.5 8.98h3.8v1.64h.05a4.17 4.17 0 0 1 3.75-2.06c4 0 4.75 2.64 4.75 6.07V21h-4v-5.6c0-1.34 0-3.06-1.86-3.06s-2.15 1.46-2.15 2.96V21h-4Z' },
    { label: 'YouTube', href: branding.youtube_url, d: 'M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.75 15.02V8.98L15.5 12Z' },
  ];

  return (
    <footer className="relative bg-[#08130f] text-white/70 overflow-hidden">
      <div className="sp-container pt-20 md:pt-24 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))_1.9fr] gap-x-8 gap-y-12">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" aria-label={platformName}><Logo branding={branding} dark /></Link>
            <p className="mt-5 text-[14px] leading-relaxed text-white/55 max-w-[260px]">
              The operating system for modern hospitality businesses.
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title} className="col-span-1">
              <h4 className="text-[12px] font-semibold tracking-[0.12em] uppercase text-white/90">{col.title}</h4>
              <ul className="mt-5 space-y-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-[14px] text-white/55 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="text-[12px] font-semibold tracking-[0.12em] uppercase text-white/90">Stay updated</h4>
            <p className="mt-5 text-[14px] text-white/55">Get the latest news and product updates.</p>
            {done ? (
              <p className="mt-5 text-[14px] text-[color:var(--sp-green-300)]">Thanks — you're on the list.</p>
            ) : (
              <form
                className="mt-5 flex flex-col sm:flex-row gap-2"
                onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
              >
                <label htmlFor="sp-news" className="sr-only">Your email</label>
                <input id="sp-news" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="sp-input flex-1 min-w-0" />
                <button type="submit" className="sp-btn sp-btn-primary" style={{ '--h': '48px' }}>Subscribe</button>
              </form>
            )}
          </div>
        </div>

        {/* Oversized wordmark */}
        <div aria-hidden="true" className="mt-20 md:mt-28 select-none pointer-events-none">
          <div className="sp-display text-[22vw] lg:text-[clamp(88px,13.5vw,200px)] lg:whitespace-nowrap leading-[0.8] tracking-[-0.05em] text-white/[0.04] lowercase text-center -mb-4">
            {platformName}
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
          <p className="text-[12.5px] text-white/40">
            &copy; {new Date().getFullYear()} {platformName} by Nadvix Limited (trading as Nadvix Technology Limited). All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Refund Policy', '/refund'], ['Cookie Policy', '/cookies'], ['GDPR & DMCA', '/gdpr']].map(([l, to]) => (
              <Link key={l} to={to} className="text-[12.5px] text-white/45 hover:text-white transition-colors">{l}</Link>
            ))}
            <div className="flex items-center gap-1 lg:ml-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href || '#'} target={s.href ? '_blank' : undefined} rel="noreferrer" aria-label={s.label}
                  className="w-9 h-9 rounded-full inline-flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d={s.d} /></svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
