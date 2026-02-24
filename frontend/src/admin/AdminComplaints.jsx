import React, { useEffect, useState } from "react";
import axios from "axios";


export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [adminReplies, setAdminReplies] = useState({});

  // 🔽 Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // 🔽 Multi-selection
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const token = localStorage.getItem("access");

  const handleUnauthorized = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    if (!token) {
      handleUnauthorized();
      return;
    }

    // 🔹 Fetch complaints
    fetchComplaints();

    // 🔹 Fetch available staff
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/admin/staff/available/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStaffList(res.data))
      .catch((err) => console.error("Failed to load staff", err));
  }, []);

  const fetchComplaints = () => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/admin/complaints/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setComplaints(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load complaints");
        setLoading(false);
        if (err.response?.status === 401) handleUnauthorized();
      });
  };

  // 🔹 Multi-Select Logic
  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleClearSelected = async () => {
    if (selectedIds.size === 0) return;

    if (!window.confirm(`Delete ${selectedIds.size} selected complaints?`)) {
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/complaints/clear/`,
        { ids: Array.from(selectedIds) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComplaints(prev => prev.filter(c => !selectedIds.has(c.id)));
      setIsSelectionMode(false);
      setSelectedIds(new Set());
      alert("Selected complaints cleared!");
    } catch (err) {
      console.error("Failed to clear complaints", err);
      alert("Failed to clear complaints");
    }
  };

  // 🔹 Update priority
  const updatePriority = (complaintId, priority) => {
    axios
      .patch(
        `${import.meta.env.VITE_API_URL}/api/admin/complaints/${complaintId}/priority/`,
        { priority },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        // Update with full response (locks priority)
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === complaintId ? res.data : c
          )
        );
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "Failed to update priority";
        alert(msg);
      });
  };

  // 🔹 Assign staff
  const assignStaff = (complaintId, staffId) => {
    if (!staffId) return;

    axios
      .patch(
        `${import.meta.env.VITE_API_URL}/api/admin/complaints/${complaintId}/assign/`,
        { staff_id: staffId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === complaintId
              ? { ...c, assigned_to: res.data.assigned_to, status: "In Progress" } // ✅ Instant status update
              : c
          )
        );

        setStaffList((prev) =>
          prev.filter((s) => s.id !== Number(staffId))
        );
      })
      .catch(() => alert("Failed to assign staff"));
  };

  /* =========================
     BULK ACTIONS logic
  ========================= */
  const handleBulkAssign = async (staffId) => {
    if (!staffId || selectedIds.size === 0) return;

    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/complaints/bulk-assign/`,
        {
          ids: Array.from(selectedIds),
          staff_id: staffId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Assigned ${selectedIds.size} complaints successfully!`);
      fetchComplaints(); // Refresh data
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      alert("Bulk assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdateStatus = async (status) => {
    if (!status || selectedIds.size === 0) return;

    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/complaints/bulk-update-status/`,
        {
          ids: Array.from(selectedIds),
          status: status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Updated ${selectedIds.size} complaints to ${status}!`);
      fetchComplaints(); // Refresh data
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      alert("Bulk status update failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔽 FILTER LOGIC (Status + Priority)
  const filteredComplaints = complaints.filter((c) => {
    const statusMatch =
      statusFilter === "All" || c.status === statusFilter;
    const priorityMatch =
      priorityFilter === "All" || c.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  if (loading) {
    return <p className="text-center mt-10">Loading complaints...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }

  return (
    <div className="admin-dashboard">
      {/* ===== HEADER + FILTERS ===== */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">All Complaints</h1>

        <div className="flex flex-wrap items-center gap-4">

          {/* Selection & Bulk Actions */}
          <div className="flex items-center gap-2">
            {!isSelectionMode ? (
              <button
                onClick={() => setIsSelectionMode(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md font-medium"
              >
                Enter Selection Mode
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 bg-indigo-50 p-2 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                <span className="text-xs font-bold text-indigo-700 uppercase px-2">
                  {selectedIds.size} Selected
                </span>

                {/* Select All Toggle */}
                <button
                  onClick={() => {
                    if (selectedIds.size === filteredComplaints.length) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(filteredComplaints.map(c => c.id)));
                    }
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:underline px-2"
                >
                  {selectedIds.size === filteredComplaints.length ? "Deselect All" : "Select All"}
                </button>

                <div className="h-6 w-[1px] bg-indigo-200 mx-1"></div>

                {/* Bulk Status Update */}
                <select
                  className="px-2 py-1 text-xs border rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-400"
                  onChange={(e) => handleBulkUpdateStatus(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Bulk Status</option>
                  <option value="Resolved">Mark as Resolved</option>
                  <option value="Submitted">Mark as Submitted</option>
                  <option value="Closed">Mark as Closed</option>
                </select>

                {/* Bulk Assign */}
                <select
                  className="px-2 py-1 text-xs border rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-400"
                  onChange={(e) => handleBulkAssign(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Bulk Assign Staff</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>

                <button
                  onClick={handleClearSelected}
                  disabled={selectedIds.size === 0}
                  className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-lg hover:bg-red-200 border border-red-200 transition disabled:opacity-50 font-bold"
                >
                  Delete
                </button>

                <button
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedIds(new Set());
                  }}
                  className="px-3 py-1 text-gray-500 hover:bg-gray-200 text-xs rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-filter-select"
              >
                <option value="All">All</option>
                <option value="Submitted">Submitted</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="admin-filter-select"
              >
                <option value="All">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="admin-complaints-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              {isSelectionMode && <th className="w-10"></th>}
              <th className="text-left py-4 px-4 font-bold text-gray-600">ID</th>
              <th className="text-left py-4 px-4 font-bold text-gray-600">Student</th>
              <th className="text-left py-4 px-4 font-bold text-gray-600">Category</th>
              <th className="text-left py-4 px-4 font-bold text-gray-600">Priority</th>
              <th className="text-left py-4 px-4 font-bold text-gray-600">Status</th>
              <th className="text-left py-4 px-4 font-bold text-gray-600">Assign Staff</th>
              <th className="text-left py-4 px-4 font-bold text-gray-600">Description</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.map((c) => (
              <>
                <tr key={c.id}>
                  {isSelectionMode && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelection(c.id)}
                        className="w-4 h-4"
                      />
                    </td>
                  )}
                  <td>{c.id}</td>
                  <td>{c.student_name}</td>
                  <td>{c.complaint_category}</td>

                  {/* Priority Column - Merged */}
                  <td>
                    {c.priority_locked ? (
                      <div className="flex items-center gap-2 font-semibold">
                        <span className={`px-2 py-1 rounded text-sm ${c.priority === 'High' ? 'bg-red-100 text-red-700' :
                          c.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                          {c.priority}
                        </span>
                        <span title="Priority Locked">🔒</span>
                      </div>
                    ) : (
                      <select
                        value={c.priority}
                        onChange={(e) => updatePriority(c.id, e.target.value)}
                        className="admin-table-select"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span
                      className={`status-badge ${c.status === "Submitted"
                        ? "status-submitted"
                        : c.status === "In Progress"
                          ? "status-inprogress"
                          : c.status === "Resolved"
                            ? "status-resolved"
                            : "status-closed"
                        }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  {/* Assign Staff */}
                  <td>
                    {/* 🔵 ASSIGNED / IN PROGRESS */}
                    {(c.status === "Submitted" || c.status === "In Progress") &&
                      c.assigned_to && (
                        <div className="text-blue-700 font-semibold flex flex-col">
                          <span className="text-xs text-gray-500">Assigned to</span>
                          <span className="flex items-center gap-1">
                            👷 {c.assigned_to.full_name}
                          </span>
                        </div>
                      )}

                    {/* 🟢 RESOLVED or CLOSED */}
                    {(c.status === "Resolved" || c.status === "Closed") && (
                      <div className="text-green-700 font-semibold flex flex-col">
                        <span className="text-xs text-gray-500">Resolved by</span>
                        <span className="flex items-center gap-1">
                          ✔ {c.resolved_by?.full_name || c.assigned_to?.full_name || "Staff"}
                        </span>
                      </div>
                    )}

                    {/* 🟠 ASSIGN STAFF DROPDOWN (ONLY IF NOT ASSIGNED) */}
                    {c.status === "Submitted" && !c.assigned_to && (
                      <select
                        defaultValue=""
                        onChange={(e) => assignStaff(c.id, e.target.value)}
                        className="border px-2 py-1 rounded-md text-sm"
                      >
                        <option value="">Assign Staff</option>
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* ⚪ NO STAFF */}
                    {!c.assigned_to && c.status !== "Submitted" && (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>


                  {/* Description toggle */}
                  <td>
                    <button
                      onClick={() =>
                        setExpandedComplaint(
                          expandedComplaint === c.id ? null : c.id
                        )
                      }
                      className="underline text-sm"
                    >
                      {expandedComplaint === c.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>

                {/* Expanded description */}
                {expandedComplaint === c.id && (
                  <tr className="admin-description-row">
                    <td colSpan={isSelectionMode ? 8 : 7} className="p-4 text-left">
                      <p className="font-semibold mb-1">
                        Complaint Description
                      </p>
                      <p>{c.description}</p>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
