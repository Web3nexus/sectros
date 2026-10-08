import { Link } from 'react-router-dom';
import './premium.css';
import { Lock, KeyRound, Fingerprint, DatabaseBackup, ShieldCheck, Activity, ServerCog, FileCheck2, LifeBuoy } from 'lucide-react';
import { Reveal, RevealGroup, RevealItem, Eyebrow, ArrowIcon, CheckItem, Accordion } from './primitives';

/*
 * Security & Trust page.
 * Content is deliberately conservative: only real, verifiable controls are described.
 * No invented certifications, no invented statistics, no invented customer names.
 */

const HERO_CONTROLS = [
  { k: 'Transport', v: 'TLS 1.2+ in transit' },
  { k: 'Isolation', v: 'Data scoped per venue' },
  { k: 'Sessions', v: 'Short-lived, scope-limited' },
  { k: 'Signing', v: 'HMAC webhook signatures' },
];

const LAYERS = [
  { icon: ShieldCheck, title: 'Perimeter', body: 'Rate-limited auth surface, security headers and CSP applied across the app.' },
  { icon: Lock, title: 'Data layer', body: 'Every query is scoped to the active tenant — one venue can never read another.' },
  { icon: Fingerprint, title: 'Identity', body: 'Role-based access with short-lived sessions and optional two-factor verification.' },
  { icon: Activity, title: 'Operations', body: 'Audit logging, transaction guardrails and fail-fast connection timeouts.' },
];

const RELIABILITY = [
  {
    icon: DatabaseBackup,
    title: 'Atomic writes',
    body: 'Multi-table changes run inside transactions, so a record can never be half-written when a request fails.',
  },
  {
    icon: ServerCog,
    title: 'Fail-fast connections',
    body: 'Aggressive database timeouts release connections quickly under load instead of letting requests pile up.',
  },
  {
    icon: Activity,
    title: 'Bounded queries',
    body: 'List endpoints are hard-limited and paginated so no single request can scan more data than it needs.',
  },
  {
    icon: FileCheck2,
    title: 'Audit trail',
    body: 'Sensitive actions — impersonation, admin changes, tenant provisioning — write to an audit log.',
  },
];

const RESOURCES = [
  { title: 'Privacy Policy', to: '/privacy', body: 'How Sectros collects, uses, and protects personal data across the platform.' },
  { title: 'GDPR & Data Rights', to: '/gdpr', body: 'The rights available to data subjects and how to submit a formal request.' },
  { title: 'Cookie Policy', to: '/cookies', body: 'Which cookies the platform depends on and how to control them.' },
  { title: 'Contact our data-protection team', to: '/contact', body: 'For DPA requests, right-to-be-forgotten queries, or security questions.' },
];

const FAQ = [
  {
    q: 'Where is my venue\'s data stored?',
    a: 'Your data lives in Sectros\' managed hosting environment and is isolated by tenant scope at the data-access layer. Nothing on the platform crosses venue boundaries: staff, guests, reservations, orders, and payments for one business are never visible to another.',
  },
  {
    q: 'How are passwords and secrets protected?',
    a: 'Account passwords are stored only as one-way, salted hashes — the raw value is never recoverable. Long-lived secrets (like OAuth client secrets or API keys) are masked in the interface and never returned in full by the API.',
  },
  {
    q: 'Do you handle card payments directly?',
    a: 'No. Card payments are processed by our payment providers acting as the merchant of record. Sectros never receives or stores raw card numbers.',
  },
  {
    q: 'How do I request deletion of my data?',
    a: 'Data-subject requests — access, correction, erasure, restriction, and portability — can be submitted through the GDPR request form on the GDPR & Data Rights page, or by contacting our data-protection team. We respond within the statutory window.',
  },
  {
    q: 'How is my data moved between systems?',
    a: 'All traffic is encrypted in transit with TLS. Service webhooks are HMAC-signed and validated, and outbound integrations are authenticated with short-lived, refreshable tokens.',
  },
  {
    q: 'Who can access my account data?',
    a: 'Only users you explicitly create and assign roles to. Staff see the permissions of their role (owner, manager, staff, chef), and every role is tenant-scoped to your venue.',
  },
];

function Stat({ k, v }) {
  return (
    <div className="border-l-2 border-[color:var(--sp-green)] pl-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sp-text-3)]">{k}</p>
      <p className="mt-1 text-[13.5px] font-medium text-[color:var(--sp-ink)]">{v}</p>
    </div>
  );
}

export default function PremiumTrust() {
  return (
    <div className="sp-root bg-[color:var(--sp-paper)]">
      {/* ── 1. Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[color:var(--sp-line)]">
        <div className="sp-hero-bg" />
        <div className="sp-container relative pt-20 pb-16 md:pt-28 lg:pt-32 lg:pb-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-end">
            <div>
              <Reveal y={12} duration={0.6}>
                <Eyebrow>Security &amp; Trust</Eyebrow>
              </Reveal>
              <Reveal y={22} delay={0.08} duration={0.8}>
                <h1 className="sp-display sp-h1 mt-6 max-w-[15ch] text-[color:var(--sp-ink)]">
                  Built to protect your <em>business and guests.</em>
                </h1>
              </Reveal>
              <Reveal y={18} delay={0.16} duration={0.8}>
                <p className="sp-lead mt-7 max-w-[540px]">
                  Sectros manages real hospitality data — guest details, bookings, staff records, and
                  payments. Those are handled with the same care as a busy service: organised,
                  controlled, and reviewed. Here is exactly how, without the marketing language.
                </p>
              </Reveal>
            </div>
            <Reveal y={20} delay={0.2} duration={0.85}>
              <div className="relative">
                <div className="overflow-hidden rounded-3xl border border-[color:var(--sp-line)] shadow-[var(--sp-shadow-md)]">
                  <img
                    src="/premium/challenge-service.jpg"
                    alt="Hospitality staff working together during service"
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-5 -left-4 sm:-left-6 rounded-2xl border border-[color:var(--sp-line)] bg-white px-5 py-4 shadow-[var(--sp-shadow-lg)]">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--sp-green)]" />
                    <p className="text-[13px] font-semibold text-[color:var(--sp-ink)]">
                      Security controls active
                    </p>
                  </div>
                  <p className="mt-1 text-[12px] text-[color:var(--sp-text-3)]">
                    TLS · tenant isolation · rate limits
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal y={14} delay={0.28} duration={0.8}>
            <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4 border-t border-[color:var(--sp-line)] pt-8">
              {HERO_CONTROLS.map((c) => (
                <Stat key={c.k} {...c} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 2. Overview — layered posture ────────────────────── */}
      <section className="sp-section sp-bg-white border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-20">
            <div>
              <Reveal>
                <Eyebrow>Our approach</Eyebrow>
                <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">
                  Security is a posture, <em>not a badge.</em>
                </h2>
                <p className="sp-body mt-6 text-[17px] leading-[1.7]">
                  We list only what we actually do. Instead of a certificate wall, this page describes
                  the controls that exist today — at the perimeter, at the data layer, at identity,
                  and in day-to-day operations.
                </p>
              </Reveal>
            </div>
            <RevealGroup className="grid md:grid-cols-2 gap-px bg-[color:var(--sp-line)] border border-[color:var(--sp-line)] rounded-2xl overflow-hidden" stagger={0.09}>
              {LAYERS.map(({ icon: Icon, ...l }) => (
                <RevealItem key={l.title} className="bg-white p-6 md:p-7">
                  <span className="sp-icon-chip"><Icon className="w-4 h-4" strokeWidth={1.8} /></span>
                  <h3 className="mt-4 text-[15.5px] font-semibold text-[color:var(--sp-ink)]">{l.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--sp-text-2)]">{l.body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ── 3. Compliance / what we claim ────────────────────── */}
      <section className="sp-section sp-bg-paper border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <Reveal>
              <Eyebrow>Compliance</Eyebrow>
              <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">
                Compliant by design, <em className="italic">verified by publication.</em>
              </h2>
              <p className="sp-lead mt-6">
                Where we hold certifications we link them; where we don\'t, we say so plainly.
                What we can confirm today:
              </p>
              <ul className="mt-8 space-y-4">
                <CheckItem>GDPR-aligned — a privacy policy, a dedicated GDPR & data-rights page, and a working subject-request form.</CheckItem>
                <CheckItem>Data-processing agreements available on request through our data-protection contact.</CheckItem>
                <CheckItem>Card payments handled by PCI-DSS compliant payment providers as merchant of record — Sectros never stores raw card data.</CheckItem>
                <CheckItem>No fabricated badges. If we aren\'t independently certified, we don\'t display a claim.</CheckItem>
              </ul>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="rounded-3xl border border-[color:var(--sp-line)] bg-white p-8 shadow-[var(--sp-shadow-sm)] md:p-10">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sp-text-3)]">
                  Data protection framework
                </p>
                <div className="mt-6 space-y-0">
                  {[
                    ['Processing basis', 'The lawful bases we rely on for each processing activity are documented in our Privacy Policy.'],
                    ['Your rights', 'Access, correction, erasure, restriction, portability, and objection — requested via the GDPR form.'],
                    ['Sub-processors', 'Each service provider handles data only for the processing we engage them for, under contract.'],
                  ].map(([t, b], i) => (
                    <div key={t} className="border-b border-[color:var(--sp-line)] py-5 first:pt-0 last:border-0">
                      <div className="flex items-start gap-4">
                        <span className="sp-num text-[12px] tracking-[0.14em] text-[color:var(--sp-green)]">0{i + 1}</span>
                        <div>
                          <h3 className="text-[15px] font-semibold text-[color:var(--sp-ink)]">{t}</h3>
                          <p className="mt-1.5 text-[14px] leading-relaxed text-[color:var(--sp-text-2)]">{b}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/gdpr" className="sp-link mt-6 text-[14px]">
                  See the full GDPR & data-rights page <ArrowIcon />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 4. Infrastructure (visual left) ──────────────────── */}
      <section className="sp-section sp-bg-white border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-20 items-center">
            <Reveal>
              <div className="rounded-3xl border border-[color:var(--sp-line)] bg-[color:var(--sp-mint)] p-7 md:p-9 shadow-[var(--sp-shadow-sm)]">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sp-green)]">
                  Tenant isolation
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    { name: 'Restaurant 1 — Salt & Ember', rows: 'Menus · tables · reservations · staff' },
                    { name: 'Café 2 — Parlour', rows: 'Menus · tables · reservations · staff' },
                    { name: 'Bar 3 — Lowline', rows: 'Menus · tables · reservations · staff' },
                  ].map((t) => (
                    <div key={t.name} className="rounded-2xl border border-[color:var(--sp-line)] bg-white p-5 shadow-[var(--sp-shadow-sm)]">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-semibold text-[color:var(--sp-ink)]">{t.name}</p>
                        <Lock className="h-3.5 w-3.5 text-[color:var(--sp-green)]" strokeWidth={2} />
                      </div>
                      <p className="mt-1 text-[12.5px] text-[color:var(--sp-text-3)]">{t.rows}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-[12.5px] leading-relaxed text-[color:var(--sp-text-3)]">
                  One shared, managed infrastructure — but every request is constrained to the active
                  tenant at the data layer.
                </p>
              </div>
            </Reveal>
            <div>
              <Reveal>
                <Eyebrow>Infrastructure</Eyebrow>
                <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">
                  One platform, <em className="italic">isolated by design.</em>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="sp-body mt-6 text-[17px] leading-[1.7]">
                  Sectros runs on a single managed stack. That discipline keeps infrastructure costs
                  low and lets us patch centrally — but it only works because every data model is
                  strictly tenant-scoped in code, not just in convention.
                </p>
                <ul className="mt-6 space-y-3.5">
                  <CheckItem>Every model query is scoped to the active tenant — enforced at the model layer.</CheckItem>
                  <CheckItem>Tenant-specific data carries composite indexes so cross-table lookups stay fast.</CheckItem>
                  <CheckItem>Public routes never resolve a tenant context, so no cross-tenant leakage is possible.</CheckItem>
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Encryption (visual right) ─────────────────────── */}
      <section className="sp-section sp-bg-paper border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-20 items-center">
            <div>
              <Reveal>
                <Eyebrow>Encryption</Eyebrow>
                <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">
                  Protected <em className="italic">in motion and at rest.</em>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="sp-body mt-6 text-[17px] leading-[1.7]">
                  Data is encrypted while it travels between browsers, apps and our API. Credentials
                  and long-lived secrets are stored in a way that can never be read back in plain
                  text.
                </p>
                <ul className="mt-6 space-y-3.5">
                  <CheckItem>All traffic encrypted in transit with TLS 1.2 or newer.</CheckItem>
                  <CheckItem>Passwords stored only as one-way salted hashes.</CheckItem>
                  <CheckItem>Secrets masked in the UI and never returned in full by the API.</CheckItem>
                </ul>
              </Reveal>
            </div>
            <Reveal delay={0.12}>
              <div className="rounded-3xl border border-[color:var(--sp-line)] bg-[color:var(--sp-ink)] p-7 text-white shadow-[var(--sp-shadow-md)] md:p-10">
                <div className="flex items-center gap-3">
                  <span className="sp-icon-chip-sm bg-white/10 text-[color:var(--sp-green-300)]">
                    <KeyRound className="w-4 h-4" strokeWidth={1.8} />
                  </span>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white/60">
                    Credential handling
                  </p>
                </div>
                <div className="mt-7 space-y-3">
                  {[
                    ['In transit', 'TLS 1.2+ on every request', 'bg-white/10'],
                    ['At rest — passwords', 'One-way salted hash (bcrypt)', 'bg-white/10'],
                    ['At rest — secrets', 'Masked, never returned in full', 'bg-white/10'],
                    ['Sessions', 'Short-lived, scope-restricted tokens', 'bg-white/10'],
                  ].map(([t, v, bg]) => (
                    <div key={t} className={`flex items-center justify-between gap-4 rounded-xl ${bg} px-4 py-3.5`}>
                      <span className="text-[13.5px] text-white/70">{t}</span>
                      <span className="text-right text-[13px] font-medium text-white">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-[12px] leading-relaxed text-white/45">
                  We deliberately avoid claiming \"encrypted at rest everywhere\" until that is true
                  for every datastore.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 6. Access control (visual left) ──────────────────── */}
      <section className="sp-section sp-bg-white border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-20 items-center">
            <Reveal>
              <div className="rounded-3xl border border-[color:var(--sp-line)] bg-white p-7 shadow-[var(--sp-shadow-sm)] md:p-9">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sp-text-3)]">
                  Role-based access
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    ['Owner', 'Full control · billing · all modules'],
                    ['Manager', 'Operations · reservations · staff'],
                    ['Staff', 'Daily service · tables · orders'],
                    ['Chef', 'Kitchen queue · menu availability'],
                  ].map(([r, p]) => (
                    <div key={r} className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--sp-line)] bg-[color:var(--sp-paper)] px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Fingerprint className="h-4 w-4 text-[color:var(--sp-green)]" strokeWidth={1.8} />
                        <span className="text-[14.5px] font-semibold text-[color:var(--sp-ink)]">{r}</span>
                      </div>
                      <span className="text-[12.5px] text-[color:var(--sp-text-3)]">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <div>
              <Reveal>
                <Eyebrow>Access control</Eyebrow>
                <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">
                  The right people, <em className="italic">the right permissions.</em>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="sp-body mt-6 text-[17px] leading-[1.7]">
                  Every user belongs to a tenant and acts under a role. Sessions expire, tokens are
                  scoped, and even support impersonation is time-boxed and logged.
                </p>
                <ul className="mt-6 space-y-3.5">
                  <CheckItem>Role-based permissions across owner, manager, staff, and chef workflows.</CheckItem>
                  <CheckItem>Optional two-factor authentication to secure sign-in.</CheckItem>
                  <CheckItem>Brute-force protection via rate-limited authentication endpoints.</CheckItem>
                  <CheckItem>Impersonation tokens expire after 60 minutes and carry narrow abilities — every use is audited.</CheckItem>
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Reliability (visual right) ────────────────────── */}
      <section className="sp-section sp-bg-paper border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-20 items-center">
            <div>
              <Reveal>
                <Eyebrow>Reliability</Eyebrow>
                <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">
                  Built to survive <em className="italic">a busy service.</em>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="sp-body mt-6 text-[17px] leading-[1.7]">
                  Reliability is a security property: if the system fails mid-transaction, staff and
                  guest data must stay consistent. We design for that explicitly.
                </p>
                <ul className="mt-6 space-y-3.5">
                  <CheckItem>Transactions wrap every multi-table write — no partial records.</CheckItem>
                  <CheckItem>Aggressive connection timeouts fail fast instead of hanging under load.</CheckItem>
                  <CheckItem>Forced pagination caps how much a single request can scan.</CheckItem>
                </ul>
              </Reveal>
            </div>
            <RevealGroup className="grid sm:grid-cols-2 gap-4" stagger={0.09}>
              {RELIABILITY.map(({ icon: Icon, title, body }) => (
                <RevealItem key={title} className="rounded-2xl border border-[color:var(--sp-line)] bg-white p-6">
                  <span className="sp-icon-chip"><Icon className="w-4 h-4" strokeWidth={1.8} /></span>
                  <h3 className="mt-4 text-[15px] font-semibold text-[color:var(--sp-ink)]">{title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--sp-text-2)]">{body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ── 8. Verified metrics ──────────────────────────────── */}
      <section className="sp-section sp-bg-white border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="max-w-[640px]">
            <Reveal>
              <Eyebrow>Operational controls</Eyebrow>
              <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">
                Measurable, <em className="italic">not aspirational.</em>
              </h2>
              <p className="sp-lead mt-6">
                These are the concrete limits and headers in force on the platform today. No
                unpublished uptime promises — just the controls we can point to.
              </p>
            </Reveal>
          </div>
          <RevealGroup className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[color:var(--sp-line)] border border-[color:var(--sp-line)] rounded-2xl overflow-hidden" stagger={0.08}>
            {[
              ['6 / min', 'Login attempts throttled per IP per minute'],
              ['120 / min', 'Tenant API calls throttled per minute'],
              ['10 / min', 'Public registration requests per IP'],
              ['24 / 7', 'HMAC anti-replay window on webhooks'],
            ].map(([num, label]) => (
              <RevealItem key={label} className="bg-white p-7">
                <div className="sp-display text-[40px] leading-none text-[color:var(--sp-ink)]">{num}</div>
                <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--sp-text-2)]">{label}</p>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal delay={0.1}>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-[13.5px] text-[color:var(--sp-text-2)]">
              <span className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-[color:var(--sp-green)]" strokeWidth={1.8} /> Security headers + strict CSP applied globally</span>
              <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-[color:var(--sp-green)]" strokeWidth={1.8} /> Webhook payloads verified by signature at both gateways</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 9. Resources ─────────────────────────────────────── */}
      <section className="sp-section sp-bg-paper border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <Reveal>
            <Eyebrow>Security resources</Eyebrow>
            <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">
              Read the details, <em className="italic">or ask us directly.</em>
            </h2>
          </Reveal>
          <RevealGroup className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
            {RESOURCES.map((r) => (
              <RevealItem key={r.title}>
                <Link
                  to={r.to}
                  className="group flex h-full flex-col rounded-2xl border border-[color:var(--sp-line)] bg-white p-6 transition-all hover:border-[color:var(--sp-line-2)] hover:shadow-[var(--sp-shadow-md)]"
                >
                  <h3 className="text-[16px] font-semibold text-[color:var(--sp-ink)] group-hover:text-[color:var(--sp-green-600)]">{r.title}</h3>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[color:var(--sp-text-2)]">{r.body}</p>
                  <span className="sp-link mt-5 text-[13.5px]">Open <ArrowIcon /></span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── 10. FAQ ──────────────────────────────────────────── */}
      <section className="sp-section-lg sp-bg-white">
        <div className="sp-container max-w-[860px]">
          <Reveal>
            <Eyebrow>Security FAQ</Eyebrow>
            <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">Questions, answered.</h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-10">
              <Accordion items={FAQ} />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}