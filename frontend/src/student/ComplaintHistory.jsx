import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

/* 🔹 CATEGORY INFO */
const complaintCategories = [
  { name: "Electricity", desc: "Fan, lights, power issues." },
  { name: "Plumbing", desc: "Leakage, taps, drainage problems." },
  { name: "Furniture", desc: "Broken cot, chair, cupboard." },
  { name: "Cleaning", desc: "Room & washroom hygiene." },
  { name: "Water", desc: "Shortage, drinking water issues." },
  { name: "Internet", desc: "WiFi & connectivity problems." },
  { name: "Food / Mess", desc: "Food quality & timing." },
  { name: "Security", desc: "Safety & entry issues." },
  { name: "Noise / Discipline", desc: "Disturbance & rule violations." },
  { name: "Staff / Management", desc: "Staff & admin concerns." },
  { name: "Medical", desc: "Health & first-aid." },
  { name: "Other", desc: "Miscellaneous issues." },
];

/* 🔹 NORMALIZE STATUS (NO BACKEND CHANGE) */
const normalizeStatus = (status) =>
  status?.toString().toLowerCase().replace("_", " ");

const statusBadgeStyles = {
  submitted: "bg-blue-100 text-blue-700",
  "in progress": "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-200 text-gray-700",
};

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/complaints/student/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setComplaints(res.data);
      } catch (err) {
        console.error("Failed to load complaints", err);
      }
    };

    fetchComplaints();
  }, [token]);

  /* 🔹 STATISTICS */
  const stats = {
    ALL: complaints.length,
    Submitted: complaints.filter(
      (c) => normalizeStatus(c.status) === "submitted"
    ).length,
    "In Progress": complaints.filter(
      (c) => normalizeStatus(c.status) === "in progress"
    ).length,
    Resolved: complaints.filter(
      (c) => normalizeStatus(c.status) === "resolved"
    ).length,
    Closed: complaints.filter(
      (c) => normalizeStatus(c.status) === "closed"
    ).length,
  };

  /* 🔹 FILTERED COMPLAINTS */
  const filteredComplaints =
    filterStatus === "ALL"
      ? complaints
      : complaints.filter(
          (c) =>
            normalizeStatus(c.status) ===
            normalizeStatus(filterStatus)
        );

  return (
    <div>
      {/* HEADER */}
      <h2 className="text-3xl font-bold text-stay-brown mb-1">
        Complaint History
      </h2>
      <p className="text-gray-600 italic mb-6">
        Overview of all complaints raised by you.
      </p>

      {/* 🔹 STATISTICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(stats).map(([label, value]) => (
          <StatCard
            key={label}
            label={label === "ALL" ? "Total" : label}
            value={value}
            active={filterStatus === label}
            onClick={() => setFilterStatus(label)}
          />
        ))}
      </div>

      {/* 🔹 ACTION BUTTONS */}
      <div className="flex flex-wrap gap-4 mb-8">
        <NavLink
          to="/student/complaints/new"
          className="bg-stay-brown text-stay-cream px-5 py-2 rounded-lg shadow hover:opacity-90 transition"
        >
          ➕ Register New Complaint
        </NavLink>

        <button
          onClick={() =>
            document
              .getElementById("complaint-categories")
              .scrollIntoView({ behavior: "smooth" })
          }
          className="border border-stay-brown text-stay-brown px-5 py-2 rounded-lg shadow hover:bg-stay-brown hover:text-stay-cream transition"
        >
          📂 View Complaint Categories
        </button>
      </div>

      {/* 🔹 COMPLAINT CARDS */}
      <div className="space-y-6">
        {filteredComplaints.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-600">
              No complaints found for this status.
            </p>
          </div>
        )}

        {filteredComplaints.map((complaint) => (
          <div
            key={complaint.id}
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold text-stay-brown">
                {complaint.complaint_category}
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusBadgeStyles[
                    normalizeStatus(complaint.status)
                  ] || "bg-gray-100 text-gray-600"
                }`}
              >
                {complaint.status}
              </span>
            </div>

            <p className="text-gray-600 mb-1">
              <b>Hostel ID:</b> {complaint.hostel_id}
            </p>

            <p className="text-gray-600 mb-2">
              {complaint.description}
            </p>

            <p className="text-sm text-gray-400">
              Submitted on{" "}
              {new Date(complaint.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* 🔹 CATEGORY SECTION */}
      <div
        id="complaint-categories"
        className="mt-14 bg-white rounded-xl shadow p-6"
      >
        <h3 className="text-2xl font-bold text-stay-brown mb-2">
          Complaint Categories
        </h3>
        <p className="text-gray-600 mb-6 italic">
          Understand categories before raising a complaint.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaintCategories.map((cat, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 hover:shadow transition"
            >
              <h4 className="font-semibold text-stay-brown">
                {cat.name}
              </h4>
              <p className="text-sm text-gray-600">
                {cat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* 🔹 STAT CARD */
const StatCard = ({ label, value, active, onClick }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl shadow p-4 text-center transition ${
      active
        ? "bg-stay-brown text-stay-cream"
        : "bg-white hover:bg-gray-100"
    }`}
  >
    <p className="text-sm">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default ComplaintHistory;
