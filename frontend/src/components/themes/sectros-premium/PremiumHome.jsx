import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import {
  CalendarDays,
  Armchair,
  UtensilsCrossed,
  BarChart3,
  ArrowRight,
  Check,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  Sparkles,
  Clock,
  Users,
  Bell,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Play,
  TrendingUp,
} from 'lucide-react';
import {
  Reveal,
  RevealGroup,
  RevealItem,
  Parallax,
  CountUp,
  Eyebrow,
  ArrowIcon,
  CheckItem,
  BrowserFrame,
  SectionHeader,
  EASE,
} from './primitives';
import {
  HeroDashboard,
  ReservationsUI,
  TablesUI,
  MenuUI,
  AnalyticsUI,
  CtaDevices,
} from './mockups';
import centralApi from '../../../services/centralApi';
import { normalizePlans, formatPlanPrice, defaultPlans } from '../../../utils/planFeatures';

/* ─── Client Brand Logos ─────────────────────────────────────────────────── */
const CLIENT_LOGOS = [
  { name: 'EL SANTO', sub: 'Pizzeria & Steakhouse' },
  { name: 'LA MARINA', sub: 'BEACH CLUB' },
  { name: 'Bistro 21', sub: '' },
  { name: 'COSTA GRILL', sub: '' },
  { name: 'SUNSET LOUNGE', sub: '' },
  { name: 'The Harbor', sub: '' },
];

/* ─── Integrations Logos ─────────────────────────────────────────────────── */
const INTEGRATIONS = [
  { name: 'stripe', color: '#635BFF', font: 'font-bold tracking-tight lowercase' },
  { name: 'Square', color: '#000000', font: 'font-semibold tracking-tight' },
  { name: 'lightspeed', color: '#E11900', font: 'font-extrabold tracking-tighter' },
  { name: 'thefork', color: '#00594C', font: 'font-black tracking-tight lowercase' },
  { name: 'mailchimp', color: '#FFE01B', font: 'font-extrabold tracking-tight italic' },
  { name: 'Google', color: '#4285F4', font: 'font-medium tracking-normal' },
];

/* ─── Testimonials Data ──────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote:
      'Sectros has completely changed the way we manage our restaurant. We save hours every week and our guests love the experience.',
    author: 'Marco Bianchi',
    role: 'Owner, El Santo',
    avatar: 'MB',
  },
  {
    quote:
      'The online reservations and table management are game changers. Our no-show rate has dropped significantly.',
    author: 'Laura Martinez',
    role: 'Manager, La Marina',
    avatar: 'LM',
  },
  {
    quote:
      'Great support and an easy-to-use platform. Highly recommended for any restaurant or bar.',
    author: 'James Carter',
    role: 'Owner, Bistro 21',
    avatar: 'JC',
  },
];

/* ─── Pricing Defaults ───────────────────────────────────────────────────── */
const DEFAULT_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    subtitle: 'Perfect for small venues',
    monthly: 49,
    yearly: 39,
    popular: false,
    features: [
      'Reservations & walk-ins',
      'Table management',
      'Menu & orders',
      'Basic analytics',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'For growing restaurants',
    monthly: 99,
    yearly: 79,
    popular: true,
    features: [
      'Everything in Starter',
      'Advanced analytics',
      'Automation tools',
      'Staff management',
      'Priority support',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    subtitle: 'For multi-location groups',
    monthly: 199,
    yearly: 159,
    popular: false,
    features: [
      'Everything in Pro',
      'Multi-location management',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 support',
    ],
  },
];

/* ─── FAQ Items ──────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: 'Is there a free trial?',
    a: 'Yes, we offer a 14-day free trial on all plans with full platform access. No credit card is required to sign up and get started.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), SEPA direct debit, and wire transfers for annual plans.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. There are no long-term contracts for monthly subscriptions. You can upgrade, downgrade, or cancel your plan at any time from your billing dashboard.',
  },
  {
    q: 'Do you offer onboarding support?',
    a: 'Yes. Every customer receives access to our guided onboarding flow, video tutorials, and dedicated setup support. Pro and Business tiers include 1-on-1 white-glove onboarding.',
  },
  {
    q: 'Do you support multiple locations?',
    a: 'Yes. Our Business plan and franchise tools allow you to centrally oversee menus, tables, staff schedules, and consolidate reporting across unlimited branches.',
  },
  {
    q: 'Can I import my existing data?',
    a: 'Yes, you can easily import guest lists, reservation histories, and menus via CSV. Our onboarding specialists can also migrate data from your previous provider.',
  },
];

/* ── AUTOMATION WORKFLOW VISUAL (LOOPING AUTOMATION ENGINE) ─────────────── */
function AutomationWorkflowVisual() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.35 });
  const reducedMotion = useReducedMotion();

  const [activeStep, setActiveStep] = useState(0);
  const [lineProgress, setLineProgress] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const STEPS = [
    {
      id: 'booking',
      icon: CalendarDays,
      label: 'Booking',
      title: 'Booking Confirmed',
      time: 'Triggered',
      message: "Sarah's table for 2 is confirmed for 19:00 at El Santo.",
    },
    {
      id: 'notify',
      icon: MessageSquare,
      label: 'Notify',
      title: 'Guest notified',
      time: 'Instant SMS',
      message: 'Hi Sarah, your reservation is confirmed. We look forward to seeing you!',
    },
    {
      id: 'remind',
      icon: Bell,
      label: 'Remind',
      title: 'Booking Reminder',
      time: '24h before',
      message: 'Hi Sarah, this is a reminder for your reservation at El Santo tomorrow at 19:00.',
    },
    {
      id: 'seated',
      icon: Users,
      label: 'Seated',
      title: 'Guest seated',
      time: 'Live status',
      message: 'Sarah has arrived. Table 5 is now marked seated.',
    },
  ];

  useEffect(() => {
    if (reducedMotion) {
      setActiveStep(3);
      setLineProgress(100);
      return;
    }

    if (!inView) {
      return;
    }

    const timeouts = [];
    const schedule = (fn, ms) => {
      const id = setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    };

    const runSequence = () => {
      // Stage 1: Initial state (Booking active, others inactive, line at 0%)
      setActiveStep(0);
      setLineProgress(0);
      setIsResetting(false);

      // Hold initial state for 1.7s, then animate progress line Booking -> Notify
      schedule(() => {
        setLineProgress(33.333);

        // Progress line animation takes 750ms. When line arrives at Notify:
        schedule(() => {
          // Stage 2: Activate Notify & update notification to "Guest notified"
          setActiveStep(1);

          // Hold for 1.7s, then animate line Notify -> Remind
          schedule(() => {
            setLineProgress(66.666);

            // Progress line animation takes 750ms. When line arrives at Remind:
            schedule(() => {
              // Stage 3: Activate Remind & update notification to "Booking Reminder"
              setActiveStep(2);

              // Hold for 1.7s, then animate line Remind -> Seated
              schedule(() => {
                setLineProgress(100);

                // Progress line animation takes 750ms. When line arrives at Seated:
                schedule(() => {
                  // Stage 4: Activate Seated & update notification to "Guest seated"
                  setActiveStep(3);

                  // Hold completed state briefly (2.2s)
                  schedule(() => {
                    // Reset smoothly and repeat sequence
                    setIsResetting(true);
                    setLineProgress(0);
                    setActiveStep(0);

                    schedule(() => {
                      setIsResetting(false);
                      runSequence();
                    }, 400);
                  }, 2200);
                }, 750);
              }, 1700);
            }, 750);
          }, 1700);
        }, 750);
      }, 1700);
    };

    runSequence();

    return () => {
      timeouts.forEach((id) => clearTimeout(id));
    };
  }, [inView, reducedMotion]);

  const CurrentIcon = STEPS[activeStep].icon;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Notification card with subtle crossfade & 6px vertical translation */}
      <div className="sp-card p-5 max-w-[440px] ml-auto shadow-md relative overflow-hidden bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.36, ease: EASE }}
            className="flex items-start gap-3.5"
          >
            <div className="w-9 h-9 rounded-xl bg-[color:var(--sp-mint)] text-[color:var(--sp-green)] flex items-center justify-center shrink-0 border border-[rgba(18,121,76,0.12)]">
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[color:var(--sp-ink)]">
                  {STEPS[activeStep].title}
                </span>
                <span className="text-[11px] font-medium text-[color:var(--sp-text-3)]">
                  {STEPS[activeStep].time}
                </span>
              </div>
              <p className="text-[12.5px] text-[color:var(--sp-text-2)] mt-1 leading-relaxed">
                {STEPS[activeStep].message}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Connected Workflow Nodes */}
      <div className="sp-card p-6 max-w-[440px] ml-auto bg-white">
        <div className="flex items-center justify-between relative px-2">
          {/* Inactive background track line */}
          <div className="absolute top-5 left-7 right-7 h-[2px] bg-[color:var(--sp-line-2)] -translate-y-1/2 z-0" />

          {/* Active Sectros-green animated progress line */}
          <div
            className="absolute top-5 left-7 h-[2px] bg-[color:var(--sp-green)] -translate-y-1/2 z-0 pointer-events-none"
            style={{
              width: `calc((100% - 56px) * (${lineProgress} / 100))`,
              transition: isResetting
                ? 'opacity 0.25s ease, width 0.25s ease'
                : 'width 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
              opacity: isResetting ? 0 : 1,
            }}
          />

          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === idx;
            const isPassed = activeStep > idx;
            const isActive = isCurrent || isPassed;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-350 ${
                    isCurrent
                      ? 'bg-[color:var(--sp-mint)] border-2 border-[color:var(--sp-green)] text-[color:var(--sp-green)] ring-4 ring-[rgba(18,121,76,0.18)] shadow-sm'
                      : isPassed
                      ? 'bg-[color:var(--sp-mint)] border-2 border-[color:var(--sp-green)] text-[color:var(--sp-green)]'
                      : 'bg-white border border-[color:var(--sp-line-2)] text-[color:var(--sp-text-3)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10.5px] transition-colors duration-300 ${
                    isActive
                      ? 'font-semibold text-[color:var(--sp-ink)]'
                      : 'font-medium text-[color:var(--sp-text-3)]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PremiumHome() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [plans, setPlans] = useState(() => normalizePlans(defaultPlans));

  // Fetch real plans from backend if available
  useEffect(() => {
    centralApi
      .get('saas/plans')
      .then((res) => {
        const normalized = normalizePlans(res.data);
        if (normalized.length > 0) {
          setPlans(normalized);
        }
      })
      .catch(() => {
        // Fall back to clean defaults
      });
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="sp-root overflow-hidden selection:bg-[rgba(18,121,76,0.18)]">
      {/* ──────────────────────────────────────────────────────────────────
          1. HERO SECTION (EDITORIAL ASYMMETRIC TWO-COLUMN)
          Matches Sectros brand & messaging:
          "The Operating System for Modern Hospitality."
          - Left column (~46%): Eyebrow, editorial display headline (left aligned),
            concise subtitle, primary/secondary CTAs, subtle trust points.
          - Right column (~54%): Large rounded cinematic visual (video placeholder),
            live preview indicator, and 3 integrated Sectros micro-UI overlays.
      ────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-20 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#f8f6f1] via-[#fbfaf7] to-[#ffffff]">
        <div className="sp-hero-bg" />
        <div className="sp-grid-lines" />

        <div className="sp-container relative z-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-12 lg:gap-10 xl:gap-14">
            {/* ── LEFT COLUMN (~46% on desktop) ── */}
            <div className="w-full lg:w-[46%] xl:w-[45%] shrink-0 flex flex-col justify-center text-left">
              {/* Editorial Eyebrow */}
              <Reveal y={12} duration={0.6}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--sp-mint)] border border-[rgba(18,121,76,0.18)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[color:var(--sp-green)] shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--sp-green)] animate-pulse" />
                  All-in-One Hospitality Platform
                </div>
              </Reveal>

              {/* Main Headline (Editorial Serif, Left Aligned, Newsreader) */}
              <Reveal y={20} delay={0.1} duration={0.8}>
                <h1 className="sp-display mt-6 text-[color:var(--sp-ink)] text-[44px] sm:text-[54px] lg:text-[62px] xl:text-[68px] leading-[1.02] tracking-[-0.03em]">
                  The Operating System <br />
                  for <span className="sp-em italic font-normal text-[color:var(--sp-green)]">Modern Hospitality.</span>
                </h1>
              </Reveal>

              {/* Concise Subtitle */}
              <Reveal y={18} delay={0.2} duration={0.8}>
                <p className="sp-lead mt-6 text-[color:var(--sp-text-2)] text-base sm:text-lg lg:text-[1.125rem] leading-[1.58] max-w-[490px]">
                  Manage reservations, walk-ins, tables, staff, menus, payments and analytics — all in one powerful platform.
                </p>
              </Reveal>

              {/* Two CTA Buttons */}
              <Reveal y={16} delay={0.3} duration={0.8}>
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Link to="/register" className="sp-btn sp-btn-primary sp-btn-lg shadow-sm hover:shadow-md">
                    Get Started Free <ArrowIcon />
                  </Link>
                  <Link to="/contact" className="sp-btn sp-btn-secondary sp-btn-lg">
                    Book a Demo
                  </Link>
                </div>
              </Reveal>

              {/* Subtle Trust Indicators */}
              <Reveal y={14} delay={0.4} duration={0.8}>
                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] sm:text-[12.5px] text-[color:var(--sp-text-3)] font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[color:var(--sp-green)] stroke-[2.5]" />
                    No credit card required
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[color:var(--sp-green)] stroke-[2.5]" />
                    Easy setup
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[color:var(--sp-green)] stroke-[2.5]" />
                    Trusted by 1000+ businesses
                  </span>
                </div>
              </Reveal>
            </div>

            {/* ── RIGHT COLUMN (~54% on desktop) ── */}
            <div className="w-full lg:w-[54%] xl:w-[55%] relative flex items-center">
              {/* Subtle atmospheric ambient glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[rgba(18,121,76,0.14)] via-[rgba(18,121,76,0.04)] to-transparent rounded-[36px] blur-2xl -z-10 pointer-events-none" />

              <Reveal y={24} delay={0.25} duration={0.85} className="w-full relative">
                {/* Main cinematic visual container (Video Placeholder) */}
                <div className="relative w-full h-[420px] sm:h-[490px] lg:h-[550px] xl:h-[590px] rounded-[28px] sm:rounded-[32px] overflow-hidden border border-[rgba(12,26,21,0.09)] shadow-[0_24px_60px_-16px_rgba(12,26,21,0.18)] bg-[color:var(--sp-ink)] group">
                  <img
                    src="/premium/hero-hospitality-video.jpg"
                    alt="Sectros hospitality operations in an upscale dining room"
                    className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.02] transform transition-transform duration-700 group-hover:scale-[1.02]"
                  />

                  {/* Atmospheric gradient vignettes */}
                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 via-black/15 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[color:var(--sp-ink)]/75 via-[color:var(--sp-ink)]/20 to-transparent pointer-events-none" />

                  {/* Top-left video badge indicator */}
                  <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(12,26,21,0.7)] backdrop-blur-md border border-[rgba(255,255,255,0.16)] text-white text-[11px] font-medium tracking-wide shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>0:24</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/90">Live Service Preview</span>
                  </div>

                  {/* Top-right subtle video action badge */}
                  <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(12,26,21,0.7)] backdrop-blur-md border border-[rgba(255,255,255,0.16)] text-white/90 text-[11px] font-medium tracking-wide shadow-md">
                    <Play className="w-2.5 h-2.5 fill-white text-white" />
                    <span>Hospitality in Motion</span>
                  </div>

                  {/* Card 2: Table 5 Ready (anchored inside bottom-left) */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
                    className="absolute bottom-5 left-4 sm:bottom-6 sm:left-6 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[rgba(12,26,21,0.08)] shadow-[0_16px_36px_-10px_rgba(12,26,21,0.22)]"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[color:var(--sp-mint)] text-[color:var(--sp-green)] flex items-center justify-center shrink-0 border border-[rgba(18,121,76,0.14)] font-bold text-xs tracking-tight">
                      T5
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--sp-green)]" />
                        <span className="text-[12.5px] font-semibold text-[color:var(--sp-ink)]">Table 5 ready</span>
                      </div>
                      <div className="text-[11px] text-[color:var(--sp-text-2)] font-medium">
                        Terrace <span className="text-[color:var(--sp-text-3)] font-normal">·</span> 2 guests
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Card 1: New Reservation (overlapping top-right boundary) */}
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
                  className="absolute -top-4 right-3 sm:-top-5 sm:right-6 z-30 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[rgba(12,26,21,0.08)] shadow-[0_18px_40px_-12px_rgba(12,26,21,0.2)]"
                >
                  <div className="w-8 h-8 rounded-full bg-[color:var(--sp-mint)] text-[color:var(--sp-green)] flex items-center justify-center shrink-0 border border-[rgba(18,121,76,0.18)]">
                    <Check className="w-4 h-4 text-[color:var(--sp-green)] stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--sp-text-3)]">
                      New Reservation
                    </div>
                    <div className="text-[13px] font-semibold text-[color:var(--sp-ink)]">
                      2 guests <span className="text-[color:var(--sp-text-3)] font-normal">·</span> 19:30
                    </div>
                  </div>
                </motion.div>

                {/* Card 3: Today's Revenue (overlapping bottom-right boundary) */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.7, ease: EASE }}
                  className="absolute -bottom-4 right-3 sm:-bottom-5 sm:right-6 z-30 px-4 py-3 rounded-2xl bg-[color:var(--sp-ink)] text-white border border-white/10 shadow-[0_22px_45px_-12px_rgba(12,26,21,0.45)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">Today's Revenue</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                      <TrendingUp className="w-3 h-3" /> 12%
                    </span>
                  </div>
                  <div className="text-[17px] sm:text-[18px] font-semibold tracking-tight text-white mt-1">
                    €12,420<span className="text-white/40 text-xs font-normal">.00</span>
                  </div>
                </motion.div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          2. SOCIAL PROOF / LOGO BAR
          "TRUSTED BY RESTAURANTS, HOTELS, CAFÉS AND BARS ACROSS EUROPE"
      ────────────────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-[#ffffff] border-y border-[color:var(--sp-line)]">
        <div className="sp-container">
          <p className="text-center text-[11px] font-semibold tracking-[0.16em] uppercase text-[color:var(--sp-text-3)] mb-8">
            Trusted by restaurants, hotels, cafés and bars across Europe
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center opacity-85">
            {CLIENT_LOGOS.map((logo) => (
              <div key={logo.name} className="flex flex-col items-center justify-center text-center px-4 py-2 hover:opacity-100 transition-opacity">
                <span className="sp-display text-lg md:text-xl font-medium tracking-tight text-[color:var(--sp-ink)]">
                  {logo.name}
                </span>
                {logo.sub && (
                  <span className="text-[9px] font-semibold tracking-wider text-[color:var(--sp-text-3)] uppercase mt-0.5">
                    {logo.sub}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          3. THE CHALLENGE (DARK CONTRAST SECTION)
          "Running a restaurant is complex."
          Preserves metrics: 30%, 20+, Higher
          Photo with floating interactive event overlays
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg sp-bg-ink relative overflow-hidden">
        <div className="sp-noise-dark" />
        <div className="sp-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold tracking-[0.14em] uppercase text-[color:var(--sp-green-300)] mb-4">
                  The Challenge
                </div>
                <h2 className="sp-display sp-h2 text-white mt-2">
                  Running a restaurant <br />
                  <span className="sp-em italic text-[color:var(--sp-green-300)]">is complex.</span>
                </h2>
                <p className="sp-lead text-white/70 mt-6 max-w-[480px]">
                  Manual bookings, messy walk-ins, staff coordination, no-shows and unclear data make it hard to grow.
                </p>
                <div className="mt-8">
                  <Link to="/features" className="sp-btn sp-btn-primary sp-btn-md">
                    See How Sectros Helps <ArrowIcon />
                  </Link>
                </div>
              </Reveal>

              {/* Metrics strip */}
              <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-3 gap-6">
                <div>
                  <div className="sp-display sp-num text-3xl md:text-4xl text-white font-medium">
                    <CountUp to={30} suffix="%" />
                  </div>
                  <div className="text-[12px] text-white/60 mt-1 leading-snug">
                    of bookings are lost due to manual processes
                  </div>
                </div>
                <div>
                  <div className="sp-display sp-num text-3xl md:text-4xl text-white font-medium">
                    <CountUp to={20} suffix="+" />
                  </div>
                  <div className="text-[12px] text-white/60 mt-1 leading-snug">
                    hours per week spent on repetitive tasks
                  </div>
                </div>
                <div>
                  <div className="sp-display sp-num text-3xl md:text-4xl text-white font-medium">
                    Higher
                  </div>
                  <div className="text-[12px] text-white/60 mt-1 leading-snug">
                    customer satisfaction with digital operations
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual: Warm Photography with Floating Real-Time Event Cards */}
            <div className="relative">
              <Parallax distance={14}>
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src="/premium/challenge-service.jpg"
                    alt="Restaurant evening service manager with tablet"
                    className="w-full h-[460px] md:h-[520px] object-cover filter brightness-95"
                  />
                  {/* Subtle vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--sp-ink)]/80 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Chips communicating functionality */}
                  <div className="absolute top-8 left-6 right-6 flex flex-col gap-3 pointer-events-none">
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
                      className="sp-float-dark p-3.5 flex items-center gap-3 max-w-[260px]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[color:var(--sp-green)] text-white flex items-center justify-center shrink-0">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold">New reservation</div>
                        <div className="text-[11px] text-white/70">2 people · 19:00</div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
                      className="sp-float-dark p-3.5 flex items-center gap-3 max-w-[240px] ml-4"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                        <Armchair className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold">Walk-in</div>
                        <div className="text-[11px] text-white/70">Table 4</div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
                      className="sp-float-dark p-3.5 flex items-center gap-3 max-w-[260px] bg-red-950/60 border-red-500/30"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-red-200">No-show risk</div>
                        <div className="text-[11px] text-red-300/80">Call guest?</div>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.65, duration: 0.6, ease: EASE }}
                    className="absolute bottom-6 right-6 sp-float-dark p-3 px-4 flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-[color:var(--sp-green)] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[12px] font-medium">Table ready · Table 4</div>
                  </motion.div>
                </div>
              </Parallax>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          4. THE SOLUTION (4-CARD PRODUCT GRID)
          "Everything you need to run your venue, seamlessly."
          Reservations, Tables, Menu, Analytics
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg sp-bg-paper">
        <div className="sp-container">
          <SectionHeader
            eyebrow="The Solution"
            title={
              <>
                Everything you need to run <br className="hidden sm:inline" />
                your venue, <span className="sp-em italic">seamlessly.</span>
              </>
            }
            lead="From reservations to payments, Sectros gives you the tools to deliver a better guest experience and grow your business."
            action={
              <Link to="/features" className="sp-btn sp-btn-secondary sp-btn-md">
                View all features <ArrowIcon />
              </Link>
            }
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Reservations (Entrance 0ms, subtle 10px translate + opacity) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0, ease: EASE }}
              className="sp-card sp-card-hover p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="sp-icon-chip">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <Link to="/features" className="text-[color:var(--sp-text-3)] hover:text-[color:var(--sp-green)] transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <h3 className="sp-h4 text-[color:var(--sp-ink)]">Reservations & Walk-ins</h3>
                <p className="text-[13px] text-[color:var(--sp-text-2)] mt-1.5 leading-relaxed">
                  Manage online bookings and walk-ins in real time.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[color:var(--sp-line)]">
                <ReservationsUI />
              </div>
            </motion.div>

            {/* Card 2: Table Management (Entrance 100ms, subtle 10px translate + opacity) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className="sp-card sp-card-hover p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="sp-icon-chip">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <Link to="/features" className="text-[color:var(--sp-text-3)] hover:text-[color:var(--sp-green)] transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <h3 className="sp-h4 text-[color:var(--sp-ink)]">Table Management</h3>
                <p className="text-[13px] text-[color:var(--sp-text-2)] mt-1.5 leading-relaxed">
                  Visual floor plan and real-time table status.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[color:var(--sp-line)]">
                <TablesUI />
              </div>
            </motion.div>

            {/* Card 3: Menu & Orders (Entrance 200ms, subtle 10px translate + opacity) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
              className="sp-card sp-card-hover p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="sp-icon-chip">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <Link to="/features" className="text-[color:var(--sp-text-3)] hover:text-[color:var(--sp-green)] transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <h3 className="sp-h4 text-[color:var(--sp-ink)]">Menu & Orders</h3>
                <p className="text-[13px] text-[color:var(--sp-text-2)] mt-1.5 leading-relaxed">
                  Digital menu, kitchen flow and order management.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[color:var(--sp-line)]">
                <MenuUI />
              </div>
            </motion.div>

            {/* Card 4: Analytics & Reports (Entrance 300ms, subtle 10px translate + opacity) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.3, ease: EASE }}
              className="sp-card sp-card-hover p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="sp-icon-chip">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <Link to="/features" className="text-[color:var(--sp-text-3)] hover:text-[color:var(--sp-green)] transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <h3 className="sp-h4 text-[color:var(--sp-ink)]">Analytics & Reports</h3>
                <p className="text-[13px] text-[color:var(--sp-text-2)] mt-1.5 leading-relaxed">
                  Understand your business and make better decisions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[color:var(--sp-line)]">
                <AnalyticsUI />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          5. FEATURE DEEP DIVE 1: GUEST EXPERIENCE
          "Delight your guests from booking to bill."
          Editorial presentation + Photography with wine glass & tablet UI
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg sp-bg-white border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Visual */}
            <div className="relative order-2 lg:order-1">
              <Parallax distance={16}>
                <div className="relative rounded-2xl overflow-hidden border border-[color:var(--sp-line)] shadow-xl">
                  <img
                    src="/premium/guest-experience.jpg"
                    alt="Guest dining experience with wine and digital tablet"
                    className="w-full h-[440px] md:h-[500px] object-cover"
                  />
                  {/* Floating interactive chips */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
                    className="absolute top-8 left-8 sp-float p-3.5 px-4 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[color:var(--sp-mint)] text-[color:var(--sp-green)] flex items-center justify-center">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-[color:var(--sp-ink)]">Online Reservation</div>
                      <div className="text-[11px] text-[color:var(--sp-text-3)]">2 people · 19:30</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
                    className="absolute bottom-8 left-8 sp-float p-3.5 px-4 flex items-center gap-3 bg-[color:var(--sp-ink)] text-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold">VIP Guest</div>
                      <div className="text-[11px] text-white/70">Regular customer · Table 5</div>
                    </div>
                  </motion.div>
                </div>
              </Parallax>
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <Reveal>
                <Eyebrow>A Better Guest Experience</Eyebrow>
                <h2 className="sp-display sp-h2 mt-4 text-[color:var(--sp-ink)]">
                  Delight your guests <br />
                  <span className="sp-em italic">from booking to bill.</span>
                </h2>
                <p className="sp-lead mt-5 max-w-[500px]">
                  Give your guests a smooth, modern experience with online reservations, digital menus, fast service and secure payments.
                </p>

                <ul className="mt-8 space-y-3.5">
                  <CheckItem>Online reservations</CheckItem>
                  <CheckItem>Digital menu & QR ordering</CheckItem>
                  <CheckItem>Flexible payment options</CheckItem>
                  <CheckItem>Personalized guest profiles</CheckItem>
                </ul>

                <div className="mt-8">
                  <Link to="/features" className="sp-btn sp-btn-primary sp-btn-md">
                    Learn more <ArrowIcon />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          6. FEATURE DEEP DIVE 2: AUTOMATION & WORKFLOWS
          "Automate the busy work."
          Soft mint background + Booking reminder preview & animated node workflow
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg sp-bg-mint relative border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Copy */}
            <div>
              <Reveal>
                <Eyebrow>Save Time</Eyebrow>
                <h2 className="sp-display sp-h2 mt-4 text-[color:var(--sp-ink)]">
                  Automate the <span className="sp-em italic">busy work.</span>
                </h2>
                <p className="sp-lead mt-5 max-w-[500px]">
                  Let Sectros handle repetitive tasks like confirmations, reminders and follow-ups so you can focus on what matters.
                </p>

                <ul className="mt-8 space-y-3.5">
                  <CheckItem>Automated booking confirmations</CheckItem>
                  <CheckItem>Reminder notifications to reduce no-shows</CheckItem>
                  <CheckItem>Guest follow-ups and feedback</CheckItem>
                  <CheckItem>Staff scheduling and shift management</CheckItem>
                </ul>

                <div className="mt-8">
                  <Link to="/features" className="sp-btn sp-btn-primary sp-btn-md">
                    Explore automation <ArrowIcon />
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Visual: Node Workflow + Notification message (Looping Automation Engine) */}
            <div className="relative">
              <Parallax distance={14}>
                <AutomationWorkflowVisual />
              </Parallax>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          7. INTEGRATIONS
          "Works with the tools you already use."
          Stripe, Square, Lightspeed, TheFork, Mailchimp, Google
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section sp-bg-white border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <SectionHeader
            eyebrow="Connected to Your Tools"
            title={
              <>
                Works with the tools <br className="hidden sm:inline" />
                you <span className="sp-em italic">already use.</span>
              </>
            }
            lead="Integrate with your favorite payment providers, accounting tools and marketing platforms."
            action={
              <Link to="/integrations" className="sp-btn sp-btn-secondary sp-btn-md">
                View all integrations <ArrowIcon />
              </Link>
            }
          />

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
            {INTEGRATIONS.map((tool) => (
              <div
                key={tool.name}
                className="sp-card p-6 flex items-center justify-center h-24 hover:border-[color:var(--sp-line-2)] transition-colors"
              >
                <span className={`text-xl ${tool.font}`} style={{ color: tool.color }}>
                  {tool.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          8. TESTIMONIALS / SUCCESS STORIES
          "Trusted by hospitality businesses."
          Marco Bianchi (El Santo), Laura Martinez (La Marina), James Carter (Bistro 21)
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg sp-bg-paper border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <div>
              <Eyebrow>Success Stories</Eyebrow>
              <h2 className="sp-display sp-h2 mt-4 text-[color:var(--sp-ink)]">
                Trusted by <span className="sp-em italic">hospitality businesses.</span>
              </h2>
            </div>
            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTestimonial((prev) => (prev > 0 ? prev - 1 : TESTIMONIALS.length - 1))}
                className="w-10 h-10 rounded-full border border-[color:var(--sp-line-2)] bg-white flex items-center justify-center text-[color:var(--sp-ink)] hover:bg-[color:var(--sp-mint)] transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTestimonial((prev) => (prev < TESTIMONIALS.length - 1 ? prev + 1 : 0))}
                className="w-10 h-10 rounded-full border border-[color:var(--sp-line-2)] bg-white flex items-center justify-center text-[color:var(--sp-ink)] hover:bg-[color:var(--sp-mint)] transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6, ease: EASE }}
                className={`sp-card p-8 flex flex-col justify-between ${
                  activeTestimonial === idx ? 'border-[color:var(--sp-green)] ring-1 ring-[color:var(--sp-green)]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-[15px] md:text-[15.5px] leading-relaxed text-[color:var(--sp-ink)] italic">
                    "{t.quote}"
                  </blockquote>
                </div>
                <div className="mt-8 pt-5 border-t border-[color:var(--sp-line)] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[color:var(--sp-mint)] text-[color:var(--sp-green)] font-semibold text-xs flex items-center justify-center">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-[color:var(--sp-ink)]">{t.author}</div>
                    <div className="text-[12px] text-[color:var(--sp-text-3)]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          9. PRICING
          "Choose the plan that fits your business."
          Starter €49 / Pro €99 (Most Popular) / Business €199
          Monthly vs Annual toggle (Save 20%)
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg sp-bg-white border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="text-center max-w-[640px] mx-auto">
            <Eyebrow>Simple, Transparent Pricing</Eyebrow>
            <h2 className="sp-display sp-h2 mt-4 text-[color:var(--sp-ink)]">
              Choose the plan that <br />
              <span className="sp-em italic">fits your business.</span>
            </h2>

            {/* Toggle */}
            <div className="mt-8 inline-flex items-center p-1 rounded-full bg-[color:var(--sp-paper)] border border-[color:var(--sp-line)]">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[color:var(--sp-ink)] shadow-xs'
                    : 'text-[color:var(--sp-text-2)] hover:text-[color:var(--sp-ink)]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-[color:var(--sp-green)] text-white shadow-xs'
                    : 'text-[color:var(--sp-text-2)] hover:text-[color:var(--sp-ink)]'
                }`}
              >
                Annual
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${billingCycle === 'annual' ? 'bg-white/20 text-white' : 'bg-[color:var(--sp-mint)] text-[color:var(--sp-green)]'}`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div
            className={`mt-14 grid grid-cols-1 gap-8 max-w-[1100px] mx-auto ${
              plans.length === 2
                ? 'md:grid-cols-2 max-w-[800px]'
                : plans.length >= 4
                ? 'md:grid-cols-4 max-w-[1240px]'
                : 'md:grid-cols-3'
            }`}
          >
            {plans.map((p) => {
              const isAnnual = billingCycle === 'annual';
              const { isCustom, isFree, displayPrice, period, note } = formatPlanPrice(p, isAnnual);
              const isPopular = p.is_popular;
              const isEnterprise = p.isEnterprise;
              const features = p.bulletFeatures || [];

              return (
                <div
                  key={p.id || p.slug || p.name}
                  className={`relative sp-card p-8 flex flex-col justify-between ${
                    isPopular
                      ? 'border-[color:var(--sp-green)] ring-2 ring-[color:var(--sp-green)] shadow-xl'
                      : 'hover:border-[color:var(--sp-line-2)]'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[color:var(--sp-green)] text-white text-[10.5px] font-semibold tracking-wider uppercase shadow-xs">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-[color:var(--sp-ink)]">{p.name}</h3>
                    <p className="text-[13px] text-[color:var(--sp-text-3)] mt-1">{p.description}</p>

                    <div className="mt-6 flex flex-wrap items-baseline gap-1">
                      {isCustom ? (
                        <div>
                          <span className="text-4xl font-extrabold tracking-tight text-[color:var(--sp-ink)]">
                            Custom
                          </span>
                          <span className="block text-[12.5px] text-[color:var(--sp-text-3)] mt-1">
                            Tailored to your venue group.
                          </span>
                        </div>
                      ) : isFree ? (
                        <div>
                          <span className="text-4xl font-extrabold tracking-tight text-[color:var(--sp-ink)]">
                            $0
                          </span>
                          <span className="text-[13px] text-[color:var(--sp-text-3)] font-medium ml-1">/month</span>
                          <span className="block text-[12.5px] text-[color:var(--sp-text-3)] mt-1">
                            Free forever
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="text-4xl font-extrabold tracking-tight text-[color:var(--sp-ink)] tabular-nums">
                            ${displayPrice}
                          </span>
                          <span className="text-[13px] text-[color:var(--sp-text-3)] font-medium">/month</span>
                          {note && (
                            <span className="w-full text-[12px] text-[color:var(--sp-text-3)] mt-0.5">
                              {note}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <ul className="mt-8 space-y-3.5 border-t border-[color:var(--sp-line)] pt-6">
                      {features.map((feat) => (
                        <CheckItem key={feat}>{feat}</CheckItem>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10">
                    {isEnterprise ? (
                      <Link to="/contact" className="sp-btn sp-btn-secondary w-full justify-center">
                        Talk to Sales <ArrowIcon />
                      </Link>
                    ) : (
                      <Link
                        to={`/register?plan=${p.slug || p.id}`}
                        className={`sp-btn w-full justify-center ${
                          isPopular ? 'sp-btn-primary' : 'sp-btn-secondary'
                        }`}
                      >
                        {p.monthly_price === 0 ? 'Get Started Free' : 'Start Free Trial'} <ArrowIcon />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          10. FAQ
          "Everything you need to know."
          Editorial 2-column or clean accordion
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg sp-bg-paper border-t border-[color:var(--sp-line)]">
        <div className="sp-container max-w-[1040px]">
          <SectionHeader
            eyebrow="Frequently Asked Questions"
            title={
              <>
                Everything you <span className="sp-em italic">need to know.</span>
              </>
            }
            action={
              <Link to="/help" className="sp-btn sp-btn-secondary sp-btn-md">
                View all FAQs <ArrowIcon />
              </Link>
            }
          />

          <div className="mt-14 divide-y divide-[color:var(--sp-line)] border-y border-[color:var(--sp-line)]">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={item.q} className="py-6">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 group"
                  aria-expanded={openFaq === idx}
                >
                  <span className="text-[17px] font-semibold text-[color:var(--sp-ink)] group-hover:text-[color:var(--sp-green)] transition-colors">
                    {item.q}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white border border-[color:var(--sp-line)] flex items-center justify-center shrink-0 text-[color:var(--sp-ink)]">
                    {openFaq === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-[15px] text-[color:var(--sp-text-2)] leading-relaxed max-w-[800px]">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          11. FINAL CTA
          "Ready to streamline your operations?"
          Join hundreds of restaurants already using Sectros.
          Dark container with Sectros brand identity + product sneak peek
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg bg-white border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="relative rounded-3xl bg-[color:var(--sp-ink)] text-white overflow-hidden p-8 sm:p-12 lg:p-16 shadow-2xl">
            {/* Background effects */}
            <div className="sp-noise-dark" />
            <div
              className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[color:var(--sp-green)]/20 blur-3xl pointer-events-none"
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <h2 className="sp-display sp-h2 text-white">
                  Ready to streamline <br />
                  <span className="sp-em italic text-[color:var(--sp-green-300)]">your operations?</span>
                </h2>
                <p className="sp-lead text-white/70 mt-4 max-w-[460px]">
                  Join hundreds of restaurants already using Sectros.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
                  <Link to="/register" className="sp-btn sp-btn-light sp-btn-lg">
                    Get Started Free <ArrowIcon />
                  </Link>
                  <Link to="/contact" className="sp-btn sp-btn-ghost-dark sp-btn-lg">
                    Book a Demo
                  </Link>
                </div>
              </div>

              {/* Overlapping dashboard / mobile device preview */}
              <div className="hidden lg:block">
                <CtaDevices />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

