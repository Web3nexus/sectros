import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, Clock } from 'lucide-react';
import { Reveal, RevealGroup, RevealItem, Eyebrow, ArrowIcon, EASE } from './primitives';

/* Catalog of editorial covers — real Sectros photography from /premium/ */
const IMG = {
  service: '/premium/challenge-service.jpg',
  guest: '/premium/guest-experience.jpg',
  video: '/premium/hero-hospitality-video.jpg',
  margherita: '/premium/margherita.jpg',
  ribeye: '/premium/ribeye.jpg',
  pasta: '/premium/truffle-pasta.jpg',
};

const CATEGORIES = ['All', 'Product', 'Hospitality', 'Operations', 'Insights', 'Case Studies', 'Company'];

const articles = [
  {
    category: 'Operations',
    title: '10 ways to boost restaurant revenue during slow seasons',
    excerpt: 'Practical strategies hospitality operators use to maintain steady revenue during traditionally slower months.',
    author: 'Alexis Moreno',
    date: 'May 10, 2025',
    readTime: '6 min read',
    image: IMG.ribeye,
    href: '/blog/10-ways-to-boost-restaurant-revenue-during-slow-seasons',
    wide: true,
  },
  {
    category: 'Product',
    title: 'Introducing Smart Waitlist: Real-time capacity management',
    excerpt: 'Our new Smart Waitlist feature uses AI to predict table turnover times, reducing guest wait times by an average of 35%.',
    author: 'Priya Kapoor',
    date: 'May 15, 2025',
    readTime: '4 min read',
    image: IMG.video,
    href: '/blog/introducing-smart-waitlist-real-time-capacity-management',
  },
  {
    category: 'Insights',
    title: '2025 hospitality technology trends every operator should know',
    excerpt: 'From AI-powered forecasting to contactless payments, here are the trends reshaping the hospitality industry.',
    author: 'James Okonkwo',
    date: 'May 5, 2025',
    readTime: '7 min read',
    image: IMG.guest,
    href: '/blog/2025-hospitality-technology-trends-every-operator-should-know',
  },
  {
    category: 'Case Studies',
    title: 'How The Grand Bistro cut no-shows by 70% with automated reminders',
    excerpt: 'See how a busy downtown restaurant transformed its reservation management and dramatically reduced lost revenue.',
    author: 'David Chen',
    date: 'April 28, 2025',
    readTime: '5 min read',
    image: IMG.margherita,
    href: '/blog/how-the-grand-bistro-cut-no-shows-by-70-with-automated-reminders',
  },
  {
    category: 'Hospitality',
    title: 'Building a better guest experience: A practical guide',
    excerpt: 'Hospitality is about more than great food. Learn how to create memorable experiences that keep guests coming back.',
    author: 'Priya Kapoor',
    date: 'April 20, 2025',
    readTime: '5 min read',
    image: IMG.pasta,
    href: '/blog/building-a-better-guest-experience-a-practical-guide',
  },
  {
    category: 'Product',
    title: 'New integration: Sync your menu directly from Toast POS',
    excerpt: 'Our new Toast integration automatically syncs menu items, prices, and availability in real time.',
    author: 'David Chen',
    date: 'April 15, 2025',
    readTime: '3 min read',
    image: IMG.service,
    href: '/blog/new-integration-sync-your-menu-directly-from-toast-pos',
  },
  {
    category: 'Operations',
    title: 'The state of multi-location hospitality management in 2025',
    excerpt: 'As hospitality groups expand, the challenges of managing multiple venues become more complex. Here\'s how technology is helping.',
    author: 'Alexis Moreno',
    date: 'April 8, 2025',
    readTime: '8 min read',
    image: IMG.guest,
    href: '/blog/the-state-of-multi-location-hospitality-management-in-2025',
  },
];

const featured = {
  category: 'Case Studies',
  title: 'Rivera Hospitality Group: Scaling from one venue to five with Sectros',
  excerpt:
    'When Rivera Hospitality Group expanded from a single restaurant to five distinct venues across the city, they needed a platform that could grow with them. Here\'s how Sectros helped them maintain consistency while scaling operations.',
  author: 'Priya Kapoor',
  date: 'May 20, 2025',
  readTime: '8 min read',
  image: IMG.service,
  href: '/blog/rivera-hospitality-group',
};

function Meta({ a }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-[color:var(--sp-text-3)]">
      <span className="inline-flex items-center gap-1.5">
        <User className="h-3.5 w-3.5" strokeWidth={1.8} /> {a.author}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" strokeWidth={1.8} /> {a.date}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" strokeWidth={1.8} /> {a.readTime}
      </span>
    </div>
  );
}

function CategoryPill({ children }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-[rgba(18,121,76,0.18)] bg-[color:var(--sp-mint)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sp-green)]">
      {children}
    </span>
  );
}

function ReadLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group/link inline-flex items-center gap-2 text-[14px] font-semibold text-[color:var(--sp-ink)] transition-colors hover:text-[color:var(--sp-green)]"
    >
      {children}
      <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-[4px]" />
    </Link>
  );
}

function ArticleCard({ a }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[color:var(--sp-line)] bg-white shadow-[var(--sp-shadow-sm)] transition-shadow duration-500 hover:shadow-[var(--sp-shadow-md)]">
      <Link to={a.href} className="block overflow-hidden">
        <img
          src={a.image}
          alt={a.title}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <CategoryPill>{a.category}</CategoryPill>
          <span className="text-[12px] text-[color:var(--sp-text-3)]">{a.date}</span>
        </div>
        <h3 className="mt-4 flex-1">
          <Link
            to={a.href}
            className="text-[19px] font-medium leading-snug tracking-[-0.01em] text-[color:var(--sp-ink)] transition-colors duration-300 group-hover:text-[color:var(--sp-green-600)]"
          >
            {a.title}
          </Link>
        </h3>
        <p className="mt-2.5 text-[14px] leading-relaxed text-[color:var(--sp-text-2)]">{a.excerpt}</p>
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-[color:var(--sp-line)] pt-4">
          <span className="text-[12.5px] text-[color:var(--sp-text-3)]">{a.author} · {a.readTime}</span>
          <ReadLink to={a.href}>Read article</ReadLink>
        </div>
      </div>
    </article>
  );
}

function WideCard({ a }) {
  return (
    <article className="group grid overflow-hidden rounded-[20px] border border-[color:var(--sp-line)] bg-white shadow-[var(--sp-shadow-sm)] transition-shadow duration-500 hover:shadow-[var(--sp-shadow-md)] md:grid-cols-[1.1fr_1fr]">
      <Link to={a.href} className="block overflow-hidden">
        <img
          src={a.image}
          alt={a.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] md:aspect-auto aspect-[16/10]"
        />
      </Link>
      <div className="flex flex-col justify-center p-7 md:p-9">
        <div className="flex items-center justify-between gap-3">
          <CategoryPill>{a.category}</CategoryPill>
          <span className="text-[12px] text-[color:var(--sp-text-3)]">{a.date}</span>
        </div>
        <h3 className="mt-5">
          <Link
            to={a.href}
            className="sp-display text-[26px] leading-[1.12] tracking-[-0.015em] text-[color:var(--sp-ink)] transition-colors duration-300 group-hover:text-[color:var(--sp-green-600)] md:text-[30px]"
          >
            {a.title}
          </Link>
        </h3>
        <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--sp-text-2)]">{a.excerpt}</p>
        <div className="mt-7 flex items-center justify-between gap-4 border-t border-[color:var(--sp-line)] pt-5">
          <Meta a={a} />
          <ReadLink to={a.href}>Read article</ReadLink>
        </div>
      </div>
    </article>
  );
}

export default function PremiumBlog() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [q, setQ] = useState('');

  const filtered = articles.filter((a) => {
    const catOk = activeFilter === 'All' || a.category === activeFilter;
    const query = q.trim().toLowerCase();
    const searchOk = !query || a.title.toLowerCase().includes(query) || a.excerpt.toLowerCase().includes(query);
    return catOk && searchOk;
  });

  const wide = filtered.find((a) => a.wide);
  const rest = filtered.filter((a) => !a.wide);

  return (
    <div className="font-sans antialiased">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-14 sm:pt-20 sm:pb-16">
        <div className="sp-hero-bg" />
        <div className="sp-container relative">
          <div className="max-w-[720px]">
            <Reveal>
              <Eyebrow>The Sectros Journal</Eyebrow>
              <h1 className="sp-display sp-h1 mt-6">
                The latest from <em>hospitality.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="sp-lead mt-6 max-w-[520px]">
                Ideas, insights and practical guides for running a smarter hospitality business.
              </p>
            </Reveal>
            <Reveal delay={0.16} className="mt-9 max-w-sm">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[color:var(--sp-text-3)]" strokeWidth={2} />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search articles…"
                  aria-label="Search articles"
                  className="h-[50px] w-full rounded-full border border-[color:var(--sp-line)] bg-white pl-11 pr-4 text-[14px] text-[color:var(--sp-ink)] shadow-[var(--sp-shadow-sm)] transition-colors placeholder:text-[color:var(--sp-text-3)] focus:border-[rgba(18,121,76,0.35)] focus:outline-none"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Featured article ──────────────────────────────────── */}
      <section className="pb-20 sm:pb-24">
        <div className="sp-container">
          <Reveal>
            <div className="flex items-center gap-4">
              <h2 className="sp-h4">Featured</h2>
              <span className="h-px flex-1 bg-[color:var(--sp-line)]" />
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-7">
            <article className="group overflow-hidden rounded-[24px] border border-[color:var(--sp-line)] bg-white shadow-[var(--sp-shadow-sm)] transition-shadow duration-500 hover:shadow-[var(--sp-shadow-md)] lg:grid lg:grid-cols-[1.15fr_1fr]">
              <Link to={featured.href} className="relative block overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="aspect-[16/9] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] lg:h-full"
                />
                <span className="absolute left-5 top-5 rounded-full bg-[color:var(--sp-ink)]/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                  Editor&apos;s pick
                </span>
              </Link>
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <CategoryPill>{featured.category}</CategoryPill>
                  <span className="text-[12.5px] text-[color:var(--sp-text-3)]">{featured.date}</span>
                </div>
                <h2 className="mt-5">
                  <Link
                    to={featured.href}
                    className="sp-display text-[28px] leading-[1.1] tracking-[-0.02em] text-[color:var(--sp-ink)] transition-colors duration-300 group-hover:text-[color:var(--sp-green-600)] sm:text-[36px]"
                  >
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-[color:var(--sp-text-2)]">{featured.excerpt}</p>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--sp-line)] pt-6">
                  <Meta a={featured} />
                  <ReadLink to={featured.href}>Read article</ReadLink>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ── Categories + grid ─────────────────────────────────── */}
      <section className="bg-white pb-24 sm:pb-28">
        <div className="sp-container">
          <Reveal>
            <nav aria-label="Article categories" className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-[color:var(--sp-line)] pb-4">
              {CATEGORIES.map((cat) => {
                const active = activeFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveFilter(cat)}
                    aria-pressed={active}
                    className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-green)] focus-visible:ring-offset-2 ${
                      active
                        ? 'bg-[color:var(--sp-ink)] text-white'
                        : 'text-[color:var(--sp-text-2)] hover:bg-[color:var(--sp-mint)] hover:text-[color:var(--sp-ink)]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </nav>
          </Reveal>

          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="sp-lead">No articles match your search yet.</p>
              <button
                type="button"
                onClick={() => { setActiveFilter('All'); setQ(''); }}
                className="sp-link mx-auto mt-4"
              >
                Clear filters <ArrowIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <RevealGroup className="mt-10 space-y-8" stagger={0.05} amount={0.1}>
              {wide && (
                <RevealItem key={`wide-${activeFilter}`} y={0}>
                  <WideCard a={wide} />
                </RevealItem>
              )}
              <RevealItem y={0}>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((a) => (
                    <ArticleCard key={a.href} a={a} />
                  ))}
                </div>
              </RevealItem>
            </RevealGroup>
          )}
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────── */}
      <section className="sp-bg-ink relative overflow-hidden py-20 sm:py-24">
        <div className="sp-noise-dark" />
        <div className="sp-container relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <Reveal>
                <Eyebrow>The Dispatch</Eyebrow>
                <h2 className="sp-display sp-h2 mt-5 text-white">Stay in the loop.</h2>
                <p className="sp-lead mt-5 max-w-[460px]">
                  Get the latest hospitality insights, product updates, and tips delivered to your inbox every two weeks.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="rounded-[20px] border border-white/10 bg-[color:var(--sp-ink-3)] p-7 shadow-[var(--sp-shadow-lg)] sm:p-8"
              >
                <label htmlFor="sp-blog-news" className="mb-2 block text-[14px] font-medium text-white/80">
                  Email address
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="sp-blog-news"
                    type="email"
                    required
                    placeholder="you@venue.com"
                    className="sp-input flex-1 min-w-0"
                  />
                  <button type="submit" className="sp-btn sp-btn-primary sp-btn-lg shrink-0" style={{ '--h': '48px' }}>
                    Subscribe <ArrowIcon />
                  </button>
                </div>
                <p className="mt-4 text-[12.5px] text-white/40">No spam. Unsubscribe anytime.</p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}