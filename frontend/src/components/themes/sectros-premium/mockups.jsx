import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import {
  LayoutDashboard, CalendarDays, Footprints, Armchair, ReceiptText, UtensilsCrossed, Users, BarChart3, Settings,
  ChevronDown, ChevronLeft, ChevronRight, Plus, Search, Bell, TrendingUp, Check, CheckCircle2, UserCheck, Clock,
  Sparkles, ArrowRight, ShieldCheck, Zap,
} from 'lucide-react';
import { GrowBars, SectrosMark, EASE } from './primitives';

/* Shared tiny pieces ─────────────────────────────────────────────────────── */
function Delta({ children, tone = 'up' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10.5px] font-semibold ${tone === 'up' ? 'text-[color:var(--sp-green)]' : 'text-[color:var(--sp-text-3)]'}`}>
      {tone === 'up' && <TrendingUp className="w-3 h-3" strokeWidth={2.4} />}
      {children}
    </span>
  );
}

function Avatar({ name, tone = 0 }) {
  const tones = ['#dbe9e1', '#ece6da', '#e1e4ee', '#efe1dc'];
  const initials = name.split(' ').map((n) => n[0]).join('');
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-[color:var(--sp-ink)] shrink-0" style={{ background: tones[tone % tones.length] }}>
      {initials}
    </div>
  );
}

/* ─── HERO DASHBOARD ─────────────────────────────────────────────────────── */
const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: CalendarDays, label: 'Reservations' },
  { icon: Footprints, label: 'Walk-ins' },
  { icon: Armchair, label: 'Tables' },
  { icon: ReceiptText, label: 'Orders' },
  { icon: UtensilsCrossed, label: 'Menu' },
  { icon: Users, label: 'Employees' },
  { icon: BarChart3, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];

const KPIS = [
  { label: 'Revenue', value: '€12,420', delta: '+12%' },
  { label: 'Bookings', value: '132', delta: '+18%' },
  { label: 'Occupied Tables', value: '24/32', delta: '75%' },
  { label: 'New Guests', value: '86', delta: '+34%' },
];

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function HeroDashboard() {
  const reduce = useReducedMotion();
  return (
    <div className="flex bg-white text-[color:var(--sp-ink)] min-h-[420px] lg:min-h-[560px]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[188px] shrink-0 bg-[color:var(--sp-ink)] text-white/60 px-3 py-4">
        <div className="flex items-center gap-2 px-2.5 mb-6">
          <SectrosMark className="w-[18px] h-[18px]" color="#2fa772" />
          <span className="text-white font-semibold text-[13px] tracking-tight">sectros</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 h-8 px-2.5 rounded-lg text-[12px] ${active ? 'bg-white/[0.08] text-white font-medium' : ''}`}
            >
              <Icon className={`w-[14px] h-[14px] ${active ? 'text-[color:var(--sp-green-300)]' : ''}`} strokeWidth={1.8} />
              {label}
            </div>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-white/[0.05] border border-white/[0.08] p-3">
          <div className="text-[10.5px] text-white/50">Tonight</div>
          <div className="text-[13px] text-white font-medium mt-0.5">48 covers booked</div>
          <div className="h-1 rounded-full bg-white/10 mt-2 overflow-hidden"><div className="h-full w-[72%] bg-[color:var(--sp-green-400)] rounded-full" /></div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#fbfbf9]">
        <div className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-[color:var(--sp-line)] bg-white">
          <div className="text-[15px] font-semibold tracking-tight">Dashboard</div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 h-8 w-44 px-3 rounded-lg bg-[#f3f4f2] text-[11px] text-[color:var(--sp-text-3)]">
              <Search className="w-3.5 h-3.5" /> Search guests…
            </div>
            <div className="flex items-center gap-1 h-8 px-3 rounded-lg border border-[color:var(--sp-line)] text-[11px] text-[color:var(--sp-text-2)]">
              This Week <ChevronDown className="w-3 h-3" />
            </div>
            <div className="hidden sm:flex w-8 h-8 rounded-lg border border-[color:var(--sp-line)] items-center justify-center text-[color:var(--sp-text-3)]">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {KPIS.map((k, i) => (
              <motion.div
                key={k.label}
                className="rounded-xl bg-white border border-[color:var(--sp-line)] p-3.5"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55 + i * 0.07, ease: EASE }}
              >
                <div className="text-[11px] text-[color:var(--sp-text-3)]">{k.label}</div>
                <div className="text-[19px] md:text-[21px] font-semibold tracking-tight mt-1 tabular-nums">{k.value}</div>
                <div className="mt-1"><Delta>{k.delta}</Delta></div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-3 flex-1">
            {/* Revenue chart */}
            <div className="rounded-xl bg-white border border-[color:var(--sp-line)] p-4 flex flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold">Revenue</div>
                  <div className="text-[10.5px] text-[color:var(--sp-text-3)]">Last 7 days</div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[color:var(--sp-text-3)]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[color:var(--sp-green)]" />This week</span>
                  <span className="hidden sm:flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[color:var(--sp-mint-2)]" />Last week</span>
                </div>
              </div>
              <div className="relative flex-1 min-h-[150px] mt-4">
                {/* gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map((g) => <div key={g} className="border-t border-dashed border-[color:var(--sp-line)]" />)}
                </div>
                <div className="absolute inset-0 px-1">
                  <GrowBars
                    values={[38, 30, 46, 58, 52, 72, 88]}
                    highlight={3}
                    barClass="bg-[color:var(--sp-mint-2)]"
                    activeClass="bg-[color:var(--sp-green)]"
                    delay={0.8}
                  />
                </div>
                {/* tooltip on Thu */}
                <motion.div
                  className="absolute left-[38%] top-[8%] -translate-x-1/2 rounded-lg bg-[color:var(--sp-ink)] text-white px-2.5 py-1.5 shadow-lg"
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.5, ease: EASE }}
                >
                  <div className="text-[11.5px] font-semibold tabular-nums">€1,240</div>
                  <div className="text-[9.5px] text-white/60">Oct 01, 2026</div>
                </motion.div>
              </div>
              <div className="flex justify-between mt-2 px-1 text-[10px] text-[color:var(--sp-text-3)]">
                {WEEK.map((d) => <span key={d} className="flex-1 text-center">{d}</span>)}
              </div>
            </div>

            {/* Upcoming reservations */}
            <div className="hidden lg:flex rounded-xl bg-white border border-[color:var(--sp-line)] p-4 flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[12px] font-semibold">Upcoming</div>
                <span className="text-[10.5px] text-[color:var(--sp-green)] font-medium">View all</span>
              </div>
              <div className="flex flex-col divide-y divide-[color:var(--sp-line)]">
                {[
                  { t: '19:00', n: 'Sarah Johnson', d: '2 people · Table 3', s: 'Confirmed' },
                  { t: '19:30', n: 'Michael Lee', d: '4 people · Table 5', s: 'Seated' },
                  { t: '20:00', n: 'Emma Davis', d: '2 people · Table 2', s: 'Confirmed' },
                  { t: '20:15', n: 'Luca Romano', d: '6 people · Terrace', s: 'Pending' },
                ].map((r, i) => (
                  <div key={r.n} className="flex items-center gap-2.5 py-2.5">
                    <span className="text-[10.5px] text-[color:var(--sp-text-3)] w-8 tabular-nums">{r.t}</span>
                    <Avatar name={r.n} tone={i} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11.5px] font-medium truncate">{r.n}</div>
                      <div className="text-[10px] text-[color:var(--sp-text-3)] truncate">{r.d}</div>
                    </div>
                    <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md ${r.s === 'Seated' ? 'bg-[color:var(--sp-green)] text-white' : r.s === 'Pending' ? 'bg-[#f4efe4] text-[#8a6a2a]' : 'bg-[color:var(--sp-mint)] text-[color:var(--sp-green)]'}`}>{r.s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── LIVE PRODUCT MICRO-ANIMATIONS ─────────────────────────────────────── */

/**
 * 1. RESERVATIONS & WALK-INS (LIVE MICRO-ANIMATION)
 * - Bookings appear / change status
 * - New booking enters list
 * - Pending → Confirmed transition with subtle indicator
 */
export function ReservationsUI({ className = '' }) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.3 });
  const reduce = useReducedMotion();

  // 0: Initial 3 rows
  // 1: New row (Mateo Rossi) enters with "Pending"
  // 2: Mateo Rossi transitions to "Confirmed", confirmation badge appears
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStep(2);
      return;
    }
    if (!inView) return;

    let timeoutId;
    const loop = () => {
      setStep(0);
      timeoutId = setTimeout(() => {
        setStep(1); // Mateo enters (Pending)
        timeoutId = setTimeout(() => {
          setStep(2); // Transitions to Confirmed + toast
          timeoutId = setTimeout(() => {
            loop(); // Repeat
          }, 3200);
        }, 1800);
      }, 1600);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [inView, reduce]);

  const baseBookings = [
    { t: '19:00', n: 'Sarah Johnson', d: '2 guests · Table 3', s: 'Confirmed' },
    { t: '19:30', n: 'Michael Lee', d: '4 guests · Table 5', s: 'Seated' },
    { t: '20:00', n: 'Emma Davis', d: '2 guests · Table 2', s: 'Confirmed' },
  ];

  return (
    <div ref={containerRef} className={`rounded-2xl bg-white border border-[color:var(--sp-line)] shadow-[var(--sp-shadow-sm)] overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 h-10 border-b border-[color:var(--sp-line)] bg-[#faf9f6]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--sp-ink)]">
          <CalendarDays className="w-3.5 h-3.5 text-[color:var(--sp-green)]" />
          <span>Tonight's Service</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--sp-green)] animate-pulse" />
          <span className="text-[10px] font-medium text-[color:var(--sp-text-3)]">Live Sync</span>
        </div>
      </div>

      {/* Bookings list */}
      <div className="divide-y divide-[color:var(--sp-line)] p-1">
        {baseBookings.map((r, i) => (
          <div key={r.n} className="flex items-center gap-2.5 px-3 py-2.5 text-left">
            <span className="text-[10.5px] text-[color:var(--sp-text-3)] w-8 tabular-nums font-mono">{r.t}</span>
            <Avatar name={r.n} tone={i} />
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-medium text-[color:var(--sp-ink)] truncate">{r.n}</div>
              <div className="text-[10px] text-[color:var(--sp-text-3)] truncate">{r.d}</div>
            </div>
            <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-md ${
              r.s === 'Seated'
                ? 'bg-[color:var(--sp-green)] text-white'
                : 'bg-[color:var(--sp-mint)] text-[color:var(--sp-green)]'
            }`}>
              {r.s}
            </span>
          </div>
        ))}

        {/* Animated entry row: Mateo Rossi */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex items-center gap-2.5 px-3 py-2.5 bg-emerald-50/40"
            >
              <span className="text-[10.5px] text-[color:var(--sp-text-3)] w-8 tabular-nums font-mono">20:15</span>
              <Avatar name="Mateo Rossi" tone={3} />
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-medium text-[color:var(--sp-ink)] truncate flex items-center gap-1.5">
                  Mateo Rossi
                  {step >= 2 && <Check className="w-3 h-3 text-[color:var(--sp-green)] stroke-[2.5]" />}
                </div>
                <div className="text-[10px] text-[color:var(--sp-text-3)] truncate">4 guests · Terrace</div>
              </div>
              <motion.span
                layout
                className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-md transition-colors duration-300 ${
                  step === 1
                    ? 'bg-amber-100/80 text-amber-800'
                    : 'bg-[color:var(--sp-mint)] text-[color:var(--sp-green)]'
                }`}
              >
                {step === 1 ? 'Pending' : 'Confirmed'}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation toast banner */}
      <div className="px-3 py-2 bg-[#f4f2ec] border-t border-[color:var(--sp-line)] flex items-center justify-between">
        <span className="text-[10px] text-[color:var(--sp-text-2)] font-medium">
          {step >= 2 ? '✓ Auto-confirmed & SMS sent' : 'Waiting for walk-in or online bookings…'}
        </span>
        <span className="text-[9.5px] font-semibold text-[color:var(--sp-green)] uppercase tracking-wider">
          {step >= 2 ? '4 covers' : '3 covers'}
        </span>
      </div>
    </div>
  );
}

/**
 * 2. TABLE MANAGEMENT (LIVE MICRO-ANIMATION)
 * - Tables change between Available, Reserved, Seated
 * - Selected table highlights subtly
 * - Status legend counts update naturally
 */
export function TablesUI({ className = '' }) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.3 });
  const reduce = useReducedMotion();

  // step 0: Table 3 Available
  // step 1: Table 3 selected with subtle ring
  // step 2: Table 3 becomes Reserved
  // step 3: Table 3 becomes Seated
  const [tableStep, setTableStep] = useState(0);

  useEffect(() => {
    if (reduce) {
      setTableStep(3);
      return;
    }
    if (!inView) return;

    let timeoutId;
    const loop = () => {
      setTableStep(0);
      timeoutId = setTimeout(() => {
        setTableStep(1); // Selected
        timeoutId = setTimeout(() => {
          setTableStep(2); // Reserved
          timeoutId = setTimeout(() => {
            setTableStep(3); // Seated
            timeoutId = setTimeout(() => {
              loop();
            }, 3200);
          }, 1800);
        }, 1600);
      }, 1600);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [inView, reduce]);

  // Initial table states (8 tables)
  // Table 3 is dynamic
  const getTableStatus = (n) => {
    if (n === 2 || n === 5) return 'o'; // seated
    if (n === 7) return 'r'; // reserved
    if (n === 3) {
      if (tableStep >= 3) return 'o'; // seated
      if (tableStep >= 2) return 'r'; // reserved
      return 'f'; // free
    }
    return 'f'; // free
  };

  const seatedCount = tableStep >= 3 ? 3 : 2;
  const reservedCount = tableStep === 2 ? 2 : 1;
  const freeCount = 8 - seatedCount - reservedCount;

  return (
    <div ref={containerRef} className={`rounded-2xl bg-[#f8f6f1] border border-[color:var(--sp-line)] p-4 ${className}`}>
      {/* Floor plan header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold px-2.5 h-6 inline-flex items-center rounded-md bg-white border border-[color:var(--sp-line)] shadow-xs">
            Main Dining
          </span>
          <span className="text-[11px] text-[color:var(--sp-text-3)] px-2 h-6 inline-flex items-center">
            Terrace
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[color:var(--sp-text-2)] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--sp-green)] animate-pulse" />
          <span>Table 3 {tableStep === 1 ? 'Selected' : tableStep === 2 ? 'Reserved' : tableStep >= 3 ? 'Seated' : 'Available'}</span>
        </div>
      </div>

      {/* Floor grid */}
      <div className="grid grid-cols-4 gap-2.5 place-items-center bg-white p-3.5 rounded-xl border border-[color:var(--sp-line)]">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
          const status = getTableStatus(n);
          const isTarget = n === 3;
          const isSelected = isTarget && tableStep === 1;

          let bgClass = 'bg-white border-[color:var(--sp-line-2)] text-[color:var(--sp-text-2)]';
          if (status === 'o') bgClass = 'bg-[color:var(--sp-green)] border-transparent text-white';
          if (status === 'r') bgClass = 'bg-[#f6dedb] border-[#efc6c1] text-[#a2443b]';

          return (
            <div
              key={n}
              className={`w-10 h-10 rounded-full border flex items-center justify-center text-[11px] font-semibold transition-all duration-300 relative ${bgClass} ${
                isSelected ? 'ring-3 ring-[color:var(--sp-green)] ring-offset-2 scale-105' : ''
              }`}
            >
              {n}
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[color:var(--sp-green)] border-2 border-white" />
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Status Legend */}
      <div className="flex justify-between items-center mt-3.5 px-1 text-[10px] text-[color:var(--sp-text-3)] font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[color:var(--sp-green)]" />
          Seated ({seatedCount})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#efc6c1]" />
          Reserved ({reservedCount})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-[color:var(--sp-line-2)] bg-white" />
          Free ({freeCount})
        </span>
      </div>
    </div>
  );
}

/**
 * 3. MENU & ORDERS (LIVE MICRO-ANIMATION)
 * - Menu item is added to an order
 * - Order status progresses: Preparing → Ready → Served
 */
export function MenuUI({ className = '' }) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.3 });
  const reduce = useReducedMotion();

  // 0: Order with 2 items (Preparing)
  // 1: +1 Truffle Pasta added (Preparing)
  // 2: Order status flips to "Ready"
  // 3: Order status flips to "Served"
  const [orderStep, setOrderStep] = useState(0);

  useEffect(() => {
    if (reduce) {
      setOrderStep(3);
      return;
    }
    if (!inView) return;

    let timeoutId;
    const loop = () => {
      setOrderStep(0);
      timeoutId = setTimeout(() => {
        setOrderStep(1); // Item added
        timeoutId = setTimeout(() => {
          setOrderStep(2); // Ready
          timeoutId = setTimeout(() => {
            setOrderStep(3); // Served
            timeoutId = setTimeout(() => {
              loop();
            }, 3200);
          }, 1800);
        }, 1800);
      }, 1600);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [inView, reduce]);

  const subtotal = orderStep >= 1 ? '€46.00' : '€28.00';

  return (
    <div ref={containerRef} className={`rounded-2xl bg-white border border-[color:var(--sp-line)] shadow-[var(--sp-shadow-sm)] p-3.5 ${className}`}>
      {/* Ticket header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[color:var(--sp-line)]">
        <div>
          <div className="text-[11.5px] font-semibold text-[color:var(--sp-ink)]">Table 4 · Order #142</div>
          <div className="text-[9.5px] text-[color:var(--sp-text-3)] font-mono">Dine In · 19:15</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-md transition-colors duration-300 ${
            orderStep === 3
              ? 'bg-[color:var(--sp-green)] text-white'
              : orderStep === 2
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {orderStep === 3 ? '✓ Served' : orderStep === 2 ? 'Ready' : 'Preparing'}
          </span>
        </div>
      </div>

      {/* Item rows */}
      <div className="space-y-1.5 text-left">
        <div className="flex items-center justify-between text-[11px] text-[color:var(--sp-ink)] py-1">
          <span className="font-medium">1x Margherita Pizza</span>
          <span className="tabular-nums text-[color:var(--sp-text-3)]">€12.00</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[color:var(--sp-ink)] py-1">
          <span className="font-medium">1x Chianti Classico</span>
          <span className="tabular-nums text-[color:var(--sp-text-3)]">€16.00</span>
        </div>

        {/* Animated 3rd item */}
        <AnimatePresence>
          {orderStep >= 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0, x: -8 }}
              animate={{ opacity: 1, height: 'auto', x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex items-center justify-between text-[11px] text-[color:var(--sp-green)] font-semibold py-1 bg-[color:var(--sp-mint)] px-2 rounded-md"
            >
              <span className="flex items-center gap-1.5">
                <Plus className="w-3 h-3" /> 1x Truffle Pasta
              </span>
              <span className="tabular-nums">€18.00</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ticket footer with dynamic subtotal */}
      <div className="mt-3 pt-2.5 border-t border-[color:var(--sp-line)] flex items-center justify-between">
        <span className="text-[10px] text-[color:var(--sp-text-3)] font-medium">Subtotal</span>
        <span className="text-[12.5px] font-bold text-[color:var(--sp-ink)] tabular-nums transition-all duration-300">
          {subtotal}
        </span>
      </div>
    </div>
  );
}

/**
 * 4. ANALYTICS & REPORTS (LIVE MICRO-ANIMATION)
 * - Sequential rising bars
 * - Revenue number updates subtly (€10,840 → €12,420)
 * - Percentage badge updates (+8% → +12%)
 */
export function AnalyticsUI({ className = '' }) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.3 });
  const reduce = useReducedMotion();

  // 0: Baseline state
  // 1: Sequential bars rising + numbers ticking up
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduce) {
      setActive(true);
      return;
    }
    if (!inView) return;

    let timeoutId;
    const loop = () => {
      setActive(false);
      timeoutId = setTimeout(() => {
        setActive(true);
        timeoutId = setTimeout(() => {
          loop();
        }, 4500);
      }, 1200);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [inView, reduce]);

  const barValues = active ? [34, 42, 48, 58, 64, 78, 96] : [22, 28, 30, 38, 42, 50, 60];

  return (
    <div ref={containerRef} className={`rounded-2xl bg-white border border-[color:var(--sp-line)] shadow-[var(--sp-shadow-sm)] p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[color:var(--sp-text-3)] font-medium">Total Revenue</span>
        <span className="text-[10px] text-[color:var(--sp-text-3)]">Live Trend</span>
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-[23px] font-bold tracking-tight text-[color:var(--sp-ink)] tabular-nums transition-all duration-700">
          {active ? '€12,420' : '€10,840'}
        </span>
        <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-[color:var(--sp-green)] bg-[color:var(--sp-mint)] px-1.5 py-0.5 rounded">
          <TrendingUp className="w-3 h-3" strokeWidth={2.4} />
          {active ? '+12%' : '+8%'}
        </span>
      </div>

      {/* Sequential animated bars */}
      <div className="h-[110px] mt-3 relative flex items-end justify-between gap-2 px-1">
        {barValues.map((val, i) => {
          const isPeak = i === 6;
          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
              <motion.div
                layout
                className={`w-full rounded-t-sm transition-all duration-700 ${
                  isPeak ? 'bg-[color:var(--sp-green)]' : 'bg-[color:var(--sp-mint-2)]'
                }`}
                style={{
                  height: `${val}%`,
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-[color:var(--sp-text-3)] font-medium">
        {WEEK.map((d) => <span key={d} className="flex-1 text-center">{d}</span>)}
      </div>
    </div>
  );
}

/**
 * 5. GUEST CRM (LIVE MICRO-ANIMATION)
 * - Guest profile with preferences
 * - Live activity entry appears
 * - Guest statistics tick up subtly
 */
export function GuestCrmUI({ className = '' }) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.3 });
  const reduce = useReducedMotion();

  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduce) {
      setActive(true);
      return;
    }
    if (!inView) return;

    let timeoutId;
    const loop = () => {
      setActive(false);
      timeoutId = setTimeout(() => {
        setActive(true);
        timeoutId = setTimeout(() => {
          loop();
        }, 4200);
      }, 1600);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [inView, reduce]);

  return (
    <div ref={containerRef} className={`rounded-2xl bg-white border border-[color:var(--sp-line)] p-4 shadow-[var(--sp-shadow-sm)] text-left ${className}`}>
      {/* Profile Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[color:var(--sp-line)]">
        <div className="w-10 h-10 rounded-full bg-[color:var(--sp-mint)] text-[color:var(--sp-green)] flex items-center justify-center font-bold text-xs border border-emerald-200">
          SJ
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[color:var(--sp-ink)]">Sarah Johnson</span>
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
              VIP
            </span>
          </div>
          <div className="text-[10.5px] text-[color:var(--sp-text-3)] truncate">sarah.j@example.com · +34 612 345 678</div>
        </div>
      </div>

      {/* Guest Stats */}
      <div className="grid grid-cols-3 gap-2 my-3 text-center">
        <div className="p-2 rounded-lg bg-[#faf9f6] border border-[color:var(--sp-line)]">
          <div className="text-[9.5px] text-[color:var(--sp-text-3)]">Visits</div>
          <div className="text-[13px] font-bold text-[color:var(--sp-ink)] tabular-nums transition-all">
            {active ? '12' : '11'}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-[#faf9f6] border border-[color:var(--sp-line)]">
          <div className="text-[9.5px] text-[color:var(--sp-text-3)]">Spend</div>
          <div className="text-[13px] font-bold text-[color:var(--sp-ink)] tabular-nums transition-all">
            {active ? '€1,340' : '€1,198'}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-[#faf9f6] border border-[color:var(--sp-line)]">
          <div className="text-[9.5px] text-[color:var(--sp-text-3)]">No-shows</div>
          <div className="text-[13px] font-bold text-[color:var(--sp-green)] tabular-nums">0</div>
        </div>
      </div>

      {/* Preference tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[color:var(--sp-green)] border border-emerald-100">
          Window Table
        </span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f4efe4] text-[#8a6a2a] border border-[#e8decd]">
          Favorite: Pinot Noir
        </span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          No Peanuts
        </span>
      </div>

      {/* Animated recent activity feed */}
      <AnimatePresence>
        {active ? (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2.5 rounded-lg bg-[color:var(--sp-mint)] text-[11px] text-[color:var(--sp-green)] font-medium flex items-center justify-between"
          >
            <span>✓ Tonight · Seated Table 3 (Alex)</span>
            <span className="text-[9.5px] opacity-75">19:30</span>
          </motion.div>
        ) : (
          <div className="p-2.5 rounded-lg bg-[#faf9f6] text-[11px] text-[color:var(--sp-text-3)] font-medium flex items-center justify-between">
            <span>Last visit · 14 days ago</span>
            <span className="text-[9.5px]">Table 2</span>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * OFFICIAL INTEGRATIONS LOGOS (ACCURATE VECTOR SVGs)
 */
export function StripeLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#635BFF" />
      <path d="M19.8 16.5c0-1.2 1-1.6 2.6-1.6 2.3 0 5.2.7 7.5 2v-5.4c-2.4-1-5.1-1.4-7.5-1.4-6.2 0-10.4 3.2-10.4 8.7 0 8.5 11.6 7.1 11.6 10.8 0 1.4-1.2 1.9-3 1.9-2.7 0-6.1-1.1-8.7-2.6v5.6c2.8 1.2 5.9 1.7 8.7 1.7 6.3 0 10.8-3.1 10.8-8.8 0-9.1-11.6-7.5-11.6-10.9z" fill="#FFFFFF" />
    </svg>
  );
}

export function SquareLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#1A1A1A" />
      <rect x="11" y="11" width="18" height="18" rx="4" stroke="#FFFFFF" strokeWidth="2.5" />
      <rect x="16.5" y="16.5" width="7" height="7" rx="1.5" fill="#FFFFFF" />
    </svg>
  );
}

export function LightspeedLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#E31C23" />
      <path d="M21.5 9L13 22.5h6l-2 8.5 10-14h-6.5l2-8z" fill="#FFFFFF" />
    </svg>
  );
}

export function TheForkLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#00594C" />
      <circle cx="20" cy="20" r="10" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M20 14v12M17 14v4M23 14v4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function WhatsAppLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#25D366" />
      <path d="M20 10a10 10 0 00-8.6 15.1L10 30l5.1-1.3A10 10 0 1020 10zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3a8.2 8.2 0 117 3.9zm4.5-6.2c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.1-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.3 0-.5s-.5-1.2-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.1 4.9 4.3 2.9 1.2 2.9.8 3.4.8.5 0 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3z" fill="#FFFFFF" />
    </svg>
  );
}

export function GoogleLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
      <path d="M27.5 20.2c0-.7-.1-1.4-.2-2.1H20v4h4.2c-.2 1-.8 1.9-1.6 2.5v2.1h2.6c1.5-1.4 2.3-3.6 2.3-6.5z" fill="#4285F4" />
      <path d="M20 28c2.2 0 4-.7 5.4-2l-2.6-2.1c-.7.5-1.7.8-2.8.8-2.1 0-4-1.4-4.6-3.4h-2.7v2.1C14 26.2 16.8 28 20 28z" fill="#34A853" />
      <path d="M15.4 21.3c-.2-.5-.2-1.1-.2-1.7s.1-1.2.2-1.7v-2.1h-2.7C12.2 17 12 18.5 12 20s.2 3 .7 4.2l2.7-2.9z" fill="#FBBC05" />
      <path d="M20 15.3c1.2 0 2.2.4 3 1.2l2.3-2.3C24 12.8 22.2 12 20 12c-3.2 0-6 1.8-7.3 4.6l2.7 2.1c.6-2 2.5-3.4 4.6-3.4z" fill="#EA4335" />
    </svg>
  );
}

export function MailchimpLogo({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#FFE01B" />
      <path d="M20 11c-5 0-9 3.5-9 8.5 0 2.8 1.4 5.3 3.6 6.8-.2.7-.6 1.7-1.4 2.5 1.5 0 2.8-.7 3.6-1.5 1 .3 2.1.4 3.2.4 5 0 9-3.5 9-8.5 0-4.7-4-8.2-9-8.2zm-3.5 8c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm7 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" fill="#241C15" />
    </svg>
  );
}

/**
 * 6. INTEGRATIONS HUB (LIVE MICRO-ANIMATION)
 * - Official brandmark SVGs
 * - Subtle live 2-way data stream into Sectros hub
 */
export function IntegrationsUI({ className = '' }) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.3 });
  const reduce = useReducedMotion();

  const [activeIdx, setActiveIdx] = useState(0);

  const LOGOS = [
    { name: 'Stripe', sub: 'Payments & Deposits', comp: StripeLogo },
    { name: 'Square', sub: 'POS Terminal Sync', comp: SquareLogo },
    { name: 'Lightspeed', sub: 'Menu & Floor Sync', comp: LightspeedLogo },
    { name: 'TheFork', sub: 'External Channels', comp: TheForkLogo },
    { name: 'WhatsApp', sub: 'Guest Reminders', comp: WhatsAppLogo },
    { name: 'Google', sub: 'Reserve with Google', comp: GoogleLogo },
    { name: 'Mailchimp', sub: 'Email Campaigns', comp: MailchimpLogo },
  ];

  useEffect(() => {
    if (reduce || !inView) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % LOGOS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [inView, reduce, LOGOS.length]);

  return (
    <div ref={containerRef} className={`rounded-2xl bg-white border border-[color:var(--sp-line)] p-4 shadow-[var(--sp-shadow-sm)] ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-[color:var(--sp-line)]">
        <div className="flex items-center gap-2">
          <SectrosMark className="w-4 h-4" color="#12794c" />
          <span className="text-[12px] font-semibold text-[color:var(--sp-ink)]">Central Data Hub</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] text-[color:var(--sp-green)] font-semibold bg-[color:var(--sp-mint)] px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--sp-green)] animate-pulse" />
          Live 2-Way Sync
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
        {LOGOS.slice(0, 6).map((item, idx) => {
          const LogoComp = item.comp;
          const isActive = activeIdx === idx;
          return (
            <div
              key={item.name}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all duration-300 ${
                isActive
                  ? 'border-[color:var(--sp-green)] bg-[color:var(--sp-mint)] shadow-xs scale-[1.02]'
                  : 'border-[color:var(--sp-line)] bg-[#fbfaf8]'
              }`}
            >
              <LogoComp className="w-7 h-7 shrink-0 shadow-xs rounded-lg" />
              <div className="min-w-0 text-left">
                <div className="text-[11px] font-semibold text-[color:var(--sp-ink)] truncate">{item.name}</div>
                <div className="text-[9px] text-[color:var(--sp-text-3)] truncate">{item.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-[color:var(--sp-line)] flex items-center justify-between text-[10px] text-[color:var(--sp-text-3)]">
        <span>Webhook sync: <strong className="text-[color:var(--sp-green)] font-mono">&lt; 120ms latency</strong></span>
        <span>7 active connections</span>
      </div>
    </div>
  );
}

/* ─── CTA device composition (reuses the real dashboard) ─────────────────── */
export function CtaDevices() {
  return (
    <div className="relative">
      <div className="rounded-[14px] overflow-hidden border border-white/10 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] bg-white">
        <div className="pointer-events-none select-none" style={{ zoom: 0.62 }}>
          <HeroDashboard />
        </div>
      </div>
      {/* phone */}
      <div className="absolute -right-3 md:-right-6 -bottom-6 w-[120px] md:w-[150px] rounded-[26px] bg-[#0a1411] p-[6px] border border-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
        <div className="rounded-[20px] bg-white overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-[color:var(--sp-line)]">
            <div className="text-[9px] text-[color:var(--sp-text-3)]">Tonight</div>
            <div className="text-[13px] font-semibold tabular-nums">€3,180</div>
          </div>
          <div className="p-2.5 flex flex-col gap-1.5">
            {['Table 4 · Seated', 'Table 7 · 19:30', 'Table 2 · 20:00'].map((r, i) => (
              <div key={r} className={`text-[8.5px] rounded-md px-2 py-1.5 ${i === 0 ? 'bg-[color:var(--sp-green)] text-white' : 'bg-[color:var(--sp-mint)] text-[color:var(--sp-ink)]'}`}>{r}</div>
            ))}
            <div className="h-10 mt-1">
              <GrowBars values={[30, 45, 38, 60, 52, 80, 70]} barClass="bg-[color:var(--sp-mint-2)]" activeClass="bg-[color:var(--sp-green)]" highlight={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DOMINANT FEATURE STORYTELLING MOCKUPS (FEATURES PAGE) ───────────────── */

/**
 * DOMINANT RESERVATIONS SHOWCASE
 * - Asymmetric multi-column command center
 * - Live booking status animations (Pending → Confirmed)
 * - Walk-in fast action & public booking channel simulation
 */
export function ReservationsDominantUI() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.25 });
  const reduce = useReducedMotion();

  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStep(2);
      return;
    }
    if (!inView) return;

    let timeoutId;
    const loop = () => {
      setStep(0);
      timeoutId = setTimeout(() => {
        setStep(1);
        timeoutId = setTimeout(() => {
          setStep(2);
          timeoutId = setTimeout(() => {
            loop();
          }, 3600);
        }, 1800);
      }, 1600);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [inView, reduce]);

  return (
    <div ref={containerRef} className="rounded-2xl bg-white border border-[color:var(--sp-line)] shadow-lg overflow-hidden text-left">
      {/* Top command bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[color:var(--sp-line)] bg-[#faf9f6]">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-[color:var(--sp-ink)]">Reservations Central</span>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[color:var(--sp-mint)] text-[11px] font-semibold text-[color:var(--sp-green)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--sp-green)] animate-pulse" />
            48 covers tonight
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white border border-[color:var(--sp-line)] shadow-xs">
            + Quick Walk-In
          </span>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[color:var(--sp-green)] text-white shadow-xs">
            + New Booking
          </span>
        </div>
      </div>

      {/* Main 2-column view */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[color:var(--sp-line)]">
        {/* Left: Bookings table */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--sp-text-3)]">
              <span className="px-2.5 py-1 rounded-md bg-white border border-[color:var(--sp-line)] text-[color:var(--sp-ink)]">
                All (48)
              </span>
              <span className="px-2.5 py-1 rounded-md hover:bg-white text-[color:var(--sp-text-2)]">
                Confirmed (38)
              </span>
              <span className="px-2.5 py-1 rounded-md hover:bg-white text-[color:var(--sp-text-2)]">
                Seated (8)
              </span>
              <span className="px-2.5 py-1 rounded-md hover:bg-white text-amber-800 bg-amber-50">
                Pending ({step >= 1 ? '3' : '2'})
              </span>
            </div>
            <span className="text-[11px] text-[color:var(--sp-text-3)] font-mono">19:00 – 22:00</span>
          </div>

          <div className="space-y-2">
            {[
              { t: '19:00', n: 'Sarah Johnson', g: '2 guests', table: 'Table 3', tag: 'VIP · Regular', s: 'Confirmed' },
              { t: '19:30', n: 'Michael Lee', g: '4 guests', table: 'Table 5', tag: 'Birthday', s: 'Seated' },
              { t: '20:00', n: 'Emma Davis', g: '2 guests', table: 'Table 2', tag: 'Anniversary', s: 'Confirmed' },
            ].map((r, i) => (
              <div key={r.n} className="flex items-center justify-between p-3 rounded-xl border border-[color:var(--sp-line)] hover:border-[color:var(--sp-line-2)] bg-[#fbfbf9] transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-mono font-semibold text-[color:var(--sp-ink)]">{r.t}</span>
                  <Avatar name={r.n} tone={i} />
                  <div>
                    <div className="text-[12px] font-semibold text-[color:var(--sp-ink)] flex items-center gap-1.5">
                      {r.n}
                      <span className="text-[10px] font-medium text-[color:var(--sp-text-3)]">· {r.g}</span>
                    </div>
                    <div className="text-[10.5px] text-[color:var(--sp-text-3)]">{r.table} · <span className="text-amber-800">{r.tag}</span></div>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                  r.s === 'Seated' ? 'bg-[color:var(--sp-green)] text-white' : 'bg-[color:var(--sp-mint)] text-[color:var(--sp-green)]'
                }`}>
                  {r.s}
                </span>
              </div>
            ))}

            {/* Live Incoming Booking */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-emerald-300 bg-emerald-50/60 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-mono font-semibold text-[color:var(--sp-ink)]">20:15</span>
                    <Avatar name="Mateo Rossi" tone={3} />
                    <div>
                      <div className="text-[12px] font-semibold text-[color:var(--sp-ink)] flex items-center gap-1.5">
                        Mateo Rossi
                        <span className="text-[10px] font-medium text-[color:var(--sp-text-3)]">· 4 guests</span>
                        {step >= 2 && <Check className="w-3.5 h-3.5 text-[color:var(--sp-green)] stroke-[2.5]" />}
                      </div>
                      <div className="text-[10.5px] text-[color:var(--sp-text-3)]">Terrace · Window Table · Web direct</div>
                    </div>
                  </div>
                  <motion.span
                    layout
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors duration-300 ${
                      step === 1 ? 'bg-amber-100 text-amber-800' : 'bg-[color:var(--sp-mint)] text-[color:var(--sp-green)]'
                    }`}
                  >
                    {step === 1 ? 'Pending' : 'Confirmed'}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Booking widget & channels summary */}
        <div className="p-4 sm:p-5 bg-[#faf9f6] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--sp-text-3)]">
                Booking Channels
              </span>
              <span className="text-[10.5px] font-semibold text-[color:var(--sp-green)]">100% Commission-free</span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[color:var(--sp-line)]">
                <span className="text-[11px] font-medium text-[color:var(--sp-ink)]">Website Widget (/book)</span>
                <span className="text-[11px] font-bold text-[color:var(--sp-green)]">32 covers</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[color:var(--sp-line)]">
                <span className="text-[11px] font-medium text-[color:var(--sp-ink)]">Reserve with Google</span>
                <span className="text-[11px] font-bold text-[color:var(--sp-ink)]">11 covers</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[color:var(--sp-line)]">
                <span className="text-[11px] font-medium text-[color:var(--sp-ink)]">Instagram & Phone</span>
                <span className="text-[11px] font-bold text-[color:var(--sp-ink)]">5 covers</span>
              </div>
            </div>

            {/* Notification alert */}
            <div className="p-3 rounded-xl bg-white border border-[color:var(--sp-line)] shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-3.5 h-3.5 text-[color:var(--sp-green)]" />
                <span className="text-[11px] font-semibold text-[color:var(--sp-ink)]">Automated SMS Engine</span>
              </div>
              <p className="text-[10.5px] text-[color:var(--sp-text-2)] leading-relaxed">
                {step >= 2 ? 'SMS confirmation delivered to Mateo Rossi (+34 621…). No staff action required.' : 'Smart 24h & 2h reminders automatically scheduled.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[color:var(--sp-line)] flex items-center justify-between text-[10.5px] text-[color:var(--sp-text-3)] font-medium">
            <span>Table Turnover: ~1h 45m</span>
            <span className="text-[color:var(--sp-green)] font-semibold">0% No-Shows Tonight</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DOMINANT TABLE MANAGEMENT SHOWCASE
 * - Full floor plan with zone switcher
 * - Live state changes (Available → Reserved → Seated)
 * - Server section mapping
 */
export function TablesDominantUI() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.25 });
  const reduce = useReducedMotion();

  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduce) {
      setStage(3);
      return;
    }
    if (!inView) return;

    let timeoutId;
    const loop = () => {
      setStage(0);
      timeoutId = setTimeout(() => {
        setStage(1);
        timeoutId = setTimeout(() => {
          setStage(2);
          timeoutId = setTimeout(() => {
            setStage(3);
            timeoutId = setTimeout(() => {
              loop();
            }, 3600);
          }, 1800);
        }, 1600);
      }, 1600);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [inView, reduce]);

  return (
    <div ref={containerRef} className="rounded-2xl bg-[#faf9f6] border border-[color:var(--sp-line)] p-5 shadow-lg text-left">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-white border border-[color:var(--sp-line)] text-[color:var(--sp-ink)] shadow-xs">
            Dining Room (24 tables)
          </span>
          <span className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-[color:var(--sp-text-3)] hover:text-[color:var(--sp-ink)]">
            Terrace (12 tables)
          </span>
          <span className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-[color:var(--sp-text-3)] hover:text-[color:var(--sp-ink)]">
            Bar Lounge
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-[color:var(--sp-text-2)]">
          <span className="w-2 h-2 rounded-full bg-[color:var(--sp-green)] animate-pulse" />
          <span>78% Occupancy · Turnaround on target</span>
        </div>
      </div>

      {/* Visual Floor Grid */}
      <div className="grid grid-cols-6 gap-3 p-5 rounded-xl bg-white border border-[color:var(--sp-line)]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => {
          const isTarget = n === 4;
          let status = 'f';
          if (n === 1 || n === 2 || n === 6 || n === 8 || n === 10) status = 'o';
          if (n === 5 || n === 11) status = 'r';
          if (isTarget) {
            if (stage >= 3) status = 'o';
            else if (stage >= 2) status = 'r';
            else status = 'f';
          }

          let bg = 'bg-white border-[color:var(--sp-line-2)] text-[color:var(--sp-text-2)]';
          if (status === 'o') bg = 'bg-[color:var(--sp-green)] border-transparent text-white';
          if (status === 'r') bg = 'bg-[#f6dedb] border-[#efc6c1] text-[#a2443b]';

          return (
            <div
              key={n}
              className={`h-12 rounded-xl border flex flex-col items-center justify-center text-[12px] font-semibold transition-all duration-300 relative ${bg} ${
                isTarget && stage === 1 ? 'ring-3 ring-[color:var(--sp-green)] ring-offset-2 scale-105' : ''
              }`}
            >
              <span>T{n}</span>
              <span className="text-[9px] opacity-80 font-normal">
                {status === 'o' ? 'Seated' : status === 'r' ? '19:30' : '4 seats'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-[color:var(--sp-line)] text-[11px] font-medium text-[color:var(--sp-text-3)]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[color:var(--sp-green)]" />Seated ({stage >= 3 ? 6 : 5})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#efc6c1]" />Reserved ({stage === 2 ? 3 : 2})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-[color:var(--sp-line-2)] bg-white" />Available ({stage >= 2 ? 4 : 5})</span>
        </div>
        <span className="text-[color:var(--sp-green)] font-semibold">Active Server: Marco (Section A)</span>
      </div>
    </div>
  );
}

/**
 * DOMINANT MENU & ORDERS SHOWCASE
 * - Kitchen Ticket + POS Flow
 * - Status progression: Preparing → Ready → Served
 */
export function MenuOrdersDominantUI() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.25 });
  const reduce = useReducedMotion();

  const [orderStep, setOrderStep] = useState(0);

  useEffect(() => {
    if (reduce) {
      setOrderStep(3);
      return;
    }
    if (!inView) return;

    let timeoutId;
    const loop = () => {
      setOrderStep(0);
      timeoutId = setTimeout(() => {
        setOrderStep(1);
        timeoutId = setTimeout(() => {
          setOrderStep(2);
          timeoutId = setTimeout(() => {
            setOrderStep(3);
            timeoutId = setTimeout(() => {
              loop();
            }, 3600);
          }, 1800);
        }, 1600);
      }, 1600);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [inView, reduce]);

  return (
    <div ref={containerRef} className="rounded-2xl bg-white border border-[color:var(--sp-line)] p-5 shadow-lg text-left">
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[color:var(--sp-line)]">
        <div>
          <div className="text-[13px] font-bold text-[color:var(--sp-ink)]">Kitchen Display Ticket #142</div>
          <div className="text-[10.5px] text-[color:var(--sp-text-3)] font-mono">Table 4 · Waiter: Alex · Dine In</div>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors duration-300 ${
          orderStep === 3
            ? 'bg-[color:var(--sp-green)] text-white'
            : orderStep === 2
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {orderStep === 3 ? '✓ SERVED' : orderStep === 2 ? 'READY FOR SERVICE' : 'IN PREPARATION (7m)'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#faf9f6] border border-[color:var(--sp-line)]">
          <span className="text-[12px] font-semibold text-[color:var(--sp-ink)]">1x Margherita Pizza</span>
          <span className="text-[11.5px] font-mono text-[color:var(--sp-text-2)]">€12.00 · Station: Oven</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#faf9f6] border border-[color:var(--sp-line)]">
          <span className="text-[12px] font-semibold text-[color:var(--sp-ink)]">1x Chianti Classico DOCG</span>
          <span className="text-[11.5px] font-mono text-[color:var(--sp-text-2)]">€16.00 · Station: Bar</span>
        </div>

        <AnimatePresence>
          {orderStep >= 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0, x: -8 }}
              animate={{ opacity: 1, height: 'auto', x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200"
            >
              <span className="text-[12px] font-semibold text-[color:var(--sp-green)] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> 1x Truffle Tagliolini (Extra Parmesan)
              </span>
              <span className="text-[11.5px] font-mono font-bold text-[color:var(--sp-green)]">€18.00 · Station: Pasta</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-3 border-t border-[color:var(--sp-line)] flex items-center justify-between text-[12px]">
        <span className="text-[color:var(--sp-text-3)] font-medium">Ticket Total</span>
        <span className="font-bold text-[16px] text-[color:var(--sp-ink)] tabular-nums">
          {orderStep >= 1 ? '€46.00' : '€28.00'}
        </span>
      </div>
    </div>
  );
}

/**
 * DOMINANT ANALYTICS & REPORTS SHOWCASE
 * - Sequential bars
 * - Real-time Revenue & Covers counter
 * - RevPASH and Category metrics
 */
export function AnalyticsDominantUI() {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { amount: 0.25 });
  const reduce = useReducedMotion();

  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduce) {
      setActive(true);
      return;
    }
    if (!inView) return;

    let timeoutId;
    const loop = () => {
      setActive(false);
      timeoutId = setTimeout(() => {
        setActive(true);
        timeoutId = setTimeout(() => {
          loop();
        }, 4600);
      }, 1200);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [inView, reduce]);

  const barValues = active ? [42, 38, 52, 64, 70, 88, 100] : [24, 28, 32, 40, 48, 56, 68];

  return (
    <div ref={containerRef} className="rounded-2xl bg-white border border-[color:var(--sp-line)] p-5 shadow-lg text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[color:var(--sp-line)]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--sp-text-3)]">
            Service Analytics & Forecasting
          </span>
          <div className="text-[14px] font-bold text-[color:var(--sp-ink)] mt-0.5">Weekly Performance Overview</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#faf9f6] border border-[color:var(--sp-line)] text-[color:var(--sp-text-2)]">
            Last 7 Days
          </span>
          <span className="text-[11px] font-bold text-[color:var(--sp-green)] bg-[color:var(--sp-mint)] px-2 py-0.5 rounded">
            {active ? '+12% vs prior week' : '+8%'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-xl bg-[#faf9f6] border border-[color:var(--sp-line)]">
          <div className="text-[10px] text-[color:var(--sp-text-3)] font-medium">Total Net Revenue</div>
          <div className="text-[20px] font-bold text-[color:var(--sp-ink)] tabular-nums mt-0.5 transition-all">
            {active ? '€12,420' : '€10,840'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-[#faf9f6] border border-[color:var(--sp-line)]">
          <div className="text-[10px] text-[color:var(--sp-text-3)] font-medium">Total Covers</div>
          <div className="text-[20px] font-bold text-[color:var(--sp-ink)] tabular-nums mt-0.5 transition-all">
            {active ? '342 guests' : '298 guests'}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-[#faf9f6] border border-[color:var(--sp-line)]">
          <div className="text-[10px] text-[color:var(--sp-text-3)] font-medium">Avg Spend / Head</div>
          <div className="text-[20px] font-bold text-[color:var(--sp-green)] tabular-nums mt-0.5">
            €36.31
          </div>
        </div>
      </div>

      {/* Sequential Rising Bars */}
      <div className="h-[140px] relative flex items-end justify-between gap-3 px-2 pt-2">
        {barValues.map((val, i) => {
          const isPeak = i === 6;
          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
              <motion.div
                layout
                className={`w-full rounded-t-md transition-all duration-700 ${
                  isPeak ? 'bg-[color:var(--sp-green)] shadow-xs' : 'bg-[color:var(--sp-mint-2)]'
                }`}
                style={{
                  height: `${val}%`,
                  transitionDelay: `${i * 70}ms`,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-[10.5px] text-[color:var(--sp-text-3)] font-semibold">
        {WEEK.map((d) => <span key={d} className="flex-1 text-center">{d}</span>)}
      </div>
    </div>
  );
}
