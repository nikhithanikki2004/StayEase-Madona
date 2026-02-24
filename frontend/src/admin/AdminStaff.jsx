import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    mobile_number: "",
  });

  const token = localStorage.getItem("access");

  /* ================= FETCH STAFF ================= */
  const fetchStaff = () => {
    axios
      .get("http://127.0.0.1:8000/api/admin/staff/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStaff(res.data))
      .catch(() => Swal.fire("Error", "Failed to load staff", "error"));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  /* ================= CREATE STAFF ================= */
  const handleCreate = () => {
    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.mobile_number.trim()
    ) {
      Swal.fire("Required", "All fields are required", "warning");
      return;
    }

    setLoading(true);

    axios
      .post(
        "http://127.0.0.1:8000/api/admin/staff/create/",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Staff Created",
          text: "New staff member added successfully",
          timer: 1800,
          showConfirmButton: false,
          background: "#fffaf5",
        });

        setForm({
          full_name: "",
          email: "",
          password: "",
          mobile_number: "",
        });

        fetchStaff();
      })
      .catch((err) => {
        Swal.fire(
          "Error",
          err.response?.data?.error || "Failed to create staff",
          "error"
        );
      })
      .finally(() => setLoading(false));
  };

  /* ================= DELETE STAFF ================= */
  const handleDelete = async (staffId, staffName) => {
    const result = await Swal.fire({
      title: "Delete Staff?",
      text: `Are you sure you want to remove ${staffName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#fffaf5",
      confirmButtonColor: "#6f4e37",
      cancelButtonColor: "#9ca3af",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/admin/staff/${staffId}/delete/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStaff((prev) => prev.filter((s) => s.id !== staffId));

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Staff removed successfully",
        timer: 1500,
        showConfirmButton: false,
        background: "#fffaf5",
      });
    } catch {
      Swal.fire("Error", "Unable to delete staff", "error");
    }
  };

  return (
    <motion.div
      className="staff-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ===== TITLE ===== */}
      <h1 className="staff-title">Staff Management</h1>

      {/* ===== CREATE STAFF CARD ===== */}
      <motion.div
        className="staff-card"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 180 }}
      >
        <h2 className="staff-card-title">➕ Add New Staff</h2>

        <div className="staff-form-grid">
          <input
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <input
            placeholder="Mobile Number"
            value={form.mobile_number}
            onChange={(e) =>
              setForm({ ...form, mobile_number: e.target.value })
            }
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          disabled={loading}
          className="staff-primary-btn"
        >
          {loading ? "Creating..." : "Create Staff"}
        </motion.button>
      </motion.div>

      {/* ===== STAFF TABLE ===== */}
      <motion.div
        className="staff-table-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <table className="staff-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="5" className="staff-empty">
                    No staff found
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <td>{s.full_name}</td>
                    <td>{s.email}</td>
                    <td>{s.mobile_number}</td>
                    <td>
                      <span
                        className={`staff-badge ${
                          s.available ? "available" : "busy"
                        }`}
                      >
                        {s.available ? "Available" : "Busy"}
                      </span>
                    </td>
                    <td>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleDelete(s.id, s.full_name)
                        }
                        disabled={!s.available}
                        className={`staff-delete-btn ${
                          !s.available && "disabled"
                        }`}
                      >
                        Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
