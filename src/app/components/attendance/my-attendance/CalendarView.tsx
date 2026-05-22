import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  isAfter,
} from "date-fns";
import { motion } from "motion/react";
import { DailyAttendance } from "../../../modules/attendance/types";
import { getStatusColor, getStatusDots } from "./utils";
import { useAttendanceStore } from "../../../modules/attendance/store";

interface CalendarViewProps {
  records: DailyAttendance[];
  currentDate: Date;
  searchTerm: string;
  onRegularize: (date: string) => void;
  onSwipeDetails?: (record: DailyAttendance) => void;
}

export function CalendarView({
  records,
  currentDate,
  searchTerm,
  onSwipeDetails,
}: CalendarViewProps) {
  const { selectedDate, setSelectedDate } = useAttendanceStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="glassmorph-card glass-shine overflow-hidden shadow-2xl rounded-[3rem]">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-white/10 dark:bg-white/5 px-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
<div
            key={day}
            className="py-4 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-widest"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 min-h-[600px] gap-3 p-3">
        {calendarDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const record = records.find((r) => r.date === dateStr);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day) || format(day, "yyyy-MM-dd") === "2026-05-12";
          const isFuture = isAfter(day, new Date());

          const statusDots = record ? getStatusDots(record) : [];
          const isMatchingSearch =
            !searchTerm ||
            (record &&
              (record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.date.includes(searchTerm)));

          const isSelected = selectedDate === dateStr;

          return (
            <motion.button
              type="button"
              key={dateStr}
              initial={{ opacity: 0 }}
              animate={{ opacity: isMatchingSearch ? 1 : 0.3 }}
              disabled={!record}
              onClick={() => {
                if (!record) return;
                setSelectedDate(dateStr);
                onSwipeDetails?.(record);
              }}
              className={`relative min-h-[120px] p-4 calendar-tile transition-all group rounded-[26px] border border-white/10 dark:border-white/5 ${
                !isCurrentMonth
                  ? "bg-black/5 dark:bg-white/5 opacity-20"
                  : "text-left bg-white/10 dark:bg-white/5 hover:bg-white/30 dark:hover:bg-white/10"
              } ${
                isSelected ? "shadow-xl shadow-emerald-500/10" : ""
              } ${isTodayDate && !isSelected ? "ring-1 ring-emerald-500/25" : ""}`}
              whileHover={{
                y: -2,
                scale: isSelected ? 1.01 : 1.02,
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-2">
<span
                    className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : isTodayDate
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "text-foreground group-hover:bg-emerald-500/10"
                  }`}
                >
                  {format(day, "d")}
                </span>

                {/* Status Dots */}
                <div className="flex gap-1">
                  {statusDots.map((dotColor, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  ))}
                </div>
              </div>

              {/* Punch Data / Roster (for future dates) */}
              {isCurrentMonth && (
                <div className="space-y-1.5">
                  {isFuture ? (
                    <div className="flex flex-col opacity-40">
<span className="text-[9px] font-semibold text-muted-foreground uppercase leading-none mb-1">
                        Roster Shift
                      </span>
                      <span className="text-[11px] font-black text-foreground leading-tight">
                        09:00 - 18:00
                      </span>
                    </div>
                  ) : record ? (
                    <>
                      <div
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block uppercase tracking-tighter ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </div>

                      {record.firstIn && (
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                            In
                          </span>
                          <span className="text-[11px] font-black text-foreground leading-tight">
                            {record.firstIn}
                          </span>
                        </div>
                      )}

                      {record.lastOut && (
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                            Out
                          </span>
                          <span className="text-[11px] font-black text-foreground leading-tight">
                            {record.lastOut}
                          </span>
                        </div>
                      )}

                      {record.workHours > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                            {record.workHours.toFixed(1)}h
                          </span>
{record.lateMins > 0 && (
                            <span className="text-[9px] font-semibold text-rose-500">LATE</span>
                          )}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
