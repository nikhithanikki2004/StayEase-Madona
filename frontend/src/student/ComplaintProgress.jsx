import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Loader2, Sparkles, MessageSquareOff } from "lucide-react";

const steps = [
  { label: "Submitted", tooltip: "Complaint registered" },
  { label: "In Progress", tooltip: "Staff working on this issue" },
  { label: "Resolved", tooltip: "Issue resolved successfully" },
];

const ComplaintProgress = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/complaints/student/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setComplaints(res.data);
        setLoading(false);
      })
      .catch(() => {
        console.error("Failed to load complaints");
        setLoading(false);
      });
  }, [token]);

  const getStepIndex = (status) =>
    status === "Submitted" ? 0 : status === "In Progress" ? 1 : 2;

  const getProgressPercent = (status) =>
    (getStepIndex(status) / 2) * 100;

  const getColor = (status) =>
    status === "Resolved"
      ? "bg-green-500"
      : status === "In Progress"
        ? "bg-yellow-500"
        : "bg-blue-500";

  const getDuration = (createdAt, resolvedAt) => {
    const start = new Date(createdAt);
    const end = resolvedAt ? new Date(resolvedAt) : new Date();
    const diff = Math.floor((end - start) / 60000);
    return diff < 60
      ? `${diff} mins`
      : `${Math.floor(diff / 60)} hrs`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-stay-brown animate-spin" />
        <p className="text-stay-brown font-medium animate-pulse">Syncing your progress...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="bg-stay-brown text-stay-cream p-2 rounded-xl">
          <ClipboardList size={24} />
        </div>
        <h2 className="text-3xl font-black text-stay-brown tracking-tighter uppercase">
          Complaint Progress
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {complaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-[2.5rem] shadow-xl border-2 border-dashed border-stay-brown/10 text-center space-y-6"
          >
            <div className="relative">
              <div className="bg-stay-brown/5 p-8 rounded-full">
                <MessageSquareOff size={64} className="text-stay-brown/20" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-2 -right-2 bg-stay-brown text-stay-cream p-2 rounded-lg shadow-lg"
              >
                <Sparkles size={16} />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-stay-brown">All systems clear!</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium">
                You haven't registered any complaints yet. When you do, you'll be able to track their real-time progress right here.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = "/student/complaints/new"}
              className="px-8 py-3 bg-stay-brown text-stay-cream rounded-2xl font-bold shadow-lg hover:shadow-stay-brown/20 transition-all uppercase text-xs tracking-widest"
            >
              Raise a Complaint
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {complaints.map((c) => {
              const stepIndex = getStepIndex(c.status);

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border-l-[12px] border-stay-brown relative overflow-hidden group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-xl font-black text-stay-brown uppercase tracking-tight">
                        {c.complaint_category}
                      </h3>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                          Complaint ID: #{c.id}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                          Hostel ID: {c.hostel_id}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${c.status === "Resolved" ? "bg-green-100 text-green-700" :
                        c.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                        {c.status}
                      </span>

                      {/* IN PROGRESS: Show Assigned Staff */}
                      {c.status === "In Progress" && c.assigned_to_name && (
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Assigned to: <span className="text-stay-brown">{c.assigned_to_name}</span>
                        </span>
                      )}

                      {/* RESOLVED: Show Resolver Name */}
                      {(c.status === "Resolved" || c.status === "Closed") && c.resolved_by_name && (
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Resolved by: <span className="text-green-600">{c.resolved_by_name}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PROGRESS LINE */}
                  <div className="relative mt-12 mb-10 px-4">
                    <div className="h-2 bg-gray-100 rounded-full" />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercent(c.status)}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className={`absolute top-0 h-2 rounded-full shadow-lg ${getColor(c.status)}`}
                    />

                    <div className="flex justify-between absolute -top-4 w-full left-0 px-4">
                      {steps.map((step, index) => (
                        <div
                          key={step.label}
                          className="relative group/step flex flex-col items-center"
                        >
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black shadow-lg transition-all duration-500
                              ${index < stepIndex
                                ? getColor(c.status)
                                : index === 2 && c.status === "Resolved"
                                  ? "bg-green-500 animate-checkPop"
                                  : index <= stepIndex
                                    ? getColor(c.status) + " ring-4 ring-white"
                                    : "bg-gray-200 text-gray-400"
                              }`}
                          >
                            {index === 2 && c.status === "Resolved" ? "✔" : index + 1}
                          </div>

                          <div className="tooltip">
                            {step.tooltip}
                          </div>

                          <span className={`text-[10px] font-black uppercase tracking-widest mt-4 ${index <= stepIndex ? "text-stay-brown" : "text-gray-400"
                            }`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TIME INFO */}
                  <div className="mt-12 pt-6 border-t border-gray-50 text-[11px] font-bold text-gray-500 flex flex-wrap gap-x-8 gap-y-2 uppercase tracking-tight">
                    <span className="flex items-center gap-2">
                      Active for: <b className="text-stay-brown">{getDuration(c.created_at)}</b>
                    </span>
                    {c.status === "Resolved" && (
                      <span className="flex items-center gap-2 text-green-600">
                        Total Resolution Time: <b>{getDuration(c.created_at, c.updated_at)}</b>
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <style>
        {`
        .tooltip {
          position: absolute;
          bottom: 110%;
          background: #3A2718;
          color: #FDF5E6;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 8px 12px;
          border-radius: 12px;
          opacity: 0;
          pointer-events: none;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(10px);
        }

        .group/step:hover .tooltip {
          opacity: 1;
          transform: translateY(-8px);
        }

        @keyframes checkPop {
          0% { transform: scale(0) rotate(-45deg); }
          70% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0); }
        }

        .animate-checkPop {
          animation: checkPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        `}
      </style>
    </div>
  );
};

export default ComplaintProgress;
