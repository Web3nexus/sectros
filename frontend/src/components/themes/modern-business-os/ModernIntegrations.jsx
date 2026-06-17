import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {CreditCard, Smartphone, MessageSquare, TrendingUp, BarChart3, Calendar, ClipboardList, Cpu, Zap, Globe, Shield, Database, Code2, ChevronDown, ArrowRight, Linkedin, Twitter, Github, ExternalLink, Search, Plus, CheckCircle2, Briefcase} from 'lucide-react';
import { useCmsContent } from '../../../hooks/useCmsContent';

const categories = [
  { icon: CreditCard, name: 'Payments', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Smartphone, name: 'POS', color: 'bg-blue-50 text-blue-600' },
  { icon: MessageSquare, name: 'Communication', color: 'bg-purple-50 text-purple-600' },
  { icon: TrendingUp, name: 'Marketing', color: 'bg-orange-50 text-orange-600' },
  { icon: BarChart3, name: 'Analytics', color: 'bg-rose-50 text-rose-600' },
  { icon: Calendar, name: 'Calendar', color: 'bg-cyan-50 text-cyan-600' },
  { icon: ClipboardList, name: 'Accounting', color: 'bg-amber-50 text-amber-600' },
  { icon: Zap, name: 'Automation', color: 'bg-indigo-50 text-indigo-600' },
];

const featuredIntegrations = [
  {
    name: 'Stripe',
    tagline: 'Payment processing',
    description: 'Accept payments, manage subscriptions, and process refunds seamlessly.',
    category: 'Payments',
  },
  {
    name: 'Square',
    tagline: 'POS & payments',
    description: 'Sync orders, payments, and customer data in real time.',
    category: 'POS',
  },
  {
    name: 'Toast',
    tagline: 'Restaurant POS',
    description: 'Deep integration with Toast POS for menu, orders, and payments.',
    category: 'POS',
  },
  {
    name: 'Google',
    tagline: 'Calendar & ads',
    description: 'Sync bookings to Google Calendar and run targeted ad campaigns.',
    category: 'Calendar',
  },
  {
    name: 'WhatsApp',
    tagline: 'Messaging',
    description: 'Send booking confirmations, reminders, and promotions via WhatsApp.',
    category: 'Communication',
  },
  {
    name: 'Zapier',
    tagline: 'Automation',
    description: 'Connect Sectros with 3,000+ apps through automated workflows.',
    category: 'Automation',
  },
];

const ecosystemIcons = [
  CreditCard, Globe, MessageSquare, TrendingUp, BarChart3, Calendar,
  Smartphone, Shield, Database, Search, Linkedin, Twitter, Github,
  ExternalLink, Cpu, Zap, ClipboardList, Plus, CheckCircle2, Briefcase,
  ArrowRight, Globe, CreditCard, MessageSquare,
];

const faqs = [
  {
    q: 'How do I connect an integration?',
    a: 'Navigate to Settings > Integrations in your dashboard, find the integration you want, and click Connect. Most integrations use OAuth for a secure one-click setup.',
  },
  {
    q: 'Are there additional costs for integrations?',
    a: 'All integrations included in your plan are free of additional charges. Some premium or custom integrations may require an enterprise plan.',
  },
  {
    q: 'Can I request a custom integration?',
    a: 'Yes. Enterprise customers can request custom integrations. Our API team will work with you to build and test the connection.',
  },
  {
    q: 'Do you offer a public API?',
    a: 'Yes. Our RESTful API allows you to build custom integrations. Full documentation is available in our developer portal.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ModernIntegrations() {
  const { get } = useCmsContent('integrations');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-6 py-24 text-white sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {get('hero.heading')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
            {get('hero.paragraph')}
          </p>
        </motion.div>
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-400/20 blur-3xl" />
      </section>

      <section className="px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{get('ecosystem.heading')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            {get('ecosystem.paragraph')}
          </p>
          <div className="relative mx-auto mt-16 flex items-center justify-center">
            <div className="relative flex h-[340px] w-[340px] items-center justify-center sm:h-[400px] sm:w-[400px]">
              {ecosystemIcons.map((IconEl, i) => {
                const angle = (i / ecosystemIcons.length) * Math.PI * 2;
                const radius = 150;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                  <motion.div
                    key={i}
                    className="absolute flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm"
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    whileHover={{ scale: 1.15, borderColor: '#2563eb' }}
                  >
                    <IconEl size={18} className="text-gray-500" />
                  </motion.div>
                );
              })}
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-xl font-bold text-white shadow-lg">
                R
              </div>
            </div>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8"
          >
            {categories.map((c) => {
              const IconEl = c.icon;
              return (
                <motion.div
                  key={c.name}
                  variants={itemVariants}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 p-4 text-center transition-shadow hover:shadow-sm"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`}>
                    <IconEl size={20} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{c.name}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-gray-50 px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">{get('featured.heading')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">
            {get('featured.paragraph')}
          </p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featuredIntegrations.map((int) => (
              <motion.div
                key={int.name}
                variants={itemVariants}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-700">
                  {int.name.slice(0, 2)}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{int.name}</h3>
                <p className="text-sm text-gray-500">{int.tagline}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{int.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    {int.category}
                  </span>
                  <Link
                    to={`/integrations/${int.name.toLowerCase()}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition-all group-hover:opacity-100"
                  >
                    Learn more <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">{get('api.heading')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">
            {get('api.paragraph')}
          </p>
          <div className="mt-12 overflow-hidden rounded-2xl bg-gray-900 shadow-xl">
            <div className="flex items-center gap-2 border-b border-gray-700 px-5 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-gray-400">POST /api/reservations</span>
            </div>
            <div className="overflow-x-auto p-5 text-sm leading-relaxed text-green-400">
              <pre className="font-mono">
{`{
  "venue_id": "ven_abc123",
  "guest": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1-555-0123"
  },
  "party_size": 4,
  "time": "2025-08-15T19:00:00Z",
  "notes": "Anniversary dinner"
}`}
              </pre>
            </div>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 p-6">
              <Code2 size={24} className="text-blue-600" />
              <h3 className="mt-3 text-lg font-bold text-gray-900">RESTful API</h3>
              <p className="mt-2 text-sm text-gray-500">
                Full CRUD access to reservations, guests, venues, and reporting data.
                Rate-limited with API key authentication.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-6">
              <Zap size={24} className="text-blue-600" />
              <h3 className="mt-3 text-lg font-bold text-gray-900">Webhooks</h3>
              <p className="mt-2 text-sm text-gray-500">
                Receive real-time notifications for bookings, cancellations, check-ins,
                and payment events delivered to your endpoint.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/developers"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
            >
              <ExternalLink size={18} />
              {get('api.button')}
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center text-white"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{get('request.heading')}</h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            {get('request.paragraph')}
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
          >
            {get('request.button')} <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      <section className="px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl"
        >
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            {get('faq.heading')}
          </h2>
          <div className="mt-12 space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gray-100">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="faq-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 px-6 py-4 text-sm leading-relaxed text-gray-600">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
