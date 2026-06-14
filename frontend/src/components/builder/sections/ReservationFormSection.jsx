import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import {Loader2, CheckCircle2, AlertCircle} from 'lucide-react';
import { useBusinessConfig } from '../../../hooks/useBusinessConfig';

export default function ReservationFormSection({ content, theme, businessType: propBusinessType }) {
  const { 
    layout = 'tastenest-dark', 
    title = 'RESERVE A TABLE', 
    subtitle = 'Discover our New Menu!' 
  } = content;

  const config = useBusinessConfig(propBusinessType);
  const { primaryColor = '#F70A38', secondaryColor = '#FFC806', fontFamily = 'Outfit' } = theme;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    source: 'website'
  });

  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  // Extract source from URL if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get('src') || params.get('source') || 'website';
    setFormData(prev => ({ ...prev, source: src }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      // Combine date and time for backend
      const combinedTime = `${formData.reservation_date || formData.check_in} ${formData.reservation_time}:00`;
      
      const payload = {
        ...formData,
        customer_name: formData.customer_name || formData.name,
        customer_email: formData.customer_email || formData.email,
        customer_phone: formData.customer_phone || formData.phone,
        reservation_time: combinedTime,
        party_size: parseInt(formData.party_size || formData.guests || formData.adults || 1),
        source: formData.source || 'website'
      };

      await api.post('reservations', payload);
      setStatus('success');
    } catch (err) {
      console.error('Booking failed:', err);
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to confirm booking. Please check availability.');
    }
  };

  const renderField = (field, isDark = false) => {
    const labelClass = isDark ? "text-[9px] font-black uppercase tracking-widest text-white/50 ml-1" : "text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1";
    const inputClass = isDark ? "w-full bg-white/10 text-white border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-bold placeholder:text-white/20 focus:bg-white/20 transition-all border" : "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none text-sm font-bold placeholder:text-slate-300 focus:bg-white focus:border-primary transition-all";
    const dateInputClass = isDark ? "w-full bg-white text-slate-900 rounded-2xl px-5 py-4 outline-none text-sm font-bold" : "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none text-sm font-bold text-slate-700";

    if (field.type === 'select') {
      return (
        <div key={field.name} className="space-y-1.5">
          <label className={labelClass}>{field.label}</label>
          <select 
            required={field.required}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(opt => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
          </select>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>{field.label}</label>
          <textarea 
            required={field.required}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            placeholder={field.label}
            className={inputClass}
            rows="2"
          />
        </div>
      );
    }

    return (
      <div key={field.name} className="space-y-1.5">
        <label className={labelClass}>{field.label}</label>
        <input 
          required={field.required}
          name={field.name}
          type={field.type}
          value={formData[field.name] || ''}
          onChange={handleChange}
          placeholder={field.label}
          className={field.type === 'date' || field.type === 'time' ? dateInputClass : inputClass}
        />
      </div>
    );
  };

  if (status === 'success') {
    return (
      <section className="w-full py-12 px-6 flex items-center justify-center min-h-[400px]" style={{ fontFamily }}>
        <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-2xl border border-emerald-100 animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Booking Confirmed!</h3>
           <p className="text-slate-500 text-sm mb-8">Your {config.type === 'hotel' ? 'room' : config.type === 'salon' ? 'appointment' : 'table'} is locked in. We've sent a confirmation email to <span className="font-bold text-slate-800">{formData.customer_email || formData.email}</span>.</p>
           <button 
            onClick={() => setStatus('idle')}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
           >
             Make Another Booking
           </button>
        </div>
      </section>
    );
  }

  if (layout === 'tastenest-light') {
    return (
      <section className="w-full bg-[#f4f7f6] py-12 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row bg-white rounded-4xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
           <div className="lg:w-1/2 min-h-[450px] bg-cover bg-center relative" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338988a2e8c0?auto=format&fit=crop&q=80')` }}>
              <div className="absolute inset-0 bg-linear-to-r from-black/20 to-transparent" />
           </div>
           <div className="lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
              <h4 className="text-[#F70A38] text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: primaryColor }}>{config.bookingForm.title}</h4>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-10 tracking-tight uppercase">
                {title}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {config.bookingForm.fields.map(field => renderField(field, false))}
                </div>

                {status === 'error' && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold flex items-center gap-2">
                    <AlertCircle size={14} /> {errorMsg}
                  </div>
                )}

                <button 
                  disabled={status === 'loading'}
                  className="w-full py-4.5 rounded-xl text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4 flex justify-center items-center gap-2" 
                  style={{ backgroundColor: primaryColor }}
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ${config.bookingForm.title}`}
                </button>
              </form>
           </div>
        </div>
      </section>
    );
  }

  if (layout === 'salon-elegance') {
    return (
      <section className="w-full bg-[#FAF6F2] py-24 px-6 md:px-16" style={{ fontFamily }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row bg-[#F3DDCF] rounded-none overflow-hidden shadow-xl border border-[#E7BFA8]">
           <div className="lg:w-5/12 min-h-[450px] bg-cover bg-center relative" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80')` }}>
              <div className="absolute inset-0 bg-[#8B0000]/10 mix-blend-multiply" />
           </div>
           <div className="lg:w-7/12 p-10 lg:p-16 flex flex-col justify-center">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-[#7A1E1E]">{config.bookingForm.title}</h4>
              <h2 className="text-4xl md:text-5xl font-serif italic text-[#8B0000] leading-tight mb-4">
                {title}
              </h2>
              <p className="text-[#77706B] mb-8 font-light">
                {subtitle}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                   {config.bookingForm.fields.map(field => renderField(field, false))}
                </div>

                {status === 'error' && (
                  <div className="p-3 bg-white text-red-600 border border-red-200 rounded-none text-[10px] font-bold flex items-center gap-2">
                    <AlertCircle size={14} /> {errorMsg}
                  </div>
                )}

                <button 
                  disabled={status === 'loading'}
                  className="w-full py-4 bg-[#8B0000] text-white font-bold uppercase text-[10px] tracking-widest hover:bg-[#7A1E1E] transition-colors mt-6 flex justify-center items-center gap-2" 
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ${config.bookingForm.title}`}
                </button>
              </form>
           </div>
        </div>
      </section>
    );
  }

  // TasteNest Dark (Default)
  return (
    <section className="w-full py-16 px-6 md:px-16 rounded-[40px] overflow-hidden relative shadow-2xl" 
      style={{ 
        background: `linear-gradient(135deg, ${primaryColor}, #000000)`,
        fontFamily 
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
        <h2 className="text-4xl md:text-[3.5rem] font-black text-white leading-tight mb-4 tracking-tighter text-center uppercase">
          {title}
        </h2>
        <p className="text-white/70 font-medium text-lg mb-12 text-center max-w-2xl">
          {subtitle}
        </p>

        <div className="w-full bg-black/30 backdrop-blur-xl p-8 md:p-10 rounded-[32px] border border-white/10 shadow-3xl">
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {config.bookingForm.fields.map(field => renderField(field, true))}
              </div>

              <div className="flex justify-center">
                <button 
                  disabled={status === 'loading'}
                  className="w-full md:w-1/2 py-4.5 rounded-2xl text-slate-900 font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.05] active:scale-95 transition-transform flex justify-center items-center gap-2 shadow-2xl" 
                  style={{ backgroundColor: secondaryColor }}
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ${config.bookingForm.title}`}
                </button>
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-[10px] font-bold flex items-center gap-2 border border-red-500/20">
                  <AlertCircle size={14} /> {errorMsg}
                </div>
              )}
           </form>
        </div>
      </div>
    </section>
  );
}

