import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaArrowRight, FaMagic, FaCopy, FaUndo, FaCheckCircle } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: 'clothes',
    quantity: '',
    description: '',
    recipients: [],
    tone: 'warm',
    pickupInfo: '',
    city: ''
  });
  const [aiResult, setAiResult] = useState(null);

  const categories = ['food', 'clothes', 'books', 'medicine', 'toys', 'electronics', 'furniture'];
  const recipientOptions = ['children', 'elderly', 'women', 'homeless', 'flood victims', 'migrants', 'anyone in need'];
  const tones = ['warm', 'urgent', 'simple', 'formal'];

  const handleCheckboxChange = (option) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(option)
        ? prev.recipients.filter(r => r !== option)
        : [...prev.recipients, option]
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/item-listings', formData);
      if (res.data.success) {
        setAiResult(res.data.data);
        setStep(2);
        toast.success("Listing created with AI magic! ✨");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard!");
  };

  if (step === 2 && aiResult) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-in-up">
        <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-donor-green-light/20 text-center">
          <div className="w-20 h-20 bg-donor-green-light/10 rounded-full flex items-center justify-center mx-auto mb-6 text-donor-green">
            <FaCheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Listing Published!</h1>
          <p className="text-slate-500 mb-10">Your AI-generated prompt is now visible to verified NGOs.</p>

          <div className="space-y-6 text-left">
            <div className="p-6 bg-donor-amber-light/30 rounded-2xl border border-donor-amber/10 relative">
              <span className="absolute -top-3 left-6 bg-donor-amber text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                AI Prompt
              </span>
              <p className="text-slate-700 font-medium leading-relaxed italic">{aiResult.aiPrompt}</p>
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => copyToClipboard(aiResult.aiPrompt)}
                  className="p-2 text-slate-400 hover:text-donor-amber transition-colors" title="Copy"
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative">
              <span className="absolute -top-3 left-6 bg-slate-400 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                NGO Note
              </span>
              <p className="text-slate-600 text-sm">{aiResult.ngoNote}</p>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <button 
              onClick={() => navigate('/donor-history')}
              className="flex-1 py-4 bg-donor-green text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
            >
              View My History
            </button>
            <button 
              onClick={() => setStep(1)}
              className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Create New
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in-up">
      <div className="mb-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-donor-green text-white rounded-2xl flex items-center justify-center shadow-lg shadow-donor-green/20">
          <FaBox size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Post a Donation</h1>
          <p className="text-slate-400 font-medium">Items that bring comfort to those who need it most.</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Item Category</label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: c })}
                  className={`py-3 px-4 rounded-xl text-xs font-bold capitalize border-2 transition-all ${
                    formData.category === c ? 'bg-donor-green text-white border-donor-green' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Quantity & Description</label>
            <input 
              type="text" 
              placeholder="e.g. 5 boxes of toys" 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-donor-green/20 focus:bg-white rounded-xl py-3 px-4 text-sm font-bold outline-none mb-3"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
            <textarea 
              placeholder="Describe the condition and contents..." 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-donor-green/20 focus:bg-white rounded-xl p-4 text-sm font-medium outline-none h-32"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Intended Recipients</label>
            <div className="flex flex-wrap gap-2">
              {recipientOptions.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleCheckboxChange(r)}
                  className={`py-2 px-4 rounded-full text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                    formData.recipients.includes(r) ? 'bg-donor-amber text-white border-donor-amber' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Tone of Prompt</label>
              <select 
                className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3 px-4 text-xs font-bold outline-none capitalize"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              >
                {tones.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Your City</label>
              <input 
                type="text" 
                placeholder="e.g. Mumbai" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-xl py-3 px-4 text-xs font-bold outline-none"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Pickup Availability</label>
             <input 
              type="text" 
              placeholder="e.g. Weekends, 10am - 4pm" 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-donor-green/20 focus:bg-white rounded-xl py-3 px-4 text-sm font-bold outline-none"
              value={formData.pickupInfo}
              onChange={(e) => setFormData({ ...formData, pickupInfo: e.target.value })}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0F172A] hover:bg-donor-green text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <FaMagic /> Generate Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
