import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Scale, Shield, AlertCircle, ChevronRight } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const SECTIONS = [
  { id: 'acceptance',       label: 'Acceptance of Terms' },
  { id: 'description',      label: 'Description of Service' },
  { id: 'registration',     label: 'Account Registration' },
  { id: 'billing',          label: 'Subscription & Billing' },
  { id: 'acceptable-use',   label: 'Acceptable Use Policy' },
  { id: 'ip',               label: 'Intellectual Property' },
  { id: 'termination',      label: 'Termination' },
  { id: 'disclaimers',      label: 'Disclaimers & Warranties' },
  { id: 'liability',        label: 'Limitation of Liability' },
  { id: 'governing-law',    label: 'Governing Law' },
  { id: 'changes',          label: 'Changes to Terms' },
  { id: 'contact',          label: 'Contact' },
];

function SectionBlock({ id, number, title, children }) {
  return (
    <motion.section
      id={id}
      className="relative mb-14 scroll-mt-8"
      {...fadeUp}
      transition={{ duration: 0.4 }}
    >
      <span
        className="absolute -top-3 -left-2 text-8xl font-black text-slate-200 select-none leading-none pointer-events-none"
        aria-hidden="true"
      >
        {number}
      </span>
      <div className="relative pl-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-3">{title}</h2>
        <div className="text-slate-600 leading-relaxed space-y-3 text-[15px]">{children}</div>
      </div>
    </motion.section>
  );
}

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const handleAnchorClick = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-slate-50 border-b border-slate-200 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 tracking-wide">
                <FileText className="w-3.5 h-3.5" />
                Last updated: September 1, 2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 tracking-wide">
                Version 1.4
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
              Please read these terms carefully before using the Sectros platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2-column layout */}
      <div className="max-w-6xl mx-auto flex">

        {/* TOC Sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <nav className="sticky top-0 pt-10 pb-6 pr-6 pl-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 px-2">
              Contents
            </p>
            <ul className="space-y-0.5">
              {SECTIONS.map(({ id, label }, idx) => (
                <li key={id}>
                  <button
                    onClick={() => handleAnchorClick(id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      activeSection === id
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <span className="text-xs text-slate-400 w-5 flex-shrink-0 font-mono">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 px-6 lg:px-12 py-12 max-w-2xl">

          <SectionBlock id="acceptance" number="1" title="Acceptance of Terms">
            <p>
              By accessing or using any part of the Sectros platform, including our web application,
              mobile applications, and APIs (collectively, the "Service"), you agree to be bound by
              these Terms of Service ("Terms"). If you are entering into these Terms on behalf of a
              company or other legal entity, you represent that you have the authority to bind that
              entity and its affiliates to these Terms. If you do not have such authority, or if you
              do not agree with these Terms, you must not access or use the Service.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or use the Service.
              Your continued use of the Service after any changes to these Terms constitutes your
              acceptance of the revised Terms.
            </p>
          </SectionBlock>

          <SectionBlock id="description" number="2" title="Description of Service">
            <p>
              Sectros is a cloud-based hospitality management platform designed for restaurants,
              hotels, and event venues. The Service includes, but is not limited to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
              <li>Reservation management and table booking tools</li>
              <li>Interactive floor plan editor and table assignment</li>
              <li>Guest CRM for tracking preferences, visit history, and feedback</li>
              <li>Staff scheduling, shift management, and clock-in/out tracking</li>
              <li>Point of Sale (POS) integration and order management</li>
              <li>AI-powered features including demand forecasting and guest personalisation</li>
              <li>Webhook and REST API access for third-party integrations</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Service at
              any time with reasonable notice. We will not be liable to you or any third party for
              any modification, suspension, or discontinuation of the Service.
            </p>
          </SectionBlock>

          <SectionBlock id="registration" number="3" title="Account Registration">
            <p>
              To use the Service, you must create an account by providing accurate, complete, and
              current information. You are responsible for maintaining the confidentiality of your
              account credentials and for all activity that occurs under your account.
            </p>
            <p>
              You must notify Sectros immediately at{' '}
              <a href="mailto:security@sectros.com" className="text-indigo-600 hover:underline">
                security@sectros.com
              </a>{' '}
              if you suspect any unauthorised use of your account. You may not use another user's
              account without their express permission. Sectros will not be liable for any loss or
              damage arising from your failure to comply with this obligation.
            </p>
            <p>
              You must be at least 18 years of age to create an account. By creating an account,
              you represent and warrant that you meet this requirement.
            </p>
          </SectionBlock>

          <SectionBlock id="billing" number="4" title="Subscription & Billing">
            <p>
              Sectros offers the following subscription tiers:
            </p>
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 my-4 bg-slate-50 overflow-hidden text-sm">
              {[
                { plan: 'Starter', price: '$29 / month', desc: 'Up to 2 locations, core reservations & CRM' },
                { plan: 'Professional', price: '$69 / month', desc: 'Up to 10 locations, POS, staff tools, API access' },
                { plan: 'Enterprise', price: 'Custom pricing', desc: 'Unlimited locations, AI features, SLA, dedicated support' },
              ].map(({ plan, price, desc }) => (
                <div key={plan} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-semibold text-slate-900">{plan}</span>
                    <span className="ml-2 text-slate-400 text-xs">{desc}</span>
                  </div>
                  <span className="font-semibold text-indigo-700 whitespace-nowrap">{price}</span>
                </div>
              ))}
            </div>
            <p>
              Subscriptions are billed monthly or annually in advance. Annual plans are billed as a
              single upfront payment and include a discount compared to monthly billing. All new
              accounts are eligible for a <strong>14-day free trial</strong> with no credit card
              required for Starter and Professional plans.
            </p>
            <p>
              Subscriptions renew automatically at the end of each billing period unless cancelled
              before the renewal date. You may cancel your subscription at any time from your
              account settings. Cancellations take effect at the end of the current billing period;
              no further charges will be made.
            </p>
            <p>
              If you are not satisfied with the Service, you may request a full refund within{' '}
              <strong>30 days</strong> of your first payment by contacting{' '}
              <a href="mailto:billing@sectros.com" className="text-indigo-600 hover:underline">
                billing@sectros.com
              </a>
              . Refunds are not available for subsequent billing cycles or for Enterprise plans
              unless otherwise agreed in writing.
            </p>
            <p>
              Prices are exclusive of any applicable taxes. You are responsible for all taxes
              applicable to your subscription in your jurisdiction. Sectros reserves the right to
              change pricing with 30 days' written notice to your registered email address.
            </p>
          </SectionBlock>

          <SectionBlock id="acceptable-use" number="5" title="Acceptable Use Policy">
            <p>
              You agree to use the Service only for lawful purposes and in accordance with these
              Terms. You must not use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
              <li>Violate any applicable local, national, or international law or regulation</li>
              <li>
                Transmit or store any data that is unlawful, harassing, defamatory, obscene, or
                otherwise objectionable
              </li>
              <li>
                Attempt to gain unauthorised access to any part of the Service or its related
                systems
              </li>
              <li>
                Introduce malicious code, viruses, or other harmful material into the Service
              </li>
              <li>
                Scrape, crawl, or systematically extract data from the Service without our express
                written consent
              </li>
              <li>Resell, sublicense, or otherwise commercialise the Service without authorisation</li>
              <li>
                Interfere with the proper functioning of the Service or its infrastructure
              </li>
            </ul>
            <p>
              Sectros reserves the right to suspend or terminate accounts that violate this policy
              without prior notice.
            </p>
          </SectionBlock>

          <SectionBlock id="ip" number="6" title="Intellectual Property">
            <p>
              The Service and its original content, features, and functionality are and will remain
              the exclusive property of Sectros Ltd and its licensors. Our trademarks, trade names,
              logos, and service marks may not be used without our prior written consent.
            </p>
            <p>
              You retain ownership of any data, content, or materials you upload to the Service
              ("Customer Data"). By uploading Customer Data, you grant Sectros a limited,
              non-exclusive, worldwide licence to host, store, and process that data solely to
              provide the Service to you.
            </p>
            <p>
              Sectros may use aggregated, anonymised data derived from Customer Data to improve the
              Service, develop new features, and produce industry reports. This use will never
              identify you or your guests individually.
            </p>
          </SectionBlock>

          <SectionBlock id="termination" number="7" title="Termination">
            <p>
              Either party may terminate these Terms at any time. You may terminate by cancelling
              your subscription and ceasing to use the Service. Sectros may terminate or suspend
              your access immediately, without prior notice or liability, if you breach these Terms
              or if we reasonably believe your use poses a risk to the Service or other users.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. You may
              export your Customer Data at any time during your subscription. Following termination,
              Sectros will retain your Customer Data for 30 days, after which it will be
              permanently deleted unless legal obligations require longer retention.
            </p>
          </SectionBlock>

          <SectionBlock id="disclaimers" number="8" title="Disclaimers & Warranties">
            <p>
              The Service is provided on an "as is" and "as available" basis, without any warranties
              of any kind, either express or implied, including but not limited to implied warranties
              of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p>
              Sectros does not warrant that the Service will be uninterrupted, error-free, or
              completely secure. We make no warranty regarding the accuracy or completeness of any
              content or data provided through the Service. No advice or information obtained from
              Sectros or through the Service will create any warranty not expressly stated in these
              Terms.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion of implied warranties, so the above
              exclusions may not apply to you in full.
            </p>
          </SectionBlock>

          <SectionBlock id="liability" number="9" title="Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, in no event shall Sectros Ltd, its
              directors, employees, partners, agents, suppliers, or affiliates be liable for any
              indirect, incidental, special, consequential, or punitive damages — including without
              limitation loss of profits, data, goodwill, or other intangible losses — arising out
              of or in connection with your use of or inability to use the Service.
            </p>
            <p>
              Our total aggregate liability to you for any claims arising under or in connection
              with these Terms or the Service shall not exceed the greater of (a) the total fees
              paid by you to Sectros in the three months immediately preceding the event giving rise
              to the claim, or (b) £100 GBP.
            </p>
            <p>
              These limitations apply regardless of the theory of liability (contract, tort,
              negligence, strict liability, or otherwise), even if Sectros has been advised of the
              possibility of such damages.
            </p>
          </SectionBlock>

          <SectionBlock id="governing-law" number="10" title="Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of{' '}
              <strong>England and Wales</strong>, without regard to conflict of law principles.
              Any disputes arising under or in connection with these Terms shall be subject to the
              exclusive jurisdiction of the courts of England and Wales.
            </p>
            <p>
              If you are a consumer located in a jurisdiction that provides additional legal
              protections, nothing in these Terms limits any rights you may have under applicable
              mandatory consumer protection laws.
            </p>
          </SectionBlock>

          <SectionBlock id="changes" number="11" title="Changes to Terms">
            <p>
              Sectros reserves the right to modify these Terms at any time. When we make material
              changes, we will notify you by email to the address associated with your account and
              by displaying a prominent notice within the Service at least 14 days before the
              changes take effect. The "Last updated" date at the top of this page will always
              reflect the date of the most recent revision.
            </p>
            <p>
              If you do not agree with the revised Terms, you may cancel your subscription before
              the effective date of the changes. Your continued use of the Service after the
              effective date constitutes your acceptance of the updated Terms.
            </p>
          </SectionBlock>

          <SectionBlock id="contact" number="12" title="Contact">
            <p>
              If you have any questions, concerns, or requests regarding these Terms, please contact
              our legal team:
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
              <p><strong>Sectros Ltd</strong></p>
              <p>Legal Department</p>
              <p>
                Email:{' '}
                <a href="mailto:legal@sectros.com" className="text-indigo-600 hover:underline font-medium">
                  legal@sectros.com
                </a>
              </p>
            </div>
          </SectionBlock>

          {/* Bottom contact box */}
          <motion.div
            className="mt-6 mb-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center"
            {...fadeUp}
            transition={{ duration: 0.4 }}
          >
            <Scale className="w-7 h-7 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">
              Questions about these Terms?{' '}
              <a href="mailto:legal@sectros.com" className="text-indigo-600 hover:underline font-semibold">
                Contact legal@sectros.com
              </a>
            </p>
          </motion.div>

        </main>
      </div>
    </div>
  );
}
