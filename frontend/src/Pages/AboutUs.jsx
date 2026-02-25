import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Target, Eye, Award, MapPin } from 'lucide-react';
const marianLogo = '/images/marian_logo.png';
const heroImg = '/images/Heroimg.png';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-[#FDF5E6] text-[#6F4E37] font-sans">
            <Navbar />

            <main className="pt-48 pb-32 px-6">
                <div className="max-w-[1400px] mx-auto">

                    <div className="grid lg:grid-cols-2 gap-24 items-center mb-40">
                        <motion.div
                            initial={{ opacity: 0, x: -60 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-12 leading-[0.8] uppercase">
                                Established <br />
                                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#6F4E37] to-[#b38e74]">Excellence.</span>
                            </h1>
                            <p className="text-2xl font-bold opacity-70 leading-relaxed mb-12">
                                Marian College Kuttikkanam (Autonomous) has always been a pioneer in student welfare. StayEase is the next evolution in our commitment to providing a world-class living experience.
                            </p>
                            <div className="flex items-center gap-6">
                                <img src={marianLogo} alt="Logo" className="w-full h-full object-contain" />
                                <div>
                                    <p className="font-black text-xl uppercase tracking-tighter">Marian College</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Kuttikkanam, Idukki</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative rounded-[5rem] overflow-hidden shadow-2xl h-[600px] bg-[#6F4E37]/10"
                        >
                            <img
                                src={heroImg}
                                alt="Marian Campus"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#6F4E37]/60 via-transparent to-transparent" />
                            <div className="absolute bottom-12 left-12">
                                <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl border border-[#6F4E37]/20 shadow-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MapPin className="text-[#6F4E37] w-5 h-5" />
                                        <span className="text-[#6F4E37] font-black text-sm uppercase tracking-widest">Kuttikkanam Hills</span>
                                    </div>
                                    <p className="text-[#6F4E37]/60 font-bold text-xs ml-8">Idukki District, Kerala - 685531</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-40">
                        {[
                            {
                                icon: <Target className="w-10 h-10" />,
                                title: "Our Mission",
                                text: "To bridge the gap between students and maintenance staff through an elite, high-speed digital infrastructure."
                            },
                            {
                                icon: <Eye className="w-10 h-10" />,
                                title: "Our Vision",
                                text: "Scaling StayEase to be the gold standard for hostel management systems across autonomous institutions in India."
                            },
                            {
                                icon: <Award className="w-10 h-10" />,
                                title: "The Legacy",
                                text: "Built on the foundation of trust and service that has defined Marian College since its inception."
                            }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="bg-white p-16 rounded-[4rem] border border-[#6F4E37]/10 shadow-xl group hover:bg-[#6F4E37] transition-all"
                            >
                                <div className="w-20 h-20 bg-[#6F4E37]/5 rounded-3xl flex items-center justify-center mb-10 text-[#6F4E37] group-hover:bg-white group-hover:scale-110 transition-all">
                                    {card.icon}
                                </div>
                                <h3 className="text-3xl font-black mb-6 group-hover:text-white transition-colors">{card.title}</h3>
                                <p className="font-bold opacity-60 group-hover:text-white/60 leading-relaxed transition-colors">{card.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-[#6F4E37] rounded-[5rem] p-32 text-[#FDF5E6] relative overflow-hidden text-center">
                        <motion.div
                            animate={{ rotate: [0, 5, 0] }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute top-20 right-20 text-[20rem] font-black opacity-[0.03] leading-none select-none pointer-events-none"
                        >
                            MARIAN
                        </motion.div>
                        <h2 className="text-6xl md:text-8xl font-black mb-12 tracking-tighter leading-none relative z-10">We believe in <br /> <span className="italic opacity-40">Making Complete.</span></h2>
                        <p className="max-w-2xl mx-auto text-xl font-bold opacity-60 mb-20 relative z-10">
                            Every complaint is an opportunity to improve. Every resolution is a promise kept. StayEase is more than software—it's resident care.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 relative z-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center"><ShieldCheck className="w-8 h-8" /></div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Secure Portal</p>
                            </div>
                            <div className="w-px h-16 bg-white/10 hidden md:block" />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center font-black">2026</div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Ecosystem Established</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
