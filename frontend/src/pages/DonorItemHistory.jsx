import React, { useState, useEffect, useMemo } from 'react';
import { FaHistory, FaCheckCircle, FaClock, FaExclamationTriangle, FaTrash, FaEdit } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function DonorItemHistory() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/item-listings/my');
      if (res.data.success) setListings(res.data.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const stats = useMemo(() => {
    const total = listings.length;
    const claimed = listings.filter(l => ['Claimed', 'Accepted', 'Completed'].includes(l.status)).length;
    const categories = listings.map(l => l.category);
    const mostCommonCat = categories.sort((a,b) =>
      categories.filter(v => v===a).length - categories.filter(v => v===b).length
    ).pop() || 'None';

    return { total, claimed, mostCommonCat };
  }, [listings]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-donor-green/10 text-donor-green border-donor-green/20';
      case 'Claimed': return 'bg-donor-amber/10 text-donor-amber border-donor-amber/20';
      case 'Accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Expired': return 'bg-slate-100 text-slate-400 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const handleRespond = async (id, decision) => {
    try {
      const res = await api.post(`/item-listings/${id}/respond`, { decision });
      if (res.data.success) {
        toast.success(`Claim ${decision.toLowerCase()} successfully`);
        fetchHistory();
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <FaHistory className="text-donor-green" /> Donation Ledger
          </h1>
          <p className="text-slate-400 font-medium mt-2">Tracking every item that finds a new home.</p>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Donated</span>
            <span className="text-2xl font-black text-donor-green">{stats.total}</span>
          </div>
          <div className="px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Claimed</span>
            <span className="text-2xl font-black text-donor-amber">{stats.claimed}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100"></div>)
        ) : listings.length > 0 ? (
          listings.map(item => (
            <div key={item._id} className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-donor-green/20 transition-all shadow-sm group">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest tabular-nums">
                      Posted {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{item.quantity} {item.category}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 italic">"{item.aiPrompt}"</p>
                </div>

                <div className="flex gap-4 items-center">
                  {item.status === 'Claimed' && (
                    <div className="bg-donor-amber-light/20 p-4 rounded-2xl border border-donor-amber/10 flex flex-col gap-2">
                       <p className="text-[10px] font-black text-donor-amber uppercase tracking-widest">Claimed by <span className="text-slate-800">{item.claimedBy?.name}</span></p>
                       <p className="text-xs text-slate-600 line-clamp-1">"{item.claimMessage}"</p>
                       <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => handleRespond(item._id, 'Accepted')}
                            className="text-[10px] font-bold bg-donor-green text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRespond(item._id, 'Declined')}
                            className="text-[10px] font-bold bg-white text-slate-500 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all"
                          >
                            Decline
                          </button>
                       </div>
                    </div>
                  )}

                  {item.status === 'Accepted' && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Coordination</p>
                       <p className="text-xs font-bold text-slate-800">{item.claimedBy?.email}</p>
                       <p className="text-xs font-bold text-slate-800">{item.claimedBy?.phone}</p>
                    </div>
                  )}

                  {item.status === 'Available' && (
                    <div className="flex gap-2">
                       <button className="p-3 text-slate-300 hover:text-donor-green transition-colors"><FaEdit /></button>
                       <button className="p-3 text-slate-300 hover:text-red-400 transition-colors"><FaTrash /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-bold">No donation history found. Start your legacy today!</p>
          </div>
        )}
      </div>
    </div>
  );
}
