import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Info, PhoneCall, Layers, ShieldCheck } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from "react-router-dom";
const logo = "/stayeaselogo1.png";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Community', href: '/community' },
        { name: 'About Us', href: '/about-us' },
        { name: 'Contact', href: '/contact-us' },
    ];

    const isInternal = (href) => href.startsWith('/');

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b
        ${isScrolled
                    ? 'bg-[#FDF5E6]/95 backdrop-blur-xl py-4 shadow-lg border-[#6F4E37]/10'
                    : 'bg-transparent py-8 border-transparent'}`}
        >
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">

                {/* LOGO SECTION */}
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate("/")}>
                    <div className="relative">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ rotate: 360 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
                        >
                            <img src={logo} alt="StayEase Logo" className="w-full h-full object-contain scale-125" />
                        </motion.div>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-3xl font-black tracking-tighter text-[#6F4E37]">StayEase</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ml-0.5 whitespace-nowrap">Marian College, Kuttikkanam</span>
                    </div>
                </div>

                {/* DESKTOP NAV LINKS */}
                <div className="hidden lg:flex items-center gap-12">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.href}
                            className={({ isActive }) => `
                font-bold transition-all relative group text-[11px] uppercase tracking-[0.2em]
                ${isActive ? 'text-[#6F4E37]' : 'text-[#6F4E37]/60 hover:text-[#6F4E37]'}
              `}
                        >
                            {link.name}
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#6F4E37] transition-all group-hover:w-full ${location.pathname === link.href ? 'w-full' : 'w-0'}`} />
                        </NavLink>
                    ))}
                    <a
                        href="https://mariancollege.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6F4E37]/60 hover:text-[#6F4E37] font-bold transition-all relative group text-[11px] uppercase tracking-[0.2em]"
                    >
                        Marian Connect
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6F4E37] transition-all group-hover:w-full" />
                    </a>
                </div>

                {/* AUTH ACTIONS */}
                <div className="hidden md:flex items-center gap-8">
                    <NavLink
                        to="/login"
                        className="text-[#6F4E37]/70 font-black text-[11px] uppercase tracking-[0.2em] hover:text-[#6F4E37] transition-all"
                    >
                        Login
                    </NavLink>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <NavLink
                            to="/signup"
                            className="bg-[#6F4E37] text-[#FDF5E6] px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl border border-[#6F4E37]"
                        >
                            Join Portal
                        </NavLink>
                    </motion.div>
                </div>

                {/* Hamburger */}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-[#6F4E37]">
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-32 left-4 right-4 bg-white rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(111,78,55,0.4)] border border-[#6F4E37]/10 lg:hidden"
                    >
                        <div className="flex flex-col gap-8">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.href}
                                    className="flex items-center gap-4 text-3xl font-black uppercase tracking-tighter text-[#6F4E37]"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                            <div className="h-px bg-[#6F4E37]/10 w-full" />
                            <button
                                onClick={() => { navigate("/signup"); setIsMenuOpen(false); }}
                                className="w-full py-6 bg-[#6F4E37] text-[#FDF5E6] rounded-2xl font-black shadow-lg uppercase tracking-widest text-lg"
                            >
                                Join Portal
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
