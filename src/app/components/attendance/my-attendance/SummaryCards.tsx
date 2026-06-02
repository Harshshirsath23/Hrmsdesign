import { Activity, AlarmClock, CalendarCheck2, CalendarX2, Clock3, LucideIcon, Plane } from "lucide-react";
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
  const d = metrics.deltas;
  const cards: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
    trend: string;
    color: CardColor;
  }> = [
    {
      label: "Avg Work Hours",
      value: metrics.avgWorkHours.toFixed(1) + "h",
      icon: Clock3,
      trend: d?.avgWorkHours ?? "+0%",
      color: "emerald",
    },
    {
      label: "Avg Actual Work",
      value: metrics.avgActualWorkHours.toFixed(1) + "h",
      icon: Activity,
      trend: d?.avgActualWork ?? "Stable",
      color: "blue",
    },
    { label: "Present Days", value: String(metrics.presentDays), icon: CalendarCheck2, trend: d?.presentDays ?? "Stable", color: "green" },
    { label: "Absent Days", value: String(metrics.absentDays), icon: CalendarX2, trend: d?.absentDays ?? "0", color: "rose" },
    { label: "Leave Taken", value: String(metrics.leaveTaken), icon: Plane, trend: d?.leaveTaken ?? "0", color: "amber" },
    { label: "Late In", value: String(metrics.lateInCount), icon: AlarmClock, trend: d?.lateIn ?? "0", color: "orange" },
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
            className="attendance-summary-card relative px-5 py-4 transition-all cursor-default group overflow-hidden"
          >
            <div className="relative flex items-center justify-between mb-3">
              <span className="attendance-summary-icon">
                <card.icon size={18} />
              </span>
              <span
                className={[
                  "attendance-trend-chip text-[10px] font-bold px-2 py-0.5 rounded-full",
                  trend.chipBg,
                  trend.chipText,
                  trend.chipBorder,
                  "border",
                ].join(" ")}
              >
                {card.trend}
              </span>
            </div>

            <p className="relative text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              {card.label}
            </p>
            <h4 className="relative text-2xl font-semibold text-foreground tracking-tight">{card.value}</h4>
          </motion.div>
        );
      })}
    </div>
  );
}
