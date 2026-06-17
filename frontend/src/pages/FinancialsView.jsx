import React, { useState, useEffect } from 'react'
import {TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Coffee, UtilityPole, Home, Briefcase, Scan, Loader2, Wallet, History, Download, Calendar, ChevronLeft, ChevronRight, Banknote} from 'lucide-react'
import { AIScanner } from './AIScanner'
import api from '../services/api'

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
]

const CAT_COLORS = {
  Supplies: 'bg-emerald-500',
  Utilities: 'bg-amber-500',
  Rent: 'bg-red-500',
  Payroll: 'bg-blue-500',
  Marketing: 'bg-purple-500',
  Maintenance: 'bg-orange-500',
  Insurance: 'bg-teal-500',
  Other: 'bg-slate-400',
}

export function FinancialsView() {
  const [showScanner, setShowScanner] = useState(false)
  const [period, setPeriod] = useState('all')
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [transactionsMeta, setTransactionsMeta] = useState(null)
  const [revenueTrend, setRevenueTrend] = useState(null)
  const [settlements, setSettlements] = useState([])
  const [txPage, setTxPage] = useState(1)
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    fetchAll()
  }, [period, txPage])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [overviewRes, txRes, trendRes, settleRes, expensesRes] = await Promise.all([
        api.get(`finance/overview?period=${period}`),
        api.get(`finance/transactions?period=${period}&page=${txPage}`),
        api.get('finance/revenue-trend?days=30'),
        api.get(`finance/settlements?per_page=20&period=${period}`),
        api.get('expenses'),
      ])
      setOverview(overviewRes.data)
      setTransactions(txRes.data.data || [])
      setTransactionsMeta(txRes.data.meta || null)
      setRevenueTrend(trendRes.data)
      setSettlements(settleRes.data || [])
      setExpenses(expensesRes.data || [])
    } catch (err) {
      console.error('Finance data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async (type) => {
    try {
      const response = await api.get(`/finance/export?type=${type}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${type}_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    }
  }

  const getIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'rent': return Home
      case 'utilities': return UtilityPole
      case 'supplies': return Coffee
      case 'payroll': return Briefcase
      default: return DollarSign
    }
  }

  const formatCurrency = (val) => {
    const n = parseFloat(val || 0)
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (loading && !overview) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20">
         <Loader2 size={48} className="animate-spin mb-4 text-primary" />
         <p className="font-bold uppercase tracking-widest text-xs">Loading Financial Dashboard...</p>
      </div>
    )
  }

  const maxRevenue = revenueTrend?.trend?.length
    ? Math.max(...revenueTrend.trend.map(d => d.revenue), 1)
    : 1

  const currentBalance = overview?.balance ?? 0
  const totalRevenue = overview?.total_revenue ?? 0
  const totalExpenses = overview?.total_expenses ?? 0
  const netProfit = overview?.net_profit ?? 0
  const profitMargin = overview?.profit_margin ?? 0
  const aov = overview?.aov ?? 0
  const orderCount = overview?.order_count ?? 0

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {showScanner && (
        <AIScanner
          onClose={() => setShowScanner(false)}
          onUploadSuccess={() => {
            fetchAll()
            setShowScanner(false)
          }}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Dashboard</h2>
          <p className="text-muted-foreground text-sm">Balance, revenue, and expense tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => { setPeriod(p.key); setTxPage(1) }}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                period === p.key
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-border text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-700 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Wallet size={22} />
            </div>
            <span className="text-emerald-200 text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-full">
              Current Balance
            </span>
          </div>
          <div className="text-3xl font-black tracking-tighter">${formatCurrency(currentBalance)}</div>
          {overview?.latest_settlement && (
            <div className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider mt-2">
              As of {new Date(overview.latest_settlement.date).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp size={22} />
            </div>
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-full">
              {period === 'all' ? 'Lifetime' : period.charAt(0).toUpperCase() + period.slice(1)}
            </span>
          </div>
          <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Total Revenue</div>
          <div className="text-3xl font-black text-foreground tracking-tighter">${formatCurrency(totalRevenue)}</div>
          <div className="text-[10px] text-muted-foreground font-bold mt-1">{orderCount} orders · ${formatCurrency(aov)} avg</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={22} />
            </div>
            <span className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 px-2 py-1 rounded-full">
              Actual Costs
            </span>
          </div>
          <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Total Expenses</div>
          <div className="text-3xl font-black text-foreground tracking-tighter">${formatCurrency(totalExpenses)}</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-blue-100 shadow-md shadow-blue-500/5 relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-blue-500/20">
              <DollarSign size={22} />
            </div>
            <span className={`text-[10px] font-black flex items-center gap-1 px-2 py-1 rounded-full uppercase ${
              profitMargin >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {profitMargin >= 0 ? '+' : ''}{profitMargin}% Margin
            </span>
          </div>
          <div className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">Net Profit</div>
          <div className="text-3xl font-black text-foreground tracking-tighter">${formatCurrency(netProfit)}</div>
        </div>
      </div>

      {/* Revenue Trend + Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between bg-slate-50/30">
            <div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Revenue Trend</h3>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Last 30 days</p>
            </div>
            {revenueTrend && (
              <div className="text-right">
                <div className="text-lg font-black text-emerald-600">${formatCurrency(revenueTrend.avg_daily_revenue)}</div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Avg Daily</div>
              </div>
            )}
          </div>
          <div className="p-5">
            {revenueTrend?.trend?.length ? (
              <div className="flex items-end gap-[3px] h-40">
                {revenueTrend.trend.map((day, i) => {
                  const pct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                  const isToday = day.date === new Date().toISOString().slice(0, 10)
                  return (
                    <div
                      key={day.date}
                      className={`flex-1 rounded-t transition-all duration-200 hover:opacity-80 relative group cursor-pointer ${
                        isToday ? 'bg-blue-500' : day.revenue > 0 ? 'bg-emerald-400' : 'bg-slate-100'
                      }`}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                        ${formatCurrency(day.revenue)} · {day.orders} orders
                        <div className="text-center text-[8px] text-slate-400 mt-0.5">{day.date}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm italic">
                No revenue data for this period.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
          <h3 className="font-black text-slate-800 mb-5 uppercase tracking-tight">Expense Breakdown</h3>
          <div className="space-y-4">
            {Array.isArray(overview?.category_breakdown) && overview.category_breakdown.length > 0 ? overview.category_breakdown.map(item => {
              const pct = totalExpenses > 0 ? Math.round((parseFloat(item.total) / totalExpenses) * 100) : 0
              const color = CAT_COLORS[item.category] || CAT_COLORS.Other
              return (
                <div key={item.category} className="space-y-1.5 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="text-foreground">${formatCurrency(item.total)} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`${color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              )
            }) : (
              <p className="text-sm text-muted-foreground text-center py-10">No expenses recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <History size={18} className="text-muted-foreground" />
            <h3 className="font-black text-slate-800 uppercase tracking-tight">Transaction History</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV('transactions')}
              className="text-primary font-bold hover:underline text-xs uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-muted-foreground font-black uppercase text-[10px] tracking-widest border-b border-border">
              <tr>
                <th className="px-5 py-3">Transaction</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length > 0 ? transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{tx.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground font-bold text-xs">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 text-right font-black ${
                    tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      tx.status === 'paid' || tx.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center text-muted-foreground italic">
                    No transactions found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {transactionsMeta && transactionsMeta.last_page > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-slate-50/30">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Page {transactionsMeta.current_page} of {transactionsMeta.last_page}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTxPage(p => Math.max(1, p - 1))}
                disabled={txPage <= 1}
                className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setTxPage(p => p + 1)}
                disabled={txPage >= transactionsMeta.last_page}
                className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Settlements */}
      {settlements.length > 0 && (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <Banknote size={18} className="text-muted-foreground" />
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Daily Settlements</h3>
            </div>
            <button
              onClick={() => exportCSV('settlements')}
              className="text-primary font-bold hover:underline text-xs uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-muted-foreground font-black uppercase text-[10px] tracking-widest border-b border-border">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Opening</th>
                  <th className="px-5 py-3 text-right">Cash</th>
                  <th className="px-5 py-3 text-right">Card</th>
                  <th className="px-5 py-3 text-right">Tips</th>
                  <th className="px-5 py-3 text-right">Expenses</th>
                  <th className="px-5 py-3 text-right">Closing</th>
                  <th className="px-5 py-3 text-right">Net</th>
                  <th className="px-5 py-3">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-5 py-3 font-bold text-slate-800">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-700">${formatCurrency(s.opening_balance)}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-700">${formatCurrency(s.cash_collected)}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-700">${formatCurrency(s.card_collected)}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-700">${formatCurrency(s.tips_collected)}</td>
                    <td className="px-5 py-3 text-right font-medium text-red-600">-${formatCurrency(s.expenses_total)}</td>
                    <td className="px-5 py-3 text-right font-black text-slate-900">${formatCurrency(s.closing_balance)}</td>
                    <td className={`px-5 py-3 text-right font-black ${s.net_total >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${formatCurrency(s.net_total)}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{s.staff?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => setShowScanner(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
        >
          <Scan size={18} />
          AI Add Expense
        </button>
      </div>
    </div>
  )
}
