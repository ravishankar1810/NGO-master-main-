import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaFilter, FaHeart, FaHistory, FaHandHoldingHeart, FaLeaf, FaGlobeAmericas, FaShieldAlt, FaStar, FaArrowRight, FaChartPie, FaChartLine } from 'react-icons/fa';
import { HiLightningBolt, HiSparkles } from 'react-icons/hi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import api from '../utils/api';
import DonationModal from '../componants/DonationModal';

const CHART_COLORS = ['#004B8D', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DonorDashboard() {
  const [search, setSearch] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Urgent Causes');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryFilters, setShowCategoryFilters] = useState(false);
  const [historyTab, setHistoryTab] = useState('Timeline');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, histRes] = await Promise.all([
          api.get('/campaigns?status=active'),
          api.get('/donations/my')
        ]);
        if (campRes.data.success) setCampaigns(campRes.data.data);
        if (histRes.data.success) setHistory(histRes.data.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const totalImpact = useMemo(() => history.reduce((s, h) => s + h.amount, 0), [history]);

  // Data processing for charts
  const statsData = useMemo(() => {
    // 1. Distribution by Category
    const categoryCounts = history.reduce((acc, curr) => {
        const cat = curr.campaignId?.category || 'general';
        acc[cat] = (acc[cat] || 0) + curr.amount;
        return acc;
    }, {});
    
    const pieData = Object.keys(categoryCounts).map(name => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value: categoryCounts[name] 
    }));

    // 2. Trend over time (Last 7 days with consistent keys)
    const trendCounts = history.reduce((acc, curr) => {
        const d = new Date(curr.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        acc[key] = (acc[key] || 0) + curr.amount;
        return acc;
    }, {});

    const lineData = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount: trendCounts[key] || 0
        };
    });

    return { pieData, lineData };
  }, [history]);

  const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6'];

  const filteredCampaigns = useMemo(() => {
    let result = campaigns.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                             c.category?.toLowerCase().includes(search.toLowerCase()) ||
                             c.ngoId?.name.toLowerCase().includes(search.toLowerCase());
        
        const matchesCategory = selectedCategory === '' || c.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Apply Sorting based on activeFilter
    if (activeFilter === 'Urgent Causes') {
      result.sort((a, b) => ((b.raisedAmount || 0) / b.targetAmount) - ((a.raisedAmount || 0) / a.targetAmount));
    } else if (activeFilter === 'High Impact') {
      result.sort((a, b) => (b.donorCount || 0) - (a.donorCount || 0));
    } else if (activeFilter === 'New Arrivals') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [campaigns, search, activeFilter, selectedCategory]);

  const openDonateModal = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFEFF] animate-fade-in-up pb-20">
      
      {/* Dynamic Impact Hero */}
      <div className="relative min-h-[500px] md:h-[580px] w-full overflow-hidden flex items-center bg-[#001529] py-20 md:py-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#003A66] via-[#001529] to-[#064E3B]"></div>
          {/* Animated Background Elements */}
          <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 items-center gap-16 pb-20 md:pb-24">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest">
                    <HiSparkles className="animate-spin-slow" /> Personal Impact Score: {Math.floor(totalImpact / 100)}
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
                    Be the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">Unsung Hero.</span>
                </h1>
                <p className="text-blue-100/70 text-lg font-medium leading-relaxed max-w-lg mb-4">
                    Your contribution today transforms lives tomorrow. Join <span className="text-white font-bold">5,000+ donors</span> in creating lasting global change.
                </p>
                <div className="flex flex-wrap gap-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex-1 min-w-[160px]">
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block mb-1">Total Contribution</span>
                        <div className="text-3xl font-black text-white tabular-nums">₹{totalImpact.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex-1 min-w-[160px]">
                        <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest block mb-1">Lives Touched</span>
                        <div className="text-3xl font-black text-white tabular-nums">{history.length * 3}+</div>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-3xl opacity-50"></div>
                <div className="relative bg-white/10 backdrop-blur-3xl border border-white/20 p-10 rounded-[50px] shadow-2xl glass-effect space-y-8">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-3">
                         <FaLeaf size={28} />
                      </div>
                      <div>
                        <h3 className="text-white font-black text-xl">Transparency First</h3>
                        <p className="text-white/60 text-sm font-medium">Real-time tracking for every rupee.</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between text-xs font-bold text-white/50 uppercase tracking-widest">
                         <span>Community Trust</span>
                         <span>98%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 w-[98%]"></div>
                      </div>
                   </div>
                </div>
            </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 space-y-12">
        
        {/* Modern Search & Filter */}
        <div className="bg-white rounded-[32px] p-5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col lg:flex-row items-center gap-5">
            <div className="relative flex-1 w-full">
                <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search campaigns, causes, or NGOs..." 
                    className="w-full pl-14 pr-8 py-5 rounded-[24px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-100 transition-all outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                />
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
                <button 
                    onClick={() => setShowCategoryFilters(!showCategoryFilters)}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-5 rounded-[24px] border-2 transition-all font-black text-xs uppercase tracking-widest ${showCategoryFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-slate-100'}`}
                >
                    <FaFilter /> Filters
                </button>
                <select 
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="flex-1 lg:flex-none px-8 py-5 rounded-[24px] bg-[#0F172A] text-white font-black text-xs uppercase tracking-widest outline-none shadow-xl shadow-slate-900/10 active:scale-95 transition-all cursor-pointer"
                >
                    <option value="Urgent Causes">Urgent Causes</option>
                    <option value="High Impact">High Impact</option>
                    <option value="New Arrivals">New Arrivals</option>
                </select>
            </div>
        </div>

        {/* Category Filter Panel */}
        {showCategoryFilters && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
                <button 
                   onClick={() => setSelectedCategory('')}
                   className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategory === '' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'}`}
                >
                   All Causes
                </button>
                {['education', 'food', 'health', 'disaster', 'environment', 'women', 'child', 'animal'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        )}

        {/* Featured Campaigns */}
        <div>
            <div className="flex justify-between items-end mb-10">
                <div>
                   <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                      <HiLightningBolt /> {selectedCategory ? `Active in ${selectedCategory}` : 'Active Now'}
                   </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Support a Cause</h2>
                </div>
                <button 
                  onClick={() => {setSearch(''); setSelectedCategory(''); setActiveFilter('Urgent Causes');}}
                  className="px-6 py-2.5 rounded-full border-2 border-slate-100 text-slate-400 font-bold text-sm hover:border-emerald-500 hover:text-emerald-500 transition-all"
                >
                  Clear All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? (
                    [1,2,3].map(i => (
                        <div key={i} className="bg-white h-[450px] rounded-[40px] animate-pulse border border-slate-100"></div>
                    ))
                ) : filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map(camp => {
                        const progress = Math.min(((camp.raisedAmount || 0) / camp.targetAmount) * 100, 100);
                        return (
                            <div key={camp._id} className="group bg-white rounded-[40px] border border-slate-100 hover:border-emerald-100 shadow-sm hover:shadow-[0_40px_70px_-20px_rgba(16,185,129,0.12)] transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col">
                                <div className="h-64 relative overflow-hidden">
                                    <img src={camp.coverImage || `/asset/img${Math.floor(Math.random()*4)+1}.png`} alt={camp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60"></div>
                                    <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-emerald-600 uppercase tracking-widest shadow-xl">
                                        {camp.category || 'Humanitarian'}
                                    </div>
                                    <div className="absolute bottom-5 left-6 right-6 flex justify-between items-center">
                                       <div className="flex -space-x-2">
                                          {[1,2,3].map(i => (
                                             <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?u=${camp._id}${i}`} alt="donor" />
                                             </div>
                                          ))}
                                          <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">+{camp.donorCount || 0}</div>
                                       </div>
                                       <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Verified NGO</span>
                                    </div>
                                </div>
                                
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight line-clamp-2">{camp.title}</h3>
                                    <p className="text-sm font-bold text-slate-400 mb-8 italic">by <span className="text-emerald-600 not-italic hover:underline cursor-pointer">{camp.ngoId?.name}</span></p>
                                    
                                    <div className="mt-auto space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                                <span className="text-emerald-500">Raised: ₹{(camp.raisedAmount || 0).toLocaleString()}</span>
                                                <span className="text-slate-300">Goal: ₹{camp.targetAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-[3px]">
                                                <div className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => openDonateModal(camp)}
                                            className="w-full bg-[#001529] hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[24px] transition-all duration-300 shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3 group"
                                        >
                                            <FaHeart className="group-hover:scale-125 transition-transform" /> Contribute Impact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="col-span-full py-32 bg-slate-50 rounded-[50px] border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl text-slate-200">
                            <FaSearch size={32} />
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No campaigns found in this galaxy.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Impact History Section */}
        <div className="bg-white p-12 rounded-[50px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.05)] border border-slate-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                           <FaHistory size={20} />
                        </div>
                        Impact Roadmap
                    </h2>
                    <p className="text-slate-400 font-medium text-sm mt-2">Your journey of making the world a better place.</p>
                </div>
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setHistoryTab('Timeline')}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${historyTab === 'Timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Timeline
                    </button>
                    <button 
                        onClick={() => setHistoryTab('Stats')}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${historyTab === 'Stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Stats
                    </button>
                </div>
            </div>
            
            {historyTab === 'Timeline' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Event Log</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Project</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Amount</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {loading ? (
                                <tr><td colSpan="4" className="px-8 py-20 text-center text-sm font-bold text-slate-300 animate-pulse">Retrieving your legacy...</td></tr>
                            ) : history.length > 0 ? (
                                history.map(row => (
                                    <tr key={row._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-8">
                                            <div className="text-sm font-black text-slate-800 uppercase tabular-nums mb-1">TXN-{row._id.slice(-6).toUpperCase()}</div>
                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(row.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="text-sm font-bold text-slate-900 truncate max-w-[300px] mb-1">{row.campaignId?.title || 'General Fund'}</div>
                                            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                                               <FaShieldAlt size={10} /> {row.ngoId?.name}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-right">
                                            <div className="text-xl font-black text-slate-900 tracking-tight">₹{row.amount.toLocaleString()}</div>
                                        </td>
                                        <td className="px-8 py-8">
                                           <div className="flex justify-center">
                                              <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-full border ${row.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                  {row.status}
                                              </span>
                                           </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                   <td colSpan="4" className="px-8 py-32 text-center">
                                      <div className="flex flex-col items-center">
                                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                                            <FaHistory size={24} />
                                         </div>
                                         <p className="text-slate-400 font-bold italic">Your impact story starts here. Make your first donation today.</p>
                                      </div>
                                   </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
                    {/* Category Pie Chart */}
                    <div className="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-3">
                            <FaChartPie className="text-emerald-500" /> Cause Distribution
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statsData.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statsData.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-6">
                            {statsData.pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trend Area Chart */}
                    <div className="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-3">
                            <FaChartLine className="text-blue-500" /> Donation Trend
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={statsData.lineData}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#004B8D" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#004B8D" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 900, fill: '#64748B'}} 
                                        dy={10}
                                        interval={0}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 900, fill: '#64748B'}} 
                                        tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#004B8D" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      <DonationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
      />

    </div>
  );
}

