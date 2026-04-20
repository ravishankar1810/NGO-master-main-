import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaHandsHelping, FaClock, FaMapMarkerAlt, FaExpand, FaHeart } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function NGOItemDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', recipients: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimMessage, setClaimMessage] = useState('');

  const fetchListings = async () => {
    try {
      const { category, recipients } = filter;
      const res = await api.get(`/item-listings?category=${category}&recipients=${recipients}`);
      if (res.data.success) setListings(res.data.data);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // 30s Polling for "Live Feed"
    const interval = setInterval(fetchListings, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleClaim = async () => {
    if (!claimMessage.trim()) return toast.warn("Please introduce yourself to the donor");
    try {
      const res = await api.post(`/item-listings/${selectedItem._id}/claim`, { claimMessage });
      if (res.data.success) {
        toast.success("Claimed! The donor will be notified. 🎉");
        setIsModalOpen(false);
        setSelectedItem(null);
        setClaimMessage('');
        fetchListings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to claim");
    }
  };

  const getUrgentClass = (cat) => {
    return ['food', 'medicine'].includes(cat) ? 'border-l-8 border-donor-amber bg-donor-amber-light/10' : '';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Community Feed</h1>
          <p className="text-slate-400 font-medium mt-2">New donations from local heroes, updated live.</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <select 
             className="px-6 py-3 bg-slate-50 rounded-xl text-xs font-bold outline-none border-2 border-transparent focus:border-donor-green/20"
             onChange={(e) => setFilter({ ...filter, category: e.target.value })}
           >
             <option value="">All Categories</option>
             {['food', 'clothes', 'books', 'medicine', 'toys', 'electronics', 'furniture'].map(c => <option key={c} value={c}>{c}</option>)}
           </select>
           <select 
             className="px-6 py-3 bg-slate-50 rounded-xl text-xs font-bold outline-none border-2 border-transparent focus:border-donor-green/20"
             onChange={(e) => setFilter({ ...filter, recipients: e.target.value })}
           >
              <option value="">All Recipients</option>
              {['children', 'elderly', 'women', 'homeless', 'flood victims', 'migrants'].map(r => <option key={r} value={r}>{r}</option>)}
           </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-white rounded-[2rem] animate-pulse border border-slate-100"></div>)
        ) : listings.length > 0 ? (
          listings.map(item => (
            <div 
              key={item._id} 
              className={`bg-white rounded-[2rem] p-8 border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col ${getUrgentClass(item.category)}`}
            >
              <div className="flex justify-between items-start mb-6">
                 <div className="flex flex-col gap-2">
                    <span className="px-3 py-1 bg-donor-green/10 text-donor-green text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                       <FaClock /> {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-black text-slate-800 tabular-nums">{item.quantity}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Quantity</p>
                 </div>
              </div>

              <div className="mb-8 flex-1">
                 <p className="text-lg font-bold text-slate-900 leading-tight mb-4 italic group-hover:not-italic transition-all">
                   "{item.aiPrompt}"
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {item.recipients.map(r => (
                      <span key={r} className="text-[9px] font-black bg-slate-50 text-slate-400 px-2.5 py-1 rounded-full border border-slate-100">
                        {r}
                      </span>
                    ))}
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                 <div className="flex items-center gap-2 text-slate-400">
                    <FaMapMarkerAlt size={12} className="text-donor-amber" />
                    <span className="text-xs font-bold">{item.city}</span>
                 </div>
                 <button 
                   onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}
                   className="bg-donor-green hover:bg-donor-green/90 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-donor-green/10 transition-all active:scale-95 flex items-center gap-2"
                 >
                   Claim <FaHandsHelping />
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-bold">The feed is quiet right now. Check back soon for new donations!</p>
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-10 space-y-6">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Claim this Donation</h2>
                  <p className="text-slate-500 text-sm">Introduce your NGO and explain how you'll use these items.</p>
               </div>

               <div className="p-5 bg-donor-amber-light/30 rounded-2xl border border-donor-amber/10">
                  <p className="text-xs font-black text-donor-amber uppercase tracking-widest mb-2">Listing Detail</p>
                  <p className="text-slate-800 font-bold italic">"{selectedItem.aiPrompt}"</p>
               </div>

               <textarea 
                 className="w-full bg-slate-50 border-2 border-transparent focus:border-donor-green/20 focus:bg-white rounded-2xl p-6 text-sm font-medium outline-none h-32"
                 placeholder="Namaste! We are [NGO Name], we work with..."
                 value={claimMessage}
                 onChange={(e) => setClaimMessage(e.target.value)}
               />

               <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    onClick={() => { setIsModalOpen(false); setSelectedItem(null); }}
                    className="py-4 bg-slate-50 text-slate-400 rounded-xl font-bold hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleClaim}
                    className="py-4 bg-donor-green text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    Send Claim Request <FaHeart />
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
