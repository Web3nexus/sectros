import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { Star, MessageSquare, ShieldCheck, CheckCircle2, Heart, Sparkles, Building2 } from 'lucide-react';
import api from '../../services/api';

export default function ReviewPublicView() {
  const [searchParams] = useSearchParams();
  const { tenantId: routeTenantId } = useParams();

  const queryTenant = searchParams.get('tenant') || routeTenantId || '';
  const reservationId = searchParams.get('res') || '';
  const orderId = searchParams.get('order') || '';
  const confirmationCode = searchParams.get('code') || '';

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [publicText, setPublicText] = useState('');
  const [internalComment, setInternalComment] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [businessName, setBusinessName] = useState('Our Business');

  useEffect(() => {
    // Attempt to load branding or tenant name
    const fetchBranding = async () => {
      try {
        const config = queryTenant ? { headers: { 'X-Tenant': queryTenant, 'X-Tenant-Domain': queryTenant } } : {};
        const res = await api.get('/central-api/public/branding', config);
        if (res.data?.business_name || res.data?.app_name) {
          setBusinessName(res.data.business_name || res.data.app_name);
        }
      } catch (e) {
        // Fallback default
      }
    };
    fetchBranding();
  }, [queryTenant]);

  const ratingLabels = {
    1: 'Needs Improvement',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Exceptional!',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!publicText.trim()) {
      setError('Please write a brief public review.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        customer_name: customerName,
        rating: rating,
        text: publicText,
        internal_comment: internalComment.trim() || null,
        reservation_id: reservationId ? parseInt(reservationId) : null,
        order_id: orderId ? parseInt(orderId) : null,
      };

      const config = queryTenant ? { 
        headers: { 
          'X-Tenant': queryTenant,
          'X-Tenant-Domain': queryTenant 
        },
        params: { tenant: queryTenant }
      } : {};

      await api.post('/tenant-api/public/reviews', payload, config);
      setSubmitted(true);
    } catch (err) {
      console.error('Review submit failed:', err);
      setError(err.response?.data?.message || 'Could not submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You for Your Feedback!</h2>
          <p className="text-stone-400 text-sm mb-6">
            Your review helps <span className="text-stone-200 font-semibold">{businessName}</span> continually improve. We truly appreciate you taking the time to share your experience with us.
          </p>
          <div className="p-4 bg-stone-950/60 rounded-2xl border border-stone-800/80 mb-6 text-left">
            <div className="flex items-center gap-1 text-amber-400 mb-2">
              {[...Array(rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-xs text-stone-400 ml-2 font-medium">({rating}/5 stars)</span>
            </div>
            <p className="text-xs text-stone-300 italic">"{publicText}"</p>
            {internalComment && (
              <div className="mt-3 pt-3 border-t border-stone-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 block mb-1">
                  Private Management Feedback Delivered
                </span>
                <p className="text-xs text-stone-400">{internalComment}</p>
              </div>
            )}
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium text-sm transition"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Guest Feedback
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How was your visit to {businessName}?
          </h1>
          <p className="text-stone-400 text-sm mt-2 max-w-md mx-auto">
            {confirmationCode ? (
              <span>Verified Guest Code: <strong className="text-amber-400 tracking-wider">#{confirmationCode}</strong> • </span>
            ) : null}
            We value your honest opinion to help us deliver unforgettable hospitality.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating Picker */}
          <div className="text-center pb-2 border-b border-stone-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Overall Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-stone-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm font-semibold text-amber-400 h-5">
              {ratingLabels[hoverRating || rating]}
            </div>
          </div>

          {/* Guest Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
              Your Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* 1. External / Public Review */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                Public Review <span className="text-amber-400">*</span>
              </label>
              <span className="text-[11px] text-stone-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Displayed publicly
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={publicText}
              onChange={(e) => setPublicText(e.target.value)}
              placeholder="What did you love about your meal or service? Would you recommend us to friends?"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-4 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* 2. Internal / Private Feedback */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300">
                Private Management Feedback
              </label>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Confidential to staff
              </span>
            </div>
            <p className="text-xs text-stone-500 mb-2">
              Any private suggestions, staff remarks, or things we could improve next time? Only our management and head chef will read this.
            </p>
            <textarea
              rows={3}
              value={internalComment}
              onChange={(e) => setInternalComment(e.target.value)}
              placeholder="Optional private suggestions (e.g. seating, temperature, specific dish timing)..."
              className="w-full bg-stone-950 border border-stone-800/80 rounded-xl p-4 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <span className="animate-pulse">Submitting Feedback...</span>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-stone-950" />
                Submit Review & Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
