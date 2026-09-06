import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Heart, Globe, Zap, Eye, Users, DollarSign, BookOpen, Briefcase, Inbox, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const values = [
  {
    icon: Globe,
    title: 'Remote-First by Design',
    description: 'We hire brilliant hospitality and software minds across Europe, the Americas, and Asia. Work from wherever you thrive.',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: Zap,
    title: 'Speed & Execution',
    description: 'We ship production improvements every week. High ownership, low bureaucracy, and bias for decisive action.',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    icon: Heart,
    title: 'Obsessed with Operators',
    description: 'Our software powers real restaurants during Friday dinner rush. We take pride in building rock-solid, dependable tools.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    icon: Eye,
    title: 'Radical Transparency',
    description: 'Metrics, roadmaps, customer feedback, and company financials are shared openly across the entire team.',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
];

const perks = [
  {
    icon: Globe,
    name: 'Work Anywhere',
    desc: 'Full flexibility to work from home, a co-working space, or on the road with a monthly stipend.',
  },
  {
    icon: DollarSign,
    name: 'Meaningful Equity',
    desc: 'Every full-time team member receives competitive equity options. When Sectros wins, we all win.',
  },
  {
    icon: BookOpen,
    name: '£2,000 Learning Budget',
    desc: 'Annual stipend for conferences, technical books, language classes, or professional coaching.',
  },
  {
    icon: ShieldCheck,
    name: 'Comprehensive Healthcare',
    desc: 'Top-tier medical, dental, and vision insurance coverage for you and your dependents.',
  },
  {
    icon: Rocket,
    name: 'Latest Hardware',
    desc: 'Brand new MacBook Pro or ThinkPad workstation, high-res monitor, and ergonomic home setup budget.',
  },
  {
    icon: Users,
    name: 'Annual Team Retreats',
    desc: 'We gather the entire company twice a year in inspiring international destinations to bond and plan.',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-6 border border-indigo-500/30">
              <Briefcase className="w-3.5 h-3.5" />
              Careers at Sectros
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Join Us in Reinventing Hospitality Technology
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              We are building the intelligent operating system for the world's most vibrant restaurants, boutique hotels, and venues. Come build the future with us.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#open-roles"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 transition-all text-center"
              >
                View Open Roles
              </a>
              <Link
                to="/about"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 text-slate-200 font-semibold hover:bg-slate-800 transition-all text-center"
              >
                Learn Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Our Operating Principles</h2>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            How We Build, Think & Collaborate
          </h3>
          <p className="text-slate-500 text-base md:text-lg mt-3">
            We operate with the care and urgency of the world's top Michelin kitchens: disciplined, supportive, and relentless in our standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="p-8 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${v.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{v.title}</h4>
                  <p className="text-slate-600 leading-relaxed text-sm">{v.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Perks Grid */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Perks & Benefits</h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Built to Support You Inside and Outside of Work
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {perks.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.name} className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{p.name}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Roles Section */}
      <section id="open-roles" className="py-20 md:py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Open Positions
          </h2>
          <p className="text-slate-500 text-base md:text-lg mt-3">
            Explore our current opportunities or send an open application.
          </p>
        </div>

        {/* Empty State / Open Application */}
        <div className="bg-white rounded-3xl border border-slate-200 p-10 md:p-14 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            No Specific Openings Right Now
          </h3>
          <p className="text-slate-600 max-w-xl mx-auto text-sm md:text-base leading-relaxed mb-8">
            While we don't have an active job posting matching this exact moment, we are growing quickly and continually scout world-class Fullstack Engineers (PHP/Laravel/React), Hospitality Product Designers, and Customer Success Leaders.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <a
              href="mailto:careers@sectros.com?subject=Open%20Application%20-%20Sectros"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all"
            >
              <Mail className="w-4 h-4" />
              Send Open Application
            </a>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-all"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-3">Want to collaborate with our engineering team?</h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
            Check out our developer docs and public API endpoints to see how we build software primitives for modern hospitality.
          </p>
          <Link
            to="/api-docs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
          >
            Explore API Documentation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

