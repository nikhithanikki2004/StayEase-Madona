import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MessageSquare, Zap, Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            icon: <MessageSquare className="w-12 h-12" />,
            title: "File Your Issue",
            desc: "Instant portal access. Select your category (Electrical, Plumbing, etc.) and describe the problem in seconds.",
            color: "#6F4E37"
        },
        {
            icon: <Zap className="w-12 h-12" />,
            title: "Smart Routing",
            desc: "Our AI instantly notifies the assigned staff member and the hostel warden, ensuring zero idle time.",
            color: "#b38e74"
        },
        {
            icon: <Clock className="w-12 h-12" />,
            title: "Live Tracking",
            desc: "Monitor the 'In-Progress' status. Get real-time updates on when the technician is arriving at your room.",
            color: "#6F4E37"
        },
        {
            icon: <CheckCircle2 className="w-12 h-12" />,
            title: "Swift Resolution",
            desc: "Problem solved! Provide your feedback and rate the experience to help us improve hostel living.",
            color: "#b38e74"
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDF5E6] text-[#6F4E37] font-sans selection:bg-[#6F4E37] selection:text-[#FDF5E6]">
            <Navbar />

            <main className="pt-48 pb-32 px-6">
                <div className="max-w-[1400px] mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-32"
                    >
                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.8]">
                            Seamless <br />
                            <span className="italic opacity-20">Resolution.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl font-bold opacity-60">
                            StayEase simplifies the traditional paperwork and verbal complaints into a high-speed digital ecosystem tailored for Marian College.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        {/* Connection Line (Desktop) */}
                        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-[#6F4E37]/10 -translate-y-12" />

                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="relative z-10 bg-white/60 backdrop-blur-xl p-12 rounded-[4rem] border border-white shadow-xl hover:shadow-2xl transition-all group"
                            >
                                <div
                                    className="w-24 h-24 rounded-3xl flex items-center justify-center mb-10 mx-auto text-white shadow-xl rotate-3 group-hover:rotate-12 transition-transform"
                                    style={{ backgroundColor: step.color }}
                                >
                                    {step.icon}
                                </div>
                                <div className="absolute top-8 right-8 text-4xl font-black opacity-[0.05]">0{i + 1}</div>
                                <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter">{step.title}</h3>
                                <p className="font-bold opacity-50 leading-relaxed text-sm">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mt-40 bg-[#6F4E37] rounded-[5rem] p-20 text-[#FDF5E6] relative overflow-hidden text-left"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
                            <div className="flex-1">
                                <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">Ready to <br />Experience Ease?</h2>
                                <p className="text-lg opacity-60 max-w-lg font-medium mb-12">
                                    Join hundreds of Marian students already using the StayEase portal for a better hostel life.
                                </p>
                                <div className="flex gap-4">
                                    <button className="bg-[#FDF5E6] text-[#6F4E37] px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-4 shadow-2xl">
                                        Get Started <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 hidden md:block">
                                <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] p-12 border border-white/10 shadow-inner">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-16 h-16 bg-[#FDF5E6] rounded-2xl flex items-center justify-center text-[#6F4E37] shadow-xl">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="font-black text-2xl">Marian Secure</p>
                                            <p className="text-xs uppercase tracking-widest opacity-40">Integrated Safety Protocol</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 opacity-50 font-bold">
                                        <p>• Verified Student Login</p>
                                        <p>• Encrypted Feedback</p>
                                        <p>• Warden Override Control</p>
                                        <p>• Staff Performance Metrics</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Abstract Background Glow */}
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mb-48" />
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default HowItWorks;
