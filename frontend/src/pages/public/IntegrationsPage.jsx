import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, CheckCircle2, ExternalLink, Box, Layers, Cpu, Globe } from 'lucide-react';
import api from '../../services/centralApi';

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true }
};

const child = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

// Floating animation for logos
const floating = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Brand SVG logos
const FacebookLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const WhatsAppLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const GmailLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

const defaultIntegrations = [
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'Social Media',
    description: 'Sync your business page, accept reservations directly from Facebook, and automate customer messaging.',
    color: '#1877F2',
    bgClass: 'bg-[#1877F2]/5 border-[#1877F2]/20',
    textClass: 'text-[#1877F2]',
    Logo: FacebookLogo,
    features: ['Facebook Page Sync', 'Messenger Chatbot', 'Booking Button on Page', 'Review Aggregation'],
    badge: 'Official Partner',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Social Media',
    description: 'Link your Instagram profile to accept bookings via DMs, display your menu, and showcase your brand.',
    color: '#E1306C',
    bgClass: 'bg-[#E1306C]/5 border-[#E1306C]/20',
    textClass: 'text-[#E1306C]',
    Logo: InstagramLogo,
    features: ['Instagram DM Booking', 'Story Booking Link', 'Profile Bio Link', 'Auto-Reply Messages'],
    badge: 'Popular',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'Messaging',
    description: 'Send automated booking confirmations, reminders, and updates to guests directly via WhatsApp.',
    color: '#25D366',
    bgClass: 'bg-[#25D366]/5 border-[#25D366]/20',
    textClass: 'text-[#25D366]',
    Logo: WhatsAppLogo,
    features: ['WhatsApp Confirmations', 'Automated Reminders', 'Two-Way Messaging', 'Business API Integration'],
    badge: 'Most Used',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Email',
    description: 'Connect your Gmail to send branded email confirmations, manage guest communications, and sync your inbox.',
    color: '#EA4335',
    bgClass: 'bg-[#EA4335]/5 border-[#EA4335]/20',
    textClass: 'text-[#EA4335]',
    Logo: GmailLogo,
    features: ['Branded Email Templates', 'Two-Way Email Sync', 'Auto-Reply Flows', 'Guest Email Threads'],
    badge: 'Email',
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(defaultIntegrations);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    api.get('saas/settings').then(res => {
      const data = res.data;
      if (data?.integrations_config) {
        try {
          const parsed = JSON.parse(data.integrations_config);
          setIntegrations(defaultIntegrations.map(i => {
            const saved = parsed.find(s => s.id === i.id);
            return saved ? { ...i, ...saved } : i;
          }));
        } catch (_) {}
      }
    }).catch(() => {});
  }, []);

  const categories = ['All', ...new Set(integrations.map(i => i.category))];
  const filtered = activeCategory === 'All' ? integrations : integrations.filter(i => i.category === activeCategory);

  return (
    <div className="w-full bg-background text-foreground font-sans overflow-hidden">
      {/* Immersive Hero Section with Floating Logo Grid */}
      <section className="relative pt-32 pb-48 px-6 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Animated grid lines background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #888 1px, transparent 1px), linear-gradient(to bottom, #888 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest mb-8">
              <Layers className="w-3 h-3" /> Connect & Automate
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
              Your ecosystem,<br />
              <span className="italic text-primary">unified.</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
              Sectros acts as the brain of your business, connecting your favorite social and communication platforms into a single, automated workflow.
            </p>

            {/* Andela-style floating logo arrangement */}
            <div className="relative h-64 md:h-80 w-full mt-12 mb-12">
               {/* Central Logo */}
               <motion.div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 z-20"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
               >
                  <Zap className="w-12 h-12 text-primary-foreground" />
               </motion.div>

               {/* Orbiting logos */}
               {[
                 { id: 'fb', Logo: FacebookLogo, color: 'blue', x: -160, y: -60, delay: 0 },
                 { id: 'ig', Logo: InstagramLogo, color: 'pink', x: 160, y: -40, delay: 1 },
                 { id: 'wa', Logo: WhatsAppLogo, color: 'emerald', x: -120, y: 100, delay: 2 },
                 { id: 'gm', Logo: GmailLogo, color: 'red', x: 140, y: 80, delay: 1.5 }
               ].map((item, idx) => (
                 <motion.div
                    key={item.id}
                    className={`absolute left-1/2 top-1/2 w-16 h-16 rounded-2xl bg-card border border-${item.color}-500/30 flex items-center justify-center shadow-xl z-10`}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ 
                      x: item.x, 
                      y: item.y + (Math.sin(Date.now()/1000 + idx) * 10),
                      opacity: 1 
                    }}
                    transition={{ 
                      x: { duration: 1.2, delay: item.delay, ease: "easeOut" },
                      opacity: { duration: 0.8, delay: item.delay },
                      y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                 >
                    <item.Logo className={`w-8 h-8 text-${item.color}-500`} />
                 </motion.div>
               ))}

               {/* Connecting lines (svg) */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                 <line x1="50%" y1="50%" x2="calc(50% - 160px)" y2="calc(50% - 60px)" stroke="currentColor" strokeWidth="1" />
                 <line x1="50%" y1="50%" x2="calc(50% + 160px)" y2="calc(50% - 40px)" stroke="currentColor" strokeWidth="1" />
                 <line x1="50%" y1="50%" x2="calc(50% - 120px)" y2="calc(50% + 100px)" stroke="currentColor" strokeWidth="1" />
                 <line x1="50%" y1="50%" x2="calc(50% + 140px)" y2="calc(50% + 80px)" stroke="currentColor" strokeWidth="1" />
               </svg>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-10 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/30 active:scale-95"
              >
                Get Started
              </Link>
              <a href="#explore" className="px-10 py-4 bg-card border-2 border-border hover:bg-muted text-foreground rounded-2xl font-black text-lg transition-all active:scale-95">
                Explore All
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter & Grid Section */}
      <section id="explore" className="py-24 px-6 bg-card/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <motion.div {...fadeIn}>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Supported Platforms</h2>
              <p className="text-muted-foreground font-medium">Select a category to filter our growing library of tools.</p>
            </motion.div>

            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                    activeCategory === cat
                      ? 'bg-foreground text-background border-foreground shadow-lg'
                      : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {filtered.map(integration => (
              <motion.div
                key={integration.id}
                variants={child}
                className={`relative rounded-[2.5rem] bg-card border border-border/50 p-10 hover:border-primary/30 transition-all duration-700 group overflow-hidden`}
              >
                {/* Visual accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-50" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border ${integration.bgClass} shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden p-4`}>
                        {integration.logo_url ? (
                          <img src={integration.logo_url} alt={integration.name} className="w-full h-full object-contain" />
                        ) : (
                          <integration.Logo className={`w-10 h-10 ${integration.textClass}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-foreground mb-1">{integration.name}</h3>
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{integration.category}</span>
                        </div>
                      </div>
                    </div>
                    {integration.badge && (
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${integration.bgClass} ${integration.textClass} shadow-sm`}>
                        {integration.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-lg text-muted-foreground leading-relaxed mb-10 font-medium">{integration.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    {integration.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${integration.bgClass}`}>
                          <CheckCircle2 className={`w-3 h-3 ${integration.textClass}`} />
                        </div>
                        <span className="text-sm font-bold text-foreground/80">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 bg-foreground text-background rounded-2xl font-black text-sm hover:scale-[1.02] transition-all active:scale-95 shadow-xl"
                  >
                    Connect {integration.name} <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modern Request CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            {...fadeIn}
            className="rounded-[3.5rem] bg-gradient-to-br from-card to-card/50 border border-border p-12 md:p-24 text-center relative shadow-2xl"
          >
            <div className="flex justify-center -space-x-4 mb-10">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-16 h-16 rounded-full border-4 border-background bg-muted overflow-hidden flex items-center justify-center shadow-lg">
                   <div className="w-8 h-8 rounded-lg bg-foreground/10 animate-pulse" />
                </div>
              ))}
              <div className="w-16 h-16 rounded-full border-4 border-background bg-primary flex items-center justify-center shadow-lg text-primary-foreground font-black text-xl z-10">
                +
              </div>
            </div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
              Need something else?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
              Our engineering team is building new integrations every week. Tell us what tools you use and we'll prioritize them.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/30 active:scale-95"
              >
                Join the Beta
              </Link>
              <Link
                to="/help"
                className="px-12 py-5 bg-card border-2 border-border text-foreground rounded-2xl font-black text-lg transition-all active:scale-95"
              >
                Request a Tool
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
