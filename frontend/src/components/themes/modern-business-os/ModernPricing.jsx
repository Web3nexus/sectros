import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {Check, Minus, ChevronDown, Zap, Users, Globe, MessageSquare, ArrowRight, Briefcase, HelpCircle, Smartphone, DollarSign} from 'lucide-react';
import { useCmsContent } from '../../../hooks/useCmsContent';
import centralApi from '../../../services/centralApi';
import { defaultPlans, mapFeaturesToList, getDefaultFeatures } from '../../../utils/planFeatures';

const comparisonFeatures = [
  { name: 'Reservations', starter: true, growth: true, pro: true, enterprise: true },
  { name: 'Floor Plan', starter: false, growth: true, pro: true, enterprise: true },
  { name: 'Guest CRM', starter: false, growth: true, pro: true, enterprise: true },
  { name: 'Automation', starter: false, growth: false, pro: true, enterprise: true },
  { name: 'Deposits', starter: false, growth: true, pro: true, enterprise: true },
  { name: 'Analytics', starter: false, growth: true, pro: true, enterprise: true },
  { name: 'Messaging', starter: false, growth: false, pro: true, enterprise: true },
  { name: 'Integrations', starter: false, growth: false, pro: false, enterprise: true },
  { name: 'Multi-location', starter: false, growth: false, pro: false, enterprise: true },
  { name: 'Support level', starter: 'Email', growth: 'Email', pro: 'Priority', enterprise: 'SLA' },
];

const addons = [
  { name: 'SMS Credits', price: '$0.05', unit: 'per SMS', icon: Smartphone, desc: 'Send booking confirmations and reminders via SMS.' },
  { name: 'Additional Staff', price: '$10', unit: '/staff/mo', icon: Users, desc: 'Add extra team members with role-based access.' },
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const Toggle = ({ annual, onChange, monthlyLabel, yearlyLabel, badgeLabel }) => (
  <div className="flex items-center gap-3">
    <span className={`text-sm font-medium transition-colors ${annual ? 'text-slate-400' : 'text-slate-900'}`}>{monthlyLabel}</span>
    <button
      onClick={() => onChange(!annual)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${annual ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${annual ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium transition-colors ${annual ? 'text-slate-900' : 'text-slate-400'}`}>{yearlyLabel}</span>
      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">{badgeLabel}</span>
    </div>
  </div>
);

const CheckIcon = () => <Check className="h-5 w-5 text-green-500 shrink-0" />;
const DashIcon = () => <Minus className="h-5 w-5 text-slate-300 shrink-0" />;

function PriceDisplay({ plan, annual }) {
  if (plan.monthly === null) return <div className="text-3xl font-bold text-slate-900">Custom</div>;
  if (plan.monthly === 0) return <div className="text-3xl font-bold text-slate-900">Free</div>;
  const price = annual ? plan.yearly : plan.monthly;
  const period = annual ? '/yr' : '/mo';
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-4xl font-bold tracking-tight text-slate-900">${price}</span>
      <span className="text-sm text-slate-500">{period}</span>
    </div>
  );
}

const AccordionItem = ({ question, answer, open, onToggle }) => (
  <div className="border-b border-slate-200 last:border-0">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-5 text-left text-base font-medium text-slate-900 hover:text-blue-600 transition-colors"
    >
      {question}
      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
    </button>
    <motion.div
      initial={false}
      animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <p className="pb-5 text-sm text-slate-600 leading-relaxed">{answer}</p>
    </motion.div>
  </div>
);

export default function ModernPricing() {
  const { get } = useCmsContent('pricing');
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [plans, setPlans] = useState(defaultPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    centralApi.get('saas/plans').then(res => {
      const raw = res.data;
      const arr = Array.isArray(raw) ? raw : (raw?.data || []);
      const active = arr.filter(p => p.is_active);
      if (active.length > 0) {
        setPlans(active.map(p => {
          const mappedFeatures = mapFeaturesToList(p.features);
          return {
            name: p.name,
            monthly: p.monthly_price ?? 0,
            yearly: p.yearly_price ?? null,
            description: p.description || '',
            popular: !!p.is_popular,
            features: mappedFeatures.length > 0 ? mappedFeatures : getDefaultFeatures(p.name),
          };
        }));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      <section className="bg-slate-50 px-6 py-20 sm:py-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span variants={itemVariants} className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
            {get('hero.badge')}
            </motion.span>
          <motion.h1 variants={itemVariants} className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {get('hero.heading')}
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-4 text-lg text-slate-600">
            {get('hero.paragraph')}
          </motion.p>
        </motion.div>
      </section>

      <section className="px-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mx-auto flex max-w-2xl items-center justify-center"
        >
          <Toggle annual={annual} onChange={setAnnual} monthlyLabel={get('toggle.monthly')} yearlyLabel={get('toggle.yearly')} badgeLabel={get('toggle.badge')} />
        </motion.div>
      </section>

      <section className="px-6 pb-20 pt-10">
        <div className="mx-auto max-w-7xl flex flex-wrap justify-center gap-6">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              className={`relative flex flex-col w-full sm:w-[calc(50%-12px)] ${
                plans.length === 3 ? 'lg:w-[calc(33.333%-16px)]' :
                plans.length === 2 ? 'lg:w-[calc(50%-12px)]' :
                'lg:w-[calc(25%-18px)]'
              } min-w-[220px] rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                plan.popular ? 'border-blue-500 ring-1 ring-blue-500 scale-[1.02]' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    <Briefcase className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
              </div>
              <motion.div
                key={annual ? 'annual' : 'monthly'}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-6"
              >
                <PriceDisplay plan={plan} annual={annual} />
              </motion.div>
              <div className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <span className="text-sm text-slate-600">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                {plan.name === 'Enterprise' ? (
                  <Link
                    to="/contact"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Contact Sales
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : plan.popular ? (
                  <Link
                    to="/signup"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={containerVariants}
          className="mx-auto max-w-7xl"
        >
          <motion.h2 variants={itemVariants} className="mb-12 text-center text-3xl font-bold text-slate-900">
            {get('compare.heading')}
          </motion.h2>
          <motion.div variants={itemVariants} className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 pr-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Feature</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Starter</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Growth</th>
                  <th className="py-4 px-4 text-xs font-semibold uppercase tracking-wider text-blue-600">Professional</th>
                  <th className="py-4 pl-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feat) => (
                  <tr key={feat.name} className="border-b border-slate-100 last:border-0">
                    <td className="py-4 pr-6 font-medium text-slate-900">{feat.name}</td>
                    <td className="py-4 px-4">{typeof feat.starter === 'boolean' ? (feat.starter ? <CheckIcon /> : <DashIcon />) : <span className="text-sm text-slate-600">{feat.starter}</span>}</td>
                    <td className="py-4 px-4">{typeof feat.growth === 'boolean' ? (feat.growth ? <CheckIcon /> : <DashIcon />) : <span className="text-sm text-slate-600">{feat.growth}</span>}</td>
                    <td className="py-4 px-4">{typeof feat.pro === 'boolean' ? (feat.pro ? <CheckIcon /> : <DashIcon />) : <span className="text-sm font-medium text-blue-600">{feat.pro}</span>}</td>
                    <td className="py-4 pl-4">{typeof feat.enterprise === 'boolean' ? (feat.enterprise ? <CheckIcon /> : <DashIcon />) : <span className="text-sm font-medium text-slate-900">{feat.enterprise}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={containerVariants}
          className="mx-auto max-w-7xl"
        >
          <motion.h2 variants={itemVariants} className="mb-2 text-center text-3xl font-bold text-slate-900">
            {get('addons.heading')}
          </motion.h2>
          <motion.p variants={itemVariants} className="mb-12 text-center text-slate-500">
            {get('addons.paragraph')}
          </motion.p>
          <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-3">
            {addons.map((addon) => {
              const Icon = addon.icon;
              return (
                <div key={addon.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{addon.name}</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900">{addon.price}</span>
                    <span className="text-sm text-slate-500">{addon.unit}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{addon.desc}</p>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-slate-900 px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={containerVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-white">
            {get('customCta.heading')}
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-3 text-lg text-slate-300">
            {get('customCta.paragraph')}
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              {get('customCta.button')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={containerVariants}
          className="mx-auto max-w-3xl"
        >
          <motion.h2 variants={itemVariants} className="mb-12 text-center text-3xl font-bold text-slate-900">
            {get('faq.heading')}
          </motion.h2>
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white px-6">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.q}
                question={faq.q}
                answer={faq.a}
                open={openFaq === faq.q}
                onToggle={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
              />
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-blue-600 px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={containerVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-white">
            {get('finalCta.heading')}
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-3 text-lg text-blue-100">
            {get('finalCta.paragraph')}
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
            >
              {get('finalCta.button')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
