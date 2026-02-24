import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle,
    MessageSquare,
    Send,
    User,
    CheckCircle,
    X,
    Bell
} from "lucide-react";
import toast from "react-hot-toast";

export default function StaffEscalationNotes() {
    const [escalatedComplaints, setEscalatedComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [note, setNote] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const token = localStorage.getItem("access");

    useEffect(() => {
        fetchEscalations();
    }, []);

    const fetchEscalations = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff/complaints/escalated/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEscalatedComplaints(res.data);
        } catch (err) {
            console.error("Error fetching escalations:", err);
            // toast.error("Failed to load escalated complaints"); 
        }
    };

    const handleAddNote = async () => {
        if (!note.trim()) return;
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/staff/complaints/${selectedComplaint.id}/escalate/`,
                { note },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Note added successfully");
            setNote("");
            setIsModalOpen(false);
            fetchEscalations();
        } catch (err) {
            console.error("Failed to add note:", err);
            toast.error("Failed to add note");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-stay-mocha flex items-center gap-2">
                    <AlertCircle className="text-stay-orange" /> Escalation Notes
                </h1>
                <p className="text-stay-latte font-medium mt-1">Manage escalated issues and admin communications</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {escalatedComplaints.length > 0 ? (
                    escalatedComplaints.map((complaint) => (
                        <motion.div
                            key={complaint.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-stay-milk rounded-2xl p-6 shadow-lg shadow-stay-brown/5 border-l-4 border-stay-browse border-l-stay-orange relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-stay-mocha">#{complaint.id} - {complaint.title}</h3>
                                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg border border-red-200 uppercase tracking-wide">
                                    Escalated
                                </span>
                            </div>

                            {/* ESCALATION REASON */}
                            <div className="mb-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                <label className="text-xs font-bold text-orange-700 uppercase mb-1 block">Escalation Reason</label>
                                <p className="text-sm text-gray-700">{complaint.escalation_reason || "No reason provided."}</p>
                            </div>

                            {/* ADMIN REPLIES */}
                            {complaint.admin_replies && complaint.admin_replies.length > 0 ? (
                                <div className="space-y-3 mb-6 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                    {complaint.admin_replies.map((reply, idx) => (
                                        <div key={idx} className="flex gap-3 items-start">
                                            <div className="w-8 h-8 rounded-full bg-stay-mocha text-stay-cream flex items-center justify-center shrink-0">
                                                <User size={14} />
                                            </div>
                                            <div className="bg-white p-3 rounded-r-xl rounded-bl-xl shadow-sm border border-gray-100 flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-stay-mocha">Admin</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(reply.date).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">{reply.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mb-6 py-4 text-center text-gray-400 text-sm bg-white/50 rounded-xl border border-dashed border-gray-200">
                                    No admin replies yet.
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setSelectedComplaint(complaint);
                                    setIsModalOpen(true);
                                }}
                                className="w-full py-3 rounded-xl bg-stay-mocha text-stay-cream font-bold shadow-lg shadow-stay-mocha/20 hover:bg-stay-brown transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={18} /> Add Follow-up Note
                            </button>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} className="text-gray-300" />
                        </div>
                        <p className="text-lg">No escalated complaints found.</p>
                    </div>
                )}
            </div>

            {/* ADD NOTE MODAL */}
            <AnimatePresence>
                {isModalOpen && selectedComplaint && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="bg-stay-mocha p-6 text-stay-cream flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <MessageSquare size={20} /> Add Note for #{selectedComplaint.id}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Your Note</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows="4"
                                    placeholder="Type your message to the admin..."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-stay-brown/50 outline-none transition-all resize-none font-medium text-stay-mocha"
                                    autoFocus
                                ></textarea>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddNote}
                                    className="px-6 py-2 bg-stay-mocha text-stay-cream font-bold rounded-xl shadow-lg shadow-stay-mocha/30 hover:bg-stay-brown transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Send size={18} /> Send Note
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
