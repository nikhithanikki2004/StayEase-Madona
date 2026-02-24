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
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const StaffPerformance = () => {
  const [data, setData] = useState([]);
  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/admin/staff/performance/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error("Failed to load performance data", err);
    }
  };

  if (data.length === 0) {
    return (
      <p className="p-6 text-stay-brown font-semibold">
        Loading staff analytics...
      </p>
    );
  }

  const names = data.map((s) => s.full_name);

  /* ================= COMMON OPTIONS ================= */

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#6f4e37",
          font: { weight: "bold" },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#6f4e37" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#6f4e37" },
        grid: { color: "#f1e7dc" },
      },
    },
  };

  /* ================= CHART DATA ================= */

  const resolvedChart = {
    labels: names,
    datasets: [
      {
        label: "Resolved Complaints",
        data: data.map((s) => s.resolved),
        backgroundColor: "#16a34a",
        borderRadius: 10,
      },
    ],
  };

  const ratingChart = {
    labels: names,
    datasets: [
      {
        label: "Average Rating",
        data: data.map((s) => s.avg_rating), // ✅ KEEP NULLS
        backgroundColor: "#facc15",
        borderRadius: 10,
      },
    ],
  };

  const ratingOptions = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          color: "#6f4e37",
          font: { weight: "600" },
        },
        grid: { color: "#f1e7dc" },
      },
    },
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ctx.raw === null
              ? "No rating yet"
              : `Rating: ${ctx.raw} ⭐`,
        },
      },
    },
  };

  const scoreChart = {
    labels: names,
    datasets: [
      {
        label: "Performance Score",
        data: data.map((s) => s.performance_score),
        backgroundColor: "#6f4e37",
        borderRadius: 10,
      },
    ],
  };

  return (
    <motion.div
      className="space-y-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-3xl font-extrabold text-stay-brown flex items-center gap-2">
          📊 Staff Performance Analytics
        </h2>
        <p className="text-gray-600 italic mt-1">
          Monitor efficiency, responsiveness, and service quality.
        </p>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="🏆 Top Performer"
          value={data[0].full_name}
          sub={`Score: ${data[0].performance_score}`}
          delay={0.1}
        />
        <SummaryCard
          title="⭐ Highest Rated"
          value={
            [...data].sort(
              (a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)
            )[0].full_name
          }
          delay={0.2}
        />
        <SummaryCard
          title="⏱ Fastest Resolver"
          value={
            [...data].sort(
              (a, b) =>
                (a.avg_resolution_time || Infinity) -
                (b.avg_resolution_time || Infinity)
            )[0].full_name
          }
          delay={0.3}
        />
      </div>

      {/* ================= CHARTS ================= */}
      <ChartCard title="Complaints Resolved by Staff">
        <Bar data={resolvedChart} options={commonOptions} />
      </ChartCard>

      <ChartCard title="Average Student Rating">
        <Bar data={ratingChart} options={ratingOptions} />
      </ChartCard>

      <ChartCard title="Overall Performance Score">
        <Bar data={scoreChart} options={commonOptions} />
      </ChartCard>
    </motion.div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const ChartCard = ({ title, children }) => (
  <motion.div
    className="bg-white rounded-3xl shadow-lg p-6 border border-stay-brown/10"
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true }}
  >
    <h3 className="text-lg font-semibold mb-4 text-stay-brown">
      {title}
    </h3>
    <div className="h-[320px]">{children}</div>
  </motion.div>
);

const SummaryCard = ({ title, value, sub, delay }) => (
  <motion.div
    className="bg-gradient-to-br from-[#fffaf5] to-[#f5e9dc] rounded-2xl shadow-md p-6 border border-stay-brown/10"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ scale: 1.03 }}
  >
    <p className="text-sm text-stay-brown/70 font-semibold">
      {title}
    </p>
    <p className="text-2xl font-bold text-stay-brown mt-1">
      {value}
    </p>
    {sub && (
      <p className="text-sm text-gray-600 mt-1">{sub}</p>
    )}
  </motion.div>
);

export default StaffPerformance;
