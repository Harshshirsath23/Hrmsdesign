import { attendanceFetch, attendanceQuery } from '../../../api/attendanceClient';
import type {
  DashboardSummaryApi,
  DashboardTrendApi,
  MatrixGridApi,
  RosterCalendarApi,
  SwipeLogListApi,
  WhoIsInEmployeesApi,
  WhoIsInStatus,
  WhoIsInSummaryApi,
} from './apiTypes';

export function fetchDashboardSummary(month: number, year: number) {
  return attendanceFetch<DashboardSummaryApi>(
    `/dashboard/summary${attendanceQuery({ month, year })}`,
  );
}

export function fetchDashboardTrend(month: number, year: number) {
  return attendanceFetch<DashboardTrendApi>(
    `/dashboard/trend${attendanceQuery({ month, year })}`,
  );
}

export function fetchWhoIsInSummary(date: string) {
  return attendanceFetch<WhoIsInSummaryApi>(
    `/who-is-in/summary/${attendanceQuery({ date })}`,
  );
}

export function fetchWhoIsInEmployees(params: {
  date: string;
  status: WhoIsInStatus;
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string;
  designation_id?: string;
}) {
  return attendanceFetch<WhoIsInEmployeesApi>(
    `/who-is-in/employees/${attendanceQuery(params)}`,
  );
}

export function fetchSwipeLogs(params: {
  from_date: string;
  to_date: string;
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string;
  employee_id?: string;
}) {
  return attendanceFetch<SwipeLogListApi>(
    `/swipe-logs/${attendanceQuery(params)}`,
  );
}

export function fetchMatrixGrid(params: {
  year: number;
  month: number;
  page?: number;
  page_size?: number;
  department_id?: string;
  search?: string;
}) {
  return attendanceFetch<MatrixGridApi>(
    `/attendance-matrix/grid/${attendanceQuery(params)}`,
  );
}

export function fetchMatrixDepartments() {
  return attendanceFetch<{ departments: Array<{ id: string; name: string }> }>(
    `/attendance-matrix/departments/${attendanceQuery({})}`,
  );
}

export function fetchRosterCalendarMonthly(month: number, year: number, department_id?: string) {
  return attendanceFetch<RosterCalendarApi>(
    `/roster-calendar/monthly/${attendanceQuery({ month, year, department_id })}`,
  );
}
