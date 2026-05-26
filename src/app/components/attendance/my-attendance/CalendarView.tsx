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

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getDayBackground = (
    record?: DailyAttendance,
    isFuture?: boolean
  ) => {
    // NO COLORS FOR FUTURE DATES
    if (!record || isFuture)
      return "bg-[#F8FAFC] dark:bg-[#0F172A] border-black/10 dark:border-white/10";

    // PRESENT -> GREEN
    if (record.status === "Present")
      return "bg-green-100 dark:bg-green-950/40 border-green-300 dark:border-green-800";

    // ABSENT -> RED
    if (record.status === "Absent")
      return "bg-red-100 dark:bg-red-950/40 border-red-300 dark:border-red-800";

    // HALF DAY -> ORANGE
    if (record.status === "Half Day")
      return "bg-orange-100 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800";

    // HOLIDAY -> BLUE
    if (record.status === "Holiday")
      return "bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800";

    // WEEK OFF -> GRAY
    if (record.status === "Week Off")
      return "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700";

    return "bg-[#F8FAFC] dark:bg-[#0F172A] border-black/10 dark:border-white/10";
  };

  const getStatusDot = (
    record?: DailyAttendance,
    isFuture?: boolean
  ) => {
    if (!record || isFuture) return "";

    if (record.status === "Present")
      return "bg-green-500";

    if (record.status === "Absent")
      return "bg-red-500";

    if (record.status === "Half Day")
      return "bg-orange-500";

    if (record.status === "Holiday")
      return "bg-blue-500";

    if (record.status === "Week Off")
      return "bg-gray-400";

    return "bg-slate-400";
  };

  return (
    <div className="w-full rounded-[28px] overflow-hidden border border-white/10 bg-white/60 dark:bg-[#111827]/70 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-all duration-300">

      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-black/10 dark:border-white/10 px-4 py-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Legends
      <div className="flex items-center gap-4 px-4 py-3 border-b border-black/10 dark:border-white/10 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Present
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Absent
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Half Day
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Holiday
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Week Off
          </span>
        </div>
      </div> */}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 p-2 bg-black/5 dark:bg-white/5">
        {calendarDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");

          const record = records.find((r) => r.date === dateStr);

          const isCurrentMonth = isSameMonth(day, monthStart);

          const isTodayDate = isToday(day);

          const isFuture = isAfter(day, new Date());

          const isSelected = selectedDate === dateStr;

          const isMatchingSearch =
            !searchTerm ||
            (record &&
              (record.status
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
                record.date.includes(searchTerm)));

          const isRestrictedStatus =
            record?.status === "Absent" ||
            record?.status === "Week Off" ||
            record?.status === "Holiday";

          return (
            <motion.button
              key={dateStr}
              type="button"
              disabled={!record || isFuture}
              initial={{ opacity: 0 }}
              animate={{
                opacity: isMatchingSearch ? 1 : 0.35,
              }}
              whileHover={{
                scale: isCurrentMonth ? 1.015 : 1,
              }}
              transition={{
                duration: 0.22,
                ease: "easeOut",
              }}
              onClick={() => {
                if (!record || isFuture) return;

                setSelectedDate(dateStr);

                if (isRestrictedStatus) return;

                onSwipeDetails?.(record);
              }}
              className={`
                relative
                h-[165px]
                overflow-hidden
                rounded-2xl
                border
                p-3
                text-left
                transition-all
                duration-300

                ${getDayBackground(record, isFuture)}

                ${
                  !isCurrentMonth
                    ? "opacity-30"
                    : ""
                }

                ${
                  isSelected
                    ? "ring-2 ring-indigo-500 z-10"
                    : ""
                }
              `}
            >
              {/* Today Highlight */}
              {isTodayDate && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/12 to-violet-500/12 dark:from-indigo-500/20 dark:to-violet-500/20 pointer-events-none rounded-2xl" />
              )}

              {/* Top */}
              <div className="relative z-10 flex items-start justify-between">
                {!isFuture && record && (
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${getStatusDot(
                      record,
                      isFuture
                    )}`}
                  />
                )}

                <div
                  className={`
                    flex items-center justify-center
                    w-8 h-8
                    rounded-full
                    text-sm
                    font-semibold
                    transition-all

                    ${
                      isTodayDate
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                        : "text-slate-700 dark:text-slate-200"
                    }
                  `}
                >
                  {format(day, "d")}
                </div>
              </div>

              {/* Body */}
              {isCurrentMonth && (
                <div className="relative z-10 mt-4 flex flex-col gap-3">

                  {/* Future Dates */}
                  {isFuture ? (
                    <>
                      {/* Roster */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Roster
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                          General Shift
                        </p>
                      </div>

                      {/* Roster Timing */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-400">
                            Start
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                            09:00
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-slate-400">
                            End
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                            18:00
                          </p>
                        </div>
                      </div>

                      {/* Shift */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Shift
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                          09:00 - 18:00
                        </p>
                      </div>
                    </>
                  ) : record ? (
                    <>
                      {/* ONLY STATUS FOR WEEK OFF / HOLIDAY / ABSENT */}
                      {isRestrictedStatus ? (
                        <div className="mt-6">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400">
                            Status
                          </p>

                          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-white">
                            {record.status}
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Footer */}
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {record.workHours > 0
                                ? `${record.workHours.toFixed(
                                    1
                                  )}h`
                                : "--"}
                            </div>

                            {(record.isLate ||
                              record.earlyExitMins > 0 ||
                              record.approvalPending) && (
                              <div className="flex items-center gap-1">
                                {record.approvalPending && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </>
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