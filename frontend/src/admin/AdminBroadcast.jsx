import React, { useState, useEffect } from "react";
import axios from "axios";
import { Megaphone, Plus, Trash2, Power, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminBroadcast() {
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const [form, setForm] = useState({
        category: "Electricity",
        title: "",
        message: "",
        expected_resolution_time: ""
    });

    const token = localStorage.getItem("access");

    const categories = [
        "Electricity", "Plumbing", "Furniture", "Cleaning",
        "Water", "Internet", "Food / Mess", "Security",
        "Noise / Discipline", "Staff / Management", "Medical", "Other"
    ];

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const fetchBroadcasts = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/broadcasts/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBroadcasts(res.data);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to load broadcasts");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/broadcasts/`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Broadcast sent to all students!");
            setShowAddModal(false);
            setForm({ category: "Electricity", title: "", message: "", expected_resolution_time: "" });
            fetchBroadcasts();
        } catch (err) {
            toast.error("Failed to send broadcast");
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/broadcasts/${id}/`, {
                is_active: !currentStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Broadcast ${!currentStatus ? 'Activated' : 'Resolved'}`);
            fetchBroadcasts();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this broadcast history?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/broadcasts/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Broadcast deleted");
            fetchBroadcasts();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-stay-brown p-8 rounded-2xl text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold flex items-center gap-3 italic">
                        <Megaphone size={32} /> Emergency Broadcast
                    </h1>
                    <p className="text-stay-cream/80 mt-2 max-w-md">
                        Notify all students immediately about system-wide issues like power cuts or water shutdown.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-stay-cream text-stay-brown px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-all shadow-md active:scale-95 z-10"
                >
                    <Plus size={20} /> Create New Broadcast
                </button>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {broadcasts.map(b => (
                    <div key={b.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${b.is_active ? 'border-red-100 ring-4 ring-red-50' : 'border-gray-100 opacity-75'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${b.is_active ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {b.is_active ? "Live Notice" : "Resolved"}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => toggleActive(b.id, b.is_active)} title={b.is_active ? "Mark as Resolved" : "Reactive"} className={`p-2 rounded-lg ${b.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}><Power size={18} /></button>
                                <button onClick={() => handleDelete(b.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-800 text-lg mb-1">{b.title}</h3>
                        <div className="text-[10px] text-stay-brown font-bold mb-3 flex items-center gap-1">
                            <span className="bg-stay-brown/10 px-2 py-0.5 rounded">{b.category}</span>
                            <span>• {new Date(b.start_time).toLocaleString()}</span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{b.message}</p>

                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 p-3 rounded-xl">
                            <Clock size={14} className="text-stay-brown" />
                            <span>Resolution: {b.expected_resolution_time || "Not specified"}</span>
                        </div>
                    </div>
                ))}

                {broadcasts.length === 0 && !loading && (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Megaphone size={48} className="mx-auto mb-4 text-gray-200" />
                        <p className="text-gray-400 font-medium">No broadcast history found.</p>
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <form onSubmit={handleCreate} className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl scale-in">
                        <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                            <AlertCircle className="text-red-500" /> Send Emergency Notice
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Issue Category</label>
                                <select
                                    className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-stay-brown outline-none transition-all"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Notice Title</label>
                                <input
                                    required
                                    className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-stay-brown outline-none transition-all font-medium"
                                    placeholder="e.g. Total Power Outage"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Announcement Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-stay-brown outline-none transition-all text-sm"
                                    placeholder="Explain the situation and what is being done..."
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Estimated Resolution</label>
                                <input
                                    className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-stay-brown outline-none transition-all font-medium"
                                    placeholder="e.g. 2:00 PM today"
                                    value={form.expected_resolution_time}
                                    onChange={e => setForm({ ...form, expected_resolution_time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                            <button type="submit" className="flex-1 py-4 bg-stay-brown text-white font-bold rounded-2xl hover:bg-stay-brown/90 shadow-lg shadow-stay-brown/20 active:scale-95 transition-all">Send Broadcast</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
