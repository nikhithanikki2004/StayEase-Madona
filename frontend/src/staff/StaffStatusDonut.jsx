import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StaffStatusDonut({ assigned, inProgress, resolved }) {
  const data = {
    labels: ["Assigned", "In Progress", "Resolved"],
    datasets: [
      {
        data: [assigned, inProgress, resolved],
        backgroundColor: [
          "#F59E0B", // stay-orange (Assigned)
          "#6F4E37", // stay-brown (In Progress)
          "#10B981", // emerald-500 (Resolved)
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: "70%",
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200, // 🎯 smooth load animation
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.raw}`,
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}
