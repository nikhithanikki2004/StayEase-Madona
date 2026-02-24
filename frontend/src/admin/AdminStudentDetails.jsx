import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminStudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);

  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  const fetchStudentDetails = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/admin/students/${id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStudent(res.data.student);
      setStats(res.data.statistics);
      setComplaints(res.data.complaints);
    } catch (error) {
      console.error("Failed to load student details", error);
    }
  };

  const closeComplaint = async (complaintId) => {
    if (!window.confirm("Are you sure you want to close this complaint?")) {
      return;
    }

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/admin/complaints/${complaintId}/close/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchStudentDetails(); // refresh
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Cannot close complaint before student feedback"
      );
    }
  };

  if (!student || !stats) {
    return <p className="p-6">Loading student details...</p>;
  }

  return (
    <div className="space-y-6">
      {/* 🔙 BACK */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline"
      >
        ← Back to Student Management
      </button>

      {/* 👤 STUDENT HEADER */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold">{student.full_name}</h2>
        <p className="text-gray-600">{student.email}</p>
        <p className="text-gray-600">{student.mobile_number}</p>

        <p className="mt-2">
          🏠 {student.hostel_name} | Block {student.block} | Room{" "}
          {student.room_number}
        </p>
        <p>
          🎓 {student.department} – {student.year}
        </p>
      </div>

      {/* 📊 STATISTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Resolved" value={stats.resolved} />
        <StatCard label="Closed" value={stats.closed} />
      </div>

      {/* 📋 COMPLAINTS */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Complaints</h3>

        {complaints.map((c) => {
          const isResolved = c.status === "Resolved";
          const isClosed = c.status === "Closed";
          const hasRating = !!c.rating;

          return (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow p-5 space-y-3"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">
                  {c.category}
                </h4>
                <span className="font-medium">
                  Status: <b>{c.status}</b>
                </span>
              </div>

              <p>Priority: {c.priority}</p>

              <p className="text-sm text-gray-500">
                Submitted on:{" "}
                {new Date(c.created_at).toLocaleString()}
              </p>
              

              {/* 🛠 RESOLUTION NOTES */}
              {c.resolution_notes && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-semibold">Resolution Notes</p>
                  <p>{c.resolution_notes}</p>
                </div>
              )}

              {/* ⭐ STUDENT FEEDBACK */}
              {hasRating && (
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-semibold">Student Feedback</p>
                  <p className="text-yellow-500">
                    {"★".repeat(c.rating.rating)}
                  </p>
                  <p className="italic">{c.rating.feedback}</p>
                </div>
              )}

              {/* 🔒 CLOSE COMPLAINT SECTION */}
              {isResolved && (
                <div className="flex items-center justify-between mt-4">
                  {!hasRating ? (
                    <>
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                        🕒 Awaiting Student Feedback
                      </span>
                      <button
                        disabled
                        className="px-4 py-2 rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed"
                      >
                        Close Complaint
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                        ✅ Ready to Close
                      </span>
                      <button
                        onClick={() => closeComplaint(c.id)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        Close Complaint
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* 🔐 ALREADY CLOSED */}
              {isClosed && (
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm">
                  🔒 Complaint Closed
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* 🔹 STAT CARD */
const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-xl shadow p-4 text-center">
    <p className="text-gray-500">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminStudentDetails;
