import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    BarChart3,
    Download,
    Filter,
    PieChart,
    TrendingUp,
    AlertCircle,
    Users,
    Calendar,
    Building,
    FileText,
    Sparkles,
    ShieldCheck,
    Zap,
    Clock,
    Star
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
const logo = "/stayeaselogo1.png";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

export default function AdminReports() {
    // ---------------- STATE ----------------
    const [reportType, setReportType] = useState("complaints"); // complaints, staff, student, escalation
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [hostel, setHostel] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    const brandColors = {
        primary: "#6F4E37",
        secondary: "#D2B48C",
        accent: "#FDF5E6",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#E11D48",
        info: "#36A2EB"
    };

    // ---------------- FETCH DATA ----------------
    const fetchReport = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access");
            const params = {
                type: reportType,
                start_date: dateRange.start,
                end_date: dateRange.end,
                hostel: hostel,
            };

            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/reports/`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            setData(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch report data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [reportType, dateRange, hostel]);

    // ---------------- PDF GENERATION ----------------
    const generatePDF = () => {
        const doc = jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        // Add Header Background
        doc.setFillColor(111, 78, 55); // #6F4E37
        doc.rect(0, 0, 210, 40, 'F');

        // Brand Name
        doc.setTextColor(253, 245, 230); // #FDF5E6
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("StayEase", 30, 22);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("STUDENT RESIDENTIAL MANAGEMENT SYSTEM", 30, 30);

        // Add logo image relative to text
        const img = new Image();
        img.src = logo;
        img.onload = () => {
            doc.addImage(img, 'PNG', 15, 12, 12, 12);
            finalizePDF();
        };

        // If for some reason image fails, still generate
        img.onerror = () => {
            finalizePDF();
        };

        const finalizePDF = () => {
            // Report Info Section
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            const reportTitle = `${reportType.toUpperCase()} ANALYTICS REPORT`;
            doc.text(reportTitle, 210 - 15 - doc.getTextWidth(reportTitle), 20);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            const genDate = `Generated: ${new Date().toLocaleString()}`;
            doc.text(genDate, 210 - 15 - doc.getTextWidth(genDate), 30);

            // Add a line separator
            doc.setDrawColor(210, 180, 140); // #D2B48C
            doc.setLineWidth(1);
            doc.line(15, 45, 195, 45);

            // Metadata Section
            doc.setTextColor(111, 78, 55);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Filter Criteria:", 15, 55);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            const filterText = [
                `Date Range: ${dateRange.start || 'All Time'} to ${dateRange.end || 'Present'}`,
                `Hostel: ${hostel || 'All Hostels'}`,
                `Analytic Scope: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`
            ].join("  |  ");
            doc.text(filterText, 15, 62);

            let tableColumn = [];
            let tableRows = [];

            if (reportType === "complaints") {
                tableColumn = ["Category", "Volume (Count)"];
                data?.category_stats?.forEach(item => {
                    tableRows.push([item.complaint_category, item.count]);
                });

                // Add status summary
                tableRows.push([{ content: "STATUS SUMMARY OVERVIEW", colSpan: 2, styles: { fillColor: [245, 245, 245], fontStyle: 'bold', halign: 'center' } }]);
                data?.status_stats?.forEach(s => {
                    tableRows.push([s.status, s.count]);
                });

            } else if (reportType === "staff") {
                tableColumn = ["Staff Professional", "Assigned", "Resolved", "Efficiency Rate (%)", "Avg Time"];
                data?.data?.forEach(item => {
                    const efficiency = item.assigned ? Math.round((item.resolved / item.assigned) * 100) : 0;
                    tableRows.push([
                        item.name,
                        item.assigned,
                        item.resolved,
                        `${efficiency}%`,
                        `${item.avg_time || 0} hrs`
                    ]);
                });

            } else if (reportType === "student") {
                tableColumn = ["Student Identifier", "Contact Email", "Complaint Volume"];
                data?.top_students?.forEach(item => {
                    tableRows.push([item.student__full_name, item.student__email, item.count]);
                });

            } else if (reportType === "escalation") {
                tableColumn = ["ID", "Category", "Staff Responder", "Escalation Reason", "Logged Date"];
                data?.data?.forEach(item => {
                    tableRows.push([
                        `#${item.id}`,
                        item.category,
                        item.staff,
                        item.reason,
                        new Date(item.date).toLocaleDateString()
                    ]);
                });
            }

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 70,
                theme: 'grid',
                headStyles: {
                    fillColor: [111, 78, 55],
                    textColor: [253, 245, 230],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    valign: 'middle'
                },
                columnStyles: {
                    0: { fontStyle: 'bold' }
                },
                alternateRowStyles: {
                    fillColor: [253, 245, 230]
                }
            });

            // Add Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`StayEase Proprietary Reporting System - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
                doc.text("confidential", 195, 285, { align: 'right' });
            }

            doc.save(`${reportType}_report_${new Date().getTime()}.pdf`);
            toast.success("Professional Report Downloaded", {
                style: {
                    background: brandColors.primary,
                    color: brandColors.accent,
                    borderRadius: '1rem',
                    fontWeight: 'bold'
                }
            });
        };
    };

    // ---------------- CHARTS CONFIG ----------------
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    font: { weight: 'bold', size: 12 },
                    usePointStyle: true,
                    padding: 20,
                    color: brandColors.primary
                }
            },
            tooltip: {
                backgroundColor: 'rgba(111, 78, 55, 0.9)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 12,
                displayColors: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { display: false }
            },
            x: {
                grid: { display: false }
            }
        },
        maintainAspectRatio: false
    };

    // ---------------- RENDER HELPERS ----------------
    const renderComplaintCharts = () => {
        if (!data) return null;

        const categoryData = {
            labels: data.category_stats?.map((d) => d.complaint_category) || [],
            datasets: [
                {
                    label: "Complaints",
                    data: data.category_stats?.map((d) => d.count) || [],
                    backgroundColor: [
                        "#6F4E37", "#D2B48C", "#A0522D", "#CD853F", "#DEB887", "#F4A460", "#BC8F8F"
                    ],
                    borderWidth: 2,
                    borderColor: 'white'
                },
            ],
        };

        const statusData = {
            labels: data.status_stats?.map((d) => d.status) || [],
            datasets: [
                {
                    label: "Status Volume",
                    data: data.status_stats?.map((d) => d.count) || [],
                    backgroundColor: [
                        "rgba(16, 185, 129, 0.8)", // Resolved
                        "rgba(225, 29, 72, 0.8)",  // Closed
                        "rgba(245, 158, 11, 0.8)", // In Progress
                        "rgba(107, 114, 128, 0.8)" // Submitted
                    ],
                    borderRadius: 12,
                    borderWidth: 0
                }
            ]
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <PieChart size={64} color={brandColors.primary} />
                    </div>
                    <h3 className="font-black text-[#6F4E37] mb-8 text-center text-xl tracking-tighter uppercase">Category Distribution</h3>
                    <div className="h-72 flex justify-center">
                        <Pie data={categoryData} options={chartOptions} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <BarChart3 size={64} color={brandColors.primary} />
                    </div>
                    <h3 className="font-black text-[#6F4E37] mb-8 text-center text-xl tracking-tighter uppercase">Status Breakdown</h3>
                    <div className="h-72">
                        <Bar data={statusData} options={chartOptions} />
                    </div>
                </motion.div>
            </div>
        );
    };

    const renderStaffTable = () => {
        if (!data || !data.data) return null;
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-3xl border border-white overflow-hidden p-4"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#6F4E37]/5 text-[#6F4E37] border-b border-[#6F4E37]/10">
                            <tr>
                                <th className="p-6 font-black uppercase tracking-widest text-[10px]">Staff Responder</th>
                                <th className="p-6 font-black uppercase tracking-widest text-[10px]">Total Assigned</th>
                                <th className="p-6 font-black uppercase tracking-widest text-[10px]">Resolved Cases</th>
                                <th className="p-6 font-black uppercase tracking-widest text-[10px]">Avg Response Time</th>
                                <th className="p-6 font-black uppercase tracking-widest text-[10px]">Performance Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#6F4E37]/5">
                            {data.data.map((staff, idx) => (
                                <tr key={idx} className="hover:bg-[#FDF5E6]/40 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-[#D2B48C]/20 flex items-center justify-center text-[#6F4E37] font-black group-hover:scale-110 transition-transform">
                                                {staff.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-[#6F4E37] text-base">{staff.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 font-bold text-gray-500">{staff.assigned}</td>
                                    <td className="p-6">
                                        <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-black text-[10px] uppercase">
                                            {staff.resolved} Resolved
                                        </span>
                                    </td>
                                    <td className="p-6 font-mono text-[#6F4E37]/70 font-bold">{staff.avg_time || "0.00"} hrs</td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 max-w-[120px] bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((staff.resolved / (staff.assigned || 1)) * 100, 100)}%` }}
                                                    transition={{ duration: 1, ease: "circOut" }}
                                                    className="bg-gradient-to-r from-[#D2B48C] to-[#6F4E37] h-full rounded-full"
                                                />
                                            </div>
                                            <span className="font-black text-[#6F4E37] text-[11px]">
                                                {Math.round((staff.resolved / (staff.assigned || 1)) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        )
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 font-sans selection:bg-[#6F4E37] selection:text-[#FDF5E6]">

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white/40 p-8 rounded-[3rem] backdrop-blur-md border border-white/50">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#6F4E37] rounded-xl text-white shadow-lg">
                            <TrendingUp size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-[#6F4E37] tracking-tighter uppercase leading-[0.8]">
                            Insights <span className="opacity-30">& Stats.</span>
                        </h1>
                    </div>
                    <p className="text-[#6F4E37]/60 text-sm font-bold italic border-l-4 border-[#D2B48C] pl-4">
                        Professional analytics for StayEase hostel management.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generatePDF}
                    className="flex items-center gap-4 bg-[#6F4E37] text-[#FDF5E6] px-10 py-5 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_25px_50px_-12px_rgba(111,78,55,0.4)] hover:shadow-[0_40px_80px_-20px_rgba(111,78,55,0.6)] transition-all group"
                >
                    <Download size={20} className="group-hover:bounce" />
                    Export to PDF
                </motion.button>
            </div>

            {/* FILTERS PANEL */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 p-6 rounded-[3rem] shadow-2xl border border-white flex flex-wrap gap-6 items-center backdrop-blur-xl"
            >
                <div className="flex items-center gap-3 text-[#6F4E37] px-4 py-2 bg-[#D2B48C]/10 rounded-2xl">
                    <Filter size={18} />
                    <span className="font-black uppercase text-[10px] tracking-widest">Active Filters</span>
                </div>

                {/* Report Type Selector */}
                <div className="flex gap-2 p-1.5 bg-[#FDF5E6] rounded-[2rem] border-2 border-[#6F4E37]/5">
                    {['complaints', 'staff', 'student', 'escalation'].map(type => (
                        <button
                            key={type}
                            onClick={() => setReportType(type)}
                            className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${reportType === type
                                ? 'bg-[#6F4E37] text-[#FDF5E6] shadow-xl scale-105'
                                : 'text-[#6F4E37]/40 hover:text-[#6F4E37]'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F4E37]/30" />
                        <input
                            type="date"
                            className="bg-[#FDF5E6]/50 border-2 border-[#6F4E37]/10 rounded-[1.5rem] px-10 py-2.5 text-xs font-bold text-[#6F4E37] focus:border-[#6F4E37] focus:ring-0 outline-none transition-all"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <span className="text-[#6F4E37]/20 font-black">TO</span>
                    <div className="relative">
                        <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F4E37]/30" />
                        <input
                            type="date"
                            className="bg-[#FDF5E6]/50 border-2 border-[#6F4E37]/10 rounded-[1.5rem] px-10 py-2.5 text-xs font-bold text-[#6F4E37] focus:border-[#6F4E37] focus:ring-0 outline-none transition-all"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                </div>

                <div className="relative">
                    <Building size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F4E37]/30" />
                    <select
                        className="bg-[#FDF5E6]/50 border-2 border-[#6F4E37]/10 rounded-[1.5rem] px-10 py-2.5 text-xs font-bold text-[#6F4E37] focus:border-[#6F4E37] focus:ring-0 outline-none transition-all appearance-none pr-10"
                        value={hostel}
                        onChange={(e) => setHostel(e.target.value)}
                    >
                        <option value="">Global Distribution</option>
                        <option value="Paul Iby Men's Hostel">Paul Iby Men's Hostel</option>
                        <option value="Maryknoll Men's Hostel">Maryknoll Men's Hostel</option>
                        <option value="Carlo Men's Hostel">Carlo Men's Hostel</option>
                        <option value="Madonna Ladies' Hostel">Madonna Ladies' Hostel</option>
                        <option value="Pratheeksha Hostel">Pratheeksha Hostel</option>
                        <option value="Amala Hostel">Amala Hostel</option>
                    </select>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-96 flex flex-col items-center justify-center space-y-6"
                    >
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-8 border-[#6F4E37]/10 rounded-full"></div>
                            <div className="absolute inset-0 border-8 border-t-[#6F4E37] rounded-full animate-spin"></div>
                        </div>
                        <p className="font-black text-[#6F4E37] text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing Data Intelligence</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={reportType}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-10"
                    >
                        {/* KPI CARDS */}
                        {reportType === "complaints" && data && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <motion.div
                                    whileHover={{ y: -8 }}
                                    className="bg-white p-8 rounded-[2.5rem] border border-white shadow-2xl flex items-center gap-6 group"
                                >
                                    <div className="p-5 bg-[#6F4E37]/5 rounded-[2rem] text-[#6F4E37] group-hover:scale-110 group-hover:bg-[#6F4E37] group-hover:text-white transition-all">
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#6F4E37]/40 mb-1">Total Submission Volume</p>
                                        <p className="text-4xl font-black text-[#6F4E37]">{data.total}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -8 }}
                                    className="bg-white p-8 rounded-[2.5rem] border border-white shadow-2xl flex items-center gap-6 group"
                                >
                                    <div className="p-5 bg-green-50 rounded-[2rem] text-green-600 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all">
                                        <Zap size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#6F4E37]/40 mb-1">Overall Resolution rate</p>
                                        <p className="text-4xl font-black text-[#6F4E37]">
                                            {data.total ? Math.round(((data.status_stats.find(s => s.status === "Resolved")?.count || 0) + (data.status_stats.find(s => s.status === "Closed")?.count || 0)) / data.total * 100) : 0}%
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -8 }}
                                    className="bg-white p-8 rounded-[2.5rem] border border-white shadow-2xl flex items-center gap-6 group"
                                >
                                    <div className="p-5 bg-amber-50 rounded-[2rem] text-amber-600 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                        <Clock size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#6F4E37]/40 mb-1">Active Backlog</p>
                                        <p className="text-4xl font-black text-[#6F4E37]">
                                            {data.status_stats?.find(s => s.status === "In Progress")?.count || 0}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* CONTENT AREA */}
                        <div className="transition-all duration-500">
                            {reportType === "complaints" && renderComplaintCharts()}
                            {reportType === "staff" && renderStaffTable()}

                            {reportType === "student" && data?.top_students && (
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-2xl border border-white"
                                    >
                                        <div className="flex items-center gap-3 mb-8">
                                            <Users size={20} className="text-[#6F4E37]" />
                                            <h3 className="font-black text-[#6F4E37] text-lg uppercase tracking-tighter">Student Engagement</h3>
                                        </div>
                                        <ul className="space-y-4">
                                            {data.top_students.map((s, i) => (
                                                <li key={i} className="flex justify-between items-center p-5 bg-[#FDF5E6]/40 rounded-[2rem] hover:bg-[#D2B48C]/10 transition-colors border border-[#6F4E37]/5 group">
                                                    <div>
                                                        <p className="font-black text-[#6F4E37] tracking-tight">{s.student__full_name}</p>
                                                        <p className="text-[9px] font-bold text-[#6F4E37]/40 uppercase tracking-widest">{s.student__email}</p>
                                                    </div>
                                                    <div className="bg-[#6F4E37] text-white font-black px-4 py-2 rounded-2xl text-[10px] group-hover:scale-110 transition-transform">
                                                        {s.count} Logs
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="lg:col-span-3 bg-white p-8 rounded-[3rem] shadow-2xl border border-white min-h-[500px]"
                                    >
                                        <div className="flex items-center gap-3 mb-8">
                                            <Building size={20} className="text-[#6F4E37]" />
                                            <h3 className="font-black text-[#6F4E37] text-lg uppercase tracking-tighter">Campus-Wide Analysis</h3>
                                        </div>
                                        <div className="h-[400px]">
                                            <Bar
                                                data={{
                                                    labels: data.hostel_stats?.map(h => h.hostel_name || "Unknown") || [],
                                                    datasets: [{
                                                        label: "Activity Level",
                                                        data: data.hostel_stats?.map(h => h.count) || [],
                                                        backgroundColor: "#D2B48C",
                                                        borderColor: "#6F4E37",
                                                        borderWidth: 2,
                                                        borderRadius: 15
                                                    }]
                                                }}
                                                options={chartOptions}
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            {reportType === "escalation" && data?.data && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[3.5rem] shadow-3xl border-4 border-red-50/50 overflow-hidden"
                                >
                                    <div className="bg-red-50/50 p-8 border-b border-red-100 flex items-center gap-4">
                                        <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-red-900 uppercase tracking-tighter text-xl">Critical Escalations</h3>
                                            <p className="text-red-900/40 text-[10px] font-black uppercase tracking-widest">High-priority incidents requiring immediate oversight</p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto p-4">
                                        <table className="w-full text-left text-sm">
                                            <thead className="text-red-900/30 uppercase text-[9px] font-black tracking-[0.2em]">
                                                <tr>
                                                    <th className="p-6">Trace ID</th>
                                                    <th className="p-6">Category</th>
                                                    <th className="p-6">Staff Responder</th>
                                                    <th className="p-6">Incident Note</th>
                                                    <th className="p-6">Timestamp</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-red-100/50">
                                                {data.data.map((esc, idx) => (
                                                    <tr key={idx} className="hover:bg-red-50/30 transition-colors group">
                                                        <td className="p-6 font-black text-red-900">#ESC-{esc.id}</td>
                                                        <td className="p-6 font-bold text-gray-700">{esc.category}</td>
                                                        <td className="p-6 text-[#6F4E37] font-bold">{esc.staff}</td>
                                                        <td className="p-6 text-gray-500 italic max-w-xs truncate group-hover:whitespace-normal transition-all font-medium">
                                                            "{esc.reason}"
                                                        </td>
                                                        <td className="p-6 font-bold text-gray-400 text-xs">{new Date(esc.date).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                {data.data.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="p-16 text-center">
                                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                                <ShieldCheck size={64} />
                                                                <p className="font-black uppercase tracking-[0.3em] text-[10px]">No security escalations detected in current cycle.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
