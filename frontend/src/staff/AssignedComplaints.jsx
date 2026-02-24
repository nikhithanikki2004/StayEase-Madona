import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    CheckCircle,
    Clock,
    AlertTriangle,
    X,
    FileText,
    ArrowRight,
    Eye,
    CheckSquare,
    Square,
    ShieldAlert
} from "lucide-react";
import toast from "react-hot-toast";

export default function AssignedComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);

    // Status Update
    const [statusNote, setStatusNote] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    // Escalation
    const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
    const [escalationNote, setEscalationNote] = useState("");

    // Bulk Actions
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkResolveModalOpen, setIsBulkResolveModalOpen] = useState(false);

    const [bulkNote, setBulkNote] = useState("");

    // Chat & Proof
    const [chatMessage, setChatMessage] = useState("");
    const [proofFile, setProofFile] = useState(null);

    const token = localStorage.getItem("access");

    useEffect(() => {
        fetchComplaints();
    }, []);

    useEffect(() => {
        let result = complaints;
        if (filter !== "all") {
            result = result.filter((c) => c.status === filter);
        }
        if (search) {
            result = result.filter((c) =>
                (c.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
                c.student_name?.toLowerCase().includes(search.toLowerCase()) ||
                c.category?.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFilteredComplaints(result);
    }, [search, filter, complaints]);

    const fetchComplaints = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/staff/complaints/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setComplaints(res.data);
            setFilteredComplaints(res.data);
        } catch (err) {
            console.error("Error fetching complaints:", err);
            toast.error("Failed to load complaints");
        }
    };

    // ---------------------------
    // INDIVIDUAL ACTIONS
    // ---------------------------
    const handleStatusUpdate = async () => {
        if (!newStatus) return;
        try {
            const formData = new FormData();
            formData.append("status", newStatus);
            if (statusNote) formData.append("resolution_notes", statusNote);
            if (proofFile) formData.append("proof", proofFile);

            await axios.patch(
                `http://127.0.0.1:8000/api/staff/complaints/${selectedComplaint.id}/update/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            toast.success("Status updated successfully");
            setIsUpdateModalOpen(false);
            setProofFile(null); // Reset file
            fetchComplaints();
        } catch (err) {
            console.error("Update failed:", err);
            toast.error("Failed to update status");
        }
    };

    const handleEscalate = async () => {
        if (!escalationNote) return;
        try {
            await axios.post(
                `http://127.0.0.1:8000/api/staff/complaints/${selectedComplaint.id}/escalate/`,
                { note: escalationNote },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Complaint escalated to admin");

            // Refresh to get updated data (including new escalation status)
            fetchComplaints();
            // Optionally close, or switch to chat view if we want to show it immediately
            setIsEscalateModalOpen(false);
            setEscalationNote("");
        } catch (err) {
            console.error("Escalation failed:", err);
            toast.error("Failed to escalate complaint");
        }
    };

    const handleSendEscalationMessage = async () => {
        if (!chatMessage.trim()) return;
        try {
            const res = await axios.post(
                `http://127.0.0.1:8000/api/staff/complaints/${selectedComplaint.id}/escalate-reply/`,
                { message: chatMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Message sent");
            // Update selected complaint with new history from response
            setSelectedComplaint(res.data);
            setChatMessage("");
        } catch (err) {
            console.error("Message sending failed:", err);
            toast.error("Failed to send message");
        }
    };

    // ---------------------------
    // BULK ACTIONS
    // ---------------------------
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds([]);
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const selectAll = () => {
        if (selectedIds.length === filteredComplaints.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredComplaints.map(c => c.id));
        }
    };

    const handleBulkResolve = async () => {
        if (!bulkNote || selectedIds.length === 0) return;
        try {
            await axios.post(
                "http://127.0.0.1:8000/api/staff/complaints/bulk-resolve/",
                { ids: selectedIds, resolution_notes: bulkNote },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`${selectedIds.length} complaints resolved`);
            setIsBulkResolveModalOpen(false);
            setBulkNote("");
            setSelectedIds([]);
            setIsSelectionMode(false);
            fetchComplaints();
        } catch (err) {
            console.error("Bulk resolve failed:", err);
            toast.error("Failed to resolve complaints");
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High": return "bg-red-100 text-red-700 border-red-200";
            case "Medium": return "bg-stay-orange/20 text-stay-orange border-stay-orange/30";
            case "Low": return "bg-green-100 text-green-700 border-green-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Resolved": return "bg-green-100 text-green-700";
            case "In Progress": return "bg-blue-100 text-blue-700";
            case "Pending": return "bg-yellow-100 text-yellow-700";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stay-mocha">Assigned Complaints</h1>
                    <p className="text-stay-latte font-medium mt-1">Manage and resolve student issues</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Bulk Selection Toggle */}
                    <button
                        onClick={toggleSelectionMode}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all ${isSelectionMode
                            ? "bg-stay-mocha text-stay-cream shadow-lg"
                            : "bg-white text-stay-mocha border border-stay-latte/30 hover:bg-stay-mocha/5"
                            }`}
                    >
                        {isSelectionMode ? "Exit Selection" : "Select Multiple"}
                    </button>

                    {isSelectionMode && selectedIds.length > 0 && (
                        <button
                            onClick={() => setIsBulkResolveModalOpen(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 transition-all flex items-center gap-2"
                        >
                            <CheckCircle size={18} /> Resolve ({selectedIds.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-stay-latte/30 w-fit">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search complaints..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-stay-orange/50 outline-none transition-all w-64 text-sm text-stay-mocha placeholder-gray-400"
                    />
                </div>
                <div className="h-8 w-px bg-gray-200 mx-1"></div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-transparent text-sm font-medium text-gray-600 outline-none cursor-pointer hover:text-stay-mocha transition-colors"
                >
                    <option value="all">All Status</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <Filter size={18} className="text-gray-400 mr-2" />
            </div>

            {/* COMPLAINTS TABLE */}
            <div className="bg-white rounded-2xl shadow-xl shadow-stay-brown/5 border border-stay-brown/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stay-mocha text-stay-cream">
                            <tr>
                                {isSelectionMode && (
                                    <th className="px-6 py-4 w-12">
                                        <button onClick={selectAll} className="text-stay-cream/80 hover:text-white">
                                            {selectedIds.length === filteredComplaints.length && filteredComplaints.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                    </th>
                                )}
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Complaint ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Student</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Category</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Priority</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Date</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredComplaints.length > 0 ? (
                                filteredComplaints.map((complaint) => (
                                    <motion.tr
                                        key={complaint.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`hover:bg-stay-orange/5 transition-colors group ${selectedIds.includes(complaint.id) ? 'bg-stay-orange/5' : ''}`}
                                    >
                                        {isSelectionMode && (
                                            <td className="px-6 py-4">
                                                <button onClick={() => toggleSelect(complaint.id)} className="text-stay-mocha">
                                                    {selectedIds.includes(complaint.id) ? <CheckSquare size={20} className="text-stay-orange" /> : <Square size={20} className="text-gray-300" />}
                                                </button>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm font-medium text-stay-mocha">#{complaint.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{complaint.student_name}</div>
                                            <div className="text-xs text-gray-400">{complaint.room_number || "Room N/A"}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{complaint.category || complaint.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(complaint.priority)}`}>
                                                {complaint.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(complaint.status)}`}>
                                                {complaint.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(complaint.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedComplaint(complaint);
                                                        setIsDetailModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-stay-mocha/10 text-stay-mocha transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {complaint.status !== "Resolved" && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedComplaint(complaint);
                                                                setNewStatus(complaint.status);
                                                                setIsUpdateModalOpen(true);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-stay-orange/20 text-stay-orange transition-colors"
                                                            title="Update Status"
                                                        >
                                                            <ArrowRight size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedComplaint(complaint);
                                                                setIsEscalateModalOpen(true);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                                            title="Escalate to Admin"
                                                        >
                                                            <ShieldAlert size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isSelectionMode ? 8 : 7} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <FileText size={48} className="text-gray-200" />
                                            <p>No complaints found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DETAIL MODAL */}
            <AnimatePresence>
                {isDetailModalOpen && selectedComplaint && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="bg-stay-mocha p-6 text-stay-cream flex items-center justify-between sticky top-0 z-10">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FileText size={20} /> Complaint Details #{selectedComplaint.id}
                                </h2>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Student</label>
                                        <p className="font-semibold text-stay-mocha text-lg">{selectedComplaint.student_name}</p>
                                        <p className="text-sm text-gray-500">{selectedComplaint.room_number || "Room N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
                                        <p className="font-semibold text-gray-700">{selectedComplaint.category}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                    <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 leading-relaxed">
                                        {selectedComplaint.description}
                                    </div>
                                </div>

                                {/* Previous Resolution Notes if any */}
                                {selectedComplaint.resolution_notes && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resolution Notes</label>
                                        <div className="mt-2 p-4 bg-green-50 rounded-xl border border-green-100 text-green-800 leading-relaxed">
                                            {selectedComplaint.resolution_notes}
                                        </div>
                                    </div>
                                )}

                                {selectedComplaint.resolution_proof && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resolution Proof</label>
                                        <div className="mt-2 rounded-xl overflow-hidden border border-green-200">
                                            <img
                                                src={selectedComplaint.resolution_proof.startsWith('http') ? selectedComplaint.resolution_proof : `http://127.0.0.1:8000${selectedComplaint.resolution_proof}`}
                                                alt="Resolution Proof"
                                                className="w-full h-auto max-h-64 object-cover cursor-zoom-in hover:brightness-90 transition-all font-mono"
                                                onClick={() => setLightboxImage(selectedComplaint.resolution_proof.startsWith('http') ? selectedComplaint.resolution_proof : `http://127.0.0.1:8000${selectedComplaint.resolution_proof}`)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Escalation Status */}
                                {selectedComplaint.escalated && (
                                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                                        <ShieldAlert className="text-red-500 shrink-0" size={20} />
                                        <div>
                                            <h4 className="font-bold text-red-700 text-sm">Escalated to Admin</h4>
                                            <p className="text-red-600 text-sm mt-1">{selectedComplaint.escalation_note}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Timeline</label>
                                    <div className="mt-2 space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Clock size={16} className="text-stay-brown" />
                                            <span className="text-gray-600">Created: {new Date(selectedComplaint.created_at).toLocaleString()}</span>
                                        </div>
                                        {selectedComplaint.resolved_at && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <CheckCircle size={16} className="text-green-500" />
                                                <span className="text-gray-600">Resolved: {new Date(selectedComplaint.resolved_at).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedComplaint.image && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attachment</label>
                                        <div className="mt-2 rounded-xl overflow-hidden border border-gray-200">
                                            <img
                                                src={selectedComplaint.image.startsWith('http') ? selectedComplaint.image : `http://127.0.0.1:8000${selectedComplaint.image}`}
                                                alt="Complaint Attachment"
                                                className="w-full h-auto max-h-64 object-cover cursor-zoom-in hover:brightness-90 transition-all"
                                                onClick={() => setLightboxImage(selectedComplaint.image.startsWith('http') ? selectedComplaint.image : `http://127.0.0.1:8000${selectedComplaint.image}`)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* UPDATE STATUS MODAL */}
            <AnimatePresence>
                {isUpdateModalOpen && selectedComplaint && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="bg-stay-orange p-6 text-white flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <AlertTriangle size={20} /> Update Status
                                </h2>
                                <button
                                    onClick={() => setIsUpdateModalOpen(false)}
                                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">New Status</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-stay-orange/50 outline-none transition-all"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Resolution Notes</label>
                                    <textarea
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        rows="4"
                                        placeholder="Add details about the resolution or current status..."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-stay-orange/50 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                {/* Proof Upload */}
                                {newStatus === "Resolved" && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Upload Proof (Optional)</label>
                                        <input
                                            type="file"
                                            onChange={(e) => setProofFile(e.target.files[0])}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-stay-orange/50 outline-none transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsUpdateModalOpen(false)}
                                    className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    className="px-6 py-2 bg-stay-orange text-white font-bold rounded-xl shadow-lg shadow-stay-orange/30 hover:bg-orange-600 transition-all active:scale-95"
                                >
                                    Update Status
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ESCALATION CHAT MODAL */}
            <AnimatePresence>
                {isEscalateModalOpen && selectedComplaint && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-stay-brown/20 flex flex-col h-[600px] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-stay-brown to-stay-brown/80 text-stay-cream p-6 font-semibold flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">💬</span>
                                    <div>
                                        <h2 className="text-xl font-bold">Escalation Chat</h2>
                                        <p className="text-sm text-stay-cream/80">Complaint #{selectedComplaint.id} • {selectedComplaint.student_name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEscalateModalOpen(false)}
                                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
                                {selectedComplaint.escalated ? (
                                    // CHAT MESSAGES
                                    selectedComplaint.chat_history && selectedComplaint.chat_history.length > 0 ? (
                                        selectedComplaint.chat_history.map((msg, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: msg.type === 'staff' ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`flex ${msg.type === 'staff' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-xs p-4 shadow-md text-sm ${msg.type === 'staff'
                                                    ? 'bg-gradient-to-br from-stay-brown to-[#5D4037] text-white rounded-3xl rounded-tr-none'
                                                    : 'bg-white border text-gray-800 rounded-3xl rounded-tl-none'
                                                    }`}>
                                                    <p className={`text-xs font-bold mb-1 ${msg.type === 'staff' ? 'text-white/80' : 'text-gray-500'}`}>
                                                        {msg.sender || (msg.type === 'staff' ? "You" : "Admin")}
                                                    </p>
                                                    <p className="break-words leading-relaxed">{msg.message}</p>
                                                    <span className={`text-[10px] mt-2 block text-right ${msg.type === 'staff' ? 'text-white/70' : 'text-gray-400'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="flex justify-center mt-10 opacity-50">
                                            <p>No messages yet</p>
                                        </div>
                                    )
                                ) : (
                                    // INITIAL ESCALATION FORM
                                    <div className="p-4">
                                        <p className="text-gray-600 text-sm mb-4">
                                            Are you sure you want to escalate this complaint to the administrator? This action triggers a high-priority alert.
                                        </p>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Escalation</label>
                                            <textarea
                                                value={escalationNote}
                                                onChange={(e) => setEscalationNote(e.target.value)}
                                                rows="4"
                                                placeholder="Explain why this needs admin attention..."
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-red-500/50 outline-none transition-all resize-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* FOOTER / INPUT */}
                            <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                {selectedComplaint.escalated ? (
                                    <div className="flex gap-2 items-end">
                                        <textarea
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="Type a message to admin..."
                                            className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stay-brown/20 focus:bg-white resize-none text-sm transition-all shadow-inner"
                                            rows="1"
                                            style={{ minHeight: "50px" }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendEscalationMessage();
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={handleSendEscalationMessage}
                                            disabled={!chatMessage.trim()}
                                            className="bg-gradient-to-r from-stay-brown to-[#5D4037] text-white rounded-xl p-3 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex flex-col items-center justify-center h-[50px] w-[50px]"
                                        >
                                            <ArrowRight size={24} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsEscalateModalOpen(false)}
                                            className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleEscalate}
                                            className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all active:scale-95"
                                        >
                                            Escalate
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* BULK RESOLVE MODAL */}
            <AnimatePresence>
                {isBulkResolveModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="bg-green-600 p-6 text-white flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <CheckCircle size={20} /> Bulk Resolve
                                </h2>
                                <button
                                    onClick={() => setIsBulkResolveModalOpen(false)}
                                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <p className="text-gray-600 text-sm">
                                    You are about to resolve <strong>{selectedIds.length}</strong> selected complaints. This action cannot be easily undone.
                                </p>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Resolution Note (Applied to all)</label>
                                    <textarea
                                        value={bulkNote}
                                        onChange={(e) => setBulkNote(e.target.value)}
                                        rows="4"
                                        placeholder="Add standard resolution note..."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500/50 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsBulkResolveModalOpen(false)}
                                    className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkResolve}
                                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/30 hover:bg-green-700 transition-all active:scale-95"
                                >
                                    Resolve All
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* IMAGE LIGHTBOX */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12 backdrop-blur-md cursor-pointer"
                        onClick={() => setLightboxImage(null)}
                    >
                        <motion.button
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImage(null);
                            }}
                        >
                            <X size={24} />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative max-w-5xl w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={lightboxImage}
                                alt="Attachment Full View"
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/20"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
