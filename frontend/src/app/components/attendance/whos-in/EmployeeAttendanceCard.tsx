import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Phone, MapPin, Monitor, User, Calendar, Clock, History, TrendingUp, CheckCircle, Edit, Send, ExternalLink } from "lucide-react";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { DailyAttendance } from "../../../modules/attendance/types";
import { useEmployee } from "../../../context/EmployeeContext";

interface EmployeeAttendanceCardProps {
  record: DailyAttendance;
  type: "not-yet-in" | "late" | "on-time" | "ooo" | "absent";
}

export function EmployeeAttendanceCard({ record, type }: EmployeeAttendanceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectEmployee } = useEmployee();

  return (
    <div className={cn(
      "group border border-border rounded-2xl bg-card transition-all duration-300",
      isExpanded ? "shadow-lg ring-1 ring-primary/20 scale-[1.02] z-10" : "hover:border-primary/30 hover:shadow-md"
    )}>
      <div className="p-4 flex flex-col h-full">
        {/* Header: Avatar + Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary/50 flex items-center justify-center text-primary font-bold text-sm border border-border">
              {record.employeeName.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{record.employeeName}</span>
              <span className="text-[10px] text-muted-foreground font-medium">{record.employeeId}</span>
            </div>
          </div>
          <AttendanceStatusBadge status={record.status} className="shadow-sm" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-secondary/20 rounded-lg p-2 border border-secondary/10">
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">
              {type === "not-yet-in" ? "Expected" : (type === "absent" ? "Last Present" : "Login Time")}
            </p>
            <p className={cn(
              "text-xs font-bold",
              type === "not-yet-in" || type === "absent" ? "text-red-500" : (type === "late" ? "text-amber-500" : "text-green-500")
            )}>
              {type === "not-yet-in" ? (record.expectedInTime || "09:00 AM") : (type === "absent" ? (record.lastAttendanceDate || "N/A") : record.firstIn)}
            </p>
          </div>
          
          <div className="bg-secondary/20 rounded-lg p-2 border border-secondary/10">
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Work Mode</p>
            <div className="flex items-center gap-1">
              <Monitor className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-bold truncate">{record.workMode}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">Department</span>
            <span className="font-bold truncate max-w-[100px]">{record.department}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">Shift</span>
            <span className="font-bold">{record.shiftName?.split('(')[1]?.split('-')[0] || "09:00"}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 text-[11px] font-bold gap-1.5 hover:bg-primary/5 hover:text-primary transition-all"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {isExpanded ? "Collapse" : "Details"}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-lg shrink-0"
            onClick={() => selectEmployee(record.id)}
            title="View Full Profile"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
           <div className="bg-secondary/10 rounded-xl p-3 space-y-3">
              <div className="space-y-2 pb-2 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Manager</span>
                  <span className="text-[11px] font-bold">{record.manager || "Rajesh Kumar"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Contact</span>
                  <span className="text-[11px] font-bold text-primary underline underline-offset-2 decoration-primary/30 cursor-pointer">{record.contactNo || "+91 98765 43210"}</span>
                </div>
              </div>

              {type === "absent" ? (
                <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-[9px] text-red-600 font-bold uppercase">Risk Level</p>
                  <p className="text-[11px] font-bold text-red-700">Critical: {record.lop || 2} Days Streak</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-card/50 rounded-lg border border-border">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase mb-0.5">Avg Login</p>
                    <p className="text-[11px] font-bold">{record.avgLoginTime || "09:05 AM"}</p>
                  </div>
                  <div className="p-2 bg-card/50 rounded-lg border border-border">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase mb-0.5">Balance</p>
                    <p className="text-[11px] font-bold">{record.leaveBalance || 15}d</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold gap-1 px-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> Present
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold gap-1 px-1">
                  <Edit className="w-3 h-3 text-blue-500" /> Regularize
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold gap-1 px-1">
                  <Send className="w-3 h-3 text-primary" /> Notify
                </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
