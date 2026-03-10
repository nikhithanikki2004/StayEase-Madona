import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, GraduationCap, Building2, Hash, Camera,
  CheckCircle2, AlertCircle, Edit3, Save, X, ArrowLeft
} from "lucide-react";

/* =========================
   DROPDOWN OPTIONS
   ========================= */
const ACADEMIC_YEARS = ["1st", "2nd", "3rd", "4th"];
const HOSTELS = [
  "Paul Iby Men's Hostel",
  "Maryknoll Men's Hostel",
  "Carlo Men's Hostel",
  "Madonna Ladies’ Hostel",
  "Pratheeksha Hostel",
  "Amala Hostel",
];
const DEPARTMENTS = ["BBA", "BCA", "BCOM", "BSW", "MBA", "MCOM", "MCA", "MSW"];

const EditProfile = () => {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    department: "",
    year: "",
    hostel_name: "",
    block: "",
    room_number: "",
    profile_picture: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH PROFILE
     ========================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/students/profile/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfile({
          full_name: res.data.full_name || "",
          email: res.data.email || "",
          department: res.data.department || "",
          year: res.data.year || "",
          hostel_name: res.data.hostel_name || "",
          block: res.data.block || "",
          room_number: res.data.room_number || "",
          profile_picture: null,
        });

        if (res.data.profile_picture) {
          setImagePreview(res.data.profile_picture);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  /* =========================
     HANDLERS
     ========================= */
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, profile_picture: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      const formData = new FormData();
      formData.append("department", profile.department);
      formData.append("year", profile.year);
      formData.append("hostel_name", profile.hostel_name);
      formData.append("block", profile.block);
      formData.append("room_number", profile.room_number);

      if (profile.profile_picture) {
        formData.append("profile_picture", profile.profile_picture);
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/students/profile/update/`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowSuccess(true);
      localStorage.removeItem("profile_pic");
      setIsEditing(false);

      setTimeout(() => {
        setShowSuccess(false);
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Profile update failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[#6F4E37] tracking-tight">Profile Dashboard</h1>
        <p className="text-[#6F4E37]/60 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">
          Manage your identity and residency
        </p>
      </div>

      {/* UNIFIED CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(111,78,55,0.15)] border border-[#6F4E37]/5 overflow-hidden relative"
      >
        {/* Banner highlight */}
        <div className="h-32 bg-stay-brown/5 border-b border-[#6F4E37]/5" />

        {/* Action Button: Hidden when editing to avoid clutter at top */}
        <div className="absolute top-8 right-8 z-20">
          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-[#6F4E37] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-[0_20px_40px_rgba(111,78,55,0.3)] transition-all cursor-pointer"
            >
              <Edit3 size={16} /> Edit Profile
            </motion.button>
          ) : (
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 bg-white text-[#6F4E37] border-2 border-[#6F4E37]/10 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg cursor-pointer"
              >
                <X size={16} /> Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-[#6F4E37] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Saving..." : <><Save size={16} /> Save Changes</>}
              </motion.button>
            </div>
          )}
        </div>

        <div className="p-12 -mt-20 flex flex-col items-center">
          {/* PROFILE PICTURE */}
          <div className="relative mb-6">
            <motion.div whileHover={{ scale: 1.02 }} className="relative">
              <img
                src={imagePreview || "/avatar.png"}
                alt="Profile"
                className="w-44 h-44 rounded-full object-cover border-8 border-white shadow-2xl ring-4 ring-[#6F4E37]/5"
              />
              <AnimatePresence>
                {isEditing && (
                  <motion.label
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute bottom-2 right-2 bg-[#6F4E37] text-white p-4 rounded-full cursor-pointer shadow-2xl hover:bg-[#5A3F2C] transition-colors ring-4 ring-white"
                  >
                    <Camera size={24} />
                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                  </motion.label>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#6F4E37] tracking-tight">{profile.full_name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2 opacity-40">
              <Mail size={12} className="text-[#6F4E37]" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] lowercase">{profile.email}</p>
            </div>
          </div>

          {/* DETAILS GRID */}
          <div className="w-full max-w-4xl pt-12 border-t border-[#6F4E37]/5">
            <div className="bg-[#6F4E37] p-2 rounded-xl text-white">
              <Hash size={20} />
            </div>
            <h3 className="text-xl font-black text-[#6F4E37] uppercase tracking-tighter">Profile Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <UnifiedField
                label="Department"
                icon={<GraduationCap size={18} />}
                value={profile.department}
                isEditing={isEditing}
                name="department"
                onChange={handleChange}
                type="select"
                options={DEPARTMENTS}
              />
              <UnifiedField
                label="Academic Year"
                icon={<GraduationCap size={18} />}
                value={profile.year}
                isEditing={isEditing}
                name="year"
                onChange={handleChange}
                type="select"
                options={ACADEMIC_YEARS}
              />
              <UnifiedField
                label="Hostel"
                icon={<Building2 size={18} />}
                value={profile.hostel_name}
                isEditing={isEditing}
                name="hostel_name"
                onChange={handleChange}
                type="select"
                options={HOSTELS}
              />
              <div className="grid grid-cols-2 gap-6">
                <UnifiedField
                  label="Block"
                  icon={<Hash size={14} />}
                  value={profile.block}
                  isEditing={isEditing}
                  name="block"
                  onChange={handleChange}
                />
                <UnifiedField
                  label="Room"
                  icon={<Hash size={14} />}
                  value={profile.room_number}
                  isEditing={isEditing}
                  name="room_number"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SUCCESS POPUP */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white rounded-[4rem] p-12 shadow-2xl text-center max-w-sm w-full border border-[#6F4E37]/10"
            >
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-[#6F4E37] mb-3 tracking-tight">Profile Saved Successfully</h2>
              <p className="text-[#6F4E37]/60 font-medium leading-relaxed">Your identity modifications have been registered in the system.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UnifiedField = ({ label, icon, value, isEditing, name, onChange, type = "text", options = [] }) => (
  <div className="space-y-3">
    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#6F4E37]/30 ml-1">
      {icon} {label}
    </label>
    <div className="relative group">
      {!isEditing ? (
        <div className="w-full bg-[#FDF5E6]/30 border-2 border-transparent p-5 rounded-3xl font-bold text-[#6F4E37] transition-all group-hover:bg-[#FDF5E6]/50">
          {value || "Pending..."}
        </div>
      ) : type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-white border-2 border-[#6F4E37]/10 focus:border-[#6F4E37] focus:ring-8 focus:ring-[#6F4E37]/5 p-5 rounded-3xl font-bold text-[#6F4E37] outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-white border-2 border-[#6F4E37]/10 focus:border-[#6F4E37] focus:ring-8 focus:ring-[#6F4E37]/5 p-5 rounded-3xl font-bold text-[#6F4E37] outline-none transition-all"
        />
      )}
    </div>
  </div>
);

export default EditProfile;
