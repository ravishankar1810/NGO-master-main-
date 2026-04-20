import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Globe, Users, ShieldCheck, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.15 
      } 
    }
  };

  const floatAnimation = {
    y: [0, -15, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  };

  if (user?.role === 'ngo') {
    return (
      <div className="bg-slate-50 min-h-screen font-sans overflow-hidden">
         {/* NGO HERO */}
         <section className="relative md:min-h-[80vh] flex items-center justify-center pt-24 pb-16">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-400/20 blur-[100px]" />
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mt-6">
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] uppercase tracking-widest mb-8">
                 NGO Partner Action Center
              </motion.div>
              
              <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
                Maximize the scale of your <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Global Impact.</span>
              </motion.h1>
              
              <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="text-lg sm:text-2xl text-gray-600 max-w-3xl mb-12 font-medium leading-relaxed">
                You are currently building influence across the ServeX Network. Create verified campaigns, post community needs, and track actionable metrics.
              </motion.p>
              
              <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link to="/ngo-dashboard">
                  <button className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 hover:scale-[1.02] shadow-[0_0_30px_-5px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-3">
                    Open Operations Dashboard <ArrowRight size={20} />
                  </button>
                </Link>
              </motion.div>
            </div>
         </section>

         {/* NGO TOOLS SECTION */}
         <section className="py-24 bg-white border-t border-slate-100 relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-gray-900 mb-4">Dedicated Partnership Tools</h2>
                <p className="text-xl text-gray-500 font-medium">As a verified organization, you have full access to our management APIs.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <motion.div whileHover={{ y: -5 }} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                     <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Activity size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 mb-3">Campaign Pipeline</h3>
                     <p className="text-gray-500 font-medium leading-relaxed">Launch and govern highly-optimized public funding campaigns with rich analytical reporting and immediate Razorpay integration.</p>
                 </motion.div>
                 
                 <motion.div whileHover={{ y: -5 }} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group">
                     <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Globe size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 mb-3">Community Needs</h3>
                     <p className="text-gray-500 font-medium leading-relaxed">Broadcast critical physical material dependencies (textbooks, medical kits, relief packs) directly to localized supporters nearby.</p>
                 </motion.div>
                 
                 <motion.div whileHover={{ y: -5 }} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:shadow-amber-500/10 transition-all group">
                     <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <ShieldCheck size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 mb-3">AI Growth Optimization</h3>
                     <p className="text-gray-500 font-medium leading-relaxed">Instantly receive intelligent algorithmic feedback on your funding strategies and donor retention to maximize your conversion velocity.</p>
                 </motion.div>
              </div>
            </div>
         </section>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative md:min-h-[90vh] flex items-center justify-center pt-24 pb-32">
        {/* Dynamic Abstract Background Mesh */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/20 blur-[100px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-emerald-400/20 blur-[120px]" 
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-200/50 text-[#004B8D] font-semibold text-sm mb-8 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Serve-x NextGen Platform Live
          </motion.div>

          <motion.h1 
            initial="hidden" animate="visible" variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6"
          >
            Bridging the gap for <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004B8D] to-emerald-500">
              Global Good.
            </span>
          </motion.h1>

          <motion.p 
            initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}
            className="text-lg sm:text-2xl text-gray-600 max-w-3xl mb-10 font-medium leading-relaxed"
          >
            Empowering modern change by directly connecting trusted NGOs with passionate volunteers and generous donors across India.
          </motion.p>

          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link to="/map">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#004B8D] text-white font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group">
                NGO Locator Map
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20}/>
              </button>
            </Link>
            <Link to="/donate">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-lg border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                Donate Now
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- GLASS STATS BAR --- */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:-mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-2xl shadow-blue-900/5 flex flex-wrap justify-around items-center gap-8"
        >
          <div className="text-center">
            <h3 className="text-4xl font-black text-gray-900">50K+</h3>
            <p className="text-gray-500 font-medium">Volunteers</p>
          </div>
          <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
          <div className="text-center">
            <h3 className="text-4xl font-black text-emerald-500">₹12M+</h3>
            <p className="text-gray-500 font-medium">Raised Globally</p>
          </div>
          <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
          <div className="text-center">
            <h3 className="text-4xl font-black text-[#004B8D]">1,200+</h3>
            <p className="text-gray-500 font-medium">Verified NGOs</p>
          </div>
        </motion.div>
      </section>

      {/* --- PREMIUM FEATURES --- */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">A Modern Protocol for Charity</h2>
            <p className="text-xl text-gray-500">We rebuilt the donation pipeline from the ground up, guaranteeing transparency and lightning-fast deployment of resources.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#004B8D] flex items-center justify-center mb-6">
                <Globe size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Live GIS Tracking</h3>
              <p className="text-gray-500 leading-relaxed">Instantly locate verified NGOs around you using our state-of-the-art OpenStreetMap planetary data pipeline.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Verified Integrity</h3>
              <p className="text-gray-500 leading-relaxed">Every foundation on ServeX passes strict security checks. Your donations hit the targets safely through our unified Razorpay engine.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeUp} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <Activity size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-time Analytics</h3>
              <p className="text-gray-500 leading-relaxed">Watch your impact grow. Donor dashboards supply beautiful, live-updating charts and push notifications natively.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- ASYMMETRIC GALLERY / SHOWCASE --- */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Humanity in Action.</h2>
              <p className="text-xl text-gray-500">Witness the real-world impact generated by the ServeX network across communities nation-wide.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
            {/* Main large image */}
            <motion.div whileHover={{ scale: 0.98 }} className="md:col-span-8 rounded-[2rem] overflow-hidden relative group shadow-sm bg-gray-200 aspect-[16/10] md:aspect-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity"></div>
              <img src="/generated/home_edu.png" alt="Rural Education Volunteers" loading="lazy" decoding="async" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-6 left-8 z-20 text-white drop-shadow-lg">
                <span className="bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">Education</span>
                <h3 className="font-bold text-3xl md:text-4xl tracking-tight mb-2">Rural Education Drives</h3>
                <p className="text-gray-200 font-medium">Equipping over 10,000 students with digital literacy.</p>
              </div>
            </motion.div>

            <div className="md:col-span-4 grid grid-rows-2 gap-6 min-h-[400px] md:min-h-0">
              <motion.div whileHover={{ scale: 0.96 }} className="rounded-[2rem] overflow-hidden relative group shadow-sm bg-gray-200">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-70 group-hover:opacity-50 transition-opacity"></div>
                <img src="/generated/home_relief.png" alt="Child Support Welfare" loading="lazy" decoding="async" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-5 left-5 z-20 text-white drop-shadow-md">
                   <h3 className="font-bold text-xl tracking-tight">Child Welfare</h3>
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 0.96 }} className="rounded-[2rem] overflow-hidden relative group shadow-sm bg-gray-200">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-70 group-hover:opacity-50 transition-opacity"></div>
                <img src="/generated/auth_bg.png" alt="Community Relief Teams" loading="lazy" decoding="async" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute bottom-5 left-5 z-20 text-white drop-shadow-md">
                   <h3 className="font-bold text-xl tracking-tight">Community Relief</h3>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DARK CTA SECTION --- */}
      <section className="mt-20 md:mt-32 mx-4 sm:mx-8 lg:mx-12 relative overflow-hidden bg-[#0A1128] rounded-[3rem] text-center pt-32 pb-32">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <Heart className="mx-auto text-emerald-400 mb-6" size={48} />
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">Ready to generate impact?</h2>
          <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto">Join thousands of donors and NGOs building a better future through technological excellence.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <Link to="/auth">
                <button className="px-10 py-5 rounded-2xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]">
                  Create an Account
                </button>
              </Link>
            ) : (
              <Link to={user.role === 'ngo' ? '/ngo-dashboard' : '/donor-dashboard'}>
                <button className="px-10 py-5 rounded-2xl bg-donor-green text-white font-bold text-lg hover:bg-opacity-90 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(45,90,39,0.3)]">
                  Go to Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
