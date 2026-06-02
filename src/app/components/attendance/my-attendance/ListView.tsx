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
      <div className="attendance-list-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timing</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Work Mode</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hours</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record, idx) => (
                <motion.tr 
                  key={record.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="attendance-list-row group transition-all cursor-pointer"
                  onClick={() => onSwipeDetails(record)}
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{format(parseISO(record.date), "dd MMM, yyyy")}</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">{format(parseISO(record.date), "EEEE")}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">In</span>
                        <span className="text-sm font-semibold text-violet-600 dark:text-violet-300">{record.firstIn || "--:--"}</span>
                      </div>
                      <div className="w-[1px] h-6 bg-foreground/10" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Out</span>
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">{record.lastOut || "--:--"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {record.workMode === "WFO" ? <Fingerprint size={14} className="text-blue-500" /> : <Monitor size={14} className="text-purple-500" />}
                      <span className="text-xs font-semibold text-foreground">{record.workMode || "Office"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{record.workHours.toFixed(1)}h</span>
                      {record.otMins > 0 && <span className="text-[9px] font-semibold text-violet-500">+{record.otMins}m OT</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`attendance-status-pill px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest shadow-sm ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSwipeDetails(record); }}
                        className="attendance-row-action p-2.5 transition-all text-muted-foreground"
                      >
                        <Eye size={16} />
                      </button>
                      {!readOnly && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onRegularize(record.date); }}
                          className="attendance-row-action p-2.5 transition-all text-muted-foreground"
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
