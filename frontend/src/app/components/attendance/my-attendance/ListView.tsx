import { format, parseISO } from "date-fns";
import { 
  Eye, 
  Send, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ArrowUpRight,
  Monitor,
  Fingerprint
} from "lucide-react";
import { DailyAttendance } from "../../../modules/attendance/types";
import { getStatusColor } from "./utils";
import { motion } from "motion/react";

interface ListViewProps {
  records: DailyAttendance[];
  onSwipeDetails: (record: DailyAttendance) => void;
  onRegularize: (date: string) => void;
  readOnly?: boolean;
}

export function ListView({ records, onSwipeDetails, onRegularize, readOnly = false }: ListViewProps) {
  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      <div className="rounded-[3rem] overflow-hidden border border-white/50 dark:border-white/10 shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timing</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Work Mode</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hours</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 dark:divide-white/5">
              {sortedRecords.map((record, idx) => (
                <motion.tr 
                  key={record.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-white/40 dark:hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => onSwipeDetails(record)}
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-foreground">{format(parseISO(record.date), "dd MMM, yyyy")}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(parseISO(record.date), "EEEE")}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">In</span>
                        <span className="text-sm font-black text-emerald-600">{record.firstIn || "--:--"}</span>
                      </div>
                      <div className="w-[1px] h-6 bg-foreground/10" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Out</span>
                        <span className="text-sm font-black text-rose-600">{record.lastOut || "--:--"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {record.workMode === "Office" ? <Fingerprint size={14} className="text-blue-500" /> : <Monitor size={14} className="text-purple-500" />}
                      <span className="text-xs font-black text-foreground">{record.workMode || "Office"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-foreground">{record.workHours.toFixed(1)}h</span>
                      {record.overtime > 0 && <span className="text-[9px] font-black text-emerald-500">+{record.overtime}m OT</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSwipeDetails(record); }}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-white/50 dark:border-white/10 shadow-sm hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-emerald-500"
                      >
                        <Eye size={16} />
                      </button>
                      {!readOnly && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRegularize(record.date); }}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-white/50 dark:border-white/10 shadow-sm hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-emerald-500"
                        >
                          <Send size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
