import { motion } from "motion/react";
import { AttendanceMetrics } from "./utils";

interface SummaryCardsProps {
  metrics: AttendanceMetrics;
}

type CardColor = "emerald" | "blue" | "green" | "rose" | "amber" | "orange";

const TREND_COLOR_STYLES: Record<
  CardColor,
  { chipBg: string; chipText: string; chipBorder: string }
> = {
  emerald: {
    chipBg: "bg-emerald-500/10",
    chipText: "text-emerald-500",
    chipBorder: "border-emerald-500/20",
  },
  blue: {
    chipBg: "bg-blue-500/10",
    chipText: "text-blue-500",
    chipBorder: "border-blue-500/20",
  },
  green: {
    chipBg: "bg-emerald-500/10",
    chipText: "text-emerald-500",
    chipBorder: "border-emerald-500/20",
  },
  rose: {
    chipBg: "bg-rose-500/10",
    chipText: "text-rose-500",
    chipBorder: "border-rose-500/20",
  },
  amber: {
    chipBg: "bg-amber-500/10",
    chipText: "text-amber-600",
    chipBorder: "border-amber-500/20",
  },
  orange: {
    chipBg: "bg-orange-500/10",
    chipText: "text-orange-500",
    chipBorder: "border-orange-500/20",
  },
};

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const cards: Array<{
    label: string;
    value: string;
    icon: string;
    trend: string;
    color: CardColor;
  }> = [
    {
      label: "Avg Work Hours",
      value: metrics.avgWorkHours.toFixed(1) + "h",
      icon: "",
      trend: "+5%",
      color: "emerald",
    },
    {
      label: "Avg Actual Work",
      value: metrics.avgActualWorkHours.toFixed(1) + "h",
      icon: "",
      trend: "-2%",
      color: "blue",
    },
    { label: "Present Days", value: String(metrics.presentDays), icon: "", trend: "Stable", color: "green" },
    { label: "Absent Days", value: String(metrics.absentDays), icon: "", trend: "0", color: "rose" },
    { label: "Leave Taken", value: String(metrics.leaveTaken), icon: "", trend: "+1", color: "amber" },
    { label: "Late In", value: String(metrics.lateInCount), icon: "", trend: "-3", color: "orange" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const trend = TREND_COLOR_STYLES[card.color];
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ y: -4, scale: 1.015 }}
            className="relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[26px] shadow-lg/60 border border-white/50 dark:border-white/10 px-5 py-4 transition-all cursor-default group overflow-hidden"
          >
            {/* soft liquid gradient */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl" />
              <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl" />
            </div>

            <div className="relative flex items-center justify-between mb-3">
              <span className="text-2xl text-muted-foreground group-hover:scale-125 transition-transform">{card.icon}</span>
              <span
                className={[
                  "text-[10px] font-black px-2 py-0.5 rounded-full",
                  trend.chipBg,
                  trend.chipText,
                  trend.chipBorder,
                  "border",
                ].join(" ")}
              >
                {card.trend}
              </span>
            </div>

            <p className="relative text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
              {card.label}
            </p>
            <h4 className="relative text-2xl font-black text-foreground tracking-tighter">{card.value}</h4>
          </motion.div>
        );
      })}
    </div>
  );
}
