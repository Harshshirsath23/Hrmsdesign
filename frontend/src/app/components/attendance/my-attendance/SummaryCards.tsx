import { motion } from "motion/react";
import { AttendanceMetrics } from "./utils";

interface SummaryCardsProps {
  metrics: AttendanceMetrics;
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const cards = [
    { label: "Avg Work Hours", value: metrics.avgWorkHours.toFixed(1) + "h", icon: "⏱️", trend: "+5%", color: "emerald" },
    { label: "Avg Actual Work", value: metrics.avgActualWorkHours.toFixed(1) + "h", icon: "⚡", trend: "-2%", color: "blue" },
    { label: "Present Days", value: metrics.presentDays, icon: "✅", trend: "Stable", color: "green" },
    { label: "Absent Days", value: metrics.absentDays, icon: "❌", trend: "0", color: "rose" },
    { label: "Leave Taken", value: metrics.leaveTaken, icon: "🌴", trend: "+1", color: "amber" },
    { label: "Late In", value: metrics.lateInCount, icon: "⏰", trend: "-3", color: "orange" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 p-5 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all cursor-default group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl group-hover:scale-125 transition-transform">{card.icon}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-${card.color}-500/10 text-${card.color}-500 border border-${card.color}-500/20`}>
              {card.trend}
            </span>
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{card.label}</p>
          <h4 className="text-2xl font-black text-foreground tracking-tighter">{card.value}</h4>
        </motion.div>
      ))}
    </div>
  );
}
