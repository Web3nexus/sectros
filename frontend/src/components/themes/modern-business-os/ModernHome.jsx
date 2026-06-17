import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {Calendar, Users, Layout, BarChart3, Bell, Clock, CreditCard, MessageSquare, Settings, Briefcase, ArrowRight, Check, Phone, Mail, Globe, Shield, Zap, TrendingUp, PieChart, Download, Menu, X, ChevronDown, ChevronRight, Plus, Minus, BookOpen, Smartphone, Monitor, Building2, Coffee, UtensilsCrossed, Hotel, PartyPopper, Music, HeartHandshake, Target, BrainCircuit, Award, Quote} from 'lucide-react';
import { useCmsContent } from '../../../hooks/useCmsContent';
import centralApi from '../../../services/centralApi';
import { mapFeaturesToList, getDefaultFeatures, defaultPlans } from '../../../utils/planFeatures';

const Typewriter = ({ texts }) => {
  const [index, setIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!texts || texts.length === 0) return;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < texts[index].length) {
          setCurrentText(texts[index].substring(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(texts[index].substring(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setIndex((index + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, index, texts]);

  return <span className="text-blue-600">{currentText}<span className="animate-pulse">|</span></span>;
};

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, staggerChildren: 0.1 },
};

function HeroDashboard() {
  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      <div className="flex h-[520px] md:h-[580px]">
        <div className="hidden sm:flex flex-col w-52 bg-slate-900 text-slate-300 p-4 gap-1 shrink-0">
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-sm">Sectros</span>
          </div>
          {[
            { icon: Layout, label: 'Dashboard', active: true },
            { icon: Calendar, label: 'Bookings' },
            { icon: Users, label: 'Guests' },
            { icon: Building2, label: 'Floor Plan' },
            { icon: BarChart3, label: 'Reports' },
            { icon: MessageSquare, label: 'Messages' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? 'bg-blue-600/20 text-blue-300 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input type="text" placeholder="Search bookings, guests..." className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-600 placeholder-slate-400 focus:outline-none" readOnly />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400" />
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">JD</div>
            </div>
          </div>
          <div className="flex-1 p-5 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Today's Bookings", value: '24', change: '+12%', color: 'blue' },
                { label: 'Revenue', value: '$12,480', change: '+8.3%', color: 'green' },
                { label: 'Active Guests', value: '158', change: '+5.2%', color: 'purple' },
                { label: 'Occupancy', value: '78%', change: '+3.1%', color: 'amber' },
              ].map(({ label, value, change, color }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">{label}</div>
                  <div className="text-xl font-bold text-slate-900">{value}</div>
                  <div className={`text-xs font-medium mt-1 ${
                    color === 'blue' ? 'text-blue-600' :
                    color === 'green' ? 'text-green-600' :
                    color === 'purple' ? 'text-purple-600' : 'text-amber-600'
                  }`}>{change}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-800">Recent Reservations</h4>
                  <span className="text-xs text-blue-600 font-medium">View all</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Sarah Johnson', guests: 4, time: '7:00 PM', table: 'Table 12', status: 'confirmed' },
                    { name: 'Michael Chen', guests: 2, time: '7:30 PM', table: 'Table 5', status: 'seated' },
                    { name: 'Emma Williams', guests: 6, time: '8:00 PM', table: 'Table 8', status: 'confirmed' },
                    { name: 'James Rodriguez', guests: 3, time: '8:30 PM', table: 'Table 3', status: 'waiting' },
                  ].map(({ name, guests, time, table, status }) => (
                    <div key={name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{name}</div>
                          <div className="text-xs text-slate-400">{guests} guests · {table}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{time}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                          status === 'seated' ? 'bg-green-50 text-green-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>{status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-800">Floor Status</h4>
                  <span className="text-xs text-blue-600 font-medium">Manage</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { table: 'T1', status: 'available' },
                    { table: 'T2', status: 'available' },
                    { table: 'T3', status: 'occupied' },
                    { table: 'T4', status: 'available' },
                    { table: 'T5', status: 'reserved' },
                    { table: 'T6', status: 'occupied' },
                    { table: 'T7', status: 'available' },
                    { table: 'T8', status: 'occupied' },
                    { table: 'T9', status: 'reserved' },
                  ].map(({ table, status }) => (
                    <div key={table} className={`rounded-lg p-2 text-center border ${
                      status === 'available' ? 'bg-green-50 border-green-100' :
                      status === 'occupied' ? 'bg-amber-50 border-amber-100' :
                      'bg-blue-50 border-blue-100'
                    }`}>
                      <div className="text-xs font-semibold text-slate-700">{table}</div>
                      <div className={`text-[10px] font-medium ${
                        status === 'available' ? 'text-green-600' :
                        status === 'occupied' ? 'text-amber-600' : 'text-blue-600'
                      }`}>{status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductShowcaseMockup() {
  return (
    <div className="w-full bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
      <div className="flex items-center gap-2 px-5 py-3 bg-slate-800 border-b border-slate-700">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="text-xs text-slate-500 ml-2">sectros.com/dashboard</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-300">Booking Calendar</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['M','T','W','T','F','S','S'].map(d => (
                <div key={d} className="text-[10px] text-center text-slate-500 font-medium py-1">{d}</div>
              ))}
              {Array.from({ length: 28 }, (_, i) => (
                <div key={i} className={`text-xs text-center py-1.5 rounded ${
                  i === 12 ? 'bg-blue-600 text-white font-medium' :
                  i === 13 || i === 14 ? 'bg-blue-900/50 text-blue-300' :
                  'text-slate-400'
                }`}>{i + 1}</div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Revenue Overview</span>
            </div>
            <div className="flex items-end gap-1.5 h-24">
              {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 92, 78, 82].map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-500/30 rounded-t" style={{ height: `${h}%` }}>
                  <div className="w-full bg-emerald-400 rounded-t h-full opacity-70" style={{ height: `${h * 0.7}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">Guest List</span>
              </div>
              <span className="text-[10px] text-blue-400">View all</span>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-700 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-600" />
                    <div>
                      <div className="text-xs text-slate-200 font-medium">Guest Name {i}</div>
                      <div className="text-[10px] text-slate-500">+1 (555) 000-{String(1000 + i).slice(1)}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400">Table {i + 5}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">Notifications</span>
            </div>
            <div className="space-y-2">
              <div className="bg-slate-700/50 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-300 font-medium">New booking</div>
                <div className="text-[10px] text-slate-500">Table 8 · 4 guests</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-300 font-medium">Cancellation</div>
                <div className="text-[10px] text-slate-500">Table 3 · 2 guests</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-300 font-medium">Waitlist</div>
                <div className="text-[10px] text-slate-500">2 parties waiting</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingSiteMockup() {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-blue-600 p-3">
        <div className="text-white font-bold text-sm">The Riverside Bistro</div>
        <div className="text-blue-100 text-[10px]">Book a table · reservations@riverside.com</div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="text-[10px] text-slate-500 font-medium mb-1">Date</div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">Jun 15, 2026</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-slate-500 font-medium mb-1">Time</div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">7:00 PM</div>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-medium mb-1">Party Size</div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">4 Guests</div>
        </div>
        <button className="w-full bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-lg">Find a Table</button>
        <div className="flex items-center gap-1 justify-center text-[10px] text-slate-400">
          <Shield className="w-3 h-3" /> No credit card required
        </div>
      </div>
    </div>
  );
}

function ReservationTableMockup() {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">Reservations</span>
        <span className="text-[10px] text-blue-600">+ New</span>
      </div>
      <div className="divide-y divide-slate-50">
        {[
          { name: 'A. Patel', time: '6:30', guests: 2, status: 'Confirmed' },
          { name: 'L. Kim', time: '7:00', guests: 4, status: 'Seated' },
          { name: 'R. Diaz', time: '7:30', guests: 3, status: 'Confirmed' },
        ].map(({ name, time, guests, status }) => (
          <div key={name} className="flex items-center justify-between px-3 py-2">
            <div>
              <div className="text-xs font-medium text-slate-700">{name}</div>
              <div className="text-[10px] text-slate-400">{time} · {guests} guests</div>
            </div>
            <span className="text-[10px] font-medium text-blue-600">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloorPlanMiniMockup() {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 p-3">
      <div className="text-xs font-semibold text-slate-700 mb-2">Floor Plan</div>
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-green-100 border border-green-200 rounded h-8" />
        <div className="bg-green-100 border border-green-200 rounded h-8" />
        <div className="bg-amber-100 border border-amber-200 rounded h-8" />
        <div className="bg-green-100 border border-green-200 rounded h-8" />
        <div className="bg-blue-100 border border-blue-200 rounded h-8" />
        <div className="bg-amber-100 border border-amber-200 rounded h-8" />
        <div className="bg-green-100 border border-green-200 rounded h-8" />
        <div className="bg-green-100 border border-green-200 rounded h-8" />
        <div className="bg-blue-100 border border-blue-200 rounded h-8" />
      </div>
      <div className="flex gap-3 mt-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-100 border border-green-200" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-100 border border-amber-200" /> Occupied</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-100 border border-blue-200" /> Reserved</span>
      </div>
    </div>
  );
}

function GuestProfileMockup() {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-white/30 mx-auto mb-2 flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div className="text-white font-semibold text-sm">Sarah Johnson</div>
        <div className="text-white/70 text-[10px]">14 visits · VIP</div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <Mail className="w-3 h-3" /> sarah@email.com
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <Phone className="w-3 h-3" /> +1 (555) 234-5678
        </div>
        <div className="border-t border-slate-100 pt-2 mt-2">
          <div className="text-[10px] text-slate-400 font-medium mb-1">Preferences</div>
          <div className="flex gap-1 flex-wrap">
            <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">Window seat</span>
            <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">No nuts</span>
            <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">Anniversary</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationFlowMockup() {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-center gap-0">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Booking</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Confirm</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Remind</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Follow-up</span>
        </div>
      </div>
      <div className="mt-3 bg-slate-50 rounded-lg p-2">
        <div className="text-[10px] text-slate-500">Next auto-reminder in 2 hours</div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }} />
        </div>
      </div>
    </div>
  );
}

function AnalyticsChartMockup() {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-700">Revenue Analytics</span>
        <select className="text-[10px] border border-slate-200 rounded px-2 py-1 text-slate-500 bg-white" defaultValue="week">
          <option value="week">This Week</option>
        </select>
      </div>
      <div className="flex items-end gap-1.5 h-20 mb-2">
        {[30, 45, 38, 65, 55, 78, 62].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-blue-500 rounded-t" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div>
          <div className="text-[10px] text-slate-400">Total Revenue</div>
          <div className="text-base font-bold text-slate-900">$18,430</div>
        </div>
        <div className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-1 rounded">+12.5%</div>
      </div>
    </div>
  );
}

function PhoneMockup({ children, label }) {
  return (
    <div className="relative">
      <div className="w-[180px] md:w-[200px] h-[360px] md:h-[400px] bg-slate-900 rounded-[28px] border-2 border-slate-700 p-2 shadow-xl mx-auto">
        <div className="w-full h-full bg-white rounded-[22px] overflow-hidden flex flex-col">
          <div className="bg-slate-50 px-3 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <div className="w-16 h-4 bg-slate-200 rounded-full" />
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-hidden">{children}</div>
        </div>
      </div>
      {label && (
        <div className="text-center mt-2 text-xs text-slate-500 font-medium">{label}</div>
      )}
    </div>
  );
}

function IntegrationIcon({ color, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 ${color}`}>
        <div className="w-5 h-5 rounded-full bg-current opacity-30" />
      </div>
      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{label}</span>
    </div>
  );
}

function PartnerLogo({ name }) {
  return (
    <div className="flex items-center justify-center px-6 py-3 opacity-30 grayscale hover:opacity-50 transition-opacity">
      <span className="text-lg font-bold text-slate-500 tracking-wider uppercase">{name}</span>
    </div>
  );
}

const faqItems = [
  {
    q: 'What types of businesses can use Sectros?',
    a: 'Sectros is designed for restaurants, bars, lounges, nightclubs, hotels, event venues, and multi-location hospitality groups of all sizes. Our platform adapts to your specific operations.',
  },
  {
    q: 'Do you support both reservations and floor plan management?',
    a: 'Yes. Sectros combines online reservations, walk-in management, and interactive floor plans in one system. Drag-and-drop tables, see real-time status, and manage your entire venue from a single view.',
  },
  {
    q: 'Can guests book directly from my website?',
    a: 'Absolutely. Sectros provides a customizable booking widget that embeds directly into your existing website. Guests can check availability, select times, and book without ever leaving your site.',
  },
  {
    q: 'How do deposits work?',
    a: 'You can set custom deposit requirements per time slot, party size, or date. Collect credit card deposits at booking time, with automatic refunds for cancellations within your policy window.',
  },
  {
    q: 'Are automated reminders included?',
    a: 'Yes. SMS and email reminders are sent automatically based on your schedule. Guests can confirm, modify, or cancel with one click, reducing no-shows by up to 40%.',
  },
  {
    q: 'Can I manage multiple locations?',
    a: 'Yes. Our multi-location plan gives you a centralized dashboard to manage all venues. Each location maintains its own booking calendar, floor plan, and settings while you get consolidated reports.',
  },
  {
    q: 'What integrations do you offer?',
    a: 'Sectros integrates with Stripe, Square, Google Calendar, Gmail, WhatsApp, Mailchimp, HubSpot, Zapier, Meta, Instagram, Google Analytics, Slack, QuickBooks, and more.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most venues are up and running in under 30 minutes. Import your floor plan, set your hours, configure deposit rules, and embed the booking widget. Our onboarding team guides you through every step.',
  },
  {
    q: 'Is there a mobile app for staff?',
    a: 'Yes. Our staff mobile app is available on iOS and Android. View today\'s reservations, manage table status, communicate with guests, and access guest profiles from anywhere in your venue.',
  },
  {
    q: 'What kind of onboarding support do you provide?',
    a: 'Every paid plan includes personalized onboarding, a dedicated account manager, live chat support, and access to our knowledge base. Professional and Enterprise plans include priority phone support and custom training.',
  },
];



export default function ModernHome() {
  const [openFaq, setOpenFaq] = useState(null);
  const [pricingPlans, setPricingPlans] = useState(null);
  const plansCount = pricingPlans ? pricingPlans.length : 4;
  const { get, getArray } = useCmsContent('home');

  useEffect(() => {
    centralApi.get('saas/plans').then(res => {
      const raw = res.data;
      const arr = Array.isArray(raw) ? raw : (raw?.data || []);
      const active = arr.filter(p => p.is_active);
      if (active.length > 0) {
        setPricingPlans(active.map(p => {
          const mappedFeatures = mapFeaturesToList(p.features);
          return {
            name: p.name,
            price: p.monthly_price === 0 || p.monthly_price === null ? (p.name === 'Enterprise' ? 'Custom' : '$0') : `$${p.monthly_price}`,
            period: p.monthly_price === 0 ? 'forever free' : p.monthly_price === null ? 'contact us' : '/month',
            highlighted: !!p.popular,
            features: mappedFeatures.length > 0 ? mappedFeatures : getDefaultFeatures(p.name),
            desc: p.description || '',
          };
        }));
      }
    }).catch(() => {});
  }, []);
  const featureItems = getArray('featureCluster.items');
  const productCards = getArray('productShowcase.cards');
  const testimonialItems = getArray('testimonials.items');
  const testimonialStats = getArray('testimonials.stats');
  const beyondCards = getArray('beyondBooking.cards');
  const automationBullets = get('automation.bullets', '').split('\n');
  const analyticsBullets = get('analytics.bullets', '').split('\n');
  const mobileAppBullets = get('mobileApp.bullets', '').split('\n');

  return (
    <div className="overflow-hidden">
      {/* ─── 1. HERO ─── */}
      <section className="relative bg-white pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" {...fadeUp}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
              {get('hero.heading')}{' '}
              <Typewriter texts={(get('hero.industries') || 'Modern Hospitality, Fine Dining, Boutique Cafes, Luxury Salons, Bars & Lounges').split(',').map(i => i.trim())} />
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {get('hero.subheading')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/book-a-demo" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg shadow-blue-200">
                {get('hero.cta_primary')} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pricing" className="inline-flex items-center gap-2 border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-7 py-3.5 rounded-xl text-base font-semibold transition-all">
                {get('hero.cta_secondary')}
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-400">{get('hero.tagline')}</p>
          </motion.div>
          <motion.div className="mt-16 max-w-5xl mx-auto" {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}>
            <HeroDashboard />
          </motion.div>
        </div>
      </section>

      {/* ─── 2. TRUSTED BY / LOGO STRIP ─── */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-400 mb-8 font-medium tracking-wider uppercase">{get('trustBar.label')}</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {get('trustBar.brands').split(',').map(name => (
              <div key={name.trim()} className="text-slate-300 text-lg md:text-xl font-bold tracking-tight hover:text-slate-400 transition-colors">
                {name.trim()}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. PRODUCT SHOWCASE ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto mb-14" {...fadeUp}>
            <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase">{get('productShowcase.badge')}</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{get('productShowcase.heading')}</h2>
            <p className="mt-4 text-lg text-slate-500">{get('productShowcase.paragraph')}</p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.15 }}>
            <ProductShowcaseMockup />
          </motion.div>
          <motion.div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" {...stagger}>
            {(() => {
              const icons = [Calendar, Users, Layout, BarChart3];
              return productCards.map((card, idx) => {
                const Icon = icons[idx] || Calendar;
                return (
                  <motion.div key={card.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100" variants={stagger}>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">{card.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
                  </motion.div>
                );
              });
            })()}
          </motion.div>
        </div>
      </section>

      {/* ─── 4. FEATURE CARD CLUSTER ─── */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6" {...fadeUp}>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{featureItems[0]?.heading}</h3>
                <p className="text-sm text-slate-500 mb-4">{featureItems[0]?.description}</p>
                <Link to="/features" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all">Learn more <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
              <div className="w-full md:w-72 shrink-0">
                <BookingSiteMockup />
              </div>
            </motion.div>

            <motion.div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 flex flex-col" {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{featureItems[1]?.heading}</h3>
              <p className="text-sm text-slate-500 mb-4">{featureItems[1]?.description}</p>
              <Link to="/features" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all mt-auto">Learn more <ArrowRight className="w-3.5 h-3.5" /></Link>
              <div className="mt-4">
                <ReservationTableMockup />
              </div>
            </motion.div>

            <motion.div className="bg-green-50 rounded-2xl border border-green-100 p-6 flex flex-col" {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{featureItems[2]?.heading}</h3>
              <p className="text-sm text-slate-500 mb-4">{featureItems[2]?.description}</p>
              <Link to="/features" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all mt-auto">Learn more <ArrowRight className="w-3.5 h-3.5" /></Link>
              <div className="mt-4">
                <FloorPlanMiniMockup />
              </div>
            </motion.div>

            <motion.div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 flex flex-col" {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{featureItems[3]?.heading}</h3>
              <p className="text-sm text-slate-500 mb-4">{featureItems[3]?.description}</p>
              <Link to="/features" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all mt-auto">Learn more <ArrowRight className="w-3.5 h-3.5" /></Link>
              <div className="mt-4">
                <GuestProfileMockup />
              </div>
            </motion.div>

            <motion.div className="bg-pink-50 rounded-2xl border border-pink-100 p-6 flex flex-col" {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }}>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{featureItems[4]?.heading}</h3>
              <p className="text-sm text-slate-500 mb-4">{featureItems[4]?.description}</p>
              <Link to="/features" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all mt-auto">Learn more <ArrowRight className="w-3.5 h-3.5" /></Link>
              <div className="mt-4">
                <AutomationFlowMockup />
              </div>
            </motion.div>

            <motion.div className="md:col-span-2 bg-indigo-50 rounded-2xl border border-indigo-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6" {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{featureItems[5]?.heading}</h3>
                <p className="text-sm text-slate-500 mb-4">{featureItems[5]?.description}</p>
                <Link to="/features" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all">Learn more <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
              <div className="w-full md:w-72 shrink-0">
                <AnalyticsChartMockup />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 5. PAIN POINT / SOLUTION STRIP ─── */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 className="text-center text-2xl md:text-3xl font-bold text-slate-900 mb-10" {...fadeUp}>
            {get('painPoint.heading')}
          </motion.h2>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto" {...stagger}>
            {(() => {
              const allIcons = [Calendar, Users, Layout, Users, CreditCard, TrendingUp, BarChart3, Zap];
              return get('painPoint.pills').split(',').map((label, i) => {
                const Icon = allIcons[i] || Calendar;
                return (
              <motion.div key={label.trim()} className="flex items-center gap-3 bg-white rounded-full px-4 py-3 border border-blue-100 shadow-sm" variants={stagger}>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">{label.trim()}</span>
              </motion.div>
            );
            });
            })()}
          </motion.div>
        </div>
      </section>

      {/* ─── 6. RESERVATIONS ─── */}
      <section className="py-20 md:py-28 bg-blue-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <span className="text-blue-600 font-semibold text-sm tracking-widest uppercase">{get('reservations.badge')}</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{get('reservations.heading')}</h2>
              <p className="mt-4 text-lg text-slate-500">{get('reservations.paragraph')}</p>
              <ul className="mt-6 space-y-3">
                {get('reservations.bullets').split('\n').map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="text-xs text-slate-500 ml-2">Booking Calendar</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-slate-800">June 2026</h4>
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500">&lt;</div>
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500">&gt;</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                      <div key={d} className="text-[10px] text-center text-slate-400 font-medium py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 4;
                      const hasBooking = [6, 7, 12, 13, 14, 19, 20, 21, 26, 27].includes(day);
                      const isToday = day === 15;
                      return (
                        <div key={i} className={`text-xs text-center py-2 rounded-lg ${
                          day < 1 || day > 30 ? 'text-slate-200' :
                          isToday ? 'bg-blue-600 text-white font-semibold' :
                          hasBooking ? 'bg-blue-50 text-blue-700 font-medium' :
                          'text-slate-600 hover:bg-slate-50'
                        }`}>
                          {day >= 1 && day <= 30 ? day : ''}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      { time: '6:30 PM', name: 'Williams party of 4', status: 'Confirmed' },
                      { time: '7:00 PM', name: 'Anderson party of 2', status: 'Seated' },
                      { time: '8:00 PM', name: 'Thompson party of 6', status: 'Confirmed' },
                    ].map(({ time, name, status }) => (
                      <div key={name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-slate-800">{name}</div>
                          <div className="text-xs text-slate-400">{time}</div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          status === 'Confirmed' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                        }`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 7. FLOOR PLAN ─── */}
      <section className="py-20 md:py-28 bg-green-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layout className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-slate-700">Live Floor Plan</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { t: 'VIP 1', status: 'occupied', size: 'col-span-1' },
                    { t: 'VIP 2', status: 'available', size: 'col-span-1' },
                    { t: 'Bar', status: 'available', size: 'col-span-2' },
                    { t: 'Table 5', status: 'available', size: 'col-span-1' },
                    { t: 'Table 6', status: 'occupied', size: 'col-span-1' },
                    { t: 'Table 7', status: 'reserved', size: 'col-span-1' },
                    { t: 'Table 8', status: 'available', size: 'col-span-1' },
                    { t: 'Table 9', status: 'occupied', size: 'col-span-2' },
                    { t: 'Table 10', status: 'available', size: 'col-span-1' },
                    { t: 'Table 11', status: 'occupied', size: 'col-span-1' },
                  ].map(({ t: table, status, size }) => (
                    <div key={table} className={`${size} rounded-xl p-3 text-center border-2 transition-all ${
                      status === 'available' ? 'bg-green-50 border-green-200' :
                      status === 'occupied' ? 'bg-amber-50 border-amber-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="text-xs font-semibold text-slate-700">{table}</div>
                      <div className={`text-[10px] font-medium mt-0.5 ${
                        status === 'available' ? 'text-green-600' :
                        status === 'occupied' ? 'text-amber-600' : 'text-blue-600'
                      }`}>{status}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-50 border border-green-200" /> Available</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200" /> Occupied</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" /> Reserved</span>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <span className="text-green-600 font-semibold text-sm tracking-widest uppercase">{get('floorPlan.badge')}</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{get('floorPlan.heading')}</h2>
              <p className="mt-4 text-lg text-slate-500">{get('floorPlan.paragraph')}</p>
              <ul className="mt-6 space-y-3">
                {get('floorPlan.bullets').split('\n').map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 8. GUEST CRM ─── */}
      <section className="py-20 md:py-28 bg-amber-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <span className="text-amber-600 font-semibold text-sm tracking-widest uppercase">{get('guestCrm.badge')}</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{get('guestCrm.heading')}</h2>
              <p className="mt-4 text-lg text-slate-500">{get('guestCrm.paragraph')}</p>
              <ul className="mt-6 space-y-3">
                {get('guestCrm.bullets').split('\n').map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-lg">MJ</div>
                    <div>
                      <div className="text-white font-semibold text-lg">Marcus Johnson</div>
                      <div className="text-white/80 text-sm">22 visits · Diamond Member</div>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Email</div>
                      <div className="text-sm text-slate-700">marcus@email.com</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Phone</div>
                      <div className="text-sm text-slate-700">+1 (555) 432-1098</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Last Visit</div>
                      <div className="text-sm text-slate-700">3 days ago</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Avg. Spend</div>
                      <div className="text-sm text-slate-700">$187</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-2">Preferences & Notes</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">Corner booth</span>
                      <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">Gluten-free</span>
                      <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">Birthday: Mar 12</span>
                      <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">Prefers sparkling water</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-2">Recent Visits</div>
                    <div className="space-y-1.5">
                      {['Jun 2, 2026 · Dinner · Table 8 · $245', 'May 24, 2026 · Dinner · Table 5 · $189', 'May 15, 2026 · Lunch · Table 3 · $98'].map(v => (
                        <div key={v} className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{v}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 9. AUTOMATION ─── */}
      <section className="py-20 md:py-28 bg-pink-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-semibold text-slate-700">Automation Workflows</span>
                </div>
                <div className="space-y-4">
                  {[
                    { step: 'Booking Created', detail: 'Trigger: Online or phone reservation', color: 'bg-blue-500' },
                    { step: 'Send Confirmation', detail: 'SMS + Email with booking details', color: 'bg-green-500' },
                    { step: '24h Reminder', detail: 'Auto-reminder with confirmation link', color: 'bg-amber-500' },
                    { step: 'Post-Visit Follow-up', detail: 'Thank you + review request', color: 'bg-purple-500' },
                  ].map(({ step, detail, color }, i) => (
                    <div key={step} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold`}>{i + 1}</div>
                        {i < 3 && <div className="w-0.5 h-6 bg-slate-200" />}
                      </div>
                      <div className="pb-2">
                        <div className="text-sm font-medium text-slate-800">{step}</div>
                        <div className="text-xs text-slate-400">{detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Automation active · 1,247 messages sent this week</span>
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <span className="text-pink-600 font-semibold text-sm tracking-widest uppercase">{get('automation.badge')}</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{get('automation.heading')}</h2>
              <p className="mt-4 text-lg text-slate-500">{get('automation.paragraph')}</p>
              <ul className="mt-6 space-y-3">
                {automationBullets.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-pink-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 10. ANALYTICS ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <span className="text-indigo-600 font-semibold text-sm tracking-widest uppercase">{get('analytics.badge')}</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{get('analytics.heading')}</h2>
              <p className="mt-4 text-lg text-slate-500">{get('analytics.paragraph')}</p>
              <ul className="mt-6 space-y-3">
                {analyticsBullets.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
                <div className="px-5 py-3 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="text-xs text-slate-500 ml-2">Analytics Dashboard</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800 rounded-xl p-3">
                      <div className="text-[10px] text-slate-500">Total Revenue</div>
                      <div className="text-lg font-bold text-white">$84,290</div>
                      <div className="text-[10px] text-green-400 font-medium">↑ 18.2% vs last month</div>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-3">
                      <div className="text-[10px] text-slate-500">Avg. Party Size</div>
                      <div className="text-lg font-bold text-white">3.4</div>
                      <div className="text-[10px] text-green-400 font-medium">↑ 5.7% vs last month</div>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-300">Weekly Revenue</span>
                      <span className="text-[10px] text-blue-400">This week</span>
                    </div>
                    <div className="flex items-end gap-2 h-28">
                      {[35, 50, 42, 68, 55, 82, 70].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t" style={{ height: `${h}%` }} />
                          <span className="text-[10px] text-slate-500">${['2.4','3.5','2.9','4.8','3.8','5.7','4.9'][i]}k</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-800 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-slate-500">Occupancy</div>
                      <div className="text-sm font-bold text-white">78%</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-slate-500">Turnover</div>
                      <div className="text-sm font-bold text-white">1.8h</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-slate-500">No-shows</div>
                      <div className="text-sm font-bold text-green-400">4.2%</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 11. MOBILE APP ─── */}
      <section className="py-20 md:py-28 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <span className="text-slate-600 font-semibold text-sm tracking-widest uppercase">{get('mobileApp.badge')}</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{get('mobileApp.heading')}</h2>
              <p className="mt-4 text-lg text-slate-500">{get('mobileApp.paragraph')}</p>
              <ul className="mt-6 space-y-3">
                {mobileAppBullets.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white pl-2.5 pr-5 py-2.5 rounded-xl">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.54 12.62c.02-2.74 1.52-4.06 1.54-4.12-.84-1.23-2.15-1.4-2.62-1.42-1.11-.12-2.17.66-2.74.66-.56 0-1.43-.64-2.35-.62-1.21.02-2.33.7-2.95 1.78-1.26 2.19-.32 5.43.9 7.2.6.87 1.31 1.84 2.25 1.8.9-.04 1.24-.58 2.33-.58 1.08 0 1.39.58 2.34.56.97-.02 1.58-.88 2.17-1.76.68-.99.96-1.95.98-2-.02-.01-1.88-.72-1.9-2.85zm-1.77-5.3c.5-.6.84-1.44.75-2.27-.72.03-1.6.48-2.12 1.09-.47.54-.87 1.41-.76 2.24.8.06 1.62-.41 2.13-1.06z"/>
                  </svg>
                  <div>
                    <div className="text-[10px] text-slate-400">{get('mobileApp.app_store_text')}</div>
                    <div className="text-sm font-semibold">{get('mobileApp.app_store_label')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 text-white pl-2.5 pr-5 py-2.5 rounded-xl">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                    <path d="M4.04 3.02c-.26.13-.44.4-.44.72v16.52c0 .32.18.59.44.72l.08.04 9.96-9.04V12l-9.96-9.02-.08.04z" fill="currentColor"/>
                    <path d="M18.28 15.56l-4.2-3.82v.04l-2.54 2.3 2.54 2.3 4.2-3.82z" fill="currentColor" opacity="0.6"/>
                    <path d="M14.08 12l-1.74 1.58-8.3 7.46c.22.16.5.2.76.06l.04-.02L18.28 15.56 14.08 12z" fill="currentColor" opacity="0.3"/>
                    <path d="M14.08 12l-1.74-1.58L4.04 3.02c.22-.16.5-.2.76-.06l.04.02L18.28 8.44 14.08 12z" fill="currentColor" opacity="0.7"/>
                  </svg>
                  <div>
                    <div className="text-[10px] text-slate-400">{get('mobileApp.google_play_text')}</div>
                    <div className="text-sm font-semibold">{get('mobileApp.google_play_label')}</div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div className="flex justify-center gap-6" {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <PhoneMockup label={get('mobileApp.phone1_label')}>
                <div className="text-sm font-bold text-slate-800 mb-3">Today</div>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah J.', time: '7:00 PM', guests: 4 },
                    { name: 'Mike C.', time: '7:30 PM', guests: 2 },
                    { name: 'Emma W.', time: '8:00 PM', guests: 6 },
                    { name: 'James R.', time: '8:30 PM', guests: 3 },
                  ].map(({ name, time, guests }) => (
                    <div key={name} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-800">{name}</span>
                        <span className="text-xs text-slate-400">{time}</span>
                      </div>
                      <div className="text-xs text-slate-400">{guests} guests</div>
                    </div>
                  ))}
                </div>
              </PhoneMockup>
              <PhoneMockup label={get('mobileApp.phone2_label')}>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-blue-600 font-bold text-sm">MJ</div>
                  <div className="text-sm font-semibold text-slate-800 mt-2">Marcus J.</div>
                  <div className="text-[10px] text-slate-400">Diamond Member</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Visits</span>
                    <span className="text-slate-800 font-medium">22</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Avg. Spend</span>
                    <span className="text-slate-800 font-medium">$187</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Last Visit</span>
                    <span className="text-slate-800 font-medium">3 days ago</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Status</span>
                    <span className="text-green-600 font-medium">VIP</span>
                  </div>
                </div>
                <div className="mt-3 bg-blue-50 rounded-xl p-2.5">
                  <div className="text-[10px] text-blue-600 font-medium">Notes</div>
                  <div className="text-[10px] text-slate-500">Prefers corner booth, gluten-free</div>
                </div>
              </PhoneMockup>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 12. INTEGRATION ECOSYSTEM ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight" {...fadeUp}>
            {get('integrations.heading')}
          </motion.h2>
          <motion.p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto" {...fadeUp} transition={{ delay: 0.1 }}>
            {get('integrations.paragraph')}
          </motion.p>
          <motion.div className="mt-14 relative" {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
              {(() => {
                const integrationColors = [
                  'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600', 'bg-blue-100 text-blue-600',
                  'bg-blue-100 text-blue-600', 'bg-red-100 text-red-600', 'bg-green-100 text-green-600',
                  'bg-amber-100 text-amber-600', 'bg-orange-100 text-orange-600', 'bg-orange-100 text-orange-600',
                  'bg-blue-100 text-blue-600', 'bg-pink-100 text-pink-600', 'bg-yellow-100 text-yellow-700',
                  'bg-purple-100 text-purple-600', 'bg-red-100 text-red-600', 'bg-green-100 text-green-600',
                  'bg-green-100 text-green-600',
                ];
                return get('integrations.labels').split(',').map((label, i) => (
                  <div key={label.trim()} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm ${integrationColors[i % integrationColors.length]}`}>
                    <div className="w-5 h-5 rounded-full bg-current opacity-20 shrink-0" />
                    <span className="text-sm font-medium">{label.trim()}</span>
                  </div>
                ));
              })()}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 13. TESTIMONIALS ─── */}
      <section className="py-20 md:py-28 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto mb-14" {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{get('testimonials.heading')}</h2>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" {...stagger}>
            {testimonialItems.map((item) => (
              <motion.div key={item.author} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg" variants={stagger}>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Briefcase key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">&ldquo;{item.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {item.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.author}</div>
                    <div className="text-xs text-slate-400">{item.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div className="mt-14 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center" {...fadeUp}>
            {testimonialStats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl md:text-3xl font-bold text-white">{value}</div>
                <div className="text-sm text-blue-200 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 14. CTA STRIP ─── */}
      <section className="py-16 bg-amber-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 className="text-2xl md:text-3xl font-bold text-slate-900" {...fadeUp}>
            {get('ctaStrip.heading')}
          </motion.h2>
          <motion.div className="mt-8" {...fadeUp} transition={{ delay: 0.15 }}>
            <Link to="/book-a-demo" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all shadow-lg">
              {get('ctaStrip.button')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── 15. PRICING PREVIEW ─── */}
      <section className="py-20 md:py-28 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto mb-14" {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{get('pricingPreview.heading')}</h2>
            <p className="mt-4 text-lg text-slate-400">{get('pricingPreview.subheading')}</p>
          </motion.div>
          <motion.div className="flex flex-wrap justify-center gap-6" {...stagger}>
            {(pricingPlans || [
              {
                name: 'Starter',
                desc: 'For new venues getting started',
                price: '$0',
                period: 'forever free',
                highlighted: false,
                features: ['Up to 50 bookings/mo', 'Single venue', 'Basic calendar', 'Email support', 'Booking widget'],
              },
              {
                name: 'Growth',
                desc: 'For growing independent venues',
                price: '$29',
                period: '/month',
                highlighted: false,
                features: ['Unlimited bookings', 'Single venue', 'Floor plan management', 'Guest CRM', 'SMS reminders', 'Chat support'],
              },
              {
                name: 'Professional',
                desc: 'For busy venues with high volume',
                price: '$79',
                period: '/month',
                highlighted: true,
                features: ['Everything in Growth', 'Multi-location (up to 3)', 'Advanced analytics', 'Automation workflows', 'Priority support', 'Custom branding'],
              },
              {
                name: 'Enterprise',
                desc: 'For large hospitality groups',
                price: 'Custom',
                period: 'contact us',
                highlighted: false,
                features: ['Everything in Pro', 'Unlimited locations', 'Dedicated account manager', 'Custom integrations', 'On-site training', 'SLA guarantee'],
              },
            ]).map(({ name, desc, price, period, highlighted, features }, i) => (
                <motion.div
                  key={name}
                  variants={stagger}
                  className={`w-full sm:w-[calc(50%-12px)] ${
                    plansCount === 3 ? 'lg:w-[calc(33.333%-16px)]' :
                    plansCount === 2 ? 'lg:w-[calc(50%-12px)]' :
                    'lg:w-[calc(25%-18px)]'
                  } min-w-[220px] rounded-2xl p-6 md:p-8 flex flex-col ${
                    highlighted
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105 relative'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                  )}
                  <div className="mb-1 text-lg font-bold">{name}</div>
                  <div className={`text-sm mb-4 ${highlighted ? 'text-blue-100' : 'text-slate-400'}`}>{desc}</div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className={`text-sm ml-1 ${highlighted ? 'text-blue-200' : 'text-slate-400'}`}>{period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlighted ? 'text-blue-200' : 'text-blue-400'}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={price === '$0' ? '/register' : '/pricing'}
                    className={`w-full text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                      highlighted
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {price === '$0' ? 'Get Started Free' : price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                  </Link>
                </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 16. MORE THAN JUST RESERVATIONS ─── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto mb-14" {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{get('beyondBooking.heading')}</h2>
            <p className="mt-4 text-lg text-slate-500">{get('beyondBooking.paragraph')}</p>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" {...stagger}>
            {(() => {
              const bbIcons = [TrendingUp, HeartHandshake, BrainCircuit];
              return beyondCards.map((card, idx) => {
                const Icon = bbIcons[idx] || TrendingUp;
                return (
              <motion.div key={card.title} className="bg-slate-50 rounded-2xl p-8 border border-slate-100" variants={stagger}>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{card.description}</p>
                <Link to="/features" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all">Learn more <ArrowRight className="w-3.5 h-3.5" /></Link>
              </motion.div>
            );
              });
              })()}
          </motion.div>
        </div>
      </section>

      {/* ─── 17. PRESS / PARTNERS ─── */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-400 mb-8 font-medium tracking-wider uppercase">{get('partners.label')}</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {get('partners.names').split(',').map(name => (
              <PartnerLogo key={name.trim()} name={name.trim()} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 18. FAQ ─── */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-center mb-12" {...fadeUp}>
            {get('faq.heading')}
          </motion.h2>
          <motion.div className="space-y-3" {...stagger}>
            {faqItems.map((item, i) => (
              <motion.div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden" variants={stagger}>
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-slate-800 pr-4">{item.q}</span>
                  {openFaq === i ? (
                    <Minus className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 19. FINAL CTA ─── */}
      <section className="py-20 md:py-28 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                {get('finalCta.heading')}
              </h2>
              <p className="mt-6 text-lg text-blue-100 leading-relaxed">
                {get('finalCta.paragraph')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/book-a-demo" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-7 py-3.5 rounded-xl text-base font-semibold transition-all shadow-lg">
                  {get('finalCta.cta_primary')} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/pricing" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 px-7 py-3.5 rounded-xl text-base font-semibold transition-all">
                  {get('finalCta.cta_secondary')}
                </Link>
              </div>
              <p className="mt-4 text-sm text-blue-200">{get('finalCta.caption')}</p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                  <span className="text-xs text-blue-200 ml-2">sectros.com/dashboard</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {['$12.4k', '24', '78%', '4.8'].map((v, i) => (
                      <div key={i} className="bg-white/10 rounded-lg p-2.5 text-center">
                        <div className="text-white font-bold text-sm">{v}</div>
                        <div className="text-blue-200 text-[10px]">{['Revenue','Bookings','Occupancy','Rating'][i]}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-300" />
                      <span className="text-xs text-blue-100 font-medium">Live Bookings</span>
                    </div>
                    {['Johnson · 7pm · 4 guests', 'Chen · 7:30pm · 2 guests', 'Williams · 8pm · 6 guests'].map(b => (
                      <div key={b} className="text-xs text-blue-200 py-1 border-b border-white/10 last:border-0">{b}</div>
                    ))}
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {[35, 50, 42, 65, 55, 78, 62].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/20 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
