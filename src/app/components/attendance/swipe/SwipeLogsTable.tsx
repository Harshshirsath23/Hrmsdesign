import { useMemo } from "react";
import { 
  MoreVertical, 
  ArrowRightLeft, 
  MapPin, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  UserCheck,
  Smartphone,
  Globe,
  Monitor
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { cn } from "../../ui/utils";
import { SwipeLog } from "../../../modules/attendance/types";

interface SwipeLogsTableProps {
  logs: SwipeLog[];
  onSelectSwipe: (swipe: SwipeLog) => void;
}

export function SwipeLogsTable({ logs, onSelectSwipe }: SwipeLogsTableProps) {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "Biometric Device": return <Cpu className="w-3 h-3" />;
      case "Mobile App": return <Smartphone className="w-3 h-3" />;
      case "Web Login": return <Monitor className="w-3 h-3" />;
      default: return <Globe className="w-3 h-3" />;
    }
  };

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Swipe Intelligence</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Device & Source</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification</th>
            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {logs.map((log) => (
            <tr 
              key={log.id} 
              className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
              onClick={() => onSelectSwipe(log)}
            >
              {/* Employee Info */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                    <AvatarImage src={log.avatar} />
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                      {log.employeeName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {log.employeeName}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">{log.employeeCode}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">{log.department}</span>
                    </div>
                  </div>
                </div>
              </td>

              {/* Swipe Intel */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    log.type === "IN" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-purple-50 text-purple-600 dark:bg-purple-500/10"
                  )}>
                    <ArrowRightLeft className={cn("w-4 h-4", log.type === "OUT" && "rotate-180")} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{log.swipeTime}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.type} • {log.swipeDate}</span>
                  </div>
                </div>
              </td>

              {/* Device Info */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {getDeviceIcon(log.deviceType)}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{log.deviceName}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 ml-8">{log.deviceType}</span>
                </div>
              </td>

              {/* Verification */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={cn(
                      "w-3.5 h-3.5",
                      log.spoofDetection === "Safe" ? "text-emerald-500" : "text-amber-500"
                    )} />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{log.verificationMethod}</span>
                  </div>
                  {log.faceMatchScore && (
                    <span className="text-[10px] font-bold text-emerald-500 ml-5">{log.faceMatchScore}% Match</span>
                  )}
                </div>
              </td>

              {/* Location */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{log.branch}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 truncate max-w-[150px]">{log.doorName}</span>
                </div>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
