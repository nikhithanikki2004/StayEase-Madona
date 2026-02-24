import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/admin/students/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to load students", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentStatus = async (studentId) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/admin/students/${studentId}/toggle/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchStudents();
    } catch (error) {
      alert("Failed to update student status");
    }
  };

  const deleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to permanently remove this student record? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/admin/students/${studentId}/remove/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to remove student");
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading students...</p>;
  }

  return (
    <div>
      {/* HEADER */}
      <h2 className="text-3xl font-bold text-stay-brown mb-1">
        🎓 Student Management
      </h2>
      <p className="text-gray-600 italic mb-8">
        Monitor student activity and complaint statistics.
      </p>

      {/* STUDENT LIST */}
      <div className="space-y-6">
        {students.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            No students found.
          </div>
        )}

        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-xl shadow p-6 flex flex-col lg:flex-row justify-between gap-6"
          >
            {/* LEFT – STUDENT INFO */}
            <div>
              <h3 className="text-xl font-semibold">
                {student.full_name}
              </h3>

              <p className="text-gray-600 text-sm">
                📧 {student.email}
              </p>

              <p className="text-gray-600 text-sm mt-1">
                🏠 {student.hostel_name || "-"} | Block{" "}
                {student.block || "-"} | Room{" "}
                {student.room_number || "-"}
              </p>

              <p className="text-gray-600 text-sm">
                🎓 {student.department || "-"} –{" "}
                {student.year || "-"}
              </p>

              {/* STATUS BADGE */}
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${student.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {student.is_active ? "Active" : "Disabled"}
              </span>
            </div>

            {/* RIGHT – STATS + ACTIONS */}
            <div className="flex flex-wrap gap-4 items-center">
              <Stat
                label="Total"
                value={student.total_complaints}
              />
              <Stat
                label="Active"
                value={student.active_complaints}
              />
              <Stat
                label="Resolved"
                value={student.resolved_complaints}
              />

              {/* VIEW DETAILS */}
              <button
                onClick={() =>
                  navigate(`/admin/students/${student.id}`)
                }
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                View Details
              </button>

              {/* ENABLE / DISABLE */}
              <button
                onClick={() => toggleStudentStatus(student.id)}
                className={`px-4 py-2 rounded-lg transition-all ${student.is_active
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
              >
                {student.is_active ? "Disable Account" : "Enable Account"}
              </button>

              {/* PERMANENT REMOVE (Only if disabled) */}
              {!student.is_active && (
                <button
                  onClick={() => deleteStudent(student.id)}
                  className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all flex items-center gap-2"
                  title="Permanently remove student record"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* 🔹 STAT CARD COMPONENT */
const Stat = ({ label, value }) => (
  <div className="bg-gray-50 px-4 py-2 rounded-lg text-center min-w-[90px]">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-lg font-bold text-stay-brown">
      {value}
    </p>
  </div>
);

export default AdminStudents;
