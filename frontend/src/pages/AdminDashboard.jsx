import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaCheck, FaTimes, FaChartPie, FaBuilding, FaUsers } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, ngosRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/ngos')
      ]);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (ngosRes.data.success) setPendingNGOs(ngosRes.data.data);
    } catch (error) {
      console.error('Failed fetching admin data', error);
      toast.error('Unauthorized or Server Error fetching Admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (id, action) => {
    try {
      const res = await api.patch(`/admin/ngo/${id}/verify`, { action, note: `Admin ${action}ed` });
      if (res.data.success) {
        toast.success(`NGO ${action}ed successfully`);
        fetchAdminData();
      }
    } catch (error) {
      toast.error('Failed to update NGO status');
    }
  };

  if (loading) return <div className="py-20 text-center">Loading God Mode...</div>;
  if (!analytics) return <div className="py-20 text-center text-red-500 font-bold">Access Denied. Admin Privileges Required.</div>;

  // Mock chart data derived structurally if backend doesn't send time-series yet
  const chartData = [
    { name: 'Jan', donations: 4000 },
    { name: 'Feb', donations: 3000 },
    { name: 'Mar', donations: 2000 },
    { name: 'Apr', donations: 2780 },
    { name: 'May', donations: 1890 },
    { name: 'Jun', donations: 2390 },
    { name: 'Jul', donations: 3490 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6 mb-8">
        <div className="p-3 bg-red-100 rounded-2xl text-red-600">
          <FaShieldAlt size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Super Admin Portal</h1>
          <p className="text-gray-500 font-medium">Platform-wide overview, verification queue, and master analytics.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <FaBuilding className="text-blue-500 mb-3" size={24} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total NGOs</p>
          <p className="text-3xl font-extrabold text-gray-900">{analytics.totalNGOs}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <FaUsers className="text-pink-500 mb-3" size={24} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Donors</p>
          <p className="text-3xl font-extrabold text-gray-900">{analytics.totalDonors}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-br from-[#004B8D] to-indigo-700 text-white md:col-span-2">
          <FaChartPie className="text-indigo-200 mb-3" size={24} />
          <p className="text-sm font-bold text-indigo-100 uppercase tracking-wider mb-1">Total Volume Processed</p>
          <p className="text-4xl font-extrabold">₹{analytics.totalDonations.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Verification Queue */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
            <span>Pending NGO Approvals</span>
            <span className="bg-amber-100 text-amber-700 py-1 px-3 rounded-full text-xs font-bold">{pendingNGOs.length} waiting</span>
          </h2>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {pendingNGOs.length === 0 ? (
              <p className="text-center text-gray-500 py-6 font-medium">No NGOs waiting for approval.</p>
            ) : pendingNGOs.map(ngo => (
              <div key={ngo._id} className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50 transition-colors flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">{ngo.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{ngo.email} • {ngo.phone}</p>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold uppercase">Reg: {ngo.registrationNumber || 'PENDING DOCS'}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleVerify(ngo._id, 'reject')} className="h-10 w-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                    <FaTimes />
                  </button>
                  <button onClick={() => handleVerify(ngo._id, 'approve')} className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-500/20">
                    <FaCheck />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Donation Velocity (YTD)</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `₹${value}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  cursor={{stroke: '#f3f4f6', strokeWidth: 2}}
                />
                <Line type="monotone" dataKey="donations" stroke="#004B8D" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 8, stroke: '#10B981', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
