import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator, DollarSign, Calendar, AlertCircle, Download,
  Plus, CheckCircle2, TrendingUp, Receipt, Camera, RefreshCw, BookOpen
} from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../hooks/useCurrency';

export default function CashRegisterView() {
  const { symbol, formatAmount } = useCurrency();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [missingDays, setMissingDays] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  // Modal for new Z-Bon closing
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    opening_float: 200,
    cash_sales: 0,
    card_sales: 0,
    counted_cash: 200,
    tips_surplus: 0,
    vat_7_amount: 0,
    vat_19_amount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchRecords();
  }, [month]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/tenant-api/daily-cash?month=${month}`);
      setRecords(res.data.records || []);
      setSummary(res.data.summary || {});
      setMissingDays(res.data.missing_days || []);
    } catch (err) {
      console.error('Failed to load cash book records', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewClosing = async (prefillDate = null) => {
    const targetDate = prefillDate || new Date().toISOString().slice(0, 10);
    try {
      const res = await axios.get(`/tenant-api/daily-cash/draft-today?date=${targetDate}`);
      setFormData({
        date: targetDate,
        opening_float: res.data.opening_float || 200,
        cash_sales: res.data.cash_sales || 0,
        card_sales: res.data.card_sales || 0,
        counted_cash: res.data.expected_cash_in_drawer || 200,
        tips_surplus: 0,
        vat_7_amount: res.data.vat_7_amount || 0,
        vat_19_amount: res.data.vat_19_amount || 0,
        notes: `Z-Bon for ${targetDate} (${res.data.order_count || 0} orders processed)`,
      });
    } catch (err) {
      setFormData({
        date: targetDate,
        opening_float: 200,
        cash_sales: 0,
        card_sales: 0,
        counted_cash: 200,
        tips_surplus: 0,
        vat_7_amount: 0,
        vat_19_amount: 0,
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmitClosing = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tenant-api/daily-cash', formData);
      alert('Daily Z-Bon closing recorded successfully.');
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      alert('Failed to save closing.');
    }
  };

  const handleExportCsv = () => {
    window.open(`/tenant-api/finance/export?type=settlements&month=${month}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Calculator className="w-7 h-7 text-primary" />
            Daily Cash Book & Register Closeout
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            End-of-day register closeouts (Z-Reports), cash vs card reconciliation, tax rate splits, and accountant exports (DATEV / CSV).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
          />

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-secondary hover:bg-muted text-foreground border border-border text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            Export for Accountant (DATEV / CSV)
          </button>

          <button
            onClick={() => handleOpenNewClosing()}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            + New Daily Closeout (Z-Report)
          </button>
        </div>
      </div>

      {/* Plain English Guide to Z-Report & DATEV */}
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-foreground flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-bold text-foreground text-sm">
            What is a Daily Closeout (Z-Report) & DATEV Export?
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Daily Closeout (Z-Report / Z-Bon):</strong> At the end of every operating day, perform a closeout to count cash in the drawer, balance card terminal sales, and lock in the day's revenue and tax totals into your official cash book.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">DATEV / CSV Accounting Export:</strong> A standardized export formatted specifically for tax advisors and accountants (or spreadsheet software) so all daily sales and tax breakdown lines can be imported without manual paperwork.
          </p>
        </div>
      </div>

      {/* Missing Days Alert Banner */}
      {missingDays.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-bold">Missing Daily Register Closeouts Detected ({missingDays.length} days)</p>
              <p className="text-[11px] text-amber-400/80">
                To keep your cash ledger accurate and compliant, every business day should have a recorded closeout. Missing: {missingDays.slice(0, 5).join(', ')} {missingDays.length > 5 ? `+ ${missingDays.length - 5} more` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenNewClosing(missingDays[0])}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
          >
            Close Day {missingDays[0]}
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Total Month Sales</span>
          <p className="text-2xl font-black text-foreground mt-1">
            {formatAmount(summary?.total_sales || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Cash: {formatAmount(summary?.total_cash || 0)} • Card: {formatAmount(summary?.total_card || 0)}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Standard Tax (19%)</span>
          <p className="text-2xl font-black text-primary mt-1">
            {formatAmount(summary?.total_vat_19 || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Standard rate items</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Reduced Tax (7%)</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatAmount(summary?.total_vat_7 || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Reduced food / grocery rate</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Recorded Closings</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {summary?.days_recorded || 0} Days
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Certified digital ledger</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-foreground">
          <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Float</th>
              <th className="p-4">Cash Sales</th>
              <th className="p-4">Card Sales</th>
              <th className="p-4">Counted Cash</th>
              <th className="p-4">Total Sales</th>
              <th className="p-4">Tax (7%)</th>
              <th className="p-4">Tax (19%)</th>
              <th className="p-4">Tips</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.length > 0 ? (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-bold text-foreground">{r.date}</td>
                  <td className="p-4">{formatAmount(r.opening_float)}</td>
                  <td className="p-4 font-medium text-emerald-600">{formatAmount(r.cash_sales)}</td>
                  <td className="p-4 font-medium text-primary">{formatAmount(r.card_sales)}</td>
                  <td className="p-4 font-bold">{formatAmount(r.counted_cash)}</td>
                  <td className="p-4 font-black text-foreground">{formatAmount(r.total_sales)}</td>
                  <td className="p-4 text-emerald-600">{formatAmount(r.vat_7_amount)}</td>
                  <td className="p-4 text-primary">{formatAmount(r.vat_19_amount)}</td>
                  <td className="p-4 text-amber-500">+{formatAmount(r.tips_surplus)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="p-8 text-center text-muted-foreground">
                  No daily register closeouts recorded for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Z-Bon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" /> Record Daily Register Closeout (Z-Report)
            </h3>

            <form onSubmit={handleSubmitClosing} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Closing Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Opening Float ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.opening_float}
                    onChange={(e) => setFormData({ ...formData, opening_float: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Cash Sales ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cash_sales}
                    onChange={(e) => setFormData({ ...formData, cash_sales: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground font-bold text-emerald-600 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Card / Terminal Sales ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.card_sales}
                    onChange={(e) => setFormData({ ...formData, card_sales: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground font-bold text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Counted Cash on Hand ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.counted_cash}
                    onChange={(e) => setFormData({ ...formData, counted_cash: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Tips Surplus ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tips_surplus}
                    onChange={(e) => setFormData({ ...formData, tips_surplus: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Notes / Register Closeout Reference</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 transition-all"
                >
                  Save Daily Closeout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

