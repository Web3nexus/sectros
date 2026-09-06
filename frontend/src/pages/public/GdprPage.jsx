import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, Trash2, Download, Edit, XCircle, Lock,
  AlertTriangle, CheckCircle, Send, FileText, Scale, ChevronDown,
} from 'lucide-react';
import centralApi from '../../services/centralApi';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const RIGHTS = [
  { icon: Eye,           name: 'Right to Access',              desc: 'Request a complete copy of the personal data we hold about you.' },
  { icon: Trash2,        name: 'Right to Erasure',             desc: 'Ask us to permanently delete your personal data where no legal obligation requires us to retain it.' },
  { icon: Download,      name: 'Right to Portability',         desc: 'Receive your data in a structured, machine-readable format to transfer to another service.' },
  { icon: Edit,          name: 'Right to Rectification',       desc: 'Correct any inaccurate or incomplete personal data we hold about you.' },
  { icon: XCircle,       name: 'Right to Object',              desc: 'Object to the processing of your personal data for direct marketing or legitimate interests.' },
  { icon: Lock,          name: 'Right to Restriction',         desc: 'Restrict how we process your data while a dispute or objection is being resolved.' },
  { icon: CheckCircle,   name: 'Right to Withdraw Consent',    desc: 'Withdraw any consent you have given at any time, without affecting prior processing.' },
  { icon: AlertTriangle, name: 'Right Not to be Profiled',     desc: 'Opt out of automated decision-making or profiling that produces significant effects on you.' },
];

const ACCORDION_ITEMS = [
  {
    title: 'Account Information',
    content: 'We collect your full name, email address, venue name, and billing address when you create or manage a Sectros account. This information is necessary to provide our services and send you important platform communications.',
  },
  {
    title: 'Usage Data',
    content: 'We automatically collect data about how you interact with Sectros, including pages visited, features used, session duration, and your IP address. This data helps us improve performance and user experience.',
  },
  {
    title: 'Reservation & Guest Data',
    content: 'When you use Sectros to manage bookings, we process reservation details, guest preferences, dietary notes, and other information your guests share during the booking flow. You are the data controller for this guest data; Sectros acts as data processor.',
  },
  {
    title: 'Payment Information',
    content: 'All payment processing is handled exclusively by Stripe, a PCI-DSS Level 1 certified provider. Sectros never stores, sees, or has access to your full card numbers, CVVs, or bank account credentials.',
  },
  {
    title: 'Support Communications',
    content: 'If you contact our support team, we retain the content of your tickets, emails, and chat transcripts to resolve your issue and improve our support quality. These records are stored securely and are only accessible to authorised Sectros staff.',
  },
];

const LEGAL_BASIS = [
  {
    icon: FileText,
    title: 'Contractual Necessity',
    desc: 'Most processing is required to deliver the services set out in our Terms of Service — including account management, reservations, and billing.',
  },
  {
    icon: Scale,
    title: 'Legitimate Interests',
    desc: 'We process certain data (e.g. analytics, fraud prevention) where our legitimate business interests are balanced against your rights and expectations.',
  },
  {
    icon: CheckCircle,
    title: 'Consent',
    desc: 'For marketing communications and non-essential cookies, we rely on your freely given, specific, and informed consent — which you may withdraw at any time.',
  },
];

const RETENTION_ROWS = [
  { type: 'Account Data',       period: 'Active account + 90 days post-deletion',     basis: 'Contractual Necessity' },
  { type: 'Financial Records',  period: '7 years',                                     basis: 'Legal Obligation (HMRC)' },
  { type: 'Audit Logs',         period: '2 years',                                     basis: 'Legitimate Interests' },
  { type: 'Support Tickets',    period: '3 years',                                     basis: 'Legitimate Interests' },
  { type: 'Purged Data',        period: '30-day grace period, then permanent deletion', basis: 'Erasure Request' },
];

const REQUEST_TYPES = [
  'Data Access',
  'Erasure Request',
  'Data Portability',
  'Rectification',
  'Other',
];

function AccordionItem({ title, content }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-800">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="text-slate-400 shrink-0 ml-3"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 pt-1 text-slate-600 leading-relaxed text-sm">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GdprPage() {
  const [formData, setFormData] = useState({ name: '', email: '', type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.type || !formData.message) {
      setError('Please fill in all fields before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await centralApi.post('public/support-tickets', {
        name: formData.name,
        email: formData.email,
        subject: `GDPR Request: ${formData.type}`,
        message: formData.message,
      });
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again or email dpo@sectros.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-6">
              <span>GDPR Compliant</span>
              <span>&#x1F1EA;&#x1F1FA;</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white mb-5">
              Your Data, Your Rights
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We are committed to full GDPR compliance and protecting every person&apos;s right to
              data privacy. This page explains your rights, the data we collect, and how to
              exercise control over your personal information.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* 8 Rights Grid */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 text-center">Your GDPR Rights</h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            Under the UK &amp; EU General Data Protection Regulation you have eight fundamental rights
            regarding your personal data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RIGHTS.map(({ icon: Icon, name, desc }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                  <Icon size={20} />
                </span>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Data We Collect Accordion */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.08 }}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Data We Collect</h2>
          <p className="text-slate-500 mb-8 max-w-2xl">
            We collect only the data necessary to provide and improve the Sectros platform. Here&apos;s
            exactly what that means in practice.
          </p>
          <div className="space-y-3">
            {ACCORDION_ITEMS.map((item) => (
              <AccordionItem key={item.title} title={item.title} content={item.content} />
            ))}
          </div>
        </motion.section>

        {/* Legal Basis */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Legal Basis for Processing</h2>
          <p className="text-slate-500 mb-8 max-w-2xl">
            GDPR requires us to have a lawful basis for every type of processing. We rely on three bases:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LEGAL_BASIS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 text-violet-600 mb-4">
                  <Icon size={20} />
                </span>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Data Retention Table */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.12 }}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Data Retention</h2>
          <p className="text-slate-500 mb-8 max-w-2xl">
            We do not hold your data longer than necessary. The table below outlines our retention
            periods for each category of data we process.
          </p>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left px-5 py-3 font-semibold">Data Type</th>
                  <th className="text-left px-5 py-3 font-semibold">Retention Period</th>
                  <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Legal Basis</th>
                </tr>
              </thead>
              <tbody>
                {RETENTION_ROWS.map((row, i) => (
                  <tr key={row.type} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-5 py-3 font-medium text-slate-800">{row.type}</td>
                    <td className="px-5 py-3 text-slate-600">{row.period}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{row.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* DPO Contact Box */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.14 }}>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8">
            <div className="flex items-start gap-5">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shrink-0">
                <Shield size={22} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Data Protection Officer</h2>
                <p className="text-slate-500 text-sm mb-5 max-w-lg">
                  Our Data Protection Officer oversees all GDPR compliance activities. You can contact
                  them directly for any privacy-related concerns, complaints, or to exercise your rights.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-medium w-16 shrink-0 text-slate-400">Email</span>
                    <a href="mailto:dpo@sectros.com" className="text-indigo-600 font-semibold hover:underline">
                      dpo@sectros.com
                    </a>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <span className="font-medium w-16 shrink-0 text-slate-400">Address</span>
                    <address className="not-italic leading-relaxed">
                      Sectros Ltd., 1 Tech Plaza, Shoreditch<br />
                      London EC2A 4NE, United Kingdom
                    </address>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* GDPR Request Form */}
        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.16 }}>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Submit a GDPR Request</h2>
          <p className="text-slate-500 mb-8 max-w-2xl">
            Use the form below to exercise any of your data rights. We will acknowledge your request
            within 72 hours and respond in full within 30 days, as required by GDPR.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 flex flex-col items-center text-center gap-4"
            >
              <CheckCircle size={48} className="text-emerald-500" />
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Request Received</h3>
                <p className="text-slate-600 max-w-md">
                  Thank you — we have received your GDPR request and will get back to you within
                  72 hours. Check your inbox for a confirmation email.
                </p>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-white border border-slate-200 p-8 space-y-5 shadow-sm"
              noValidate
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="gdpr-name">
                    Full Name
                  </label>
                  <input
                    id="gdpr-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="gdpr-email">
                    Email Address
                  </label>
                  <input
                    id="gdpr-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="gdpr-type">
                  Request Type
                </label>
                <select
                  id="gdpr-type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                >
                  <option value="" disabled>Select a request type…</option>
                  {REQUEST_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="gdpr-message">
                  Message
                </label>
                <textarea
                  id="gdpr-message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your request in as much detail as possible so we can process it efficiently…"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting&hellip;
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          )}
        </motion.section>

      </div>
    </div>
  );
}
