import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCmsContent } from '../../../hooks/useCmsContent';
import {
  UtensilsCrossed, Wine, Music, Building2, CalendarCheck, Layers,
  TrendingUp, Users, Award, Star, ArrowRight, ChevronDown, Quote,
  PlayCircle, CheckCircle2, Rocket
} from 'lucide-react';

const solutions = [
  {
    icon: UtensilsCrossed,
    title: 'Restaurants',
    painPoint: 'Juggling reservations, walk-ins, and waitlists manually?',
    solution: 'Smart table management with real-time availability tracking.',
    benefit: 'Reduce wait times by 40% and fill every seat.',
    link: '/solutions/restaurants',
  },
  {
    icon: Wine,
    title: 'Lounges & Bars',
    painPoint: 'Managing bottle service and VIP reservations?',
    solution: 'Streamlined booking flows with deposit and minimum spend handling.',
    benefit: 'Increase average check size by 25%.',
    link: '/solutions/lounges-bars',
  },
  {
    icon: Music,
    title: 'Nightclubs',
    painPoint: 'Coordinating guest lists, tables, and entry fees?',
    solution: 'All-in-one guest management with integrated payment gates.',
    benefit: 'Cut door friction and boost guest throughput.',
    link: '/solutions/nightclubs',
  },
  {
    icon: Building2,
    title: 'Hotels',
    painPoint: 'Scattered restaurant, spa, and amenity bookings?',
    solution: 'Unified booking engine for every hotel service.',
    benefit: 'Drive 35% more ancillary revenue per guest.',
    link: '/solutions/hotels',
  },
  {
    icon: CalendarCheck,
    title: 'Event Venues',
    painPoint: 'Double-bookings and fragmented event calendars?',
    solution: 'Visual event calendar with automated conflict detection.',
    benefit: 'Eliminate scheduling conflicts completely.',
    link: '/solutions/event-venues',
  },
  {
    icon: Layers,
    title: 'Multi-location Groups',
    painPoint: 'No centralized view across your venues?',
    solution: 'Multi-property dashboard with consolidated reporting.',
    benefit: 'Save 15+ hours per week on cross-venue ops.',
    link: '/solutions/multi-location',
  },
];

const stats = [
  { icon: TrendingUp, value: '40%', label: 'Avg. revenue increase' },
  { icon: Users, value: '10K+', label: 'Venues onboarded' },
  { icon: Award, value: '98%', label: 'Client satisfaction' },
  { icon: Star, value: '4.9', label: 'Avg. app store rating' },
];

const testimonials = [
  {
    quote: 'Sectroslr transformed how we manage reservations. Our staff spends less time on phones and more time with guests.',
    author: 'Sarah Chen',
    role: 'Owner, The Grand Bistro',
  },
  {
    quote: 'The multi-location dashboard alone saved us countless hours. We finally have real-time visibility across all five venues.',
    author: 'Marcus Rivera',
    role: 'COO, Rivera Hospitality Group',
  },
  {
    quote: 'Setup was incredibly smooth. Our team was up and running in days, not weeks. The support team is phenomenal.',
    author: 'Emma Thompson',
    role: 'GM, Skyline Hotel & Residences',
  },
];

const faqs = [
  {
    q: 'How long does it take to set up?',
    a: 'Most venues go live in under 48 hours. Our onboarding team guides you through every step, from data import to staff training.',
  },
  {
    q: 'Can I integrate with my existing POS?',
    a: 'Yes. Sectroslr connects with 20+ POS systems including Toast, Square, and Clover. Our API also supports custom integrations.',
  },
  {
    q: 'Is there a minimum contract?',
    a: 'No. We offer month-to-month plans with no long-term commitments. You can upgrade, downgrade, or cancel anytime.',
  },
  {
    q: 'Do you support walk-in management?',
    a: 'Absolutely. Our platform handles reservations, walk-ins, waitlists, and takeout in a single unified queue.',
  },
  {
    q: 'What kind of support do you offer?',
    a: 'All plans include 24/7 chat and email support. Enterprise plans get a dedicated account manager and priority phone support.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ModernSolutions() {
  const [openFaq, setOpenFaq] = useState(null);
  const { get } = useCmsContent('solutions');

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
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              {get('hero.cta_primary')}
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-3 font-semibold text-white transition hover:border-white/70"
            >
              <PlayCircle size={20} />
              {get('hero.cta_secondary')}
            </Link>
          </div>
        </motion.div>
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-400/20 blur-3xl" />
      </section>

      <section className="px-6 py-16 sm:px-12 lg:px-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {solutions.map((s, i) => {
            const IconEl = s.icon;
            return (
              <motion.div
                key={s.title}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <IconEl size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm font-medium text-gray-500">{s.painPoint}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.solution}</p>
                <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                  <CheckCircle2 size={16} />
                  {s.benefit}
                </p>
                <Link
                  to={s.link}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-800"
                >
                  Learn more <ArrowRight size={16} />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section className="bg-gray-50 px-6 py-16 sm:px-12 lg:px-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((s) => {
            const IconEl = s.icon;
            return (
              <motion.div
                key={s.label}
                variants={itemVariants}
                className="text-center"
              >
                <IconEl size={28} className="mx-auto text-blue-600" />
                <p className="mt-3 text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section className="px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{get('video.heading')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            {get('video.paragraph')}
          </p>
          <div className="relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
            <div className="flex aspect-video items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 rounded-full bg-white/20 px-8 py-4 text-white backdrop-blur transition hover:bg-white/30"
              >
                <PlayCircle size={36} />
                <span className="text-lg font-semibold">{get('video.button')}</span>
              </motion.button>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full bg-gradient-to-tr from-blue-600/10 to-indigo-600/10" />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-gray-50 px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            {get('testimonials.heading')}
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <motion.div
                key={t.author}
                whileHover={{ y: -4 }}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <Quote size={28} className="mb-4 text-blue-200" />
                <p className="text-sm leading-relaxed text-gray-600">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {t.author.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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

      <section className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center text-white"
        >
          <Rocket size={40} className="mx-auto text-blue-200" />
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            {get('finalCta.heading')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            {get('finalCta.paragraph')}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              {get('finalCta.cta_primary')} <ArrowRight size={20} />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-3 font-semibold text-white transition hover:border-white/70"
            >
              {get('finalCta.cta_secondary')}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
