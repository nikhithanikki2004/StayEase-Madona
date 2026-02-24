import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import Swal from 'sweetalert2';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Show success alert
        Swal.fire({
            title: 'Message Sent!',
            text: 'Thank you for contacting StayEase. Our support team will get back to you within 24 hours.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#6F4E37',
            background: '#FDF5E6',
            color: '#6F4E37'
        });

        // Reset form
        setFormData({
            name: '',
            contact: '',
            message: ''
        });
    };

    return (
        <div className="min-h-screen bg-[#FDF5E6] text-[#6F4E37] font-sans">
            <Navbar />

            <main className="pt-48 pb-32 px-6">
                <div className="max-w-[1400px] mx-auto">

                    <div className="text-center mb-32">
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.8] uppercase"
                        >
                            Get in <br />
                            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#6F4E37] to-[#b38e74]">Touch.</span>
                        </motion.h1>
                        <p className="max-w-xl mx-auto text-xl font-bold opacity-50">
                            Have questions or need technical support? The StayEase team is here to ensure your hostel life is seamless.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12 items-start mb-40">
                        {/* Contact Info Sidebar */}
                        <div className="space-y-8">
                            {[
                                { icon: <Mail className="w-8 h-8" />, label: "Email Support", value: "stayease.noreply@gmail.com" },
                                { icon: <Phone className="w-8 h-8" />, label: "Helpline", value: "+91 4869 232203" },
                                { icon: <MapPin className="w-8 h-8" />, label: "Office", value: "Main Block, Marian College, Kuttikkanam" },
                                { icon: <Clock className="w-8 h-8" />, label: "Hours", value: "Mon - Sat | 9:00 AM - 5:00 PM" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-10 rounded-[3rem] border border-[#6F4E37]/10 flex items-center gap-6 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <div className="w-16 h-16 bg-[#6F4E37]/5 rounded-2xl flex items-center justify-center text-[#6F4E37] shadow-inner">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{item.label}</p>
                                        <p className="font-black text-sm">{item.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2 bg-[#6F4E37] rounded-[5rem] p-16 md:p-24 shadow-2xl relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-6xl font-black text-[#FDF5E6] tracking-tighter mb-12 uppercase">Send a Message</h2>
                                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your Name"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold focus:bg-white/10 focus:border-white/40 transition-all outline-none placeholder:text-white/30"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Student ID / Phone</label>
                                        <input
                                            type="text"
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleChange}
                                            placeholder="MCKXXXX or Phone"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold focus:bg-white/10 focus:border-white/40 transition-all outline-none placeholder:text-white/30"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-4">Your Inquiry</label>
                                        <textarea
                                            rows="6"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="How can we help you?"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white font-bold focus:bg-white/10 focus:border-white/40 transition-all outline-none resize-none placeholder:text-white/30"
                                        ></textarea>
                                    </div>
                                    <div className="md:col-span-2 pt-6">
                                        <button type="submit" className="w-full py-8 bg-[#FDF5E6] text-[#6F4E37] rounded-3xl font-black text-xl uppercase tracking-widest shadow-2xl flex items-center justify-center gap-6 hover:scale-[1.02] transition-transform">
                                            Dispatch Message <Send className="w-6 h-6" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                            {/* Abstract Background Glow */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[120px] -mr-48 -mt-48" />
                        </motion.div>
                    </div>

                    <a
                        href="https://maps.google.com/?q=Marian+College+Kuttikkanam"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white rounded-[5rem] p-12 border border-[#6F4E37]/10 h-[500px] overflow-hidden relative shadow-2xl group"
                    >
                        {/* Map Placeholder */}
                        <div className="w-full h-full bg-[#FDF5E6] rounded-[4rem] flex items-center justify-center text-center p-12 overflow-hidden relative">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]" />
                            <div className="relative z-10">
                                <MapPin className="w-24 h-24 text-[#6F4E37]/20 mx-auto mb-8" />
                                <h3 className="text-4xl font-black tracking-tighter mb-4">Marian College Campus</h3>
                                <p className="font-bold opacity-40 max-w-sm mx-auto uppercase tracking-widest">Kuttikkanam, Idukki District, Kerala, India - 685531</p>
                            </div>
                        </div>
                        <motion.div
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-[#6F4E37]/80 backdrop-blur-md flex items-center justify-center p-20 opacity-0 transition-opacity cursor-pointer text-[#FDF5E6]"
                        >
                            <div className="text-center">
                                <p className="text-5xl font-black mb-6 tracking-tighter">Locate Us in the Hills.</p>
                                <p className="text-sm font-bold opacity-60 uppercase tracking-[0.3em]">Click to Open Google Maps</p>
                            </div>
                        </motion.div>
                    </a>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactUs;
