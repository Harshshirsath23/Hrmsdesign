/** Backend response shapes for attendance admin APIs. */

export interface DashboardSummaryResponse {
  avg_work_hours?: number;
  total_present?: number;
  total_absent?: number;
  total_holidays?: number;
  total_late_logins?: number;
  total_half_days?: number;
  period_start_date?: string;
  period_end_date?: string;
  generated_at?: string;
}

export interface DashboardTrendPoint {
  date: string;
  day_name?: string;
  work_hours: number;
  is_holiday?: boolean;
  is_weekend?: boolean;
  status?: string;
}

export interface DashboardTrendResponse {
  month: number;
  year: number;
  trend_data: DashboardTrendPoint[];
  total_work_hours?: number;
  average_daily_hours?: number;
  generated_at?: string;
}

export interface DashboardWhosInEmployee {
  employee_id: string;
  employee_code?: string;
  employee_name: string;
  designation?: string;
  department?: string;
  check_in_time?: string;
  status?: string;
  work_hours?: number;
  is_late?: boolean;
}

export interface DashboardWhosInResponse {
  on_time_count: number;
  late_in_count: number;
  not_yet_in_count: number;
  total_employee_count: number;
  employee_list?: DashboardWhosInEmployee[];
  generated_at?: string;
}

export interface DashboardLiveResponse {
  present_count: number;
  late_count: number;
  not_yet_in_count: number;
  total_count: number;
  generated_at?: string;
}

export interface FilterOption {
  id: string | null;
  code?: string;
  name: string;
}

export interface DashboardFiltersResponse {
  departments: FilterOption[];
  designations: FilterOption[];
  teams: FilterOption[];
  generated_at?: string;
}

export interface MatrixDayCell {
  date: string;
  cell_code: string | null;
  status_code?: string | null;
  work_mode?: string | null;
  leave_type?: string | null;
  is_late?: boolean;
  actual_work_mins?: number;
  is_locked?: boolean;
}

export interface MatrixEmployeeRow {
  employee_id: string;
  employee_code: string;
  full_name: string;
  department: string | null;
  designation: string | null;
  avatar_initials: string;
  days: MatrixDayCell[];
  summary: { present: number; absent: number; leave: number };
}

export interface MatrixGridResponse {
  meta: {
    total_records: number;
    page: number;
    page_size: number;
    cycle_start: string;
    cycle_end: string;
    display_label: string;
    dates: { date: string; day_label: string; is_weekend: boolean; is_holiday: boolean }[];
  };
  rows: MatrixEmployeeRow[];
}

export interface MatrixSummaryResponse {
  total_present: number;
  present_change_today: number;
  total_absent: number;
  absent_change_today: number;
  on_leave: number;
  leave_pending_count: number;
  holidays_remaining: number;
  next_holiday_date: string | null;
  next_holiday_name: string | null;
  avg_hours: number;
  avg_hours_goal: number;
  punctuality_percent: number;
  punctuality_change: number;
}

export interface MatrixLiveResponse {
  present_count: number;
  absent_count: number;
  present_delta?: number;
  absent_delta?: number;
}

export interface MatrixDepartment {
  id: string;
  code: string;
  name: string;
  employee_count: number;
}

export interface WhoIsInSummaryData {
  not_yet_in: number;
  late_arrivals: number;
  on_time: number;
  out_of_office: number;
  total_employees: number;
}

export interface WhoIsInSummaryResponse {
  date: string;
  company_id: string;
  summary: WhoIsInSummaryData;
  last_refreshed: string;
}

export type WhoIsInStatus = 'NOT_IN' | 'LATE' | 'ON_TIME' | 'OUT_OF_OFFICE';

export interface WhoIsInEmployeeCard {
  employee_id: string;
  employee_code: string | null;
  name: string;
  designation: string | null;
  department: string | null;
  team: string | null;
  avatar_initials: string;
  avatar_color: string;
  profile_photo_url: string | null;
  login_time: string | null;
  shift: string | null;
  work_status_code: string | null;
  work_status_label: string | null;
  work_mode: string | null;
  is_late: boolean;
  presence_state: string;
}

export interface WhoIsInEmployeesResponse {
  status: string;
  date: string;
  total: number;
  page: number;
  limit: number;
  employees: WhoIsInEmployeeCard[];
}

export interface SwipeLogApiRecord {
  id: number;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department_name: string | null;
  punch_time: string;
  punch_type: string;
  punch_source: string;
  device_id?: string | null;
  shift_name?: string | null;
  received_at?: string;
  created_at?: string;
}

export interface PaginatedSwipeLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SwipeLogApiRecord[];
}

export interface AttendanceRequestApiRecord {
  id: string;
  employee: {
    id: string;
    name: string;
    department: string;
    designation: string;
  };
  request_type: string;
  request_type_display: string;
  date: string;
  attendance: {
    date: string | null;
    shift_time: string;
    punch_in: string;
    punch_out: string;
    working_hours: string;
  };
  manager_status: string;
  final_status: string;
  created_at: string;
  reason: string;
  approval_workflow?: {
    id: string;
    approver: { id: string; name: string };
    stage: string;
    status: string;
    comment: string;
    actioned_at: string;
  }[];
}

export interface AttendanceRequestsListResponse {
  count?: number;
  results?: AttendanceRequestApiRecord[];
  stats?: Record<string, number>;
}

export interface ShiftMasterApiRecord {
  id: string;
  code: string;
  name: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  color?: string;
}

export interface RosterCalendarEmployeeApi {
  /** API returns `id` / `name` / `code`; older clients used employee_* aliases. */
  id?: string;
  name?: string;
  code?: string;
  employee_id?: string;
  employee_code?: string;
  employee_name?: string;
  department?: string | null;
  shifts: Record<
    string,
    string | { shift_id?: string; shift_code: string; shift_name?: string }
  >;
}

export interface RosterCalendarMonthlyResponse {
  month: number;
  year: number;
  employees: RosterCalendarEmployeeApi[];
  holidays?: string[];
  is_published?: boolean;
  is_locked?: boolean;
}

export interface AsyncJobResponse {
  job_id: string;
  status: string;
  message?: string;
  validation_errors?: Record<string, string>[];
}
