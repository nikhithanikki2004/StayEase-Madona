import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";

export default function MaintenanceCalendar({ tasks, onTaskClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
        days.push(new Date(year, month, i));
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const getTasksForDate = (date) => {
        if (!date) return [];
        return tasks.filter(task => {
            const taskDate = new Date(task.next_due_date);
            return taskDate.getDate() === date.getDate() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getFullYear() === date.getFullYear();
        });
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-stay-mocha p-6 text-stay-cream flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CalendarIcon className="text-stay-orange" size={24} />
                    <h2 className="text-xl font-bold">
                        {monthNames[month]} {year}
                    </h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-tighter">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {days.map((date, i) => {
                    const dateTasks = getTasksForDate(date);
                    const isToday = date && date.toDateString() === new Date().toDateString();
                    const hasOverdue = dateTasks.some(t => new Date(t.next_due_date) < new Date().setHours(0, 0, 0, 0));

                    return (
                        <div
                            key={i}
                            className={`min-h-[120px] p-2 border-r border-b border-gray-50 last:border-r-0 relative transition-colors ${date ? "hover:bg-stay-milk/30" : ""
                                }`}
                        >
                            {date && (
                                <>
                                    <span className={`text-sm font-bold inline-flex items-center justify-center w-7 h-7 rounded-md mb-1 ${isToday ? "bg-stay-orange text-white" : "text-stay-mocha/60"
                                        }`}>
                                        {date.getDate()}
                                    </span>

                                    <div className="space-y-1">
                                        {dateTasks.map(task => (
                                            <motion.div
                                                key={task.id}
                                                layoutId={`task-${task.id}`}
                                                onClick={() => onTaskClick(task)}
                                                className={`text-[10px] p-1.5 rounded-lg border cursor-pointer truncate transition-all ${new Date(task.next_due_date) < new Date().setHours(0, 0, 0, 0)
                                                        ? "bg-red-50 border-red-100 text-red-700 font-bold"
                                                        : "bg-stay-milk border-stay-mocha/10 text-stay-mocha font-medium"
                                                    } hover:scale-105 hover:shadow-sm`}
                                            >
                                                {task.title}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {hasOverdue && (
                                        <div className="absolute bottom-2 right-2 flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
