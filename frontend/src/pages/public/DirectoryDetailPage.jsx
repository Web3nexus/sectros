import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Globe, Mail, Clock, Star, ArrowLeft, ShieldCheck, Share2, Heart, CheckCircle2, ChevronRight, Loader2, Calendar } from 'lucide-react';
import axios from 'axios';

export default function DirectoryDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/public/directory/listings/${slug}`);
        setListing(res.data);
      } catch (err) {
        console.error('Detail Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 size={48} className="animate-spin text-primary mb-4" />
        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Loading Business Profile...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Business Not Found</h2>
        <button onClick={() => navigate('/directory')} className="text-primary font-bold hover:underline">Return to Directory</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header / Hero */}
      <div className="relative h-[400px] md:h-[500px]">
        <img 
          src={listing.cover_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80'} 
          className="w-full h-full object-cover"
          alt={listing.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute top-8 left-8">
          <button 
            onClick={() => navigate('/directory')}
            className="bg-white/10 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/20 transition-all border border-white/20"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="absolute bottom-12 left-0 w-full px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-blue-500/30">
                  {listing.business_type}
                </span>
                {listing.is_verified && (
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/30">
                    <ShieldCheck size={12} /> Verified
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase mb-4">
                {listing.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary" /> {listing.address}, {listing.city}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < Math.floor(listing.rating_avg) ? '#3b82f6' : 'none'} className={i < Math.floor(listing.rating_avg) ? 'text-primary' : 'text-white/30'} />
                    ))}
                  </div>
                  <span className="text-white font-black">{listing.rating_avg}</span>
                  <span className="text-white/60">({listing.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(4)].map((_, i) => (
                    <span key={i} className={i < listing.price_range ? 'text-white' : 'text-white/20'}>$</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                <Share2 size={20} />
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                <Heart size={20} />
              </button>
              <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/40 hover:bg-blue-700 transition-all active:scale-95">
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">About the Business</h2>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {listing.description}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Offered Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(listing.services || ['Premium Consultation', 'Executive Experience', 'Signature Service']).map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-200 hover:border-primary transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <CheckCircle2 size={20} />
                      </div>
                      <span className="font-black text-slate-800 uppercase tracking-tight text-sm">{service}</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-all" />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Verified Reviews</h2>
              <div className="space-y-6">
                {(listing.reviews?.length > 0 ? listing.reviews : [
                  { customer_name: 'Alex Johnson', rating: 5, comment: 'Incredible experience from start to finish. Highly recommend!', created_at: '2024-05-10' },
                  { customer_name: 'Sarah Miller', rating: 4, comment: 'Great service and professional staff. Will definitely return.', created_at: '2024-05-08' }
                ]).map((review, i) => (
                  <div key={i} className="p-8 bg-white rounded-[32px] border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-slate-900 uppercase tracking-tight">{review.customer_name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={12} fill={j < review.rating ? '#3b82f6' : 'none'} className={j < review.rating ? 'text-primary' : 'text-slate-200'} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                    <p className="text-sm font-bold text-slate-800">{listing.address}, {listing.city}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-bold text-slate-800">{listing.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm font-bold text-slate-800">{listing.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Website</p>
                    <p className="text-sm font-bold text-slate-800 text-primary hover:underline cursor-pointer">{listing.website}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[40px] p-8 text-white">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8">Opening Hours</h3>
              <div className="space-y-4">
                {Object.entries(listing.opening_hours || {
                  Monday: '9:00 AM - 10:00 PM',
                  Tuesday: '9:00 AM - 10:00 PM',
                  Wednesday: '9:00 AM - 10:00 PM',
                  Thursday: '9:00 AM - 10:00 PM',
                  Friday: '9:00 AM - 11:00 PM',
                  Saturday: '10:00 AM - 11:00 PM',
                  Sunday: '10:00 AM - 8:00 PM'
                }).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{day}</span>
                    <span className="text-xs font-black">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-primary rounded-[40px] p-8 text-white shadow-2xl shadow-blue-500/30">
               <div className="flex items-center gap-3 mb-6">
                  <Calendar size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tight">Direct Booking</h3>
               </div>
               <p className="text-sm font-medium text-white/80 mb-8 leading-relaxed">
                  Book directly through Sectroslr to get instant confirmation and exclusive rewards.
               </p>
               <button className="w-full bg-white text-primary py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-lg">
                  Check Availability
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
