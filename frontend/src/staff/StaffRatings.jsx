import React, { useEffect, useState } from "react";
import { Star, TrendingUp, MessageSquare, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const StaffRatings = () => {
    const [ratingsData, setRatingsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRatings();
    }, []);

    const fetchRatings = async () => {
        try {
            const token = localStorage.getItem("access");
            const response = await axios.get("http://127.0.0.1:8000/api/staff/ratings/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRatingsData(response.data);
        } catch (error) {
            console.error("Error fetching ratings:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Award className="w-12 h-12 text-[#1e3a8a]" />
                </motion.div>
            </div>
        );
    }

    // Calculate rating distribution
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: ratingsData?.ratings.filter((r) => r.rating === star).length || 0,
    }));

    const maxCount = Math.max(...distribution.map((d) => d.count), 1);

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-[#1e3a8a] flex items-center gap-3">
                        <Award className="w-8 h-8 text-[#FFD700]" />
                        Performance Ratings
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Track your performance and student feedback
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-400 font-medium">Overall Score</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[#1e3a8a]">{ratingsData?.average_rating}</span>
                            <Star className="w-6 h-6 fill-[#FFD700] text-[#FFD700] animate-pulse" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Average Rating Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Star className="w-32 h-32" />
                    </div>
                    <h3 className="text-blue-100 font-medium mb-1">Average Rating</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">{ratingsData?.average_rating}</span>
                        <span className="text-xl text-blue-200">/ 5.0</span>
                    </div>
                    <div className="mt-4 flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-6 h-6 ${star <= Math.round(ratingsData?.average_rating || 0)
                                    ? "fill-[#FFD700] text-[#FFD700]"
                                    : "text-blue-300"
                                    }`}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Total Ratings Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <MessageSquare className="w-32 h-32 text-[#1e3a8a]" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <MessageSquare className="w-6 h-6 text-[#1e3a8a]" />
                        </div>
                        <div>
                            <h3 className="text-gray-500 font-medium">Total Reviews</h3>
                            <p className="text-2xl font-bold text-[#1e3a8a]">{ratingsData?.total_ratings}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">All time received</span>
                        </div>
                    </div>
                </motion.div>

                {/* Rating Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1"
                >
                    <h3 className="text-gray-800 font-bold mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                        {distribution.map((item) => (
                            <div key={item.star} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-12">
                                    <span className="text-sm font-bold text-gray-700">{item.star}</span>
                                    <Star className="w-3 h-3 text-gray-400" />
                                </div>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.count / maxCount) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${item.star >= 4 ? "bg-[#10b981]" : item.star === 3 ? "bg-[#f59e0b]" : "bg-[#ef4444]"
                                            }`}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 w-8 text-right">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Ratings List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#1e3a8a] mb-6">Recent Feedback</h2>

                {ratingsData?.ratings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-300"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Star className="w-10 h-10 text-blue-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">No Ratings Yet</h3>
                        <p className="text-gray-500 text-center max-w-sm mt-2">
                            Once you resolve complaints and students provide feedback, it will appear here.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ratingsData?.ratings.map((rating, index) => (
                            <motion.div
                                key={rating.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rating.rating >= 4 ? "bg-green-100 text-green-700" :
                                        rating.rating === 3 ? "bg-orange-100 text-orange-700" :
                                            "bg-red-100 text-red-700"
                                        }`}>
                                        {rating.complaint_category}
                                    </span>
                                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                                        <Clock className="w-3 h-3" />
                                        {new Date(rating.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 ${star <= rating.rating ? "fill-[#FFD700] text-[#FFD700]" : "text-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>

                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    "{rating.feedback || "No textual feedback provided."}"
                                </p>

                                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                                    <div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-bold">
                                        {rating.student_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{rating.student_name}</p>
                                        <p className="text-xs text-gray-400">Complaint #{rating.complaint_id}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffRatings;
