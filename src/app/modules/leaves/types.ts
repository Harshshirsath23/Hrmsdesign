export interface LeaveTypeRef {
  id: string;
  name: string;
  code: string;
  color_code: string;
  is_paid: boolean;
}

export interface LeaveBalanceAPI {
  id: string;
  employee_code: string;
  leave_type: string;
  leave_type_detail: LeaveTypeRef;
  period_start: string;
  period_end: string;
  opening_balance: number;
  accrued: number;
  used: number;
  pending_approval: number;
  carry_forwarded: number;
  encashed: number;
  available: number;
  total_allocated: number;
}

export type LeaveApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "REVOKED";

export interface LeaveApplicationAPI {
  id: string;
  employee_code: string;
  employee_name: string;
  leave_type: string;
  leave_type_detail: LeaveTypeRef;
  from_date: string;
  to_date: string;
  from_half: "AM" | "PM" | "FULL";
  to_half: "AM" | "PM" | "FULL";
  total_days: number;
  reason: string;
  status: LeaveApplicationStatus;
  applied_on: string;
  approved_at: string | null;
}

export interface HolidayAPI {
  id: string;
  name: string;
  date: string; // yyyy-mm-dd
  holiday_type: string;
  is_optional: boolean;
}

export interface ApplyLeavePayload {
  leave_type: string;
  from_date: string;
  to_date: string;
  from_half: "AM" | "PM" | "FULL";
  to_half: "AM" | "PM" | "FULL";
  total_days: number;
  reason: string;
  contact_during_leave?: string;
  document_url?: string;
  status?: "DRAFT" | "SUBMITTED";
}

