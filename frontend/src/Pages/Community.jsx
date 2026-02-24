import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Users, Heart, Share2, Award, Zap, MessageCircle } from 'lucide-react';

const Community = () => {
    const highlights = [
        { label: "Active Residents", value: "850+", icon: <Users className="w-6 h-6" /> },
        { label: "Issues Resolved", value: "2,400+", icon: <Zap className="w-6 h-6" /> },
        { label: "Student Ratings", value: "4.9/5", icon: <Award className="w-6 h-6" /> },
        { label: "Avg Resolution", value: "4.5 Hrs", icon: <Heart className="w-6 h-6" /> }
    ];

    const pulseStories = [
        {
            student: "Amal V.",
            room: "A-204",
            comment: "The fan went out at 10 PM. Filed via StayEase, and by 10:30 AM next day, it was replaced. Phenomenal speed!",
            tags: ["Electrical", "Speed"]
        },
        {
            student: "Sandra K.S.",
            room: "C-112",
            comment: "Love the transparency. I knew exactly where my complaint was in the pipeline. No more chasing wardens.",
            tags: ["Plumbing", "Transparency"]
        },
        {
            student: "Kevin George",
            room: "B-405",
            comment: "The ratings system keeps everyone accountable. I feel heard as a student resident of Marian.",
            tags: ["General", "Accountability"]
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDF5E6] text-[#6F4E37] font-sans">
            <Navbar />

            <main className="pt-48 pb-32 px-6">
                <div className="max-w-[1400px] mx-auto">

                    <header className="text-center mb-40">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#6F4E37]/5 rounded-full text-[#6F4E37] font-black text-[11px] mb-10 uppercase tracking-[0.4em]"
                        >
                            <Users className="w-4 h-4" /> Marian Resident Hub
                        </motion.div>
                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-12 leading-[0.8]">
                            The Marian <br />
                            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#6F4E37] to-[#b38e74]">Pulse.</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-xl font-bold opacity-50">
                            A community built on transparency, speed, and student-first resolution at Marian College hostels.
                        </p>
                    </header>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
                        {highlights.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-12 rounded-[3.5rem] border border-[#6F4E37]/5 shadow-xl text-center group hover:bg-[#6F4E37] transition-all hover:scale-105"
                            >
                                <div className="w-16 h-16 bg-[#6F4E37]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#6F4E37] group-hover:bg-white group-hover:scale-110 transition-all">
                                    {item.icon}
                                </div>
                                <div className="text-5xl font-black mb-2 group-hover:text-white transition-colors">{item.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:text-white/60 transition-colors">{item.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mb-40">
                        <div className="flex items-center justify-between mb-20">
                            <h2 className="text-5xl font-black tracking-tighter">Student Stories</h2>
                            <div className="flex gap-4">
                                <div className="bg-white p-4 rounded-full border border-[#6F4E37]/10 text-[#6F4E37]"><Share2 className="w-6 h-6" /></div>
                                <div className="bg-white p-4 rounded-full border border-[#6F4E37]/10 text-[#6F4E37]"><MessageCircle className="w-6 h-6" /></div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {pulseStories.map((story, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -10 }}
                                    className="bg-white p-12 rounded-[4rem] border border-[#6F4E37]/10 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex gap-2 mb-8">
                                            {story.tags.map(tag => (
                                                <span key={tag} className="px-4 py-1.5 bg-[#6F4E37]/5 rounded-full text-[9px] font-black uppercase tracking-widest">{tag}</span>
                                            ))}
                                        </div>
                                        <p className="text-2xl font-bold leading-relaxed mb-12 italic">"{story.comment}"</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#6F4E37] rounded-full flex items-center justify-center text-[#FDF5E6] font-black text-xs">
                                            {story.student[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm">{story.student}</p>
                                            <p className="text-[10px] uppercase tracking-widest opacity-40">Room {story.room}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        className="rounded-[5rem] p-24 bg-[#6F4E37] text-[#FDF5E6] text-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative overflow-hidden"
                    >
                        <h3 className="text-8xl font-black mb-12 tracking-tighter leading-none">Join the <br />Vibe.</h3>
                        <p className="max-w-xl mx-auto text-xl opacity-60 font-bold mb-16 uppercase tracking-[0.2em]">Become a part of the fastest resolution network in South India hostels.</p>
                        <button className="px-16 py-6 bg-[#FDF5E6] text-[#6F4E37] rounded-3xl font-black text-xl uppercase tracking-widest shadow-2xl hover:scale-110 transition-transform">Enter Portal</button>

                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mt-32" />
                    </motion.div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Community;
