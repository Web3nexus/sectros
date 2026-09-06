import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle2, Play, Square, Coffee, HeartPulse,
  Calendar, FileText, DollarSign, User, Lock, Upload,
  Check, X, AlertCircle, Sparkles, LogOut, ChevronRight, PenTool
} from 'lucide-react';
import axios from 'axios';

export default function EmployeePortal() {
  const [pin, setPin] = useState('');
  const [staff, setStaff] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('clock'); // clock, shifts, sick_notes, vacation, payslips, tips

  // Clock in timer state
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Sick note modal
  const [showSickModal, setShowSickModal] = useState(false);
  const [sickForm, setSickForm] = useState({ start_date: '', end_date: '', diagnosis_notes: '' });
  const [sickFile, setSickFile] = useState(null);

  // Vacation modal
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [vacationForm, setVacationForm] = useState({ start_date: '', end_date: '', reason: '' });

  // Payslip signature canvas modal
  const [signingPayslip, setSigningPayslip] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isClockedIn && activeSession?.clock_in) {
      const startTime = new Date(activeSession.clock_in).getTime();
      interval = setInterval(() => {
        const now = new Date().getTime();
        setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isClockedIn, activeSession]);

  const handlePinSubmit = async (enteredPin) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/tenant-api/employee-portal/pin-verify', { pin: enteredPin });
      setStaff(res.data.staff);
      setIsClockedIn(res.data.is_clocked_in);
      setActiveSession(res.data.active_session);
      fetchDashboard(res.data.staff.id);
    } catch (err) {
      setError('Invalid PIN code. Try default staff PIN.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const next = pin + num;
      setPin(next);
      if (next.length === 4) {
        handlePinSubmit(next);
      }
    }
  };

  const fetchDashboard = async (staffId) => {
    try {
      const res = await axios.get(`/tenant-api/employee-portal/dashboard?staff_profile_id=${staffId}`);
      setDashboardData(res.data);
      setIsClockedIn(res.data.is_clocked_in);
      setActiveSession(res.data.active_attendance);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    }
  };

  const handlePunchClock = async (action) => {
    if (!staff) return;
    try {
      const res = await axios.post('/tenant-api/employee-portal/punch-clock', {
        staff_profile_id: staff.id,
        action,
      });
      alert(res.data.message);
      fetchDashboard(staff.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Punch clock action failed.');
    }
  };

  const formatTimer = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSickSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('staff_profile_id', staff.id);
    formData.append('start_date', sickForm.start_date);
    formData.append('end_date', sickForm.end_date);
    if (sickForm.diagnosis_notes) formData.append('diagnosis_notes', sickForm.diagnosis_notes);
    if (sickFile) formData.append('certificate', sickFile);

    try {
      await axios.post('/tenant-api/employee-portal/sick-notes', formData);
      alert('Sick note submitted successfully for manager and tax advisor review.');
      setShowSickModal(false);
      fetchDashboard(staff.id);
    } catch (err) {
      alert('Failed to submit sick note.');
    }
  };

  const handleVacationSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tenant-api/employee-portal/vacation', {
        staff_profile_id: staff.id,
        ...vacationForm,
      });
      alert('Vacation request submitted for manager approval.');
      setShowVacationModal(false);
      fetchDashboard(staff.id);
    } catch (err) {
      alert('Failed to submit vacation request.');
    }
  };

  // Canvas signature helpers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleConfirmSignature = async () => {
    if (!canvasRef.current || !signingPayslip) return;
    const signatureData = canvasRef.current.toDataURL('image/png');
    try {
      await axios.post(`/tenant-api/employee-portal/payslips/${signingPayslip.id}/sign`, {
        signature_data: signatureData,
      });
      alert('Payslip digitally signed!');
      setSigningPayslip(null);
      fetchDashboard(staff.id);
    } catch (err) {
      alert('Failed to sign payslip.');
    }
  };

  // 1. PIN Pad Authentication View
  if (!staff) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-xs w-full flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Clock className="w-8 h-8 text-blue-400" />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight">Staff Time Clock</h1>
            <p className="text-xs text-slate-400 mt-1">Enter your 4-digit employee PIN code</p>
          </div>

          <div className="flex items-center gap-4 py-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  pin.length > i
                    ? 'bg-blue-500 scale-110 shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            ))}
          </div>

          {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

          <div className="grid grid-cols-3 gap-3 w-full pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xl font-bold transition-all active:scale-95 shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setPin('')}
              className="h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/50 text-xs font-bold text-slate-400"
            >
              CLEAR
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xl font-bold transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              onClick={() => setPin(prev => prev.slice(0, -1))}
              className="h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/50 text-xs font-bold text-slate-400"
            >
              DEL
            </button>
          </div>

          <button
            onClick={() => handlePinSubmit('1234')}
            className="text-[11px] text-blue-400 hover:underline pt-4"
          >
            Quick Demo Login (PIN 1234)
          </button>
        </div>
      </div>
    );
  }

  // 2. Authenticated Staff Portal
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
            {staff.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="font-bold text-white text-base leading-tight">{staff.name}</h2>
            <p className="text-[11px] text-slate-400 capitalize">{staff.role || 'Service Staff'} • Sectros Staff</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isClockedIn ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            {isClockedIn ? 'CLOCKED IN' : 'OFF SHIFT'}
          </span>

          <button
            onClick={() => { setStaff(null); setPin(''); }}
            className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-slate-900 transition-colors"
            title="Lock / Switch PIN"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Nav Tabs */}
      <div className="bg-slate-900/40 border-b border-slate-800 px-6 flex items-center gap-2 overflow-x-auto">
        {[
          { key: 'clock', label: 'Time Clock', icon: Clock },
          { key: 'shifts', label: 'Upcoming Shifts', icon: Calendar },
          { key: 'sick_notes', label: 'Sick Notes', icon: HeartPulse },
          { key: 'vacation', label: 'Vacation Requests', icon: Calendar },
          { key: 'payslips', label: 'Payslips & Sign', icon: FileText },
          { key: 'tips', label: 'Tip Tracker', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Tab 1: Live Punch Clock */}
        {activeTab === 'clock' && (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-sm text-center space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Shift Elapsed Time</span>
              <div className="text-5xl md:text-6xl font-black font-mono tracking-wider text-white">
                {formatTimer(elapsedSeconds)}
              </div>
              <p className="text-xs text-slate-500">
                {isClockedIn ? `Clocked in since ${new Date(activeSession?.clock_in).toLocaleTimeString()}` : 'Not clocked in right now'}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              {!isClockedIn ? (
                <button
                  onClick={() => handlePunchClock('clock_in')}
                  className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center gap-3 shadow-xl shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Play className="w-5 h-5 fill-white" />
                  CLOCK IN NOW
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handlePunchClock('clock_out')}
                    className="px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center gap-3 shadow-xl shadow-rose-600/30 transition-all active:scale-95"
                  >
                    <Square className="w-5 h-5 fill-white" />
                    CLOCK OUT / END SHIFT
                  </button>
                  <button
                    onClick={() => alert('Break timer logged.')}
                    className="px-5 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
                  >
                    <Coffee className="w-4 h-4 text-amber-400" />
                    Pause / Break
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Upcoming Shifts */}
        {activeTab === 'shifts' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Upcoming Scheduled Shifts
            </h3>
            <div className="divide-y divide-slate-800/80">
              {dashboardData?.upcoming_shifts?.length > 0 ? (
                dashboardData.upcoming_shifts.map((shift) => (
                  <div key={shift.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{shift.date}</p>
                      <p className="text-xs text-slate-400">{shift.start_time} – {shift.end_time} • {shift.role || 'Service'}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Confirmed
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center">No shifts scheduled for the next 7 days.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Sick Notes */}
        {activeTab === 'sick_notes' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-400" /> Sick Note Submissions
              </h3>
              <button
                onClick={() => setShowSickModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
              >
                + Submit AU Sick Note
              </button>
            </div>

            <div className="divide-y divide-slate-800/80">
              {dashboardData?.sick_notes?.length > 0 ? (
                dashboardData.sick_notes.map((sn) => (
                  <div key={sn.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{sn.start_date} – {sn.end_date}</p>
                      <p className="text-xs text-slate-400">{sn.diagnosis_notes || 'Doctor AU Certificate'}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {sn.status.toUpperCase()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center">No sick notes on record.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Vacation Requests */}
        {activeTab === 'vacation' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> Vacation & Leave Requests
              </h3>
              <button
                onClick={() => setShowVacationModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
              >
                + Request Vacation
              </button>
            </div>
            <p className="text-xs text-slate-400">Submit planned leaves for general manager review.</p>
          </div>
        )}

        {/* Tab 5: Payslips & Digital Signature */}
        {activeTab === 'payslips' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" /> Monthly Payslips (Lohnabrechnungen)
            </h3>
            <div className="divide-y divide-slate-800/80">
              {dashboardData?.payslips?.length > 0 ? (
                dashboardData.payslips.map((ps) => (
                  <div key={ps.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">Period: {ps.period_month}</p>
                      <p className="text-xs text-slate-400">
                        Net: <span className="text-emerald-400 font-bold">€{parseFloat(ps.net_amount).toFixed(2)}</span> • Gross: €{parseFloat(ps.gross_amount).toFixed(2)} ({ps.hours_worked} hrs)
                      </p>
                    </div>

                    <div>
                      {ps.status === 'signed' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" /> Signed
                        </span>
                      ) : (
                        <button
                          onClick={() => setSigningPayslip(ps)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all"
                        >
                          <PenTool className="w-3.5 h-3.5" /> Sign Payslip
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center">No payslips available for download yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Tip Tracker */}
        {activeTab === 'tips' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" /> Daily Tip Earnings (Trinkgeld)
              </h3>
              <span className="text-lg font-black text-emerald-400">
                Total: €{dashboardData?.summary?.total_tips_this_month || '0.00'}
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {dashboardData?.tips?.length > 0 ? (
                dashboardData.tips.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{t.date}</p>
                      <p className="text-xs text-slate-400">Method: {t.payout_method?.toUpperCase()}</p>
                    </div>
                    <span className="font-black text-emerald-400 text-sm">
                      +€{parseFloat(t.amount).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center">No tip payouts recorded this month.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Sick Note Modal */}
      {showSickModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-400" /> Submit Sick Note
            </h3>
            <form onSubmit={handleSickSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={sickForm.start_date}
                    onChange={(e) => setSickForm({ ...sickForm, start_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={sickForm.end_date}
                    onChange={(e) => setSickForm({ ...sickForm, end_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Doctor's Certificate (AU Foto / PDF)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setSickFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Optional Notes</label>
                <textarea
                  rows="2"
                  placeholder="Doctor's note / estimated return date"
                  value={sickForm.diagnosis_notes}
                  onChange={(e) => setSickForm({ ...sickForm, diagnosis_notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSickModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white">
                  Submit to Manager & Tax Advisor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vacation Modal */}
      {showVacationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" /> Request Vacation Leave
            </h3>
            <form onSubmit={handleVacationSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={vacationForm.start_date}
                    onChange={(e) => setVacationForm({ ...vacationForm, start_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={vacationForm.end_date}
                    onChange={(e) => setVacationForm({ ...vacationForm, end_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Reason / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Annual holiday leave"
                  value={vacationForm.reason}
                  onChange={(e) => setVacationForm({ ...vacationForm, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowVacationModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Signature Canvas Modal (PayslipSigner) */}
      {signingPayslip && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PenTool className="w-5 h-5 text-purple-400" /> Digital Signature — Payslip {signingPayslip.period_month}
            </h3>
            <p className="text-xs text-slate-400">
              Please sign on the canvas below to confirm receipt and acknowledge the net salary of €{parseFloat(signingPayslip.net_amount).toFixed(2)}.
            </p>

            <div className="border border-slate-700 bg-slate-950 rounded-2xl overflow-hidden touch-none relative">
              <canvas
                ref={canvasRef}
                width={440}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full cursor-crosshair"
              />
              <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 pointer-events-none">
                Sign with finger or mouse
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear Signature
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSigningPayslip(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSignature}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
                >
                  Save & Confirm Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

