import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calculator, Building2, Download, FileText, Calendar, DollarSign,
  TrendingUp, Users, HeartPulse, Receipt, Upload, CheckCircle2,
  AlertCircle, LogOut, Search, Filter, ShieldCheck, ChevronRight
} from 'lucide-react';
import axios from 'axios';

export default function TaxAdvisorDashboard() {
  const navigate = useNavigate();
  const [advisor, setAdvisor] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cash-book'); // cash-book, expenses, sick-notes, payslips

  // Advisor bill upload modal
  const [showBillModal, setShowBillModal] = useState(false);
  const [billForm, setBillForm] = useState({
    invoice_number: '',
    amount: '',
    bill_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const token = localStorage.getItem('tax_advisor_token');

  useEffect(() => {
    if (!token) {
      navigate('/tax-advisor/login');
      return;
    }
    const userStr = localStorage.getItem('tax_advisor_user');
    if (userStr) {
      setAdvisor(JSON.parse(userStr));
    }
    fetchClients();
  }, [token]);

  const fetchClients = async () => {
    try {
      const res = await axios.get('/central-api/tax-advisor/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const clientList = res.data.clients || [];
      setClients(clientList);
      if (clientList.length > 0) {
        setSelectedClient(clientList[0].id);
      }
    } catch (err) {
      console.error('Failed to load clients', err);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      fetchClientData(selectedClient, month);
    }
  }, [selectedClient, month]);

  const fetchClientData = async (tenantId, selectedMonth) => {
    setLoading(true);
    try {
      const res = await axios.get(`/central-api/tax-advisor/clients/${tenantId}/data?month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientData(res.data);
    } catch (err) {
      console.error('Failed to load client data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDatev = () => {
    if (!selectedClient) return;
    window.open(`/central-api/tax-advisor/clients/${selectedClient}/export/datev?month=${month}`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('tax_advisor_token');
    localStorage.removeItem('tax_advisor_user');
    navigate('/tax-advisor/login');
  };

  const handleUploadBill = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/central-api/tax-advisor/clients/${selectedClient}/bills`, billForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Tax advisor bill uploaded to restaurant financial ledger.');
      setShowBillModal(false);
      setBillForm({ invoice_number: '', amount: '', bill_date: new Date().toISOString().slice(0, 10), notes: '' });
    } catch (err) {
      alert('Failed to upload bill.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
              Sectros <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Tax Advisor Portal</span>
            </h1>
            <p className="text-[11px] text-slate-400">{advisor?.company_name || 'Tax & Accounting Firm'}</p>
          </div>
        </div>

        {/* Client Switcher & Month Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClient || ''}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer pr-2 font-medium"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.business_name} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleDownloadDatev}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            DATEV Export
          </button>

          <button
            onClick={() => setShowBillModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-700"
          >
            <Upload className="w-4 h-4" />
            Upload Bill
          </button>

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-slate-900 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Gross Revenue (Total)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">
              €{clientData?.summary?.gross_revenue?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Cash: €{clientData?.summary?.cash_sales?.toFixed(2) || '0.00'} • Card: €{clientData?.summary?.card_sales?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>VAT 19% (Beverages/Standard)</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">
              €{clientData?.summary?.total_vat_19?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-[10px] text-blue-400/80 mt-1">Standard rate items</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>VAT 7% (Food / Reduced)</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white">
              €{clientData?.summary?.total_vat_7?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-[10px] text-purple-400/80 mt-1">Reduced food rate</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Recorded Z-Bons & Receipts</span>
              <Receipt className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white">
              {clientData?.summary?.z_bon_count || 0} Closings
            </p>
            <p className="text-[10px] text-amber-400/80 mt-1">
              {clientData?.summary?.expense_receipts_count || 0} Scanned Expenses
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { key: 'cash-book', label: 'TSE Cash Book (Z-Bons)', icon: Calculator },
            { key: 'expenses', label: 'Scanned Expense Receipts', icon: Receipt },
            { key: 'sick-notes', label: 'Sick Notes (AU Certificates)', icon: HeartPulse },
            { key: 'payslips', label: 'Digital Payroll & Payslips', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading financial records...</div>
        ) : (
          <div>
            {activeTab === 'cash-book' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Opening Float</th>
                      <th className="p-4">Cash Sales</th>
                      <th className="p-4">Card Sales</th>
                      <th className="p-4">Counted Cash</th>
                      <th className="p-4">Total Sales</th>
                      <th className="p-4">VAT 7%</th>
                      <th className="p-4">VAT 19%</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {clientData?.daily_cashes?.length > 0 ? (
                      clientData.daily_cashes.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-white">{row.date}</td>
                          <td className="p-4">€{parseFloat(row.opening_float).toFixed(2)}</td>
                          <td className="p-4 font-medium text-emerald-400">€{parseFloat(row.cash_sales).toFixed(2)}</td>
                          <td className="p-4 font-medium text-blue-400">€{parseFloat(row.card_sales).toFixed(2)}</td>
                          <td className="p-4">€{parseFloat(row.counted_cash).toFixed(2)}</td>
                          <td className="p-4 font-black text-white">€{parseFloat(row.total_sales).toFixed(2)}</td>
                          <td className="p-4 text-purple-400">€{parseFloat(row.vat_7_amount).toFixed(2)}</td>
                          <td className="p-4 text-blue-400">€{parseFloat(row.vat_19_amount).toFixed(2)}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {row.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="p-8 text-center text-slate-500">
                          No Daily Z-Bon closings recorded for this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Receipt Image</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {clientData?.expenses?.length > 0 ? (
                      clientData.expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-white">{exp.expense_date}</td>
                          <td className="p-4">{exp.description}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                              {exp.category}
                            </span>
                          </td>
                          <td className="p-4 font-black text-rose-400">€{parseFloat(exp.amount).toFixed(2)}</td>
                          <td className="p-4">
                            {exp.receipt_url ? (
                              <a
                                href={exp.receipt_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <FileText className="w-3.5 h-3.5" /> View Receipt
                              </a>
                            ) : (
                              <span className="text-slate-600">No file</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500">
                          No expense receipts scanned this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'sick-notes' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Period</th>
                      <th className="p-4">Notes</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">AU Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {clientData?.sick_notes?.length > 0 ? (
                      clientData.sick_notes.map((sn) => (
                        <tr key={sn.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-white">{sn.staff_profile?.name || 'Staff Member'}</td>
                          <td className="p-4">{sn.start_date} – {sn.end_date}</td>
                          <td className="p-4 text-slate-400">{sn.diagnosis_notes || '—'}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {sn.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4">
                            {sn.certificate_file_url ? (
                              <a href={sn.certificate_file_url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                                View AU PDF/Image
                              </a>
                            ) : (
                              <span className="text-slate-600">Pending upload</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500">
                          No sick notes recorded for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'payslips' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Month</th>
                      <th className="p-4">Gross Salary</th>
                      <th className="p-4">Net Payout</th>
                      <th className="p-4">Hours</th>
                      <th className="p-4">Signature Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {clientData?.payslips?.length > 0 ? (
                      clientData.payslips.map((ps) => (
                        <tr key={ps.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-white">{ps.staff_profile?.name || 'Staff Member'}</td>
                          <td className="p-4">{ps.period_month}</td>
                          <td className="p-4">€{parseFloat(ps.gross_amount).toFixed(2)}</td>
                          <td className="p-4 font-black text-emerald-400">€{parseFloat(ps.net_amount).toFixed(2)}</td>
                          <td className="p-4">{ps.hours_worked} hrs</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ps.status === 'signed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {ps.status === 'signed' ? 'DIGITALLY SIGNED' : 'PENDING SIGNATURE'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500">
                          No payslips recorded for this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Advisor Bill Upload Modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Upload Tax Advisor Fee Invoice</h3>
            <p className="text-xs text-slate-400">Add your consulting fee directly into the client's accounting ledger.</p>

            <form onSubmit={handleUploadBill} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  placeholder="STB-2026-0901"
                  value={billForm.invoice_number}
                  onChange={(e) => setBillForm({ ...billForm, invoice_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Fee Amount (€)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="450.00"
                  value={billForm.amount}
                  onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Invoice Date</label>
                <input
                  type="date"
                  required
                  value={billForm.bill_date}
                  onChange={(e) => setBillForm({ ...billForm, bill_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Notes / Description</label>
                <textarea
                  rows="2"
                  placeholder="Monthly payroll processing & TSE Cash Book audit"
                  value={billForm.notes}
                  onChange={(e) => setBillForm({ ...billForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Submit Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

