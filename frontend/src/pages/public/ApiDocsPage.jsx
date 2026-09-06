import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  Terminal,
  Key,
  Zap,
  ArrowRight,
  Copy,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Users,
  CalendarDays,
  UserCog,
  UtensilsCrossed,
  Webhook,
  Gauge,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const SECTIONS = [
  { id: 'authentication', label: 'Authentication', icon: Key },
  { id: 'reservations', label: 'Reservations', icon: CalendarDays },
  { id: 'guests', label: 'Guests', icon: Users },
  { id: 'staff', label: 'Staff', icon: UserCog },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'rate-limits', label: 'Rate Limits', icon: Gauge },
];

const METHOD_STYLES = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
  DELETE: 'bg-red-100 text-red-700',
  PATCH: 'bg-amber-100 text-amber-700',
};

function MethodBadge({ method }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold font-mono uppercase tracking-wide ${METHOD_STYLES[method]}`}
    >
      {method}
    </span>
  );
}

function EndpointRow({ method, path, description }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <MethodBadge method={method} />
        <code className="text-sm font-mono text-slate-800 truncate">{path}</code>
      </div>
      <p className="text-sm text-slate-500 sm:text-right">{description}</p>
    </div>
  );
}

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-4 group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200"
        title="Copy code"
      >
        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

function SectionCard({ id, icon: Icon, title, children }) {
  return (
    <motion.div
      id={id}
      className="border border-slate-200 rounded-2xl p-6 mb-6 bg-white shadow-sm scroll-mt-8"
      {...fadeUp}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState('authentication');

  const handleSidebarClick = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300 tracking-wide uppercase">
                <Code2 className="w-3.5 h-3.5" />
                v1.0 · REST · JSON
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Sectros Developer API
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mb-8 leading-relaxed">
              A complete API to manage reservations, guests, staff, menus and webhooks
              programmatically. All endpoints require Bearer token authentication.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors px-6 py-3 font-semibold text-white"
            >
              Get API Key <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2-column layout */}
      <div className="max-w-6xl mx-auto flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0 border-r border-slate-200 bg-white">
          <nav className="sticky top-0 pt-8 pb-6 px-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 px-2">
              Sections
            </p>
            <ul className="space-y-0.5">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => handleSidebarClick(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                      activeSection === id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 px-6 lg:px-10 py-10 bg-slate-50 min-w-0">

          {/* Authentication */}
          <SectionCard id="authentication" icon={Key} title="Authentication">
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Sectros uses OAuth 2.0 client credentials to issue short-lived Bearer tokens. Include
              the token in every request as{' '}
              <code className="bg-slate-100 rounded px-1 py-0.5 text-xs font-mono">
                Authorization: Bearer &lt;token&gt;
              </code>
              . Tokens expire after <strong>3600 seconds</strong>.
            </p>
            <EndpointRow
              method="POST"
              path="/oauth/token"
              description="Exchange client credentials for an access token"
            />
            <CodeBlock
              code={`curl -X POST https://api.sectros.com/oauth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type": "client_credentials",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
  }'

# Response
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}`}
            />
          </SectionCard>

          {/* Reservations */}
          <SectionCard id="reservations" icon={CalendarDays} title="Reservations">
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Manage the full lifecycle of dining reservations — create, read, update and cancel.
              All timestamps are ISO 8601 UTC.
            </p>
            <EndpointRow method="GET"    path="/reservations"        description="List all reservations (paginated)" />
            <EndpointRow method="POST"   path="/reservations"        description="Create a new reservation" />
            <EndpointRow method="GET"    path="/reservations/{id}"   description="Retrieve a single reservation" />
            <EndpointRow method="PATCH"  path="/reservations/{id}"   description="Update reservation details or status" />
            <EndpointRow method="DELETE" path="/reservations/{id}"   description="Cancel and remove a reservation" />
            <CodeBlock
              code={`# POST /reservations — create a reservation
curl -X POST https://api.sectros.com/reservations \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "guest_id": "gst_01HXY4K2Z",
    "party_size": 4,
    "table_id": "tbl_08",
    "starts_at": "2026-09-15T19:30:00Z",
    "duration_minutes": 90,
    "notes": "Anniversary dinner, window table preferred"
  }'

# 201 Created
{
  "id": "rsv_03GHJ2MN",
  "status": "confirmed",
  "guest": { "id": "gst_01HXY4K2Z", "name": "Sarah Chen" },
  "table_id": "tbl_08",
  "starts_at": "2026-09-15T19:30:00Z",
  "ends_at": "2026-09-15T21:00:00Z",
  "created_at": "2026-09-06T08:54:44Z"
}`}
            />
          </SectionCard>

          {/* Guests */}
          <SectionCard id="guests" icon={Users} title="Guests">
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Access and manage your guest CRM. Guest profiles store visit history, dietary
              preferences, and spend data.
            </p>
            <EndpointRow method="GET"  path="/guests"       description="List all guests, supports search & filters" />
            <EndpointRow method="POST" path="/guests"       description="Create a new guest profile" />
            <EndpointRow method="GET"  path="/guests/{id}"  description="Retrieve a guest with full history" />
          </SectionCard>

          {/* Staff */}
          <SectionCard id="staff" icon={UserCog} title="Staff">
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Query staff records, retrieve shift schedules, and record clock-in events from
              external hardware or kiosk integrations.
            </p>
            <EndpointRow method="GET"  path="/staff"                  description="List all active staff members" />
            <EndpointRow method="GET"  path="/staff/{id}/shifts"      description="Get scheduled shifts for a staff member" />
            <EndpointRow method="POST" path="/staff/{id}/clock-in"    description="Record a clock-in event for a staff member" />
          </SectionCard>

          {/* Menu */}
          <SectionCard id="menu" icon={UtensilsCrossed} title="Menu">
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Read and manage your digital menu. Categories and items support multi-language
              names, allergen flags, and availability windows.
            </p>
            <EndpointRow method="GET"  path="/menu/categories"  description="List all menu categories" />
            <EndpointRow method="GET"  path="/menu/items"       description="List all menu items across categories" />
            <EndpointRow method="POST" path="/menu/items"       description="Create a new menu item" />
          </SectionCard>

          {/* Webhooks */}
          <SectionCard id="webhooks" icon={Webhook} title="Webhooks">
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Subscribe to real-time events. Sectros sends a signed HTTP POST to your endpoint
              whenever a subscribed event fires. Payloads are signed with HMAC-SHA256 and
              verified via the{' '}
              <code className="bg-slate-100 rounded px-1 py-0.5 text-xs font-mono">
                X-Sectros-Signature
              </code>{' '}
              header.
            </p>
            <EndpointRow method="POST"   path="/webhooks"        description="Register a new webhook endpoint" />
            <EndpointRow method="GET"    path="/webhooks"        description="List all registered webhooks" />
            <EndpointRow method="DELETE" path="/webhooks/{id}"   description="Unregister a webhook" />
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <strong>Available events:</strong>{' '}
              <code className="font-mono text-xs">reservation.created</code>,{' '}
              <code className="font-mono text-xs">reservation.cancelled</code>,{' '}
              <code className="font-mono text-xs">guest.created</code>,{' '}
              <code className="font-mono text-xs">payment.completed</code>
            </div>
          </SectionCard>

          {/* Rate Limits */}
          <SectionCard id="rate-limits" icon={Gauge} title="Rate Limits">
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              All API endpoints are rate-limited per access token. Exceeding the limit returns a{' '}
              <code className="bg-slate-100 rounded px-1 py-0.5 text-xs font-mono">
                429 Too Many Requests
              </code>{' '}
              response. The following headers are included on every response to help you track
              consumption:
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 divide-y divide-slate-200 text-sm">
              {[
                { label: 'Limit', header: 'X-RateLimit-Limit', value: '120 requests / minute' },
                { label: 'Remaining', header: 'X-RateLimit-Remaining', value: 'Requests left in current window' },
                { label: 'Reset', header: 'X-RateLimit-Reset', value: 'Unix timestamp when window resets' },
                { label: 'Retry after 429', header: 'Retry-After', value: 'Seconds until next allowed request' },
              ].map(({ label, header, value }) => (
                <div key={header} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-medium text-slate-800">{label}</span>
                    <code className="ml-2 text-xs font-mono text-slate-500">{header}</code>
                  </div>
                  <span className="text-slate-500 text-right">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Enterprise plans may request elevated rate limits — contact{' '}
              <a href="mailto:dev@sectros.com" className="text-indigo-600 hover:underline font-medium">
                dev@sectros.com
              </a>
              .
            </p>
          </SectionCard>

          {/* Bottom CTA */}
          <motion.div
            className="mt-4 mb-10 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
            {...fadeUp}
            transition={{ duration: 0.4 }}
          >
            <Terminal className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Developer Support</h3>
            <p className="text-slate-500 text-sm mb-4">
              Stuck on an integration? Our developer team is here to help.
            </p>
            <a
              href="mailto:dev@sectros.com"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors px-6 py-3 font-semibold text-white text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              dev@sectros.com
            </a>
          </motion.div>

        </main>
      </div>
    </div>
  );
}
