import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Send, Loader, Trash2, Bell } from "lucide-react";
import toast from "react-hot-toast";

const AdminStaffUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [complaintDetails, setComplaintDetails] = useState(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/admin/staff-updates/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUpdates(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load staff updates", err);
      setError("Failed to load staff updates");
      setLoading(false);
    }
  };

  const fetchComplaintDetails = async (complaintId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/admin/complaints/${complaintId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComplaintDetails(res.data);
    } catch (err) {
      console.error("Failed to load complaint details", err);
    }
  };

  const handleSelectUpdate = (update) => {
    if (isSelectionMode) {
      toggleSelection(update.id);
      return;
    }
    setSelectedUpdate(update);
    setReplyText("");
    fetchComplaintDetails(update.complaint_id);
  };

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

    if (!window.confirm(`Delete ${selectedIds.size} selected updates?`)) {
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/admin/staff-updates/clear/",
        { ids: Array.from(selectedIds) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state by filtering out deleted IDs
      setUpdates(prev => prev.filter(u => !selectedIds.has(u.id)));
      setIsSelectionMode(false);
      setSelectedIds(new Set());
      toast.success("Selected updates cleared successfully!");
    } catch (err) {
      console.error("Failed to clear updates", err);
      toast.error("Failed to clear updates");
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setSubmittingReply(true);
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/admin/complaints/${selectedUpdate.complaint_id}/escalation/reply/`,
        { admin_reply: replyText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh updates and close modal
      await fetchUpdates();
      // Keep modal open or close? User said "Remove that alert and after clicking on send button i need the same alert".
      // Usually chat stays open or updates. The original code closed it?
      // "setSelectedUpdate(null)" closes it.
      // I will keep the behavior but change the alert.

      // WAIT: The user said "modify the ui of staff esacalation chat as original chat page".
      // AND "in the admin side chat ... Remoe that alert ... i need the same alert as in the staff escalation chat".

      // I'll stick to replacing alert with toast.
      toast.success("Reply sent successfully!");
      // The original code closed the modal: setSelectedUpdate(null); 
      // If it's a "chat", we probably want to keep it open and just append the message.
      // But for now I will just fix the alert as requested.
      setSelectedUpdate(null);
      setReplyText("");
    } catch (err) {
      console.error("Failed to send reply", err);
      toast.error("Failed to send reply. Try again.");
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-stay-brown">Loading updates...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-6">
          <motion.div
            animate={{
              rotate: [0, -15, 15, -15, 15, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              repeatDelay: 3
            }}
            className="p-4 bg-stay-brown/10 rounded-3xl text-stay-brown"
          >
            <Bell size={40} />
          </motion.div>
          <div>
            <h2 className="text-4xl font-extrabold text-stay-brown tracking-tight">
              Staff Notifications
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              Real-time workspace updates, escalations and resolution notes
            </p>
          </div>
        </div>

        {updates.length > 0 && (
          <div className="flex gap-2">
            {!isSelectionMode ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSelectionMode(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all border border-gray-200"
              >
                Select Updates
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedIds(new Set());
                  }}
                  className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearSelected}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-200 transition-all border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} />
                  Delete ({selectedIds.size})
                </motion.button>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* EMPTY STATE */}
      {updates.length === 0 && (
        <div className="bg-white p-12 rounded-3xl shadow text-center border-2 border-stay-brown/20">
          <p className="text-gray-500 text-lg">✨ No staff updates yet. Everything is running smoothly!</p>
        </div>
      )}

      {/* UPDATES LIST */}
      <div className="space-y-4">
        {updates.map((update, idx) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative bg-white rounded-2xl shadow-md border-l-4 p-6 transition-all hover:shadow-lg ${update.note_type === "Escalation"
              ? "border-yellow-500 hover:bg-yellow-50"
              : "border-green-500 hover:bg-green-50"
              }`}
          >
            {/* Selection Checkbox Overlay */}
            {isSelectionMode && (
              <div
                onClick={() => toggleSelection(update.id)}
                className="absolute inset-0 z-10 cursor-pointer flex items-center p-6"
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIds.has(update.id)
                  ? "bg-stay-brown border-stay-brown"
                  : "border-gray-300 bg-white"
                  }`}>
                  {selectedIds.has(update.id) && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
            )}

            <div className={`flex items-start justify-between gap-4 ${isSelectionMode ? "pl-10 opacity-80" : ""}`}>
              {/* Left: Title + Meta */}
              <div className="flex-1">
                {/* Title with Icon */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{update.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-stay-brown">
                      {update.note_type === "Escalation"
                        ? "🚨 New Escalation Submitted"
                        : "✅ New Resolution Submitted"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Complaint: {update.complaint_category} #{update.complaint_id}
                    </p>
                  </div>
                </div>

                {/* Staff Info */}
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <span className="inline-block w-8 h-8 rounded-full bg-stay-brown/10 flex items-center justify-center font-bold text-stay-brown">
                    {(update.staff_name || "S").charAt(0).toUpperCase()}
                  </span>
                  <span className="font-semibold text-gray-700">{update.staff_name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">
                    {update.timestamp
                      ? new Date(update.timestamp).toLocaleString()
                      : "No timestamp"}
                  </span>
                </div>

                {/* Note Content */}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    "{update.note_content}"
                  </p>
                </div>
              </div>

              {/* Right: Action Buttons (Hidden in selection mode) */}
              {!isSelectionMode && (
                <div className="flex flex-col gap-2">
                  {update.note_type === "Resolution" ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleSelectUpdate(update);
                        setShowResolutionModal(true);
                      }}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all whitespace-nowrap"
                    >
                      📄 View Notes
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleSelectUpdate(update);
                        setShowEscalationModal(true);
                      }}
                      className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition-all whitespace-nowrap"
                    >
                      💬 View & Reply
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* RESOLUTION NOTES MODAL */}
      {showResolutionModal && selectedUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full border-2 border-stay-brown/20"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stay-brown flex items-center gap-2">
                  <span className="text-3xl">📄</span>
                  Resolution Notes
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Complaint #{selectedUpdate.complaint_id} - {selectedUpdate.complaint_category}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResolutionModal(false);
                  setSelectedUpdate(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Staff Info */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-600 font-semibold">SUBMITTED BY</p>
                <p className="text-lg text-purple-900 font-semibold">{selectedUpdate.staff_name}</p>
              </div>

              {/* Timestamp */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 font-semibold">SUBMITTED ON</p>
                <p className="text-lg text-gray-900 font-semibold">
                  {selectedUpdate.timestamp
                    ? new Date(selectedUpdate.timestamp).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              {/* Resolution Notes */}
              <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
                <p className="text-sm text-green-700 font-semibold mb-3">
                  ✅ RESOLUTION NOTES
                </p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedUpdate.note_content}
                </p>
              </div>

              {/* Resolved Details if Available */}
              {complaintDetails?.resolved_at && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-2">RESOLVED BY</p>
                  <p className="text-gray-800">{complaintDetails.resolved_by_name || "Staff"}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    on {new Date(complaintDetails.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-4 mt-8 justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowResolutionModal(false);
                  setSelectedUpdate(null);
                }}
                className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all"
              >
                Close
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`/admin/complaints?id=${selectedUpdate.complaint_id}`}
                className="px-8 py-3 bg-stay-brown text-stay-cream font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all inline-block"
              >
                View Full Complaint
              </motion.a>
            </div>
          </motion.div>
        </div>
      )}

      {/* ESCALATION CHAT MODAL */}
      {showEscalationModal && selectedUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-stay-brown/20 flex flex-col h-[600px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-stay-brown to-stay-brown/80 text-stay-cream p-6 font-semibold flex items-start justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <h2 className="text-xl font-bold">Escalation Chat</h2>
                  <p className="text-sm text-stay-cream/80">Complaint #{selectedUpdate.complaint_id} • {selectedUpdate.staff_name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEscalationModal(false);
                  setSelectedUpdate(null);
                  setReplyText("");
                }}
                className="text-stay-cream hover:opacity-70 text-2xl"
              >
                ×
              </button>
            </div>


            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
              {complaintDetails?.chat_history?.length > 0 ? (
                complaintDetails.chat_history.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: msg.type === "admin" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.type === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs p-4 shadow-md text-sm ${msg.type === "admin"
                        ? "bg-gradient-to-br from-stay-brown to-[#5D4037] text-white rounded-3xl rounded-tr-none" // Admin style (Right)
                        : "bg-white border text-gray-800 rounded-3xl rounded-tl-none" // Staff style (Left)
                        }`}
                    >
                      <p className={`text-xs font-bold mb-1 ${msg.type === "admin" ? "text-white/80" : "text-gray-500"}`}>
                        {msg.sender || (msg.type === "admin" ? "You" : "Staff")}
                      </p>
                      <p className="break-words leading-relaxed">{msg.message}</p>
                      <p className={`text-[10px] mt-2 text-right ${msg.type === "admin" ? "text-white/70" : "text-gray-400"}`}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex justify-center mt-10 opacity-50">
                  <p>No messages yet</p>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-100 bg-white p-4 rounded-b-3xl shadow-lg">
              <div className="flex gap-2 items-end">
                <textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={submittingReply}
                  className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stay-brown/20 focus:bg-white resize-none text-sm transition-all shadow-inner"
                  rows="1"
                  style={{ minHeight: "50px" }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitReply}
                  disabled={submittingReply || !replyText.trim()}
                  className="bg-gradient-to-r from-stay-brown to-[#5D4037] text-white rounded-xl p-3 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex flex-col items-center justify-center h-[50px] w-[50px]"
                >
                  {submittingReply ? (
                    <Loader size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffUpdates;
