import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Globe, Mail, Loader2, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { Reveal, Eyebrow, ArrowIcon } from './primitives';

export default function PremiumPrivacyPolicy() {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);
  const [active, setActive] = useState('#scope');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data } = await api.get('branding', { skipTenantSessionRedirect: true });
        setBranding(data);
      } catch (error) {
        console.error('Failed to load restaurant branding for policy:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBranding();
  }, []);

  const businessName = branding?.business_name || 'Our Restaurant';
  const businessAddress = branding?.business_address || 'TBD';
  const businessEmail = branding?.business_email || 'contact@example.com';

  const sections = [
    {
      id: 'data-collection',
      title: 'Data Collection',
      icon: Eye,
      content: `At ${businessName}, we collect information that you provides directly to us, such as when you make a reservation, sign up for our newsletter, or contact us. This may include your name, email, phone number, and dining preferences.`,
    },
    {
      id: 'use-of-information',
      title: 'Use of Information',
      icon: FileText,
      content: `We use your information to manage reservations, provide customer support, and, with your permission, send you promotional offers about ${businessName}.`,
    },
    {
      id: 'security',
      title: 'Security',
      icon: Lock,
      content:
        'We implement robust security measures to protect your personal information against unauthorized access, alteration, or disclosure.',
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing',
      icon: Globe,
      content:
        'We do not share your personal information with third parties except as described in this policy, as required by law, or with your explicit consent.',
    },
  ];

  const detailed = [
    {
      id: 'scope',
      num: '1',
      title: 'Scope',
      body: (
        <p>This policy applies to all visitors of our website and guests of {businessName}.</p>
      ),
    },
    {
      id: 'contact-us',
      num: '2',
      title: 'Contact Us',
      body: (
        <>
          <p>If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this website, please contact us at:</p>
          <div className="mt-5 rounded-2xl border border-[color:var(--sp-line)] bg-[color:var(--sp-paper)] p-6">
            <p className="font-semibold text-[color:var(--sp-ink)]">{businessName}</p>
            <p className="text-[color:var(--sp-text-2)]">{businessAddress}</p>
            <a href={`mailto:${businessEmail}`} className="mt-2 inline-flex text-[15px] font-medium text-[color:var(--sp-green)]">
              {businessEmail}
            </a>
          </div>
        </>
      ),
    },
  ];

  const navItems = [
    { id: '#data-collection', label: 'Data Collection' },
    { id: '#use-of-information', label: 'Use of Information' },
    { id: '#security', label: 'Security' },
    { id: '#data-sharing', label: 'Data Sharing' },
    { id: '#scope', label: '1. Scope' },
    { id: '#contact-us', label: '2. Contact Us' },
  ];

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(`#${e.target.id}`);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0.1 }
    );
    document.querySelectorAll('[data-section]').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="sp-root flex min-h-screen items-center justify-center bg-[color:var(--sp-paper)]">
        <Loader2 className="h-7 w-7 animate-spin text-[color:var(--sp-green)]" />
      </div>
    );
  }

  return (
    <div className="sp-root bg-[color:var(--sp-paper)]">
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[color:var(--sp-line)]">
        <div className="sp-hero-bg" />
        <div className="sp-container relative pt-20 pb-14 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20">
          <Reveal y={12} duration={0.6}>
            <Eyebrow>Legal &amp; Transparency</Eyebrow>
          </Reveal>
          <Reveal y={22} delay={0.08} duration={0.8}>
            <h1 className="sp-display sp-h1 mt-6 max-w-[14ch] text-[color:var(--sp-ink)]">
              Privacy <em>Policy</em>
            </h1>
          </Reveal>
          <Reveal y={18} delay={0.16} duration={0.8}>
            <p className="sp-lead mt-7 max-w-[560px]">
              At Sectros (operated by Nadvix Limited, trading as Nadvix Technology Limited), we take
              your privacy seriously. This policy explains how we collect, use, and protect your data
              in clear, readable language.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13.5px] text-[color:var(--sp-text-2)]">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[color:var(--sp-green)]" strokeWidth={1.8} />
              Transparent data practices
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[color:var(--sp-green)]" strokeWidth={1.8} />
              Security-first approach
            </span>
            <span className="text-[12.5px] uppercase tracking-[0.12em] text-[color:var(--sp-text-3)]">
              Last updated: March 24, 2026
            </span>
          </Reveal>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────── */}
      <section className="sp-bg-white">
        <div className="sp-container relative flex flex-col gap-10 py-10 md:flex-row md:gap-14 lg:gap-20">
          {/* Desktop sticky TOC */}
          <aside className="hidden md:block md:w-[240px] lg:w-[280px]">
            <nav className="sticky top-28 space-y-1">
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-[color:var(--sp-text-3)]">
                Contents
              </p>
              {navItems.map((n) => {
                const isActive = active === n.id;
                return (
                  <a
                    key={n.id}
                    href={n.id}
                    onClick={() => setActive(n.id)}
                    className={`block rounded-lg px-3 py-2 text-[14px] transition-colors ${
                      isActive
                        ? 'bg-[color:var(--sp-mint)] text-[color:var(--sp-ink)]'
                        : 'text-[color:var(--sp-text-2)] hover:bg-[color:var(--sp-paper)] hover:text-[color:var(--sp-ink)]'
                    }`}
                  >
                    {n.label}
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Mobile TOC toggle */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setTocOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-[color:var(--sp-line)] bg-white px-5 py-3 shadow-[var(--sp-shadow-sm)]"
              aria-expanded={tocOpen}
            >
              <span className="flex items-center gap-2 text-[14px] font-medium text-[color:var(--sp-ink)]">
                <Menu className="h-4 w-4" strokeWidth={2} /> Contents
              </span>
              <motion.span animate={{ rotate: tocOpen ? 45 : 0 }} transition={{ duration: 0.25 }}>
                {tocOpen ? <X className="h-4 w-4" /> : <ArrowIcon className="h-4 w-4" />}
              </motion.span>
            </button>
            {tocOpen && (
              <div className="mt-3 rounded-2xl border border-[color:var(--sp-line)] bg-white p-2 shadow-[var(--sp-shadow-sm)]">
                {navItems.map((n) => (
                  <a
                    key={n.id}
                    href={n.id}
                    onClick={() => {
                      setActive(n.id);
                      setTocOpen(false);
                    }}
                    className={`block rounded-lg px-4 py-2.5 text-[14px] ${
                      active === n.id ? 'bg-[color:var(--sp-mint)] text-[color:var(--sp-ink)]' : 'text-[color:var(--sp-text-2)]'
                    }`}
                  >
                    {n.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-14 pb-20 md:pb-28">
            {/* Overview cards */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {sections.map(({ id, title, icon: Icon, content }) => (
                <div
                  key={id}
                  id={id}
                  data-section
                  className="group rounded-[20px] border border-[color:var(--sp-line)] bg-white p-6 shadow-[var(--sp-shadow-sm)] transition-shadow hover:shadow-[var(--sp-shadow-md)]"
                >
                  <span className="sp-icon-chip">
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 text-[16px] font-semibold text-[color:var(--sp-ink)]">{title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--sp-text-2)]">{content}</p>
                </div>
              ))}
            </motion.div>

            {/* Detailed policy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[24px] border border-[color:var(--sp-line)] bg-white shadow-[var(--sp-shadow-sm)]"
            >
              <div className="border-b border-[color:var(--sp-line)] px-6 py-7 sm:px-8 sm:py-9">
                <h2 className="sp-display text-[24px] text-[color:var(--sp-ink)] sm:text-[30px]">
                  Detailed Policy
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--sp-text-2)]">
                  The sections below contain the full legal details of this Privacy Policy.
                </p>
              </div>
              <div className="divide-y divide-[color:var(--sp-line)] px-6 py-2 sm:px-8">
                {detailed.map((d) => (
                  <section key={d.id} id={d.id} data-section className="scroll-mt-28 py-6 sm:py-8">
                    <div className="flex items-start gap-4">
                      <span className="sp-num mt-1 text-[12px] tracking-[0.14em] text-[color:var(--sp-green)]">
                        {d.num}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-[color:var(--sp-ink)]">
                          {d.title}
                        </h3>
                        <div className="mt-3 space-y-4 text-[15px] leading-[1.75] text-[color:var(--sp-text-2)]">
                          {d.body}
                        </div>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}