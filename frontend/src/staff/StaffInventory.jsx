import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package,
    Search,
    Plus,
    AlertTriangle,
    ClipboardList,
    Filter,
    Trash2,
    RotateCcw,
    CheckCircle,
    X
} from "lucide-react";
import toast from "react-hot-toast";

export default function StaffInventory() {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestItem, setRequestItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [usageNote, setUsageNote] = useState("");

    const token = localStorage.getItem("access");

    useEffect(() => {
        fetchInventory();
    }, []);

    useEffect(() => {
        let result = items;
        if (filter !== "all") {
            result = result.filter(item => item.category === filter);
        }
        if (search) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        setFilteredItems(result);
    }, [search, filter, items]);

    const fetchInventory = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/inventory/items/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(res.data);
            setFilteredItems(res.data);
        } catch (err) {
            console.error("Error fetching inventory:", err);
            toast.error("Failed to load inventory");
        }
    };

    const handleUseItem = async () => {
        if (!requestItem || quantity <= 0) return;

        try {
            await axios.post(
                `http://127.0.0.1:8000/api/inventory/items/${requestItem.id}/log_usage/`,
                { quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Inventory updated successfully");
            setIsRequestModalOpen(false);
            setQuantity(1);
            setUsageNote("");
            fetchInventory();
        } catch (err) {
            console.error("Usage log failed:", err);
            toast.error("Failed to log usage");
        }
    };

    const categories = ["all", ...new Set(items.map(item => item.category))];

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stay-mocha flex items-center gap-2">
                        <Package className="text-stay-orange" /> Inventory Management
                    </h1>
                    <p className="text-stay-latte font-medium mt-1">Track and manage hostel supplies</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-stay-latte/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-stay-orange/50 outline-none transition-all w-64 text-sm text-stay-mocha placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-all
              ${filter === cat
                                ? "bg-stay-mocha text-stay-cream shadow-md"
                                : "bg-white text-stay-latte hover:bg-stay-cream hover:text-stay-mocha border border-transparent hover:border-stay-latte/20"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* INVENTORY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredItems.map((item) => (
                        <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-stay-milk rounded-2xl shadow-lg shadow-stay-brown/5 border border-stay-latte/30 overflow-hidden hover:shadow-xl transition-shadow group relative"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${item.quantity < 10 ? 'bg-red-100 text-red-600' : 'bg-stay-orange/10 text-stay-orange'}`}>
                                        <Package size={24} />
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${item.quantity < 10 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                        {item.quantity < 10 ? "Low Stock" : "In Stock"}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-stay-mocha mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{item.category}</p>

                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold text-stay-brown">
                                        {item.quantity} <span className="text-sm font-medium text-gray-400">{item.unit}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setRequestItem(item);
                                            setIsRequestModalOpen(true);
                                        }}
                                        className="p-2 rounded-lg bg-white border border-stay-latte/30 text-stay-mocha hover:bg-stay-mocha hover:text-stay-cream transition-colors"
                                        title="Log Usage"
                                    >
                                        <ClipboardList size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Decorative progress bar at bottom */}
                            <div className="h-1.5 w-full bg-gray-100 mt-auto">
                                <div
                                    className={`h-full ${item.quantity < 10 ? 'bg-red-500' : 'bg-stay-orange'}`}
                                    style={{ width: `${Math.min((item.quantity / 50) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Package size={64} className="opacity-20 mb-4" />
                    <p className="text-lg">No items found</p>
                </div>
            )}

            {/* LOG USAGE MODAL */}
            <AnimatePresence>
                {isRequestModalOpen && requestItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="bg-stay-mocha p-6 text-stay-cream flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <ClipboardList size={20} /> Log Usage
                                </h2>
                                <button
                                    onClick={() => setIsRequestModalOpen(false)}
                                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Item</label>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-stay-mocha font-medium">
                                        {requestItem.name}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantity Used</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                            className="w-20 text-center py-2 rounded-lg bg-gray-50 border border-gray-200 font-bold text-stay-mocha"
                                        />
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
                                        >
                                            +
                                        </button>
                                        <span className="text-sm text-gray-400">Available: {requestItem.quantity}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
                                    <textarea
                                        value={usageNote}
                                        onChange={(e) => setUsageNote(e.target.value)}
                                        rows="3"
                                        placeholder="Project ID, Location, etc."
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-stay-orange/50 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsRequestModalOpen(false)}
                                    className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUseItem}
                                    className="px-6 py-2 bg-stay-mocha text-stay-cream font-bold rounded-xl shadow-lg shadow-stay-mocha/30 hover:bg-stay-brown transition-all active:scale-95"
                                >
                                    Confirm Usage
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
