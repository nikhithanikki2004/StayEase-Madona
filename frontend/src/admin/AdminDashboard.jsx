import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "../styles/admin-dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  // 🔐 Logout
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/admin/dashboard/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error(err);
        setError("Unauthorized or server error");
        if (err.response?.status === 401) {
          handleLogout();
        }
      });
  }, []);

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }

  if (!stats) {
    return <p className="text-center mt-10">Loading admin dashboard...</p>;
  }

  // 📊 CATEGORY-WISE CHART DATA
  // 🔹 Get counts
  const counts = stats.category_stats.map((c) => c.count);

  // 🔹 Find max value
  const maxValue = Math.max(...counts);

  // 🔹 Color palette
  // 🔹 Color palette
  const barColors = [
    "#2B1E15", // Sidebar Color
  ];

  // 🔹 Assign colors (highlight max)
  const backgroundColors = counts.map((value, index) =>
    value === maxValue
      ? "#4A3B32" // Slightly lighter brown for highest
      : "#2B1E15"  // Sidebar Color
  );

  const categoryChartData = {
    labels: stats.category_stats.map(
      (c) => c.complaint_category
    ),
    datasets: [
      {
        label: "Number of Complaints",
        data: counts,
        backgroundColor: backgroundColors,
        borderRadius: 12,
        barThickness: 48,
      },
    ],
  };



  const categoryChartOptions = {
    responsive: true,
    animation: {
      duration: 1500,
      easing: "easeOutQuart",
      delay: (context) => {
        // Delay highest bar slightly
        if (
          context.type === "data" &&
          context.raw === maxValue
        ) {
          return 400;
        }
        return context.dataIndex * 80;
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#3A2718",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        borderColor: "#6F4E37",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6B6B6B",
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#6B6B6B",
        },
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
      },
    },
  };



  return (
    <div className="admin-dashboard fade-in">
      {/* ================= HEADER ================= */}
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">
            Good to see you again! 👋
          </h1>
          <p className="admin-tagline">
            Let’s make today’s operations seamless.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="admin-logout-btn"
        >
          Logout
        </button>
      </div>


      {/* ================= STATS ================= */}
      <div className="admin-stats-grid">
        <div className="admin-card">
          <h3>Total Complaints</h3>
          <h2>{stats.total_complaints}</h2>
        </div>

        <div className="admin-card">
          <h3>Pending Complaints</h3>
          <h2 className="text-warning">
            {stats.pending_complaints}
          </h2>
        </div>

        <div className="admin-card">
          <h3>Resolved Complaints</h3>
          <h2 className="text-success">
            {stats.resolved_complaints}
          </h2>
        </div>
      </div>

      {/* ================= CATEGORY CHART ================= */}
      <div className="admin-chart-box fade-in">
        <h3 className="admin-section-title">
          Category-wise Complaints (Visual)
        </h3>

        {stats.category_stats.length === 0 ? (
          <p className="admin-muted">No data available</p>
        ) : (
          <Bar
            data={categoryChartData}
            options={categoryChartOptions}
            height={120}
          />
        )}
      </div>
    </div>
  );

}
