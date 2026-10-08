import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Armchair,
  UtensilsCrossed,
  BarChart3,
  Users,
  Bot,
  Puzzle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Bell,
  Zap,
  TrendingUp,
  DollarSign,
  Smartphone,
  ChevronRight,
  Search,
  ExternalLink,
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
  SectionHeader,
  EASE,
} from './primitives';
import {
  ReservationsUI,
  TablesUI,
  MenuUI,
  AnalyticsUI,
  GuestCrmUI,
  IntegrationsUI,
  ReservationsDominantUI,
  TablesDominantUI,
  MenuOrdersDominantUI,
  AnalyticsDominantUI,
} from './mockups';

/* ── AUTOMATION WORKFLOW VISUAL (STANDALONE ENGINE) ──────────────────────── */
function AutomationWorkflowVisual() {
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
    let timeoutId;
    const schedule = (fn, ms) => {
      timeoutId = setTimeout(fn, ms);
    };

    const runSequence = () => {
      setActiveStep(0);
      setLineProgress(0);
      setIsResetting(false);

      schedule(() => {
        setLineProgress(33.333);
        schedule(() => {
          setActiveStep(1);
          schedule(() => {
            setLineProgress(66.666);
            schedule(() => {
              setActiveStep(2);
              schedule(() => {
                setLineProgress(100);
                schedule(() => {
                  setActiveStep(3);
                  schedule(() => {
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
    return () => clearTimeout(timeoutId);
  }, []);

  const CurrentIcon = STEPS[activeStep].icon;

  return (
    <div className="space-y-6 max-w-[480px] mx-auto text-left">
      {/* Notification card with subtle crossfade & 6px vertical translation */}
      <div className="sp-card p-5 shadow-md relative overflow-hidden bg-white">
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
      <div className="sp-card p-6 bg-white">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-5 left-7 right-7 h-[2px] bg-[color:var(--sp-line-2)] -translate-y-1/2 z-0" />
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

export default function PremiumFeatures() {
  const [activeFilter, setActiveFilter] = useState('all');

  const CATEGORIES = [
    { id: 'all', label: 'All Capabilities' },
    { id: 'reservations', label: 'Reservations & Walk-ins' },
    { id: 'tables', label: 'Floor Plan' },
    { id: 'crm', label: 'Guest CRM' },
    { id: 'menu', label: 'Kitchen & Menu' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'automation', label: 'Automation' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <div className="sp-root overflow-hidden selection:bg-[rgba(18,121,76,0.18)]">
      {/* ──────────────────────────────────────────────────────────────────
          1. EDITORIAL HERO
      ────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 md:pt-20 lg:pt-24 pb-14 md:pb-20 bg-gradient-to-b from-[#f8f6f1] via-[#fbfaf7] to-[#ffffff] border-b border-[color:var(--sp-line)]">
        <div className="sp-hero-bg" />
        <div className="sp-grid-lines" />

        <div className="sp-container relative z-10 text-center max-w-[880px] mx-auto">
          {/* Eyebrow */}
          <Reveal y={12} duration={0.6}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[color:var(--sp-mint)] border border-[rgba(18,121,76,0.18)] text-[11px] font-semibold tracking-[0.14em] uppercase text-[color:var(--sp-green)] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--sp-green)] animate-pulse" />
              Sectros Platform Capabilities
            </div>
          </Reveal>

          {/* Main Headline */}
          <Reveal y={20} delay={0.1} duration={0.8}>
            <h1 className="sp-display mt-6 text-[color:var(--sp-ink)] text-[44px] sm:text-[56px] lg:text-[68px] leading-[1.02] tracking-[-0.03em]">
              Engineered for the reality <br />
              of <span className="sp-em italic font-normal text-[color:var(--sp-green)]">modern hospitality.</span>
            </h1>
          </Reveal>

          {/* Subheading */}
          <Reveal y={18} delay={0.2} duration={0.8}>
            <p className="sp-lead mt-6 max-w-[640px] mx-auto text-[color:var(--sp-text-2)] text-base sm:text-lg lg:text-[1.125rem] leading-[1.58]">
              Every tool a restaurant, boutique café, or hotel needs to run flawless service, maximize table turns, and build lasting guest loyalty — unified in one operating system.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal y={16} delay={0.3} duration={0.8}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link to="/register" className="sp-btn sp-btn-primary sp-btn-lg shadow-sm hover:shadow-md">
                Get Started Free <ArrowIcon />
              </Link>
              <Link to="/contact" className="sp-btn sp-btn-secondary sp-btn-lg">
                Book a Live Demo
              </Link>
            </div>
          </Reveal>

          {/* Category Filter Pills (Editorial Jump Bar) */}
          <Reveal y={14} delay={0.4} duration={0.8}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-[color:var(--sp-line)]">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                    activeFilter === cat.id
                      ? 'bg-[color:var(--sp-green)] text-white shadow-xs font-semibold'
                      : 'bg-white text-[color:var(--sp-text-2)] border border-[color:var(--sp-line)] hover:border-[color:var(--sp-line-2)] hover:text-[color:var(--sp-ink)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          2. MOSAIC BLOCK 1: DOMINANT RESERVATIONS SHOWCASE
          (The dominant large feature as requested)
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section sp-bg-paper">
        <div className="sp-container">
          <div className="sp-card p-6 md:p-10 border-[color:var(--sp-line)] shadow-sm bg-gradient-to-br from-white via-white to-[#fcfbf9]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left description */}
              <div className="lg:col-span-5 text-left">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[color:var(--sp-green)] mb-3">
                  <span className="w-2 h-2 rounded-full bg-[color:var(--sp-green)]" />
                  01 · Core Operating Engine
                </div>
                <h2 className="sp-display sp-h2 text-[color:var(--sp-ink)]">
                  Reservations & <br />
                  <span className="sp-em italic text-[color:var(--sp-green)]">walk-in management.</span>
                </h2>
                <p className="sp-lead mt-4 text-[color:var(--sp-text-2)]">
                  Eliminate third-party cover fees forever. Accept bookings 24/7 across your website, Google, and social channels, while managing floor walk-ins with instant turnaround timers.
                </p>

                <div className="mt-6 space-y-3">
                  <CheckItem>100% Commission-free online bookings via direct link or embedded widget</CheckItem>
                  <CheckItem>Live Google Reserve & Instagram direct integration</CheckItem>
                  <CheckItem>Deposit collection and card pre-authorization to prevent no-shows</CheckItem>
                  <CheckItem>Walk-in waitlist with real-time SMS arrival notifications</CheckItem>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Link to="/register" className="sp-btn sp-btn-primary sp-btn-md shadow-xs">
                    Test Reservations <ArrowIcon />
                  </Link>
                  <span className="text-[12px] text-[color:var(--sp-text-3)] font-medium">
                    No hardware required
                  </span>
                </div>
              </div>

              {/* Right: Live Dominant Reservations Terminal */}
              <div className="lg:col-span-7">
                <ReservationsDominantUI />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          3. MOSAIC BLOCK 2: ASYMMETRIC DUO
          - Card A (60%): Table Management (Visual Floor Plan)
          - Card B (40%): Guest CRM & Loyalty Profiles
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section sp-bg-white border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <SectionHeader
            eyebrow="Floor & Guest Architecture"
            title={
              <>
                Designed for precision <br className="hidden sm:inline" />
                in the <span className="sp-em italic">dining room.</span>
              </>
            }
            lead="Keep your hosts in sync with live floor state, server assignments, and individual guest preferences."
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* 60% Card: Table Management */}
            <div className="lg:col-span-7 sp-card p-6 md:p-8 flex flex-col justify-between bg-[#fbfaf8]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[color:var(--sp-green)]">
                    <Armchair className="w-4 h-4" /> 02 · Floor Plan Control
                  </div>
                  <span className="text-[11px] font-semibold text-[color:var(--sp-text-3)]">Interactive View</span>
                </div>
                <h3 className="sp-h3 text-[color:var(--sp-ink)]">Visual Table Management</h3>
                <p className="text-[13.5px] text-[color:var(--sp-text-2)] mt-2 leading-relaxed">
                  Design custom multi-zone floor layouts. See occupancy at a glance, assign waitstaff to specific sections, and track table turn durations in real time.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[color:var(--sp-line)]">
                <TablesDominantUI />
              </div>
            </div>

            {/* 40% Card: Guest CRM */}
            <div className="lg:col-span-5 sp-card p-6 md:p-8 flex flex-col justify-between bg-white shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[color:var(--sp-green)]">
                    <Users className="w-4 h-4" /> 03 · Guest Intelligence
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">VIP Recognition</span>
                </div>
                <h3 className="sp-h3 text-[color:var(--sp-ink)]">Guest CRM & Profiles</h3>
                <p className="text-[13.5px] text-[color:var(--sp-text-2)] mt-2 leading-relaxed">
                  Every reservation automatically compiles a guest dossier — dietary restrictions, favorite wine bottles, seating preferences, and lifetime visit spend.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[color:var(--sp-line)]">
                <GuestCrmUI />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          4. FULL-WIDTH PRODUCT STORYTELLING SECTION 1
          (Editorial contrast section: The Reality of Service)
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg sp-bg-ink relative overflow-hidden text-left">
        <div className="sp-noise-dark" />
        <div className="sp-container relative z-10">
          <div className="max-w-[820px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold tracking-[0.14em] uppercase text-[color:var(--sp-green-300)] mb-4">
              Operational Philosophy
            </div>
            <h2 className="sp-display sp-h2 text-white">
              Service moves fast. <br />
              Your software shouldn't <span className="sp-em italic text-[color:var(--sp-green-300)]">slow you down.</span>
            </h2>
            <p className="sp-lead text-white/70 mt-6 leading-relaxed">
              A busy restaurant during Friday dinner service is not an office. When tickets print, walk-ins arrive at the host stand, and four parties check in simultaneously, your team requires instant physical feedback — zero loading latency, zero clutter, and flawless tactile clarity.
            </p>
          </div>

          {/* Operational Benchmarks */}
          <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="sp-display sp-num text-3xl md:text-4xl text-white font-medium">
                &lt; 1.2s
              </div>
              <div className="text-[12px] text-white/60 mt-1">Average booking confirmation latency</div>
            </div>
            <div>
              <div className="sp-display sp-num text-3xl md:text-4xl text-white font-medium">
                <CountUp to={35} suffix="%" />
              </div>
              <div className="text-[12px] text-white/60 mt-1">Reduction in idle table turnaround time</div>
            </div>
            <div>
              <div className="sp-display sp-num text-3xl md:text-4xl text-white font-medium">
                0%
              </div>
              <div className="text-[12px] text-white/60 mt-1">Cover fees or hidden booking surcharges</div>
            </div>
            <div>
              <div className="sp-display sp-num text-3xl md:text-4xl text-white font-medium">
                99.98%
              </div>
              <div className="text-[12px] text-white/60 mt-1">Service availability during peak weekend rushes</div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          5. MOSAIC BLOCK 3: ASYMMETRIC DUO
          - Card A (42%): Menu & Kitchen Orders
          - Card B (58%): Analytics & Forecasting
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section sp-bg-paper border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <SectionHeader
            eyebrow="Kitchen Flow & Business Intelligence"
            title={
              <>
                From order creation to <br className="hidden sm:inline" />
                revenue <span className="sp-em italic">optimization.</span>
              </>
            }
            lead="Ensure kitchen tickets route cleanly to the correct stations while executives monitor live covers and gross margins."
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* 42% Card: Menu & Orders */}
            <div className="lg:col-span-5 sp-card p-6 md:p-8 flex flex-col justify-between bg-white shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[color:var(--sp-green)]">
                    <UtensilsCrossed className="w-4 h-4" /> 04 · Kitchen & Menu
                  </div>
                  <span className="text-[11px] font-semibold text-[color:var(--sp-text-3)]">KDS Routing</span>
                </div>
                <h3 className="sp-h3 text-[color:var(--sp-ink)]">Menu & Order Flow</h3>
                <p className="text-[13.5px] text-[color:var(--sp-text-2)] mt-2 leading-relaxed">
                  Manage digital menus, instantly toggle 86'd out-of-stock items, and route courses to dedicated kitchen stations with real-time preparation timers.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[color:var(--sp-line)]">
                <MenuOrdersDominantUI />
              </div>
            </div>

            {/* 58% Card: Analytics & Reports */}
            <div className="lg:col-span-7 sp-card p-6 md:p-8 flex flex-col justify-between bg-[#fbfaf8]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[color:var(--sp-green)]">
                    <BarChart3 className="w-4 h-4" /> 05 · Executive Intelligence
                  </div>
                  <span className="text-[11px] font-semibold text-[color:var(--sp-green)] bg-[color:var(--sp-mint)] px-2 py-0.5 rounded">
                    RevPASH Metrics
                  </span>
                </div>
                <h3 className="sp-h3 text-[color:var(--sp-ink)]">Analytics & Forecasting</h3>
                <p className="text-[13.5px] text-[color:var(--sp-text-2)] mt-2 leading-relaxed">
                  Track covers per hour, average spend per head, beverage margins, and server sales volume with real-time sequential performance graphs.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[color:var(--sp-line)]">
                <AnalyticsDominantUI />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          6. FULL-WIDTH PRODUCT STORYTELLING SECTION 2: AUTOMATION
          (Booking → Notify → Remind → Seated Live Workflow Engine)
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section-lg sp-bg-mint relative border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left description */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[color:var(--sp-green)] mb-3">
                <Zap className="w-4 h-4" /> 06 · Intelligent Automation
              </div>
              <h2 className="sp-display sp-h2 text-[color:var(--sp-ink)]">
                Automate the <span className="sp-em italic">busy work.</span>
              </h2>
              <p className="sp-lead mt-5 max-w-[500px]">
                Let Sectros handle repetitive tasks like confirmations, reminders and follow-ups so your front-of-house team can focus on authentic hospitality.
              </p>

              <ul className="mt-8 space-y-3.5">
                <CheckItem>Instant WhatsApp & SMS confirmation receipts</CheckItem>
                <CheckItem>24-hour and 2-hour pre-service anti-no-show reminders</CheckItem>
                <CheckItem>Automatic guest check-in & table seated state synchronization</CheckItem>
                <CheckItem>Post-service review requests and private feedback collection</CheckItem>
              </ul>

              <div className="mt-8">
                <Link to="/register" className="sp-btn sp-btn-primary sp-btn-md">
                  Enable Automation Engine <ArrowIcon />
                </Link>
              </div>
            </div>

            {/* Right: Live Looping Automation Engine */}
            <div className="relative">
              <Parallax distance={12}>
                <AutomationWorkflowVisual />
              </Parallax>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          7. MOSAIC BLOCK 4: OFFICIAL INTEGRATIONS HUB
          (Real Official Logos, Live 2-Way Sync)
      ────────────────────────────────────────────────────────────────── */}
      <section className="sp-section sp-bg-white border-t border-[color:var(--sp-line)]">
        <div className="sp-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            <div className="lg:col-span-5 text-left">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[color:var(--sp-green)] mb-3">
                <Puzzle className="w-4 h-4" /> 07 · Official Ecosystem
              </div>
              <h2 className="sp-display sp-h2 text-[color:var(--sp-ink)]">
                Connects with the tools <br />
                you <span className="sp-em italic">already rely on.</span>
              </h2>
              <p className="sp-lead mt-4 text-[color:var(--sp-text-2)]">
                Sectros integrates seamlessly with official payment processors, POS terminals, accounting tools, and messaging networks — ensuring data moves without manual intervention.
              </p>

              <div className="mt-6 space-y-2.5 text-[13px] text-[color:var(--sp-text-2)]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[color:var(--sp-green)]" />
                  <span>Stripe & Square integrated payment processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[color:var(--sp-green)]" />
                  <span>Lightspeed & POS menu/table two-way synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[color:var(--sp-green)]" />
                  <span>Reserve with Google & TheFork channel management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[color:var(--sp-green)]" />
                  <span>Official WhatsApp Business API for direct messaging</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <IntegrationsUI />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          8. EDITORIAL CTA BANNER
      ────────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#f8f6f1] border-t border-[color:var(--sp-line)] text-center">
        <div className="sp-container max-w-[760px] mx-auto">
          <Eyebrow>Ready For Better Service?</Eyebrow>
          <h2 className="sp-display sp-h2 text-[color:var(--sp-ink)] mt-4">
            Transform your venue with <br />
            <span className="sp-em italic text-[color:var(--sp-green)]">Sectros today.</span>
          </h2>
          <p className="sp-lead mt-4 text-[color:var(--sp-text-2)] max-w-[540px] mx-auto">
            Get started in under 5 minutes. No credit card required. Keep 100% of your booking revenue.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/register" className="sp-btn sp-btn-primary sp-btn-lg shadow-sm hover:shadow-md">
              Start Free Trial <ArrowIcon />
            </Link>
            <Link to="/contact" className="sp-btn sp-btn-secondary sp-btn-lg">
              Talk to Our Team
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-[12px] text-[color:var(--sp-text-3)] font-medium">
            <span>✓ 14-day free trial</span>
            <span>✓ Free data migration</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  );
}

