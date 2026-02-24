import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Calendar, User, Search, FileText, ChevronRight, History } from "lucide-react";
import toast from "react-hot-toast";
import ComplaintTimeline from "./ComplaintTimeline";

export default function ResolutionHistory() {
    const [history, setHistory] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [search, setSearch] = useState("");
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);

    const token = localStorage.getItem("access");

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/staff/history/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setHistory(res.data);
        } catch (err) {
            console.error("Error fetching history:", err);
            // toast.error("Failed to load resolution history");
        }
    };

    const filteredHistory = history.filter(item =>
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.student_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-stay-mocha flex items-center gap-2">
                        <History className="text-stay-brown" /> Resolution History
                    </h1>
                    <p className="text-stay-latte font-medium mt-1">Archive of resolved complaints</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:ring-2 focus:ring-stay-brown/50 outline-none transition-all w-64 text-sm text-stay-mocha"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredHistory.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                                setSelectedComplaint(item);
                                setIsTimelineOpen(true);
                            }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-stay-brown/20 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 rounded-l-2xl group-hover:bg-stay-brown transition-colors"></div>

                            <div className="flex justify-between items-start mb-3">
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                                    Resolved
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar size={12} /> {new Date(item.resolved_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-stay-mocha mb-1 truncate">{item.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User size={14} className="text-stay-latte" /> {item.student_name}
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-stay-brown transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <History size={64} className="opacity-20 mb-4" />
                    <p className="text-lg">No history found</p>
                </div>
            )}

            {/* TIMELINE MODAL */}
            <AnimatePresence>
                {isTimelineOpen && selectedComplaint && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <ComplaintTimeline
                                complaint={selectedComplaint}
                                onClose={() => setIsTimelineOpen(false)}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
