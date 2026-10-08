import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Trash2, Download, Edit, XCircle, Lock, AlertTriangle, CheckCircle, Send } from 'lucide-react';
import centralApi from '../../services/centralApi';
import { Reveal, Eyebrow, ArrowIcon, Accordion as PremiumAccordion } from '../../components/themes/sectros-premium/primitives';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const RIGHTS = [
  { num: '01', icon: Eye, name: 'Access', desc: 'Request a complete copy of the personal data we hold about you.' },
  { num: '02', icon: Trash2, name: 'Erasure', desc: 'Ask us to permanently delete your personal data where no legal obligation requires us to retain it.' },
  { num: '03', icon: Download, name: 'Portability', desc: 'Receive your data in a structured, machine-readable format to transfer to another service.' },
  { num: '04', icon: Edit, name: 'Rectification', desc: 'Correct any inaccurate or incomplete personal data we hold about you.' },
  { num: '05', icon: XCircle, name: 'Objection', desc: 'Object to the processing of your personal data for direct marketing or legitimate interests.' },
  { num: '06', icon: Lock, name: 'Restriction', desc: 'Restrict how we process your data while a dispute or objection is being resolved.' },
  { num: '07', icon: CheckCircle, name: 'Withdrawal of consent', desc: 'Withdraw any consent you have given at any time, without affecting prior processing.' },
  { num: '08', icon: AlertTriangle, name: 'Automated decision-making', desc: 'Opt out of automated decision-making or profiling that produces significant effects on you.' },
];

const ACCORDION_ITEMS = [
  { q: 'Account Information', a: 'We collect your full name, email address, venue name, and billing address when you create or manage a Sectros account. This information is necessary to provide our services and send you important platform communications.' },
  { q: 'Usage Data', a: 'We automatically collect data about how you interact with Sectros, including pages visited, features used, session duration, and your IP address. This data helps us improve performance and user experience.' },
  { q: 'Reservation & Guest Data', a: 'When you use Sectros to manage bookings, we process reservation details, guest preferences, dietary notes, and other information your guests share during the booking flow. You are the data controller for this guest data; Sectros acts as data processor.' },
  { q: 'Payment Information', a: 'All payment processing is handled exclusively by our payment providers (including Paddle as our Merchant of Record). Sectros never stores, sees, or has access to your full card numbers, CVVs, or bank account credentials.' },
  { q: 'Support Communications', a: 'If you contact our support team, we retain the content of your tickets, emails, and chat transcripts to resolve your issue and improve our support quality. These records are stored securely and are only accessible to authorised Sectros staff.' },
];

const LEGAL_BASIS = [
  { title: 'Contractual Necessity', desc: 'Most processing is required to deliver the services set out in our Terms of Service — including account management, reservations, and billing.' },
  { title: 'Legitimate Interests', desc: 'We process certain data (e.g. analytics, fraud prevention) where our legitimate business interests are balanced against your rights and expectations.' },
  { title: 'Consent', desc: 'For marketing communications and non-essential cookies, we rely on your freely given, specific, and informed consent — which you may withdraw at any time.' },
];

const RETENTION_ROWS = [
  { type: 'Account Data', period: 'Active account + 90 days post-deletion', basis: 'Contractual Necessity' },
  { type: 'Financial Records', period: '7 years', basis: 'Legal Obligation (HMRC)' },
  { type: 'Audit Logs', period: '2 years', basis: 'Legitimate Interests' },
  { type: 'Support Tickets', period: '3 years', basis: 'Legitimate Interests' },
  { type: 'Purged Data', period: '30-day grace period, then permanent deletion', basis: 'Erasure Request' },
];

const REQUEST_TYPES = ['Data Access', 'Erasure Request', 'Data Portability', 'Rectification', 'Other'];

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
    setError('');
    try {
      await centralApi.post('/public/gdpr-requests', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', type: '', message: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit your request. Please try again or email privacy@sectros.com.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sp-root bg-[color:var(--sp-paper)]">
      <section className="relative overflow-hidden border-b border-[color:var(--sp-line)]">
        <div className="sp-hero-bg" />
        <div className="sp-container relative pt-20 pb-14 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20">
          <Reveal y={12} duration={0.6}>
            <Eyebrow>GDPR &amp; Data Rights</Eyebrow>
          </Reveal>
          <Reveal y={22} delay={0.08} duration={0.8}>
            <h1 className="sp-display sp-h1 mt-6 max-w-[14ch] text-[color:var(--sp-ink)]">
              Your data. <em>Your rights.</em>
            </h1>
          </Reveal>
          <Reveal y={18} delay={0.16} duration={0.8}>
            <p className="sp-lead mt-7 max-w-[560px]">
              Under the UK &amp; EU General Data Protection Regulation, you have a set of clear rights
              over the personal data we process. Below is a plain-language summary of those rights,
              how we use your data, and how to exercise them.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="sp-section sp-bg-white border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <Reveal className="max-w-[640px]">
            <h2 className="sp-display sp-h2 text-[color:var(--sp-ink)]">Your rights</h2>
            <p className="sp-body mt-4">
              You have eight fundamental rights regarding your personal data. Each card below explains
              what it means and when it applies.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {RIGHTS.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[20px] border border-[color:var(--sp-line)] bg-white p-6 shadow-[var(--sp-shadow-sm)]"
              >
                <div className="flex items-center gap-3">
                  <span className="sp-num text-[12px] tracking-[0.14em] text-[color:var(--sp-green)]">{r.num}</span>
                  <span className="sp-icon-chip">
                    <r.icon className="w-4 h-4" strokeWidth={1.8} />
                  </span>
                </div>
                <h3 className="mt-4 text-[16px] font-semibold text-[color:var(--sp-ink)]">{r.name}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--sp-text-2)]">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section sp-bg-paper border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <Reveal className="max-w-[720px]">
            <h2 className="sp-display sp-h2 text-[color:var(--sp-ink)]">Data We Collect</h2>
            <p className="sp-body mt-4">
              We collect only the data necessary to provide and improve the Sectros platform. These
              are the categories we rely on:
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8">
            <div className="rounded-[20px] border border-[color:var(--sp-line)] bg-white shadow-[var(--sp-shadow-sm)]">
              <PremiumAccordion items={ACCORDION_ITEMS.map((x) => ({ q: x.q, a: x.a }))} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sp-section sp-bg-white border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <Reveal className="max-w-[720px]">
            <h2 className="sp-display sp-h2 text-[color:var(--sp-ink)]">Legal Basis for Processing</h2>
            <p className="sp-body mt-4">We rely on three lawful bases under GDPR:</p>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {LEGAL_BASIS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[20px] border border-[color:var(--sp-line)] bg-white p-6 shadow-[var(--sp-shadow-sm)]"
              >
                <span className="sp-num text-[12px] tracking-[0.14em] text-[color:var(--sp-green)]">0{i + 1}</span>
                <h3 className="mt-3 text-[16px] font-semibold text-[color:var(--sp-ink)]">{b.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--sp-text-2)]">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section sp-bg-paper border-b border-[color:var(--sp-line)]">
        <div className="sp-container">
          <Reveal className="max-w-[720px]">
            <h2 className="sp-display sp-h2 text-[color:var(--sp-ink)]">Data Retention</h2>
            <p className="sp-body mt-4">
              We do not hold your data longer than necessary. The table below outlines our retention approach:
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 overflow-x-auto">
            <div className="min-w-[720px] rounded-[20px] border border-[color:var(--sp-line)] bg-white shadow-[var(--sp-shadow-sm)]">
              <div className="grid grid-cols-[1.2fr_1.4fr_1fr] gap-x-8 border-b border-[color:var(--sp-line)] bg-[color:var(--sp-mint)] px-8 py-4 text-[13px] font-semibold text-[color:var(--sp-ink)]">
                <div>Data Type</div>
                <div>Retention Period</div>
                <div>Legal Basis</div>
              </div>
              {RETENTION_ROWS.map((r) => (
                <div key={r.type} className="grid grid-cols-[1.2fr_1.4fr_1fr] gap-x-8 border-b border-[color:var(--sp-line)] px-8 py-4 last:border-b-0">
                  <div className="text-[14.5px] text-[color:var(--sp-ink)]">{r.type}</div>
                  <div className="text-[14px] text-[color:var(--sp-text-2)]">{r.period}</div>
                  <div className="text-[14px] text-[color:var(--sp-text-2)]">{r.basis}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sp-section-lg sp-bg-white">
        <div className="sp-container max-w-[760px]">
          <Reveal>
            <Eyebrow>GDPR Request Form</Eyebrow>
            <h2 className="sp-display sp-h2 mt-5 text-[color:var(--sp-ink)]">Submit a data rights request</h2>
            <p className="sp-body mt-4">
              Tell us your details and the right you&apos;d like to exercise. We&apos;ll acknowledge your
              request and respond within the statutory timeframes.
            </p>
          </Reveal>
          <Reveal delay={0.12} className="mt-8">
            <div className="rounded-[24px] border border-[color:var(--sp-line)] bg-white p-6 shadow-[var(--sp-shadow-md)] sm:p-8">
              {submitted ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
                  <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--sp-mint)]">
                    <CheckCircle className="w-6 h-6 text-[color:var(--sp-green)]" strokeWidth={2} />
                  </div>
                  <h3 className="text-[18px] font-semibold text-[color:var(--sp-ink)]">Request submitted</h3>
                  <p className="mt-2 text-[14px] text-[color:var(--sp-text-2)]">
                    We&apos;ve received your GDPR request. A member of our team will respond as soon as possible.
                  </p>
                  <button type="button" onClick={() => setSubmitted(false)} className="sp-btn sp-btn-secondary mt-6">
                    Submit another request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-[14px] font-medium text-[color:var(--sp-ink)]">Full name</label>
                      <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="sp-input-light w-full" />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-[14px] font-medium text-[color:var(--sp-ink)]">Email address</label>
                      <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="sp-input-light w-full" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="type" className="mb-2 block text-[14px] font-medium text-[color:var(--sp-ink)]">Request type</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} required className="sp-input-light w-full appearance-none">
                      <option value="">Select a request type</option>
                      {REQUEST_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-2 block text-[14px] font-medium text-[color:var(--sp-ink)]">Details of your request</label>
                    <textarea id="message" name="message" rows={6} value={formData.message} onChange={handleChange} required className="sp-input-light w-full min-h-[150px] resize-y" placeholder="Please describe your request in as much detail as possible so we can process it efficiently…" />
                  </div>
                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-[13.5px] text-rose-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                      <span>{error}</span>
                    </div>
                  )}
                  <button type="submit" disabled={submitting} className="sp-btn sp-btn-primary sp-btn-lg self-start">
                    {submitting ? 'Submitting…' : <>Submit Request <ArrowIcon /></>}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}