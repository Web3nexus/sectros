import React, { useState, useEffect } from 'react'
import {Plus, Mail, Shield, MoreHorizontal, User, Loader2, Briefcase} from 'lucide-react'
import api from '../services/api'
import { useBusinessConfig } from '../hooks/useBusinessConfig'

export function StaffView() {
  const config = useBusinessConfig()
  const b = config.labels
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: config.roles?.[0] || 'staff', is_active: true });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('staff');
      setStaff(res.data || []);
    } catch (err) {
      console.error('Staff Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('staff', newStaff);
      setShowModal(false);
      setNewStaff({ name: '', email: '', role: config.roles?.[0] || 'staff', is_active: true });
      fetchStaff();
    } catch (err) {
      console.error('Failed to add staff:', err);
      alert('Failed to register operator. Email might be in use.');
    }
  };

  const toggle2FA = async (id, currentStatus) => {
    try {
      await api.patch(`/staff/${id}/2fa`, { enabled: !currentStatus });
      fetchStaff();
    } catch (err) {
      console.error('Failed to toggle 2FA:', err);
      alert('Failed to update 2FA status.');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
         <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight lowercase first-letter:uppercase">{b.staff}</h2>
          <p className="text-muted-foreground text-sm font-medium">{b.staffDescription}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all w-max active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Add {b.staffUnit}
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-border shadow-sm overflow-x-auto w-full">
        <table className="w-full text-left min-w-[1000px] whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-border text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-5">Operator</th>
              <th className="px-8 py-5">Designation</th>
              <th className="px-8 py-5">2FA Status</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.isArray(staff) && staff.length > 0 ? staff.map(member => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-border flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <User size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-black text-foreground tracking-tight uppercase text-sm">{member.name}</div>
                        {member.is_owner && (
                          <span className="bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter shadow-lg shadow-blue-500/20">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1 font-bold uppercase tracking-tight">
                        <Mail size={12} className="text-blue-500" /> {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2 text-slate-600 font-black text-[10px] uppercase tracking-widest bg-slate-100/50 px-3 py-1.5 rounded-xl border border-border/50 w-fit">
                     <Shield size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                     {member.role}
                   </div>
                </td>
                <td className="px-8 py-5">
                   <button 
                    onClick={() => toggle2FA(member.id, member.two_factor_enabled)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                     member.two_factor_enabled 
                      ? 'bg-blue-50 text-primary border border-blue-100' 
                      : 'bg-slate-50 text-muted-foreground border border-border opacity-60 hover:opacity-100'
                    }`}
                   >
                     {member.two_factor_enabled ? <Shield size={10} fill="currentColor" /> : <Shield size={10} />}
                     {member.two_factor_enabled ? 'Active' : 'Disabled'}
                   </button>
                </td>
                <td className="px-8 py-5">
                   <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                     member.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-muted-foreground border border-border'
                   }`}>
                     <Briefcase size={8} fill="currentColor" className={member.is_active ? 'animate-pulse' : ''} />
                     {member.is_active ? 'Active' : 'Offline'}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                   <button className="p-2.5 text-muted-foreground hover:text-primary rounded-xl hover:bg-white border border-transparent hover:border-border transition-all">
                     <MoreHorizontal size={20} />
                   </button>
                </td>
              </tr>
            )) : (
              <tr>
                 <td colSpan="5" className="px-8 py-32 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs italic">No registered operators found on system.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/50 backdrop-blur-sm">
           <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-border">
              <h3 className="font-black text-xl uppercase tracking-tighter text-slate-800 mb-6">Register New {b.staffUnit}</h3>
              <form onSubmit={handleAddStaff} className="space-y-6">
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-4">
                    <p className="text-[10px] text-blue-700 font-black leading-tight uppercase tracking-widest">
                       Temporary Password: <span className="underline select-all font-black">password123</span>
                    </p>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                    <input required type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm" placeholder="Jane Doe" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                    <input required type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all placeholder:text-slate-400 shadow-sm" placeholder={`jane@${config.type}.com`} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Authorization Role</label>
                    <select required value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all shadow-sm appearance-none">
                       {config.roles?.map(role => (
                         <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                       ))}
                    </select>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-slate-600 transition-all">Cancel</button>
                    <button type="submit" className="flex-2 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98]">Confirm {b.staffUnit}</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
