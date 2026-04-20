import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope, FaLock, FaUser, FaPhone, FaEye, FaEyeSlash,
  FaArrowRight, FaCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { GoogleLogin } from '@react-oauth/google';

const QUOTES = [
  { text: 'The best way to find yourself is to lose yourself in the service of others.', author: 'Mahatma Gandhi' },
  { text: 'No one has ever become poor by giving.', author: 'Anne Frank' },
  { text: 'We rise by lifting others.', author: 'Robert Ingersoll' },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('donor');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));

  const navigate = useNavigate();
  const { login, register, user, setAuthSession } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin-dashboard', { replace: true });
      else if (user.role === 'ngo') navigate('/ngo-dashboard', { replace: true });
      else navigate('/donor-dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!isLogin && !formData.name.trim()) errs.name = 'Full name is required';
    if (!isLogin && !formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({ ...formData, role });
      }

      if (result?.success) {
        if (result.role === 'admin') navigate('/admin-dashboard');
        else if (result.role === 'ngo') navigate('/ngo-dashboard');
        else navigate('/donor-dashboard');
      } else {
        toast.error(result?.message || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential, role });
      if (res.data.success) {
        const userData = res.data.user || res.data.data;
        setAuthSession(userData, res.data.token);
        toast.success(`Welcome to ServeX, ${userData.name}! 🎉`);
        navigate(userData.role === 'ngo' ? '/ngo-dashboard' : '/donor-dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google authentication failed.');
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ name: '', email: '', password: '', phone: '' });
  };

  const quote = QUOTES[quoteIdx];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch bg-slate-50 overflow-hidden">
      {/* ── Left Panel ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/generated/auth_bg.png')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#004B8D]/90 via-[#004B8D]/70 to-[#0a7c55]/80" />

        {/* Animated ambient orbs */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-white font-black text-2xl tracking-tight">ServeX</span>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center gap-6 py-10">
          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Make a<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                Difference
              </span><br />
              Today
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-xs">
              Connect with verified NGOs, fund meaningful campaigns, and track your social impact.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { val: '1,200+', label: 'NGOs' },
              { val: '₹4.2Cr', label: 'Raised' },
              { val: '50K+', label: 'Donors' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                <p className="text-2xl font-black text-white">{s.val}</p>
                <p className="text-white/60 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
          <p className="text-white/90 text-sm italic leading-relaxed">"{quote.text}"</p>
          <p className="text-white/50 text-xs mt-2 font-medium">— {quote.author}</p>
        </div>
      </div>

      {/* ── Right Panel (Form) ──────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isLogin ? 'Welcome back 👋' : 'Create account'}
            </h2>
            <p className="text-gray-500 text-sm mt-1.5">
              {isLogin
                ? 'Sign in to continue your impact journey.'
                : 'Join thousands making a difference every day.'}
            </p>
          </div>

          {/* Role Selector */}
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-7 gap-1">
            {['donor', 'ngo'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
                  role === r
                    ? r === 'donor'
                      ? 'bg-white shadow-md text-[#004B8D]'
                      : 'bg-white shadow-md text-[#10B981]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r === 'donor' ? '❤️ Donor' : '🏢 NGO'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                      errors.name
                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-[#004B8D] focus:ring-2 focus:ring-[#004B8D]/15'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><FaCheckCircle size={10} className="rotate-45" />{errors.name}</p>}
              </div>
            )}

            {/* Phone (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98XXX XXXXX"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                      errors.phone
                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-[#004B8D] focus:ring-2 focus:ring-[#004B8D]/15'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1"><FaCheckCircle size={10} className="rotate-45 inline mr-1" />{errors.phone}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                    errors.email
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-[#004B8D] focus:ring-2 focus:ring-[#004B8D]/15'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1"><FaCheckCircle size={10} className="rotate-45 inline mr-1" />{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs text-[#004B8D] hover:underline font-medium">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm transition-all outline-none ${
                    errors.password
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-[#004B8D] focus:ring-2 focus:ring-[#004B8D]/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1"><FaCheckCircle size={10} className="rotate-45 inline mr-1" />{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 mt-2 rounded-xl font-bold text-sm text-white transition-all duration-300 ${
                role === 'donor'
                  ? 'bg-[#004B8D] hover:bg-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                  : 'bg-[#10B981] hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In to Dashboard' : 'Create My Account'}
                  <FaArrowRight size={13} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-slate-50 text-gray-400 text-xs font-medium">or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-in was interrupted.')}
              theme="outline"
              size="large"
              text={isLogin ? 'signin_with' : 'signup_with'}
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* Switch Mode */}
          <p className="mt-6 text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              className={`font-semibold hover:underline ${role === 'donor' ? 'text-[#004B8D]' : 'text-[#10B981]'}`}
            >
              {isLogin ? 'Create one for free' : 'Sign in instead'}
            </button>
          </p>

          {/* Terms note on register */}
          {!isLogin && (
            <p className="mt-4 text-center text-xs text-gray-400 leading-relaxed">
              By creating an account you agree to our{' '}
              <a href="#" className="underline hover:text-gray-600">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
