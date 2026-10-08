import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Quote, Zap, ShieldCheck, Lightbulb, ArrowRight } from 'lucide-react';
import { useCmsContent } from '../../../hooks/useCmsContent';
import { Reveal, RevealGroup, RevealItem, Eyebrow, ArrowIcon, SectionHeader } from './primitives';

/* Existing brand photography — real hospitality imagery used across the site */
const STRIP = [
  { src: '/premium/hero-hospitality-video.jpg', alt: 'Hospitality team at work in a dining room' },
  { src: '/premium/guest-experience.jpg', alt: 'Guests being welcomed at a venue' },
  { src: '/premium/challenge-service.jpg', alt: 'Service in progress on the floor' },
  { src: '/premium/ribeye.jpg', alt: 'A plated dish served at the table' },
];

/* Existing page content — the three problems the platform was built to solve */
const PROBLEMS = [
  {
    title: 'Fragmented systems',
    body: 'The average venue uses 5+ disconnected tools. Data doesn\'t flow, staff wastes time re-entering information, and mistakes multiply.',
  },
  {
    title: 'Legacy interfaces',
    body: 'Most hospitality software hasn\'t been redesigned in a decade. Clunky interfaces slow down staff during peak hours when every second counts.',
  },
  {
    title: 'Hidden costs',
    body: 'Between payment processing fees, POS licensing, marketing tools, and add-ons, venues often pay 3x more than necessary for disjointed software.',
  },
];

/* Existing page content — product philosophy */
const PRINCIPLES = [
  {
    icon: Zap,
    title: 'Simplicity',
    body: 'Every feature is designed to be intuitive. If it takes more than two clicks, we rethink it. Hospitality teams are busy — our software stays out of the way.',
  },
  {
    icon: ShieldCheck,
    title: 'Reliability',
    body: 'Mission-critical operations need rock-solid infrastructure. Our platform delivers 99.99% uptime with real-time sync and automatic backups across all venues.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    body: 'We invest heavily in R&D to bring AI-powered forecasting, smart waitlist management, and predictive analytics to every hospitality business, regardless of size.',
  },
];

/* Disciplines, taken from the existing team copy — not individual profiles */
const DISCIPLINES = [
  { title: 'Operators', body: 'People who have worked the floor and know where the friction really is.' },
  { title: 'Engineers', body: 'Builders who care about uptime, speed and software that stays out of the way.' },
  { title: 'Designers', body: 'Craft-focused makers shaping interfaces that read clearly during a busy service.' },
];

export default function PremiumAbout() {
  const { get, getArray } = useCmsContent('about');
  const location = useLocation();

  const press = getArray('press.items', []);
  const members = getArray('team.members', []);
  const hasPress = press.length > 0;

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => clearTimeout(t);
  }, [location.hash, location.pathname]);

  return (
    <div className="sp-root bg-[color:var(--sp-paper)]">
      {/* ──────────────────────────────────────────────────────────────────
          1. Editorial hero
      ────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[color:var(--sp-line)]">
        <div className="sp-hero-bg" />
        <div className="sp-container relative pt-20 pb-14 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20">
          <Reveal y={12} duration={0.6}>
            <Eyebrow>About Sectros</Eyebrow>
          </Reveal>

          <Reveal y={22} delay={0.08} duration={0.8}>
            <h1 className="sp-display sp-h1 mt-6 max-w-[16ch] text-[color:var(--sp-ink)]">
              {get('hero.heading')}
            </h1>
          </Reveal>

          <Reveal y={18} delay={0.16} duration={0.8}>
            <p className="sp-lead mt-7 max-w-[560px]">
              {get('hero.paragraph')}
            </p>
          </Reveal>

          <Reveal y={14} delay={0.26} duration={0.8}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/register" className="sp-btn sp-btn-primary">
                Get Started Free <ArrowIcon />
              </Link>
              <Link to="/contact" className="sp-btn sp-btn-secondary">
                Book a Demo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          2. Hospitality image / story strip
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-bg-white border-b border-[color:var(--sp-line)]">
        <div className="sp-container py-8 md:py-10">
          <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" stagger={0.08}>
            {STRIP.map((img) => (
              <RevealItem key={img.src} className="relative overflow-hidden rounded-2xl border border-[color:var(--sp-line)] bg-[color:var(--sp-paper)] aspect-[4/5]">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          3. Our Story
      ────────────────────────────────────────────────────────────────── */}
      <section id="story" className="sp-section sp-bg-white border-b border-[color:var(--sp-line)] scroll-mt-[110px]">
        <div className="sp-container">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-20">
            <div>
              <Reveal>
                <Eyebrow>Our Story</Eyebrow>
                <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">
                  {get('mission.heading')}
                </h2>
              </Reveal>
            </div>
            <div className="lg:pt-3">
              <Reveal delay={0.08}>
                <p className="sp-body text-[17px] leading-[1.7] text-[color:var(--sp-text-2)]">
                  {get('mission.body1')}
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="sp-body mt-6 text-[17px] leading-[1.7] text-[color:var(--sp-text-2)]">
                  {get('mission.body2')}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          4. Founder / operator note
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section sp-bg-paper border-b border-[color:var(--sp-line)]">
        <div className="sp-container max-w-[900px]">
          <Reveal>
            <div className="relative rounded-3xl border border-[color:var(--sp-line)] bg-white p-8 sm:p-12 shadow-[var(--sp-shadow-sm)]">
              <Quote className="w-8 h-8 text-[color:var(--sp-green)]" strokeWidth={1.5} aria-hidden="true" />
              <blockquote className="sp-display mt-6 text-[22px] sm:text-[26px] leading-[1.4] tracking-[-0.02em] text-[color:var(--sp-ink)]">
                Restaurants run on timing. Tables turn, tickets fire, guests arrive — and the
                software in the middle should never be the slowest part of the room. We built
                Sectros because the tools behind hospitality deserve the same care as the
                experiences in front of them.
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 text-[13px] text-[color:var(--sp-text-3)]">
                <span className="inline-block w-8 h-px bg-[color:var(--sp-line-2)]" />
                The Sectros team
              </figcaption>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          5. Why Sectros exists
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section sp-bg-white border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <SectionHeader
            eyebrow="Why we exist"
            title={
              <>
                Hospitality deserves <span className="sp-em italic">better tools.</span>
              </>
            }
            lead="Most venues run on software that was built for offices, not for service. These are the three problems Sectros was created to remove."
          />

          <RevealGroup className="mt-14 grid md:grid-cols-3 gap-px bg-[color:var(--sp-line)] border border-[color:var(--sp-line)] rounded-2xl overflow-hidden" stagger={0.1}>
            {PROBLEMS.map((p, i) => (
              <RevealItem key={p.title} className="bg-white p-7 md:p-8">
                <span className="sp-num block text-[13px] tracking-[0.14em] text-[color:var(--sp-green)]">
                  0{i + 1}
                </span>
                <h3 className="sp-display mt-4 text-[21px] leading-tight text-[color:var(--sp-ink)]">{p.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[color:var(--sp-text-2)]">{p.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <div className="mt-16 pt-10 border-t border-[color:var(--sp-line)]">
              <Eyebrow>{get('philosophy.heading')}</Eyebrow>
              <div className="mt-8 grid md:grid-cols-3 gap-8 md:gap-10">
                {PRINCIPLES.map(({ icon: Icon, title, body }) => (
                  <div key={title}>
                    <span className="sp-icon-chip"><Icon className="w-4 h-4" strokeWidth={1.8} /></span>
                    <h4 className="sp-h4 mt-4 text-[color:var(--sp-ink)]">{title}</h4>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-[color:var(--sp-text-2)]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          6. Team
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section sp-bg-paper border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <Reveal className="max-w-[620px]">
              <Eyebrow>{get('team.heading')}</Eyebrow>
              <p className="sp-lead mt-5">
                {get('team.paragraph')}
              </p>
            </Reveal>
            <Reveal delay={0.1} className="shrink-0">
              <Link to="/careers" className="sp-btn sp-btn-secondary">
                View open roles <ArrowIcon />
              </Link>
            </Reveal>
          </div>

          {members.length > 0 ? (
            <RevealGroup className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
              {members.map((m) => (
                <RevealItem key={m.name} className="rounded-2xl border border-[color:var(--sp-line)] bg-white p-6">
                  <div className="w-12 h-12 rounded-full bg-[color:var(--sp-mint)] border border-[rgba(18,121,76,0.14)] flex items-center justify-center text-[13px] font-semibold text-[color:var(--sp-green)]">
                    {(m.name || '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="mt-4 text-[15.5px] font-semibold text-[color:var(--sp-ink)]">{m.name}</h3>
                  <p className="text-[13.5px] text-[color:var(--sp-text-3)]">{m.role}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <RevealGroup className="mt-12 grid md:grid-cols-3 gap-px bg-[color:var(--sp-line)] border border-[color:var(--sp-line)] rounded-2xl overflow-hidden" stagger={0.1}>
              {DISCIPLINES.map((d) => (
                <RevealItem key={d.title} className="bg-white p-7">
                  <h3 className="sp-display text-[24px] text-[color:var(--sp-ink)]">{d.title}</h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-[color:var(--sp-text-2)]">{d.body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          7. Press / recognition — rendered only when real content exists
      ────────────────────────────────────────────────────────────────── */}
      {hasPress && (
        <section id="press" className="sp-section sp-bg-white border-b border-[color:var(--sp-line)] scroll-mt-[110px]">
          <div className="sp-container">
            <SectionHeader
              eyebrow="Press & recognition"
              title={<>Sectros in the news.</>}
            />
            <RevealGroup className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.08}>
              {press.map((item) => (
                <RevealItem key={item.title || item.url}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer" className="block h-full rounded-2xl border border-[color:var(--sp-line)] bg-white p-6 hover:border-[color:var(--sp-line-2)] hover:shadow-[var(--sp-shadow-md)] transition-shadow">
                      <h3 className="text-[16px] font-semibold text-[color:var(--sp-ink)]">{item.title}</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--sp-text-2)]">{item.body}</p>
                      <span className="sp-link mt-4 text-[13px]">Read <ArrowRight className="w-3.5 h-3.5" /></span>
                    </a>
                  ) : (
                    <div className="h-full rounded-2xl border border-[color:var(--sp-line)] bg-white p-6">
                      <h3 className="text-[16px] font-semibold text-[color:var(--sp-ink)]">{item.title}</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--sp-text-2)]">{item.body}</p>
                    </div>
                  )}
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          8. Dark-green CTA
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg">
        <div className="sp-container">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 lg:p-16" style={{ background: '#0b3d29' }}>
              <div className="sp-noise-dark" />
              <div className="relative z-10 max-w-[720px]">
                <Eyebrow>Get involved</Eyebrow>
                <h2 className="sp-display sp-h2 mt-5 text-white">
                  {get('joinCta.heading')}
                </h2>
                <p className="sp-lead text-white/70 mt-5 max-w-[520px]">
                  {get('joinCta.paragraph')}
                </p>
                <div className="mt-9 flex flex-col sm:flex-row gap-3.5">
                  <Link to="/careers" className="sp-btn sp-btn-light sp-btn-lg">
                    {get('joinCta.cta_primary', 'View open roles')} <ArrowIcon />
                  </Link>
                  <Link to="/contact" className="sp-btn sp-btn-ghost-dark sp-btn-lg">
                    {get('joinCta.cta_secondary', 'Get in touch')}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
