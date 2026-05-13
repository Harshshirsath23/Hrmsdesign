import { useMemo, useRef, useState } from "react";
import { format, isWeekend, isToday } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { cn } from "../../ui/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { ShiftDefinition, RosterRecord } from "../../../modules/attendance/types";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Lock, Edit2, Check, Globe } from "lucide-react";
import { Button } from "../../ui/button";

interface RosterGridProps {
  roster: RosterRecord[];
  days: Date[];
  shiftDefinitions: ShiftDefinition[];
  isPublished: boolean;
  onUpdateShift: (employeeId: string, date: string, shiftCode: string) => void;
}

export function RosterGrid({ roster, days, shiftDefinitions, isPublished, onUpdateShift }: RosterGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Table Container */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto overflow-y-auto no-scrollbar relative max-h-[800px] border-t border-slate-200 dark:border-slate-800"
      >
        <table className="border-separate border-spacing-0 w-full">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm">
              {/* Sticky Fixed Left Columns Headers */}
              <th className="sticky left-0 z-30 bg-slate-50 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 p-3 min-w-[280px] text-left">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Employee Details</span>
              </th>
              <th className="sticky left-[280px] z-30 bg-slate-50 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 p-3 min-w-[100px] text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Working / Off</span>
              </th>

              {/* Date Columns Headers */}
              {days.map((day) => {
                const weekend = isWeekend(day);
                const today = isToday(day);
                return (
                  <th 
                    key={day.toISOString()} 
                    className={cn(
                      "border-b border-r border-slate-200 dark:border-slate-700 p-2 min-w-[65px] text-center transition-colors",
                      weekend && "bg-slate-100/50 dark:bg-slate-800/30",
                      today && "bg-emerald-50 dark:bg-emerald-500/10"
                    )}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-tighter",
                        weekend ? "text-slate-400" : "text-slate-500"
                      )}>
                        {format(day, "EEE")}
                      </span>
                      <span className={cn(
                        "text-sm font-bold",
                        today ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"
                      )}>
                        {format(day, "dd")}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {roster.map((record) => (
              <tr key={record.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                {/* Sticky Employee Column */}
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-800 p-3 transition-colors group-hover:bg-slate-50/80 dark:group-hover:bg-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                      <AvatarImage src={record.avatar} />
                      <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                        {record.employeeName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                        {record.employeeName}
                        {isPublished && <Globe className="w-3 h-3 text-emerald-500" />}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">{record.employeeCode}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">{record.department}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Sticky Stats Column */}
                <td className="sticky left-[280px] z-10 bg-white dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-800 p-3 transition-colors group-hover:bg-slate-50/80 dark:group-hover:bg-white/[0.04]">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{record.workingDays}D</span>
                      <span className="text-slate-300 dark:text-slate-700">/</span>
                      <span className="text-xs font-bold text-slate-500">{record.weekOffs}O</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${(record.workingDays / (record.workingDays + record.weekOffs)) * 100}%` }} />
                      <div className="h-full bg-slate-300 dark:bg-slate-600" style={{ width: `${(record.weekOffs / (record.workingDays + record.weekOffs)) * 100}%` }} />
                    </div>
                  </div>
                </td>

                {/* Day Cells */}
                {days.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const shiftCode = record.shifts[dateStr];
                  const shift = shiftDefinitions.find(s => s.code === shiftCode);
                  const weekend = isWeekend(day);
                  const today = isToday(day);

                  return (
                    <td 
                      key={day.toISOString()} 
                      className={cn(
                        "border-b border-r border-slate-200 dark:border-slate-800 p-1 min-w-[65px] relative transition-all group/cell",
                        weekend && "bg-slate-100/30 dark:bg-slate-800/20",
                        today && "bg-emerald-50/30 dark:bg-emerald-500/5",
                        !isPublished && "hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer"
                      )}
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="flex items-center justify-center h-full min-h-[48px] relative">
                            <div className={cn(
                              "text-[10px] font-black px-2 py-1.5 rounded-md transition-all shadow-sm flex items-center gap-1",
                              shiftCode === "GEN" && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
                              shiftCode === "OFF" && "bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-500 border border-slate-200/50 dark:border-slate-700/50",
                              shiftCode === "NS" && "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
                              shiftCode === "WFH" && "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
                              shiftCode === "HL" && "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
                              shiftCode === "FS" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                              shiftCode === "SS" && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                              shiftCode === "OD" && "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400",
                              !isPublished && "group-hover/cell:scale-110 group-hover/cell:shadow-md"
                            )}>
                              {shiftCode}
                              {isPublished && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
                            </div>
                            
                            {!isPublished && (
                              <div className="absolute top-1 right-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                <Edit2 className="w-2.5 h-2.5 text-slate-400" />
                              </div>
                            )}
                          </div>
                        </PopoverTrigger>
                        
                        <PopoverContent className="w-64 p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl z-[9999]" align="start" sideOffset={5}>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {isPublished ? "Shift Details" : "Edit Shift Assignment"}
                              </span>
                              {isPublished && <Lock className="w-3 h-3 text-slate-400" />}
                            </div>
                            
                            <div className="space-y-1.5">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{format(day, "EEEE, dd MMM yyyy")}</p>
                              <p className="text-[10px] font-medium text-slate-500">Currently assigned to <span className="font-bold text-slate-700 dark:text-slate-300">{shift?.name} ({shiftCode})</span></p>
                            </div>

                            {isPublished ? (
                              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">PUBLISHED SCHEDULE</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-4 gap-1.5">
                                {shiftDefinitions.map(s => (
                                  <Button
                                    key={s.code}
                                    variant="outline"
                                    className={cn(
                                      "h-8 text-[10px] font-black p-0 rounded-md border-slate-200 dark:border-slate-800",
                                      shiftCode === s.code ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                    onClick={() => onUpdateShift(record.employeeId, dateStr, s.code)}
                                  >
                                    {s.code}
                                  </Button>
                                ))}
                              </div>
                            )}

                            {!isPublished && (
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <Button variant="ghost" className="w-full h-8 text-[10px] font-bold text-slate-500 hover:text-red-500">
                                  MARK AS LEAVE
                                </Button>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
