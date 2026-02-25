import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

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

const DEPARTMENTS = [
  "BBA", "BCA", "BCOM", "BSW", "MBA", "MCOM", "MCA", "MSW",
];



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
  const [editableField, setEditableField] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  /* =========================
     FETCH PROFILE
  ========================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/students/profile/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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
          // profile_picture is now a base64 data URI
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
    setProfile({ ...profile, profile_picture: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("access");

      const formData = new FormData();
      formData.append("department", profile.department); // ✅ added
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowSuccess(true);
      // Clear cached pic so sidebar fetches fresh base64 from server
      localStorage.removeItem("profile_pic");

      setTimeout(() => {
        setShowSuccess(false);
        window.location.href = "/student/home";
      }, 2500);

    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      {/* ===== PROFILE CARD ===== */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-3xl shadow-lg p-8 text-center border border-stay-brown/20"
      >
        <div className="relative inline-block">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={imagePreview || "/avatar.png"}
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover mx-auto border-4 border-stay-brown shadow-md"
          />
          <label className="absolute bottom-2 right-2 bg-stay-brown text-stay-cream p-2 rounded-full cursor-pointer">
            📷
            <input type="file" hidden onChange={handleImageChange} />
          </label>
        </div>

        <h2 className="text-2xl font-bold mt-4 text-stay-brown">
          {profile.full_name}
        </h2>
        <p className="text-gray-500">Student Profile</p>
      </motion.div>

      {/* ===== EDIT DETAILS ===== */}
      <motion.div className="bg-white rounded-3xl shadow-lg p-8 border border-stay-brown/20 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-stay-brown">
            Profile Details
          </h3>
          <button
            onClick={() => setEditableField(editableField ? null : "all")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${editableField === "all"
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-stay-brown/10 text-stay-brown border border-stay-brown/20"
              }`}
          >
            {editableField === "all" ? "Cancel Editing" : "✏️ Edit Profile"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Email" value={profile.email} disabled />

          <SelectField
            label="Department"
            name="department"
            value={profile.department}
            options={DEPARTMENTS}
            onChange={handleChange}
            disabled={editableField !== "all"}
          />

          <SelectField
            label="Academic Year"
            name="year"
            value={profile.year}
            options={ACADEMIC_YEARS}
            onChange={handleChange}
            disabled={editableField !== "all"}
          />

          <SelectField
            label="Hostel Name"
            name="hostel_name"
            value={profile.hostel_name}
            options={HOSTELS}
            onChange={handleChange}
            disabled={editableField !== "all"}
          />

          <InputField
            label="Block"
            name="block"
            value={profile.block}
            onChange={handleChange}
            disabled={editableField !== "all"}
          />

          <InputField
            label="Room Number"
            name="room_number"
            value={profile.room_number}
            onChange={handleChange}
            disabled={editableField !== "all"}
          />
        </div>

        {editableField === "all" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="px-8 py-3 bg-stay-brown text-stay-cream rounded-xl font-bold shadow-lg"
            >
              Save Changes
            </motion.button>
            <button
              onClick={() => setEditableField(null)}
              className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold"
            >
              Discard
            </button>
          </motion.div>
        )}
      </motion.div>
      {/* ✅ SUCCESS POPUP — PLACE IT HERE */}
      {/* ✅ CENTER SUCCESS MODAL */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-3xl px-10 py-8 shadow-2xl text-center max-w-sm w-full"
          >
            <div className="text-5xl mb-4">✅</div>

            <h2 className="text-2xl font-bold text-stay-brown mb-2">
              Profile Updated!
            </h2>

            <p className="text-gray-600">
              Your changes have been saved successfully.
            </p>
          </motion.div>
        </motion.div>
      )}

    </motion.div>


  );
};

/* =========================
   INPUT COMPONENTS
========================= */

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold mb-1 text-stay-brown">
      {label}
    </label>
    <input
      {...props}
      className="w-full border rounded-xl px-4 py-2 bg-gray-100 cursor-not-allowed"
    />
  </div>
);

const InputField = ({ label, name, value, onChange, disabled }) => (
  <div className="space-y-1">
    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-stay-brown/60 ml-2">
      {label}
    </label>
    <input
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      className={`w-full border-2 rounded-2xl px-5 py-3 font-bold transition-all ${disabled
        ? "bg-gray-50 border-transparent text-gray-500"
        : "bg-white border-stay-brown ring-4 ring-stay-brown/5 text-stay-brown"
        }`}
    />
  </div>
);

const SelectField = ({ label, name, value, options, onChange, disabled }) => (
  <div className="space-y-1">
    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-stay-brown/60 ml-2">
      {label}
    </label>
    <select
      name={name}
      value={value}
      disabled={disabled}
      onChange={onChange}
      className={`w-full border-2 rounded-2xl px-5 py-3 font-bold appearance-none transition-all ${disabled
        ? "bg-gray-50 border-transparent text-gray-500"
        : "bg-white border-stay-brown ring-4 ring-stay-brown/5 text-stay-brown"
        }`}
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default EditProfile;
