import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  ClipboardList,
  Users,
  MessageSquare,
  ChevronRight,
  Activity,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const heroImg = '/images/Heroimg.png';
const marianLogo = '/images/marian_logo.png';


/**
 * StayEase Madona - Hostel Complaint Management System
 * Location: Madona Hostel, Kuttikkanam
 */

// --- STUDENT REVIEW CARD COMPONENT ---
const StudentReviewCard = ({ review }) => {
  const [likes, setLikes] = useState(review.likes);
  const [dislikes, setDislikes] = useState(review.dislikes);
  const [voted, setVoted] = useState(null); // 'like' or 'dislike'

  const handleVote = (type) => {
    if (voted === type) return;
    if (type === 'like') {
      setLikes(prev => prev + 1);
      if (voted === 'dislike') setDislikes(prev => prev - 1);
    } else {
      setDislikes(prev => prev + 1);
      if (voted === 'like') setLikes(prev => prev - 1);
    }
    setVoted(type);
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white p-8 rounded-[3rem] shadow-xl border border-[#6F4E37]/5 flex flex-col gap-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#6F4E37]/10 rounded-full flex items-center justify-center font-bold text-[#6F4E37]">
            {review.name[0]}
          </div>
          <div>
            <h4 className="font-black text-[#6F4E37] text-lg">{review.name}</h4>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">{review.id}</p>
          </div>
        </div>
        <div className="flex gap-1 text-orange-400">
          {Array(review.rating).fill(0).map((_, i) => (
            <span key={i}>★</span>
          ))}
        </div>
      </div>

      <p className="text-[#6F4E37]/70 font-medium leading-relaxed italic">
        "{review.review}"
      </p>

      <div className="flex items-center gap-6 mt-4 border-t border-[#6F4E37]/5 pt-6">
        <button
          onClick={() => handleVote('like')}
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${voted === 'like' ? 'text-green-600 scale-110' : 'opacity-40 hover:opacity-100'}`}
        >
          👍 Helpful ({likes})
        </button>
        <button
          onClick={() => handleVote('dislike')}
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${voted === 'dislike' ? 'text-red-600 scale-110' : 'opacity-40 hover:opacity-100'}`}
        >
          👎 Not Helpful ({dislikes})
        </button>
      </div>
    </motion.div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Parallax effect for the hero background
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const backgroundOpacity = useTransform(scrollY, [0, 500], [1, 0.8]);

  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#6F4E37] font-sans selection:bg-[#6F4E37] selection:text-[#FDF5E6] overflow-x-hidden">

      <Navbar />

      {/* --- HERO SECTION --- */}
      <header id="home" className="relative pt-60 pb-32 px-6 overflow-hidden">

        {/* HERO IMAGE BACKGROUND LAYER - Made brighter by reducing white shade overlay */}
        <motion.div
          style={{ y: backgroundY, opacity: backgroundOpacity }}
          className="absolute inset-0 z-0"
        >
          <img
            src={heroImg}
            alt="Hero Background"
            className="w-full h-full object-cover brightness-110"
          />
          {/* Reduced white shade to make the image more prominent */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDF5E6]/40 via-[#FDF5E6]/30 to-[#FDF5E6]" />
        </motion.div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24 relative z-10">

          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-6 px-8 py-4 bg-white/70 backdrop-blur-xl border-[2px] border-[#6F4E37]/20 rounded-[3rem] mb-12 shadow-[0_25px_60px_-15px_rgba(111,78,55,0.15)] group transition-all hover:border-[#6F4E37]"
              >
                <div className="p-2 bg-white rounded-[1.5rem] shadow-lg border border-[#6F4E37]/5">
                  <img src={marianLogo} alt="Marian College Logo" className="h-12 object-contain" />
                </div>
                <div className="flex flex-col items-start pr-4">
                  <span className="text-[12px] font-black uppercase tracking-[0.1em] text-[#6F4E37]/40 whitespace-nowrap">Marian College, Kuttikkanam</span>
                </div>
              </motion.div>
              <h1 className="text-6xl md:text-9xl font-black leading-[0.8] mb-6 tracking-tighter text-[#6F4E37]">
                Elevate <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F4E37] to-[#b38e74] italic">Living.</span>
              </h1>

              <div className="text-lg md:text-xl font-bold italic text-[#6F4E37]/60 mb-10 tracking-wide uppercase">
                Because every stay deserves ease
              </div>

              <p className="text-xl text-[#6F4E37]/80 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-bold drop-shadow-sm">
                Redefining hostel life at Marian College. Bridge the gap between reporting and resolution with elite precision and speed.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                <motion.button
                  onClick={() => {
                    const token = localStorage.getItem("access");
                    const role = localStorage.getItem("role");
                    if (token && role === "student") {
                      navigate("/student/home");
                    } else {
                      navigate("/login");
                    }
                  }}
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="bg-[#6F4E37] text-[#FDF5E6] px-14 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center gap-4 transition-shadow hover:shadow-[#6F4E37]/30 cursor-pointer"
                >
                  Enter Portal <ArrowRight className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="flex-1 relative min-h-[500px]"
          >
            {/* PERFORMANCE STATUS BUBBLES */}
            <motion.div
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-0 md:right-10 bg-[#6F4E37] text-[#FDF5E6] p-10 rounded-[4rem] shadow-3xl z-20 flex flex-col items-center border-[10px] border-[#FDF5E6] hover:scale-105 transition-transform"
            >
              <p className="text-[11px] font-black opacity-40 uppercase tracking-[0.3em] mb-2">Uptime</p>
              <p className="text-7xl font-black">100%</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 30, 0], x: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 left-0 md:left-10 bg-white/90 backdrop-blur-md p-10 rounded-[4rem] shadow-3xl z-20 flex items-center gap-6 border border-[#6F4E37]/10 hover:scale-105 transition-transform"
            >
              <div className="p-6 bg-orange-100 rounded-3xl text-orange-600 shadow-inner">
                <ClipboardList className="w-10 h-10" />
              </div>
              <div>
                <p className="font-black text-2xl text-[#6F4E37]">Fast Track</p>
                <p className="text-[12px] opacity-40 font-black uppercase tracking-[0.2em]">Priority AI Routing</p>
              </div>
            </motion.div>

            {/* Subtle Abstract Glow */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-96 h-96 bg-gradient-to-tr from-[#6F4E37]/20 to-transparent rounded-full blur-3xl animate-pulse" />
            </div>
          </motion.div>
        </div>
      </header>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-40 px-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
              Elite <br />
              <span className="italic opacity-20">Infrastructure.</span>
            </h2>
            <p className="max-w-md text-right font-black opacity-30 uppercase tracking-[0.3em] text-[10px]">
              Advanced management tailored for the <br /> unique ecosystem of Marian College hostels.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Rapid Filing', desc: 'Report issues in under 30 seconds with our optimized smart-forms.', icon: <Zap /> },
              { title: 'Live Tracking', desc: 'Real-time visibility into your complaint status from assignment to resolution.', icon: <Activity /> },
              { title: 'Marian Connect', desc: 'Direct bridge between residents and the maintenance staff specialized for our campus.', icon: <MessageSquare /> },
              { title: 'Smart Archive', desc: 'Full history of past resolutions at your fingertips for future reference.', icon: <ClipboardList /> },
              { title: 'Push Alerts', desc: 'Instant notifications on your mobile device for any status updates.', icon: <Bell /> },
              { title: 'Admin Control', desc: 'High-level dashboard for wardens to manage the hostel flow effectively.', icon: <ShieldCheck /> }
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-12 rounded-[4rem] border border-[#6F4E37]/5 shadow-sm hover:shadow-2xl transition-all group"
              >
                <div className="w-20 h-20 bg-[#6F4E37]/5 rounded-3xl flex items-center justify-center mb-10 text-[#6F4E37] group-hover:bg-[#6F4E37] group-hover:text-[#FDF5E6] transition-all">
                  {f.icon}
                </div>
                <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter">{f.title}</h3>
                <p className="font-bold opacity-40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STUDENT VOICE (REVIEWS) --- */}
      <section className="py-40 bg-[#6F4E37]/5 px-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-24 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#6F4E37]/10 rounded-full text-[#6F4E37] font-black text-[11px] mb-8 uppercase tracking-[0.4em]"
            >
              <Users className="w-4 h-4" /> Real Student Voice
            </motion.div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-center leading-none">
              Transparency <br />
              <span className="italic opacity-20">Matters.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Rahul S.", id: "MCK-2023", review: "The speed of resolution is unmatched. I reported a plumbing issue and it was fixed within hours!", rating: 5, likes: 24, dislikes: 2 },
              { name: "Sneha Nair", id: "MCK-2024", review: "Life at Madona Hostel has become so much easier with StayEase. No more running after the warden!", rating: 5, likes: 18, dislikes: 0 },
              { name: "Joel Mathew", id: "MCK-2022", review: "Transparent and professional. The live tracking gives me peace of mind.", rating: 4, likes: 12, dislikes: 1 }
            ].map((r, i) => (
              <StudentReviewCard key={i} review={r} />
            ))}
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-40 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex-1"
          >
            <div className="relative rounded-[5rem] overflow-hidden shadow-2xl h-[600px] w-full bg-[#6F4E37]/20 border-8 border-white">
              <img
                src={heroImg}
                alt="Institutional Pride"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#6F4E37] to-transparent opacity-40" />
            </div>
          </motion.div>

          <div className="flex-1 space-y-12">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
              Built locally. <br />
              <span className="italic opacity-20 text-5xl">For Marian.</span>
            </h2>
            <p className="text-2xl font-bold opacity-60 leading-relaxed">
              StayEase is a custom-engineered ecosystem designed specifically to tackle the logistical bottlenecks of hostel management at Marian College Kuttikkanam.
            </p>
            <div className="space-y-8">
              {[
                { label: 'Priority Support', value: '24/7 Digital Intake' },
                { label: 'Quality Guarantee', value: 'Warden Supervised Resolves' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-8 group">
                  <div className="w-16 h-16 bg-[#6F4E37] rounded-2xl flex items-center justify-center text-[#FDF5E6] group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-tighter">{item.label}</h4>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-30">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
};

export default LandingPage;
