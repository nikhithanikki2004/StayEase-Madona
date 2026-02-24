import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  AlertTriangle,
  Clock,
  Upload,
  Send,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  X
} from "lucide-react";
import PageTransition from "../components/PageTransition";

/* 🔹 DROPDOWN OPTIONS */
const DEPARTMENTS = [
  "BBA", "BCA", "BCOM", "BSW", "MBA", "MCOM", "MCA", "MSW"
];

const ACADEMIC_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

const RegisterComplaint = () => {
  const [student, setStudent] = useState({
    student_name: "",
    department: "",
    year: "",
    id: "", // Added student id for display
  });

  const [form, setForm] = useState({
    hostel_id: "",
    complaint_category: "",
    description: "",
    image: null,
  });

  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);
  const [bypassAcknowledge, setBypassAcknowledge] = useState(false);

  const token = localStorage.getItem("access");

  /* 🔹 FETCH STUDENT INFO & ACTIVE BROADCASTS */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await axios.get(
          "http://127.0.0.1:8000/api/students/dashboard/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStudent({
          student_name: studentRes.data.full_name || "",
          department: studentRes.data.profile?.department || "",
          year: studentRes.data.profile?.year || "",
          id: studentRes.data.id || "",
        });

        const broadcastRes = await axios.get(
          "http://127.0.0.1:8000/api/broadcasts/active/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setActiveBroadcasts(broadcastRes.data);

      } catch (err) {
        console.error("Failed to fetch page data", err);
      }
    };

    fetchData();
  }, [token]);

  const matchingBroadcast = activeBroadcasts.find(b =>
    b.category.toLowerCase() === form.complaint_category.toLowerCase() ||
    (b.category === "Food / Mess" && form.complaint_category === "Food/Mess")
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "complaint_category") {
      setBypassAcknowledge(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setImageName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("hostel_id", form.hostel_id);
    formData.append("complaint_category", form.complaint_category);
    formData.append("description", form.description);

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/complaints/student/",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(true);
      setForm({
        hostel_id: "",
        complaint_category: "",
        description: "",
        image: null,
      });
      setImageName("");

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      {/* ✅ SUCCESS POPUP */}
      <AnimatePresence>
        {success && (
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
              className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm w-full mx-4 border border-stay-brown/10"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-stay-brown uppercase tracking-tight">
                Submitted!
              </h3>
              <p className="text-gray-500 font-medium mt-2">
                Your complaint has been registered. We'll get back to you soon.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto py-10">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-stay-brown uppercase tracking-tighter"
          >
            Register a Complaint
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-stay-brown/60 font-medium italic mt-2"
          >
            Raise your concern. We'll take care of the rest.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-stay-brown/10 border border-stay-brown/5 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Hostel ID */}
              <InputField
                label="Hostel ID"
                name="hostel_id"
                value={form.hostel_id}
                onChange={handleChange}
                required
              />

              {/* Student Name */}
              <InputField
                label="Student Name"
                value={student.student_name}
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Department */}
              <SelectField
                label="Department"
                name="department"
                value={student.department}
                options={DEPARTMENTS}
                onChange={(e) => setStudent(prev => ({ ...prev, department: e.target.value }))}
                required
              />

              {/* Academic Year */}
              <SelectField
                label="Academic Year"
                name="year"
                value={student.year}
                options={ACADEMIC_YEARS}
                onChange={(e) => setStudent(prev => ({ ...prev, year: e.target.value }))}
                required
              />
            </div>

            {/* Complaint Category */}
            <SelectField
              label="Complaint Category"
              name="complaint_category"
              value={form.complaint_category}
              onChange={handleChange}
              options={[
                "Electricity", "Plumbing", "Furniture", "Cleaning",
                "Water", "Internet", "Food/Mess", "Security",
                "Noise/Discipline", "Staff/Management", "Medical", "Other"
              ]}
              required
            />

            {/* BROADCAST ALERT */}
            <AnimatePresence>
              {form.complaint_category && matchingBroadcast && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex gap-5 items-start relative overflow-hidden group"
                >
                  <div className="bg-amber-500 text-white p-3 rounded-2xl shadow-lg ring-4 ring-amber-100">
                    <AlertTriangle size={24} className="animate-pulse" />
                  </div>
                  <div className="flex-1 z-10">
                    <h4 className="font-black text-amber-900 text-xs uppercase tracking-widest flex items-center gap-2">
                      Active System Notice
                    </h4>
                    <p className="text-amber-800 text-sm mt-2 font-medium leading-relaxed">
                      Maintenance is already scheduled for **{matchingBroadcast.category}**:
                      <span className="block mt-1 font-black text-base">"{matchingBroadcast.title}"</span>
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2">
                        <Clock size={12} /> EST. FIX: {matchingBroadcast.expected_resolution_time || "TBD"}
                      </span>
                    </div>

                    <div className="mt-5 pt-4 border-t border-amber-200/50">
                      <label className="flex items-center gap-3 cursor-pointer group/label">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={bypassAcknowledge}
                            onChange={(e) => setBypassAcknowledge(e.target.checked)}
                          />
                          <div className="w-6 h-6 border-2 border-amber-300 rounded-lg transition-all peer-checked:bg-amber-500 peer-checked:border-amber-500"></div>
                          <CheckCircle2 size={16} className="absolute top-1 left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs font-black text-amber-800 uppercase tracking-tight group-hover/label:text-amber-950 transition-colors">
                          My issue is different or not covered by this notice
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Issue Description */}
            <TextareaField
              label="Issue Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Please provide detailed information about the issue you are facing..."
              required
            />

            {/* Attachment */}
            <div className="space-y-3">
              <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-stay-brown/60 ml-2">
                Attachment (Optional)
              </label>
              <FileField
                onChange={handleImageChange}
                fileName={imageName}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || (matchingBroadcast && !bypassAcknowledge)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full py-5 rounded-2xl flex items-center justify-center gap-4 font-black uppercase tracking-[0.25em] text-sm shadow-xl transition-all
                ${loading || (matchingBroadcast && !bypassAcknowledge)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-stay-brown text-stay-cream hover:bg-stay-brown/90 shadow-stay-brown/20"
                }
              `}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <>
                  <Send size={18} />
                  {matchingBroadcast && !bypassAcknowledge ? "Check Acknowledgement" : "Submit Complaint"}
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
};

/* 🔹 HELPER COMPONENTS */

const InputField = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-stay-brown/60 ml-2">
      {label}
    </label>
    <input
      {...props}
      className={`
        w-full px-6 py-4 rounded-2xl border-2 font-bold transition-all outline-none text-stay-brown placeholder:text-gray-300
        ${props.disabled
          ? "bg-gray-50 border-transparent text-gray-400 cursor-not-allowed"
          : "bg-white border-stay-brown/10 focus:border-stay-brown focus:ring-4 focus:ring-stay-brown/5 shadow-sm"
        }
      `}
    />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div className="space-y-2">
    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-stay-brown/60 ml-2">
      {label}
    </label>
    <div className="relative">
      <select
        {...props}
        className={`
          w-full px-6 py-4 rounded-2xl border-2 font-bold transition-all outline-none appearance-none text-stay-brown
          ${props.disabled
            ? "bg-gray-50 border-transparent text-gray-400 cursor-not-allowed"
            : "bg-white border-stay-brown/10 focus:border-stay-brown focus:ring-4 focus:ring-stay-brown/5 shadow-sm"
          }
        `}
      >
        <option value="">{`Select ${label}`}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {!props.disabled && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stay-brown/40">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  </div>
);

const TextareaField = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-stay-brown/60 ml-2">
      {label}
    </label>
    <textarea
      {...props}
      className="w-full px-6 py-4 rounded-2xl border-2 border-stay-brown/10 font-bold transition-all outline-none text-stay-brown focus:border-stay-brown focus:ring-4 focus:ring-stay-brown/5 shadow-sm placeholder:text-gray-300 min-h-[140px]"
    />
  </div>
);

const FileField = ({ onChange, fileName }) => (
  <div className="relative group">
    <input
      type="file"
      onChange={onChange}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
    />
    <div className={`
      w-full p-8 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4
      ${fileName
        ? "bg-stone-50 border-stay-brown text-stay-brown"
        : "bg-white border-stay-brown/20 text-stay-brown/40 group-hover:border-stay-brown group-hover:bg-stay-brown/5"
      }
    `}>
      <div className={`p-4 rounded-2xl transition-all ${fileName ? "bg-stay-brown text-stay-cream" : "bg-gray-50 text-gray-400 group-hover:bg-stay-brown group-hover:text-stay-cream"}`}>
        <Upload size={28} />
      </div>
      <div className="text-center">
        <p className="font-black uppercase tracking-widest text-xs">
          {fileName ? fileName : "Click to upload or drag and drop"}
        </p>
        {!fileName && (
          <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">PNG, JPG, PDF (max 5MB)</p>
        )}
      </div>
      {fileName && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-green-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-lg"
        >
          <CheckCircle2 size={16} />
        </motion.div>
      )}
    </div>
  </div>
);

export default RegisterComplaint;
