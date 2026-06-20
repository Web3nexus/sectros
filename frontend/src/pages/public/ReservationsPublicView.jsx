import React, { useState, useEffect } from 'react';
import {Loader2, Calendar, Clock, Users, CheckCircle2, AlertCircle, ArrowLeft, MapPin, Phone, Mail, Star, Shield} from 'lucide-react';
import api from '../../services/api';
import { useBusinessConfig } from '../../hooks/useBusinessConfig';

const FIELD_TYPE_STYLES = {
  salon: { accent: '#8B0000', bg: '#FAF6F2', cardBg: '#F3DDCF', font: 'serif' },
  hotel: { accent: '#1a3a5c', bg: '#f0f4f8', cardBg: '#dce6f0', font: 'sans-serif' },
  cafe: { accent: '#6B4E31', bg: '#f8f5f0', cardBg: '#ede4d8', font: 'sans-serif' },
  restaurant: { accent: '#1a1a2e', bg: '#f8f9fc', cardBg: '#e8e9f0', font: 'sans-serif' },
};

const BUSINESS_ICONS = {
  restaurant: 'cutlery',
  cafe: 'coffee',
  salon: 'sparkles',
  hotel: 'building',
};

export default function ReservationsPublicView() {
  const [branding, setBranding] = useState(null);
  const [formConfig, setFormConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const config = useBusinessConfig();

  const btype = branding?.business_type || 'restaurant';
  const styles = FIELD_TYPE_STYLES[btype] || FIELD_TYPE_STYLES.restaurant;
  const businessName = branding?.business_name || 'Business Name';
  const logoUrl = branding?.logo_url;

  useEffect(() => {
    Promise.all([fetchBranding(), fetchFormConfig()]);
  }, []);

  const fetchBranding = async () => {
    try {
      const res = await api.get('branding');
      setBranding(res.data);
    } catch (e) {
      console.error("Branding fetch failed:", e);
    }
  };

  const fetchFormConfig = async () => {
    try {
      const res = await api.get('configuration/booking-form');
      setFormConfig(res.data);
    } catch (e) {
      console.warn("Form config fetch failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        customer_name: formData.customer_name || formData.name,
        customer_email: formData.customer_email || formData.email,
        customer_phone: formData.customer_phone || formData.phone,
        reservation_time: (formData.reservation_date || formData.check_in)
          ? `${formData.reservation_date || formData.check_in} ${formData.reservation_time || '00:00'}:00`
          : null,
        party_size: parseInt(formData.party_size || formData.guests || formData.adults || 1),
        source: 'website',
      };

      await api.post('reservations', payload);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Booking could not be completed. Please try again.');
    }
  };

  const renderField = (field) => {
    if (!field.enabled) return null;

    const isSelect = field.type === 'select';
    const isTextarea = field.type === 'textarea';
    const isDateTime = field.type === 'date' || field.type === 'time';

    const baseInput = "w-full bg-white/90 backdrop-blur border border-white/20 rounded-2xl px-5 py-4 outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all";

    const dateInput = "w-full bg-white/90 backdrop-blur rounded-2xl px-5 py-4 outline-none text-sm font-bold text-slate-800";

    return (
      <div key={field.name} className={`space-y-1.5 ${isTextarea ? 'md:col-span-2' : ''}`}>
        <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 ml-1">
          {field.label} {field.required && <span className="text-red-300">*</span>}
        </label>
        {isSelect ? (
          <select name={field.name} required={field.required} value={formData[field.name] || ''} onChange={handleChange} className={baseInput}>
            <option value="">Select {field.label}</option>
            {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : isTextarea ? (
          <textarea name={field.name} required={field.required} value={formData[field.name] || ''} onChange={handleChange} placeholder={field.label} className={baseInput} rows={2} />
        ) : (
          <input name={field.name} required={field.required} type={field.type} value={formData[field.name] || ''} onChange={handleChange} placeholder={field.label} className={isDateTime ? dateInput : baseInput} />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: styles.bg }}>
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: styles.accent }} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: styles.accent }}>Preparing Booking Portal...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${styles.bg}, ${styles.cardBg})` }}>
        <div className="max-w-md w-full bg-white rounded-[32px] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-500 border" style={{ borderColor: `${styles.accent}20` }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: `${styles.accent}10` }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: styles.accent }} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">{btype === 'hotel' ? 'Booking Confirmed!' : btype === 'salon' ? 'Appointment Booked!' : 'Reservation Confirmed!'}</h3>
          <p className="text-slate-500 text-sm mb-8">We've sent a confirmation to <span className="font-bold text-slate-800">{formData.customer_email || formData.email || 'your email'}</span>.</p>
          <button onClick={() => { setStatus('idle'); setFormData({}); }}
            className="w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl" style={{ background: styles.accent }}>
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  const formTitle = formConfig?.title?.replace(/\{name\}/g, businessName) || 
    (btype === 'salon' ? `Book an Appointment at ${businessName}` :
     btype === 'hotel' ? `Book Your Stay at ${businessName}` :
     `Reserve Your Table at ${businessName}`);

  const formSubtitle = formConfig?.subtitle?.replace(/\{name\}/g, businessName) || 
    (btype === 'salon' ? "Expert beauty services tailored to your needs." :
     btype === 'hotel' ? "Experience luxury and comfort at its finest." :
     "Experience exceptional service in an atmosphere designed for excellence.");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${styles.bg} 0%, ${styles.cardBg} 100%)` }}>
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: styles.accent, filter: 'blur(120px)', transform: 'translate(-30%, -30%)' }} />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: styles.accent, filter: 'blur(120px)', transform: 'translate(30%, 30%)' }} />

      {/* Header */}
      <header className="relative z-10 w-full backdrop-blur-xl bg-white/70 border-b border-white/20 flex items-center justify-between px-6 md:px-12 h-20 shrink-0">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt={businessName} className="h-9 w-auto object-contain" />
          ) : (
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg" style={{ background: styles.accent }}>
              {businessName.charAt(0)}
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="font-black text-lg tracking-tight text-slate-900">{businessName}</h1>
            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              {branding?.business_address && (
                <span className="flex items-center gap-1"><MapPin size={10} /> {branding.business_address.split(',')[0]}</span>
              )}
              {branding?.business_phone && (
                <span className="flex items-center gap-1"><Phone size={10} /> {branding.business_phone}</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-all px-4 py-2 rounded-xl hover:bg-white/50">
          <ArrowLeft size={14} /> Back
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto relative z-10">
        <div className="w-full max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            {/* Left - Info Panel */}
            <div className="lg:w-5/12 flex flex-col justify-center space-y-6 p-8 lg:p-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg" style={{ background: styles.accent }}>
                <Calendar size={12} /> {btype === 'hotel' ? 'Book Now' : btype === 'salon' ? 'Schedule' : 'Reserve'}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                {formTitle}
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                {formSubtitle}
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: styles.accent }}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Fast Confirmation</div>
                    <p className="text-[10px] text-slate-500">Instant booking confirmation via email</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: styles.accent }}>
                    <Shield size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">Secure & Reliable</div>
                    <p className="text-[10px] text-slate-500">Your information is protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: styles.accent }}>
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">{btype === 'hotel' ? 'Personalized Service' : btype === 'salon' ? 'Expert Staff' : 'Premium Service'}</div>
                    <p className="text-[10px] text-slate-500">{btype === 'salon' ? 'Talented professionals at your service' : 'Tailored to your preferences'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Form Card */}
            <div className="lg:w-7/12">
              <div className="rounded-[32px] p-1 shadow-2xl" style={{ background: `linear-gradient(135deg, ${styles.accent}30, ${styles.accent}10)` }}>
                <div className="rounded-[30px] p-8 md:p-10 backdrop-blur-xl" style={{ background: `linear-gradient(135deg, ${styles.accent}DD, ${styles.accent}99)` }}>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {(formConfig?.fields || []).map(field => renderField(field))}
                    </div>

                    {status === 'error' && (
                      <div className="p-4 bg-red-500/20 text-red-100 rounded-2xl text-[10px] font-bold flex items-center gap-2 border border-red-500/20">
                        <AlertCircle size={14} /> {errorMsg}
                      </div>
                    )}

                    <button type="submit" disabled={status === 'loading'}
                      className="w-full py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 text-white"
                      style={{ background: styles.accent }}>
                      {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      {status === 'loading' ? 'Processing...' : `Confirm ${btype === 'hotel' ? 'Booking' : btype === 'salon' ? 'Appointment' : 'Reservation'}`}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center backdrop-blur-xl bg-white/40 border-t border-white/20">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Powered by <span className="text-slate-600">Sectros</span> &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
