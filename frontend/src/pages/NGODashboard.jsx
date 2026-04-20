import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaChartLine, FaUsers, FaWallet, FaCog, FaBullhorn, FaHistory, FaHandHoldingHeart, FaChevronRight } from 'react-icons/fa';
import { HiTrendingUp, HiDocumentReport } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CreateCampaignModal from '../componants/CreateCampaignModal';
import ManageCampaignsModal from '../componants/ManageCampaignsModal';
import StrategyInsightsModal from '../componants/StrategyInsightsModal';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function NGODashboard() {
  const { user } = useAuth();
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [itemListings, setItemListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [editCampaignData, setEditCampaignData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const userId = user.id || user._id;
      if (user && userId) {
        const [campRes, donRes, itemRes] = await Promise.all([
          api.get(`/campaigns?ngoId=${userId}`),
          api.get('/donations/ngo'),
          api.get('/item-listings') // Add this to fetch community feed items
        ]);
        
        if (campRes.data.success) {
          setActiveCampaigns(campRes.data.data);
        }
        if (donRes.data.success) {
          setRecentDonations(donRes.data.data);
        }
        if (itemRes.data.success) {
          setItemListings(itemRes.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load NGO dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateSuccess = () => {
    fetchDashboardData();
  };

  const totalFunds = activeCampaigns.reduce((sum, camp) => sum + (camp.raisedAmount || 0), 0);
  const totalDonors = activeCampaigns.reduce((sum, camp) => sum + (camp.donorCount || 0), 0);

  // Split into truly active vs completed
  const liveCampaigns = activeCampaigns.filter(c => c.status !== 'completed');
  const completedCampaigns = activeCampaigns.filter(c => c.status === 'completed');

  const handleDownloadReports = () => {
    if (activeCampaigns.length === 0) {
      toast.error("No active campaigns to report on.");
      return;
    }
    
    // Create new PDF instance
    const doc = new jsPDF();
    
    // Add Branding & Title
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text("ServeX Pipeline Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Generated exactly at: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Managed Pipelines: ${activeCampaigns.length}`, 14, 36);
    
    const headers = [["Campaign Title", "Category", "Target (INR)", "Raised (INR)", "Donors", "Status"]];
    const data = activeCampaigns.map(camp => [
      camp.title,
      camp.category || 'General',
      `Rs. ${camp.targetAmount.toLocaleString()}`,
      `Rs. ${(camp.raisedAmount || 0).toLocaleString()}`,
      camp.donorCount || 0,
      camp.status || 'Active'
    ]);

    // Generate advanced table using autotable
    autoTable(doc, {
      startY: 45,
      head: headers,
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate 50
    });

    // Save
    doc.save('servex_campaign_report.pdf');
    toast.success("Operations PDF report downloaded successfully! 📄");
  };

  const handleManageAll = () => {
    setIsManageModalOpen(true);
  };

  const handleOptimizeStrategy = () => {
    setIsStrategyModalOpen(true);
  };

  const handleEdit = (camp) => {
    setEditCampaignData(camp);
    setIsCreateModalOpen(true);
  };

  const analytics = [
    { 
      title: 'Total Impact Value', 
      value: `₹${totalFunds.toLocaleString()}`, 
      icon: <FaWallet className="text-indigo-600" />,
      trend: '+12.5% this month',
      bgColor: 'bg-indigo-50'
    },
    { 
      title: 'Active Campaigns', 
      value: activeCampaigns.length.toString(), 
      icon: <FaBullhorn className="text-amber-600" />,
      trend: '2 closing soon',
      bgColor: 'bg-amber-50'
    },
    { 
      title: 'Global Impact Score', 
      value: totalDonors.toString(), 
      icon: <FaUsers className="text-emerald-600" />,
      trend: `${activeCampaigns.length} Active Campaigns`,
      bgColor: 'bg-emerald-50'
    },
    { 
      title: 'Community Items', 
      value: itemListings.filter(i => i.status === 'Available').length.toString(), 
      icon: <FaHandHoldingHeart className="text-donor-green" />,
      trend: 'Available for claim',
      bgColor: 'bg-donor-green/10'
    },
  ];

  // Placeholder for recent donations

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20">
      
      {/* === FULL DASHBOARD HEADER === */}
      <div className="relative bg-[#0F172A] text-white overflow-hidden px-6 pt-10 pb-12">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">

          {/* Top Row: Welcome + Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                <HiTrendingUp /> NGO Operations Dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-200">{user?.name || 'Partner Org'}</span>
              </h1>
              <p className="text-slate-400 font-medium text-sm">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' · '}
                <span className="text-indigo-300 font-bold">{liveCampaigns.length} Live · {completedCampaigns.length} Completed</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-900/40 transition-all active:scale-95 group"
              >
                <FaPlus className="group-hover:rotate-90 transition-transform" /> Start Campaign
              </button>
              <button onClick={handleManageAll} className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-black text-sm transition-all active:scale-95">
                <FaCog /> Manage All
              </button>
              <button onClick={handleDownloadReports} className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-black text-sm transition-all active:scale-95">
                <HiDocumentReport size={16} /> Reports
              </button>
            </div>
          </div>

          {/* Dashboard Stat Cards embedded in header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md">Live</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-0.5">{stat.value}</h3>
                <p className="text-xs font-semibold text-slate-400 mb-2">{stat.title}</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                  <HiTrendingUp /> {stat.trend}
                </div>
              </div>
            ))}
          </div>




        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Campaign Management Section */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[40px] shadow-sm border border-white p-10 overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <FaBullhorn className="text-indigo-600" /> Active Management
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">Monitoring {liveCampaigns.length} live campaigns</p>
                        </div>
                        <button onClick={handleManageAll} className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">Manage All <FaChevronRight size={10} /></button>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="py-20 text-center animate-pulse flex flex-col items-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full mb-4"></div>
                                <div className="h-4 w-40 bg-slate-100 rounded"></div>
                            </div>
                        ) : liveCampaigns.length === 0 ? (
                            <div className="py-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold">No active campaigns running.</p>
                                <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest">+ Create First Campaign</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {liveCampaigns.map(camp => {
                                    const progress = Math.min(((camp.raisedAmount || 0) / camp.targetAmount) * 100, 100);
                                    return (
                                        <div key={camp._id} className="p-6 bg-[#F8FAFC] rounded-[28px] border border-slate-100/50 hover:border-indigo-100 transition-all hover:bg-white hover:shadow-lg group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">{camp.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{camp.category || 'Humanity'}</span>
                                                        <span className="text-[10px] font-bold text-slate-400">• {camp.donorCount || 0} Donors</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3 mt-6">
                                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                                    <span>Raised: ₹{(camp.raisedAmount || 0).toLocaleString()}</span>
                                                    <span>{progress.toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Completed Campaigns Section */}
                    {completedCampaigns.length > 0 && (
                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <h3 className="text-lg font-black text-slate-700 mb-5 flex items-center gap-2">
                                🏆 <span>Completed Campaigns</span>
                                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{completedCampaigns.length} Fulfilled</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {completedCampaigns.map(camp => (
                                    <div key={camp._id} className="p-6 bg-emerald-50/50 rounded-[28px] border border-emerald-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 line-clamp-1">{camp.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">🏆 Goal Achieved</span>
                                                    <span className="text-[10px] font-bold text-slate-400">• {camp.donorCount || 0} Donors</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                                        </div>
                                        <p className="text-[10px] mt-2 font-bold text-emerald-600">₹{(camp.raisedAmount || 0).toLocaleString()} / ₹{camp.targetAmount?.toLocaleString()} — 100% funded</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Stats & Recent Activity */}
            <div className="space-y-6">
                <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px]"></div>
                    <div className="relative z-10">
                        <FaHandHoldingHeart size={32} className="mb-6 text-indigo-200" />
                        <h2 className="text-xl font-black mb-2 leading-tight">Growth <br/> Potential</h2>
                        <p className="text-indigo-100/80 text-xs font-medium mb-6">Based on your current reach, you could target ₹2M next month.</p>
                        <button onClick={handleOptimizeStrategy} className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform">Optimize Strategy</button>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-white">
                    <h3 className="font-black text-slate-900 mb-6 flex items-center justify-between">
                        Recent Logs <FaHistory className="text-indigo-600" />
                    </h3>
                    <div className="space-y-6">
                        {recentDonations.length === 0 ? (
                            <div className="text-center py-10 italic text-slate-400 text-xs font-medium">
                                No recent activity found.
                            </div>
                        ) : (
                            recentDonations.slice(0, 5).map(act => (
                                <div key={act._id} className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">₹{act.amount} donated by {act.donorId?.name || 'Anonymous'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{new Date(act.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>
      <CreateCampaignModal 
        isOpen={isCreateModalOpen}
        onClose={() => {
            setIsCreateModalOpen(false);
            setEditCampaignData(null);
        }}
        onSuccess={handleCreateSuccess}
        initialData={editCampaignData}
      />
      <ManageCampaignsModal 
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        campaigns={activeCampaigns}
        onEdit={handleEdit}
      />
      <StrategyInsightsModal 
        isOpen={isStrategyModalOpen}
        onClose={() => setIsStrategyModalOpen(false)}
        campaigns={activeCampaigns}
      />

    </div>
  );
}
