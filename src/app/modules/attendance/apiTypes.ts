export interface DashboardSummaryApi {
  avg_work_hours?: number | string;
  total_present?: number | string;
  total_absent?: number | string;
  total_holidays?: number | string;
  total_late_logins?: number | string;
  total_half_days?: number | string;
}

export interface DashboardTrendPointApi {
  date: string;
  day_name?: string;
  work_hours?: number | string;
  is_holiday?: boolean;
  is_weekend?: boolean;
  status?: string;
}

export interface DashboardTrendApi {
  month?: number;
  year?: number;
  trend_data?: DashboardTrendPointApi[];
}

export interface WhoIsInSummaryApi {
  summary?: {
    not_yet_in?: number;
    late_arrivals?: number;
    on_time?: number;
    out_of_office?: number;
    total_employees?: number;
  };
}

export type WhoIsInStatus = 'NOT_IN' | 'LATE' | 'ON_TIME' | 'OUT_OF_OFFICE';

export interface WhoIsInEmployeeApi {
  employee_id: string;
  employee_code?: string | null;
  name: string;
  designation?: string | null;
  department?: string | null;
  team?: string | null;
  login_time?: string | null;
  shift?: string | null;
  work_mode?: string | null;
  work_status_label?: string | null;
  is_late?: boolean;
  presence_state?: string;
}

export interface WhoIsInEmployeesApi {
  employees: WhoIsInEmployeeApi[];
  total?: number;
}

export interface SwipeLogApi {
  id: string;
  employee_id?: string;
  employee_code?: string;
  employee_name?: string;
  department_name?: string;
  punch_time: string;
  punch_type: string;
  punch_source?: string;
  device_id?: string | null;
  shift_name?: string | null;
  is_within_geofence?: boolean;
}

export interface SwipeLogListApi {
  results?: SwipeLogApi[];
  data?: SwipeLogApi[];
  count?: number;
}

export interface MatrixDayCellApi {
  date: string;
  cell_code?: string | null;
  status_code?: string | null;
  work_mode?: string | null;
  is_late?: boolean;
}

export interface MatrixRowApi {
  employee_id: string;
  employee_code: string;
  full_name: string;
  department?: string | null;
  designation?: string | null;
  days: MatrixDayCellApi[];
  summary?: { present?: number; absent?: number; leave?: number };
}

export interface MatrixGridApi {
  meta?: {
    total_records?: number;
    page?: number;
    page_size?: number;
    dates?: Array<{ date: string; day_label?: string; is_weekend?: boolean; is_holiday?: boolean }>;
  };
  rows: MatrixRowApi[];
}

export interface RosterCalendarEmployeeApi {
  id: string;
  name: string;
  code: string;
  department?: string | null;
  shifts: Record<string, string>;
}

export interface RosterCalendarApi {
  month: number;
  year: number;
  employees: RosterCalendarEmployeeApi[];
  holidays?: string[];
  is_published?: boolean;
  is_locked?: boolean;
}
