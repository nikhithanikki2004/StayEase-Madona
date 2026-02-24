import { useEffect, useState } from "react";
import axios from "axios";
import { Star, Clock, User, MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Ratings = () => {
  const [complaints, setComplaints] = useState([]);
  const [pastReviews, setPastReviews] = useState([]);
  const [showPast, setShowPast] = useState(false);
  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchComplaints();
  }, [token]);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/complaints/student/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Pending: Resolved status AND NO rating yet
      const eligible = res.data.filter((c) => c.status === "Resolved" && !c.rating);

      // Past: HAS rating
      const past = res.data
        .filter((c) => c.rating)
        .map((c) => ({
          id: c.id,
          category: c.complaint_category,
          hostel_id: c.hostel_id,
          staff: c.assigned_to_name || c.resolved_by_name || "Staff",
          rating: c.rating.rating,
          feedback: c.rating.feedback,
          created_at: c.rating.created_at,
        }));

      setComplaints(eligible);
      setPastReviews(past);
    } catch (err) {
      console.error("Failed to fetch ratings", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-[#6F4E37] flex items-center justify-center md:justify-start gap-3">
            <Star className="fill-[#6F4E37]" /> Rate Your Experience
          </h1>
          <p className="text-[#8D6E63] mt-2">
            Your feedback helps us improve. Please rate resolved complaints.
          </p>
        </div>

        <button
          onClick={() => setShowPast(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FFF3E0] text-[#6F4E37] font-semibold rounded-xl hover:bg-[#FFE0B2] transition-colors shadow-sm mx-auto md:mx-0"
        >
          <Clock size={18} /> View Past Reviews
        </button>
      </div>

      {/* PENDING RATINGS GRID */}
      {complaints.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-10 text-center shadow-lg border border-[#6F4E37]/10"
        >
          <div className="w-20 h-20 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={40} className="text-[#6F4E37]" />
          </div>
          <h3 className="text-xl font-bold text-[#6F4E37]">All Caught Up!</h3>
          <p className="text-[#8D6E63] mt-2">
            You don't have any pending complaints to rate. Check back later!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {complaints.map((complaint) => (
              <RatingCard
                key={complaint.id}
                complaint={complaint}
                token={token}
                onSuccess={fetchComplaints}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* PAST REVIEWS MODAL */}
      <AnimatePresence>
        {showPast && (
          <PastReviewsModal
            reviews={pastReviews}
            onClose={() => setShowPast(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* 🔹 RATING CARD COMPONENT */
const RatingCard = ({ complaint, token, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRating = async () => {
    if (rating === 0) return;
    setLoading(true);

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/complaints/rate/${complaint.id}/`,
        { rating, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Wait a bit for animation
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err) {
      console.error("Failed to submit rating", err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-3xl p-6 shadow-xl border border-[#6F4E37]/10 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
    >
      {/* Decorative gradient top */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#6F4E37] to-[#8D6E63]" />

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFF3E0] text-[#6F4E37] mb-2 uppercase tracking-wide">
            {complaint.complaint_category}
          </span>
          <h3 className="text-lg font-bold text-[#3E2723]">
            {complaint.description.length > 50
              ? complaint.description.substring(0, 50) + "..."
              : complaint.description}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">Hostel ID</span>
          <p className="font-mono text-[#6F4E37] font-semibold">{complaint.hostel_id}</p>
        </div>
      </div>

      {/* STAFF INFO */}
      <div className="flex items-center gap-3 bg-[#FAFAFA] p-3 rounded-xl mb-6">
        <div className="w-10 h-10 rounded-full bg-[#6F4E37] text-[#FFF3E0] flex items-center justify-center font-bold">
          <User size={18} />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase font-semibold">Resolved By</p>
          <p className="text-[#3E2723] font-medium">
            {complaint.assigned_to_name || complaint.resolved_by_name || "Staff Member"}
          </p>
        </div>
      </div>

      {/* RATING INPUTS */}
      <div className="space-y-4">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`transition-all duration-200 transform ${rating >= star ? "scale-110" : "hover:scale-110"
                }`}
            >
              <Star
                size={32}
                className={`${rating >= star
                    ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                    : "fill-gray-100 text-gray-300"
                  } transition-colors`}
              />
            </button>
          ))}
        </div>

        <textarea
          placeholder="Write a short review (optional)..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full bg-[#FAFAFA] border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#6F4E37]/20 resize-none min-h-[80px]"
        />

        <button
          onClick={submitRating}
          disabled={rating === 0 || loading}
          className={`w-full py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 ${rating > 0
              ? "bg-[#6F4E37] text-white hover:bg-[#5D4037] active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? "Submitting..." : "Submit Rating & Close"}
        </button>
      </div>
    </motion.div>
  );
};

/* 🔹 PAST REVIEWS MODAL */
const PastReviewsModal = ({ reviews, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FFF8F0]">
          <h2 className="text-xl font-bold text-[#6F4E37] flex items-center gap-2">
            <Clock size={20} /> Review History
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#6F4E37] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
              <p>No past reviews yet.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white border boundary border-gray-100 p-4 rounded-xl shadow-sm flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#FFF3E0] rounded-xl flex flex-col items-center justify-center text-[#6F4E37]">
                    <span className="text-lg font-bold">{review.rating}</span>
                    <Star size={12} className="fill-[#6F4E37]" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[#3E2723]">{review.category}</h4>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#8D6E63] font-medium mb-2">Resolved by {review.staff}</p>
                  {review.feedback && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg italic">
                      "{review.feedback}"
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Ratings;
