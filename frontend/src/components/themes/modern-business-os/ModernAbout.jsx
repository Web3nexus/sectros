import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCmsContent } from '../../../hooks/useCmsContent';
import {Heart, RefreshCw, ShieldCheck, Lightbulb, Users, Target, ArrowRight, Quote, Briefcase, Zap, Layers, Compass, } from 'lucide-react';

const philosophyCards = [
  {
    icon: Zap,
    title: 'Simplicity',
    description: 'Every feature is designed to be intuitive. If it takes more than two clicks, we rethink it. Hospitality teams are busy — our software stays out of the way.',
  },
  {
    icon: ShieldCheck,
    title: 'Reliability',
    description: 'Mission-critical operations need rock-solid infrastructure. Our platform delivers 99.99% uptime with real-time sync and automatic backups across all venues.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We invest heavily in R&D to bring AI-powered forecasting, smart waitlist management, and predictive analytics to every hospitality business, regardless of size.',
  },
];

const team = [
  { name: 'Alexis Moreno', role: 'CEO & Co-Founder', initials: 'AM' },
  { name: 'James Okonkwo', role: 'CTO & Co-Founder', initials: 'JO' },
  { name: 'Priya Kapoor', role: 'VP of Product', initials: 'PK' },
  { name: 'David Chen', role: 'VP of Engineering', initials: 'DC' },
];

const values = [
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Every product decision starts with the question: how does this make our customers\' lives easier?',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Improvement',
    description: 'We ship weekly improvements. Small, frequent iterations add up to transformative change over time.',
  },
  {
    icon: Compass,
    title: 'Transparency',
    description: 'We share our roadmap openly, communicate clearly about outages, and publish our pricing with no hidden fees.',
  },
  {
    icon: Target,
    title: 'Impact',
    description: 'We measure success by real outcomes: revenue growth, time saved, and satisfaction scores for our customers.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function ModernAbout() {
  const { get } = useCmsContent('about');
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
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {get('mission.heading')}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            {get('mission.body1')}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
            {get('mission.body2')}
          </p>
        </motion.div>
      </section>

      <section className="bg-gray-50 px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Why hospitality needs better tools
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Fragmented systems</h3>
              <p className="mt-2 text-sm text-gray-500">
                The average venue uses 5+ disconnected tools. Data doesn&apos;t flow, staff wastes time re-entering information, and mistakes multiply.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Legacy interfaces</h3>
              <p className="mt-2 text-sm text-gray-500">
                Most hospitality software hasn&apos;t been redesigned in a decade. Clunky interfaces slow down staff during peak hours when every second counts.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Hidden costs</h3>
              <p className="mt-2 text-sm text-gray-500">
                Between payment processing fees, POS licensing, marketing tools, and add-ons, venues often pay 3x more than necessary for disjointed software.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">{get('philosophy.heading')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">{get('philosophy.paragraph')}</p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid gap-8 md:grid-cols-3"
          >
            {philosophyCards.map((p, i) => {
              const IconEl = p.icon;
              return (
                <motion.div
                  key={p.title}
                  variants={itemVariants}
                  className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <IconEl size={28} />
                  </div>
                  <p className="mt-6 text-2xl font-bold text-gray-900">0{i + 1}</p>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{p.description}</p>
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
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">{get('team.heading')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">{get('team.paragraph')}</p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {team.map((m) => (
              <motion.div
                key={m.name}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="rounded-2xl bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white">
                  {m.initials}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{m.name}</h3>
                <p className="text-sm text-gray-500">{m.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">{get('values.heading')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">{get('values.paragraph')}</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {values.map((v) => {
              const IconEl = v.icon;
              return (
                <motion.div
                  key={v.title}
                  variants={itemVariants}
                  className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <IconEl size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{v.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{v.description}</p>
                  </div>
                </motion.div>
              );
            })}
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
          <Briefcase size={40} className="mx-auto text-blue-200" />
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            {get('joinCta.heading')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            {get('joinCta.paragraph')}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/careers"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              {get('joinCta.cta_primary')} <ArrowRight size={20} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-3 font-semibold text-white transition hover:border-white/70"
            >
              {get('joinCta.cta_secondary')}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
