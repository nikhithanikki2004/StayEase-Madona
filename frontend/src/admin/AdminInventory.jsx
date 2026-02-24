import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Package, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

export default function AdminInventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", total_quantity: "", unit: "pcs", category: "Other" });
    const [restockItem, setRestockItem] = useState(null);
    const [restockQty, setRestockQty] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const token = localStorage.getItem("access");

    const CATEGORY_OPTIONS = [
        { label: "All", value: "All" },
        { label: "Electricity", value: "Electricity" },
        { label: "Plumbing", value: "Plumbing" },
        { label: "Furniture", value: "Furniture" },
        { label: "Cleaning", value: "Cleaning" },
        { label: "Water", value: "Water" },
        { label: "Internet", value: "Internet" },
        { label: "Food / Mess", value: "Food" }, // Value matches backend model
        { label: "Other", value: "Other" }
    ];

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/inventory/items/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load inventory");
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.total_quantity) return toast.error("Fill all fields");
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/inventory/items/`, {
                ...newItem,
                available_quantity: newItem.total_quantity
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Item Added");
            fetchInventory();
            setShowAddModal(false);
            setNewItem({ name: "", total_quantity: "", unit: "pcs", category: "Other" });
        } catch (err) {
            toast.error("Failed to add item");
        }
    };

    const handleRestock = async () => {
        if (!restockQty || restockQty <= 0) return toast.error("Invalid quantity");
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/inventory/items/${restockItem.id}/add_stock/`, {
                quantity: restockQty
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Stock Updated");
            fetchInventory();
            setRestockItem(null);
            setRestockQty("");
        } catch (err) {
            toast.error("Failed to restock");
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/inventory/items/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Item Deleted");
                fetchInventory();
            } catch (err) {
                toast.error("Failed to delete item");
            }
        }
    };

    const filteredItems = selectedCategory === "All"
        ? items
        : items.filter(item => item.category === selectedCategory);

    const getCategoryLabel = (val) => {
        const found = CATEGORY_OPTIONS.find(c => c.value === val);
        return found ? found.label : val;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package /> Inventory Management
                    </h1>
                    <p className="text-gray-500 text-sm">Track stock and manage supplies</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                    <Plus size={18} /> Add New Item
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 border-b border-gray-100">
                {CATEGORY_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setSelectedCategory(opt.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === opt.value
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                                    <p className="text-xs text-blue-600 font-semibold mb-1">{getCategoryLabel(item.category)}</p>
                                    <p className="text-xs text-gray-400">Unit: {item.unit}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.available_quantity < 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                    {item.available_quantity} Available
                                </div>
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                <div
                                    className={`h-2 rounded-full ${item.available_quantity < 5 ? "bg-red-500" : "bg-blue-500"}`}
                                    style={{ width: `${Math.min((item.available_quantity / item.total_quantity) * 100, 100)}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                                <span className="text-xs text-gray-400">Total: {item.total_quantity}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setRestockItem(item)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Restock"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD COMPONENT MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Inventory Item</h2>
                        <input
                            className="w-full border p-3 rounded-lg mb-3"
                            placeholder="Item Name (e.g., LED Bulb)"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        />
                        <select
                            className="w-full border p-3 rounded-lg mb-3"
                            value={newItem.category}
                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                        >
                            {CATEGORY_OPTIONS.filter(c => c.value !== "All").map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <div className="flex gap-3 mb-3">
                            <input
                                type="number"
                                className="w-2/3 border p-3 rounded-lg"
                                placeholder="Initial Quantity"
                                value={newItem.total_quantity}
                                onChange={e => setNewItem({ ...newItem, total_quantity: e.target.value })}
                            />
                            <select
                                className="w-1/3 border p-3 rounded-lg"
                                value={newItem.unit}
                                onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                            >
                                <option value="pcs">pcs</option>
                                <option value="mtrs">mtrs</option>
                                <option value="liters">liters</option>
                                <option value="kg">kg</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleAddItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Item</button>
                        </div>
                    </div>
                </div>
            )}

            {/* RESTOCK MODAL */}
            {restockItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-4">Restock {restockItem.name}</h2>
                        <input
                            type="number"
                            className="w-full border p-3 rounded-lg mb-4"
                            placeholder="Quantity to add"
                            value={restockQty}
                            onChange={e => setRestockQty(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setRestockItem(null)} className="px-4 py-2 text-gray-600">Cancel</button>
                            <button onClick={handleRestock} className="px-4 py-2 bg-green-600 text-white rounded-lg">Confirm Restock</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
