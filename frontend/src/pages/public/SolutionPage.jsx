import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {UtensilsCrossed, Coffee, Scissors, Building, CheckCircle2, ArrowRight, Zap, Briefcase, Users, Smartphone, BarChart3, ShieldCheck} from 'lucide-react';

const SOLUTION_CONTENT = {
  restaurants: {
    title: 'Precision Tools for High-Performance Restaurants',
    icon: UtensilsCrossed,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    badge: 'Fine Dining & Casual',
    heroDesc: 'From table turns to kitchen efficiency, Sectros provides the unified operating system your restaurant needs to scale.',
    features: [
      { title: 'Commission-Free Bookings', desc: 'Own your guest relationships and stop paying per-cover fees.', icon: Zap },
      { title: 'Live Floor Planner', desc: 'Drag-and-drop table management with real-time status indicators.', icon: Users },
      { title: 'Kitchen Display (KDS)', desc: 'Direct routing from booking/POS to kitchen prep stations.', icon: Smartphone }
    ],
    testimonial: {
      quote: "Sectros transformed how we handle our Friday night rush. The floor plan visibility is a game changer.",
      author: "Chef Marcelle, Saveur Bistro"
    }
  },
  cafes: {
    title: 'Fast-Paced Solutions for Modern Cafes',
    icon: Coffee,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    badge: 'Cafes & Bakeries',
    heroDesc: 'Manage high volumes with ease. Our QR ordering and quick-pay features are designed for the speed of coffee culture.',
    features: [
      { title: 'QR Scan & Pay', desc: 'Let customers order and pay from their table to reduce lines.', icon: Smartphone },
      { title: 'Inventory Alerts', desc: 'Never run out of your best-selling beans with automated low-stock triggers.', icon: BarChart3 },
      { title: 'Loyalty Built-in', desc: 'Reward your regulars automatically without plastic cards.', icon: Briefcase }
    ],
    testimonial: {
      quote: "Our morning line-ups are 30% faster since we implemented Sectros's mobile ordering.",
      author: "Julian, Urban Brew"
    }
  },
  salons: {
    title: 'Elevated Scheduling for Salons & Spas',
    icon: Scissors,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    badge: 'Beauty & Wellness',
    heroDesc: 'Sophisticated appointment booking that respects your time and your clients\' preferences.',
    features: [
      { title: 'Smart Scheduling', desc: 'Avoid double-bookings and optimize your chair utilization.', icon: Zap },
      { title: 'Deposit Protection', desc: 'Secure high-value appointments with upfront card holds.', icon: ShieldCheck },
      { title: 'Client Profiles', desc: 'Keep track of preferences, formulas, and history in one place.', icon: Users }
    ],
    testimonial: {
      quote: "Finally, a system that understands the complexity of salon timing. My stylists love it.",
      author: "Elena, Luminous Spa"
    }
  },
  hospitality: {
    title: 'Unified Management for Hotels & Events',
    icon: Building,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    badge: 'Hotels & Venues',
    heroDesc: 'Bridge the gap between your rooms and your dining room with integrated guest intelligence.',
    features: [
      { title: 'Concierge Dashboard', desc: 'Empower your staff to book dining for guests instantly.', icon: Users },
      { title: 'Event Space Planner', desc: 'Manage private bookings and large parties with dedicated flows.', icon: BarChart3 },
      { title: 'Enterprise Analytics', desc: 'Compare performance across all your F&B outlets in real-time.', icon: ShieldCheck }
    ],
    testimonial: {
      quote: "Sectros gives us a 360-degree view of our hotel guests' dining habits. Invaluable data.",
      author: "Sarah, Grand Horizon Resorts"
    }
  }
};

export default function SolutionPage() {
  const { slug } = useParams();
  const content = SOLUTION_CONTENT[slug] || SOLUTION_CONTENT.restaurants;

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-linear-to-b from-blue-600/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-20 h-20 rounded-4xl ${content.bg} flex items-center justify-center mb-8 border border-white/10`}
          >
            <content.icon className={`w-10 h-10 ${content.color}`} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className={`text-xs font-black uppercase tracking-[0.2em] ${content.color} mb-4 block`}>Solutions for {content.badge}</span>
            <h1 className="text-4xl md:text-7xl font-black text-foreground tracking-tight mb-8 max-w-4xl leading-[1.1]">
              {content.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              {content.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-12 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group active:scale-95">
                Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contact" className="px-12 py-5 bg-card border border-border hover:bg-muted text-foreground rounded-2xl font-black text-lg transition-all active:scale-95">
                Speak to Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-card/50 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.features.map((feat, i) => (
              <motion.div 
                key={i}
                variants={fadeIn}
                initial="initial"
                whileInView="whileInView"
                className="p-8 rounded-4xl bg-card border border-border hover:border-blue-500/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${content.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feat.icon className={`w-6 h-6 ${content.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            variants={fadeIn}
            initial="initial"
            whileInView="whileInView"
            className="relative p-12 md:p-20 rounded-[3rem] bg-linear-to-br from-blue-600/10 to-transparent border border-blue-500/20 text-center"
          >
            <Briefcase className="w-12 h-12 text-blue-400 absolute -top-6 left-1/2 -translate-x-1/2" />
            <blockquote className="text-2xl md:text-3xl font-medium text-foreground italic mb-8 leading-snug">
              "{content.testimonial.quote}"
            </blockquote>
            <cite className="not-italic">
              <span className="font-black text-foreground uppercase tracking-widest text-sm">{content.testimonial.author}</span>
            </cite>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center border border-primary/10 bg-linear-to-b from-primary/5 to-transparent p-24 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[120px] pointer-events-none" />
          <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter italic uppercase text-foreground relative z-10">Ready to transform your service?</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto relative z-10 font-medium">Join the future of hospitality with Sectros. 14-day free trial, no credit card required.</p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-14 py-6 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all group shadow-xl shadow-primary/20 relative z-10"
          >
            Get Started Now
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
