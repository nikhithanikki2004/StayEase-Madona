import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  GraduationCap,
  Headphones,
  LogOut,
  Bell,
  Package,
  Calendar,
  Megaphone
} from "lucide-react";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const [newComplaintCount, setNewComplaintCount] = useState(0);
  const [newEscalationCount, setNewEscalationCount] = useState(0);

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* =========================
     FETCH NEW COMPLAINT COUNT
  ========================= */
  useEffect(() => {
    const viewed = localStorage.getItem("complaintsViewed");

    if (viewed === "true") {
      setNewComplaintCount(0);
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/admin/complaints/?status=Submitted`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      )
      .then((res) => {
        setNewComplaintCount(res.data.length);
      })
      .catch((err) => {
        console.error("Failed to fetch complaint count", err);
      });
  }, []);

  /* =========================
     FETCH ESCALATION COUNT
  ========================= */
  useEffect(() => {
    const viewed = localStorage.getItem("escalationsViewed");

    if (viewed === "true") {
      setNewEscalationCount(0);
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/admin/staff-updates/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      )
      .then((res) => {
        // Count escalations only (not resolutions)
        const escalationCount = res.data.filter(
          (update) => update.note_type === "Escalation"
        ).length;
        setNewEscalationCount(escalationCount);
      })
      .catch((err) => {
        console.error("Failed to fetch escalation count", err);
      });
  }, []);

  /* =========================
     FETCH NEW ESCALATION COUNT
  ========================= */
  useEffect(() => {
    const escalationsViewed = localStorage.getItem("escalationsViewed");

    if (escalationsViewed === "true") {
      setNewEscalationCount(0);
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/admin/staff-updates/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      )
      .then((res) => {
        // Count escalations only (note_type === "Escalation")
        const escalationCount = res.data.filter(
          (update) => update.note_type === "Escalation"
        ).length;
        setNewEscalationCount(escalationCount);
      })
      .catch((err) => {
        console.error("Failed to fetch escalation count", err);
      });
  }, []);

  return (
    <aside className="admin-sidebar">
      {/* ===== BRAND / AVATAR ===== */}
      <div className="admin-sidebar-header">
        <div className="admin-avatar">
          <span>A</span>
        </div>

        <div className="admin-identity">
          <span className="admin-logo">StayEase</span>
          <span className="admin-subtitle">Admin</span>
        </div>
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav className="admin-nav">
        <NavLink end to="" className="admin-link">
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        {/* 🔔 Complaints with Bell */}
        <NavLink
          to="complaints"
          className="admin-link"
          onClick={() => localStorage.setItem("complaintsViewed", "true")}
        >
          <FileText size={18} />
          <span>Complaints</span>

          {newComplaintCount > 0 && (
            <span className="complaint-bell">
              <Bell size={16} />
              <span className="complaint-count">
                {newComplaintCount}
              </span>
            </span>
          )}
        </NavLink>

        <NavLink to="staff" className="admin-link">
          <Users size={18} />
          <span>Staff Management</span>
        </NavLink>

        <NavLink to="/admin/staff-performance" className="admin-link">
          <BarChart3 size={18} />
          <span>Staff Performance</span>
        </NavLink>

        <NavLink to="staff-updates" className="admin-link" onClick={() => localStorage.setItem("escalationsViewed", "true")}>
          <Bell size={18} />
          <span>Staff Updates</span>

          {newEscalationCount > 0 && (
            <span className="complaint-bell">
              <Bell size={16} />
              <span className="complaint-count">
                {newEscalationCount}
              </span>
            </span>
          )}
        </NavLink>

        <NavLink to="/admin/students" className="admin-link">
          <GraduationCap size={18} />
          <span>Student Management</span>
        </NavLink>

        <NavLink to="inventory" className="admin-link">
          <Package size={18} />
          <span>Inventory</span>
        </NavLink>

        <NavLink to="maintenance" className="admin-link">
          <Calendar size={18} />
          <span>Maintenance</span>
        </NavLink>

        <NavLink to="broadcast" className="admin-link">
          <Megaphone size={18} />
          <span>Broadcast</span>
        </NavLink>

        <NavLink to="reports" className="admin-link">
          <FileText size={18} />
          <span>Reports</span>
        </NavLink>

        <NavLink to="/admin/support" className="admin-link">
          <Headphones size={18} />
          <span>Support Inbox</span>
        </NavLink>

        {/* ===== LOGOUT ===== */}
        <button onClick={handleLogout} className="admin-logout-inline">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
