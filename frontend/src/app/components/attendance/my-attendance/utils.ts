import { DailyAttendance } from "../../../modules/attendance/types";
import { isBefore, startOfMonth } from "date-fns";

export interface AttendanceMetrics {
  avgWorkHours: number;
  avgActualWorkHours: number;
  presentDays: number;
  absentDays: number;
  leaveTaken: number;
  lateInCount: number;
  totalWorkingDays: number;
  penaltyDays: number;
  earlyOutCount: number;
  firstInAvg: string;
  lastOutAvg: string;
  bestStreak: number;
  currentStreak: number;
}

/**
 * Checks if a date is locked (e.g. payroll processed).
 * For demo: any date before April 2026 is locked.
 */
export const isDateLocked = (date: Date): boolean => {
  const lockDate = new Date(2026, 3, 1); // April 1, 2026
  return isBefore(date, lockDate);
};

export const calculateMetrics = (records: DailyAttendance[]): AttendanceMetrics => {
  const presentRecords = records.filter(r => r.status === "Present" || r.status === "Half Day" || r.status === "Work From Home");
  const presentCount = records.filter(r => r.status === "Present" || r.status === "Work From Home").length;
  const halfDayCount = records.filter(r => r.status === "Half Day").length;
  
  const totalWorkHours = presentRecords.reduce((acc, r) => acc + (r.workHours || 0), 0);
  const avgWorkHours = presentRecords.length > 0 ? totalWorkHours / presentRecords.length : 0;
  
  const avgActualWorkHours = avgWorkHours * 0.95;

  const absentDays = records.filter(r => r.status === "Absent").length;
  const leaveTaken = records.filter(r => r.status === "Leave").length;
  const lateInCount = records.filter(r => r.isLate).length;
  const earlyOutCount = records.filter(r => (r.earlyExitMins || 0) > 0).length;
  
  const totalWorkingDays = records.filter(r => r.status !== "Week Off" && r.status !== "Holiday").length;
  
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));
  
  sortedRecords.forEach(r => {
    if (r.status === "Present" || r.status === "Work From Home") {
      tempStreak++;
    } else if (r.status !== "Week Off" && r.status !== "Holiday") {
      if (tempStreak > bestStreak) bestStreak = tempStreak;
      tempStreak = 0;
    }
  });
  if (tempStreak > bestStreak) bestStreak = tempStreak;
  
  for (let i = sortedRecords.length - 1; i >= 0; i--) {
    const r = sortedRecords[i];
    if (r.status === "Present" || r.status === "Work From Home") {
      currentStreak++;
    } else if (r.status !== "Week Off" && r.status !== "Holiday") {
      break;
    }
  }

  return {
    avgWorkHours,
    avgActualWorkHours,
    presentDays: presentCount + (halfDayCount * 0.5),
    absentDays,
    leaveTaken,
    lateInCount,
    totalWorkingDays,
    penaltyDays: Math.floor(lateInCount / 3),
    earlyOutCount,
    firstInAvg: "09:08 AM",
    lastOutAvg: "06:12 PM",
    bestStreak,
    currentStreak
  };
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "Present": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "Absent": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    case "Leave": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "Holiday": return "text-sky-500 bg-sky-500/10 border-sky-500/20";
    case "Week Off": return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    case "Half Day": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "Work From Home": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
    default: return "text-slate-500 bg-slate-500/10 border-slate-500/20";
  }
};

export const getStatusDots = (record: DailyAttendance) => {
  const dots: string[] = [];
  
  if (record.status === "Present") dots.push("bg-emerald-500");
  if (record.status === "Absent") dots.push("bg-rose-500");
  if (record.status === "Leave") dots.push("bg-amber-500");
  if (record.status === "Half Day") dots.push("bg-orange-500");
  if (record.status === "Holiday") dots.push("bg-sky-500");
  if (record.status === "Week Off") dots.push("bg-slate-400");
  if (record.status === "Work From Home") dots.push("bg-purple-500");
  
  if (record.isLate) dots.push("bg-rose-600"); // Orange-red
  if (record.earlyExitMins && record.earlyExitMins > 0) dots.push("bg-violet-500"); // Purple
  
  return Array.from(new Set(dots)); // Unique dots
};
