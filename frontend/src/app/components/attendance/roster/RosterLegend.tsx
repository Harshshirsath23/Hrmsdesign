import { ShiftDefinition } from "../../../modules/attendance/types";
import { cn } from "../../ui/utils";

interface RosterLegendProps {
  shiftDefinitions: ShiftDefinition[];
}

export function RosterLegend({ shiftDefinitions }: RosterLegendProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
          <h4 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Shift Legend & Codes</h4>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {shiftDefinitions.map((shift) => (
            <div key={shift.code} className="flex items-center gap-3 group cursor-default">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black shadow-sm transition-all group-hover:scale-110",
                shift.code === "GEN" && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
                shift.code === "OFF" && "bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-500 border border-slate-200/50 dark:border-slate-700/50",
                shift.code === "NS" && "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
                shift.code === "WFH" && "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
                shift.code === "HL" && "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
                shift.code === "FS" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                shift.code === "SS" && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                shift.code === "OD" && "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400"
              )}>
                {shift.code}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">{shift.name}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                  {shift.startTime === "00:00" ? "Full Day" : `${shift.startTime} - ${shift.endTime}`}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Weekend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conflict</span>
          </div>
        </div>
      </div>
    </div>
  );
}
