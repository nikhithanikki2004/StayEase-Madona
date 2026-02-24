import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import StaffStatusDonut from "./StaffStatusDonut";
import HostelActivity from "./HostelActivity";
import {
  ClipboardList,
  Activity,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  Zap,
  Package
} from "lucide-react";

export default function StaffDashboard() {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem("access");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/staff/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!stats)
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-staff-turquoise border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <motion.div
      className="space-y-8 max-w-7xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ================= HEADER ================= */}
      <div className="mb-8 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-stay-brown to-[#3E2723] p-10 text-stay-cream shadow-2xl border border-white/10 group">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute -right-20 -top-20 w-96 h-96 bg-stay-orange/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={200} className="text-stay-orange" />
          </motion.div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-stay-orange/20 text-stay-orange text-xs font-bold uppercase tracking-widest mb-4 ring-1 ring-stay-orange/30">
                Staff Command Center
              </span>
              <h1 className="text-5xl font-black tracking-tight mb-4 leading-tight">
                {stats.welcome_message} <span className="inline-block hover:rotate-12 transition-transform cursor-pointer">👋</span>
              </h1>
              <p className="text-stay-latte font-medium text-xl max-w-xl leading-relaxed opacity-90">
                Empowering your mission to create a perfect stay. Manage, monitor, and master the day ahead.
              </p>
            </motion.div>
          </div>

          <motion.div
            className="w-48 h-48 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl flex items-center justify-center relative overflow-hidden group-hover:border-stay-orange/30 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <Activity size={80} className="text-stay-orange opacity-40 group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-stay-orange/10 to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Assigned"
          value={stats.total_assigned}
          icon={<ClipboardList size={28} />}
          color="text-stay-orange"
          bg="bg-stay-orange/10"
          border="border-stay-orange/20"
          delay={0.1}
        />

        <StatCard
          title="In Progress"
          value={stats.in_progress}
          icon={<Activity size={28} />}
          color="text-stay-brown"
          bg="bg-stay-brown/10"
          border="border-stay-brown/20"
          delay={0.2}
        />

        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle size={28} />}
          color="text-emerald-600"
          bg="bg-emerald-600/10"
          border="border-emerald-600/20"
          delay={0.3}
        />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ===== HOSTEL ACTIVITY OVERVIEW ===== */}
        <motion.div
          className="bg-white rounded-[2rem] p-8 shadow-xl shadow-stay-brown/5 border border-stay-brown/5 flex flex-col relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Sparkles size={120} />
          </div>
          <HostelActivity />
        </motion.div>

        {/* ===== STAFF TIPS ===== */}
        <motion.div
          className="lg:col-span-2 bg-gradient-to-br from-stay-mocha to-[#3E2723] rounded-[2rem] p-10 shadow-xl border border-white/5 relative overflow-hidden text-stay-cream"
          initial={{ opacity: 0, x: 15 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Lightbulb size={250} className="text-stay-orange" />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-stay-orange/20 text-stay-orange backdrop-blur-md ring-1 ring-white/10">
                <Lightbulb size={28} />
              </div>
              Expert Guidelines
            </h2>
            <div className="text-stay-latte text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stay-orange animate-pulse" />
              Real-time Insights
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <TipCard
              text="Check assigned complaints daily to keep response times low."
              delay={0.1}
              icon={<Activity size={18} />}
            />
            <TipCard
              text="Prioritize high-impact issues (electrical, water) first."
              delay={0.2}
              icon={<Zap size={18} />}
            />
            <TipCard
              text="Update inventory logs immediately after using materials."
              delay={0.3}
              icon={<Package size={18} />}
            />
            <TipCard
              text="Leave clear, concise resolution notes for future reference."
              delay={0.4}
              icon={<ArrowUpRight size={18} />}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const StatCard = ({ title, value, icon, color, bg, border, delay }) => (
  <motion.div
    className={`bg-white p-6 rounded-3xl shadow-sm border ${border} hover:shadow-md transition-all relative overflow-hidden group`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -5 }}
  >
    <div className={`p-3 rounded-2xl w-fit mb-4 ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <div>
      <h3 className="text-staff-text-secondary text-sm font-semibold uppercase tracking-wider mb-1 opacity-70">{title}</h3>
      <p className={`text-4xl font-extrabold ${color}`}>
        {value}
      </p>
    </div>
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${bg} opacity-50 blur-2xl group-hover:opacity-100 transition-opacity`}></div>
  </motion.div>
);

const TipCard = ({ text, delay, icon }) => (
  <motion.div
    className="group p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-stay-orange/30 hover:bg-white/[0.08] transition-all relative overflow-hidden"
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -4, scale: 1.02 }}
    viewport={{ once: true }}
  >
    <div className="absolute top-0 right-0 p-3 text-stay-orange/20 group-hover:text-stay-orange/40 transition-colors">
      {icon}
    </div>
    <div className="flex items-start gap-4">
      <div className="mt-1 w-2 h-2 rounded-full bg-stay-orange shadow-[0_0_10px_rgba(255,152,0,0.5)] shrink-0" />
      <p className="text-sm font-semibold text-stay-latte group-hover:text-stay-cream transition-colors leading-relaxed">
        {text}
      </p>
    </div>

    {/* Subtle Glow Effect */}
    <div className="absolute -inset-1 bg-gradient-to-r from-stay-orange/0 via-stay-orange/5 to-stay-orange/0 opacity-0 group-hover:opacity-100 transition-opacity blur-lg pointer-events-none" />
  </motion.div>
);
