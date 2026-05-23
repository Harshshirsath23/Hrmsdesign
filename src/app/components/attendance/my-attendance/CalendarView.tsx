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

  const getRegularizationReason = (record?: DailyAttendance) => {
    if (!record) return "";
    if (!record.firstIn || !record.lastOut) return "Missing punch";
    if (record.isLate) return "Late login";
    if (record.earlyExitMins > 0) return "Early logout";
    if (record.status === "Half Day") return "Half day";
    if (record.status === "Absent") return "Absent";
    if (record.approvalPending) return "Pending request";
    return "";
  };

  return (
    <div className="attendance-calendar-shell overflow-hidden">
      {/* Weekday Headers */}
      <div className="attendance-weekdays grid grid-cols-7 px-3">
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
      <div className="attendance-calendar-grid grid grid-cols-7 min-h-[600px] gap-3 p-3">
        {calendarDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const record = records.find((r) => r.date === dateStr);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);
          const isFuture = isAfter(day, new Date());

          const statusDots = record ? getStatusDots(record) : [];
          const isMatchingSearch =
            !searchTerm ||
            (record &&
              (record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.date.includes(searchTerm)));

          const isSelected = selectedDate === dateStr;
          const regularizationReason = getRegularizationReason(record);

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
              className={`attendance-day-card relative min-h-[172px] p-4 calendar-tile transition-all group ${
                !isCurrentMonth
                  ? "is-muted opacity-20"
                  : "text-left"
              } ${
                isSelected ? "is-selected" : ""
              } ${isTodayDate && !isSelected ? "is-today" : ""} ${regularizationReason ? "needs-regularization" : ""} ${
                record?.isLate ? "needs-late" : ""
              } ${record?.earlyExitMins && record.earlyExitMins > 0 ? "needs-early" : ""} ${
                record?.status === "Half Day" ? "needs-halfday" : ""
              } ${record?.status === "Absent" ? "needs-absent" : ""} ${
                record && (!record.firstIn || !record.lastOut) ? "needs-missing" : ""
              } ${record?.approvalPending ? "needs-pending" : ""}`}
              whileHover={{
                y: isCurrentMonth ? -2 : 0,
                scale: isCurrentMonth ? 1.01 : 1,
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* Date Number */}
              <div className="attendance-day-top flex items-center justify-between">
                <span
                    className={`attendance-date-orb flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                    isSelected
                      ? "is-active"
                      : isTodayDate
                        ? "is-active"
                        : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>

                <div className="attendance-dot-row flex gap-1">
                  {statusDots.map((dotColor, i) => (
                    <span key={i} className={`attendance-status-dot ${dotColor}`} />
                  ))}
                </div>
              </div>

              {isCurrentMonth && (
                <div className="attendance-day-body">
                  {isFuture ? (
                    <div className="attendance-shift-block opacity-60">
                      <span className="attendance-cell-label">
                        Roster Shift
                      </span>
                      <span className="attendance-cell-value">
                        09:00 - 18:00
                      </span>
                    </div>
                  ) : record ? (
                    <>
                      <div
                        className={`attendance-status-pill text-[10px] font-semibold px-2.5 py-1 inline-flex uppercase tracking-tighter ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </div>

                      <div className="attendance-time-grid">
                        <div className="attendance-time-item">
                          <span className="attendance-cell-label">
                            In
                          </span>
                          <span className="attendance-cell-value">
                            {record.firstIn || "--:--"}
                          </span>
                        </div>

                        <div className="attendance-time-item">
                          <span className="attendance-cell-label">
                            Out
                          </span>
                          <span className="attendance-cell-value">
                            {record.lastOut || "--:--"}
                          </span>
                        </div>
                      </div>

                      <div className="attendance-shift-block">
                        <span className="attendance-cell-label">Shift</span>
                        <span className="attendance-cell-value">{record.shiftName || "09:00 - 18:00"}</span>
                      </div>

                      <div className="attendance-day-footer">
                        <span className="attendance-hours-pill">
                          {record.workHours > 0 ? `${record.workHours.toFixed(1)}h` : "--"}
                        </span>
                        {regularizationReason && (
                          <span className="attendance-regularization-chip">
                            {regularizationReason}
                          </span>
                        )}
                      </div>

                      <div className="attendance-extra-line">
                        {record.lateMins > 0 && (
                          <span className="attendance-mini-flag flag-late">Late {record.lateMins}m</span>
                        )}
                        {record.earlyExitMins > 0 && (
                          <span className="attendance-mini-flag flag-early">Early {record.earlyExitMins}m</span>
                        )}
                        {record.approvalPending && (
                          <span className="attendance-mini-flag flag-pending">Pending</span>
                        )}
                      </div>
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
