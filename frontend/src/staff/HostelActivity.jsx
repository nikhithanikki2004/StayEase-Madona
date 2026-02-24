import { motion } from "framer-motion";
import {
    ShieldAlert,
    MessageCircle,
    Clock,
    Package,
    Zap,
    PhoneCall
} from "lucide-react";

export default function HostelActivity() {
    const activities = [
        {
            title: "Current Shift",
            desc: "Morning Duty (08:00 - 16:00)",
            icon: <Clock size={20} />,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Active Handover",
            desc: "2 notes pending from night shift",
            icon: <MessageCircle size={20} />,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "Emergency",
            desc: "Warden contact: 911-222-333",
            icon: <ShieldAlert size={20} />,
            color: "text-red-600",
            bg: "bg-red-50"
        }
    ];

    const essentials = [
        { label: "Inventory Check", icon: <Package size={18} />, action: "Restock needed" },
        { label: "Maintenance", icon: <Zap size={18} />, action: "3 High Priority" },
        { label: "Call Security", icon: <PhoneCall size={18} />, action: "Ext: 101" },
    ];

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex-1 space-y-4">
                <h3 className="text-lg font-bold text-stay-mocha flex items-center gap-2">
                    <Clock className="text-stay-orange" size={20} />
                    Daily Duty Overview
                </h3>

                <div className="space-y-3">
                    {activities.map((act, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow group"
                        >
                            <div className={`p-3 rounded-xl ${act.bg} ${act.color} group-hover:scale-110 transition-transform`}>
                                {act.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-stay-mocha text-sm">{act.title}</h4>
                                <p className="text-xs text-gray-500 font-medium">{act.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <div className="grid grid-cols-1 gap-3">
                    {essentials.map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ x: 5 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-stay-milk/40 hover:bg-stay-milk transition-colors border border-transparent hover:border-stay-brown/10 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-stay-mocha/60">{item.icon}</span>
                                <span className="text-sm font-semibold text-stay-mocha">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stay-orange bg-stay-orange/10 px-2 py-0.5 rounded-full">
                                {item.action}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
