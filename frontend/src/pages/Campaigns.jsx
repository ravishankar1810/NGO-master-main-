import React, { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkedAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', category: '' });

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        let query = '/campaigns?status=active';
        if (filters.city) query += `&city=${filters.city}`;
        if (filters.category) query += `&category=${filters.category}`;
        
        const res = await api.get(query);
        if (res.data.success) {
          setCampaigns(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching campaigns', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce simple effect
    const timeout = setTimeout(fetchCampaigns, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up flex-grow">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Discover Campaigns</h1>
          <p className="text-lg text-gray-500 mt-2 max-w-2xl">Find verified initiatives happening near you and across India. Every contribution counts.</p>
        </div>
        <Link to="/map" className="whitespace-nowrap flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition-all font-semibold hover:-translate-y-0.5">
          <FaMapMarkedAlt size={18} /> Explore on Map
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-4 top-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by City (e.g. Mumbai, Delhi)..." 
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <select 
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="md:w-64 px-4 py-3.5 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer bg-white font-semibold text-gray-700"
        >
          <option value="">All Categories</option>
          <option value="education">Education</option>
          <option value="food">Food & Nutrition</option>
          <option value="health">Healthcare</option>
          <option value="disaster">Disaster Relief</option>
          <option value="environment">Environment</option>
          <option value="women">Women Empowerment</option>
          <option value="child">Child Welfare</option>
          <option value="animal">Animal Welfare</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500 text-lg">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500 text-lg">No active campaigns matched your search.</div>
        ) : campaigns.map(camp => (
          <div key={camp._id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group">
            <div className="overflow-hidden relative">
              <img src={camp.coverImage || '/asset/img1.png'} loading="lazy" alt={camp.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {camp.category && (
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#004B8D] uppercase tracking-wider shadow-sm">
                  {camp.category}
                </span>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">{camp.title}</h3>
              <p className="text-sm text-gray-500 mb-6 flex items-center">
                <span className="truncate">by {camp.ngoId?.name || 'Verified NGO'}</span>
                {camp.ngoId?.isVerified && <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 flex-shrink-0">✓ VERIFIED</span>}
              </p>
              
              <div className="mt-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-800 text-base">₹{(camp.raisedAmount || 0).toLocaleString()}</span>
                  <span className="text-gray-500 font-medium text-xs self-end mb-0.5">of ₹{camp.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(((camp.raisedAmount || 0)/camp.targetAmount)*100, 100)}%` }}></div>
                </div>
                <Link to={`/campaign/${camp._id}`} className="w-full block text-center bg-gray-50 hover:bg-[#004B8D] border border-gray-200 hover:border-transparent text-gray-700 hover:text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/25">
                  View Details & Donate
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
