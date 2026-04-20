import React from 'react';
import { FaTimes, FaGlobeAmericas, FaUsers, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function ManageCampaignsModal({ isOpen, onClose, campaigns, onEdit }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl p-8 my-8 md:my-0 flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
        >
          <FaTimes size={16} />
        </button>
        
        <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <FaGlobeAmericas className="text-indigo-600" /> All Operations
            </h2>
            <p className="text-slate-500 font-medium mt-1">Comprehensive view of your past and active campaigns</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 rounded-2xl border border-slate-100">
            {campaigns && campaigns.length > 0 ? (
                <div className="divide-y divide-slate-100">
                    {campaigns.map(camp => {
                        const progress = Math.min(((camp.raisedAmount || 0) / camp.targetAmount) * 100, 100);
                        const isGoalReached = progress >= 100;
                        return (
                            <div key={camp._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex-1 w-full">
                                    <h4 className="font-black text-lg text-slate-800 mb-1">{camp.title}</h4>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">{camp.category || 'General'}</span>
                                        <span>• Created: {new Date(camp.createdAt).toLocaleDateString()}</span>
                                        <span className={`px-2 py-0.5 rounded uppercase tracking-wider ${camp.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{camp.status || 'Active'}</span>
                                    </div>
                                </div>
                                
                                <div className="w-full md:w-64">
                                    <div className="flex justify-between text-xs font-black mb-1.5 uppercase tracking-wider">
                                        <span className="text-slate-500">₹{(camp.raisedAmount || 0).toLocaleString()}</span>
                                        <span className={isGoalReached ? 'text-emerald-500' : 'text-indigo-600'}>{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${isGoalReached ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1.5 uppercase">
                                        <span>Target: ₹{camp.targetAmount.toLocaleString()}</span>
                                        <span className="flex items-center gap-1"><FaUsers/> {camp.donorCount || 0}</span>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex gap-2 justify-end">
                                    <button 
                                        onClick={() => { onEdit(camp); onClose(); }} 
                                        className="px-4 py-2 border-2 border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 font-bold text-xs rounded-xl transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/campaign/${camp._id}`)} 
                                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs rounded-xl shadow-md transition-all"
                                    >
                                        View Live
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="py-20 text-center">
                    <p className="text-slate-400 font-bold">No campaigns found.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
