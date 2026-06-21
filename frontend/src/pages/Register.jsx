import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {Briefcase, ArrowRight, ArrowLeft, Building2, Mail, Lock, User, Globe, Loader2, CheckCircle2, Zap, Crown, Sparkles} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../hooks/useBranding';
import api from '../services/api';
import centralApi from '../services/centralApi';
import { COUNTRIES } from '../utils/countries';
import { Turnstile } from '@marsidev/react-turnstile';

const PLAN_ICONS = { free: Zap, pro: Sparkles, enterprise: Crown };

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const settings = useBranding();
  const [trialSettings, setTrialSettings] = useState({});
  const [plans, setPlans] = useState([]);
  const [plansError, setPlansError] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isResending, setIsResending] = useState(false);

  const fetchPlans = () => {
    setPlansError(false);
    centralApi.get('saas/plans').then(res => {
      if (res.data?.plans) setPlans(res.data.plans);
    }).catch(() => setPlansError(true));
  };

  useEffect(() => {
    import('../services/centralApi').then(mod => {
      mod.default.get('saas/settings').then(res => {
        if (res.data) setTrialSettings(res.data);
      }).catch(() => {});
    });
    fetchPlans();
  }, []);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await api.post('auth/resend-verification', { email: registeredEmail });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [accountType, setAccountType] = useState('owner');
  const hasTurnstileKey = settings.turnstile_site_key || import.meta.env.VITE_TURNSTILE_SITE_KEY;
  
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    business_type: 'restaurant',
    email: '',
    password: '',
    country: 'NG'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!selectedPlan) {
      setError('Please select a plan to continue.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('auth/register', { 
        ...formData, 
        plan_slug: selectedPlan,
        turnstile_token: turnstileToken 
      });
      if (response.data.success) {
        setRegisteredEmail(formData.email);
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98
    })
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10 w-full py-6">
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block"
        >
          <Link to="/" className="flex items-center gap-3 mb-6 group">
            {settings.platform_logo_url ? (
               <img src={settings.platform_logo_url} alt={settings.platform_name} className="h-8 w-auto object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black text-foreground tracking-tighter uppercase italic">{settings.platform_name || 'Sectros'}</span>
              </>
            )}
          </Link>

          <h2 className="text-4xl font-black text-foreground leading-[1.1] mb-4">
            {t('register.hero_title').split('Future of Business')[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Future of Business</span>{t('register.hero_title').split('Future of Business')[1]}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-lg font-medium">
            {t('register.hero_subtitle')}
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {[
              { title: t('register.feature_global_title'), desc: t('register.feature_global_desc'), icon: Globe },
              { title: t('register.feature_ai_title'), desc: t('register.feature_ai_desc'), icon: Briefcase }
            ].map((item, id) => (
              <div key={id} className="space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-blue-400 shadow-sm">
                  <item.icon className="w-4 h-4" />
                </div>
                <h4 className="text-foreground font-bold text-xs tracking-tight">{item.title}</h4>
                <p className="text-muted-foreground text-[10px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div key="wizard-content" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                  <div className="mb-6 text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                      {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${currentStep >= s ? 'bg-primary shadow-[0_0_10px_#3b82f6]' : 'bg-muted'}`}></div>
                          {s < 4 && <div className={`w-6 h-[2px] rounded-full transition-all duration-700 ${currentStep > s ? 'bg-primary' : 'bg-muted'}`}></div>}
                        </div>
                      ))}
                    </div>
                    <h3 className="text-lg font-black text-foreground mb-1">
                      {currentStep === 1 ? t('register.step_title_1') : currentStep === 2 ? t('register.step_title_2') : currentStep === 3 ? t('register.step_title_3') : 'Choose Your Plan'}
                    </h3>
                    <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest">{t('common.step')} {currentStep} {t('common.of')} 4</p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] flex items-center gap-2 font-medium">
                      <div className="shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleRegister} className="relative min-h-[220px] flex flex-col justify-between">
                    <AnimatePresence mode="wait" custom={currentStep}>
                      <motion.div
                        key={currentStep}
                        custom={currentStep}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-4"
                      >
                        {currentStep === 1 && (
                          <div className="space-y-3">
                            <div className="space-y-1.5 mb-2">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Account Type</label>
                              <div className="flex gap-3">
                                <button type="button" onClick={() => setAccountType('owner')} className={`flex-1 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all ${accountType === 'owner' ? 'bg-blue-500/10 border border-blue-500/50 text-blue-400 ring-2 ring-blue-500/10' : 'bg-background/50 border border-border/80 text-muted-foreground hover:text-foreground'}`}>Business Owner</button>
                                <button type="button" onClick={() => setAccountType('staff')} className={`flex-1 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all ${accountType === 'staff' ? 'bg-indigo-500/10 border border-indigo-500/50 text-indigo-400 ring-2 ring-indigo-500/10' : 'bg-background/50 border border-border/80 text-muted-foreground hover:text-foreground'}`}>Staff Member</button>
                              </div>
                            </div>

                            {accountType === 'staff' ? (
                               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-6 text-center bg-background/50 rounded-2xl border border-border/80 p-4">
                                 <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-3" />
                                 <h4 className="text-foreground font-black mb-1 text-xs uppercase tracking-tight">Staff Registration Restricted</h4>
                                 <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Waitstaff, managers, and kitchen staff accounts are provisioned directly by your restaurant's management layer. Please contact your HR or Business Owner for your secure login link.</p>
                               </motion.div>
                            ) : (
                              <>
                                <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">{t('staff.name')}</label>
                              <div className="relative group/input">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within/input:text-blue-400 transition-colors" />
                                <input 
                                  required
                                  type="text" 
                                  name="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  placeholder="John Doe"
                                  className="w-full bg-background/50 border border-border/80 rounded-xl py-2.5 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-muted-foreground/50 font-medium" 
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">{t('auth.email')}</label>
                              <div className="relative group/input">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within/input:text-blue-400 transition-colors" />
                                <input 
                                  required
                                  type="email" 
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  placeholder="john@example.com"
                                  className="w-full bg-background/50 border border-border/80 rounded-xl py-2.5 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-muted-foreground/50 font-medium" 
                                />
                              </div>
                            </div>
                          </>
                          )}
                        </div>
                      )}

                        {currentStep === 2 && (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">{t('settings.restaurantName')}</label>
                              <div className="relative group/input">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within/input:text-blue-400 transition-colors" />
                                <input 
                                  required
                                  type="text" 
                                  name="business_name"
                                  value={formData.business_name}
                                  onChange={handleChange}
                                  placeholder="My Venture"
                                  className="w-full bg-background/50 border border-border/80 rounded-xl py-2.5 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-muted-foreground/50 font-medium" 
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">{t('settings.address')}</label>
                              <div 
                                className="relative group/input" 
                                tabIndex={0} 
                                onBlur={(e) => { 
                                  if (!e.currentTarget.contains(e.relatedTarget)) {
                                    setIsCountryOpen(false);
                                  } 
                                }}
                              >
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within/input:text-blue-400 transition-colors z-10 pointer-events-none" />
                                
                                <div 
                                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                                  className="w-full bg-background/50 border border-border/80 rounded-xl py-2.5 pl-9 pr-8 text-sm text-foreground transition-all font-medium flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 group-focus-within/input:border-blue-500/50 group-focus-within/input:ring-2 group-focus-within/input:ring-blue-500/30"
                                >
                                  <span className="truncate">{COUNTRIES.find(c => c.code === formData.country)?.name || 'Select Country'}</span>
                                  <div className={`text-slate-600 transition-transform duration-200 pointer-events-none ${isCountryOpen ? '-rotate-90' : 'rotate-90'}`}>
                                    <ArrowRight className="w-3 h-3" />
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {isCountryOpen && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      transition={{ duration: 0.15 }}
                                      className="absolute z-50 w-full mt-1 bg-card border border-border/50 rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                                    >
                                      {COUNTRIES.map(country => (
                                        <button
                                          key={country.code}
                                          type="button"
                                          onClick={() => {
                                            handleChange({ target: { name: 'country', value: country.code }});
                                            setIsCountryOpen(false);
                                          }}
                                          className={`w-full text-left px-3 py-2 hover:bg-muted transition-colors text-xs font-medium ${formData.country === country.code ? 'text-blue-400 bg-blue-500/10' : 'text-muted-foreground'}`}
                                        >
                                          {country.name}
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentStep === 3 && (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">{t('auth.password')}</label>
                              <div className="relative group/input">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within/input:text-blue-400 transition-colors" />
                                <input 
                                  required
                                  type="password" 
                                  name="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  placeholder="••••••••"
                                  className="w-full bg-background/50 border border-border/80 rounded-xl py-2.5 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-muted-foreground/50 font-medium" 
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Business Category</label>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { id: 'restaurant', label: 'Restaurant' },
                                  { id: 'cafe', label: 'Café' },
                                  { id: 'salon', label: 'Salon' },
                                  { id: 'hotel', label: 'Hotel' }
                                ].map((type) => (
                                  <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => handleChange({ target: { name: 'business_type', value: type.id }})}
                                    className={`py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all ${formData.business_type === type.id ? 'bg-blue-500/10 border border-blue-500/50 text-blue-400 ring-2 ring-blue-500/10' : 'bg-background/50 border border-border/80 text-muted-foreground hover:text-foreground'}`}
                                  >
                                    {type.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {currentStep === 4 && (
                          <div className="space-y-3">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Choose Your Plan</label>
                            <div className="space-y-2">
                              {plans.filter(p => p.is_active !== false).map((plan) => {
                                const PlanIcon = PLAN_ICONS[plan.slug] || Zap;
                                const isFree = plan.slug === 'free' || plan.monthly_price === 0;
                                const isSelected = selectedPlan === plan.slug;
                                const price = plan.monthly_price || 0;
                                return (
                                  <button
                                    key={plan.slug}
                                    type="button"
                                    onClick={() => setSelectedPlan(plan.slug)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                                      isSelected
                                        ? 'bg-blue-500/10 border-blue-500/50 ring-2 ring-blue-500/10'
                                        : 'bg-background/50 border-border/80 hover:border-blue-500/30'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                          plan.slug === 'enterprise' ? 'bg-amber-500/10 text-amber-400' :
                                          plan.slug === 'pro' ? 'bg-blue-500/10 text-blue-400' :
                                          'bg-slate-500/10 text-slate-400'
                                        }`}>
                                          <PlanIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <span className="text-xs font-black text-foreground uppercase tracking-tight">{plan.name || plan.slug}</span>
                                          <div className="text-[9px] text-muted-foreground font-medium">
                                            {isFree ? 'Free' : `$${price}/mo`}
                                          </div>
                                        </div>
                                      </div>
                                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                                    </div>
                                  </button>
                                );
                              })}
                              {plans.length === 0 && (
                                <div className="p-3 bg-background/50 rounded-xl border border-border/80 text-center">
                                  {plansError ? (
                                    <>
                                      <p className="text-[10px] text-red-400 font-medium mb-1">Failed to load plans</p>
                                      <button type="button" onClick={fetchPlans} className="text-[10px] text-blue-400 font-bold">Retry</button>
                                    </>
                                  ) : (
                                    <p className="text-[10px] text-muted-foreground font-medium">Loading plans...</p>
                                  )}
                                </div>
                              )}
                            </div>

                            {hasTurnstileKey && (
                              <div className="flex justify-center mt-3">
                                <Turnstile 
                                  siteKey={hasTurnstileKey}
                                  onSuccess={(token) => setTurnstileToken(token)}
                                  options={{ theme: 'dark' }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center gap-3 mt-6">
                      {currentStep > 1 && (
                        <button 
                          type="button" 
                          onClick={prevStep}
                          className="flex-1 border border-border hover:bg-muted text-muted-foreground font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 group active:scale-95 text-xs"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                          {t('common.back', 'Back')}
                        </button>
                      )}
                      
                      {currentStep < 4 ? (
                        <button 
                          type="button" 
                          onClick={nextStep}
                          disabled={currentStep === 1 ? (accountType === 'staff' || !formData.name || !formData.email) : currentStep === 2 ? (!formData.business_name) : (!formData.password)}
                          className="flex-[2] bg-primary hover:bg-primary/90 disabled:opacity-30 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 group active:scale-95 text-xs"
                        >
                          {t('common.continue', 'Continue')}
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <button 
                          type="submit"
                          disabled={isLoading || !selectedPlan || (hasTurnstileKey && !turnstileToken)}
                          className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 text-primary-foreground font-black py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 text-xs"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                          ) : (
                            <>
                               {t('common.submit', 'Submit')}
                              <CheckCircle2 className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>

                  {!trialSettings.require_card_for_trial && selectedPlan !== 'free' && (
                    <div className="mt-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-wider leading-none">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span className="whitespace-nowrap">No credit card required &middot; {trialSettings.trial_days || 14}-day free trial</span>
                      </span>
                    </div>
                  )}

                  <div className="mt-4 text-center border-t border-border/50 pt-4">
                    <p className="text-muted-foreground text-[10px] font-medium">
                      {t('auth.already_have_account')} {' '}
                      <Link to="/login" className="text-foreground font-bold hover:text-blue-400 transition-colors tracking-tight">{t('auth.login')}</Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-3 tracking-tighter uppercase italic">Check Your Email</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2 font-medium text-xs">
                    We sent a verification link to <strong className="text-foreground">{registeredEmail}</strong>
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6 font-medium text-[10px]">
                    Click the link in the email to verify your account and get started.
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0s]"></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <p className="text-[9px] text-muted-foreground font-medium">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="text-foreground font-bold hover:text-blue-400 transition-colors disabled:opacity-50"
                    >
                      {isResending ? 'sending...' : 'resend'}
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground/20 font-medium text-xs select-none pointer-events-none tracking-widest">
        Powered by {settings.platform_name || 'Sectros'} Engineering
      </div>
    </div>
  );
}
