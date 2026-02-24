import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Calendar, Clock, CheckCircle, AlertTriangle, History, User, Edit, Trash2, X, Check, Eye } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminMaintenance() {
    const [tasks, setTasks] = useState([]);
    const [history, setHistory] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("schedule"); // schedule | history
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Form State
    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        frequency: "Monthly",
        assigned_to: "",
        next_due_date: new Date().toISOString().split('T')[0]
    });

    const token = localStorage.getItem("access");

    useEffect(() => {
        fetchTasks();
        fetchHistory();
        fetchStaff();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/maintenance/tasks/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle both array and paginated object response
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setTasks(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load tasks");
            setTasks([]);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/maintenance/logs/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setHistory(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load history");
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/admin/staff/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaffList(res.data);
        } catch (err) {
            console.error("Failed to fetch staff list");
            toast.error("Failed to load staff list");
        }
    };

    const handleCreateOrUpdateTask = async () => {
        if (!taskForm.title || !taskForm.next_due_date) return toast.error("Title and Due Date required");

        const payload = { ...taskForm };
        if (payload.assigned_to === "") payload.assigned_to = null;

        try {
            if (editingTask) {
                await axios.patch(`http://127.0.0.1:8000/api/maintenance/tasks/${editingTask.id}/`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Schedule Updated");
            } else {
                await axios.post("http://127.0.0.1:8000/api/maintenance/tasks/", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Maintenance Schedule Created");
            }
            setShowAddModal(false);
            setEditingTask(null);
            fetchTasks();
            resetForm();
        } catch (err) {
            toast.error(editingTask ? "Failed to update" : "Failed to create");
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm("Are you sure you want to delete this schedule?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/maintenance/tasks/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Schedule Deleted");
            fetchTasks();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const handleApproval = async (id, action) => {
        let admin_comment = "";
        if (action === 'reject') {
            admin_comment = window.prompt("Reason for rejection (optional):", "");
            if (admin_comment === null) return; // Cancelled
        }

        try {
            await axios.post(`http://127.0.0.1:8000/api/maintenance/logs/${id}/${action}/`,
                { admin_comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Log ${action === 'approve' ? 'Approved' : 'Rejected'}`);
        } catch (err) {
            const msg = err.response?.data?.error || `Failed to ${action}`;
            toast.error(msg);
        } finally {
            fetchHistory();
            fetchTasks();
        }
    };

    const resetForm = () => {
        setTaskForm({
            title: "",
            description: "",
            frequency: "Monthly",
            assigned_to: "",
            next_due_date: new Date().toISOString().split('T')[0]
        });
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            description: task.description || "",
            frequency: task.frequency,
            assigned_to: task.assigned_to || "",
            next_due_date: task.next_due_date
        });
        setShowAddModal(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar /> Scheduled Maintenance ({tasks.length})
                    </h1>
                    <p className="text-gray-500 text-sm">Manage recurring facility checks</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("schedule")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'schedule' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Active Schedules
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => { resetForm(); setEditingTask(null); setShowAddModal(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-lg ml-4"
                    >
                        <Plus size={18} /> Schedule New
                    </button>
                </div>
            </div>

            {loading ? <p>Loading...</p> : (
                <>
                    {activeTab === "schedule" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tasks.length > 0 ? tasks.map(task => (
                                <div key={task.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${task.frequency === 'One-time' ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'}`}>
                                            {task.frequency}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(task)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-800 mb-2">{task.title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{task.description || "No description provided."}</p>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mb-4">
                                        <User size={14} /> Assigned: {task.assigned_to_name || "All Staff"}
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-sm text-gray-500">
                                        <Clock size={16} />
                                        <span>Next Due: {new Date(task.next_due_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="col-span-full text-center text-gray-500 py-10">No active maintenance schedules.</p>
                            )}
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm">
                                    <tr>
                                        <th className="p-4">Task Name</th>
                                        <th className="p-4">Completed By</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Notes</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {history.length > 0 ? history.map(log => (
                                        <tr key={log.id} className="border-t border-gray-50">
                                            <td className="p-4 font-medium">{log.task_name || `Task #${log.task}`}</td>
                                            <td className="p-4">{log.completed_by_name || "Unknown"}</td>
                                            <td className="p-4">{new Date(log.completion_date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    log.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 max-w-xs truncate">
                                                {log.notes || "-"}
                                                {log.admin_comment && (
                                                    <div className="text-[10px] text-red-500 mt-1 font-medium italic">
                                                        Reject Reason: {log.admin_comment}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {log.status === 'Pending' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApproval(log.id, 'approve')}
                                                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                            title="Approve"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproval(log.id, 'reject')}
                                                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                            title="Reject"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        {log.proof_image && (
                                                            <a
                                                                href={log.proof_image}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                                                            >
                                                                <Eye size={12} /> View Proof
                                                            </a>
                                                        )}
                                                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                                                            Actioned
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="p-4 text-center text-gray-500">No log entries found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingTask ? "Edit Schedule" : "Schedule Maintenance"}</h2>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input
                            className="w-full border p-3 rounded-lg mb-3"
                            placeholder="e.g. Water Tank Cleaning"
                            value={taskForm.title}
                            onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                            className="w-full border p-3 rounded-lg mb-3"
                            value={taskForm.frequency}
                            onChange={e => setTaskForm({ ...taskForm, frequency: e.target.value })}
                        >
                            <option value="One-time">One-time</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <select
                            className="w-full border p-3 rounded-lg mb-3"
                            value={taskForm.assigned_to}
                            onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                        >
                            <option value="">All Staff</option>
                            {staffList.map(s => (
                                <option key={s.id} value={s.id}>{s.full_name}</option>
                            ))}
                        </select>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            className="w-full border p-3 rounded-lg mb-3"
                            value={taskForm.next_due_date}
                            onChange={e => setTaskForm({ ...taskForm, next_due_date: e.target.value })}
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full border p-3 rounded-lg mb-4"
                            placeholder="Instructions..."
                            value={taskForm.description}
                            onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                        />

                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowAddModal(false); setEditingTask(null); }} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleCreateOrUpdateTask} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                {editingTask ? "Update Schedule" : "Create Schedule"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
