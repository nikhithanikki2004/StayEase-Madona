import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";
import { Megaphone, AlertTriangle, Clock } from "lucide-react";
import stdimage from "../images/stdimage.png";

/* 🔹 STAGGER CONTAINER */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

/* 🔹 CARD ANIMATION */
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 25,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const Home = () => {
  const [student, setStudent] = useState(null);
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("access");

        // Fetch Dashboard Data
        const res = await axios.get(
          "http://127.0.0.1:8000/api/students/dashboard/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStudent(res.data);

        // Fetch Active Broadcasts
        const broadcastRes = await axios.get(
          "http://127.0.0.1:8000/api/broadcasts/active/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setActiveBroadcasts(broadcastRes.data);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchStudent();
  }, []);

  if (!student) {
    return <p className="text-center mt-10">Loading dashboard...</p>;
  }


  return (
    <PageTransition>
      {/* 🚨 EMERGENCY BROADCAST BANNERS */}
      {activeBroadcasts.length > 0 && (
        <div className="mb-6 space-y-3">
          {activeBroadcasts.map((broadcast) => (
            <motion.div
              key={broadcast.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="relative overflow-hidden bg-red-600 text-white rounded-2xl shadow-lg border-2 border-red-500/20"
            >
              <div className="flex items-center gap-4 p-5 relative z-10">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm animate-pulse">
                  <Megaphone size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm uppercase tracking-tighter flex items-center gap-2">
                    <AlertTriangle size={14} /> Emergency {broadcast.category} Notice
                  </h4>
                  <p className="text-lg font-bold leading-tight mt-0.5">{broadcast.title}</p>
                  <p className="text-sm text-white/90 mt-1 font-medium">{broadcast.message}</p>

                  {broadcast.expected_resolution_time && (
                    <div className="flex items-center gap-2 mt-3 text-xs font-black bg-black/10 w-fit px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">
                      <Clock size={12} /> Resolution: {broadcast.expected_resolution_time}
                    </div>
                  )}
                </div>
              </div>
              {/* Decorative Pulsing background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 animate-ping"></div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🔹 WELCOME */}
      {/* 🔹 NEW WELCOME BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-b from-[#6F4E37] to-[#5a3d2b] rounded-3xl p-8 mb-10 shadow-xl overflow-hidden text-white flex items-center justify-between"
      >
        {/* Background Decorative Circles */}
        <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-30px] right-[20%] w-24 h-24 bg-[#8D6E63]/30 rounded-full blur-2xl"></div>

        {/* Text Content */}
        <div className="relative z-10 max-w-lg">
          <p className="text-white/90 text-sm font-medium mb-1 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            <span className="block text-white/90">Welcome</span>
            <span className="flex items-center gap-3 text-[#FFE4C4]">
              Back, {student.full_name.split(' ')[0]}!
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                className="inline-block origin-bottom-right text-4xl"
              >
                👋
              </motion.span>
            </span>
          </h1>
          <p className="text-white/90 text-lg font-light max-w-md">
            Always stay updated in your student portal. Your comfort is our priority!
          </p>
        </div>

        {/* 3D Illustration */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:flex items-center justify-end relative z-10 w-[400px] h-[340px] overflow-visible"
          style={{
            maskImage: 'radial-gradient(circle at center, black 45%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 85%)',
          }}
        >
          {/* Subtle Ambient Glow behind the image */}
          <div className="absolute inset-0 bg-[#FFE4C4]/10 blur-[120px] rounded-full pointer-events-none transform scale-75 translate-y-10"></div>

          <img
            src={stdimage}
            alt="Student Welcome"
            className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-700 hover:scale-110"
          />
        </motion.div>
      </motion.div>

      {/* 🔹 STAGGERED CARDS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* 🔹 QUICK ACTIONS */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <h3 className="text-xl font-semibold mb-2 text-stay-brown">
            Quick Actions
          </h3>

          <p className="text-gray-600 mb-4">
            Easily manage your hostel complaints.
          </p>

          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink
                to="/student/complaints/new"
                className="btn-light-brown"
              >
                ➕ Register Complaint
              </NavLink>
            </motion.div>
            <NavLink
              to="/student/complaints"
              className="btn-light-brown-outline"
            >
              📋 View Complaint History
            </NavLink>
            {/* Go To Landing Page */}
            <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}>
              <NavLink to="/" className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-stay-brown/90 to-[#7a5037] text-stay-cream font-semibold shadow-lg hover:brightness-95 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 1.293a1 1 0 00-1.414 0L2 8.586V17a1 1 0 001 1h5a1 1 0 001-1v-4h2v4a1 1 0 001 1h5a1 1 0 001-1V8.586l-7.293-7.293z" />
                </svg>
                Go To Home
              </NavLink>
            </motion.div>
          </div>
        </motion.div>


        {/* 🔹 LATEST UPDATE */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <h3 className="text-xl font-semibold mb-2 text-stay-brown">
            Latest Update
          </h3>

          {student.latest_update ? (
            <>
              <p className="text-gray-600">
                Your last complaint status:{" "}
                <b>{student.latest_update.status}</b>
              </p>
              <p className="text-gray-600 mt-2">
                Last updated on:{" "}
                <b>
                  {new Date(
                    student.latest_update.updated_at
                  ).toLocaleString()}
                </b>
              </p>
            </>
          ) : (
            <p className="text-gray-500 italic">
              No complaints submitted yet.
            </p>
          )}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
};

export default Home;
