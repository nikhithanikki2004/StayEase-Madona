import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, AlertCircle, ArrowLeft, Home } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import logo from "../images/stayeaselogo1.png";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";


export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwdRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  const validateField = async (name, value) => {
    let error = "";

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = "Email is required";
      else if (!emailRegex.test(value)) error = "Invalid email format";
      else {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/students/check-email/`,
            { email: value }
          );
          if (!response.data.exists)
            error = "This email is not registered with us.";
        } catch {
          console.error("Email check failed");
        }
      }
    }

    if (name === "password") {
      if (!value) error = "Password is required";
      else if (!pwdRegex.test(value)) {
        error = "8+ chars, Uppercase, Number & Symbol required";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const verifyEmail = async (emailValue) => {
    if (!emailValue) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/students/check-email/`,
        { email: emailValue }
      );
      if (!response.data.exists) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is not registered with us.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    } catch {
      console.error("Connection error during email check");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    if (e.target.name === "email") {
      verifyEmail(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (errors.email || !formData.email || !formData.password) {
      setErrors((prev) => ({
        ...prev,
        password: !formData.password ? "Password is required" : "",
      }));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/students/login/`,
        formData
      );

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("role", response.data.role);

      Swal.fire({
        icon: "success",
        title: "Welcome Back to StayEase 👋",
        html: `
    <p style="font-size:15px; margin-top:6px;">
      Authentication successful.
    </p>
    <p style="margin-top:10px; font-style:italic; color:#6F4E37;">
      “Seamless living starts here.”
    </p>
  `,
        confirmButtonText: "Continue",
        confirmButtonColor: "#6F4E37",
        background: "#FDF5E6",
        color: "#3A2718",
        showClass: {
          popup: "animate__animated animate__fadeInUp"
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutDown"
        }
      }).then(() => {
        if (response.data.role === "admin") {
          navigate("/admin");
        } else if (response.data.role === "staff") {
          navigate("/staff-dashboard");
        } else {
          navigate("/student/home");
        }
      });

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setErrors((prev) => ({
          ...prev,
          password: "Incorrect password. Please try again.",
        }));
      } else {
        alert("An error occurred. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FDF5E6] font-sans selection:bg-[#6F4E37] selection:text-[#FDF5E6] overflow-hidden">

      {/* RETURN TO HOME BUTTON (ABOVE PANEL) */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-8 left-8 z-[60] lg:left-[calc(41.6%+2rem)]"
      >
        <motion.button
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-3 bg-[#6F4E37] text-[#FDF5E6] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl border border-[#6F4E37] hover:bg-[#FDF5E6] hover:text-[#6F4E37] transition-all group"
        >
          <Home className="w-4 h-4" /> Return to Home
        </motion.button>
      </motion.div>

      {/* LEFT PANEL */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="hidden lg:flex lg:w-5/12 bg-[#6F4E37] text-white p-16 flex-col justify-between fixed h-full shadow-2xl z-50"
      >
        <div className="space-y-12">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ rotate: 360 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white p-4 rounded-[2.5rem] w-fit shadow-2xl border-4 border-[#FDF5E6]/20 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="StayEase Logo" className="h-32 object-contain" />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter leading-none">StayEase</h1>
            <p className="text-[#D2B48C] italic text-2xl font-bold opacity-80">
              "Welcome Back to Ease."
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-6 items-start bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-sm"
          >
            <ShieldCheck className="text-[#D2B48C] w-10 h-10 shrink-0" />
            <p className="text-lg font-bold opacity-70 leading-relaxed">
              Your security is our priority. Access your institutional dashboard with precision-level encryption.
            </p>
          </motion.div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">
          © 2026 StayEase Management Ecosystem | Marian College
        </p>
      </motion.div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 lg:ml-[41.6%] relative">
        {/* Animated Background Blobs */}
        <div className="absolute top-[10%] right-[10%] w-64 h-64 bg-[#6F4E37]/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-[#D2B48C]/10 rounded-full blur-[120px] animate-pulse" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-white rounded-[4rem] p-12 md:p-16 shadow-[0_50px_100px_-20px_rgba(111,78,55,0.15)] border border-[#6F4E37]/5 relative z-10"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#6F4E37] tracking-tighter uppercase leading-none mb-3">
              Identity <br /> Verification
            </h2>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 italic">Access your secure ecosystem</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* EMAIL */}
            <div className="space-y-3">
              <label className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-4 mb-2">
                <Mail size={14} className="mr-2" /> Registered Email
              </label>
              <div className="relative group">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-6 bg-[#FDF5E6]/30 border-2 rounded-[2rem] outline-none transition-all font-bold text-[#6F4E37] border-[#6F4E37]/20 focus:border-[#6F4E37] focus:bg-white shadow-inner focus:shadow-xl ${errors.email ? "border-red-500/50 bg-red-50" : ""}`}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-red-500 text-[10px] mt-3 ml-6 font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <AlertCircle size={12} /> {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-3">
              <label className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#6F4E37] ml-4 mb-2">
                <Lock size={14} className="mr-2" /> Secure Password
              </label>
              <div className="relative group">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-6 bg-[#FDF5E6]/30 border-2 rounded-[2rem] outline-none transition-all font-bold text-[#6F4E37] border-[#6F4E37]/20 focus:border-[#6F4E37] focus:bg-white shadow-inner focus:shadow-xl ${errors.password ? "border-red-500/50 bg-red-50" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-6 top-[1.4rem] text-[#6F4E37]/30 hover:text-[#6F4E37] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-red-500 text-[10px] mt-3 ml-6 font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <AlertCircle size={12} /> {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !!errors.email || !pwdRegex.test(formData.password)}
              className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] transition-all duration-300 shadow-2xl ${loading
                ? "bg-[#6F4E37]/20 text-white cursor-not-allowed"
                : "bg-[#6F4E37] text-[#FDF5E6] hover:shadow-[0_20px_50px_rgba(111,78,55,0.4)] border border-[#6F4E37] cursor-pointer"
                }`}
            >
              {loading ? "Verifying..." : "Login"}
            </motion.button>

            <div className="text-center pt-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#6F4E37]/30">
                New to the platform?{" "}
                <NavLink to="/signup" className="text-[#6F4E37] hover:tracking-[0.2em] transition-all border-b border-[#6F4E37]/10 ml-2 pb-1">
                  Create Identity
                </NavLink>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
