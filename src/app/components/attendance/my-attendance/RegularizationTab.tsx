import { useState, useMemo, useEffect } from "react";
import { format, isSameMonth, parse, startOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, endOfMonth, isAfter, parseISO } from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Send,
  ArrowRight,
  Info,
  Lock,
  LogIn,
  LogOut
} from "lucide-react";
import { DailyAttendance } from "../../../modules/attendance/types";
import { isDateLocked } from "./utils";
import { motion, AnimatePresence } from "motion/react";

interface RegularizationTabProps {
  records: DailyAttendance[];
  initialDate?: string | null;
  readOnly?: boolean;
}

export function RegularizationTab({ records, initialDate, readOnly = false }: RegularizationTabProps) {
  const [currentNavDate, setCurrentNavDate] = useState(new Date(2026, 4, 1)); // Default May 2026
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // Deep-link from other views
  useEffect(() => {
    if (initialDate) {
      const date = parse(initialDate, "yyyy-MM-dd", new Date());
      const dateKey = format(date, "yyyy-MM-dd");
      setSelectedDates([dateKey]);
      setCurrentNavDate(startOfMonth(date));
    }
  }, [initialDate]);

  const monthStart = startOfMonth(currentNavDate);
  const calendarDays = eachDayOfInterval({ 
    start: startOfWeek(monthStart), 
    end: endOfWeek(endOfMonth(monthStart)) 
  });

  const selectedRecords = useMemo(() => {
    return records.filter(r => selectedDates.includes(r.date));
  }, [selectedDates, records]);

  const selectedRecord = selectedRecords.length > 0 ? selectedRecords[0] : null;
  const isLocked = selectedDates.some(date => isDateLocked(parse(date, "yyyy-MM-dd", new Date())));

  const toggleSelectedDate = (day: Date, isCurrentMonth: boolean, isFuture: boolean) => {
    if (!isCurrentMonth || isFuture) return;
    const dateKey = format(day, "yyyy-MM-dd");
    setSelectedDates((prev) =>
      prev.includes(dateKey) ? prev.filter((date) => date !== dateKey) : [...prev, dateKey].sort()
    );
  };

  const clearSelection = () => {
    setSelectedDates([]);
  };

  const getRegularizationMeta = (record?: DailyAttendance) => {
    if (!record) {
      return { label: "No record", className: "needs-missing", dots: ["attendance-dot-missing"] };
    }
    if (!record.firstIn || !record.lastOut) {
      return { label: "Missing punch", className: "needs-missing", dots: ["attendance-dot-missing"] };
    }
    if (record.approvalPending) {
      return { label: "Pending", className: "needs-pending", dots: ["attendance-dot-present"] };
    }
    if (record.isLate) {
      return { label: `Late ${record.lateMins}m`, className: "needs-late", dots: ["attendance-dot-late"] };
    }
    if (record.earlyExitMins > 0) {
      return { label: `Early ${record.earlyExitMins}m`, className: "needs-early", dots: ["attendance-dot-early"] };
    }
    if (record.status === "Half Day") {
      return { label: "Half day", className: "needs-halfday", dots: ["attendance-dot-halfday"] };
    }
    if (record.status === "Absent") {
      return { label: "Absent", className: "needs-absent", dots: ["attendance-dot-absent"] };
    }
    return { label: record.status, className: "", dots: ["attendance-dot-present"] };
  };

  const selectedCount = selectedDates.length;
  const selectedDateLabel = selectedCount === 1
    ? selectedDates[0]
    : `${selectedCount} dates selected`;

  const [perDateComments, setPerDateComments] = useState<Record<string, string>>({});

  useEffect(() => {
    // ensure per-date comment entries exist for each selected date (preserve existing comments)
    setPerDateComments((prev) => {
      const next: Record<string, string> = {};
      selectedDates.forEach((d) => {
        next[d] = prev[d] || "";
      });
      return next;
    });
  }, [selectedDates]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Calendar Selection & Info */}
      <div className="lg:col-span-5 space-y-6">
        <div className="attendance-regularization-panel p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground tracking-tight">{format(currentNavDate, "MMMM yyyy")}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="attendance-nav-button p-3 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="attendance-nav-button p-3 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {["S", "M", "T", "W", "T", "F", "S"].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-muted-foreground py-2 uppercase tracking-widest">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const isSel = selectedDates.includes(dateKey);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isFuture = isAfter(day, new Date());
              const locked = isDateLocked(day);
              const dayRecord = records.find((record) => record.date === dateKey);
              const meta = getRegularizationMeta(dayRecord);
              const needsAction = isCurrentMonth && !isFuture && Boolean(dayRecord?.approvalPending || dayRecord?.isLate || dayRecord?.earlyExitMins || dayRecord?.isHalfDay || dayRecord?.isAbsent || !dayRecord?.firstIn || !dayRecord?.lastOut);

              return (
                <button
                  key={i}
                  disabled={!isCurrentMonth || isFuture}
                  onClick={() => toggleSelectedDate(day, isCurrentMonth, isFuture)}
                  className={`attendance-regularization-day relative flex flex-col text-xs font-semibold transition-all ${
                    !isCurrentMonth || isFuture ? "opacity-10 cursor-not-allowed" : ""
                  } ${isSel ? "is-selected z-10" : "text-foreground"} ${locked ? "is-locked" : ""} ${
                    needsAction ? `needs-regularization ${meta.className}` : ""
                  }`}
                >
                  <span className="attendance-reg-day-top">
                    <span>{format(day, "d")}</span>
                    <span className="attendance-dot-row">
                      {isCurrentMonth && !isFuture && meta.dots.map((dot) => (
                        <span key={dot} className={`attendance-status-dot ${dot}`} />
                      ))}
                    </span>
                  </span>
                  <span className="attendance-reg-day-label">
                    {isCurrentMonth && !isFuture ? meta.label : ""}
                  </span>
                  {locked && !isSel && isCurrentMonth && <Lock size={10} className="absolute top-2 right-2 text-rose-500/60" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Summary */}
        <AnimatePresence mode="wait">
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="attendance-selected-panel p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="attendance-section-icon p-2.5 rounded-xl"><CalendarIcon size={18} /></div>
                  <div>
                    <h4 className="text-xs font-black text-foreground uppercase tracking-tight">Selected Dates</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{selectedDateLabel}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="grid gap-2 text-[11px] text-muted-foreground">
                {selectedDates.slice(0, 5).map((date) => (
                  <div key={date} className="inline-flex items-center gap-2 rounded-2xl bg-white/20 dark:bg-slate-800/20 px-3 py-2 text-xs font-black text-foreground">
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                    {format(parseISO(date), "EEE, dd MMM")}
                  </div>
                ))}
                {selectedCount > 5 && (
                  <span className="text-[9px] text-muted-foreground">+{selectedCount - 5} more date(s) selected</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 flex flex-col items-center text-center">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 mb-1.5"><LogIn size={16} /></div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Punch In</p>
                  <p className="text-base font-black text-foreground leading-tight">{selectedRecord?.firstIn || "No Punch"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 flex flex-col items-center text-center">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 mb-1.5"><LogOut size={16} /></div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Punch Out</p>
                  <p className="text-base font-black text-foreground leading-tight">{selectedRecord?.lastOut || "No Punch"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/20">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedRecord ? "bg-violet-500" : "bg-rose-500"}`} />
                  <span className="text-[10px] font-black text-foreground uppercase tracking-tighter">{selectedRecord?.status || "No Record"}</span>
                </div>
                <span className="text-[9px] font-black text-muted-foreground uppercase">Shift: 09-18</span>
              </div>

              {isLocked && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                  <Lock size={16} className="text-rose-500" />
                  <p className="text-[10px] font-bold text-rose-600 italic">One or more selected dates are locked. Payroll has been processed.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Correction Form */}
      <div className="lg:col-span-6 xl:col-span-5">
        <div className="attendance-regularization-panel p-8 h-fit">
          {selectedCount === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-12">
              <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <ArrowRight size={40} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-black text-foreground">Select one or more dates</h3>
              <p className="text-xs font-medium text-muted-foreground mt-2 max-w-[220px]">Click on calendar days to build a bulk regularization request.</p>
            </div>
          ) : readOnly ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-lg font-black text-foreground">Regularization Review</h3>
              </div>
              <div className="p-5 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                <Info size={18} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-foreground uppercase tracking-tight">Manager view only</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    You can review attendance and regularization context, but direct edits and employee-side submissions are disabled by policy.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Late By</p>
                  <p className="text-lg font-black text-foreground">{selectedRecord?.lateMins || 0}m</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Early By</p>
                  <p className="text-lg font-black text-foreground">{selectedRecord?.earlyExitMins || 0}m</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Work Mode</p>
                  <p className="text-lg font-black text-foreground">{selectedRecord?.workMode || "-"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Approval</p>
                  <p className="text-lg font-black text-foreground">{selectedRecord?.approvalPending ? "Pending" : "None"}</p>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
                <div>
                  <h3 className="text-lg font-black text-foreground">Submit Bulk Regularization</h3>
                  <p className="text-xs text-muted-foreground">{selectedCount} selected date(s) will be included in this request.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Request Type</label>
                  <select 
                    disabled={isLocked}
                    className="attendance-form-control w-full px-5 py-3 text-xs font-semibold appearance-none disabled:opacity-50 transition-all"
                  >
                    <option>Missing Punch</option>
                    <option>Late Arrival Justification</option>
                    <option>Early Exit</option>
                    <option>Work From Home</option>
                    <option>On Duty</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Requested Status</label>
                  <select 
                    disabled={isLocked}
                    className="attendance-form-control w-full px-5 py-3 text-xs font-semibold appearance-none disabled:opacity-50 transition-all"
                  >
                    <option>Present</option>
                    <option>Half Day</option>
                    <option>Absent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Corrected In Time</label>
                  <input 
                    type="time" 
                    disabled={isLocked}
                    className="attendance-form-control w-full px-5 py-3 text-xs font-semibold disabled:opacity-50 transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Corrected Out Time</label>
                  <input 
                    type="time" 
                    disabled={isLocked}
                    className="attendance-form-control w-full px-5 py-3 text-xs font-semibold disabled:opacity-50 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Reasons (per selected date)</label>
                <div className="space-y-3 mt-2">
                  {selectedDates.map((date) => (
                    <div key={date} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{format(parseISO(date), "EEE, dd MMM yyyy")}</p>
                        </div>
                        <span className="text-[9px] text-muted-foreground">{date}</span>
                      </div>
                      <textarea
                        rows={3}
                        disabled={isLocked}
                        value={perDateComments[date] || ""}
                        onChange={(e) => setPerDateComments((prev) => ({ ...prev, [date]: e.target.value }))}
                        placeholder="Enter reason for this date"
                        className="attendance-form-control w-full px-4 py-3 text-xs font-medium disabled:opacity-50 transition-all resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="button"
                disabled={isLocked}
                className="attendance-submit-button w-full py-4 text-white rounded-[2rem] font-semibold text-sm transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Submit Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
