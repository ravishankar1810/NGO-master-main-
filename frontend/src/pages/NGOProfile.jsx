import React, { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaExclamationCircle, FaUser, FaMapMarkerAlt, FaBriefcase, FaCertificate } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function NGOProfile() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newNeed, setNewNeed] = useState({ category: 'food', description: '', urgencyFlag: false });

  const categories = ['food', 'clothes', 'books', 'medicine', 'toys', 'electronics', 'furniture'];

  const fetchNeeds = async () => {
    try {
      const res = await api.get('/ngo-needs');
      // Filter for this NGO specifically if needed, but the requirements say "Donors can browse NGO needs"
      // and NGOs can "post specific donation requests".
      // Let's fetch ALL for now and filter logically or just show the NGO's own needs for management.
      const ownNeeds = res.data.data.filter(n => n.ngoId._id === user.id);
      setNeeds(ownNeeds);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNeeds();
  }, [user]);

  const handleAddNeed = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/ngo-needs', newNeed);
      if (res.data.success) {
        toast.success("Need posted successfully!");
        setNeeds([res.data.data, ...needs]);
        setIsAdding(false);
        setNewNeed({ category: 'food', description: '', urgencyFlag: false });
      }
    } catch (error) {
      toast.error("Failed to post need");
    }
  };

  const handleFulfill = async (id) => {
    try {
      const res = await api.patch(`/ngo-needs/${id}/fulfill`);
      if (res.data.success) {
        toast.success("Marked as fulfilled");
        fetchNeeds();
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="grid lg:grid-cols-3 gap-12">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-donor-green/5"></div>
              <div className="relative z-10">
                 <div className="w-24 h-24 bg-white rounded-3xl mx-auto shadow-2xl flex items-center justify-center text-donor-green border-4 border-white mb-6">
                    <FaUser size={40} />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 mb-1">{user?.name}</h2>
                 <div className="flex items-center justify-center gap-2 text-donor-green font-black text-[10px] uppercase tracking-widest mb-4">
                    <FaCertificate /> Verified NGO
                 </div>
                 <div className="space-y-4 pt-6 border-t border-slate-50 text-left">
                    <div className="flex items-center gap-3 text-slate-500 font-medium">
                       <FaMapMarkerAlt className="text-donor-amber" /> {user?.city || 'India'}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-medium">
                       <FaBriefcase className="text-donor-amber" /> Humanitarian Aid
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Needs Management */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex justify-between items-center">
              <div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Needs</h2>
                 <p className="text-slate-400 font-medium">Requests for the community to fulfill.</p>
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-[#0F172A] hover:bg-donor-green text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2"
              >
                <FaPlus /> Post a Need
              </button>
           </div>

           {isAdding && (
             <form onSubmit={handleAddNeed} className="bg-white p-8 rounded-[2rem] border-2 border-donor-green/20 shadow-xl animate-scale-in space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                      <select 
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-donor-green/20 rounded-xl py-3 px-4 text-xs font-bold outline-none"
                        value={newNeed.category}
                        onChange={(e) => setNewNeed({ ...newNeed, category: e.target.value })}
                      >
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="flex items-end pb-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                         <input 
                           type="checkbox" 
                           className="w-5 h-5 accent-donor-amber"
                           checked={newNeed.urgencyFlag}
                           onChange={(e) => setNewNeed({ ...newNeed, urgencyFlag: e.target.checked })}
                         />
                         <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Urgent Request</span>
                      </label>
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Describe the Need</label>
                   <textarea 
                     className="w-full bg-slate-50 border-2 border-transparent focus:border-donor-green/20 focus:bg-white rounded-xl p-4 text-sm font-medium outline-none h-32"
                     placeholder="e.g. We require winter blankets for 50 families..."
                     value={newNeed.description}
                     onChange={(e) => setNewNeed({ ...newNeed, description: e.target.value })}
                     required
                   />
                </div>
                <div className="flex gap-4">
                   <button 
                    type="submit"
                    className="flex-1 bg-donor-green text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-donor-green/10"
                   >
                     Publish Request
                   </button>
                   <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-8 bg-slate-50 text-slate-400 rounded-xl font-bold hover:bg-slate-100 transition-all"
                   >
                     Cancel
                   </button>
                </div>
             </form>
           )}

           <div className="grid gap-6">
              {loading ? (
                <div className="h-32 bg-white rounded-3xl animate-pulse"></div>
              ) : needs.length > 0 ? (
                needs.map(need => (
                  <div key={need._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg ${need.urgencyFlag ? 'bg-donor-amber text-white shadow-donor-amber/20' : 'bg-donor-green/10 text-donor-green shadow-donor-green/10'}`}>
                           {need.urgencyFlag ? <FaExclamationCircle /> : <FaCheck />}
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{need.category}</span>
                              {need.urgencyFlag && (
                                <span className="bg-donor-amber/10 text-donor-amber text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Urgent</span>
                              )}
                           </div>
                           <p className="text-slate-800 font-bold">{need.description}</p>
                           <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight mt-1">Status: {need.status}</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => handleFulfill(need._id)}
                       title="Mark as Fulfilled"
                       className="p-4 text-slate-200 hover:text-donor-green hover:bg-donor-green/5 rounded-full transition-all"
                     >
                       <FaCheck size={20} />
                     </button>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold italic">No active needs. Post one to let the community help!</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
