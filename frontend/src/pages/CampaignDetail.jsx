import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { FaShareAlt, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function CampaignDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { token, user } = useAuth();
  const [campaign, setCampaign] = useState(location.state?.campaign || null);
  const [loading, setLoading] = useState(!location.state?.campaign);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay SDK only if not already loaded
    const loadRazorpay = () => {
      if (window.Razorpay) return; // Already loaded
      const existing = document.querySelector('script[src*="razorpay"]');
      if (existing) return; // Already in DOM
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    };
    loadRazorpay();

    const fetchCampaign = async () => {
      // If we already have campaign details from state, and it's a virtual ID, skip fetch
      if (location.state?.campaign && (id.startsWith('real-') || id.startsWith('mock-') || id.startsWith('dynamic-'))) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/campaigns/${id}`);
        if (res.data.success) {
          setCampaign(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching campaign details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, location.state]);

  const speakAppreciation = (name, amount) => {
    const message = `नमस्ते! Serve-x में दान करने के लिए धन्यवाद! आपका ₹${amount} का योगदान बहुत महत्वपूर्ण है।`;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!token) return toast.info('Please log in to donate');
    if (!donationAmount || Number(donationAmount) < 1) return toast.error('Check donation amount');
    if (!donorPhone || !/^\d{10}$/.test(donorPhone)) return toast.error('Please enter a valid 10-digit phone number');
    
    setIsProcessing(true);
    const loadingToastId = toast.loading('Opening payment window...');

    try {
      // Wait for Razorpay SDK if it hasn't loaded yet
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const existing = document.querySelector('script[src*="razorpay"]');
          if (!existing) {
            const s = document.createElement('script');
            s.src = 'https://checkout.razorpay.com/v1/checkout.js';
            s.onload = resolve;
            s.onerror = () => reject(new Error('Failed to load payment SDK'));
            document.body.appendChild(s);
          } else {
            existing.onload = resolve;
            existing.onerror = () => reject(new Error('Failed to load payment SDK'));
          }
        });
      }

      // 1. Create Order
      const orderRes = await api.post('/donations/create-order', {
        campaignId: id,
        amount: Number(donationAmount)
      });
      
      if (!orderRes.data.success) throw new Error('Order creation failed');

      toast.dismiss(loadingToastId);

      // 2. Initialize Razorpay Options
      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'ServeX Platform',
        description: `Donation to ${campaign.title}`,
        order_id: orderRes.data.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post('/donations/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: Number(donationAmount),
              campaignId: id,
              ngoId: campaign.ngoId?._id || campaign.ngoId?.id || campaign.ngoId || 'virtual-ngo',
              phone: donorPhone,
              message: 'Donated directly securely via ServeX'
            });

            if (verifyRes.data.success) {
              toast.success(`🎉 Donation successful! Receipt: ${verifyRes.data.receipt}`);
              speakAppreciation(user?.name || 'दाता', Number(donationAmount));
              // Optimistically update local UI
              setCampaign(prev => ({
                ...prev,
                raisedAmount: (prev.raisedAmount || 0) + Number(donationAmount),
                donorCount: (prev.donorCount || 0) + 1
              }));
              setDonationAmount('');
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: donorPhone
        },
        theme: { color: '#004B8D' },
        modal: {
          ondismiss: () => {
            // User closed the Razorpay window without paying
            toast.info('Payment cancelled.');
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);

      // Handle payment failure (wrong card, etc.)
      paymentObject.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error?.description || 'Please try again.'}`);
        setIsProcessing(false);
      });

      paymentObject.open();

    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error('Payment flow error', error);
      toast.error(error.response?.data?.message || 'Unable to initiate transaction. Try again.');
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-[#004B8D] font-bold">Connecting to NGO...</div>;
  if (!campaign) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Context Lost</h2>
      <p className="text-gray-500 mb-8">This was a real-time locator result. Please return to the map to view details again.</p>
      <Link to="/map" className="bg-[#004B8D] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
        Back to NGO Locator
      </Link>
    </div>
  );

  const progress = Math.min(((campaign.raisedAmount || 0) / campaign.targetAmount) * 100, 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8 animate-fade-in-up">
          <img 
            src={campaign.coverImage || (id.startsWith('real-') ? '/generated/home_edu.png' : '/asset/img1.png')} 
            alt={campaign.title} 
            className="w-full h-96 object-cover rounded-3xl shadow-md border border-gray-100"
          />
          
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-blue-50 text-[#004B8D] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{campaign.category || 'General'}</span>
              {campaign.status === 'completed' && (
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  🏆 Goal Achieved — Campaign Ended
                </span>
              )}
              {campaign.location?.city && (
                <span className="flex items-center text-gray-500 text-sm font-medium"><FaMapMarkerAlt className="mr-1 inline text-red-500" /> {campaign.location.city}, {campaign.location.state}</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">{campaign.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-br from-[#004B8D] to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
              {campaign.ngoId?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Organized By</p>
              <h3 className="text-xl font-bold text-gray-900">{campaign.ngoId?.name}</h3>
              {(campaign.ngoId?.isVerified || id.startsWith('real-')) && (
                <p className="text-emerald-600 text-sm font-semibold flex items-center gap-1 mt-1">
                  <FaShieldAlt /> {id.startsWith('real-') ? 'Verified Local Partner' : 'Verified NGO Partner'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Donation Tracker Block */}
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sticky top-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fundraiser Progress</h2>
            
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-extrabold text-[#004B8D]">₹{(campaign.raisedAmount || 0).toLocaleString()}</span>
              <span className="text-gray-500 font-medium pb-1">raised of ₹{campaign.targetAmount.toLocaleString()}</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden ring-1 ring-inset ring-black/5">
              <div className="bg-gradient-to-r from-emerald-400 to-[#10B981] h-3 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm font-bold text-gray-600 mb-4">{campaign.donorCount || 0} supporters</p>

            {/* Goal Achieved Banner */}
            {campaign.status === 'completed' && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-200 rounded-2xl p-5 mb-6 text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="font-black text-emerald-800 text-lg mb-1">Campaign Goal Reached!</h3>
                <p className="text-emerald-700 text-sm font-medium">This campaign has successfully met its fundraising target. Thank you to all {campaign.donorCount} supporters!</p>
              </div>
            )}

            {campaign.status === 'completed' ? (
              /* ✅ Campaign ended — show closed state for everyone */
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-black text-gray-800 text-xl mb-2">This Campaign Has Ended</h3>
                <p className="text-gray-500 text-sm font-medium">The fundraising goal of ₹{campaign.targetAmount?.toLocaleString()} was fully achieved. Donations are no longer accepted for this campaign.</p>
                <p className="text-gray-400 text-xs mt-4 font-semibold">Explore other open campaigns below.</p>
              </div>
            ) : user?.role === 'ngo' ? (
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-center mt-6">
                    <div className="mb-4 flex justify-center text-blue-500">
                        <FaShieldAlt size={32} />
                    </div>
                    <h3 className="font-bold text-[#004B8D] mb-2">You are viewing as an NGO</h3>
                    <p className="text-sm font-medium text-gray-600 mb-6">This is exactly how donors see your verified campaign page. Share this link to start receiving contributions!</p>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Ready to share! Link copied to clipboard. 🔗");
                        }}
                        className="w-full bg-white text-[#004B8D] border-2 border-[#004B8D] font-bold py-3.5 rounded-xl hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <FaShareAlt /> Copy Share Link
                    </button>
                </div>
            ) : (
                <form onSubmit={handleDonate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Enter Donation Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₹</span>
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 text-lg font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="1000"
                      />
                    </div>
                  </div>
    
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number (for appreciation call)</label>
                    <input 
                      type="tel" 
                      required
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full px-4 py-3.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter 10 digit number"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className={`w-full bg-gradient-to-r from-[#004B8D] to-indigo-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 focus:ring-2 focus:ring-offset-2 flex justify-center items-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div> : 'Donate Securely via UPI / Cards'}
                  </button>
                </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-500 text-sm font-medium">
               <FaShieldAlt className="text-emerald-500" /> Secure Payments by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
