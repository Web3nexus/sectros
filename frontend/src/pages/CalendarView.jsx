import React, { useState, useEffect } from 'react'
import {Calendar, ChevronLeft, ChevronRight, Loader2, MessageCircle, Users, Clock, Globe, Instagram, Facebook, Link as LinkIcon, Smartphone} from 'lucide-react'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useBusinessConfig } from '../hooks/useBusinessConfig'

export function CalendarView() {
  const { t } = useTranslation();
  const config = useBusinessConfig();
  const b = config.labels;
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  const [newReservation, setNewReservation] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    special_requests: '',
    source: 'direct'
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('reservations');
      setReservations(res.data || []);
    } catch (err) {
      console.error('Calendar Sync Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const combinedTime = `${newReservation.reservation_date} ${newReservation.reservation_time}:00`;
      await api.post('reservations', {
        ...newReservation,
        reservation_time: combinedTime,
        source: newReservation.source || 'direct'
      });
      setShowModal(false);
      setNewReservation({ customer_name: '', customer_email: '', customer_phone: '', reservation_date: '', reservation_time: '', party_size: 2, special_requests: '', source: 'direct' });
      fetchReservations();
    } catch (err) {
      console.error('Creation Failed:', err);
      alert('Failed to schedule booking. Ensure all fields are filled properly.');
    }
  };

  const handleDateClick = (dateStr) => {
    setNewReservation({ 
        customer_name: '', 
        customer_email: '', 
        customer_phone: '', 
        reservation_date: dateStr, 
        reservation_time: '19:00', 
        party_size: 2, 
        special_requests: '',
        source: 'direct'
    });
    setShowModal(true);
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i); 

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
         <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">{t('reservations.viewCalendar')}</h2>
          <p className="text-muted-foreground text-sm font-medium">Visual density and attendance overview.</p>
        </div>
        
        <div className="flex border border-border rounded-xl p-1 bg-white shadow-sm">
           <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
           <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors">Today</button>
           <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[24px] border border-border shadow-sm overflow-hidden"
      >
         <div className="p-6 border-b border-border bg-slate-50/20 text-center">
            <h3 className="font-black text-xl uppercase tracking-tighter text-slate-800">{monthName} <span className="text-slate-400 font-bold">{currentMonth.getFullYear()}</span></h3>
         </div>

         <div className="grid grid-cols-7 border-b border-border bg-slate-50/50">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
               <div key={day} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center border-r border-border last:border-0">{day}</div>
            ))}
         </div>

         <div className="grid grid-cols-7 min-h-[600px]">
            {blanks.map(i => <div key={`blank-${i}`} className="border-r border-b border-border bg-slate-50/20 last:border-r-0" />)}
            {days.map(day => {
               const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
               const resList = Array.isArray(reservations) ? reservations : [];
               const dayReservations = resList.filter(r => r.reservation_time && r.reservation_time.startsWith(dateStr));
               const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

               return (
                  <div 
                    key={day} 
                    onClick={() => handleDateClick(dateStr)}
                    className={`border-r border-b border-border p-3 min-h-[140px] transition-all hover:bg-blue-50/20 cursor-pointer relative group flex flex-col ${isToday ? 'bg-blue-50/30' : ''}`}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-black ${isToday ? 'bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg shadow-blue-500/20' : 'text-slate-400 font-bold'}`}>{day}</span>
                        {dayReservations.length > 0 && (
                           <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200">{dayReservations.length}</span>
                        )}
                     </div>
                     
                     <div className="space-y-1 overflow-hidden flex-1">
                        {dayReservations.slice(0, 3).map(res => (
                           <div 
                            key={res.id} 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRes(res);
                            }}
                            className={`text-[9px] font-bold p-1.5 rounded-lg border truncate transition-all cursor-pointer hover:scale-[1.05] hover:z-10 relative shadow-sm ${
                               res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                               res.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100/50' :
                               'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                           >
                               {new Date(res.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {res.customer_name}
                           </div>
                        ))}
                        {dayReservations.length > 3 && (
                           <div className="text-[9px] font-black text-muted-foreground uppercase py-1 text-center opacity-60">+ {dayReservations.length - 3} more</div>
                        )}
                     </div>
                  </div>
               )
            })}
            {Array.from({ length: 42 - (daysInMonth + blanks.length) }).map((_, i) => (
               <div key={`empty-${i}`} className="border-r border-b border-border bg-slate-50/20 last:border-r-0" />
            ))}
         </div>
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter text-slate-800">Quick {b.booking}</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Manual Entry for {newReservation.reservation_date}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 font-bold text-xl">×</button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Guest Name</label>
                    <input required type="text" value={newReservation.customer_name} onChange={e => setNewReservation({...newReservation, customer_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm" placeholder="John Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Email</label>
                    <input required type="email" value={newReservation.customer_email} onChange={e => setNewReservation({...newReservation, customer_email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                    <input required type="text" value={newReservation.customer_phone} onChange={e => setNewReservation({...newReservation, customer_phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm" placeholder="555-0199" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Arrival Time</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input required type="time" value={newReservation.reservation_time} onChange={e => setNewReservation({...newReservation, reservation_time: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">{b.partySize} ({b.capacityUnit})</label>
                    <div className="relative">
                      <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input required type="number" min="1" value={newReservation.party_size} onChange={e => setNewReservation({...newReservation, party_size: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all shadow-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Special Requests / Occasion</label>
                  <textarea value={newReservation.special_requests} onChange={e => setNewReservation({...newReservation, special_requests: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm" rows="1" placeholder="Notes..."></textarea>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1 text-slate-600">Booking Source</label>
                   <select 
                    value={newReservation.source} 
                    onChange={e => setNewReservation({...newReservation, source: e.target.value})}
                    className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-emerald-900 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm appearance-none"
                   >
                     <option value="direct">Direct / Phone Call</option>
                     <option value="whatsapp">WhatsApp</option>
                     <option value="instagram">Instagram</option>
                     <option value="facebook">Facebook</option>
                     <option value="google">Google / Maps</option>
                     <option value="other">Other</option>
                   </select>
                </div>
                
                <div className="pt-6">
                  <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98]">Confirm {b.booking}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSelectedRes(null)}>
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-3xl border border-white/20 relative overflow-hidden"
               onClick={(e) => e.stopPropagation()}
             >
                <div className="absolute top-0 right-0 p-8">
                   <button onClick={() => setSelectedRes(null)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">×</button>
                </div>

                <div className="flex items-center gap-6 mb-10">
                   <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-primary border border-blue-500/10">
                      <Users size={32} />
                   </div>
                   <div>
                      <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{b.booking} Detail</div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{selectedRes.customer_name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                           selectedRes.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20' :
                           selectedRes.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-500/20' :
                           'bg-slate-100 text-slate-600 border-slate-200'
                         }`}>
                           {selectedRes.status}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={12} /> Schedule</div>
                      <div className="font-black text-slate-800">{new Date(selectedRes.reservation_time).toLocaleDateString()}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(selectedRes.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   </div>
                   <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><Users size={12} /> {b.partySize}</div>
                      <div className="font-black text-slate-800 text-2xl tracking-tighter">{selectedRes.party_size} <span className="text-sm">{b.capacityUnit}</span></div>
                   </div>
                </div>

                <div className="space-y-4 mb-10">
                   <div className="flex items-center gap-4 text-slate-700">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><MessageSquare size={18} /></div>
                      <div className="min-w-0 flex-1">
                         <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Notes / Requests</div>
                         <div className="text-sm font-bold text-slate-900 truncate">{selectedRes.special_requests || 'No special requests provided.'}</div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 text-slate-700 pt-2">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          {selectedRes.source === 'whatsapp' ? <MessageCircle size={18} /> :
                           selectedRes.source === 'instagram' ? <Instagram size={18} /> :
                           selectedRes.source === 'facebook' ? <Facebook size={18} /> :
                           <Globe size={18} />}
                       </div>
                       <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{b.booking} Source</div>
                          <div className="text-sm font-black text-slate-900 uppercase tracking-widest">{selectedRes.source || 'Website'}</div>
                       </div>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setSelectedRes(null)} className="flex-1 py-4.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all">Close</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
