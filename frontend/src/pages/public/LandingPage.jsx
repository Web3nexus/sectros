import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {ArrowRight, CheckCircle2, CalendarDays, Users, LineChart, UtensilsCrossed, Smartphone, ShieldCheck, Zap, Globe, CreditCard, Grid, MessageSquare, Clock, ArrowUpRight, Layers, Settings, Briefcase, Building, Scissors, Coffee, Check, Rocket} from 'lucide-react';
import api from '../../services/centralApi';
import BackgroundParticles from '../../components/common/BackgroundParticles';

/* --- Shared Animation Variants --- */
const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true, margin: '-100px' }
};

const childFade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
};



const Typewriter = ({ texts }) => {
  const [index, setIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < texts[index].length) {
          setCurrentText(texts[index].substring(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(texts[index].substring(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setIndex((index + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, index, texts]);

  return <span className="text-primary">{currentText}<span className="animate-pulse">|</span></span>;
};

export default function LandingPage() {
  const { t } = useTranslation();
  const [s, setS] = useState({});

  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [plans, setPlans] = useState([]);

  const defaultPlans = [
    {
      id: 'default-1',
      name: 'Starter',
      slug: 'starter',
      monthly_price: 49,
      popular: false,
      description: 'For new businesses getting started.',
      features: ['Smart Bookings', 'Basic Booking Widget', 'Email Notifications', 'Up to 50 covers/mo']
    },
    {
      id: 'default-2',
      name: 'Professional',
      slug: 'professional',
      monthly_price: 99,
      popular: true,
      description: 'Everything you need to grow your venue.',
      features: ['Unlimited Bookings', 'Guest CRM', 'SMS Reminders', 'Analytics Dashboard', 'Custom Domain']
    },
    {
      id: 'default-3',
      name: 'Enterprise',
      slug: 'enterprise',
      monthly_price: 199,
      popular: false,
      description: 'Advanced tools for high-volume operations.',
      features: ['Everything in Pro', 'Multi-location', 'Deposit Protection', 'Priority Support', 'AI Automation']
    }
  ];

  const DEFAULT_INTEGRATIONS = [
    { id: 'facebook', name: 'Facebook', enabled: true },
    { id: 'instagram', name: 'Instagram', enabled: true },
    { id: 'whatsapp', name: 'WhatsApp', enabled: true },
    { id: 'gmail', name: 'Gmail', enabled: true }
  ];

  const [integrationSettings, setIntegrationSettings] = useState(DEFAULT_INTEGRATIONS);

  useEffect(() => {
    api.get('saas/settings').then(res => {
      if (res.data) setS(res.data);
      
      if (res.data?.integrations_config) {
        try {
          const parsed = JSON.parse(res.data.integrations_config);
          const enabled = parsed.filter(i => i.enabled);
          if (enabled.length > 0) {
            setIntegrationSettings(enabled);
          }
        } catch (_) {}
      }
    }).catch(() => {});

    api.get('saas/plans').then(res => {
      const rawData = res.data;
      const plansArray = Array.isArray(rawData) ? rawData : (rawData?.data || []);
      const activePlans = plansArray.filter(p => p.is_active);

      if (activePlans.length > 0) {
        setPlans(activePlans);
      } else {
        setPlans(defaultPlans);
      }
      setIsLoadingPlans(false);
    }).catch(err => {
      console.error('Pricing Fetch Error:', err);
      setPlans(defaultPlans);
      setIsLoadingPlans(false);
    });
  }, []);

  const val = (key, fallback) => s[key] || fallback;

  // --- Dynamic Content Getters ---
  const badgeText = val('landing_badge_text', 'Sectros 2.0 is now live');
  const heroTitle = val('landing_hero_title', 'The Operating System for Modern Hospitality.');
  const heroSubtitle = val('landing_hero_subtitle', 'Manage reservations, empower your staff, and grow your brand with intelligent tools designed for the future of service.');
  const brandsText = val('landing_social_proof_brands', 'Lumina,Bistro Uno,Saveur,Urban Plates,Coast & Co');
  const brands = brandsText.split(',').map(b => b.trim()).filter(Boolean);

  return (
    <div className="w-full bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-40 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />
        
        {/* Mesh Grid Pattern */}
        <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none" />
        


        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-2xl bg-muted/50 border border-border backdrop-blur-xl shadow-2xl mb-8">
              <Rocket className="w-4 h-4 animate-bounce text-primary" />
              {badgeText}
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-linear-to-b from-foreground via-foreground to-muted-foreground tracking-tight leading-[1.1] mb-8 max-w-5xl mx-auto drop-shadow-2xl">
              The Operating System for <br />
              <Typewriter texts={['Modern Hospitality.', 'Fine Dining.', 'Boutique Cafes.', 'Luxury Salons.']} />
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
              {heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 group active:scale-95 leading-none">
                Start your free trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contact" className="w-full sm:w-auto px-10 py-5 bg-transparent border-2 border-border hover:bg-muted text-foreground rounded-2xl font-black text-lg transition-all flex items-center justify-center active:scale-95 shadow-lg">
                Book a Demo
              </Link>
            </div>
            {!s.require_card_for_trial && (
              <p className="text-sm text-muted-foreground mt-8 font-medium opacity-60 italic">No credit card required. {s.trial_days || 14}-day free trial.</p>
            )}
          </motion.div>
        </div>

        <BackgroundParticles count={60} velocity={0.8} color="rgba(139, 92, 246, 0.8)" />


        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto mt-24 relative z-10 perspective-1000"
        >
          <div className="rounded-[2.5rem] border border-border bg-card/50 p-2 md:p-3 backdrop-blur-2xl shadow-2xl shadow-primary/10 transform rotateX-2 transition-transform hover:rotateX-0 duration-700">
            {s.landing_hero_video_url ? (
              <video src={s.landing_hero_video_url} autoPlay muted loop className="w-full h-full object-cover rounded-4xl shadow-inner" style={{ maxHeight: '600px' }} />
            ) : s.landing_hero_image_url ? (
              <img src={s.landing_hero_image_url} alt="Dashboard Preview" className="w-full h-full object-cover rounded-4xl shadow-inner" style={{ maxHeight: '600px' }} />
            ) : (
              <div className="rounded-4xl border border-border bg-background aspect-video w-full flex items-center justify-center relative overflow-hidden transition-colors">
                {/* Mock UI Structure */}
                <div className="absolute inset-x-0 top-0 h-16 border-b border-border/50 flex items-center px-8 gap-6 z-20 bg-background/80 backdrop-blur-md">
                  <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-rose-500/80"/><div className="w-3 h-3 rounded-full bg-amber-500/80"/><div className="w-3 h-3 rounded-full bg-emerald-500/80"/></div>
                  <div className="h-6 w-32 bg-muted rounded-md" />
                  <div className="flex-1" />
                  <div className="h-8 w-8 bg-muted rounded-full" />
                </div>
                <div className="absolute inset-0 pt-16 flex z-10 transition-colors">
                  <div className="w-64 border-r border-border/50 p-6 space-y-4 hidden md:block">
                    {[...Array(6)].map((_, i) => <div key={i} className={`h-10 rounded-xl ${i===0 ? 'bg-primary/10 text-primary flex items-center px-4 shadow-[inset_1px_0_0_0_currentColor]' : 'bg-muted/50 transition-colors'}`} />)}
                  </div>
                  <div className="flex-1 p-8 grid grid-cols-3 gap-6 transition-colors">
                    <div className="col-span-2 space-y-6">
                      <div className="h-32 bg-linear-to-br from-primary/5 to-indigo-500/5 border border-border rounded-2xl" />
                      <div className="h-64 bg-muted/30 border border-border rounded-2xl" />
                    </div>
                    <div className="col-span-1 space-y-6">
                      <div className="h-48 bg-muted/30 border border-border rounded-2xl" />
                      <div className="h-48 bg-muted/30 border border-border rounded-2xl" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-background to-transparent z-30 transition-colors" />
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* 2. RECENT CLIENTS & PARTNERS */}
      <section className="py-24 relative overflow-hidden bg-background border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tighter">Our Recent Clients & Partners</h2>
          </motion.div>
 
          {/* Logo Wall - Clean Grayscale on Dark */}
          <div className="flex flex-col gap-12">
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50">
               {[
                 { name: 'Ephemeral', icon: Layers },
                 { name: 'Wildcrafted', icon: Briefcase },
                 { name: 'Codecraft_', icon: Settings },
                 { name: 'Convergence', icon: Zap },
                 { name: 'ImgCompress', icon: Grid }
               ].map((brand, i) => (
                 <div key={i} className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-default group">
                    <brand.icon className="w-8 h-8 text-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xl font-bold tracking-tight text-foreground/70 group-hover:text-foreground transition-colors">{brand.name}</span>
                 </div>
               ))}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50">
               {[
                 { name: 'Epicurious', icon: UtensilsCrossed },
                 { name: 'Watchtower', icon: ShieldCheck },
                 { name: 'Renaissance', icon: Building },
                 { name: 'ContrastAI', icon: Globe },
                 { name: 'Nietzsche', icon: Briefcase }
               ].map((brand, i) => (
                 <div key={i} className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-default group">
                    <brand.icon className="w-8 h-8 text-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xl font-bold tracking-tight text-foreground/70 group-hover:text-foreground transition-colors">{brand.name}</span>
                 </div>
               ))}
            </div>
          </div>
 
          <p className="text-center text-sm font-medium text-muted-foreground mt-16">
            Join <span className="text-foreground font-black">4,000+ companies</span> already growing
          </p>
        </div>
      </section>

      {/* 3. PRODUCT OVERVIEW (Value Prop Cards) */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeIn} initial="initial" whileInView="whileInView" className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6">
               {val('landing_features_title', 'Everything you need to run your venue smoothly.')}
            </h2>
            <p className="text-xl text-muted-foreground">
               {val('landing_features_subtitle', 'Replace your fragmented tools with one cohesive operating system that handles bookings, guests, and your online presence.')}
            </p>
          </motion.div>
          
          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={childFade} className="p-8 md:p-12 rounded-[2.5rem] bg-card border border-border hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"><Clock className="w-32 h-32 text-foreground" /></div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 shadow-inner"><CalendarDays className="w-7 h-7 text-blue-500" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Smart Bookings</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">Accept reservations 24/7 without commission fees. Prevent no-shows with automated SMS and email reminders.</p>
            </motion.div>
            <motion.div variants={childFade} className="p-8 md:p-12 rounded-[2.5rem] bg-card border border-border hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"><Users className="w-32 h-32 text-foreground" /></div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 shadow-inner"><Users className="w-7 h-7 text-emerald-500" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Guest CRM</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">Remember dietary requirements, birthdays, and favorite tables automatically to deliver personalized service.</p>
            </motion.div>
            <motion.div variants={childFade} className="p-8 md:p-12 rounded-[2.5rem] bg-card border border-border hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"><Globe className="w-32 h-32 text-foreground" /></div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20 shadow-inner"><Globe className="w-7 h-7 text-purple-500" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Branded Web Sites</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">Launch a premium quality website with our drag-and-drop builder hosted on your own custom domain.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. CORE FEATURES DEEP DIVES */}
      <section className="py-24 px-6 bg-card/20 border-y border-border">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Calendar Management */}
          <motion.div variants={fadeIn} initial="initial" whileInView="whileInView" className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20">
                <Grid className="w-4 h-4" /> Table Management
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Maximize your floor plan efficiency.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Our dynamic timeline and interactive floor planner help you turn tables faster and accommodate walk-ins seamlessly. Stop playing tetris on paper.
              </p>
              <ul className="space-y-4">
                {['Drag-and-drop table assignments', 'Real-time timeline view', 'Waitlist management flow'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full order-1 lg:order-2">
              <div className="aspect-square md:aspect-4/3 rounded-3xl bg-card border border-border flex items-center justify-center p-6 relative overflow-hidden shadow-2xl shadow-primary/10">
                <div className="absolute inset-0 bg-linear-to-bl from-indigo-500/10 to-transparent" />
                {s.landing_feature1_image_url ? (
                   <img src={s.landing_feature1_image_url} alt="Feature 1" className="w-full h-full object-cover rounded-2xl relative z-10" />
                ) : (
                  <div className="w-full h-full bg-background rounded-2xl border border-border shadow-2xl p-4 flex flex-col gap-4 relative z-10">
                      <div className="flex justify-between border-b border-border pb-4">
                          <div className="h-6 w-32 bg-muted rounded" />
                          <div className="flex gap-2"><div className="h-6 w-16 bg-indigo-600 rounded-full"/><div className="h-6 w-16 bg-muted rounded-full"/></div>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-4">
                          <div className="col-span-1 flex flex-col gap-2">
                              {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-muted/50 rounded-lg flex items-center px-4"><div className="h-4 w-16 bg-muted-foreground/30 rounded"/></div>)}
                          </div>
                          <div className="col-span-2 relative border-l border-border pl-4 space-y-4">
                              <div className="absolute top-4 left-6 w-48 h-12 bg-blue-500 border border-blue-400 rounded-lg shadow-lg flex items-center px-4"><div className="h-3 w-24 bg-white/30 rounded"/></div>
                              <div className="absolute top-20 left-24 w-64 h-12 bg-emerald-500 border border-emerald-400 rounded-lg shadow-lg flex items-center px-4"><div className="h-3 w-32 bg-white/30 rounded"/></div>
                              <div className="absolute top-36 left-4 w-32 h-12 bg-purple-500 border border-purple-400 rounded-lg shadow-lg flex items-center px-4"><div className="h-3 w-20 bg-white/30 rounded"/></div>
                          </div>
                      </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Booking Widget / Website Builder */}
          <motion.div variants={fadeIn} initial="initial" whileInView="whileInView" className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 w-full">
              <div className="aspect-square md:aspect-4/3 rounded-3xl bg-card border border-border flex items-center justify-center p-6 relative overflow-hidden shadow-2xl shadow-primary/10">
                <div className="absolute inset-0 bg-linear-to-tr from-fuchsia-500/10 to-transparent" />
                {s.landing_feature2_image_url ? (
                   <img src={s.landing_feature2_image_url} alt="Feature 2" className="w-full h-full object-cover rounded-2xl relative z-10" />
                ) : (
                  <div className="w-full max-w-sm h-full bg-background rounded-2xl border border-border shadow-2xl overflow-hidden relative z-10 flex flex-col">
                    {/* Fake Website Mock */}
                    <div className="h-32 bg-muted flex items-center justify-center border-b border-border">
                        <div className="text-foreground font-serif text-2xl font-bold">Le Petit Bistro</div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col items-center">
                      <div className="text-sm font-bold text-foreground uppercase tracking-widest mb-6">Make a Reservation</div>
                      <div className="w-full space-y-3">
                          <div className="flex gap-2">
                              <div className="flex-1 h-10 border border-border rounded-lg bg-card flex items-center px-3"><CalendarDays className="w-4 h-4 text-muted-foreground"/></div>
                              <div className="w-20 h-10 border border-border rounded-lg bg-card flex items-center justify-center text-sm font-semibold text-foreground">2 Ppl</div>
                          </div>
                          <div className="flex gap-2 flex-wrap justify-center my-4">
                              {['18:00', '18:30', '19:00', '20:00'].map((time, i) => (
                                  <div key={i} className={`px-4 py-2 rounded-md border text-sm font-semibold ${i===1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:border-muted-foreground'}`}>{time}</div>
                              ))}
                          </div>
                          <div className="w-full h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold shadow-md">Book Now</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20">
                <Layers className="w-4 h-4" /> Form Generator
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Convert visitors to diners seamlessly.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Embed high-converting booking widgets directly into your existing website, or let our built-in GrapesJS website builder create a fully branded presence for you in minutes.
              </p>
              <ul className="space-y-4">
                {['No-code website templates', 'Custom domain hosting included', 'Embed code for any CMS'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="w-5 h-5 text-fuchsia-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 5. HOW IT WORKS (Timeline) */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-16">Get up and running in minutes.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative text-left">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-0.5 bg-linear-to-r from-primary/0 via-primary/30 to-primary/0"></div>
                
                {[
                  { step: '1', title: 'Connect', desc: 'Sign up and configure your restaurant details, business hours, and floor plan.', icon: Building },
                  { step: '2', title: 'Customize', desc: 'Design your branding, publish your custom domain, and generate your booking links.', icon: Settings },
                  { step: '3', title: 'Launch', desc: 'Go live and start accepting reservations with zero commission fees applied.', icon: Zap }
                ].map((item, idx) => (
                    <motion.div key={idx} variants={fadeIn} initial="initial" whileInView="whileInView" className="relative group">
                        <div className="w-16 h-16 rounded-full bg-card border border-border shadow-xl shadow-primary/5 flex items-center justify-center text-foreground font-black text-xl mb-8 relative z-10 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-500 active:scale-95 cursor-default">
                            {item.step}
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2"><item.icon className="w-5 h-5 text-primary"/> {item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed text-lg">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* 5.5 NEW: MARKETPLACE DISCOVERY SECTION */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-sm font-semibold border border-emerald-500/20">
                <Globe className="w-4 h-4" /> Discovery Marketplace
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none">Get discovered by <span className="text-primary italic">millions of diners.</span></h2>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-xl">
                Join our exclusive Business Directory and put your venue in front of thousands of people looking for their next great experience. Integrated "Book Now" buttons mean zero friction between discovery and reservation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/directory" className="px-8 py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-foreground/80 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl">
                  Browse the Directory <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link to="/register" className="px-8 py-4 bg-white border border-border text-foreground rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all flex items-center justify-center active:scale-95">
                  List Your Business
                </Link>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="p-6 bg-card rounded-[2.5rem] border border-border shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 mb-4 flex items-center justify-center text-primary"><UtensilsCrossed size={24} /></div>
                  <h4 className="font-bold mb-2">Fine Dining</h4>
                  <p className="text-xs text-muted-foreground font-medium">Curated collection of the world's best restaurants.</p>
                </div>
                <div className="p-6 bg-card rounded-[2.5rem] border border-border shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 mb-4 flex items-center justify-center text-emerald-500"><Coffee size={24} /></div>
                  <h4 className="font-bold mb-2">Boutique Cafes</h4>
                  <p className="text-xs text-muted-foreground font-medium">Find your next favorite morning spot.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-card rounded-[2.5rem] border border-border shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 mb-4 flex items-center justify-center text-pink-500"><Scissors size={24} /></div>
                  <h4 className="font-bold mb-2">Luxury Salons</h4>
                  <p className="text-xs text-muted-foreground font-medium">Book top-tier stylists and beauty treatments.</p>
                </div>
                <div className="p-6 bg-card rounded-[2.5rem] border border-border shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 mb-4 flex items-center justify-center text-cyan-500"><Building size={24} /></div>
                  <h4 className="font-bold mb-2">Grand Hotels</h4>
                  <p className="text-xs text-muted-foreground font-medium">Experience world-class hospitality.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ADVANCED FEATURES BENTO GRID */}
      <section className="py-24 px-6 bg-card/20 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">Enterprise-grade tools,<br/>built for everyone.</h2>
            <p className="text-lg text-muted-foreground">Everything required to scale your operations.</p>
          </div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="whileInView" className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[300px]">
            {/* Large Top Feature */}
            <motion.div variants={childFade} className="md:col-span-2 rounded-[2.5rem] border border-border p-8 md:p-12 flex flex-col justify-start bg-card shadow-sm hover:shadow-xl transition-all duration-700 overflow-hidden relative group">
                <div className="absolute top-10 right-10 text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none"><MessageSquare className="w-48 h-48" /></div>
                <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner mb-2">
                        <Smartphone className="w-7 h-7 text-blue-500" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-foreground">Automated Notifications</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">Reduce no-shows by 40% with automated two-way SMS and beautifully branded email confirmations.</p>
                    </div>
                </div>
            </motion.div>
            
            {/* Small Side Feature */}
            <motion.div variants={childFade} className="md:col-span-1 rounded-[2.5rem] border border-border p-8 md:p-12 flex flex-col justify-start bg-card shadow-sm hover:shadow-xl transition-all duration-700 overflow-hidden relative group">
                <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner mb-2">
                        <LineChart className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-foreground">Deep Analytics</h3>
                      <p className="text-muted-foreground leading-relaxed">Understand your busiest times, booking sources, and revenue per cover.</p>
                    </div>
                </div>
            </motion.div>

            {/* Small Bottom Feature 1 */}
            <motion.div variants={childFade} className="md:col-span-1 rounded-[2.5rem] border border-border p-8 md:p-12 flex flex-col justify-start bg-card shadow-sm hover:shadow-xl transition-all duration-700 overflow-hidden relative group">
                <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner mb-2">
                        <ShieldCheck className="w-7 h-7 text-amber-400" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-foreground">Multi-Location</h3>
                      <p className="text-muted-foreground leading-relaxed">Manage multiple concepts or franchises from a single master dashboard.</p>
                    </div>
                </div>
            </motion.div>

            {/* Medium Bottom Feature 2 */}
            <motion.div variants={childFade} className="md:col-span-2 rounded-[2.5rem] border border-border p-8 md:p-12 flex flex-col justify-start bg-card shadow-sm hover:shadow-xl transition-all duration-700 overflow-hidden relative group">
                <div className="absolute -bottom-10 right-10 text-purple-100 dark:text-purple-500/10 group-hover:scale-110 transition-transform duration-700 pointer-events-none"><CreditCard className="w-64 h-64" /></div>
                <div className="relative z-10 space-y-6">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-inner mb-2">
                        <CreditCard className="w-7 h-7 text-purple-500" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-foreground">Deposit Protection</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">Secure high-value reservations by taking upfront card deposits or simple credit card holds via our Stripe integration.</p>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 7. USE CASES / INDUSTRIES */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-center text-3xl font-bold text-foreground mb-16">Built for every type of hospitality business.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Fine Dining & Restaurants', icon: UtensilsCrossed, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
                    { title: 'Cafes & Bakeries', icon: Coffee, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
                    { title: 'Salons & Spas', icon: Scissors, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30' },
                    { title: 'Hospitality & Events', icon: Building, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
                ].map((ind, idx) => (
                    <motion.div key={idx} variants={fadeIn} initial="initial" whileInView="whileInView" className={`p-8 rounded-3xl bg-card border ${ind.bg} flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${ind.bg}`}><ind.icon className={`w-8 h-8 ${ind.color}`} /></div>
                        <h4 className="text-lg font-bold text-foreground">{ind.title}</h4>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* 8. PRICING PREVIEW */}
      <section className="py-24 px-6 bg-muted/30 border-t border-border/50 relative overflow-hidden">

        <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
                  {val('landing_pricing_title', 'Simple, transparent pricing.')}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {val('landing_pricing_subtitle', 'Scale your business without paying per-cover commission fees.')}
                </p>
            </div>
            
            <BackgroundParticles count={40} color="rgba(59, 130, 246, 0.6)" />


            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {isLoadingPlans ? (
                  <div className="col-span-3 flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
                ) : (
                  plans.slice(0, 3).map((plan, i) => (
                    <div key={plan.id} className={`relative rounded-3xl p-8 bg-card/50 backdrop-blur-xl border transition-all duration-300 ${
                      plan.popular || (i === 1 && plans.length === 3) ? 'border-blue-500/50 shadow-2xl shadow-blue-900/20 scale-100 md:scale-105 z-10 bg-card' : 'border-border hover:border-border hover:bg-card'
                    }`}>
                        {(plan.popular || (i === 1 && plans.length === 3)) && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <div className="bg-linear-to-r from-blue-600 to-indigo-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                  Most Popular
                              </div>
                          </div>
                        )}
                        <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                        <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">{plan.description || 'Professional features for your venue.'}</p>
                        <div className="mb-8 flex items-baseline gap-1">
                          <span className="text-4xl font-black text-foreground">${plan.monthly_price}</span>
                          <span className="text-muted-foreground font-medium">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-10">
                            {(() => {
                                let f = plan.features;
                                if (typeof f === 'string') { try { f = JSON.parse(f); } catch(e) { f = {}; } }
                                if (Array.isArray(f)) return f;
                                return Object.entries(f || {}).filter(([, v]) => v).map(([k]) => k);
                            })().slice(0, 5).map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div className="shrink-0 mt-0.5">
                                    <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-blue-400" />
                                    </div>
                                </div>
                                <span className="text-sm text-muted-foreground font-medium leading-relaxed">{typeof feat === 'string' ? feat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : feat}</span>
                              </li>
                            ))}
                        </ul>
                        <Link to="/register" className={`w-full py-4 rounded-xl font-black text-sm transition-all flex justify-center items-center gap-2 group active:scale-95 ${
                          plan.popular || (i === 1 && plans.length === 3) ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30' : 'bg-transparent hover:bg-muted text-foreground border-2 border-border'
                        }`}>
                          Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                  ))
                )}
            </div>
        </div>
      </section>

      {/* 9. REVIEW PLATFORMS SECTION */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter mb-4">Loved by operators everywhere.</h2>
            <p className="text-lg text-muted-foreground font-medium">Top-rated across all major hospitality software directories.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'Product Hunt', rating: '4.9/5', badge: 'Product of the Day', color: 'bg-[#DA552F]' },
              { name: 'Trustpilot', rating: '4.8/5', badge: 'Excellent', color: 'bg-[#00B67A]' },
              { name: 'G2 Crowd', rating: '4.7/5', badge: 'Leader 2024', color: 'bg-[#FF492C]' },
              { name: 'Capterra', rating: '4.9/5', badge: 'Best Ease of Use', color: 'bg-[#0075FF]' }
            ].map((plat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-card border border-border p-8 rounded-4xl flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition-all group"
              >
                <div className={`w-12 h-12 ${plat.color} rounded-xl mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Briefcase className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <h4 className="text-xl font-black text-foreground mb-1 uppercase tracking-tight">{plat.name}</h4>
                <div className="flex text-amber-500 mb-3">
                  {[...Array(5)].map((_, j) => <Briefcase key={j} size={14} fill="currentColor" />)}
                </div>
                <div className="text-2xl font-black text-foreground mb-4 tracking-tighter">{plat.rating}</div>
                <div className="px-4 py-1.5 rounded-full bg-muted border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  {plat.badge}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. INTEGRATIONS SECTION — floating logo grid */}
      <section className="py-20 px-6 border-y border-border/50 bg-background relative overflow-hidden">
        {/* subtle radial bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Grid + centered text container */}
          <div className="relative flex items-center justify-center" style={{ minHeight: '440px' }}>

            {/* ── Logo grid (CSS grid, 7 cols × 5 rows) ── */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 80px)',
                gridTemplateRows: 'repeat(5, 80px)',
                gap: '24px',
              }}>
                {/* Dynamic Integration Slots */}
                {integrationSettings.slice(0, 4).map((intg, idx) => {
                  const slots = [
                    { col: 4, row: 1, color: '#1877F2', shadow: 'blue' },    // Top
                    { col: 1, row: 2, color: '#EA4335', shadow: 'red' },     // Mid Left
                    { col: 2, row: 4, color: '#25D366', shadow: 'emerald' }, // Bottom Left
                    { col: 7, row: 3, color: '#E1306C', shadow: 'pink' }     // Far Right
                  ];
                  const slot = slots[idx];
                  
                  return (
                    <motion.div 
                      key={intg.id}
                      style={{ gridColumn: slot.col, gridRow: slot.row }} 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      whileInView={{ opacity: 1, scale: 1 }} 
                      viewport={{ once: true }} 
                      transition={{ duration: 0.6, delay: 0.2 + (idx * 0.1) }} 
                      animate={{ y: [0, -8 - idx, 0] }}
                      className={`w-[80px] h-[80px] rounded-2xl bg-card border border-border/50 flex items-center justify-center shadow-2xl overflow-hidden p-4 group hover:border-primary/30 transition-colors backdrop-blur-sm`}
                    >
                      {intg.logo_url ? (
                        <img src={intg.logo_url} alt={intg.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                           {intg.id === 'facebook' && <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" style={{color: '#1877F2'}}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                           {intg.id === 'instagram' && <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" style={{color: '#E1306C'}}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>}
                           {intg.id === 'whatsapp' && <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" style={{color: '#25D366'}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>}
                           {intg.id === 'gmail' && <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" style={{color: '#EA4335'}}><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>}
                           {!['facebook', 'instagram', 'whatsapp', 'gmail'].includes(intg.id) && <Zap className="w-10 h-10" />}
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Placeholders (Row 1-5) */}
                {/* ph top left */}<motion.div style={{gridColumn:2,gridRow:1}} initial={{opacity:0,scale:.8}} whileInView={{opacity:.2,scale:1}} viewport={{once:true}} transition={{duration:.5,delay:.1}} className="w-[80px] h-[80px] rounded-2xl bg-card border border-border/40 blur-[1px]" />
                {/* ph top right */}<motion.div style={{gridColumn:6,gridRow:1}} initial={{opacity:0,scale:.8}} whileInView={{opacity:.2,scale:1}} viewport={{once:true}} transition={{duration:.5,delay:.15}} className="w-[80px] h-[80px] rounded-2xl bg-card border border-border/40 blur-[1px]" />
                
                {/* ph mid far left handled by dynamic map */}
                {/* ph mid right */}<motion.div style={{gridColumn:6,gridRow:2}} initial={{opacity:0,scale:.8}} whileInView={{opacity:.3,scale:1}} viewport={{once:true}} transition={{duration:.5,delay:.2}} className="w-[80px] h-[80px] rounded-2xl bg-card border border-border/50" />
                
                {/* ph center area is mostly covered by the text box */}
                
                {/* ph bottom right */}<motion.div style={{gridColumn:5,gridRow:5}} initial={{opacity:0,scale:.8}} whileInView={{opacity:.25,scale:1}} viewport={{once:true}} transition={{duration:.5,delay:.25}} className="w-[80px] h-[80px] rounded-2xl bg-card border border-border/50" />
                {/* ph far bottom left */}<motion.div style={{gridColumn:1,gridRow:5}} initial={{opacity:0,scale:.8}} whileInView={{opacity:.2,scale:1}} viewport={{once:true}} transition={{duration:.5,delay:.3}} className="w-[80px] h-[80px] rounded-2xl bg-card border border-border/40 blur-[2px]" />
              </div>
            </div>

            {/* ── Center text ── */}
            <motion.div
              initial={{opacity:0,scale:.95}} whileInView={{opacity:1,scale:1}}
              viewport={{once:true}} transition={{duration:.7,delay:.3}}
              className="relative z-10 text-center max-w-xs bg-background/70 backdrop-blur-sm rounded-3xl px-6 py-8"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">Platform Integrations</p>
              <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight mb-6">
                Connect the tools your guests already use.
              </h2>
              <Link
                to="/integrations"
                className="inline-flex items-center gap-2 bg-foreground text-background px-7 py-3 rounded-full font-bold text-sm hover:bg-foreground/85 transition-all active:scale-95 shadow-lg"
              >
                Explore integrations <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 11. APP DOWNLOAD SECTION */}
      <section className="py-24 px-6 bg-primary/5 border-y border-border overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20">
              <Smartphone className="w-4 h-4" /> Sectros GO Mobile
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-none">Your entire venue, <br /><span className="text-primary italic">in your pocket.</span></h2>
            <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-xl">
              Get real-time alerts, manage your floor plan, and communicate with your team from anywhere in the world. Optimized for iPhone and iPad.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
               <button className="flex items-center gap-3 bg-card text-foreground px-8 py-4 rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-xl border border-border">
                  <div className="flex flex-col items-start leading-none text-left">
                     <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Download on the</span>
                     <span className="text-xl font-black tracking-tight">App Store</span>
                  </div>
               </button>
               <button className="flex items-center gap-3 bg-card text-foreground px-8 py-4 rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-xl border border-border">
                  <div className="flex flex-col items-start leading-none text-left">
                     <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Get it on</span>
                     <span className="text-xl font-black tracking-tight">Google Play</span>
                  </div>
               </button>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground pt-4">
               <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted" />)}
               </div>
               <span>Trusted by over 12,000+ staff members</span>
            </div>
          </div>
          <div className="flex-1 relative">
            {/* Phone Mockup Frame */}
            <div className="relative mx-auto w-64 md:w-80 h-[500px] md:h-[600px] bg-black rounded-[3rem] border-4 border-border shadow-2xl overflow-hidden animate-float">
               {s.landing_app_video_url ? (
                  <video src={s.landing_app_video_url} autoPlay muted loop className="w-full h-full object-cover" />
               ) : s.landing_app_image_url ? (
                  <img src={s.landing_app_image_url} alt="App Preview" className="w-full h-full object-cover" />
               ) : (
                  <>
                    <div className="absolute top-0 inset-x-0 h-6 bg-card flex items-center justify-center z-20">
                        <div className="w-20 h-4 bg-black rounded-b-xl" />
                    </div>
                    <div className="p-4 pt-10 space-y-4 h-full bg-background flex flex-col relative z-10">
                        <div className="h-12 w-full bg-primary/10 rounded-xl animate-pulse" />
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-full bg-muted/30 rounded-2xl" />)}
                        </div>
                    </div>
                  </>
               )}
            </div>
            {/* Ambient Glow */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 animate-pulse-slow" />
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="py-32 px-6 relative overflow-hidden">

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div variants={fadeIn} initial="initial" whileInView="whileInView" className="rounded-[3.5rem] bg-card p-12 md:p-24 text-center relative overflow-hidden border border-border shadow-2xl backdrop-blur-3xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[120px] pointer-events-none" />
            
            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-8 relative z-10 uppercase italic">
              Ready to upgrade your service?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 relative z-10 font-medium leading-relaxed">
              Join hundreds of modern restaurants switching to Sectros. Get set up in less than 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 relative z-10 pt-4">
              <Link to="/register" className="px-12 py-5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/40 hover:-translate-y-1 active:scale-95 leading-none">
                Start your free trial
              </Link>
              <Link to="/pricing" className="px-12 py-5 bg-transparent border-2 border-border hover:bg-muted text-foreground rounded-2xl font-black text-lg transition-all shadow-lg hover:-translate-y-1 active:scale-95 leading-none">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
        <BackgroundParticles count={50} color="rgba(139, 92, 246, 0.7)" />
      </section>


    </div>
  );
}
