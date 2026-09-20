import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw, ShieldCheck, CreditCard, Clock, HelpCircle,
  FileText, CheckCircle2, Mail, ExternalLink, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const SECTIONS = [
  { id: 'overview',           label: 'Company & Scope' },
  { id: 'merchant-of-record', label: 'Merchant of Record (Paddle)' },
  { id: '14-day-refund',      label: '14-Day Refund Policy' },
  { id: 'subscriptions',      label: 'Subscriptions & Cancellations' },
  { id: 'digital-products',   label: 'Themes & Add-ons' },
  { id: 'request-process',    label: 'How to Request a Refund' },
  { id: 'discretionary',      label: 'Discretionary & Consumer Rights' },
  { id: 'contact',            label: 'Contact & Billing Details' },
];

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: '14-Day Full Refund',
    desc: 'Full refund available within 14 days of purchase in accordance with Paddle Buyer Terms. No qualifiers or hidden hurdles.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 border-emerald-200'
  },
  {
    icon: CreditCard,
    title: 'Merchant of Record',
    desc: 'Orders are securely conducted and fulfilled by Paddle.com as authorized Merchant of Record with global tax compliance.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 border-blue-200'
  },
  {
    icon: RotateCcw,
    title: 'Cancel Anytime',
    desc: 'Cancel recurring subscriptions anytime with a single click in your dashboard or directly via the Paddle Buyer Portal.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 border-indigo-200'
  },
  {
    icon: Clock,
    title: 'Prompt Disbursement',
    desc: 'Refunds are returned to the original payment method without deduction or delay (typically 3–5 business days).',
    color: 'text-amber-500',
    bg: 'bg-amber-50 border-amber-200'
  },
];

function SectionBlock({ id, number, title, children }) {
  return (
    <motion.section
      id={id}
      className="relative mb-14 scroll-mt-24"
      {...fadeUp}
      transition={{ duration: 0.4 }}
    >
      <span
        className="absolute -top-4 -left-3 text-7xl md:text-8xl font-black text-slate-100 select-none leading-none pointer-events-none"
        aria-hidden="true"
      >
        {number}
      </span>
      <div className="relative pl-6 border-l-2 border-slate-200">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 mb-4">{title}</h2>
        <div className="text-slate-600 leading-relaxed space-y-4 text-[15px]">{children}</div>
      </div>
    </motion.section>
  );
}

export default function RefundPolicyPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const handleAnchorClick = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-slate-50 border-b border-slate-200 pt-28 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700 tracking-wide">
                <FileText className="w-3.5 h-3.5" />
                Last updated: September 20, 2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold tracking-wide">
                Paddle Merchant of Record Compliant
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">
              Refund & Cancellation Policy
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
              This policy outlines how cancellations and refunds are handled for Sectros. All orders and billing transactions are processed in accordance with Paddle's Merchant of Record terms and consumer standards.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-12 px-6 border-b border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HIGHLIGHTS.map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeUp}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-2xl border ${item.bg} flex flex-col justify-between`}
              >
                <div>
                  <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
                  <h3 className="font-black text-slate-900 text-base mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sticky Sidebar */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Table of Contents - Desktop Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" /> Policy Contents
                </h4>
                <nav className="space-y-1">
                  {SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => handleAnchorClick(sec.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        activeSection === sec.id
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <span className="truncate">{sec.label}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeSection === sec.id ? 'translate-x-0.5 text-emerald-400' : 'opacity-40'}`} />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Need Assistance Card */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md">
                <HelpCircle className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm mb-1">Paddle Buyer Support</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Manage your subscription, retrieve invoices, or submit a refund request directly through the official Paddle Buyer Portal.
                </p>
                <a
                  href="https://paddle.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Visit paddle.net
                </a>
              </div>
            </div>
          </aside>

          {/* Policy Document Body */}
          <main className="lg:col-span-8">
            <SectionBlock id="overview" number="01" title="Company Identification & Scope">
              <p>
                This Refund & Cancellation Policy applies to all services, subscription plans, add-ons, and digital goods provided through the <strong>Sectros</strong> platform.
              </p>
              <p>
                The software platform <strong>Sectros</strong> is owned and operated by:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-1 text-slate-800">
                <p><strong>Registered Company Name:</strong> Nadvix Limited</p>
                <p><strong>Trading / Operating Name:</strong> Nadvix Technology Limited</p>
                <p><strong>Software Brand:</strong> Sectros</p>
                <p><strong>Jurisdiction:</strong> England and Wales</p>
              </div>
              <p>
                In this policy, "we", "us", or "our" refers to <strong>Nadvix Limited (trading as Nadvix Technology Limited)</strong>. By subscribing to or purchasing any digital service on Sectros, you agree to the terms set forth herein.
              </p>
            </SectionBlock>

            <SectionBlock id="merchant-of-record" number="02" title="Merchant of Record (Paddle.com)">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 mb-4 text-blue-950 text-sm">
                <p className="font-bold mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Authorized Reseller & Merchant of Record
                </p>
                <p className="text-blue-900 text-xs leading-relaxed">
                  Our order process is conducted by our online reseller and Merchant of Record, <strong>Paddle.com</strong> (Paddle.com Market Ltd / Paddle Payments Ltd). Paddle is the Merchant of Record for all our orders.
                </p>
              </div>
              <p>
                Paddle provides customer service inquiries and handles returns and refunds. Transactions conducted via Paddle are governed by the following terms:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>
                  <a
                    href="https://paddle.com/legal/buyer-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Paddle Buyer Terms <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://paddle.com/legal/invoiced-consumer-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Paddle Invoiced Consumer Terms <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              </ul>
              <p>
                Paddle also handles global sales tax, VAT, and GST calculation, remittance, and compliance for all digital orders.
              </p>
            </SectionBlock>

            <SectionBlock id="14-day-refund" number="03" title="14-Day Refund Policy (No Qualifiers or Exceptions)">
              <p>
                In strict alignment with <strong>Paddle's Refund Policy</strong>, <strong>Paddle's Buyer Terms</strong>, and applicable statutory consumer regulations, customers are entitled to cancel their purchase and receive a full refund within <strong>fourteen (14) calendar days</strong> of the transaction date.
              </p>
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 mb-4 text-emerald-950 text-sm">
                <p className="font-bold mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> Full Refund Guarantee
                </p>
                <p className="text-emerald-900 text-xs leading-relaxed">
                  We do not impose qualifiers, conditional hurdles, or arbitrary exceptions. If you submit a refund request within 14 days of your payment, your request will be honored and the amount paid will be refunded in full.
                </p>
              </div>
              <p>
                Refunds are issued directly to the original payment method through Paddle without penalty, deductions, or processing fees.
              </p>
            </SectionBlock>

            <SectionBlock id="subscriptions" number="04" title="Subscriptions, Renewals & Cancellations">
              <p>
                Sectros subscriptions operate on recurring monthly or annual billing terms:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>
                  <strong>Cancel Anytime:</strong> You may cancel your subscription at any time directly through your Sectros account (<strong>Dashboard &rarr; Billing</strong>) or via the Paddle Buyer Portal at <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">paddle.net</a>.
                </li>
                <li>
                  <strong>Immediate Effect:</strong> Cancellation takes effect at the end of the current paid billing cycle. You will retain full access to the platform until that date, and no further automatic charges will occur.
                </li>
                <li>
                  <strong>Refunds on Subscriptions:</strong> Any subscription payment (initial signup or renewal) requested within 14 days of the charge date is eligible for a full refund in accordance with Paddle's consumer terms.
                </li>
              </ul>
            </SectionBlock>

            <SectionBlock id="digital-products" number="05" title="Themes, Digital Templates & Add-ons">
              <p>
                All digital goods available on Sectros—including website theme blueprints, white-label unlocks, and usage add-on packs—are fulfilled and processed through Paddle.
              </p>
              <p>
                In accordance with Paddle's Merchant of Record terms and consumer standards, all purchases of digital goods and add-ons are covered by Paddle's standard 14-day refund window.
              </p>
              <p>
                If you encounter any issue or are dissatisfied with a theme or add-on purchase, you may request a full refund within 14 days of the transaction date.
              </p>
            </SectionBlock>

            <SectionBlock id="request-process" number="06" title="How to Request a Refund">
              <p>
                Requesting a refund is quick and straightforward. You have two convenient options:
              </p>
              <div className="space-y-4 my-4">
                <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
                    A
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Directly via Paddle Buyer Portal (Recommended)</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Visit <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">paddle.net <ExternalLink className="w-3 h-3" /></a>, enter the email address used during checkout, locate your transaction, and follow the simple prompts to request a refund or cancel your subscription.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center shrink-0 text-sm">
                    B
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Via Sectros / Nadvix Support</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Send an email to <a href="mailto:billing@sectros.com" className="text-blue-600 font-bold underline">billing@sectros.com</a> or <a href="mailto:support@sectros.com" className="text-blue-600 font-bold underline">support@sectros.com</a> with your transaction email or order number. Our team will promptly process your refund request through Paddle.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Once approved, refunds are credited back to the original card or payment method. Bank disbursement typically takes 3–5 business days depending on your financial institution.
              </p>
            </SectionBlock>

            <SectionBlock id="discretionary" number="07" title="Discretionary & Statutory Consumer Rights">
              <p>
                For refund requests submitted after the initial 14-day statutory and standard window, Paddle and our team review requests on a case-by-case discretionary basis.
              </p>
              <p>
                Nothing in this Refund & Cancellation Policy limits, excludes, or restricts any statutory consumer rights that you may be entitled to under the laws of your country of residence (including rights regarding services that are faulty or not as described).
              </p>
            </SectionBlock>

            <SectionBlock id="contact" number="08" title="Contact & Billing Identification">
              <p>
                Transactions will appear on your bank or credit card statement with the descriptor <strong>"PADDLE.NET* SECTROS"</strong> or <strong>"PADDLE.NET* NADVIX"</strong>.
              </p>
              <p>
                For any billing, refund, or corporate inquiries, please contact us or Paddle directly:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-4 space-y-4 text-sm">
                <div>
                  <span className="font-bold text-slate-900 block text-base">Nadvix Limited</span>
                  <span className="text-slate-600 text-xs">Trading as <strong>Nadvix Technology Limited</strong></span>
                  <span className="text-slate-500 block text-xs mt-0.5">SaaS Platform: Sectros</span>
                  <span className="text-slate-500 block text-xs">Incorporated in England and Wales</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Billing Support</span>
                    <a href="mailto:billing@sectros.com" className="text-blue-600 font-bold hover:underline">
                      billing@sectros.com
                    </a>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Customer Support</span>
                    <a href="mailto:support@sectros.com" className="text-blue-600 font-bold hover:underline">
                      support@sectros.com
                    </a>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Legal Department</span>
                    <a href="mailto:legal@sectros.com" className="text-blue-600 font-bold hover:underline">
                      legal@sectros.com
                    </a>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Paddle Buyer Portal</span>
                    <a
                      href="https://paddle.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      https://paddle.net <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </SectionBlock>

            {/* Quick Navigation Footer Links */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500">
              <div className="flex flex-wrap gap-4">
                <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
                <span>&bull;</span>
                <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
                <span>&bull;</span>
                <Link to="/cookies" className="hover:text-slate-900 transition-colors">Cookie Policy</Link>
                <span>&bull;</span>
                <Link to="/gdpr" className="hover:text-slate-900 transition-colors">GDPR & Compliance</Link>
              </div>
              <Link to="/pricing" className="text-blue-600 hover:text-blue-800 font-bold">
                View Pricing Plans &rarr;
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
