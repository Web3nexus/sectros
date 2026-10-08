import { motion, useInView } from 'framer-motion';
import { useState, useRef } from 'react';
import { Calendar, Phone, MessageSquare, CheckCircle2, ArrowRight, PlayCircle, Mail, Users } from 'lucide-react';
import { useCmsContent } from '../../../hooks/useCmsContent';
import centralApi from '../../../services/centralApi';
import { Reveal, Eyebrow, ArrowIcon } from './primitives';

const businessTypes = [
  'Restaurant', 'Lounge / Bar', 'Nightclub', 'Hotel', 'Event Venue', 'Multi-location Group', 'Other',
];

const steps = [
  {
    step: '01',
    title: 'Discovery',
    description: '20-minute conversation to understand the venue, workflow and goals.',
  },
  {
    step: '02',
    title: 'Personalized Demo',
    description: 'Show Sectros around the operation’s actual needs.',
  },
  {
    step: '03',
    title: 'Your Plan',
    description: 'Recommend the appropriate features and plan.',
  },
  {
    step: '04',
    title: 'Go Live',
    description: 'Help the team get set up and ready.',
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

const customers = [
  // Keep empty array - don't invent logos; only real approved logos would go here
];

function AccordionItem({ item, i, open, onOpen }) {
  const isOpen = open === i;
  return (
    <div className="border-b border-[color:var(--sp-line)] last:border-b-0">
      <button type="button" onClick={() => onOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="group flex w-full items-start gap-4 px-6 py-5 text-left">
        <span className="sp-num mt-0.5 text-[12px] tracking-[0.14em] text-[color:var(--sp-green)]">{String(i + 1).padStart(2, '0')}</span>
        <div className="flex-1 pr-4">
          <h3 className="text-[16px] font-semibold leading-snug text-[color:var(--sp-ink)] group-hover:text-[color:var(--sp-green-600)]">{item.q}</h3>
        </div>
        <div className={`mt-1 h-5 w-5 flex items-center justify-center rounded-full border border-[color:var(--sp-line)] flex-shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
          <svg width="10" height="10" viewBox="0 0 12 12">
            <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="pb-6 px-6 pl-[calc(12px+24px+1rem+24px)] text-[15px] leading-[1.75] text-[color:var(--sp-text-2)]">{item.a}</div>
      </motion.div>
    </div>
  );
}

export default function PremiumContact() {
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
  const [openFaq, setOpenFaq] = useState(0);

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
      setError(err.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const timelineRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: '-10% 0px -10% 0px' });

  if (submitted) {
    return (
      <div className="sp-root flex min-h-screen items-center justify-center bg-[color:var(--sp-paper)]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center px-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--sp-mint)] border border-[rgba(18,121,76,0.18)]">
            <CheckCircle2 size={32} className="text-[color:var(--sp-green)]" />
          </div>
          <h2 className="sp-h2 mt-6 text-[color:var(--sp-ink)]">{get('thankYou.heading', 'Thanks for reaching out')}</h2>
          <p className="sp-body mt-4">{get('thankYou.paragraph', "We'll get back to you within 24 hours to schedule your demo.")}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="sp-root bg-[color:var(--sp-paper)]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[color:var(--sp-line)]">
        <div className="sp-hero-bg" />
        <div className="sp-container relative pt-20 pb-14 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 items-start">
            <div>
              <Reveal>
                <Eyebrow>Let’s talk</Eyebrow>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="sp-display sp-h1 mt-6 max-w-[14ch] text-[color:var(--sp-ink)]">
                  Let’s talk about your <em>operation.</em>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="sp-lead mt-6 max-w-[520px]">
                  Tell us about your business and what you’re trying to improve. We’ll show you how Sectros can fit the way your team actually works.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <p className="mt-6 text-[15px] text-[color:var(--sp-text-2)] max-w-[420px]">
                  No pressure. No generic sales pitch. Just a conversation about your operation.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.12}>
              <div className="relative">
                <div className="overflow-hidden rounded-[24px] border border-[color:var(--sp-line)] shadow-[var(--sp-shadow-md)]">
                  <img
                    src="/premium/guest-experience.jpg"
                    alt="Restaurant manager using a tablet in a modern restaurant"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="sp-bg-white border-b border-[color:var(--sp-line)] py-16 md:py-20">
        <div className="sp-container">
          <div className="mx-auto max-w-[720px]">
            <Reveal>
              <h2 className="sp-h2 text-[color:var(--sp-ink)] text-center">Book a demo</h2>
              <p className="sp-body mt-4 text-center max-w-[520px] mx-auto">Tell us about your venue and we’ll get back to you within 24 hours.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <form id="contact-form" onSubmit={handleSubmit} className="mt-10 rounded-[24px] border border-[color:var(--sp-line)] bg-white p-6 shadow-[var(--sp-shadow-sm)] sm:p-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[14px] font-medium text-[color:var(--sp-ink)]">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      className="sp-input-light w-full rounded-full px-5"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[color:var(--sp-ink)]">Work Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="name@venue.com"
                      className="sp-input-light w-full rounded-full px-5"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[color:var(--sp-ink)]">Business Name</label>
                    <input
                      type="text"
                      name="business"
                      value={form.business}
                      onChange={handleChange}
                      required
                      placeholder="Your venue name"
                      className="sp-input-light w-full rounded-full px-5"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[color:var(--sp-ink)]">Business Type</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      className="sp-input-light w-full rounded-full px-5 appearance-none"
                    >
                      <option value="">Select type</option>
                      {businessTypes.map((bt) => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[color:var(--sp-ink)]">Number of Locations</label>
                    <select
                      name="locations"
                      value={form.locations}
                      onChange={handleChange}
                      required
                      className="sp-input-light w-full rounded-full px-5 appearance-none"
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, '6-10', '11-25', '26+'].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[14px] font-medium text-[color:var(--sp-ink)]">What would you like to improve?</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us about your current setup and goals..."
                      className="sp-input-light w-full min-h-[140px] rounded-[18px] px-5 py-4 resize-y"
                    />
                  </div>
                </div>
                {error && (
                  <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-[13.5px] text-rose-700">
                    {error}
                  </div>
                )}
                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="sp-btn sp-btn-primary sp-btn-lg"
                  >
                    {loading ? 'Submitting...' : <>Book a demo <ArrowIcon /></>}
                  </button>
                </div>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trust */}
      {customers.length > 0 && (
        <section className="sp-bg-paper border-b border-[color:var(--sp-line)] py-10">
          <div className="sp-container">
            <Reveal className="text-center">
              <Eyebrow>Trusted by hospitality teams</Eyebrow>
            </Reveal>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-70">
              {customers.map((c) => (
                <div key={c} className="text-[14px] font-medium text-[color:var(--sp-text-2)]">{c}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="sp-bg-white border-b border-[color:var(--sp-line)] py-16 md:py-20">
        <div className="sp-container">
          <Reveal className="max-w-[620px]">
            <h2 className="sp-h2 text-[color:var(--sp-ink)]">What happens next</h2>
            <p className="sp-body mt-4">A simple, straightforward process from first conversation to going live.</p>
          </Reveal>
          <div ref={timelineRef} className="mt-12 grid gap-8 lg:grid-cols-[1fr_2px_1fr] lg:gap-12">
            <div className="hidden lg:block" />
            <div className="relative hidden lg:block">
              <div className="h-full w-px bg-[color:var(--sp-line)]" />
              <motion.div
                className="absolute inset-x-0 top-0 w-px bg-[color:var(--sp-green)] origin-top"
                initial={{ scaleY: 0 }}
                animate={timelineInView ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="space-y-10">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={timelineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-[20px] border border-[color:var(--sp-line)] bg-white p-6 shadow-[var(--sp-shadow-sm)] lg:ml-6"
                >
                  <div className="flex items-start gap-4">
                    <span className="sp-num text-[12px] tracking-[0.14em] text-[color:var(--sp-green)]">{s.step}</span>
                    <div>
                      <h3 className="text-[18px] font-semibold text-[color:var(--sp-ink)]">{s.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--sp-text-2)]">{s.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sp-bg-white border-b border-[color:var(--sp-line)] py-16 md:py-20">
        <div className="sp-container">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <h2 className="sp-h2 text-[color:var(--sp-ink)]">Frequently asked questions</h2>
              <p className="sp-body mt-4 max-w-[420px]">Common questions about booking a demo and getting started with Sectros.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-[20px] border border-[color:var(--sp-line)] bg-white shadow-[var(--sp-shadow-sm)]">
                {faqs.map((f, i) => (
                  <AccordionItem key={f.q} item={f} i={i} open={openFaq} onOpen={setOpenFaq} />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="sp-section-lg">
        <div className="sp-container">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] p-8 sm:p-12 lg:p-16" style={{ background: 'var(--sp-green-600)' }}>
              <div className="sp-noise-dark" />
              <div className="relative z-10 max-w-[720px]">
                <h2 className="sp-display sp-h2 text-white">Ready to see Sectros in action?</h2>
                <p className="sp-lead mt-4 max-w-[520px] text-white/80">Book a personalized demo and see how Sectros can fit your operation.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#contact-form" className="sp-btn sp-btn-light sp-btn-lg">Book a Demo <ArrowIcon /></a>
                  <a href="/features" className="sp-btn sp-btn-ghost-dark sp-btn-lg">Watch overview <ArrowIcon /></a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
