import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw, ShieldCheck, CreditCard, Clock, HelpCircle,
  FileText, CheckCircle2, AlertCircle, Mail, ExternalLink, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const SECTIONS = [
  { id: 'overview',          label: 'Overview & Philosophy' },
  { id: 'subscriptions',     label: 'SaaS Subscriptions' },
  { id: '14-day-guarantee',  label: '14-Day Money-Back Guarantee' },
  { id: 'renewals',          label: 'Renewals & Cancellations' },
  { id: 'addons-credits',    label: 'Add-ons & Credit Packs' },
  { id: 'website-themes',    label: 'Website Themes & Templates' },
  { id: 'reservation-deposits', label: 'Reservation Deposits' },
  { id: 'merchant-of-record', label: 'Merchant of Record (Paddle)' },
  { id: 'request-process',   label: 'How to Request a Refund' },
  { id: 'chargebacks',       label: 'Disputes & Chargebacks' },
  { id: 'contact',           label: 'Contact & Support' },
];

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: '14-Day Guarantee',
    desc: 'New subscription accounts are eligible for a no-questions-asked full refund within 14 days of initial signup.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 border-emerald-200'
  },
  {
    icon: Clock,
    title: 'Prompt Processing',
    desc: 'Approved refund requests are initiated within 3–5 business days to the original payment method.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 border-blue-200'
  },
  {
    icon: RotateCcw,
    title: 'Cancel Anytime',
    desc: 'Subscriptions can be canceled at any time from your billing dashboard with zero cancellation fees or lock-ins.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 border-indigo-200'
  },
  {
    icon: CreditCard,
    title: 'Global Compliance',
    desc: 'Our billing is backed by leading payment processors and Merchant of Record infrastructure (including Paddle).',
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
                Last updated: September 19, 2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold tracking-wide">
                Version 2.0 (Global MoR Compliant)
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">
              Refund & Cancellation Policy
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
              We want you to be completely confident using Sectros. This policy outlines our standards for subscription cancellations, refunds for digital services, and merchant terms.
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
                  <FileText className="w-4 h-4 text-slate-500" /> Navigation
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
                <h4 className="font-bold text-sm mb-1">Billing Questions?</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Our dedicated billing team is available 24/7 to help resolve account discrepancies or process claims.
                </p>
                <a
                  href="mailto:billing@sectros.com"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" /> Contact Billing Support
                </a>
              </div>
            </div>
          </aside>

          {/* Policy Document Body */}
          <main className="lg:col-span-8">
            <SectionBlock id="overview" number="01" title="Overview & Scope">
              <p>
                This Refund & Cancellation Policy applies to all services, software licenses, add-on features, and digital purchases provided through the <strong>Sectros</strong> platform (operated by Sectros Inc. and its affiliates, hereinafter referred to as "we", "us", or "our").
              </p>
              <p>
                By creating an account, subscribing to any paid plan, or completing a transaction on Sectros, you acknowledge that you have read, understood, and agreed to be bound by the terms contained herein.
              </p>
              <p>
                Our goal is to treat our customers fairly. If you encounter any technical difficulty, service interruption, or operational discrepancy with our software, we urge you to contact our support team immediately so we can make things right.
              </p>
            </SectionBlock>

            <SectionBlock id="subscriptions" number="02" title="SaaS Subscriptions (Monthly & Annual)">
              <p>
                Sectros operates on a recurring software-as-a-service (SaaS) subscription model. We offer both monthly and annual billing cycles:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>
                  <strong>Monthly Subscriptions:</strong> Billed automatically every 30 days. Payments are non-refundable once the billing cycle is past the initial 14-day guarantee window, but cancellation takes effect at the end of the current paid billing month.
                </li>
                <li>
                  <strong>Annual Subscriptions:</strong> Billed upfront for a 12-month period at a discounted rate. Annual plans carry the 14-day full money-back guarantee from the moment of activation or renewal.
                </li>
              </ul>
              <p>
                Upon cancellation, you will retain full administrative access to your dashboard and features until the conclusion of your active billing period. No further automated charges will be made.
              </p>
            </SectionBlock>

            <SectionBlock id="14-day-guarantee" number="03" title="14-Day Money-Back Guarantee">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 mb-4 text-emerald-900 text-sm">
                <p className="font-bold mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> No Risk Initial Trial Period
                </p>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  If you are a new customer and decide Sectros is not the right fit for your venue within 14 calendar days of your initial subscription payment, you are eligible for a 100% full refund.
                </p>
              </div>
              <p>
                To claim a guarantee refund, simply submit a request to our billing team within 14 days of your initial purchase date with your registered account email and transaction receipt. Refunds will be issued without penalty or deduction.
              </p>
              <p className="text-xs text-slate-500 italic">
                * Note: The 14-day guarantee applies to first-time account subscriptions and does not apply to repeat accounts created by the same business entity or subsequent renewals.
              </p>
            </SectionBlock>

            <SectionBlock id="renewals" number="04" title="Renewals, Downgrades & Cancellations">
              <p>
                You may cancel or downgrade your subscription at any time directly through the <strong>Dashboard &rarr; Billing</strong> page or via the Merchant Customer Portal (e.g., Paddle Buyer Portal).
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>
                  <strong>Self-Service Cancellation:</strong> You do not need to speak to an agent to cancel. Clicking "Cancel Subscription" immediately sets your account to cancel at the end of the billing term.
                </li>
                <li>
                  <strong>Plan Downgrades:</strong> When switching from a higher tier to a lower tier, your existing privileges remain active until the end of the current billing cycle, at which point the new lower rate takes effect.
                </li>
                <li>
                  <strong>Accidental Renewal Notice:</strong> If your annual subscription renews automatically and you forgot to cancel, you may request a refund within <strong>48 hours</strong> of the renewal charge, provided you have not utilized high-volume automation quotas during that window.
                </li>
              </ul>
            </SectionBlock>

            <SectionBlock id="addons-credits" number="05" title="Add-ons & Usage Credit Packs">
              <p>
                Sectros provides optional add-on capacity including AI automation credits, SMS message bundles, and additional branch locations:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>
                  <strong>Unused Credit Packs:</strong> One-time top-up credit packs (e.g. AI credits or SMS packs) that have remained <em>100% unconsumed</em> may be refunded within 14 days of purchase.
                </li>
                <li>
                  <strong>Partially Consumed Credits:</strong> Because telecommunication carrier costs and AI compute infrastructure incur real-time fees upon usage, credits that have already been partially or fully consumed cannot be refunded.
                </li>
                <li>
                  <strong>Recurring Add-ons:</strong> Recurring add-ons (such as white-label websites or additional staff packs) adhere to standard SaaS subscription terms and can be canceled at any cycle boundary.
                </li>
              </ul>
            </SectionBlock>

            <SectionBlock id="website-themes" number="06" title="Website Themes & Digital Blueprints">
              <p>
                Digital website themes and blueprints available in the Sectros Theme Store grant instant lifetime unlocks to your venue account upon purchase.
              </p>
              <p>
                Because digital goods cannot be physically retrieved once installed, all theme sales are generally final. However, we will gladly issue a full refund or exchange if:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-sm">
                <li>The theme has a proven reproducible defect that our technical team cannot rectify within 72 hours.</li>
                <li>The purchase was made erroneously due to a duplicate transaction error.</li>
              </ul>
            </SectionBlock>

            <SectionBlock id="reservation-deposits" number="07" title="Reservation Deposits & Guest Bookings">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4 text-xs text-slate-700 leading-relaxed">
                <strong className="block text-slate-900 font-bold mb-1">Notice for Guests & End-Consumers:</strong>
                Sectros provides the booking and payment infrastructure on behalf of independent venues (restaurants, cafes, salons, and hotels). Deposit refund eligibility for guest bookings is determined by each venue's cancellation policy.
              </div>
              <p>
                When you make a reservation requiring a security deposit, the venue specifies its cancellation cutoff (e.g. 24 or 48 hours before the booking time). 
              </p>
              <p>
                Cancellations executed before the venue's stated cutoff are automatically refunded to the original payment card. Cancellations made after the threshold are governed by the venue operator's policy. If you believe a venue has improperly withheld a deposit, you may contact Sectros Support for mediation.
              </p>
            </SectionBlock>

            <SectionBlock id="merchant-of-record" number="08" title="Merchant of Record & International Tax">
              <p>
                Our order process is conducted by our online reseller and Merchant of Record, <strong>Paddle.com</strong> (or regional payment processors where specified). 
              </p>
              <p>
                Paddle is the Merchant of Record for our digital orders. Paddle handles customer service inquiries and returns related to order processing and ensures compliance with global VAT, GST, and sales tax regulations.
              </p>
              <p>
                If your purchase was processed through Paddle, you can view your invoices, manage your payment methods, and submit refund requests directly through the <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5">Paddle Buyer Portal <ExternalLink className="w-3 h-3" /></a> or via our platform.
              </p>
            </SectionBlock>

            <SectionBlock id="request-process" number="09" title="How to Request a Refund">
              <p>
                Submitting a refund request is straightforward and hassle-free. Follow these steps:
              </p>
              <div className="space-y-4 my-4">
                <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Locate Your Transaction Identifier</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Find your invoice number or transaction ID from your email receipt or from <strong>Dashboard &rarr; Billing</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Send an Email to Billing Support</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Email <a href="mailto:billing@sectros.com" className="text-blue-600 font-semibold underline">billing@sectros.com</a> with the subject line <em>"Refund Request - [Your Venue Name]"</em>. Include a brief summary of your reason.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Review & Fund Disbursement</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Our finance team reviews requests within 1 business day. Once approved, the funds are credited back to your original payment method in 3–5 business days (bank processing times may vary).
                    </p>
                  </div>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock id="chargebacks" number="10" title="Disputes & Chargebacks">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 text-xs text-amber-900 leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Notice Regarding Chargebacks
                </p>
                <p>
                  Initiating a formal credit card dispute or chargeback without contacting our support team first can trigger an automated suspension of your tenant workspace and associated public booking domains by our risk mitigation engine.
                </p>
              </div>
              <p>
                We are committed to resolving any legitimate billing issue amicably and swiftly. If you do not recognize a charge with the descriptor <em>"PADDLE.NET* SECTROS"</em> or <em>"SECTROS SAAS"</em>, please reach out to us first. We will investigate and refund mistaken charges immediately.
              </p>
            </SectionBlock>

            <SectionBlock id="contact" number="11" title="Contact Information">
              <p>
                For all inquiries, cancellations, or questions concerning this policy, please reach out to:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-4 space-y-3 text-sm">
                <div>
                  <span className="font-bold text-slate-900 block">Sectros Billing & Customer Operations</span>
                  <span className="text-slate-600">Sectros Inc. — Global Software Solutions</span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Email Support</span>
                  <a href="mailto:billing@sectros.com" className="text-blue-600 font-bold hover:underline">
                    billing@sectros.com
                  </a>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">General Legal Inquiries</span>
                  <a href="mailto:legal@sectros.com" className="text-blue-600 font-bold hover:underline">
                    legal@sectros.com
                  </a>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Paddle Buyer Support</span>
                  <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">
                    https://paddle.net <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </SectionBlock>

            {/* Quick Navigation Footer Links */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500">
              <div className="flex gap-4">
                <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
                <span>&bull;</span>
                <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
                <span>&bull;</span>
                <Link to="/cookies" className="hover:text-slate-900 transition-colors">Cookie Policy</Link>
                <span>&bull;</span>
                <Link to="/gdpr" className="hover:text-slate-900 transition-colors">GDPR</Link>
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
