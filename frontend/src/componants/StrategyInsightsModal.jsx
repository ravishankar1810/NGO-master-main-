import React, { useState, useEffect } from 'react';
import { FaTimes, FaRobot, FaLightbulb, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function StrategyInsightsModal({ isOpen, onClose, campaigns }) {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setAnalyzing(true);
      const timer = setTimeout(() => setAnalyzing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalRaised = campaigns.reduce((sum, camp) => sum + (camp.raisedAmount || 0), 0);
  const totalTarget = campaigns.reduce((sum, camp) => sum + camp.targetAmount, 0);
  const successRate = totalTarget > 0 ? ((totalRaised / totalTarget) * 100).toFixed(1) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl p-8 overflow-hidden transform transition-all">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
        >
          <FaTimes size={16} />
        </button>
        
        <div className="mb-6 flex items-start gap-4">
            <div className={`p-4 rounded-2xl ${analyzing ? 'bg-indigo-100 animate-pulse' : 'bg-indigo-600'} text-white transition-colors duration-500`}>
                <FaRobot size={32} className={analyzing ? 'text-indigo-400' : 'text-white'} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    AI Strategy Insights
                </h2>
                <p className="text-sm font-medium text-slate-500">
                    {analyzing ? 'Synthesizing global donor behavior patterns...' : 'Optimization metrics generated successfully.'}
                </p>
            </div>
        </div>

        {analyzing ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-indigo-200 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-indigo-600 font-bold text-sm tracking-wide">Processing {campaigns.length} active pipelines...</p>
            </div>
        ) : (
            <div className="space-y-6 animate-fade-in">
                {/* Scorecard */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Fund Velocity</span>
                        <div className="text-3xl font-black text-slate-800">{successRate}%</div>
                        <span className="text-xs font-bold text-emerald-500 flex items-center mt-1">
                            <FaCheckCircle className="mr-1"/> On track
                        </span>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100/50">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400 block mb-2">Growth Cap</span>
                        <div className="text-3xl font-black text-indigo-700">₹2.4M</div>
                        <span className="text-xs font-bold text-indigo-500 flex items-center mt-1">
                            Projected Next 30 Days
                        </span>
                    </div>
                </div>

                {/* Insights List */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                        <FaLightbulb className="text-amber-500" /> Actionable Advice
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-sm text-slate-700 font-medium bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                            <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg h-fit"><FaCheckCircle size={12}/></div>
                            <span className="leading-relaxed">Your <strong>Education</strong> initiatives are showing strong micro-donation traction. Consider adding new, lower-tier predefined custom amounts (₹100, ₹250) to boost conversion rates by an estimated 14%.</span>
                        </li>
                        <li className="flex gap-3 text-sm text-slate-700 font-medium bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                            <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg h-fit"><FaExclamationTriangle size={12}/></div>
                            <span className="leading-relaxed">Campaign velocity for your recent <strong>Disaster Relief</strong> effort is stabilizing. We recommend sending a progress update email directly within the next 48 hours to re-engage lapsed local donors.</span>
                        </li>
                    </ul>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
