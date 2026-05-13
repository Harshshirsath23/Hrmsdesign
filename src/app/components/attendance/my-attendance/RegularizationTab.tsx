import { useState, useMemo, useEffect } from "react";
import { format, isSameMonth, parse, startOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, endOfMonth, isAfter, parseISO } from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  History, 
  Send,
  ArrowRight,
  Info,
  Lock,
  LogIn,
  LogOut
} from "lucide-react";
import { DailyAttendance } from "../../../modules/attendance/types";
import { getStatusColor, isDateLocked } from "./utils";
import { motion, AnimatePresence } from "motion/react";

interface RegularizationTabProps {
  records: DailyAttendance[];
  initialDate?: string | null;
}

export function RegularizationTab({ records, initialDate }: RegularizationTabProps) {
  const [currentNavDate, setCurrentNavDate] = useState(new Date(2026, 4, 1)); // Default May 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Deep-link from other views
  useEffect(() => {
    if (initialDate) {
      const date = parse(initialDate, "yyyy-MM-dd", new Date());
      setSelectedDate(date);
      setCurrentNavDate(startOfMonth(date));
    }
  }, [initialDate]);

  const monthStart = startOfMonth(currentNavDate);
  const calendarDays = eachDayOfInterval({ 
    start: startOfWeek(monthStart), 
    end: endOfWeek(endOfMonth(monthStart)) 
  });

  const selectedRecord = useMemo(() => {
    if (!selectedDate) return null;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return records.find(r => r.date === dateStr);
  }, [selectedDate, records]);

  const isLocked = selectedDate ? isDateLocked(selectedDate) : false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Calendar Selection & Info */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-8 rounded-[3.5rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground tracking-tight">{format(currentNavDate, "MMMM yyyy")}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-white/50 dark:border-white/10 shadow-sm hover:scale-110 active:scale-95 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-white/50 dark:border-white/10 shadow-sm hover:scale-110 active:scale-95 transition-all"
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
              const isSel = selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isFuture = isAfter(day, new Date());
              const locked = isDateLocked(day);

              return (
                <button
                  key={i}
                  disabled={!isCurrentMonth || isFuture}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square relative flex flex-col items-center justify-center rounded-2xl text-xs font-bold transition-all ${
                    !isCurrentMonth || isFuture ? "opacity-10 cursor-not-allowed" : "hover:bg-emerald-500/10"
                  } ${isSel ? "bg-emerald-500 text-white shadow-xl scale-110 z-10" : "text-foreground bg-white/20 dark:bg-slate-800/20 border border-white/20 dark:border-white/5"}`}
                >
                  {format(day, "d")}
                  {locked && !isSel && isCurrentMonth && <Lock size={8} className="absolute top-1 right-1 text-rose-500/50" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Summary */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-white/10 space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><CalendarIcon size={18} /></div>
                <div>
                  <h4 className="text-xs font-black text-foreground uppercase tracking-tight">Punch Details</h4>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{format(selectedDate, "EEEE, dd MMM yyyy")}</p>
                </div>
              </div>

              {/* Punch Info Card */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 flex flex-col items-center text-center">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 mb-1.5"><LogIn size={16} /></div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Punch In</p>
                  <p className="text-base font-black text-foreground leading-tight">{selectedRecord?.firstIn || "No Punch"}</p>
                  <p className="text-[7px] font-bold text-muted-foreground mt-1 opacity-60">
                    {selectedRecord?.workMode === "Office" ? "Biometric" : "Web"}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 flex flex-col items-center text-center">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 mb-1.5"><LogOut size={16} /></div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Punch Out</p>
                  <p className="text-base font-black text-foreground leading-tight">{selectedRecord?.lastOut || "No Punch"}</p>
                  <p className="text-[7px] font-bold text-muted-foreground mt-1 opacity-60">
                    {selectedRecord?.workMode === "Office" ? "Biometric" : "Web"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/20">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedRecord ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <span className="text-[10px] font-black text-foreground uppercase tracking-tighter">{selectedRecord?.status || "No Record"}</span>
                </div>
                <span className="text-[9px] font-black text-muted-foreground uppercase">Shift: 09-18</span>
              </div>

              {isLocked && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                  <Lock size={16} className="text-rose-500" />
                  <p className="text-[10px] font-bold text-rose-600 italic">This date is locked. Payroll has been processed.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Correction Form */}
      <div className="lg:col-span-6 xl:col-span-5">
        <div className="p-8 rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-2xl h-fit">
          {!selectedDate ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-12">
              <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <ArrowRight size={40} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-black text-foreground">Select a date</h3>
              <p className="text-xs font-medium text-muted-foreground mt-2 max-w-[200px]">Pick an eligible day from the calendar to start.</p>
            </div>
          ) : (
            <form className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <h3 className="text-lg font-black text-foreground">Submit Correction</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Request Type</label>
                  <select 
                    disabled={isLocked}
                    className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-white/50 dark:border-white/10 rounded-2xl text-xs font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 appearance-none disabled:opacity-50 transition-all shadow-sm"
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
                    className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-white/50 dark:border-white/10 rounded-2xl text-xs font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 appearance-none disabled:opacity-50 transition-all shadow-sm"
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
                    className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-white/50 dark:border-white/10 rounded-2xl text-xs font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Corrected Out Time</label>
                  <input 
                    type="time" 
                    disabled={isLocked}
                    className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-white/50 dark:border-white/10 rounded-2xl text-xs font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Reason</label>
                <textarea 
                  rows={3}
                  disabled={isLocked}
                  placeholder="Enter reason here..."
                  className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-white/50 dark:border-white/10 rounded-3xl text-xs font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 transition-all resize-none shadow-sm"
                />
              </div>

              <button 
                type="button"
                disabled={isLocked}
                className="w-full py-4 bg-emerald-500 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
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
