import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CreditCard, UtensilsCrossed, CheckCircle2, Heart, Sparkles, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function OrderPayPublicView() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const queryTenant = searchParams.get('tenant') || '';

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [business, setBusiness] = useState({ name: 'Sectros Restaurant', currency: '$' });
  const [error, setError] = useState(null);

  // Tip Selection
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState('');
  const [useCustomTip, setUseCustomTip] = useState(false);

  // Customer Contact
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Payment State
  const [processing, setProcessing] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId, queryTenant]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = queryTenant ? {
        headers: {
          'X-Tenant': queryTenant,
          'X-Tenant-Domain': queryTenant,
        },
        params: { tenant: queryTenant },
      } : {};

      const res = await api.get(`/tenant-api/public/orders/${orderId}`, config);
      setOrder(res.data.order);
      if (res.data.business) {
        setBusiness(res.data.business);
      }
      if (res.data.order?.payment_status === 'paid') {
        setPaidSuccess(true);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError('Unable to find this order. It may have expired or already been settled.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTipAmount = () => {
    if (!order) return 0;
    if (useCustomTip) {
      const val = parseFloat(customTip);
      return isNaN(val) || val < 0 ? 0 : val;
    }
    const subtotal = order.total_amount || 0;
    return (subtotal * tipPercent) / 100;
  };

  const tipAmount = calculateTipAmount();
  const grandTotal = order ? (order.total_amount + tipAmount) : 0;

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      const config = queryTenant ? {
        headers: {
          'X-Tenant': queryTenant,
          'X-Tenant-Domain': queryTenant,
        },
        params: { tenant: queryTenant },
      } : {};

      const payload = {
        tip_amount: tipAmount,
        customer_name: customerName.trim() || 'Guest',
        customer_email: customerEmail.trim() || null,
        customer_phone: customerPhone.trim() || null,
        payment_method: 'card',
      };

      await api.post(`/tenant-api/public/orders/${orderId}/pay`, payload, config);
      setPaidSuccess(true);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-200 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <Receipt className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold mb-2">Order Not Available</h2>
          <p className="text-stone-400 text-sm mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block py-2.5 px-5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-sm font-medium transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (paidSuccess) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Settled!</h2>
          <p className="text-stone-400 text-sm mb-6">
            Thank you for dining with <strong className="text-stone-200">{business.name}</strong>. Your payment of <strong className="text-emerald-400">{business.currency}{grandTotal.toFixed(2)}</strong> has been processed successfully.
          </p>

          <div className="p-4 bg-stone-950/70 rounded-2xl border border-stone-800 mb-6 text-left text-sm space-y-2">
            <div className="flex justify-between text-stone-400">
              <span>Order Number</span>
              <span className="font-mono text-stone-200">#{order?.id}</span>
            </div>
            {order?.table_code && (
              <div className="flex justify-between text-stone-400">
                <span>Table</span>
                <span className="text-stone-200">{order.table_code}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-400">
              <span>Food & Drinks Subtotal</span>
              <span className="text-stone-200">{business.currency}{(order?.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Staff Gratuity / Tip</span>
              <span className="text-amber-400 font-semibold">{business.currency}{tipAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-stone-800 pt-2 flex justify-between font-bold text-base text-stone-100">
              <span>Total Paid</span>
              <span className="text-emerald-400">{business.currency}{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <Link
            to={`/review?order=${order?.id}${queryTenant ? `&tenant=${queryTenant}` : ''}`}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 mb-3 shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Leave a Quick Review
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="block text-xs text-stone-500 hover:text-stone-400 transition py-1"
          >
            Done • Return to Site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            {order.table_code ? `Table ${order.table_code}` : 'In-House Dining'}
          </div>
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="text-stone-400 text-xs mt-1">Order #{order.id} • Itemized Bill</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Itemized Receipt */}
        <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-4 mb-6">
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs border-b border-stone-800/50 pb-2.5 last:border-0 last:pb-0">
                <div className="flex-1 pr-3">
                  <div className="font-semibold text-stone-200">
                    <span className="text-amber-400 font-bold mr-1.5">{item.quantity}x</span>
                    {item.name}
                  </div>
                  {item.addons && (
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {Array.isArray(item.addons) ? item.addons.join(', ') : JSON.stringify(item.addons)}
                    </div>
                  )}
                </div>
                <div className="font-mono text-stone-300 font-medium">
                  {business.currency}{item.subtotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-800 mt-3 pt-3 flex justify-between items-center text-sm">
            <span className="text-stone-400">Order Subtotal</span>
            <span className="font-bold text-stone-100 font-mono">
              {business.currency}{order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Staff Tip / Gratuity Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-amber-400" />
              Add Waiter Tip / Gratuity
            </label>
            <span className="text-xs font-bold text-amber-400">
              +{business.currency}{tipAmount.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mb-3">
            Tips go directly to your server and staff on duty for excellent hospitality.
          </p>

          <div className="grid grid-cols-5 gap-2 mb-2">
            {[0, 10, 15, 18, 20].map((pct) => (
              <button
                type="button"
                key={pct}
                onClick={() => {
                  setTipPercent(pct);
                  setUseCustomTip(false);
                }}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  !useCustomTip && tipPercent === pct
                    ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md shadow-amber-500/20'
                    : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                }`}
              >
                {pct === 0 ? 'No Tip' : `${pct}%`}
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUseCustomTip(true)}
              className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                useCustomTip
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-stone-950 text-stone-400 border-stone-800'
              }`}
            >
              Custom $
            </button>
            {useCustomTip && (
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-xs text-stone-400 font-mono">
                  {business.currency}
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  placeholder="Enter tip amount"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-stone-950/80 border border-amber-500/30 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center text-stone-400 text-xs mb-1">
            <span>Bill Subtotal</span>
            <span>{business.currency}{order.total_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-stone-400 text-xs mb-2">
            <span>Server Tip</span>
            <span className="text-amber-400 font-medium">+{business.currency}{tipAmount.toFixed(2)}</span>
          </div>
          <div className="border-t border-stone-800 pt-2 flex justify-between items-center">
            <span className="text-sm font-bold text-stone-200">Total to Pay</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">
              {business.currency}{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Customer Information (Optional receipt) */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Jordan Smith"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Email for Receipt
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={processing}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {processing ? (
            <span className="animate-pulse">Processing Payment...</span>
          ) : (
            <>
              <CreditCard className="w-4 h-4 fill-stone-950" />
              Pay {business.currency}{grandTotal.toFixed(2)} with Card
            </>
          )}
        </button>

        <p className="text-[10px] text-stone-500 text-center mt-3 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Encrypted &amp; Secure Mobile Checkout
        </p>
      </div>
    </div>
  );
}
