import React, { useState } from 'react';
import { FaTimes, FaCamera, FaImage, FaMapMarkerAlt, FaBullhorn, FaCheckCircle } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

const PRESET_IMAGES = [
    { label: 'Education', url: '/asset/edu1.png' },
    { label: 'Food & Nutrition', url: '/asset/food1.png' },
    { label: 'Healthcare', url: '/asset/health1.png' },
    { label: 'Animal Welfare', url: '/asset/animal1.png' },
    { label: 'Women Empowerment', url: '/asset/women1.png' },
    { label: 'Environment', url: '/asset/env1.png' },
    { label: 'Disaster Relief', url: '/asset/disaster1.png' },
    { label: 'General Impact', url: '/asset/default1.png' }
];

export default function CreateCampaignModal({ isOpen, onClose, onSuccess, initialData = null }) {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'education',
        targetAmount: '',
        coverImage: '/asset/edu1.png', // Default
        location: {
            city: '',
            state: '',
            pincode: '',
            coordinates: [77.2090, 28.6139] // Delhi default
        }
    });
    const [loading, setLoading] = useState(false);
    const [imageMode, setImageMode] = useState('preset'); // 'preset' or 'url'

    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    title: initialData.title || '',
                    description: initialData.description || '',
                    category: initialData.category || 'education',
                    targetAmount: initialData.targetAmount || '',
                    coverImage: initialData.coverImage || '/asset/edu1.png',
                    location: {
                        city: initialData.location?.city || '',
                        state: initialData.location?.state || '',
                        pincode: initialData.location?.pincode || '',
                        coordinates: initialData.location?.coordinates || [77.2090, 28.6139]
                    }
                });
                setImageMode(initialData.coverImage?.startsWith('/asset') ? 'preset' : 'url');
            } else {
                setFormData({
                    title: '',
                    description: '',
                    category: 'education',
                    targetAmount: '',
                    coverImage: '/asset/edu1.png',
                    location: {
                        city: '',
                        state: '',
                        pincode: '',
                        coordinates: [77.2090, 28.6139]
                    }
                });
                setImageMode('preset');
            }
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let res;
            if (isEditing) {
                res = await api.patch(`/campaigns/${initialData._id}`, formData);
            } else {
                res = await api.post('/campaigns', formData);
            }
            if (res.data.success) {
                toast.success(isEditing ? 'Campaign updated successfully! ✏️' : 'Campaign launched successfully! 🚀');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(isEditing ? 'Failed to update campaign:' : 'Failed to create campaign:', error);
            toast.error(error.response?.data?.message || (isEditing ? 'Failed to update campaign' : 'Failed to launch campaign'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl animate-fade-in-up">
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-10 py-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <FaBullhorn className="text-indigo-600" /> {isEditing ? 'Edit Campaign' : 'Start New Campaign'}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ready to create impact? Let's begin.</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Campaign Title</label>
                                <input 
                                    type="text" required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="e.g. Science Lab for Rural Schools"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                <select 
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                                >
                                    <option value="education">Education</option>
                                    <option value="food">Food & Nutrition</option>
                                    <option value="health">Healthcare</option>
                                    <option value="disaster">Disaster Relief</option>
                                    <option value="child">Child Welfare</option>
                                    <option value="women">Women Empowerment</option>
                                    <option value="animal">Animal Welfare</option>
                                    <option value="environment">Environment</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mission Description</label>
                            <textarea 
                                required rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Describe your vision, goals, and who this helps..."
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Image Selection - THE CORE REQUEST */}
                    <div className="p-8 bg-slate-50 rounded-[40px] space-y-6">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <FaCamera /> Campaign Visual (Manual Add)
                            </label>
                            <div className="flex bg-slate-200/50 p-1 rounded-xl">
                                <button 
                                    type="button"
                                    onClick={() => setImageMode('preset')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${imageMode === 'preset' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    Presets
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setImageMode('url')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${imageMode === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    URL
                                </button>
                            </div>
                        </div>

                        {imageMode === 'preset' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {PRESET_IMAGES.map((img) => (
                                    <div 
                                        key={img.url}
                                        onClick={() => setFormData({...formData, coverImage: img.url})}
                                        className={`relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${formData.coverImage === img.url ? 'border-indigo-600 scale-[0.98]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20"></div>
                                        <span className="absolute bottom-2 left-2 right-2 text-[8px] font-black text-white uppercase text-center bg-black/40 backdrop-blur-md py-1 rounded-md">{img.label}</span>
                                        {formData.coverImage === img.url && (
                                            <div className="absolute top-2 right-2 text-indigo-600 bg-white rounded-full">
                                                <FaCheckCircle size={16} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Custom Image URL (Unsplash, etc.)</label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <FaImage className="absolute left-4 top-4 text-slate-300" />
                                            <input 
                                                type="url"
                                                value={formData.coverImage.startsWith('/asset') ? '' : formData.coverImage}
                                                onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                                                placeholder="https://images.unsplash.com/..."
                                                className="w-full pl-10 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50"
                                            />
                                        </div>
                                        {formData.coverImage && !formData.coverImage.startsWith('/asset') && (
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                                                <img src={formData.coverImage} className="w-full h-full object-cover" onError={(e) => e.target.src = '/asset/default1.png'} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Goal & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Funding Target (INR)</label>
                            <input 
                                type="number" required
                                value={formData.targetAmount}
                                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                                placeholder="e.g. 500000"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-black text-2xl placeholder:text-slate-200 focus:bg-white transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                <FaMapMarkerAlt /> Campaign Location
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="text" required placeholder="City"
                                    value={formData.location.city}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        location: { ...formData.location, city: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold text-sm focus:bg-white transition-all outline-none"
                                />
                                <input 
                                    type="text" required placeholder="State"
                                    value={formData.location.state}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        location: { ...formData.location, state: e.target.value }
                                    })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold text-sm focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="w-full py-5 bg-indigo-600 text-white rounded-[30px] font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.01] transition-all disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-3"
                    >
                        {loading ? (isEditing ? 'Updating Impact...' : 'Launching Impact...') : (isEditing ? 'SAVE CHANGES ✏️' : 'LAUNCH CAMPAIGN 🚀')}
                    </button>
                </form>
            </div>
        </div>
    );
}
