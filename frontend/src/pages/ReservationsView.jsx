import React, { useState, useEffect } from 'react'
import {Calendar, Clock, Users, MessageCircle, CheckCircle, CircleX as XCircle, Clock4, Search, Filter, Loader2, Globe, Instagram, Facebook, Link as LinkIcon, Smartphone, MapPin, DollarSign} from 'lucide-react'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useBusinessConfig } from '../hooks/useBusinessConfig'
import { useAuth } from '../context/AuthContext'

export function ReservationsView() {
  const config = useBusinessConfig();
  const { user } = useAuth();
  const hasDeposits = (() => {
    const features = user?.features || {};
    if (Array.isArray(features)) return features.includes('reservation_deposits');
    if (typeof features === 'object' && features !== null) return !!features.reservation_deposits;
    return false;
  })();
  const b = config.labels;
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0 });
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [timeFilter, setTimeFilter] = useState('All');
  
  const [payingDepositId, setPayingDepositId] = useState(null);
  const [newReservation, setNewReservation] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    special_requests: '',
    source: 'manual',
    dynamic_fields: {}
  });

  const renderSource = (source) => {
    switch(source) {
      case 'whatsapp': return <MessageCircle size={14} className="text-emerald-500" />;
      case 'instagram': return <Instagram size={14} className="text-pink-500" />;
      case 'facebook': return <Facebook size={14} className="text-blue-600" />;
      case 'direct_link': return <LinkIcon size={14} className="text-slate-400" />;
      case 'website': return <Globe size={14} className="text-slate-400" />;
      default: return <Smartphone size={14} className="text-slate-400" />;
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      // Fetch menu data which contains categories and items
      const menuRes = await api.get('menu');
      const menuData = menuRes.data || [];
      
      setCategories(menuData);
      
      // Flatten items from all categories for the services list
      const allServices = menuData.reduce((acc, cat) => {
        return [...acc, ...(cat.items || [])];
      }, []);
      setServices(allServices);

      // Fetch staff
      const staffRes = await api.get('staff');
      setStaffOptions(staffRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err);
    }
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('reservations');
      const reservationData = res.data || [];
      setReservations(reservationData);
      
      const resList = Array.isArray(reservationData) ? reservationData : [];
      const counts = resList.reduce((acc, r) => {
        if (r.status) {
          acc[r.status] = (acc[r.status] || 0) + 1;
        }
        return acc;
      }, {});

      setStats({
        total: reservationData.length,
        pending: counts.pending || 0,
        confirmed: counts.confirmed || 0,
        cancelled: counts.cancelled || 0
      });
    } catch (err) {
      console.error('Reservation Sync Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayDeposit = async (reservation) => {
    if (payingDepositId) return;
    setPayingDepositId(reservation.id);
    const protocol = window.location.protocol;
    const host = window.location.host;
    try {
      const res = await api.post('public/payments/create-checkout', {
        reservation_id: reservation.id,
        success_url: `${protocol}//${host}/dashboard/reservations?paid=${reservation.id}`,
        cancel_url: `${protocol}//${host}/dashboard/reservations`,
      });
      if (res.data.url) {
        window.open(res.data.url, '_blank');
      } else {
        alert('No checkout URL returned. Please try again.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create payment. Is a payment gateway configured?');
    } finally {
      setPayingDepositId(null);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      fetchReservations();
    } catch (err) {
      console.error('Status Update Failed:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const combinedTime = `${newReservation.reservation_date} ${newReservation.reservation_time}:00`;
      await api.post('reservations', {
        ...newReservation,
        reservation_time: combinedTime,
        source: newReservation.source || 'manual'
      });
      setShowModal(false);
      setNewReservation({ customer_name: '', customer_email: '', customer_phone: '', reservation_date: '', reservation_time: '', party_size: 2, special_requests: '', source: 'manual', dynamic_fields: {} });
      fetchReservations();
    } catch (err) {
      console.error('Creation Failed:', err);
      alert('Failed to schedule booking. Ensure all fields are filled properly.');
    }
  };

  const getFilteredReservations = () => {
    if (!Array.isArray(reservations)) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return reservations.filter(res => {
      const resDate = new Date(res.reservation_time);
      const resDay = new Date(resDate.getFullYear(), resDate.getMonth(), resDate.getDate());

      if (timeFilter === 'Today') {
        return resDay.getTime() === today.getTime();
      }
      
      if (timeFilter === 'This Week') {
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        return resDay >= firstDayOfWeek && resDay <= lastDayOfWeek;
      }
      
      return true;
    });
  };

  const filteredReservations = getFilteredReservations();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
         <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">{b.reservations}</h2>
          <p className="text-muted-foreground text-sm font-medium">{config.type === 'salon' ? 'Manage your client appointments and schedules.' : config.type === 'hotel' ? 'Manage guest check-ins and stay durations.' : 'Manage your bookings and guest requests.'}</p>
        </div>
        
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
          New {b.reservations.endsWith('s') ? b.reservations.slice(0, -1) : b.reservations}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: 'Total Volume', value: stats.total, icon: Calendar, color: 'text-primary', bg: 'bg-blue-50' },
           { label: 'Pending', value: stats.pending, icon: Clock4, color: 'text-amber-600', bg: 'bg-amber-50' },
           { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
         ].map(stat => (
           <div key={stat.label} className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-5 group hover:border-blue-200 transition-colors">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                 <stat.icon size={20} />
              </div>
              <div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.label}</div>
                <div className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</div>
              </div>
           </div>
         ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[24px] border border-border shadow-sm overflow-hidden text-sm"
      >
         <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
            <div className="flex items-center gap-4 flex-1">
               <div className="relative flex-1 max-w-sm group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input type="text" placeholder="Search guests..." className="w-full pl-11 pr-4 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all font-medium text-slate-700" />
               </div>
               <button className="p-2.5 bg-white border border-border rounded-xl text-muted-foreground hover:text-slate-600 hover:border-slate-300 transition-colors shadow-sm">
                  <Filter size={18} />
               </button>
            </div>
            <div className="flex border border-border rounded-xl p-1 bg-white shadow-sm">
               {['Today', 'This Week', 'All'].map(tab => (
                 <button 
                   key={tab} 
                   onClick={() => setTimeFilter(tab)}
                   className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === tab ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-muted-foreground hover:text-slate-600'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>
         </div>

         <div className="overflow-x-auto w-full border-t border-border">
            <table className="w-full text-left min-w-[1000px] whitespace-nowrap">
               <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-border">
                  <tr>
                    <th className="px-8 py-5">Guest Information</th>
                     <th className="px-8 py-5">Schedule</th>
                    <th className="px-8 py-5">Capacity / Unit</th>
                    <th className="px-8 py-5">Origin</th>
                    <th className="px-8 py-5">Status</th>
                    {hasDeposits && <th className="px-8 py-5">Deposit</th>}
                    <th className="px-8 py-5 text-right">Integrations</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {Array.isArray(filteredReservations) && filteredReservations.length > 0 ? filteredReservations.map(res => {
                    const dateObj = new Date(res.reservation_time);
                    const dateStr = dateObj.toLocaleDateString();
                    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                           <div className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{res.customer_name}</div>
                           <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1 font-bold uppercase tracking-tight truncate max-w-[200px]">
                              <MessageSquare size={12} className="text-blue-500 shrink-0" /> {res.special_requests || 'Routine Booking'}
                           </div>
                           <div className="text-[10px] text-slate-600 font-black uppercase tracking-tight mt-1 bg-slate-100/50 inline-block px-2 py-0.5 rounded-md">{res.customer_phone}</div>
                        </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5 font-black text-slate-700 text-xs">
                             <Clock size={16} className="text-emerald-500" />
                             {timeStr}
                          </div>
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                             {dateStr}
                          </div>
                       </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-1.5 font-black text-slate-800">
                              <Users size={18} className="text-slate-400" />
                              <span className="text-sm tracking-tighter">{res.party_size || res.guests || 1}</span> 
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest hidden md:inline ml-1 font-black">{config.type === 'hotel' ? 'GUESTS' : config.type === 'salon' ? 'SERVICES' : 'COVERS'}</span>
                           </div>
                        </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                                {renderSource(res.source)}
                             </div>
                             <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">{res.source || 'Website'}</span>
                          </div>
                       </td>
                        <td className="px-8 py-5">
                           <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                             res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             res.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             'bg-red-50 text-red-600 border-red-100'
                           }`}>
                             {res.status}
                           </span>
                        </td>
                        {hasDeposits && (
                          <td className="px-8 py-5">
                            {res.deposit_amount > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                  res.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                  res.payment_status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                  'bg-slate-50 text-slate-500'
                                }`}>
                                  {res.payment_status === 'paid' ? 'Paid' : res.payment_status === 'pending' ? 'Pending' : 'Unpaid'}
                                </span>
                                <span className="text-xs font-black text-slate-700">${parseFloat(res.deposit_amount).toFixed(2)}</span>
                                {res.payment_status !== 'paid' && (
                                  <button
                                    onClick={() => handlePayDeposit(res)}
                                    disabled={payingDepositId === res.id}
                                    className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                                  >
                                    {payingDepositId === res.id ? 'Processing...' : 'Pay Now'}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">—</span>
                            )}
                          </td>
                        )}
                        <td className="px-8 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                              {res.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                                    className="p-1 px-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 active:scale-95 transition-all"
                                  >
                                     Confirm
                                  </button>
                                  <button 
                                    onClick={() => handleStatusUpdate(res.id, 'cancelled')}
                                    className="p-1 px-4 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-200 active:scale-95 transition-all"
                                  >
                                     Decline
                                  </button>
                                </>
                              )}
                              {res.status === 'confirmed' && (
                                <button 
                                  onClick={() => handleStatusUpdate(res.id, 'completed')}
                                  className="p-1 px-4 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-card transition-all"
                                 >
                                   {config.type === 'hotel' ? 'Check-in' : config.type === 'salon' ? 'Check-out' : 'Seat Guest'}
                                </button>
                              )}
                          </div>
                       </td>
                    </tr>
                  )}) : (
                    <tr>
                       <td colSpan="6" className="px-8 py-32 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs italic">No {(b.reservations || 'reservations').toLowerCase()} booked on ledger.</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/50 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black text-lg uppercase tracking-tight">Manual {b.reservations.endsWith('s') ? b.reservations.slice(0, -1) : b.reservations} entry</h3>
                 <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-slate-600"><XCircle size={24} /></button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.bookingForm.fields.map(field => (
                      <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                         <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{field.label}</label>
                         {field.type === 'select' ? (
                            <select
                               required={field.required}
                               value={newReservation[field.name] || (field.name.includes('date') ? newReservation.reservation_date : field.name.includes('time') ? newReservation.reservation_time : '')}
                               onChange={e => {
                                  const val = e.target.value;
                                  if (field.name === 'date') setNewReservation({...newReservation, reservation_date: val});
                                  else if (field.name === 'time') setNewReservation({...newReservation, reservation_time: val});
                                  else setNewReservation({...newReservation, [field.name]: val});
                               }}
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary outline-none transition-all"
                            >
                               <option value="">Select {field.label}</option>
                               {field.name === 'category' ? (
                                 categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                               ) : field.name === 'service' ? (
                                 services.map(ser => <option key={ser.id} value={ser.id}>{ser.name}</option>)
                               ) : field.name === 'stylist' ? (
                                 staffOptions.map(st => <option key={st.id} value={st.id}>{st.name}</option>)
                               ) : field.name === 'room_type' ? (
                                 categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                               ) : (
                                 field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)
                               )}
                            </select>
                         ) : field.type === 'textarea' ? (
                            <textarea
                               required={field.required}
                               value={newReservation[field.name] || (field.name === 'notes' ? newReservation.special_requests : '')}
                               onChange={e => {
                                  const val = e.target.value;
                                  if (field.name === 'notes') setNewReservation({...newReservation, special_requests: val});
                                  else setNewReservation({...newReservation, [field.name]: val});
                               }}
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                               rows="2"
                            />
                         ) : (
                            <input
                               required={field.required}
                               type={field.type}
                               value={newReservation[field.name] || (field.name === 'name' ? newReservation.customer_name : field.name === 'email' ? newReservation.customer_email : field.name === 'phone' ? newReservation.customer_phone : field.name === 'date' || field.name === 'check_in' ? newReservation.reservation_date : field.name === 'time' ? newReservation.reservation_time : field.name === 'guests' || field.name === 'adults' ? newReservation.party_size : '')}
                               onChange={e => {
                                  const val = e.target.value;
                                  if (field.name === 'name') setNewReservation({...newReservation, customer_name: val});
                                  else if (field.name === 'email') setNewReservation({...newReservation, customer_email: val});
                                  else if (field.name === 'phone') setNewReservation({...newReservation, customer_phone: val});
                                  else if (field.name === 'date' || field.name === 'check_in') setNewReservation({...newReservation, reservation_date: val});
                                  else if (field.name === 'time') setNewReservation({...newReservation, reservation_time: val});
                                  else if (field.name === 'guests' || field.name === 'adults') setNewReservation({...newReservation, party_size: val});
                                  else setNewReservation({...newReservation, [field.name]: val});
                               }}
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                            />
                         )}
                      </div>
                    ))}
                 </div>

                  <div>
                     <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Booking Source</label>
                     <select
                        value={newReservation.source}
                        onChange={e => setNewReservation({...newReservation, source: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary outline-none transition-all appearance-none"
                     >
                        <option value="manual">Manual Entry / Phone Call</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="google">Google / Maps</option>
                        <option value="direct_link">Booking Link</option>
                     </select>
                  </div>
                 
                 <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">Submit {b.reservations.endsWith('s') ? b.reservations.slice(0, -1) : b.reservations}</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
