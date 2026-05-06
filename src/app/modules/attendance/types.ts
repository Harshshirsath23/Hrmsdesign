export type AttendanceStatus = "Present" | "Absent" | "Half Day" | "Leave" | "Holiday" | "Week Off";
export type WorkMode = "WFO" | "WFH" | "Field";
export type RequestStatus = "Pending" | "Approved" | "Rejected";
export type RequestType = "Regularization" | "Leave" | "Overtime" | "Comp-Off";

export interface EmployeeLite {
  id: string;
  name: string;
  department: string;
  location: string;
}

export interface DailyAttendance {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  workMode: WorkMode;
  shiftName: string;
  firstIn: string;
  lastOut: string;
  workHours: number;
  lateMins: number;
  earlyExitMins: number;
  lop: number;
  otMins: number;
  exception: boolean;
  approvalPending: boolean;
  geoViolation: boolean;
  locked: boolean;
}

export interface PunchLog {
  time: string;
  type: "IN" | "OUT";
  source: string;
}

export interface AttendanceException {
  id: string;
  employeeId: string;
  date: string;
  type: "Missing Punch" | "Late Cycle Trigger" | "Short Hours";
  status: "Resolved" | "Pending";
  severity: "Info" | "Warning" | "Critical";
  assignedTo?: string;
}

export interface AttendanceRequest {
  id: string;
  employeeId: string;
  type: RequestType;
  date: string;
  reason: string;
  status: RequestStatus;
  oldValue?: string;
  newValue?: string;
  comments?: string;
  workflowStep?: string;
}

export interface AttendanceSession {
  id: string;
  employeeId: string;
  date: string;
  start: string;
  end: string;
  minutes: number;
}
