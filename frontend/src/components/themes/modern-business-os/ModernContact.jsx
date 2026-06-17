import { motion } from 'framer-motion';
import { useState } from 'react';
import {Calendar, Phone, MessageSquare, CheckCircle2, Briefcase, Quote, ArrowRight, PlayCircle, Mail, Users, } from 'lucide-react';
import { useCmsContent } from '../../../hooks/useCmsContent';
import centralApi from '../../../services/centralApi';

const businessTypes = [
  'Restaurant', 'Lounge / Bar', 'Nightclub', 'Hotel', 'Event Venue', 'Multi-location Group', 'Other',
];

const steps = [
  {
    icon: Calendar,
    step: '1',
    title: 'Discovery Call',
    description: 'A 20-minute call to understand your business, challenges, and goals. No sales pitch — just a conversation.',
  },
  {
    icon: Phone,
    step: '2',
    title: 'Personalized Demo',
    description: 'We tailor a demo to your specific use case, walking through every feature that matters to your operation.',
  },
  {
    icon: MessageSquare,
    step: '3',
    title: 'Onboarding & Setup',
    description: 'Our onboarding team gets you live in under 48 hours with data migration, staff training, and go-live support.',
  },
];

const faqs = [
  {
    q: 'How long does a demo take?',
    a: 'Most demos run 30-45 minutes. We focus on the features most relevant to your business type and size.',
  },
  {
    q: 'Is there a free trial available?',
    a: 'Yes. After your demo, we offer a 14-day free trial with full access to all features and onboarding support.',
  },
  {
    q: 'Can I bring my team to the demo?',
    a: 'Absolutely. We recommend including the people who will use the platform daily — hosts, managers, and owners.',
  },
  {
    q: 'What if I need a custom solution?',
    a: 'We offer enterprise plans with custom integrations, dedicated support, and tailored feature development.',
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

export default function ModernContact() {
  const { get } = useCmsContent('contact');
  const [form, setForm] = useState({
    name: '',
    email: '',
    business: '',
    type: '',
    locations: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await centralApi.post('public/contact-leads', {
        name: form.name,
        email: form.email,
        business: form.business,
        business_type: form.type,
        locations: form.locations,
        message: form.message,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Something went wrong. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };


  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 size={36} className="text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{get('thankYou.heading')}</h2>
          <p className="mt-4 text-gray-600">
            {get('thankYou.paragraph')}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
        <section className="px-6 py-20 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {get('hero.heading')}
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              {get('hero.paragraph')}
            </p>
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Jane Doe"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Work email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="jane@yourvenue.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Business name</label>
                <input
                  type="text"
                  name="business"
                  value={form.business}
                  onChange={handleChange}
                  required
                  placeholder="The Grand Bistro"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Business type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select type</option>
                    {businessTypes.map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Number of locations</label>
                  <select
                    name="locations"
                    value={form.locations}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5, '6-10', '11-25', '26+'].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tell us about your needs
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="What are the biggest challenges you're facing? What features are most important to you?"
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-white shadow-lg transition ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Submitting...' : 'Book demo'} <ArrowRight size={20} />
              </motion.button>
            </form>
          </motion.div>
        </section>

        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-20 text-white sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex h-full flex-col justify-center"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <Quote size={32} className="text-blue-200" />
              <p className="mt-4 text-lg leading-relaxed text-blue-50">
                {get('rightPanel.testimonial_quote')}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400 text-sm font-bold text-white">
                  {(() => { const n = get('rightPanel.testimonial_author', 'Sofia Kim, Owner, Harbor House Restaurant').split(', ')[0]; return n.split(' ').map(w => w[0]).join(''); })()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{get('rightPanel.testimonial_author', 'Sofia Kim, Owner, Harbor House Restaurant').split(', ')[0]}</p>
                  <p className="text-xs text-blue-200">{get('rightPanel.testimonial_author', 'Sofia Kim, Owner, Harbor House Restaurant').split(', ').slice(1).join(', ')}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Briefcase key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <h3 className="text-xl font-bold">{get('rightPanel.heading')}</h3>
              <div className="space-y-4">
                {get('rightPanel.bullets', 'See features tailored to your venue type\nLive walkthrough with a product expert\nGet a custom pricing quote with no obligation').split('\n').map((text, i) => {
                  const icons = [Users, PlayCircle, Mail];
                  const IconEl = icons[i] || Users;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                        <IconEl size={18} />
                      </div>
                      <p className="pt-1.5 text-sm text-blue-50">{text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      <section className="px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl"
        >
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            {get('steps.heading')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">
            {get('steps.paragraph')}
          </p>
          <div className="relative mt-16">
            <div className="absolute left-[39px] top-0 hidden h-full w-0.5 bg-blue-100 md:block" />
            <div className="space-y-12 md:space-y-0">
              {steps.map((s, i) => {
                const IconEl = s.icon;
                return (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative flex flex-col gap-6 md:flex-row"
                  >
                    <div className="relative z-10 flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                      <IconEl size={32} />
                    </div>
                    <div className="flex-1 pb-12 md:pt-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                        Step {s.step}
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-gray-900">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-gray-50 px-6 py-20 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <div className="relative rounded-2xl bg-white p-8 shadow-sm sm:p-12">
            <Quote size={36} className="text-blue-100" />
            <blockquote className="mt-4 text-xl leading-relaxed text-gray-700 sm:text-2xl">
              {get('testimonial.quote')}
            </blockquote>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-bold text-white">
                {(() => { const n = get('testimonial.author', 'Marcus Rivera, COO, Rivera Hospitality Group').split(', ')[0]; return n.split(' ').map(w => w[0]).join(''); })()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{get('testimonial.author', 'Marcus Rivera, COO, Rivera Hospitality Group').split(', ')[0]}</p>
                <p className="text-sm text-gray-500">{get('testimonial.author', 'Marcus Rivera, COO, Rivera Hospitality Group').split(', ').slice(1).join(', ')}</p>
              </div>
            </div>
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
              <details key={i} className="group overflow-hidden rounded-xl border border-gray-100">
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-left font-medium text-gray-900 transition hover:bg-gray-50">
                  {faq.q}
                  <ArrowRight
                    size={18}
                    className="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-90"
                  />
                </summary>
                <div className="border-t border-gray-100 px-6 py-4 text-sm leading-relaxed text-gray-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-20 text-center text-white sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl"
        >
          <Briefcase size={40} className="mx-auto text-blue-200" />
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            {get('finalCta.heading')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            {get('finalCta.paragraph')}
          </p>
          <a
            href="#"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
          >
            <PlayCircle size={20} />
            {get('finalCta.button')}
          </a>
        </motion.div>
      </section>
    </div>
  );
}
