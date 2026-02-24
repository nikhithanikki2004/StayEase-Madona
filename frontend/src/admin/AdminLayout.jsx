import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

// ✅ import admin dashboard css
import "../styles/admin-dashboard.css";

export default function AdminLayout() {
  return (
    <div className="admin-root min-h-screen flex">
      <AdminSidebar />
      <div className="admin-content flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
