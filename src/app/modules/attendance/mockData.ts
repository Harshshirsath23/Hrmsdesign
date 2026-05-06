import { AttendanceException, AttendanceRequest, AttendanceSession, DailyAttendance, EmployeeLite, PunchLog } from "./types";

export const attendanceEmployees: EmployeeLite[] = [
  { id: "EMP-001", name: "Arjun Sharma", department: "Engineering", location: "Bangalore" },
  { id: "EMP-002", name: "Priya Nair", department: "HR", location: "Mumbai" },
  { id: "EMP-003", name: "Vikram Mehta", department: "Product", location: "Delhi" },
  { id: "EMP-004", name: "Sneha Krishnan", department: "Design", location: "Chennai" },
];

const statuses = ["Present", "Present", "Half Day", "Absent", "Leave", "Present", "Week Off", "Holiday"] as const;
const workModes = ["WFO", "WFH", "Field"] as const;

export const dailyAttendance: DailyAttendance[] = Array.from({ length: 31 }).flatMap((_, dayIndex) =>
  attendanceEmployees.map((employee, employeeIndex) => {
    const date = `2026-05-${String(dayIndex + 1).padStart(2, "0")}`;
    const status = statuses[(dayIndex + employeeIndex) % statuses.length];
    return {
      id: `${employee.id}-${date}`,
      employeeId: employee.id,
      date,
      status,
      workMode: workModes[(dayIndex + employeeIndex) % workModes.length],
      shiftName: "General",
      firstIn: status === "Present" || status === "Half Day" ? "09:1" + ((dayIndex + employeeIndex) % 5) : "—",
      lastOut: status === "Present" ? "18:0" + ((dayIndex + employeeIndex) % 5) : status === "Half Day" ? "13:2" + ((dayIndex + employeeIndex) % 5) : "—",
      workHours: status === "Present" ? 8.8 : status === "Half Day" ? 4.2 : 0,
      lateMins: status === "Present" || status === "Half Day" ? ((dayIndex + employeeIndex) % 3) * 7 : 0,
      earlyExitMins: status === "Half Day" ? 120 : status === "Present" ? ((dayIndex + employeeIndex) % 2) * 5 : 0,
      lop: status === "Absent" ? 1 : status === "Half Day" ? 0.5 : 0,
      otMins: status === "Present" ? ((dayIndex + employeeIndex) % 3) * 20 : 0,
      exception: status === "Half Day" || status === "Absent",
      approvalPending: (dayIndex + employeeIndex) % 11 === 0,
      geoViolation: (dayIndex + employeeIndex) % 13 === 0,
      locked: dayIndex < 9,
    };
  }),
);

export const punchLogsByDay: Record<string, PunchLog[]> = {
  "2026-05-06": [
    { time: "09:12", type: "IN", source: "Biometric" },
    { time: "13:10", type: "OUT", source: "Biometric" },
    { time: "13:44", type: "IN", source: "Mobile" },
    { time: "18:16", type: "OUT", source: "Biometric" },
  ],
};

export const attendanceExceptions: AttendanceException[] = [
  { id: "EX-1", employeeId: "EMP-001", date: "2026-05-03", type: "Missing Punch", status: "Pending", severity: "Critical", assignedTo: "Ops Desk" },
  { id: "EX-2", employeeId: "EMP-003", date: "2026-05-05", type: "Short Hours", status: "Resolved", severity: "Warning", assignedTo: "HR BP" },
  { id: "EX-3", employeeId: "EMP-004", date: "2026-05-07", type: "Late Cycle Trigger", status: "Pending", severity: "Info", assignedTo: "Attendance Admin" },
  { id: "EX-4", employeeId: "EMP-002", date: "2026-05-11", type: "Missing Punch", status: "Pending", severity: "Warning", assignedTo: "Ops Desk" },
];

export const attendanceRequests: AttendanceRequest[] = [
  { id: "REQ-11", employeeId: "EMP-001", type: "Regularization", date: "2026-05-02", reason: "Missed out punch", status: "Pending", oldValue: "09:31 In", newValue: "09:08 In", comments: "System lag", workflowStep: "Manager Review" },
  { id: "REQ-12", employeeId: "EMP-002", type: "Leave", date: "2026-05-10", reason: "Medical leave", status: "Approved", oldValue: "Absent", newValue: "Leave", comments: "Doctor note attached", workflowStep: "Closed" },
  { id: "REQ-13", employeeId: "EMP-003", type: "Overtime", date: "2026-05-06", reason: "Release support", status: "Pending", oldValue: "0 mins OT", newValue: "120 mins OT", workflowStep: "HR Approval" },
  { id: "REQ-14", employeeId: "EMP-004", type: "Comp-Off", date: "2026-05-04", reason: "Weekend deployment", status: "Rejected", comments: "Insufficient evidence", workflowStep: "Closed" },
];

export const attendanceSessions: AttendanceSession[] = [
  { id: "S-1", employeeId: "EMP-001", date: "2026-05-06", start: "09:12", end: "13:10", minutes: 238 },
  { id: "S-2", employeeId: "EMP-001", date: "2026-05-06", start: "13:44", end: "18:16", minutes: 272 },
  { id: "S-3", employeeId: "EMP-003", date: "2026-05-06", start: "09:00", end: "12:30", minutes: 210 },
];
