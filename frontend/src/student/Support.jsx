import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const StudentSupport = () => {
  const token = localStorage.getItem("access");

  const [tickets, setTickets] = useState([]);
  const [openTicket, setOpenTicket] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    category: "",
    subject: "",
    description: "",
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await axios.get(
      "http://127.0.0.1:8000/api/students/support/",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTickets(res.data);
  };

  const createTicket = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/students/support/create/",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("🎉 Support ticket created!");
      setForm({ category: "", subject: "", description: "" });
      fetchTickets();
    } catch {
      toast.error("Failed to create ticket");
    }
  };

  const sendMessage = async (ticketId) => {
    if (!message.trim()) return;

    await axios.post(
      `http://127.0.0.1:8000/api/students/support/reply/${ticketId}/`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage("");
    fetchTickets();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      {/* 🔹 HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-stay-brown">
          🎧 Contact Support
        </h2>
        <p className="text-gray-600 italic">
          Need help? Our support team is just a message away.
        </p>
      </motion.div>

      {/* 🔹 CREATE TICKET */}
      <motion.form
        onSubmit={createTicket}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-stay-brown rounded-2xl p-8 shadow-lg space-y-4"
      >
        <h3 className="text-xl font-semibold text-stay-brown">
          Raise a Support Ticket
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            required
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
            className="border rounded-xl px-4 py-2 focus:ring-2 focus:ring-stay-brown"
          >
            <option value="">Select Category</option>
            <option>Account</option>
            <option>Hostel</option>
            <option>Complaint</option>
            <option>Technical</option>
            <option>General</option>
            <option>Other</option>
          </select>

          <input
            required
            placeholder="Subject"
            value={form.subject}
            onChange={(e) =>
              setForm({ ...form, subject: e.target.value })
            }
            className="border rounded-xl px-4 py-2 focus:ring-2 focus:ring-stay-brown"
          />
        </div>

        <textarea
          required
          rows="3"
          placeholder="Describe your issue clearly..."
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-stay-brown"
        />

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="bg-stay-brown text-stay-cream px-6 py-2 rounded-xl shadow"
        >
          Submit Ticket
        </motion.button>
      </motion.form>

      {/* 🔹 TICKETS */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-stay-brown">
          My Support Tickets
        </h3>

        {tickets.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            No support tickets yet.
          </div>
        )}

        {tickets.map((ticket) => (
          <motion.div
            key={ticket.id}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl shadow p-6"
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() =>
                setOpenTicket(
                  openTicket === ticket.id ? null : ticket.id
                )
              }
            >
              <div>
                <h4 className="font-semibold">{ticket.subject}</h4>
                <p className="text-sm text-gray-500">
                  {ticket.category}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ticket.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : ticket.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {ticket.status}
              </span>
            </div>

            {/* 💬 CHAT */}
            <AnimatePresence>
              {openTicket === ticket.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t space-y-3"
                >
                  {ticket.messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ x: msg.sender === "student" ? 40 : -40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={`max-w-lg p-3 rounded-xl text-sm ${
                        msg.sender === "student"
                          ? "bg-stay-brown text-stay-cream ml-auto"
                          : "bg-gray-200"
                      }`}
                    >
                      {msg.message}
                    </motion.div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border rounded-xl px-4 py-2"
                    />
                    <button
                      onClick={() => sendMessage(ticket.id)}
                      className="bg-stay-brown text-stay-cream px-4 rounded-xl"
                    >
                      Send
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentSupport;
