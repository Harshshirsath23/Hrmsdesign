import { attendanceRequest, pollJobStatus, withCompany } from '../../../api/attendanceClient';
import type {
  AsyncJobResponse,
  AttendanceRequestApiRecord,
  AttendanceRequestsListResponse,
  DashboardFiltersResponse,
  DashboardLiveResponse,
  DashboardSummaryResponse,
  DashboardTrendResponse,
  DashboardWhosInResponse,
  MatrixDepartment,
  MatrixGridResponse,
  MatrixLiveResponse,
  MatrixSummaryResponse,
  PaginatedSwipeLogsResponse,
  RosterCalendarMonthlyResponse,
  ShiftMasterApiRecord,
  SwipeLogApiRecord,
  WhoIsInEmployeesResponse,
  WhoIsInStatus,
  WhoIsInSummaryResponse,
} from './apiTypes';

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function fetchDashboardSummary(month: number, year: number) {
  return attendanceRequest<DashboardSummaryResponse>('/dashboard/summary', {
    query: { month, year },
  });
}

export function fetchDashboardTrend(month: number, year: number) {
  return attendanceRequest<DashboardTrendResponse>('/dashboard/trend', {
    query: { month, year },
  });
}

export function fetchDashboardWhosIn() {
  return attendanceRequest<DashboardWhosInResponse>('/dashboard/whos-in');
}

export function fetchDashboardLive() {
  return attendanceRequest<DashboardLiveResponse>('/dashboard/live');
}

export function fetchDashboardFilters() {
  return attendanceRequest<DashboardFiltersResponse>('/dashboard/filters');
}

export function fetchDashboardEmployeePresence() {
  return attendanceRequest<{ results: unknown[]; generated_at?: string }>(
    '/dashboard/employee-presence',
  );
}

// ─── Attendance Matrix ───────────────────────────────────────────────────────

export function fetchMatrixGrid(params: {
  year: number;
  month: number;
  department_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return attendanceRequest<MatrixGridResponse>('/attendance-matrix/grid/', {
    query: params,
  });
}

export function fetchMatrixSummary(year: number, month: number) {
  return attendanceRequest<MatrixSummaryResponse>('/attendance-matrix/summary/', {
    query: { year, month },
  });
}

export function fetchMatrixDepartments() {
  return attendanceRequest<{ departments: MatrixDepartment[] }>(
    '/attendance-matrix/departments/',
  );
}

export function fetchMatrixLive() {
  return attendanceRequest<MatrixLiveResponse>('/attendance-matrix/live/');
}

export function fetchEmployeeDayDetail(employeeId: string, date: string) {
  return attendanceRequest<Record<string, unknown>>(
    `/attendance-matrix/employees/${employeeId}/day-detail/`,
    { query: { date } },
  );
}

export function updateEmployeeDayStatus(
  employeeId: string,
  date: string,
  status_code: string,
) {
  return attendanceRequest<unknown>(
    `/attendance-matrix/employees/${employeeId}/day-detail/update-status/`,
    {
      method: 'POST',
      query: { date },
      body: JSON.stringify({ status_code }),
    },
  );
}

export function importMatrixFile(file: File, year: number, month: number) {
  const companyId = withCompany({}).company_id;
  const form = new FormData();
  if (companyId) form.append('company_id', companyId);
  form.append('year', String(year));
  form.append('month', String(month));
  form.append('file', file);
  return attendanceRequest<AsyncJobResponse>('/attendance-matrix/import/', {
    method: 'POST',
    body: form,
  });
}

// ─── Who's In ──────────────────────────────────────────────────────────────────

function whoIsInBaseQuery(params: {
  date: string;
  department_id?: string;
  designation_id?: string;
  team_id?: string;
  shift_id?: string;
  search?: string;
}) {
  return withCompany({ date: params.date, ...params });
}

export function fetchWhoIsInSummary(params: {
  date: string;
  department_id?: string;
  designation_id?: string;
  team_id?: string;
  search?: string;
}) {
  return attendanceRequest<WhoIsInSummaryResponse>('/who-is-in/summary/', {
    query: whoIsInBaseQuery(params),
  });
}

export function fetchWhoIsInLive(params: {
  date: string;
  department_id?: string;
  designation_id?: string;
  team_id?: string;
  search?: string;
}) {
  return attendanceRequest<WhoIsInSummaryResponse & { employees?: unknown[] }>(
    '/who-is-in/live/',
    { query: whoIsInBaseQuery(params) },
  );
}

export function fetchWhoIsInEmployees(params: {
  date: string;
  status: WhoIsInStatus;
  department_id?: string;
  designation_id?: string;
  team_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return attendanceRequest<WhoIsInEmployeesResponse>('/who-is-in/employees/', {
    query: whoIsInBaseQuery(params),
  });
}

export function fetchEmployeeDailySummary(employeeId: string, date: string) {
  return attendanceRequest<Record<string, unknown>>(
    `/employees/${employeeId}/daily-summary/`,
    { query: withCompany({ date }) },
  );
}

export function createManualPunch(body: {
  employee_id: string;
  punch_type: string;
  punch_source: string;
  punch_time: string;
  reason?: string;
}) {
  return attendanceRequest<unknown>('/punch/', {
    method: 'POST',
    body: JSON.stringify(withCompany(body)),
  });
}

// ─── Swipe Logs ──────────────────────────────────────────────────────────────

export function fetchSwipeLogs(params: {
  from_date?: string;
  to_date?: string;
  employee_id?: string;
  punch_type?: string;
  punch_source?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return attendanceRequest<PaginatedSwipeLogsResponse>('/swipe-logs/', {
    query: withCompany(params),
  });
}

export function fetchSwipeLogDetail(id: number) {
  return attendanceRequest<SwipeLogApiRecord>(`/swipe-logs/${id}/`);
}

export function createSwipeLog(body: Record<string, unknown>) {
  return attendanceRequest<SwipeLogApiRecord>('/swipe-logs/', {
    method: 'POST',
    body: JSON.stringify(withCompany(body)),
  });
}

export function patchSwipeLog(id: number, body: Record<string, unknown>) {
  return attendanceRequest<SwipeLogApiRecord>(`/swipe-logs/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteSwipeLog(id: number) {
  return attendanceRequest<void>(`/swipe-logs/${id}/`, { method: 'DELETE' });
}

export function bulkDeleteSwipeLogs(ids: number[]) {
  return attendanceRequest<{ deleted_count?: number }>('/swipe-logs/bulk-delete/', {
    method: 'POST',
    body: JSON.stringify(withCompany({ ids })),
  });
}

export function fetchSwipeLogsLive() {
  return attendanceRequest<{ results?: SwipeLogApiRecord[] }>('/swipe-logs/live/', {
    query: withCompany({}),
  });
}

export function startSwipeLogsExport(body: Record<string, unknown>) {
  return attendanceRequest<AsyncJobResponse>('/swipe-logs/export/', {
    method: 'POST',
    body: JSON.stringify(withCompany(body)),
  });
}

export function fetchSwipeExportStatus(jobId: string) {
  return attendanceRequest<AsyncJobResponse & { download_url?: string }>(
    `/swipe-logs/export/${jobId}/status/`,
  );
}

export async function runSwipeExportJob(body: Record<string, unknown>) {
  const job = await startSwipeLogsExport(body);
  return pollJobStatus(() => fetchSwipeExportStatus(job.job_id));
}

// ─── Attendance Requests ───────────────────────────────────────────────────────

export function fetchAttendanceRequests(params?: { search?: string; status?: string }) {
  return attendanceRequest<AttendanceRequestApiRecord[] | AttendanceRequestsListResponse>(
    '/requests/',
    { query: params ?? {} },
  );
}

export function fetchAttendanceRequestDetail(id: string | number) {
  return attendanceRequest<AttendanceRequestApiRecord>(`/requests/${id}/`);
}

export function createAttendanceRequest(body: Record<string, unknown>) {
  return attendanceRequest<AttendanceRequestApiRecord>('/requests/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function approveAttendanceRequest(id: string | number, comment?: string) {
  return attendanceRequest<AttendanceRequestApiRecord>(`/requests/${id}/approve/`, {
    method: 'POST',
    body: JSON.stringify({ comment: comment ?? '' }),
  });
}

export function rejectAttendanceRequest(id: string | number, comment?: string) {
  return attendanceRequest<AttendanceRequestApiRecord>(`/requests/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ comment: comment ?? '' }),
  });
}

export function fetchAttendanceRequestStats() {
  return attendanceRequest<Record<string, number>>('/requests/stats/');
}

export function fetchRequestTypes() {
  return attendanceRequest<{ id: string; name: string; code?: string }[]>('/request-types/');
}

// ─── Shift Masters & Roster ──────────────────────────────────────────────────

export function fetchShiftMasters(params?: {
  search?: string;
  is_active?: boolean;
  shift_type?: string;
}) {
  return attendanceRequest<ShiftMasterApiRecord[] | { results: ShiftMasterApiRecord[] }>(
    '/shift-masters/',
    {
      query: {
        search: params?.search,
        is_active: params?.is_active,
        shift_type: params?.shift_type,
      },
    },
  );
}

export function fetchShiftTypes() {
  return attendanceRequest<{ id: string; code: string; label: string }[]>('/shift-types/');
}

export function fetchShiftAssignments(params?: {
  cycle_id?: string;
  employee_id?: string;
  shift_id?: string;
}) {
  return attendanceRequest<unknown[]>('/shift-assignments/', { query: params ?? {} });
}

export function fetchRosterCalendarMonthly(month: number, year: number, department_id?: string) {
  return attendanceRequest<RosterCalendarMonthlyResponse>('/roster-calendar/monthly/', {
    query: { month, year, department_id },
  });
}

export function publishRoster(body: Record<string, unknown>) {
  return attendanceRequest<unknown>('/roster-publish/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function lockRoster(body: Record<string, unknown>) {
  return attendanceRequest<unknown>('/roster-lock/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchShiftSwaps() {
  return attendanceRequest<unknown[]>('/shift-swaps/');
}

export function approveShiftSwap(id: string) {
  return attendanceRequest<unknown>(`/shift-swaps/${id}/approve/`, { method: 'POST' });
}

export function rejectShiftSwap(id: string) {
  return attendanceRequest<unknown>(`/shift-swaps/${id}/reject/`, { method: 'POST' });
}
