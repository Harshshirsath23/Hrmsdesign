import { 
  X, Clock, Calendar as CalendarIcon, LogIn, LogOut, 
  MapPin, AlertCircle, CheckCircle2, History, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DailyAttendance } from "../../../modules/attendance/types";
import { format, parseISO } from "date-fns";
import { getStatusColor } from "./utils";

interface SwipeDetailsDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  record: DailyAttendance | null;
}

export function SwipeDetailsDrawer({ isOpen, onOpenChange, record }: SwipeDetailsDrawerProps) {
  if (!record) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-l border-white/20 z-[101] shadow-2xl overflow-y-auto"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-foreground tracking-tight">Swipe Details</h2>
                <button 
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-black/5 dark:bg-white/5 border border-white/10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><CalendarIcon size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</p>
                    <h3 className="text-lg font-black text-foreground">{format(parseISO(record.date), "dd MMMM, yyyy")}</h3>
                  </div>
                </div>

                <div className={`p-6 rounded-[2rem] border flex items-center justify-between ${getStatusColor(record.status)} bg-opacity-5 border-opacity-20`}>
                  <h4 className={`text-xl font-black ${getStatusColor(record.status)}`}>{record.status}</h4>
                  <div className={`w-3 h-3 rounded-full ${record.status === 'Present' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2">Punch Timeline</h4>
                <div className="space-y-3">
                  {[
                    { label: "Punch In", time: record.firstIn || "09:05 AM", icon: LogIn, color: "emerald", loc: "Main Entrance (Biometric)" },
                    { label: "Lunch Break", time: "01:00 PM", icon: Clock, color: "amber", loc: "Canteen Area" },
                    { label: "Return", time: "01:45 PM", icon: Clock, color: "amber", loc: "Workstation 4B" },
                    { label: "Punch Out", time: record.lastOut || "06:15 PM", icon: LogOut, color: "rose", loc: "Web Login" },
                  ].map((p, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-white/20 group hover:scale-[1.02] transition-all">
                      <div className={`p-3 rounded-2xl bg-${p.color}-500/10 text-${p.color}-500`}><p.icon size={18} /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-foreground">{p.time}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{p.label}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 opacity-60">
                          <MapPin size={10} />
                          <span className="text-[10px] font-medium">{p.loc}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-white/10">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Work Hours</p>
                  <p className="text-xl font-black text-foreground">{record.workHours.toFixed(1)}h</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-white/10">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Overtime</p>
                  <p className="text-xl font-black text-emerald-500">{record.overtime}m</p>
                </div>
              </div>

              <div className="p-6 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-xl text-emerald-500"><History size={20} /></div>
                <div>
                  <h5 className="text-xs font-black text-foreground mb-1">Historical Average</h5>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">Usually leaves by 06:12 PM</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
