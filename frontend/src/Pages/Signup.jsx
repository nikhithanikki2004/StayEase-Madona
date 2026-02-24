import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Lock, Mail, User, Phone, GraduationCap, Home as HomeIcon, Hash, ShieldCheck, Zap, ArrowLeft, Home, Sparkles } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import logo from "../images/stayeaselogo1.png";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";


export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    mobile_number: "",
    department: "",
    year: "",
    hostel_name: "",
    block: "",
    room_number: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const departments = ["BBA", "BCA", "BCOM", "BSW", "MBA", "MCOM", "MCA", "MSW"];
  const years = ["1st", "2nd", "3rd", "4th"];
  const hostels = [
    "Paul Iby Men's Hostel", "Maryknoll Men's Hostel", "Carlo Men's Hostel",
    "Madonna Ladies’ Hostel", "Pratheeksha Hostel", "Amala Hostel"
  ];

  const validateField = async (name, value) => {
    let error = "";
    switch (name) {
      case "full_name":
        if (!value.trim()) error = "Full Name is required";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) error = "Email is required";
        else if (!emailRegex.test(value)) error = "Invalid email format";
        else {
          try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/students/check-email/`, { email: value });
            if (response.data.exists) error = "Email already registered";
          } catch (err) { console.error("Email check failed"); }
        }
        break;
      case "password":
        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!value) error = "Password is required";
        else if (!pwdRegex.test(value)) error = "8+ chars, Uppercase, Number & Symbol required";
        break;
      case "confirm_password":
        if (value !== formData.password) error = "Passwords do not match";
        break;
      case "mobile_number":
        if (!/^\d{10}$/.test(value)) error = "Mobile number must be 10 digits";
        break;
      default:
        if (!value || (typeof value === "string" && !value.trim())) error = "This field is required";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name !== "email") validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const isFormValid = () => {
    const allFilled = Object.values(formData).every(val => val.trim() !== "");
    const noErrors = Object.values(errors).every(err => err === "" || err === undefined);
    return allFilled && noErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      mobile_number: formData.mobile_number,
      department: formData.department,
      year: formData.year,
      hostel_name: formData.hostel_name,
      block: formData.block,
      room_number: formData.room_number,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/students/signup/`,
        payload
      );

      Swal.fire({
        icon: "success",
        title: "Welcome to StayEase 🎉",
        html: `
    <p style="font-size:16px; margin-top:8px;">
      Your account has been created successfully.
    </p>
    <p style="margin-top:10px; font-style:italic; color:#6F4E37;">
      “Where every student voice is heard, and every issue finds resolution.”
    </p>
  `,
        confirmButtonText: "Proceed to Login",
        confirmButtonColor: "#6F4E37",
        background: "#FDF5E6",
        color: "#3A2718",
        showClass: {
          popup: "animate__animated animate__zoomIn"
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut"
        }
      }).then(() => {
        window.location.href = "/login";
      });

    } catch (err) {
      console.error(err.response?.data);
      alert("Signup failed. Please check details.");
    }
  };


  return (
    <div className="min-h-screen flex font-sans selection:bg-[#6F4E37] selection:text-[#FDF5E6] overflow-hidden relative">

      {/* BACKGROUND IMAGE WITH BLUR OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2070"
          alt="Campus Background"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-[#FDF5E6]/80 backdrop-blur-lg mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#6F4E37]/30 via-transparent to-[#FDF5E6]/50" />
      </div>

      {/* RETURN TO HOME BUTTON */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-6 left-6 z-[60] lg:left-auto lg:right-8"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-3 bg-white/80 backdrop-blur-xl text-[#6F4E37] px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(111,78,55,0.2)] border border-[#6F4E37]/10 hover:bg-[#6F4E37] hover:text-[#FDF5E6] transition-all group"
        >
          <Home className="w-4 h-4" /> Return to Home
        </motion.button>
      </motion.div>

      {/* LEFT SIDE: BRANDING PANEL */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="hidden lg:flex lg:w-1/2 bg-[#6F4E37]/95 text-white p-8 flex-col justify-between fixed h-full shadow-2xl z-50 backdrop-blur-xl border-r border-white/10 overflow-y-auto"
      >
        <div className="space-y-12">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ rotate: 360 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white p-4 rounded-[3rem] w-fit shadow-2xl border-4 border-[#FDF5E6]/20 relative overflow-hidden group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="StayEase Logo" className="h-28 w-auto object-contain transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter leading-[0.8]">
              StayEase
            </h1>
            <p className="text-[#D2B48C] italic text-2xl font-bold opacity-80 mt-2">"Empowering Student Voices."</p>
          </div>

          <div className="space-y-6 mt-10">
            {[
              { icon: <ShieldCheck />, text: "Transparent resolution tracking." },
              { icon: <Zap />, text: "Instant hostel notifications." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start space-x-4 bg-white/10 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors group"
              >
                <div className="bg-[#D2B48C] p-3 rounded-2xl text-[#6F4E37] group-hover:rotate-12 transition-transform">{item.icon}</div>
                <p className="text-white/80 text-lg font-bold leading-tight">{item.text}</p>
              </motion.div>
            ))}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/40 leading-relaxed italic border-l-4 border-[#D2B48C] pl-6 py-2 text-sm"
            >
              "Redefining hostel management with professional efficiency."
            </motion.p>
          </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 italic">© 2026 StayEase | Marian College</p>
      </motion.div>

      {/* RIGHT SIDE: UNIQUE REGISTRATION FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:ml-[50%] relative z-10 min-h-screen overflow-y-auto">

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl bg-white/70 backdrop-blur-2xl rounded-[3rem] p-6 md:p-8 shadow-[0_80px_150px_-30px_rgba(111,78,55,0.25)] border-2 border-white relative my-6"
        >
          <div className="text-center mb-6 relative">
            <div className="inline-flex items-center gap-2 mb-2 px-1 py-1 rounded-full text-[#6F4E37]/40">
              <Sparkles size={12} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Institutional Enrollment</span>
            </div>
            <h2 className="text-3xl font-black text-[#6F4E37] tracking-tighter uppercase leading-[0.8] mb-2">
              Create <br />
              <span className="opacity-50">Identity.</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

            {/* Full Name */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-3 italic">
                <User size={12} className="mr-2" /> Full Name
              </label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 bg-[#FDF5E6]/40 border-2 rounded-[2rem] outline-none transition-all font-bold text-sm text-[#6F4E37] placeholder:text-[#6F4E37]/30 shadow-inner ${errors.full_name ? 'border-red-500/50 bg-red-50' : 'border-[#6F4E37]/20 focus:border-[#6F4E37] focus:bg-white focus:shadow-xl'}`}
              />
              {errors.full_name && <p className="text-red-500 text-[9px] ml-3 font-black uppercase tracking-widest">{errors.full_name}</p>}
            </div>

            {/* Email Address */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-3 italic">
                <Mail size={12} className="mr-2" /> Email
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 bg-[#FDF5E6]/40 border-2 rounded-[2rem] outline-none transition-all font-bold text-sm text-[#6F4E37] placeholder:text-[#6F4E37]/30 shadow-inner ${errors.email ? 'border-red-500/50 bg-red-50' : 'border-[#6F4E37]/20 focus:border-[#6F4E37] focus:bg-white focus:shadow-xl'}`}
              />
              {errors.email && <p className="text-red-500 text-[9px] ml-3 font-black uppercase tracking-widest">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-3 italic">
                <Lock size={12} className="mr-2" /> Create Password
              </label>
              <div className="relative group">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 bg-[#FDF5E6]/40 border-2 rounded-[2rem] outline-none transition-all font-bold text-sm text-[#6F4E37] placeholder:text-[#6F4E37]/30 shadow-inner ${errors.password ? 'border-red-500/50 bg-red-50' : 'border-[#6F4E37]/20 focus:border-[#6F4E37] focus:bg-white focus:shadow-xl'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer absolute right-5 top-[1rem] text-[#6F4E37]/30 hover:text-[#6F4E37] transition-all hover:scale-110">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[8px] ml-3 font-black uppercase tracking-wider leading-tight">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-3 italic">
                <Lock size={12} className="mr-2" /> Confirm Password
              </label>
              <div className="relative group">
                <input
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 bg-[#FDF5E6]/40 border-2 rounded-[2rem] outline-none transition-all font-bold text-sm text-[#6F4E37] placeholder:text-[#6F4E37]/30 shadow-inner ${errors.confirm_password ? 'border-red-500/50 bg-red-50' : 'border-[#6F4E37]/20 focus:border-[#6F4E37] focus:bg-white focus:shadow-xl'}`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="cursor-pointer absolute right-5 top-[1rem] text-[#6F4E37]/30 hover:text-[#6F4E37] transition-all hover:scale-110">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-red-500 text-[9px] ml-3 font-black uppercase tracking-widest">{errors.confirm_password}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-3 italic">
                <Phone size={12} className="mr-2" /> Contact
              </label>
              <input
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 bg-[#FDF5E6]/40 border-2 rounded-[2rem] outline-none transition-all font-bold text-sm text-[#6F4E37] placeholder:text-[#6F4E37]/30 shadow-inner ${errors.mobile_number ? 'border-red-500/50 bg-red-50' : 'border-[#6F4E37]/20 focus:border-[#6F4E37] focus:bg-white focus:shadow-xl'}`}
              />
              {errors.mobile_number && <p className="text-red-500 text-[9px] ml-3 font-black uppercase tracking-widest">{errors.mobile_number}</p>}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-3 italic">
                <GraduationCap size={12} className="mr-2" /> Dept
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-3 bg-[#FDF5E6]/40 border-2 border-[#6F4E37]/20 rounded-[2rem] outline-none transition-all focus:border-[#6F4E37] focus:bg-white focus:shadow-xl font-bold text-sm text-[#6F4E37] appearance-none"
              >
                <option value="">Select</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <label className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-3 italic">
                <GraduationCap size={12} className="mr-2" /> Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full p-3 bg-[#FDF5E6]/40 border-2 border-[#6F4E37]/20 rounded-[2rem] outline-none transition-all focus:border-[#6F4E37] focus:bg-white focus:shadow-xl font-bold text-sm text-[#6F4E37] appearance-none"
              >
                <option value="">Select</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Hostel Name */}
            <div className="space-y-2">
              <label className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-3 italic">
                <HomeIcon size={12} className="mr-2" /> Hostel
              </label>
              <select
                name="hostel_name"
                value={formData.hostel_name}
                onChange={handleChange}
                className="w-full p-3 bg-[#FDF5E6]/40 border-2 border-[#6F4E37]/20 rounded-[2rem] outline-none transition-all focus:border-[#6F4E37] focus:bg-white focus:shadow-xl font-bold text-sm text-[#6F4E37] appearance-none"
              >
                <option value="">Select</option>
                {hostels.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            {/* Block & Room */}
            <div className="space-y-2">
              <label className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-3 italic">
                <Hash size={12} className="mr-2" /> Block
              </label>
              <input
                name="block"
                value={formData.block}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full p-3 bg-[#FDF5E6]/40 border-2 border-[#6F4E37]/20 rounded-[2rem] outline-none transition-all focus:border-[#6F4E37] focus:bg-white focus:shadow-xl font-bold text-sm text-[#6F4E37] placeholder:text-[#6F4E37]/30"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-3 italic">
                <Hash size={12} className="mr-2" /> Room
              </label>
              <input
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full p-3 bg-[#FDF5E6]/40 border-2 border-[#6F4E37]/20 rounded-[2rem] outline-none transition-all focus:border-[#6F4E37] focus:bg-white focus:shadow-xl font-bold text-sm text-[#6F4E37] placeholder:text-[#6F4E37]/30"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              disabled={!isFormValid()}
              className={`md:col-span-2 py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] transition-all duration-500 shadow-3xl mt-3 cursor-pointer ${isFormValid() ? 'bg-[#6F4E37] text-[#FDF5E6] hover:shadow-[0_40px_80px_-20px_rgba(111,78,55,0.4)] border-2 border-[#6F4E37]/10' : 'bg-[#6F4E37]/20 text-white cursor-not-allowed'}`}
            >
              Complete Registration
            </motion.button>

            <div className="md:col-span-2 text-center pt-2 mb-2">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6F4E37]/30">
                Already registered?{" "}
                <NavLink to="/login" className="text-[#6F4E37] hover:tracking-[0.4em] transition-all border-b-2 border-[#6F4E37]/5 ml-3 pb-2 font-black italic">
                  Enter Identity
                </NavLink>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
