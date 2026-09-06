import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Clock, ArrowRight, Star, Award, ChevronRight, Building, Coffee, Utensils, Scissors, Calendar } from 'lucide-react';

const caseStudies = [
  {
    id: 1,
    slug: 'maison-laurent',
    name: 'Maison Laurent',
    location: 'Paris, France',
    category: 'Restaurant',
    gradient: 'from-amber-500 to-rose-500',
    stat: '+42%',
    statLabel: 'increase in dinner covers',
    summary: 'Doubled dinner service covers within 60 days of switching to Sectros reservation management and table deposits.',
    readTime: '5 min read',
    tags: ['Table Deposits', 'Floor Plan', 'Guest CRM'],
  },
  {
    id: 2,
    slug: 'the-harbour-club',
    name: 'The Harbour Club',
    location: 'London, UK',
    category: 'Hotel',
    gradient: 'from-blue-500 to-indigo-500',
    stat: '+£3,200/mo',
    statLabel: 'additional F&B revenue',
    summary: 'Increased F&B revenue by connecting bookings and guest preferences directly to their PMS and floor operations.',
    readTime: '7 min read',
    tags: ['Multi-Room', 'Guest Profiling', 'Staff Shifts'],
  },
  {
    id: 3,
    slug: 'bloom-cafe',
    name: 'Bloom Cafe & Roastery',
    location: 'Berlin, Germany',
    category: 'Cafe',
    gradient: 'from-emerald-500 to-teal-500',
    stat: '65%',
    statLabel: 'fewer no-shows',
    summary: 'Automated SMS confirmations and WhatsApp reminders eliminated nearly all last-minute weekend cancellations.',
    readTime: '4 min read',
    tags: ['WhatsApp Reminders', 'Online Ordering', 'Waitlist'],
  },
  {
    id: 4,
    slug: 'rituals-spa',
    name: 'Rituals Spa & Wellness',
    location: 'Dubai, UAE',
    category: 'Salon',
    gradient: 'from-pink-500 to-purple-500',
    stat: '3×',
    statLabel: 'rebooking rate',
    summary: 'Guest CRM follow-up sequences and automated client recall campaigns tripled their monthly repeat booking rate.',
    readTime: '6 min read',
    tags: ['Client CRM', 'Automated Recall', 'Deposit Protection'],
  },
  {
    id: 5,
    slug: 'the-loft-events',
    name: 'The Loft Event Space',
    location: 'New York, USA',
    category: 'Event Venue',
    gradient: 'from-violet-500 to-indigo-600',
    stat: '40%',
    statLabel: 'less administrative time',
    summary: 'Replaced 4 disparate spreadsheets and paper binders with one unified Sectros workspace for floor plans and inquiries.',
    readTime: '5 min read',
    tags: ['Event Floor Plans', 'Deposit Invoicing', 'Unified Inbox'],
  },
  {
    id: 6,
    slug: 'sakura-rooftop',
    name: 'Sakura Sky Lounge',
    location: 'Singapore',
    category: 'Restaurant',
    gradient: 'from-orange-500 to-red-500',
    stat: '98%',
    statLabel: 'guest satisfaction rate',
    summary: 'Our 24/7 AI voice receptionist answered 300+ phone calls per week during peak service with zero missed reservations.',
    readTime: '8 min read',
    tags: ['AI Phone Receptionist', 'VIP Tagging', 'TSE Cash Book'],
  },
];

const categories = ['All', 'Restaurant', 'Hotel', 'Cafe', 'Salon', 'Event Venue'];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function CaseStudiesPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? caseStudies
    : caseStudies.filter(c => c.category === activeFilter);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-6 border border-indigo-500/30">
              <Award className="w-3.5 h-3.5" />
              Customer Success Stories
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Real Results from Real Venues Worldwide
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Discover how restaurants, boutique hotels, cafes, and hospitality groups use Sectros to eliminate no-shows, optimize table turnover, and scale operations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeFilter === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid of Case Studies */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          key={activeFilter}
          initial="initial"
          animate="animate"
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:border-slate-300"
            >
              {/* Colored top gradient bar */}
              <div className={`h-2.5 w-full bg-gradient-to-r ${item.gradient}`} />

              <div className="p-7 md:p-8 flex flex-col flex-1">
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.readTime}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-6">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {item.location}
                </div>

                {/* Big Metric Box */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                  <div className="text-3xl md:text-4xl font-black text-indigo-600 tracking-tight">
                    {item.stat}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                    {item.statLabel}
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">
                  {item.summary}
                </p>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Link to detail */}
                <Link
                  to={`/customers/${item.slug}`}
                  className="mt-auto inline-flex items-center justify-between text-sm font-semibold text-slate-900 group-hover:text-indigo-600 border-t border-slate-100 pt-4 transition-colors"
                >
                  <span>Read full story</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to write your venue's success story?
          </h2>
          <p className="text-slate-400 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of hospitality operators who trust Sectros as their central booking, floor, and staff platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 transition-all text-center"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              to="/features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 text-slate-200 font-semibold hover:bg-slate-800 transition-all text-center"
            >
              Explore All Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

