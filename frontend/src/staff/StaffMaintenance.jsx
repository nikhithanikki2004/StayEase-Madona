import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle, Clock, AlertTriangle, Hammer, X, Upload, ChevronRight, AlertCircle, List, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";
import MaintenanceCalendar from "./MaintenanceCalendar";

export default function StaffMaintenance() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [completionNote, setCompletionNote] = useState("");
    const [proofFile, setProofFile] = useState(null);
    const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem("access");

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/maintenance/tasks/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
            toast.error("Failed to load maintenance tasks");
            setLoading(false);
        }
    };

    const handleMarkComplete = (task) => {
        setSelectedTask(task);
        setCompletionNote("");
        setProofFile(null);
        setIsCompleteModalOpen(true);
    };

    const handleSubmitCompletion = async () => {
        if (!completionNote.trim()) {
            toast.error("Please add a note about the completion.");
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append("notes", completionNote);
        if (proofFile) {
            formData.append("proof_image", proofFile);
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/maintenance/tasks/${selectedTask.id}/complete/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            toast.success("Task marked as completed! Pending admin approval.");
            setIsCompleteModalOpen(false);
            fetchTasks(); // Refresh list to remove the pending task
        } catch (err) {
            console.error("Failed to complete task", err);
            toast.error("Failed to submit completion. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High": return "text-red-600 bg-red-100 border-red-200";
            case "Medium": return "text-stay-orange bg-stay-orange/10 border-stay-orange/20";
            case "Low": return "text-green-600 bg-green-100 border-green-200";
            default: return "text-gray-600 bg-gray-100 border-gray-200";
        }
    };

    // Calculate status based on due date
    const getTaskStatus = (task) => {
        if (task.last_log && task.last_log.status === 'Rejected') return 'Rejected';

        const today = new Date();
        const dueDate = new Date(task.next_due_date);

        // Reset time parts for accurate date comparison
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) return 'Overdue';
        if (dueDate.getTime() === today.getTime()) return 'Due Today';
        return 'Upcoming';
    };

    if (loading) return <div className="text-center mt-10 text-stay-mocha">Loading tasks...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-stay-mocha flex items-center gap-2">
                        <Hammer className="text-stay-orange" /> Maintenance Hub
                    </h1>
                    <p className="text-stay-latte font-medium mt-1">Manage recurring duties and monitor upcoming tasks</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${viewMode === "list" ? "bg-stay-mocha text-white shadow-lg" : "text-gray-400 hover:text-stay-mocha"
                            }`}
                    >
                        <List size={18} /> List
                    </button>
                    <button
                        onClick={() => setViewMode("calendar")}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${viewMode === "calendar" ? "bg-stay-mocha text-white shadow-lg" : "text-gray-400 hover:text-stay-mocha"
                            }`}
                    >
                        <LayoutGrid size={18} /> Calendar
                    </button>
                </div>
            </div>

            {/* NEXT UP SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <div className="bg-gradient-to-br from-stay-mocha to-[#3E2723] rounded-[2rem] p-6 text-stay-cream shadow-xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Clock size={120} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-stay-orange">
                                <Clock size={20} />
                                Next Up & Priority Tasks
                            </h3>
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                {tasks.filter(t => getTaskStatus(t) !== 'Upcoming').slice(0, 3).map(task => (
                                    <div key={task.id} className="min-w-[200px] bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-stay-orange mb-1">
                                            {getTaskStatus(task)}
                                        </div>
                                        <h4 className="font-bold text-sm truncate">{task.title}</h4>
                                        <p className="text-[10px] text-stay-latte font-medium mt-1">{task.next_due_date}</p>
                                    </div>
                                ))}
                                {tasks.filter(t => getTaskStatus(t) !== 'Upcoming').length === 0 && (
                                    <p className="text-stay-latte text-sm italic">No urgent tasks currently. All clear!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                    <div className="p-3 rounded-full bg-stay-orange/10 text-stay-orange mb-3">
                        <AlertCircle size={32} />
                    </div>
                    <span className="text-2xl font-black text-stay-mocha">
                        {tasks.filter(t => getTaskStatus(t) === 'Overdue').length}
                    </span>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Overdue Tasks</p>
                </div>
            </div>

            {viewMode === "calendar" ? (
                <MaintenanceCalendar
                    tasks={tasks}
                    onTaskClick={handleMarkComplete}
                />
            ) : tasks.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl shadow-sm border-2 border-dashed border-gray-200 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                    <p className="text-gray-500 mt-1">No pending maintenance tasks assigned to you.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {tasks.map((task, index) => {
                            const status = getTaskStatus(task);
                            const isRejected = status === 'Rejected';

                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-white rounded-2xl p-6 shadow-md border relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 ${isRejected ? "border-red-500 ring-2 ring-red-100" :
                                        status === 'Overdue' ? "border-red-200" : "border-gray-100"
                                        }`}
                                >
                                    {/* Priority Badge */}
                                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold border-b border-l ${getPriorityColor(task.priority || 'Medium')}`}>
                                        {task.priority || 'Medium'}
                                    </div>

                                    {/* Status Indicator for Rejected */}
                                    {isRejected && (
                                        <div className="mb-3 px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                            <div>
                                                <span className="font-bold block">Rejected by Admin</span>
                                                <span className="text-xs">{task.last_log?.admin_comment || "Please redo details."}</span>
                                            </div>
                                        </div>
                                    )}

                                    <h3 className="text-lg font-bold text-stay-mocha mt-1 mb-2 pr-10">{task.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description || "No description provided."}</p>

                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                                        <div className={`flex items-center gap-1 font-medium ${status === 'Overdue' ? 'text-red-600' :
                                            status === 'Due Today' ? 'text-stay-orange' : 'text-stay-brown'
                                            }`}>
                                            <Calendar size={14} />
                                            {status === 'Overdue' ? `Overdue (${task.next_due_date})` :
                                                status === 'Due Today' ? 'Due Today' :
                                                    `Due: ${task.next_due_date}`}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Clock size={14} />
                                            {task.frequency}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleMarkComplete(task)}
                                        className="w-full py-2.5 rounded-xl bg-stay-mocha text-stay-cream font-bold shadow-lg hover:bg-stay-brown transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:shadow-stay-mocha/20"
                                    >
                                        <CheckCircle size={18} /> Mark as Complete
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* COMPLETION MODAL */}
            <AnimatePresence>
                {isCompleteModalOpen && selectedTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border-2 border-stay-brown/10"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-stay-mocha">Mark as Complete</h2>
                                    <p className="text-gray-500 text-sm mt-1">{selectedTask.title}</p>
                                </div>
                                <button
                                    onClick={() => setIsCompleteModalOpen(false)}
                                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Completion Notes</label>
                                    <textarea
                                        value={completionNote}
                                        onChange={(e) => setCompletionNote(e.target.value)}
                                        rows="3"
                                        placeholder="Describe what work was done..."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-stay-orange/50 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Proof of Work (Optional)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={(e) => setProofFile(e.target.files[0])}
                                            className="hidden"
                                            id="proof-upload"
                                        />
                                        <label
                                            htmlFor="proof-upload"
                                            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-stay-orange hover:bg-stay-orange/5 cursor-pointer transition-all text-gray-500 hover:text-stay-orange"
                                        >
                                            <Upload size={20} />
                                            {proofFile ? proofFile.name : "Click to upload image"}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setIsCompleteModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitCompletion}
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-stay-mocha text-white font-bold rounded-xl shadow-lg hover:bg-stay-brown transition-all disabled:opacity-50"
                                >
                                    {submitting ? "Submitting..." : "Submit for Approval"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
