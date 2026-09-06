import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, ChevronRight, Zap, Bot, Users, LayoutGrid, Calendar, Puzzle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

const guidesData = [
  {
    id: 1,
    title: 'Setting Up Your Venue Profile & Opening Hours',
    description: 'Learn how to configure your business address, public booking schedule, holidays, and dining policies.',
    category: 'Getting Started',
    difficulty: 'Beginner',
    readTime: '5 min read',
    icon: Calendar,
  },
  {
    id: 2,
    title: 'Inviting Your First Staff Members & Role Permissions',
    description: 'Grant custom access levels for Front of House, Shift Managers, Kitchen Supervisors, and Accountants.',
    category: 'Getting Started',
    difficulty: 'Beginner',
    readTime: '3 min read',
    icon: Users,
  },
  {
    id: 3,
    title: 'Embedding the Online Booking Widget on Your Website',
    description: 'Add a clean, branded reservation widget or direct link to WordPress, Squarespace, Webflow, or Shopify.',
    category: 'Getting Started',
    difficulty: 'Beginner',
    readTime: '8 min read',
    icon: Puzzle,
  },
  {
    id: 4,
    title: 'Designing Your Interactive 2D Floor Plan',
    description: 'Drag and drop tables, dining zones, bar stools, and outdoor patio configurations with live occupancy counts.',
    category: 'Floor Plan',
    difficulty: 'Beginner',
    readTime: '10 min read',
    icon: LayoutGrid,
  },
  {
    id: 5,
    title: 'Managing Table Sections, Combinations & Minimum Covers',
    description: 'Group adjacent 2-tops into 4-person booths and configure automated table combination logic for big parties.',
    category: 'Floor Plan',
    difficulty: 'Intermediate',
    readTime: '7 min read',
    icon: LayoutGrid,
  },
  {
    id: 6,
    title: 'Setting Up Reservation Rules, Lead Times & Blackout Dates',
    description: 'Prevent overbooking on high-demand holidays by setting custom party size caps and deposit triggers.',
    category: 'Reservations',
    difficulty: 'Intermediate',
    readTime: '12 min read',
    icon: Calendar,
  },
  {
    id: 7,
    title: 'Automated SMS & WhatsApp Reminder Workflows',
    description: 'Configure multi-step reminders (24h before, 2h before) to capture dietary restrictions and prevent no-shows.',
    category: 'Reservations',
    difficulty: 'Intermediate',
    readTime: '8 min read',
    icon: Zap,
  },
  {
    id: 8,
    title: 'Creating Weekly Shift Schedules & Live Punch Clocks',
    description: 'Publish rota plans, allow team shift swaps, and track live clock-in and clock-out timestamps with staff PINs.',
    category: 'Staff & Payroll',
    difficulty: 'Intermediate',
    readTime: '10 min read',
    icon: Users,
  },
  {
    id: 9,
    title: 'Processing Digital Payslips & Signature Approvals',
    description: 'Export gross-to-net reports, calculate hourly wages with tip share, and capture digital signatures on canvas.',
    category: 'Staff & Payroll',
    difficulty: 'Advanced',
    readTime: '15 min read',
    icon: ShieldCheck,
  },
  {
    id: 10,
    title: 'Connecting WhatsApp Cloud API for Direct Guest Inquiries',
    description: 'Synchronize your official Meta Business account to chat with diners, confirm seats, and answer FAQs.',
    category: 'Integrations',
    difficulty: 'Advanced',
    readTime: '20 min read',
    icon: Puzzle,
  },
  {
    id: 11,
    title: 'Enabling Stripe Deposits for Large Parties & Special Events',
    description: 'Collect per-person deposits, cancellation authorization holds, and automatic refunds for timely cancellations.',
    category: 'Integrations',
    difficulty: 'Intermediate',
    readTime: '12 min read',
    icon: Zap,
  },
  {
    id: 12,
    title: 'Configuring the 24/7 AI Phone Voice Receptionist',
    description: 'Teach the AI agent your menu, special events, seating limits, and voice tone to handle inbound booking phone calls.',
    category: 'AI Features',
    difficulty: 'Advanced',
    readTime: '25 min read',
    icon: Bot,
  },
];

const categories = [
  'All',
  'Getting Started',
  'Floor Plan',
  'Reservations',
  'Staff & Payroll',
  'Integrations',
  'AI Features'
];

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = guidesData.filter((guide) => {
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Advanced':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Hero */}
      <section className="bg-white border-b border-slate-200/80 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-100">
              <BookOpen className="w-3.5 h-3.5" />
              Official Documentation & Playbooks
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Step-by-Step Guides for Hospitality Teams
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              From configuring your first floor plan to connecting automated WhatsApp messaging and DATEV tax exports.
            </p>

            {/* Search Input */}
            <div className="mt-8 max-w-xl mx-auto relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search guides (e.g. floor plan, WhatsApp, deposits)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area: Sidebar + Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sticky Left Category Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm lg:sticky lg:top-24">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2 mb-1">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => {
                const count = cat === 'All'
                  ? guidesData.length
                  : guidesData.filter((g) => g.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === cat ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 px-2">
              <div className="text-xs font-semibold text-slate-800 mb-1">Need real-time support?</div>
              <p className="text-xs text-slate-500 mb-3">Our concierge support team is active 24/7 for all tiers.</p>
              <Link
                to="/help"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Visit Help Center <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Guides List */}
          <div className="lg:col-span-3 space-y-4">
            {filteredGuides.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No matching guides found</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting your search query or pick a different category from the sidebar.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredGuides.map((guide) => {
                const IconComponent = guide.icon;
                return (
                  <motion.div
                    key={guide.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-slate-300 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <IconComponent className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getDifficultyColor(guide.difficulty)}`}>
                            {guide.difficulty}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {guide.readTime}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-medium text-slate-500">
                            {guide.category}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                          {guide.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          {guide.description}
                        </p>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            to="/help"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            Read Guide in Help Center <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Help Center Callout */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Can't find the exact topic you're looking for?
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-6">
            Search our comprehensive knowledge base or submit a ticket directly to our hospitality onboarding specialists.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/help"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
            >
              Open Help Center
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold text-sm transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

