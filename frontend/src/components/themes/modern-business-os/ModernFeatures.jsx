import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar, LayoutGrid, Users, Bot, BarChart3, Puzzle,
  ArrowRight, Check, Shield, Clock, Key, Database,
  Smartphone, Mail, Bell, CreditCard, Settings, Star,
  MapPin, Search, ChevronRight, Clock3, DollarSign,
  TrendingUp, PieChart, Activity, Globe, Github, MessageSquare,
  Zap, RefreshCw, Layers, Lock, Server, Plus, X, Menu
} from 'lucide-react';
import { useCmsContent } from '../../../hooks/useCmsContent';

const TAB_ICONS = {
  reservations: Calendar,
  floorplan: LayoutGrid,
  crm: Users,
  automation: Bot,
  analytics: BarChart3,
  integrations: Puzzle,
};

const TAB_IDS = ['reservations', 'floorplan', 'crm', 'automation', 'analytics', 'integrations'];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, staggerChildren: 0.1 },
};

export default function ModernFeatures() {
  const { get, getArray } = useCmsContent('features');
  const [activeTab, setActiveTab] = useState('reservations');
  const [scrolledTabs, setScrolledTabs] = useState(false);
  const tabsRef = useRef(null);

  const tabContent = {
    reservations: { badge: get('tabContent.reservations.badge'), heading: get('tabContent.reservations.heading'), paragraph: get('tabContent.reservations.paragraph') },
    floorPlan: { badge: get('tabContent.floorPlan.badge'), heading: get('tabContent.floorPlan.heading'), paragraph: get('tabContent.floorPlan.paragraph') },
    crm: { badge: get('tabContent.crm.badge'), heading: get('tabContent.crm.heading'), paragraph: get('tabContent.crm.paragraph') },
    automation: { badge: get('tabContent.automation.badge'), heading: get('tabContent.automation.heading'), paragraph: get('tabContent.automation.paragraph') },
    analytics: { badge: get('tabContent.analytics.badge'), heading: get('tabContent.analytics.heading'), paragraph: get('tabContent.analytics.paragraph') },
    integrations: { badge: get('tabContent.integrations.badge'), heading: get('tabContent.integrations.heading'), paragraph: get('tabContent.integrations.paragraph') },
  };

  const TABS = get('tabs.labels').split(',').map((label, i) => ({
    id: TAB_IDS[i],
    label: label.trim(),
    icon: TAB_ICONS[TAB_IDS[i]],
  }));

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledTabs(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full bg-white text-slate-900 font-sans overflow-hidden">

      {/* HERO */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-6"
            >
              <Zap className="w-4 h-4" />
              {get('hero.badge')}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
            >
              {get('hero.heading')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              {get('hero.paragraph')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <Link
                to="/book-demo"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
              >
                {get('hero.cta_primary')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 px-6 py-3 rounded-xl font-semibold border border-slate-200 hover:border-slate-300 transition-all"
              >
                {get('hero.cta_secondary')}
              </Link>
            </motion.div>
          </div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-4 bg-gradient-to-t from-blue-600/5 via-blue-600/5 to-transparent rounded-2xl blur-xl" />
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center text-xs text-slate-400 font-medium">sectros.app/dashboard</div>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-12 gap-4 md:gap-6">
                  {/* Sidebar */}
                  <div className="col-span-12 md:col-span-3 bg-slate-50 rounded-xl p-4 border border-slate-100 hidden md:block">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-sm">Sectros</span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { icon: LayoutGrid, label: 'Dashboard', active: true },
                        { icon: Calendar, label: 'Reservations' },
                        { icon: Users, label: 'Guests' },
                        { icon: BarChart3, label: 'Analytics' },
                        { icon: Settings, label: 'Settings' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item.active
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Main Content */}
                  <div className="col-span-12 md:col-span-9 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Good evening, Vincent</h3>
                        <p className="text-sm text-slate-400">Tonight's service overview</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200 text-xs font-bold">
                          VJ
                        </div>
                      </div>
                    </div>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Bookings', value: '38', change: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Revenue', value: '$14.2k', change: '+8%', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Tables', value: '22/28', change: '78%', color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Waitlist', value: '6', change: '-3', color: 'text-rose-600', bg: 'bg-rose-50' },
                      ].map((kpi) => (
                        <div key={kpi.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="text-xs text-slate-400 font-medium mb-1">{kpi.label}</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-slate-900">{kpi.value}</span>
                            <span className={`text-xs font-semibold ${kpi.color} ${kpi.bg} px-1.5 py-0.5 rounded-md`}>{kpi.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Upcoming */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-900">Tonight's Reservations</h4>
                        <span className="text-xs text-blue-600 font-semibold">View all</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: 'Sarah Chen', guests: 4, time: '7:30 PM', table: 'Table 12', status: 'Confirmed' },
                          { name: 'James Miller', guests: 2, time: '8:00 PM', table: 'Table 5', status: 'Seated' },
                          { name: 'Emily Park', guests: 6, time: '8:30 PM', table: 'Table 8', status: 'Pending' },
                        ].map((res) => (
                          <div key={res.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                                {res.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{res.name}</div>
                                <div className="text-xs text-slate-400">{res.guests} guests · {res.table}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-slate-900">{res.time}</div>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                res.status === 'Confirmed' ? 'bg-green-50 text-green-700' :
                                res.status === 'Seated' ? 'bg-blue-50 text-blue-700' :
                                'bg-amber-50 text-amber-700'
                              }`}>{res.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TABS NAVIGATION */}
      <div
        ref={tabsRef}
        className={`sticky top-0 z-30 transition-all duration-300 ${
          scrolledTabs ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200' : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-1 py-4 scrollbar-none justify-center">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.section
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="py-12 md:py-20 px-6 bg-slate-50/50"
        >
          <div className="max-w-7xl mx-auto">
            {activeTab === 'reservations' && <ReservationsContent {...tabContent.reservations} />}
            {activeTab === 'floorplan' && <FloorPlanContent {...tabContent.floorPlan} />}
            {activeTab === 'crm' && <CRMContent {...tabContent.crm} />}
            {activeTab === 'automation' && <AutomationContent {...tabContent.automation} />}
            {activeTab === 'analytics' && <AnalyticsContent {...tabContent.analytics} />}
            {activeTab === 'integrations' && <IntegrationsContent {...tabContent.integrations} />}
          </div>
        </motion.section>
      </AnimatePresence>

      {/* SECURITY & RELIABILITY */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-4">
              {get('security.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              {get('security.heading')}
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              {get('security.paragraph')}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getArray('security.cards').map((item, i) => {
              const cardIcons = [Server, Shield, Lock];
              const iconColors = ['text-emerald-600', 'text-blue-600', 'text-purple-600'];
              const iconBgs = ['bg-emerald-50', 'bg-blue-50', 'bg-purple-50'];
              const Icon = cardIcons[i] || Shield;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:border-slate-300 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${iconBgs[i] || 'bg-blue-50'} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${iconColors[i] || 'text-blue-600'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-6 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            {...fadeUp}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4"
          >
            {get('cta.heading')}
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg md:text-xl text-blue-100 leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            {get('cta.paragraph')}
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/book-demo"
              className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-xl shadow-blue-900/20"
            >
              {get('cta.cta_primary')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white px-8 py-3.5 rounded-xl font-semibold text-base border border-white/20 hover:border-white/40 transition-all"
            >
              {get('cta.cta_secondary')}
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

/* ============ TAB CONTENT COMPONENTS ============ */

function ReservationsContent({ badge, heading, paragraph }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <motion.div variants={stagger} initial="initial" whileInView="whileInView">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          <Calendar className="w-3.5 h-3.5" />
          {badge}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {heading}
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed mb-6">
          {paragraph}
        </p>
        <div className="space-y-4">
          {[
            { icon: Globe, title: 'Online Booking Widget', desc: 'Embed on your website or social profiles for 24/7 reservations.' },
            { icon: Clock, title: 'Real-time Availability', desc: 'Instantly sync your floor plan — no double bookings, ever.' },
            { icon: CreditCard, title: 'Deposits & Pre-payments', desc: 'Require card details or upfront deposits to reduce no-shows.' },
            { icon: Bell, title: 'Automated Reminders', desc: 'SMS and email reminders cut no-show rates by up to 40%.' },
          ].map((feat, i) => (
            <motion.div key={feat.title} variants={stagger} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <feat.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                <p className="text-sm text-slate-500">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium ml-2">Booking Calendar</span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <span className="text-sm font-bold text-slate-900">June 2025</span>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <span key={d} className={`text-xs font-semibold w-8 text-center ${i === 0 || i === 6 ? 'text-red-400' : 'text-slate-400'}`}>
                  {d[0]}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2;
              const isToday = day === 14;
              const hasBooking = [5, 6, 12, 14, 19, 20, 26, 27].includes(day);
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                    day < 1 || day > 30 ? 'text-slate-200' :
                    isToday ? 'bg-blue-600 text-white shadow-sm' :
                    hasBooking ? 'bg-blue-50 text-blue-700 font-bold' :
                    'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {day > 0 && day <= 30 ? day : ''}
                </div>
              );
            })}
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upcoming</div>
            {[
              { time: '5:30 PM', name: 'Johnson party', guests: 8, status: 'Deposit' },
              { time: '6:45 PM', name: 'Anniversary dinner', guests: 2, status: 'Confirmed' },
              { time: '8:00 PM', name: 'Corporate event', guests: 14, status: 'Pending' },
            ].map((b, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-600 w-14">{b.time}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{b.name}</div>
                    <div className="text-xs text-slate-400">{b.guests} guests</div>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  b.status === 'Deposit' ? 'bg-amber-50 text-amber-700' :
                  b.status === 'Confirmed' ? 'bg-green-50 text-green-700' :
                  'bg-slate-100 text-slate-500'
                }`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FloorPlanContent({ badge, heading, paragraph }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="order-last lg:order-first"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium ml-2">Floor Plan Editor</span>
          </div>
          <div className="p-5">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[320px] relative">
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <div className="flex gap-2">
                  {['All', 'Available', 'Occupied', 'Reserved'].map((l) => (
                    <span key={l} className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      l === 'All' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                    }`}>{l}</span>
                  ))}
                </div>
                <span className="text-xs text-slate-400">Drag to rearrange</span>
              </div>
              <div className="mt-10 grid grid-cols-4 gap-3">
                {[
                  { id: 'T1', seats: 2, status: 'occupied' },
                  { id: 'T2', seats: 4, status: 'available' },
                  { id: 'T3', seats: 4, status: 'reserved' },
                  { id: 'T4', seats: 6, status: 'available' },
                  { id: 'T5', seats: 2, status: 'available' },
                  { id: 'T6', seats: 8, status: 'occupied' },
                  { id: 'T7', seats: 4, status: 'available' },
                  { id: 'T8', seats: 2, status: 'reserved' },
                ].map((t) => (
                  <div
                    key={t.id}
                    className={`rounded-xl p-3 border-2 text-center transition-all ${
                      t.status === 'occupied' ? 'bg-rose-50 border-rose-300' :
                      t.status === 'reserved' ? 'bg-amber-50 border-amber-300' :
                      'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-bold ${
                      t.status === 'occupied' ? 'bg-rose-200 text-rose-700' :
                      t.status === 'reserved' ? 'bg-amber-200 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {t.id}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{t.seats} seats</div>
                    <div className={`text-[10px] font-semibold ${
                      t.status === 'occupied' ? 'text-rose-600' :
                      t.status === 'reserved' ? 'text-amber-600' :
                      'text-emerald-600'
                    }`}>{t.status}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-2 bg-slate-100 rounded-lg border border-dashed border-slate-300 text-center">
                <span className="text-xs text-slate-400 font-medium">Bar Area</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={stagger} initial="initial" whileInView="whileInView">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          <LayoutGrid className="w-3.5 h-3.5" />
          {badge}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {heading}
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed mb-6">
          {paragraph}
        </p>
        <div className="space-y-4">
          {[
            { icon: LayoutGrid, title: 'Visual Table Editor', desc: 'Arrange tables, booths, and sections with intuitive drag-and-drop.' },
            { icon: MapPin, title: 'Real-time Status Tracking', desc: 'See at a glance which tables are available, occupied, or reserved.' },
            { icon: Users, title: 'Server Assignment', desc: 'Assign sections to specific staff and balance workload automatically.' },
            { icon: RefreshCw, title: 'Instant Merge & Split', desc: 'Combine or divide tables for large parties without skipping a beat.' },
          ].map((feat, i) => (
            <motion.div key={feat.title} variants={stagger} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <feat.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                <p className="text-sm text-slate-500">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CRMContent({ badge, heading, paragraph }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <motion.div variants={stagger} initial="initial" whileInView="whileInView">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          <Users className="w-3.5 h-3.5" />
          {badge}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {heading}
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed mb-6">
          {paragraph}
        </p>
        <div className="space-y-4">
          {[
            { icon: Star, title: 'Guest Profiles', desc: 'Comprehensive profiles with photos, contact info, and visit history.' },
            { icon: Search, title: 'Smart Search & Tags', desc: 'Find any guest instantly. Tag by preferences, VIP status, or dietary needs.' },
            { icon: MessageSquare, title: 'Communication History', desc: 'View every SMS, email, and note in a unified timeline.' },
            { icon: Bell, title: 'Automated Marketing', desc: 'Send birthday offers, re-engagement campaigns, and personalized promos.' },
          ].map((feat, i) => (
            <motion.div key={feat.title} variants={stagger} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <feat.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                <p className="text-sm text-slate-500">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium ml-2">Guest Profile</span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                SC
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Sarah Chen</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> sarah@email.com</span>
                  <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> +1 (555) 234-5678</span>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">VIP</span>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {['Regular', 'Wine Lover', 'Anniversary', 'No shellfish'].map((tag) => (
                <span key={tag} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  tag === 'VIP' || tag === 'Regular' ? 'bg-blue-50 text-blue-700' :
                  tag === 'No shellfish' ? 'bg-red-50 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{tag}</span>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visit History</h4>
                <span className="text-xs text-blue-600 font-semibold">12 visits</span>
              </div>
              <div className="space-y-2">
                {[
                  { date: 'Jun 3, 2025', type: 'Dinner', guests: 4, spent: '$286', feedback: 'Excellent' },
                  { date: 'May 18, 2025', type: 'Brunch', guests: 2, spent: '$94', feedback: 'Great' },
                  { date: 'May 2, 2025', type: 'Dinner', guests: 6, spent: '$412', feedback: 'Good' },
                ].map((v, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-20">{v.date}</span>
                      <span className="text-xs font-semibold text-slate-900">{v.type}</span>
                      <span className="text-xs text-slate-400">{v.guests} guests</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">{v.spent}</span>
                      <span className={`text-xs ml-2 ${
                        v.feedback === 'Excellent' ? 'text-emerald-600' :
                        v.feedback === 'Great' ? 'text-blue-600' : 'text-slate-400'
                      }`}>{v.feedback}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AutomationContent({ badge, heading, paragraph }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="order-last lg:order-first"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium ml-2">Workflow Builder</span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-700">Trigger</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-amber-50 text-amber-700">Condition</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">Action</span>
            </div>
            <div className="space-y-3">
              {[
                {
                  trigger: 'New booking created',
                  icon: Calendar,
                  color: 'text-blue-700 bg-blue-50 border-blue-200',
                  arrow: true,
                },
                {
                  trigger: 'Guest is VIP',
                  icon: Star,
                  color: 'text-amber-700 bg-amber-50 border-amber-200',
                  arrow: true,
                },
                {
                  trigger: 'Send welcome SMS',
                  icon: MessageSquare,
                  color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  arrow: false,
                },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i}>
                    <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${step.color}`}>
                      <Icon className="w-5 h-5 shrink-0" />
                      <div className="flex-1 text-sm font-semibold">{step.trigger}</div>
                      <Zap className="w-4 h-4 opacity-50" />
                    </div>
                    {step.arrow && (
                      <div className="flex justify-center py-1">
                        <ChevronRight className="w-4 h-4 text-slate-300 rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="mt-4 p-3 rounded-xl border border-dashed border-slate-300 text-center">
                <span className="text-xs text-slate-400 font-medium">+ Add step</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={stagger} initial="initial" whileInView="whileInView">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          <Bot className="w-3.5 h-3.5" />
          {badge}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {heading}
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed mb-6">
          {paragraph}
        </p>
        <div className="space-y-4">
          {[
            { icon: Zap, title: 'Trigger-based Actions', desc: 'Set triggers like new bookings, cancellations, or check-ins.' },
            { icon: Mail, title: 'Smart Messaging', desc: 'Auto-send SMS, email, or push notifications at every touchpoint.' },
            { icon: Clock, title: 'Timed Sequences', desc: 'Schedule follow-ups, review requests, and re-engagement campaigns.' },
            { icon: Database, title: 'Data Sync', desc: 'Push guest data to your CRM, email tools, or analytics platform.' },
          ].map((feat, i) => (
            <motion.div key={feat.title} variants={stagger} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <feat.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                <p className="text-sm text-slate-500">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function AnalyticsContent({ badge, heading, paragraph }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <motion.div variants={stagger} initial="initial" whileInView="whileInView">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          <BarChart3 className="w-3.5 h-3.5" />
          {badge}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {heading}
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed mb-6">
          {paragraph}
        </p>
        <div className="space-y-4">
          {[
            { icon: DollarSign, title: 'Revenue Tracking', desc: 'Monitor daily, weekly, and monthly revenue with drill-down detail.' },
            { icon: TrendingUp, title: 'Performance KPIs', desc: 'Average check size, table turn time, covers per hour, and more.' },
            { icon: PieChart, title: 'Segmentation', desc: 'Break down revenue by service type, time slot, or guest segment.' },
            { icon: Activity, title: 'Live Dashboard', desc: 'Real-time metrics displayed on TV screens or manager tablets.' },
          ].map((feat, i) => (
            <motion.div key={feat.title} variants={stagger} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <feat.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                <p className="text-sm text-slate-500">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium ml-2">Analytics Dashboard</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Revenue Today', value: '$4,820', change: '+14%', up: true },
                { label: 'Occupancy Rate', value: '82%', change: '+6%', up: true },
                { label: 'Avg. Check Size', value: '$64.50', change: '-3%', up: false },
                { label: 'Covers Served', value: '187', change: '+22%', up: true },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{kpi.label}</div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-bold text-slate-900">{kpi.value}</span>
                    <span className={`text-[10px] font-bold ${kpi.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Revenue</span>
                <span className="text-xs text-blue-600 font-semibold">View report</span>
              </div>
              <div className="flex items-end gap-2 h-24">
                {[
                  { day: 'Mon', value: 65 },
                  { day: 'Tue', value: 45 },
                  { day: 'Wed', value: 80 },
                  { day: 'Thu', value: 55 },
                  { day: 'Fri', value: 95 },
                  { day: 'Sat', value: 100 },
                  { day: 'Sun', value: 70 },
                ].map((bar) => (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                      style={{ height: `${bar.value}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-medium">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function IntegrationsContent({ badge, heading, paragraph }) {
  const integrations = [
    { name: 'OpenTable', icon: Calendar, color: 'bg-red-50 text-red-600 border-red-200' },
    { name: 'Mailchimp', icon: Mail, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    { name: 'Slack', icon: MessageSquare, color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { name: 'Stripe', icon: CreditCard, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { name: 'Google', icon: Globe, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { name: 'GitHub', icon: Github, color: 'bg-slate-50 text-slate-600 border-slate-200' },
    { name: 'Zapier', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { name: 'Salesforce', icon: Database, color: 'bg-sky-50 text-sky-600 border-sky-200' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <motion.div variants={stagger} initial="initial" whileInView="whileInView">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
          <Puzzle className="w-3.5 h-3.5" />
          {badge}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {heading}
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed mb-6">
          {paragraph}
        </p>
        <div className="space-y-4">
          {[
            { icon: Layers, title: 'Two-way Sync', desc: 'Data flows both ways — bookings, guests, and payments stay in sync.' },
            { icon: Key, title: 'API-first Design', desc: 'Full REST API and webhooks for custom integrations.' },
            { icon: Shield, title: 'Secure Connections', desc: 'OAuth 2.0, API keys, and granular permission scopes.' },
            { icon: Globe, title: 'Growing Marketplace', desc: 'New integrations added monthly based on customer requests.' },
          ].map((feat, i) => (
            <motion.div key={feat.title} variants={stagger} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <feat.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                <p className="text-sm text-slate-500">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium ml-2">Integration Marketplace</span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">42 available</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {integrations.map((int) => {
                const Icon = int.icon;
                return (
                  <div
                    key={int.name}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all bg-white cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl ${int.color.split(' ')[0]} flex items-center justify-center border ${int.color.split(' ').slice(2).join(' ')}`}>
                      <Icon className={`w-5 h-5 ${int.color.split(' ')[1]}`} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{int.name}</span>
                    <div className="ml-auto">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-xl border border-dashed border-slate-300 text-center">
              <span className="text-xs text-slate-400 font-medium">
                <span className="text-blue-600 font-semibold cursor-pointer">View all 42 integrations</span>
                {' '}or{' '}
                <span className="text-blue-600 font-semibold cursor-pointer">request a custom one</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
