import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Bell, Send } from "lucide-react";

const AdminSupport = () => {
  const token = localStorage.getItem("access");

  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  /* 🔹 FETCH ALL TICKETS */
  const fetchTickets = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/students/admin/support/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTickets(res.data);
      setLoading(false);

      // 🔄 Keep active ticket in sync
      if (activeTicket) {
        const updated = res.data.find(
          (t) => t.id === activeTicket.id
        );
        if (updated) setActiveTicket(updated);
      }
    } catch {
      toast.error("Failed to load support tickets");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  /* 🔹 SEND REPLY */
  const sendReply = async () => {
    if (!reply.trim()) return;

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/students/admin/support/reply/${activeTicket.id}/`,
        { message: reply },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Reply sent");
      setReply("");
      fetchTickets();
    } catch {
      toast.error("Failed to send reply");
    }
  };

  /* 🔹 UPDATE STATUS */
  const updateStatus = async (status) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/students/admin/support/status/${activeTicket.id}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Status updated");
      fetchTickets();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-stay-brown font-semibold">
        Loading support inbox...
      </p>
    );
  }

  return (
    <div className="flex h-[82vh] bg-white rounded-2xl shadow-xl overflow-hidden">

      {/* 📥 LEFT – INBOX */}
      <div className="w-[340px] border-r bg-[#3b2a1f] text-white overflow-y-auto">
        <div className="p-4 border-b border-white/20">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Bell size={18} /> Support Inbox
          </h2>
        </div>

        {tickets.map((ticket) => {
          const hasUnread =
            ticket.messages?.some(
              (m) => m.sender === "student" && !m.read
            );

          return (
            <motion.div
              key={ticket.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveTicket(ticket)}
              className={`p-4 cursor-pointer border-b border-white/10 relative ${
                activeTicket?.id === ticket.id
                  ? "bg-[#6f4e37]"
                  : "hover:bg-white/10"
              }`}
            >
              <h4 className="font-semibold">
                {ticket.subject}
              </h4>

              <p className="text-sm opacity-80">
                {ticket.student_name}
              </p>

              <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-white/20">
                {ticket.status}
              </span>

              {hasUnread && (
                <span className="absolute top-4 right-4 bg-red-500 text-xs px-2 py-0.5 rounded-full">
                  🔔
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 💬 RIGHT – CHAT */}
      <div className="flex-1 flex flex-col bg-[#fdf8f2]">
        {!activeTicket ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a ticket to view conversation
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <div>
                <h3 className="font-semibold">
                  {activeTicket.subject}
                </h3>
                <p className="text-sm text-gray-500">
                  {activeTicket.student_name}
                </p>
              </div>

              <select
                value={activeTicket.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="border rounded-lg px-3 py-1 text-sm"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>

            {/* CHAT BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {activeTicket.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[65%] p-3 rounded-2xl text-sm ${
                      msg.sender === "admin"
                        ? "bg-[#6f4e37] text-white ml-auto"
                        : "bg-white border"
                    }`}
                  >
                    {msg.message}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* REPLY */}
            {activeTicket.status !== "Resolved" && (
              <div className="p-4 border-t flex gap-3 bg-white">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a reply..."
                  className="flex-1 border rounded-full px-4 py-2 text-sm"
                />
                <button
                  onClick={sendReply}
                  className="bg-[#6f4e37] text-white px-4 py-2 rounded-full flex items-center gap-1"
                >
                  <Send size={16} /> Send
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;
