import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion, useScroll, useTransform, animate } from 'framer-motion';
import { ArrowRight, Check, Plus } from 'lucide-react';

export const EASE = [0.22, 1, 0.36, 1];

/** Fade + rise when entering the viewport. */
export function Reveal({ as = 'div', delay = 0, y = 24, duration = 0.8, amount = 0.25, className, children, ...rest }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Staggered group: children wrapped in <RevealItem> animate one after another. */
export function RevealGroup({ className, children, stagger = 0.08, delay = 0, amount = 0.2, as = 'div' }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({ className, children, y = 22, as = 'div', ...rest }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Very small scroll-linked vertical drift for product imagery. */
export function Parallax({ children, className, distance = 24 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [distance, -distance]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/** Smooth count-up when visible. */
export function CountUp({ to, prefix = '', suffix = '', decimals = 0, duration = 1.6, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  const formatted = Number(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

/** Bars that grow from the baseline when the chart enters the viewport. */
export function GrowBars({ values, highlight = -1, className = '', barClass = '', activeClass = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className={`flex items-end gap-[6%] h-full ${className}`}>
      {values.map((h, i) => (
        <motion.div
          key={i}
          className={`flex-1 rounded-t-[5px] origin-bottom ${i === highlight ? activeClass : barClass}`}
          style={{ height: `${h}%` }}
          initial={reduce ? false : { scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.9, delay: delay + i * 0.06, ease: EASE }}
        />
      ))}
    </div>
  );
}

export function Eyebrow({ children, className = '' }) {
  return <span className={`sp-eyebrow ${className}`}>{children}</span>;
}

export function ArrowIcon({ className = 'w-4 h-4' }) {
  return <ArrowRight className={`sp-arrow ${className}`} strokeWidth={2} />;
}

export function CheckItem({ children, dark = false }) {
  return (
    <li className="flex items-start gap-3">
      <span className="sp-check mt-[2px]" style={dark ? { background: 'var(--sp-green-400)' } : undefined}>
        <Check className="w-3 h-3" strokeWidth={3} />
      </span>
      <span className={dark ? 'text-[15px] text-white/80' : 'text-[15px] text-[color:var(--sp-text-2)]'}>{children}</span>
    </li>
  );
}

/** Browser-style product frame. */
export function BrowserFrame({ url = 'app.sectros.com', children, className = '' }) {
  return (
    <div className={`sp-frame ${className}`}>
      <div className="sp-browser-bar">
        <div className="sp-browser-dots"><span /><span /><span /></div>
        <div className="sp-browser-url">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          {url}
        </div>
        <div className="w-[42px]" />
      </div>
      {children}
    </div>
  );
}

/** Sectros mark — used when no custom platform logo is configured. */
export function SectrosMark({ className = 'w-6 h-6', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" rx="2.5" fill={color} />
      <rect x="13" y="2" width="9" height="9" rx="2.5" fill={color} opacity="0.55" />
      <rect x="2" y="13" width="9" height="9" rx="2.5" fill={color} opacity="0.55" />
      <rect x="13" y="13" width="9" height="9" rx="2.5" fill={color} />
    </svg>
  );
}

export function SectionHeader({ eyebrow, title, lead, align = 'left', action, dark = false, className = '' }) {
  const centered = align === 'center';
  return (
    <div className={`${action ? 'flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8' : ''} ${className}`}>
      <Reveal className={`${centered ? 'mx-auto text-center' : ''} max-w-[640px]`}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className={`sp-display sp-h2 mt-5 ${dark ? 'text-white' : ''}`}>{title}</h2>
        {lead && <p className="sp-lead mt-5 max-w-[540px]">{lead}</p>}
      </Reveal>
      {action && (
        <Reveal delay={0.1} className="shrink-0">
          {action}
        </Reveal>
      )}
    </div>
  );
}

/** Editorial accordion: numbered rows, smooth height/opacity expand. */
export function Accordion({ items, className = '' }) {
  const [open, setOpen] = useState(0);
  const reduce = useReducedMotion();
  return (
    <div className={`border-b border-[color:var(--sp-line)] ${className}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-t border-[color:var(--sp-line)]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="group flex w-full items-center gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sp-green)] focus-visible:ring-inset"
            >
              <span className="sp-num text-[12px] tracking-[0.14em] text-[color:var(--sp-green)] shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 text-[15.5px] font-semibold leading-snug text-[color:var(--sp-ink)] transition-colors group-hover:text-[color:var(--sp-green-600)]">
                {item.q}
              </span>
              <span
                className={`sp-icon-chip shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'rotate-45' : ''}`}
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="body"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 pl-[calc(12px+24px+1rem)] text-[15px] leading-[1.75] text-[color:var(--sp-text-2)]">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

