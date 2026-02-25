import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Home,
  FileText,
  BarChart3,
  User,
  Star,
  Headphones,
  LogOut
} from "lucide-react";

const StudentSidebar = () => {
  const [studentName, setStudentName] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("access");

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/students/dashboard/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStudentName(res.data.full_name);

        const rawPic = res.data.profile_picture || res.data.profile?.profile_picture;
        if (rawPic) {
          const baseUrl = import.meta.env.VITE_API_URL || "";
          // If the returned path starts with http/https, use it as is.
          const finalUrl = rawPic.startsWith("http")
            ? rawPic
            : `${baseUrl.replace(/\/$/, "")}${rawPic.startsWith("/") ? "" : "/"}${rawPic}`;

          setProfilePic(finalUrl);
        }
      } catch (err) {
        console.error("Sidebar fetch failed", err);
      }
    };

    fetchStudent();
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200
     ${isActive
      ? "bg-[#FFF3E0] text-[#6F4E37] font-semibold shadow"
      : "text-[#FDF5E6] hover:bg-[#FFF3E0] hover:text-[#6F4E37]"
    }`;

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-gradient-to-b from-[#6F4E37] to-[#5a3d2b] px-5 py-8 flex flex-col z-50">

      {/* 🔹 PROFILE SECTION */}
      <div
        className="flex flex-col items-center mb-10 cursor-pointer"
        onClick={() => navigate("/student/profile")}
        title="Edit Profile"
      >
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-[#FDF5E6] shadow-lg hover:scale-105 transition"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#FDF5E6] text-[#6F4E37] flex items-center justify-center text-4xl font-bold shadow-lg">
            {studentName ? studentName.charAt(0) : "S"}
          </div>
        )}

        <p className="mt-4 text-[#FDF5E6] font-semibold text-lg text-center">
          {studentName ?? "Loading..."}
        </p>
      </div>

      {/* 🔹 NAV LINKS */}
      <nav className="flex-1 space-y-2 overflow-y-auto">
        <NavLink to="/student/home" className={linkClass}>
          <Home size={18} /> Home
        </NavLink>

        <NavLink to="/student/complaints" className={linkClass}>
          <FileText size={18} /> Complaints
        </NavLink>

        <NavLink to="/student/progress" className={linkClass}>
          <BarChart3 size={18} /> Complaint Progress
        </NavLink>

        <NavLink to="/student/profile" className={linkClass}>
          <User size={18} /> Edit Profile
        </NavLink>

        <NavLink to="/student/ratings" className={linkClass}>
          <Star size={18} /> Ratings
        </NavLink>

        <NavLink to="/student/support" className={linkClass}>
          <Headphones size={18} /> Student Support
        </NavLink>
      </nav>

      {/* 🔹 LOGOUT */}
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
        className="mt-6 flex items-center gap-3 px-5 py-3 rounded-xl bg-[#4b3325] text-[#FDF5E6] hover:bg-red-600 transition"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
};

export default StudentSidebar;
