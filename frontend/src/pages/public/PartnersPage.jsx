import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Handshake, Puzzle, Globe, ArrowRight, CheckCircle2, Send, DollarSign, Star, Users, Check, AlertCircle, Loader2 } from 'lucide-react';
import centralApi from '../../services/centralApi';

const partnerTiers = [
  {
    id: 'referral',
    name: 'Referral Partner',
    icon: Handshake,
    badge: 'Agencies & Consultants',
    headline: 'Earn 20% recurring monthly revenue',
    description: 'Perfect for hospitality agencies, food consultants, and POS resellers recommending Sectros to their clients.',
    featured: false,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    benefits: [
      '20% recurring revenue share for 24 months',
      'Real-time partner referral tracking dashboard',
      'Co-branded pitch decks & demo sandbox access',
      'Dedicated Partner Account Executive',
      'Quarterly partner newsletter with early feature releases',
    ],
    cta: 'Apply as Referral Partner',
  },
  {
    id: 'integration',
    name: 'Integration Partner',
    icon: Puzzle,
    badge: 'ISVs & Technology Providers',
    headline: 'Build certified tools on Sectros API',
    description: 'For POS systems, PMS providers, accounting engines, and CRM platforms integrating natively with Sectros.',
    featured: true,
    color: 'text-violet-600 bg-violet-50 border-violet-100',
    benefits: [
      'Listing on the official Sectros Integrations Marketplace',
      'High-throughput developer API sandbox & webhooks',
      'Joint GTM co-marketing and webinars',
      'Direct Slack channel with core engineering',
      'Certified Partner badge and trust seal',
    ],
    cta: 'Build an Integration',
  },
  {
    id: 'whitelabel',
    name: 'White-Label Partner',
    icon: Globe,
    badge: 'Enterprise Franchises & Groups',
    headline: 'Deliver Sectros under your own brand',
    description: 'Provide an end-to-end hospitality OS to your restaurant network under your domain, logo, and brand guidelines.',
    featured: false,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    benefits: [
      'Custom domain & custom brand styling',
      'Master central control panel for hundreds of outlets',
      'Isolated tenant data & custom role matrices',
      '99.99% Enterprise uptime SLA commitment',
      'Tailored custom pricing & volume invoicing',
    ],
    cta: 'Talk to Enterprise Team',
  },
];

const steps = [
  {
    num: '01',
    title: 'Submit Application',
    desc: 'Fill in the short partnership questionnaire below with your business details and model.',
  },
  {
    num: '02',
    title: 'Partner Onboarding Call',
    desc: 'Our alliances director schedules a 30-minute discovery session to align on incentives and roadmap.',
  },
  {
    num: '03',
    title: 'Access Sandbox & Earn',
    desc: 'Receive sandbox API keys, referral tracking URLs, and co-marketing collateral to launch.',
  },
];

export default function PartnersPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    website: '',
    partnerType: 'Referral Partner',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      await centralApi.post('public/support-tickets', {
        name: formData.name,
        email: formData.email,
        subject: `Partner Application: ${formData.partnerType} (${formData.company})`,
        message: `Company: ${formData.company}\nWebsite: ${formData.website || 'N/A'}\nPartner Type: ${formData.partnerType}\n\nMessage:\n${formData.message}`,
      });
      setStatus('success');
      setFormData({
        name: '',
        company: '',
        email: '',
        website: '',
        partnerType: 'Referral Partner',
        message: '',
      });
    } catch (err) {
      console.error('Partner application error:', err);
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to submit application. Please try again or email partners@sectros.com.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-6 border border-indigo-500/30">
              <Handshake className="w-3.5 h-3.5" />
              Sectros Partner Program
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Grow Your Business Alongside Sectros
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Whether you are an agency referring dining clients, a POS software provider integrating APIs, or a group seeking white-label technology, we have a partnership model built for you.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#apply-form"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 transition-all text-center"
              >
                Apply for Partnership
              </a>
              <Link
                to="/integrations"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 text-slate-200 font-semibold hover:bg-slate-800 transition-all text-center"
              >
                Browse Integrations
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partner Tiers */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Three Flexible Tracks</h2>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Choose the Track That Matches Your Model
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {partnerTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`rounded-3xl border p-8 md:p-10 flex flex-col transition-all duration-300 ${
                  tier.featured
                    ? 'bg-slate-900 text-white border-indigo-500 ring-2 ring-indigo-500 shadow-xl scale-[1.02] relative'
                    : 'bg-white text-slate-900 border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow">
                    Most Popular Track
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tier.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    tier.featured ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tier.badge}
                  </span>
                </div>

                <h4 className="text-2xl font-bold mb-2">{tier.name}</h4>
                <div className={`text-sm font-semibold mb-3 ${tier.featured ? 'text-indigo-300' : 'text-indigo-600'}`}>
                  {tier.headline}
                </div>
                <p className={`text-sm leading-relaxed mb-8 ${tier.featured ? 'text-slate-400' : 'text-slate-600'}`}>
                  {tier.description}
                </p>

                <div className="space-y-3 mb-10 flex-1">
                  {tier.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-3 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.featured ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <span className={tier.featured ? 'text-slate-300' : 'text-slate-700'}>{b}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="#apply-form"
                  onClick={() => setFormData(prev => ({ ...prev, partnerType: tier.name }))}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm text-center transition-all ${
                    tier.featured
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-md'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl font-bold text-slate-900">How the Partnership Works</h3>
            <p className="text-slate-500 text-sm md:text-base mt-2">Get up and running in days, not months.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative">
                <div className="text-3xl font-black text-indigo-600/30 mb-3 font-mono">
                  {s.num}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="py-20 md:py-28 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-lg">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Get in Touch</span>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">Apply for the Partner Program</h3>
            <p className="text-sm text-slate-500 mt-2">We review all applications within 1-2 business days.</p>
          </div>

          {status === 'success' ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-emerald-900 mb-1">Application Received!</h4>
              <p className="text-sm text-emerald-700 max-w-md mx-auto mb-6">
                Thank you for your interest in partnering with Sectros. Our partnership team will review your application and follow up via email shortly.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status === 'error' && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Hospitality Labs"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Partner Track of Interest *
                </label>
                <select
                  value={formData.partnerType}
                  onChange={(e) => setFormData({ ...formData, partnerType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Referral Partner">Referral Partner (20% revenue share)</option>
                  <option value="Integration Partner">Integration Partner (Marketplace & API)</option>
                  <option value="White-Label Partner">White-Label Partner (Franchise & Custom Domain)</option>
                  <option value="Other / Multiple">Other / Custom Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tell us about your audience or planned integration *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe how many clients you service or the technical scope of the integration you would like to build..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

