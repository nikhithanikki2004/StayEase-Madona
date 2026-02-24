import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Instagram, Facebook, Linkedin, Mail, Phone, ExternalLink, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        explore: [
            { name: 'Home', path: '/' },
            { name: 'How It Works', path: '/how-it-works' },
            { name: 'Community', path: '/community' },
            { name: 'About Us', path: '/about-us' },
        ],
        support: [
            { name: 'Contact Support', path: '/contact-us' },
            { name: 'Staff Portal', path: '/login' },
            { name: 'Report Issue', path: '/signup' },
            { name: 'Student FAQs', path: '#' },
        ],
        legal: [
            { name: 'Privacy Policy', path: '#' },
            { name: 'Terms of Service', path: '#' },
            { name: 'Data Security', path: '#' },
        ]
    };

    const socialLinks = [
        { icon: <Instagram size={20} />, href: '#', label: 'Instagram' },
        { icon: <Facebook size={20} />, href: '#', label: 'Facebook' },
        { icon: <Linkedin size={20} />, href: '#', label: 'LinkedIn' },
    ];

    return (
        <footer className="relative bg-[#6F4E37] text-[#FDF5E6] pt-32 pb-12 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FDF5E6]/20 to-transparent" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.02] rounded-full blur-3xl -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white opacity-[0.03] rounded-full blur-2xl -ml-32 -mb-32" />

            <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">

                    {/* BRAND COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#FDF5E6] p-2.5 rounded-2xl shadow-xl">
                                    <ShieldCheck className="w-8 h-8 text-[#6F4E37]" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter leading-none">StayEase</h2>
                                    <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-40 mt-1">Institutional Ecosystem</p>
                                </div>
                            </div>
                            <p className="text-lg font-bold opacity-60 leading-relaxed max-w-sm">
                                Redefining the standard of hostel excellence at Marian College Kuttikkanam. Smart reports, faster resolves, better living.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {socialLinks.map((social, i) => (
                                <motion.a
                                    key={i}
                                    href={social.href}
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className="w-12 h-12 bg-[#FDF5E6]/10 rounded-2xl flex items-center justify-center hover:bg-[#FDF5E6] hover:text-[#6F4E37] transition-all duration-300 border border-white/5"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* LINKS COLUMNS */}
                    <div className="space-y-8">
                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40">Explore</h4>
                        <ul className="space-y-4">
                            {footerLinks.explore.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="text-sm font-bold opacity-60 hover:opacity-100 hover:translate-x-2 transition-all inline-block">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40">Support</h4>
                        <ul className="space-y-4">
                            {footerLinks.support.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="text-sm font-bold opacity-60 hover:opacity-100 hover:translate-x-2 transition-all inline-block">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CONTACT INFO */}
                    <div className="space-y-8">
                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40">Connect</h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-5 h-5 text-white/20 mt-1" />
                                <p className="text-sm font-bold opacity-60">Marian College, Kuttikkanam, Idukki</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="w-5 h-5 text-white/20" />
                                <p className="text-sm font-bold opacity-60">stayease.noreply@gmail.com</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="w-5 h-5 text-white/20" />
                                <p className="text-sm font-bold opacity-60">+91 4869 232203</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM PART */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest opacity-40">
                        <span>© {currentYear} StayEase Madona</span>
                        <div className="w-1 h-1 bg-white/20 rounded-full hidden md:block" />
                        <a href="https://mariancollege.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                            Marian College Kuttikkanam (Autonomous) <ExternalLink size={10} />
                        </a>
                    </div>

                    <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                        {footerLinks.legal.map((link, i) => (
                            <a key={i} href={link.path} className="hover:opacity-100 transition-opacity">{link.name}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
