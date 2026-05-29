import { 
  X, LogIn, LogOut, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DailyAttendance } from "../../../modules/attendance/types";
import { format, parseISO, isAfter } from "date-fns";

interface SwipeDetailsDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: DailyAttendance | null;
}

export function SwipeDetailsDrawer({ isOpen, onOpenChange, record }: SwipeDetailsDrawerProps) {
  if (!record) return null;

  const isFutureDate = record.id?.startsWith("future-") || isAfter(parseISO(record.date), new Date());

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Present":
        return "#10B981";
      case "Absent":
        return "#EF4444";
      case "Half Day":
        return "#F97316";
      case "Holiday":
        return "#3B82F6";
      case "Week Off":
        return "#9CA3AF";
      default:
        return "#9CA3AF";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />

          {/* Centered Modal / Mobile Bottom Sheet Wrapper */}
          <div className="fixed inset-0 flex items-end sm:items-center justify-center z-[101] p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full sm:w-[420px] bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.06] shadow-xl rounded-t-[24px] sm:rounded-[24px] pointer-events-auto overflow-hidden text-[#0F172A] dark:text-[#F8FAFC]"
            >
              {isFutureDate ? (
                /* FUTURE DATE MINIMAL POPUP */
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Upcoming Shift
                      </span>
                      <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                        {format(parseISO(record.date), "dd MMMM, yyyy")}
                      </h3>
                    </div>
                    <button 
                      onClick={() => onOpenChange(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Info Block */}
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Assigned Shift</span>
                      <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {record.shiftName || "General Shift"}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200/40 dark:bg-white/5" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Shift Timing</span>
                      <span className="text-xs font-bold text-[#6366F1]">
                        {record.firstIn && record.lastOut ? `${record.firstIn} - ${record.lastOut}` : "09:00 - 18:00"}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200/40 dark:bg-white/5" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Work Mode</span>
                      <span className="text-xs font-bold text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-0.5 rounded-full uppercase">
                        {record.workMode || "WFO"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* REGULAR DATE MODERN POPUP */
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {format(parseISO(record.date), "dd MMMM, yyyy")}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                        Daily Attendance Punch Details
                      </p>
                    </div>
                    <button 
                      onClick={() => onOpenChange(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div 
                    className="p-3.5 rounded-2xl border flex items-center justify-between transition-all duration-300"
                    style={{
                      backgroundColor: `${getStatusColor(record.status)}10`,
                      borderColor: `${getStatusColor(record.status)}30`
                    }}
                  >
                    <span 
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ color: getStatusColor(record.status) }}
                    >
                      {record.status}
                    </span>
                    <span 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ 
                        backgroundColor: getStatusColor(record.status),
                        boxShadow: record.status === "Present" ? `0 0 10px ${getStatusColor(record.status)}` : "none"
                      }}
                    />
                  </div>

                  {/* Main Entrance IN + Main Gate OUT Punches Only */}
                  <div className="space-y-3">
                    {/* Punch In */}
                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
                      <div className="p-2.5 rounded-xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center self-start">
                        <LogIn size={16} />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {record.firstIn || "--:--"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            Punch In
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                          <MapPin size={10} />
                          <span className="text-[10px] font-medium">Main Entrance</span>
                        </div>
                      </div>
                    </div>

                    {/* Punch Out */}
                    <div className="flex gap-4 p-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
                      <div className="p-2.5 rounded-xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center self-start">
                        <LogOut size={16} />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {record.lastOut || "--:--"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            Punch Out
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                          <MapPin size={10} />
                          <span className="text-[10px] font-medium">Main Gate Exit</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Info Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Work Hours</span>
                      <p className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                        {record.workHours > 0 ? `${record.workHours.toFixed(1)}h` : "--"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-500/5 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Shift Timing</span>
                      <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-2">
                        {record.shiftName ? record.shiftName.split(" (")[0] : "09:00 - 18:00"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
