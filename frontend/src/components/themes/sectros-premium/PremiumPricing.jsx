import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Minus, ChevronDown, Smartphone, Users, Globe } from 'lucide-react';
import { useCmsContent } from '../../../hooks/useCmsContent';
import centralApi from '../../../services/centralApi';
import { Reveal, RevealGroup, Eyebrow, ArrowIcon, EASE } from './primitives';
import {
  normalizePlans,
  formatPlanPrice,
  hasPlanFeature,
  COMPARISON_SECTIONS,
  defaultPlans,
} from '../../../utils/planFeatures';

/* ─────────────────────────────────────────────────────────────
   Add-ons & FAQ static content
   ───────────────────────────────────────────────────────────── */

const addons = [
  { name: 'SMS Credits', price: '$0.05', unit: 'per SMS', icon: Smartphone, desc: 'Booking confirmations and reminders, delivered by text.' },
  { name: 'Additional Staff', price: '$10', unit: '/staff/mo', icon: Users, desc: 'Extra team members with role-based access.' },
  { name: 'White-label Website', price: '$19', unit: '/mo', icon: Globe, desc: 'A branded website with online booking built in.' },
];

const faqs = [
  { q: 'Can I switch plans at any time?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate any billing differences.' },
  { q: 'Is there a free trial?', a: 'Absolutely. All plans come with a 14-day free trial, no credit card required. You can upgrade, downgrade, or cancel at any time during the trial.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. Enterprise customers can also pay via invoice.' },
  { q: 'How does billing work?', a: 'We bill monthly or annually depending on your preference. Annual plans save you up to 20% compared to monthly billing.' },
  { q: 'Can I cancel my subscription?', a: 'You can cancel anytime from your account settings. Your data remains accessible for the remainder of your billing period.' },
  { q: 'Do you offer discounts for non-profits?', a: 'Yes, we offer a 25% discount for verified non-profit organizations. Contact our sales team to learn more.' },
  { q: 'What happens if I exceed my booking limit?', a: 'We will notify you as you approach your limit. You can upgrade to a higher tier or purchase additional capacity as needed.' },
  { q: 'Is my data secure?', a: 'Yes, we use industry-standard encryption, regular backups, and SOC 2 compliant infrastructure. Enterprise plans include additional compliance features.' },
];

/* ─────────────────────────────────────────────────────────────
   Small UI building blocks
   ───────────────────────────────────────────────────────────── */

function PlanPrice({ plan, annual, reduce }) {
  const { isCustom, isFree, displayPrice, period, note } = formatPlanPrice(plan, annual);

  if (isCustom) {
    return (
      <div>
        <div className="sp-display text-[42px] leading-none tracking-[-0.02em]">Custom</div>
        <div className="mt-2 text-[13px] text-[color:var(--sp-text-3)]">{note || 'Tailored to your venue group.'}</div>
      </div>
    );
  }

  if (isFree) {
    return (
      <div>
        <div className="sp-display text-[42px] leading-none tracking-[-0.02em]">$0</div>
        <div className="mt-2 text-[13px] text-[color:var(--sp-text-3)]">Free forever, no credit card needed.</div>
      </div>
    );
  }

  return (
    <motion.div
      key={annual ? 'annual' : 'monthly'}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
    >
      <span className="sp-display text-[42px] leading-none tracking-[-0.02em]">${displayPrice}</span>
      <span className="text-[15px] font-medium text-[color:var(--sp-text-3)]">{period}</span>
      {note && <span className="w-full text-[12.5px] text-[color:var(--sp-text-3)]">{note}</span>}
    </motion.div>
  );
}

function BillingToggle({ annual, onChange, monthlyLabel, yearlyLabel, badgeLabel, reduce }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div className="inline-flex items-center rounded-full border border-[color:var(--sp-line)] bg-white p-1 shadow-[var(--sp-shadow-sm)]">
        {[
          { label: monthlyLabel || 'Monthly billing', value: false },
          { label: yearlyLabel || 'Annual billing', value: true },
        ].map((opt) => {
          const active = annual === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--sp-green)] focus-visible:ring-offset-2 ${
                active ? 'text-white' : 'text-[color:var(--sp-text-2)] hover:text-[color:var(--sp-text)]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sp-billing-knob"
                  className="absolute inset-0 rounded-full bg-[color:var(--sp-ink)]"
                  transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {annual && (
          <motion.span
            key="save-badge"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="inline-flex items-center rounded-full border border-[rgba(18,121,76,0.2)] bg-[color:var(--sp-mint)] px-3 py-1.5 text-xs font-semibold text-[color:var(--sp-green)]"
          >
            {badgeLabel || 'Save ~20%'}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompareCell({ value, tinted }) {
  const tint = tinted ? 'bg-[color:var(--sp-mint)]/40' : '';
  if (value === true) {
    return (
      <td className={`px-5 py-4 text-center ${tint}`}>
        <Check className="mx-auto h-[18px] w-[18px] text-[color:var(--sp-green)]" strokeWidth={2.4} />
      </td>
    );
  }
  if (value === false) {
    return (
      <td className={`px-5 py-4 text-center ${tint}`}>
        <Minus className="mx-auto h-[18px] w-[18px] text-[rgba(12,26,21,0.22)]" strokeWidth={2.4} />
      </td>
    );
  }
  return (
    <td className={`px-5 py-4 text-center text-[13px] font-medium ${tinted ? 'text-[color:var(--sp-green-600)] font-semibold' : 'text-[color:var(--sp-text)]'} ${tint}`}>
      {value}
    </td>
  );
}

const rowVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
};

/* ─────────────────────────────────────────────────────────────
   Page Component
   ───────────────────────────────────────────────────────────── */

export default function PremiumPricing() {
  const { get } = useCmsContent('pricing');
  const reduce = useReducedMotion();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [plans, setPlans] = useState(() => normalizePlans(defaultPlans));

  useEffect(() => {
    centralApi
      .get('saas/plans')
      .then((res) => {
        const normalized = normalizePlans(res.data);
        if (normalized.length > 0) {
          setPlans(normalized);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch dynamic SaaS plans, using defaults:', err);
      });
  }, []);

  return (
    <div className="font-sans antialiased">
      {/* ── Hero + plans ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-28">
        <div className="sp-hero-bg" />
        <div className="sp-container relative">
          <Reveal className="mx-auto max-w-[780px] text-center">
            <Eyebrow>{get('hero.badge') || 'TRANSPARENT PRICING'}</Eyebrow>
            <h1 className="sp-display sp-h1 mt-6">
              Choose the right plan <em>for your venue.</em>
            </h1>
            <p className="sp-lead mx-auto mt-6 max-w-[580px]">
              {get('hero.paragraph') ||
                'From independent bistro table reservations to complete multi-outlet TSE cash registers and 24/7 AI phone receptionist.'}
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-8">
            <BillingToggle
              annual={annual}
              onChange={setAnnual}
              monthlyLabel={get('toggle.monthly')}
              yearlyLabel={get('toggle.yearly')}
              badgeLabel={get('toggle.badge')}
              reduce={reduce}
            />
          </Reveal>

          {/* Pricing cards grid — dynamic sizing based on plan count */}
          <div
            className={`mx-auto mt-14 grid max-w-[1140px] grid-cols-1 gap-6 lg:items-start lg:gap-5 ${
              plans.length === 2
                ? 'lg:grid-cols-2 max-w-[820px]'
                : plans.length >= 4
                ? 'lg:grid-cols-4 max-w-[1240px]'
                : 'lg:grid-cols-3'
            }`}
          >
            {plans.map((plan, idx) => {
              const isPopular = plan.is_popular;
              const isEnterprise = plan.isEnterprise;
              const features = plan.bulletFeatures || [];

              return (
                <Reveal
                  key={plan.id || plan.slug || plan.name}
                  delay={0.08 * idx}
                  y={28}
                  className={isPopular ? 'lg:-mt-4' : ''}
                >
                  <div
                    className={`relative flex h-full flex-col rounded-[22px] border bg-white p-8 transition-shadow duration-500 ${
                      isPopular
                        ? 'border-[color:var(--sp-green)] shadow-[0_1px_2px_rgba(12,26,21,0.04),0_24px_48px_-32px_rgba(18,121,76,0.5)]'
                        : 'border-[color:var(--sp-line)] shadow-[var(--sp-shadow-sm)] hover:shadow-[var(--sp-shadow-md)]'
                    }`}
                  >
                    {isPopular && (
                      <motion.span
                        initial={reduce ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
                        className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[color:var(--sp-green)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[var(--sp-shadow-sm)]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                        Most Popular
                      </motion.span>
                    )}

                    <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sp-text-3)]">
                      {plan.name}
                    </div>
                    <p className="mt-2.5 min-h-[44px] text-[15px] leading-relaxed text-[color:var(--sp-text-2)]">
                      {plan.description}
                    </p>

                    <div className="mt-6">
                      <PlanPrice plan={plan} annual={annual} reduce={reduce} />
                    </div>

                    <hr className="sp-hr my-7" />

                    <ul className="flex-1 space-y-3.5">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check className="mt-[3px] h-4 w-4 shrink-0 text-[color:var(--sp-green)]" strokeWidth={2.4} />
                          <span className="text-[14.5px] leading-snug text-[color:var(--sp-text-2)]">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      {isEnterprise ? (
                        <Link to="/contact" className="sp-btn sp-btn-secondary w-full justify-center">
                          Talk to Sales
                          <ArrowIcon />
                        </Link>
                      ) : isPopular ? (
                        <Link
                          to={`/register?plan=${plan.slug || plan.id}`}
                          className="sp-btn sp-btn-primary w-full justify-center"
                        >
                          {plan.monthly_price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                          <ArrowIcon />
                        </Link>
                      ) : (
                        <Link
                          to={`/register?plan=${plan.slug || plan.id}`}
                          className="sp-btn sp-btn-secondary w-full justify-center"
                        >
                          {plan.monthly_price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                          <ArrowIcon />
                        </Link>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Comparison Table (Dynamic from system pricing logics) ────────────── */}
      <section className="sp-section bg-white border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="max-w-[720px]">
            <Reveal>
              <Eyebrow>What&apos;s included</Eyebrow>
              <h2 className="sp-display sp-h2 mt-5">
                {get('compare.heading') || 'Compare plans side by side.'}
              </h2>
              <p className="sp-lead mt-5 max-w-[560px]">
                Every module in the Sectros platform, side by side — live capabilities configured directly by system entitlements.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="mt-12">
            <div className="overflow-hidden rounded-[20px] border border-[color:var(--sp-line)] bg-white shadow-[var(--sp-shadow-sm)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[color:var(--sp-line)] bg-slate-50/70">
                      <th className="sticky left-0 z-20 min-w-[280px] bg-slate-50 px-6 py-4 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sp-text-3)] shadow-[1px_0_0_var(--sp-line)]">
                        Platform Capability
                      </th>
                      {plans.map((p) => {
                        const isPop = p.is_popular;
                        return (
                          <th
                            key={p.id || p.slug || p.name}
                            className={`px-5 py-4 text-center text-[12px] font-semibold uppercase tracking-[0.14em] ${
                              isPop
                                ? 'bg-[color:var(--sp-mint)] text-[color:var(--sp-green)] font-bold'
                                : 'text-[color:var(--sp-text-3)]'
                            }`}
                          >
                            <div>{p.name}</div>
                            {isPop && (
                              <span className="inline-block mt-0.5 text-[9.5px] font-bold text-[color:var(--sp-green)] lowercase tracking-normal">
                                (recommended)
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <RevealGroup as="tbody" stagger={0.03} amount={0.02}>
                    {COMPARISON_SECTIONS.map((section) => (
                      <React.Fragment key={section.category}>
                        {/* Section Group Header */}
                        <motion.tr variants={rowVariants}>
                          <td
                            colSpan={plans.length + 1}
                            className="sticky left-0 z-10 bg-[color:var(--sp-paper)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--sp-text-3)] border-t border-[rgba(12,26,21,0.06)]"
                          >
                            {section.category}
                          </td>
                        </motion.tr>

                        {/* Section Item Rows */}
                        {section.items.map((item) => (
                          <motion.tr
                            key={item.name}
                            variants={rowVariants}
                            className="border-t border-[rgba(12,26,21,0.06)] transition-colors hover:bg-[rgba(238,245,240,0.4)]"
                          >
                            <td className="sticky left-0 z-10 bg-white px-6 py-4 pr-8 text-[14px] font-medium text-[color:var(--sp-ink)] shadow-[1px_0_0_rgba(12,26,21,0.06)]">
                              {item.name}
                            </td>

                            {section.isQuota ? (
                              plans.map((plan) => (
                                <td
                                  key={plan.id || plan.slug}
                                  className={`px-5 py-4 text-center text-[13px] font-medium ${
                                    plan.is_popular
                                      ? 'bg-[color:var(--sp-mint)]/40 text-[color:var(--sp-green-600)] font-semibold'
                                      : 'text-[color:var(--sp-text)]'
                                  }`}
                                >
                                  {item.formatter(plan[item.quotaKey])}
                                </td>
                              ))
                            ) : (
                              plans.map((plan) => {
                                const has = hasPlanFeature(plan, item.key, item.aliases, item.alwaysOn);
                                return (
                                  <CompareCell
                                    key={plan.id || plan.slug}
                                    value={has}
                                    tinted={plan.is_popular}
                                  />
                                );
                              })
                            )}
                          </motion.tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </RevealGroup>
                </table>
              </div>
            </div>
            <p className="mt-5 text-[13px] text-[color:var(--sp-text-3)]">
              Prices shown in USD ($). All plans include EU data hosting, GDPR compliance, and continuous system updates.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Add-ons ─────────────────────────────────────────────── */}
      <section className="sp-section">
        <div className="sp-container">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <Reveal className="max-w-[640px]">
              <Eyebrow>Add-ons</Eyebrow>
              <h2 className="sp-display sp-h2 mt-5">{get('addons.heading')}</h2>
              <p className="sp-lead mt-5 max-w-[520px]">{get('addons.paragraph')}</p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="mt-12">
            <div className="grid gap-px overflow-hidden rounded-[20px] border border-[color:var(--sp-line)] bg-[color:var(--sp-line)] sm:grid-cols-3">
              {addons.map((addon) => {
                const Icon = addon.icon;
                return (
                  <div key={addon.name} className="flex flex-col bg-white p-8">
                    <span className="sp-icon-chip">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-4 text-[18px] font-medium tracking-[-0.01em] text-[color:var(--sp-ink)]">
                      {addon.name}
                    </h3>
                    <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-[color:var(--sp-text-3)]">
                      {addon.desc}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1.5 border-t border-[color:var(--sp-line)] pt-5">
                      <span
                        className="text-[28px] leading-none tracking-[-0.02em] text-[color:var(--sp-ink)]"
                        style={{ fontFamily: 'var(--sp-font-display)' }}
                      >
                        {addon.price}
                      </span>
                      <span className="text-[13px] text-[color:var(--sp-text-3)]">{addon.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Multi-venue (Enterprise band) ─────── */}
      <section className="sp-section sp-bg-ink relative overflow-hidden">
        <div className="sp-noise-dark" />
        <div className="sp-container relative">
          <div className="max-w-[760px]">
            <Reveal>
              <Eyebrow>Multi-location &amp; groups</Eyebrow>
              <h2 className="sp-display sp-h2 mt-5 text-white">
                One platform. <em>Every location.</em>
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="sp-lead mt-5 max-w-[600px]">{get('customCta.paragraph')}</p>
            </Reveal>
            <Reveal delay={0.16} className="mt-9">
              <ul className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <span className="sp-check mt-[2px]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] text-white/80">Central menu, pricing and staff policies across every outlet</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="sp-check mt-[2px]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] text-white/80">Group-wide reporting with per-location drill-down</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="sp-check mt-[2px]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] text-white/80">Franchise tools, public developer REST API, and dedicated SLA</span>
                </li>
              </ul>
            </Reveal>
            <Reveal delay={0.24} className="mt-10">
              <Link to="/contact" className="sp-btn sp-btn-light sp-btn-lg">
                {get('customCta.button') || 'Talk to Sales'}
                <ArrowIcon />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ (two-column editorial) ──────────────────────────── */}
      <section className="sp-section bg-white">
        <div className="sp-container grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="sp-display sp-h2 mt-5">{get('faq.heading') || 'Frequently Asked Questions'}</h2>
            <p className="sp-lead mt-5 max-w-[420px]">
              Everything you need to know before you start.{' '}
              <Link to="/contact" className="sp-link">
                Talk to us
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-t border-[color:var(--sp-line)]">
              {faqs.map((faq) => {
                const open = openFaq === faq.q;
                return (
                  <div key={faq.q} className="border-b border-[color:var(--sp-line)]">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : faq.q)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:ring-2 focus-visible:ring-[color:var(--sp-green)] focus-visible:outline-none"
                    >
                      <span className="text-[17px] font-medium tracking-[-0.01em] text-[color:var(--sp-ink)]">
                        {faq.q}
                      </span>
                      <span
                        className={`sp-icon-chip shrink-0 transition-colors ${open ? 'bg-[color:var(--sp-green)] text-white' : ''}`}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                          strokeWidth={2}
                        />
                      </span>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
                      transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-12 text-[15px] leading-relaxed text-[color:var(--sp-text-2)]">
                        {faq.a}
                      </p>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <section className="sp-bg-ink relative overflow-hidden py-24 sm:py-32">
        <div className="sp-noise-dark" />
        <div className="sp-container relative text-center">
          <Reveal>
            <h2 className="sp-display sp-h1 mx-auto max-w-[780px] text-white">
              Ready to run <em>hospitality differently?</em>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="sp-lead mx-auto mt-6 max-w-[520px]">{get('finalCta.paragraph')}</p>
          </Reveal>
          <Reveal delay={0.16} className="mt-10">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="sp-btn sp-btn-light sp-btn-lg">
                {get('finalCta.button') || 'Start Free Trial'}
                <ArrowIcon />
              </Link>
              <Link to="/contact" className="sp-btn sp-btn-ghost-dark sp-btn-lg">
                Book a Demo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
