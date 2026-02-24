import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertTriangle, AlertCircle, User, MessageSquare, X } from "lucide-react";

export default function ComplaintTimeline({ complaint, onClose }) {
    const [timelineEvents, setTimelineEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("access");

    useEffect(() => {
        fetchTimeline();
    }, [complaint.id]);

    const fetchTimeline = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `http://127.0.0.1:8000/api/staff/complaints/${complaint.id}/timeline/`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Map backend logs to timeline events with appropriate icons and colors
            const events = res.data.map((log) => {
                const eventConfig = getEventConfig(log.action);
                return {
                    id: log.id,
                    type: log.action.toLowerCase().replace(/\s+/g, '_'),
                    title: log.action,
                    description: log.notes || `Action performed by ${log.performed_by}`,
                    date: log.created_at,
                    icon: eventConfig.icon,
                    color: eventConfig.color,
                    bg: eventConfig.bg,
                    image: log.proof,
                    performer: log.performed_by,
                };
            });

            setTimelineEvents(events);
            setError(null);
        } catch (err) {
            console.error("Error fetching timeline:", err);
            setError("Failed to load timeline data");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to map action types to icons and colors
    const getEventConfig = (action) => {
        const actionLower = action.toLowerCase();

        if (actionLower.includes("created") || actionLower.includes("submitted")) {
            return { icon: AlertCircle, color: "text-stay-orange", bg: "bg-stay-orange/10" };
        } else if (actionLower.includes("progress")) {
            return { icon: Clock, color: "text-stay-brown", bg: "bg-stay-brown/10" };
        } else if (actionLower.includes("resolved")) {
            return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" };
        } else if (actionLower.includes("escalated")) {
            return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" };
        } else if (actionLower.includes("admin") || actionLower.includes("replied")) {
            return { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-100" };
        } else {
            return { icon: MessageSquare, color: "text-stay-mocha", bg: "bg-stay-mocha/10" };
        }
    };

    // ✅ Enhance timeline events with actual data from logs/complaint if needed
    // In this case, we'll check if the complaint has a resolution_proof and append it to the resolved event
    const finalEvents = timelineEvents.map(event => {
        if (event.type.includes("resolved") && complaint.resolution_proof && !event.image) {
            return {
                ...event,
                image: complaint.resolution_proof
            };
        }
        return event;
    });

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* HEADER */}
            <div className="bg-stay-mocha text-stay-cream p-6 flex items-center justify-between sticky top-0 z-10 shadow-md">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Timeline #{complaint.id}
                    </h2>
                    <p className="text-xs text-stay-latte mt-1 opacity-80">{complaint.title}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* TIMELINE CONTENT */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative">
                {/* LOADING STATE */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stay-brown"></div>
                    </div>
                )}

                {/* ERROR STATE */}
                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <AlertTriangle size={48} className="mb-4" />
                        <p className="text-lg font-semibold">{error}</p>
                        <button
                            onClick={fetchTimeline}
                            className="mt-4 px-4 py-2 bg-stay-brown text-white rounded-lg hover:bg-stay-mocha transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* TIMELINE EVENTS */}
                {!loading && !error && (
                    <>
                        {/* Vertical Line */}
                        <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                        <div className="space-y-8 relative z-0">
                            {finalEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-4 relative"
                                >
                                    {/* Icon Node */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm ${event.bg} ${event.color}`}>
                                        <event.icon size={18} />
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`font-bold text-sm ${event.color}`}>{event.title}</h4>
                                            <span className="text-xs text-gray-400">{new Date(event.date).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>

                                        {event.image && (
                                            <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 max-w-xs">
                                                <img
                                                    src={event.image.startsWith('http') ? event.image : `http://127.0.0.1:8000${event.image}`}
                                                    alt="Resolution proof"
                                                    className="w-full h-32 object-cover hover:scale-105 transition-transform"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* IF NOT RESOLVED, SHOW CURRENT STATUS INDICATOR */}
                            {!complaint.resolved_at && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex gap-4 relative opacity-50"
                                >
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 bg-gray-100 border-4 border-white text-gray-400">
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                                    </div>
                                    <div className="py-2 text-sm text-gray-400 italic">
                                        Awaiting further updates...
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
