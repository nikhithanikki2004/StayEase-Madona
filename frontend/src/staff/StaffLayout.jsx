import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    ClipboardList,
    History,
    LogOut,
    ChevronLeft,
    ChevronRight,
    UserCircle,
    Package,
    Calendar,
    Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/staffTheme.css";

export default function StaffLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [staffName, setStaffName] = useState(null);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const token = localStorage.getItem("access");
                if (!token) return;

                const res = await fetch("http://127.0.0.1:8000/api/students/dashboard/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) return;
                const data = await res.json();
                setStaffName(data.full_name || null);
            } catch (err) {
                console.error("Failed to fetch staff name", err);
            }
        };

        fetchStaff();
    }, []);

    const isActive = (path) => {
        if (path === "staff-dashboard" && location.pathname === "/staff-dashboard") return true;
        return location.pathname.includes(path);
    };

    return (
        <div className="flex min-h-screen bg-stay-cream font-sans">
            {/* ========== SIDEBAR ========== */}
            <motion.aside
                initial={{ width: 260 }}
                animate={{ width: collapsed ? 80 : 260 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`bg-stay-mocha text-stay-cream shadow-2xl z-20 flex flex-col relative h-screen sticky top-0`}
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-stay-brown rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 -left-24 w-48 h-48 bg-stay-orange rounded-full blur-3xl"></div>
                </div>

                {/* HEADER */}
                <div className="p-6 flex items-center justify-between relative z-10">
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.h2
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-2xl font-bold text-stay-cream tracking-tight flex items-center gap-2"
                            >
                                <span className="bg-stay-cream text-stay-mocha p-1 rounded-lg">
                                    <LayoutDashboard size={20} />
                                </span>
                                StayEase Staff
                            </motion.h2>
                        )}
                    </AnimatePresence>
                    <button
                        className="p-2 rounded-xl bg-white/5 text-stay-latte hover:bg-white/10 transition-all active:scale-95"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* PROFILE */}
                <div className="px-4 mb-6 relative z-10">
                    <div className={`flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm ${collapsed ? "justify-center" : ""}`}>
                        <div className="relative">
                            <UserCircle size={40} className="text-stay-latte" />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-stay-orange border-2 border-stay-mocha rounded-full"></span>
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm text-stay-cream truncate">{staffName ?? "Staff Member"}</p>
                                <p className="text-xs text-stay-latte font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-stay-orange"></span> Staff Online
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* NAV */}
                <nav className="flex-1 px-3 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
                    <NavItem
                        to="/staff-dashboard"
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        collapsed={collapsed}
                        active={isActive("staff-dashboard")}
                        navigate={navigate}
                    />

                    <NavItem
                        to="assigned-complaints"
                        icon={<ClipboardList size={20} />}
                        label="Assigned Complaints"
                        collapsed={collapsed}
                        active={isActive("assigned-complaints")}
                        navigate={navigate}
                        badge={true}
                    />

                    <NavItem
                        to="inventory"
                        icon={<Package size={20} />}
                        label="Inventory"
                        collapsed={collapsed}
                        active={isActive("inventory")}
                        navigate={navigate}
                    />

                    <NavItem
                        to="maintenance"
                        icon={<Calendar size={20} />}
                        label="Maintenance"
                        collapsed={collapsed}
                        active={isActive("maintenance")}
                        navigate={navigate}
                    />

                    <NavItem
                        to="ratings"
                        icon={<Star size={20} />}
                        label="My Ratings"
                        collapsed={collapsed}
                        active={isActive("ratings")}
                        navigate={navigate}
                    />

                    <NavItem
                        to="history"
                        icon={<History size={20} />}
                        label="Resolution History"
                        collapsed={collapsed}
                        active={isActive("history")}
                        navigate={navigate}
                    />
                </nav>

                {/* LOGOUT */}
                <div className="p-4 relative z-10">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-semibold
                ${collapsed ? "justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-white/5 text-red-300 hover:bg-red-500/10 hover:text-red-200"}
                `}
                    >
                        <LogOut size={20} />
                        {!collapsed && "Logout"}
                    </button>
                </div>
            </motion.aside>

            {/* CONTENT */}
            <main className="flex-1 p-8 overflow-y-auto relative z-0">
                {/* Top bar for mobile or breadcrumbs could go here */}
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}

const NavItem = ({ to, icon, label, collapsed, active, navigate, badge }) => (
    <button
        onClick={() => navigate(to)}
        className={`relative w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group
      ${active
                ? "bg-stay-cream text-stay-mocha font-bold shadow-lg"
                : "text-stay-latte hover:bg-white/5 hover:text-stay-cream"
            }`}
    >
        {/* Active Indicator Line */}
        {active && (
            <motion.div
                layoutId="activeNav"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-stay-orange rounded-r-full"
            />
        )}

        <div className={`relative ${active ? "text-stay-orange" : "group-hover:text-stay-cream transition-colors"}`}>
            {icon}
            {badge && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-stay-orange rounded-full border-2 border-stay-mocha"></span>
            )}
        </div>

        {!collapsed && (
            <span className="truncate">{label}</span>
        )}

        {/* Hover Tooltip for Collapsed State */}
        {collapsed && (
            <div className="absolute left-full ml-4 px-3 py-1 bg-stay-mocha text-stay-cream text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-white/10">
                {label}
            </div>
        )}
    </button>
);
