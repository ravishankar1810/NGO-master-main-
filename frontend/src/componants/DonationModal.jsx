import React, { useState } from 'react';
import { FaTimes, FaHeart, FaShieldAlt, FaRupeeSign } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function DonationModal({ isOpen, onClose, campaign }) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || amount < 1) {
      return toast.warn('Please enter a valid amount');
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      return toast.warn('Please enter a valid 10-digit phone number');
    }

    setLoading(true);
    const loadingToastId = toast.loading('Opening payment window...');

    try {
      // Load Razorpay SDK if not already loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const existing = document.querySelector('script[src*="razorpay"]');
          if (existing) {
            // Script tag exists but may not have finished loading
            existing.onload = resolve;
            existing.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          } else {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.body.appendChild(script);
          }
          // Safety timeout in case onload doesn't fire
          setTimeout(() => {
            if (window.Razorpay) resolve();
          }, 5000);
        });
      }

      if (!window.Razorpay) {
        toast.dismiss(loadingToastId);
        toast.error('Razorpay SDK failed to load. Please check your connection.');
        setLoading(false);
        return;
      }

      // 1. Create Order
      const orderRes = await api.post('/donations/create-order', {
        campaignId: campaign._id,
        amount: parseInt(amount)
      });

      if (!orderRes.data.success) throw new Error(orderRes.data.message || 'Order creation failed');

      toast.dismiss(loadingToastId);

      const { orderId, amount: orderAmount, currency, keyId } = orderRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: orderAmount,
        currency: currency,
        name: 'ServeX',
        description: `Donation for ${campaign.title}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post('/donations/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: parseInt(amount),
              campaignId: campaign._id,
              ngoId: campaign.ngoId?._id || campaign.ngoId,
              message: message,
              phone: phone,
              paymentMethod: 'razorpay'
            });

            if (verifyRes.data.success) {
              toast.success('Thank you! Your donation was successful. ❤️');
              onClose();
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Error verifying payment. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: phone
        },
        theme: { color: '#004B8D' },
        modal: {
          ondismiss: () => {
            // User closed Razorpay without completing payment
            toast.info('Payment cancelled.');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failure events (wrong card, bank decline, etc.)
      rzp.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error?.description || 'Please try again.'}`);
        setLoading(false);
      });

      // ✅ IMPORTANT: Open Razorpay FIRST, then close our modal
      // (Closing modal before opening Razorpay can cause focus/z-index issues)
      rzp.open();
      onClose();

    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error('Donation error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scale-in relative border border-gray-100">
        
        {/* Header Image/Pattern */}
        <div className="h-32 bg-gradient-to-br from-[#004B8D] to-blue-600 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
            <div className="relative text-center">
                <FaHeart className="text-white/20 absolute -top-4 -left-4 rotate-12" size={60} />
                <h2 className="text-2xl font-bold text-white tracking-tight">Support this Cause</h2>
                <p className="text-white/80 text-xs font-medium uppercase tracking-widest mt-1">Every rupee counts</p>
            </div>
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <FaTimes size={14} />
            </button>
        </div>

        <div className="p-8">
            <div className="mb-6">
                <h3 className="font-bold text-gray-800 line-clamp-1 mb-1">{campaign.title}</h3>
                <p className="text-xs text-gray-500 font-medium tracking-wide italic">Verified by ServeX</p>
            </div>

            <form onSubmit={handleDonate} className="space-y-6">
                {/* Amount Input */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Donation Amount (INR)</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#004B8D] transition-colors">
                            <FaRupeeSign size={18} />
                        </div>
                        <input 
                            type="number"
                            required
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount (e.g. 500)"
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#004B8D]/20 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl py-4 pl-12 pr-4 text-xl font-bold text-gray-800 transition-all outline-none"
                        />
                    </div>
                </div>
                
                {/* Phone Number Input */}
                <div className="relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Phone Number (for Appreciation Call)</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#004B8D] transition-colors">
                            <span className="text-sm font-bold">+91</span>
                        </div>
                        <input 
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="10-digit mobile number"
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#004B8D]/20 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl py-4 pl-14 pr-4 text-base font-bold text-gray-800 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Message Input */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Leave a Message (Optional)</label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Say something inspiring..."
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#004B8D]/20 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl p-4 text-sm text-gray-700 transition-all outline-none resize-none h-24"
                    />
                </div>

                {/* Trust Badge */}
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                    <FaShieldAlt className="text-emerald-500" size={12} />
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Secure Payment via Razorpay</p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl bg-[#004B8D] hover:bg-blue-700 text-white font-extrabold text-lg shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>Proceed to Pay <FaHeart className="animate-pulse" /></>
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
