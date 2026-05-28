import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getAccessToken, syncCompanyIdFromToken } from '../../../api/attendanceClient';
import * as attendanceApi from './api';
import {
  mapMatrixGridToUi,
  mapSwipeLogApiToUi,
  unwrapList,
} from './mappers';
import type { WhoIsInStatus } from './apiTypes';

export const attendanceKeys = {
  dashboard: {
    summary: (month: number, year: number) => ['attendance', 'dashboard', 'summary', month, year] as const,
    trend: (month: number, year: number) => ['attendance', 'dashboard', 'trend', month, year] as const,
    whosIn: () => ['attendance', 'dashboard', 'whos-in'] as const,
    live: () => ['attendance', 'dashboard', 'live'] as const,
    filters: () => ['attendance', 'dashboard', 'filters'] as const,
  },
  matrix: {
    grid: (p: Record<string, unknown>) => ['attendance', 'matrix', 'grid', p] as const,
    summary: (year: number, month: number) => ['attendance', 'matrix', 'summary', year, month] as const,
    departments: () => ['attendance', 'matrix', 'departments'] as const,
    live: () => ['attendance', 'matrix', 'live'] as const,
    dayDetail: (employeeId: string, date: string) =>
      ['attendance', 'matrix', 'day', employeeId, date] as const,
  },
  whosIn: {
    summary: (p: Record<string, unknown>) => ['attendance', 'who-is-in', 'summary', p] as const,
    employees: (p: Record<string, unknown>) => ['attendance', 'who-is-in', 'employees', p] as const,
    live: (p: Record<string, unknown>) => ['attendance', 'who-is-in', 'live', p] as const,
  },
  swipeLogs: {
    list: (p: Record<string, unknown>) => ['attendance', 'swipe-logs', p] as const,
    live: () => ['attendance', 'swipe-logs', 'live'] as const,
  },
  requests: {
    list: (search?: string) => ['attendance', 'requests', search] as const,
    stats: () => ['attendance', 'requests', 'stats'] as const,
    types: () => ['attendance', 'request-types'] as const,
  },
  roster: {
    calendar: (month: number, year: number, departmentId?: string) =>
      ['attendance', 'roster', 'calendar', month, year, departmentId] as const,
    shifts: () => ['attendance', 'shift-masters'] as const,
  },
};

const POLL_30S = { refetchInterval: 30_000 };

function useAuthReady() {
  const ready = Boolean(getAccessToken());
  if (ready) {
    syncCompanyIdFromToken();
  }
  return ready;
}

// ─── Dashboard hooks ─────────────────────────────────────────────────────────

export function useDashboardSummary(month: number, year: number) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: attendanceKeys.dashboard.summary(month, year),
    queryFn: () => attendanceApi.fetchDashboardSummary(month, year),
    enabled: ready && month > 0 && year > 0,
  });
}

export function useDashboardTrend(month: number, year: number) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: attendanceKeys.dashboard.trend(month, year),
    queryFn: () => attendanceApi.fetchDashboardTrend(month, year),
    enabled: ready && month > 0 && year > 0,
  });
}

export function useDashboardWhosIn(enabled = true) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: attendanceKeys.dashboard.whosIn(),
    queryFn: () => attendanceApi.fetchDashboardWhosIn(),
    enabled: ready && enabled,
  });
}

export function useDashboardLive(enabled = true) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: attendanceKeys.dashboard.live(),
    queryFn: () => attendanceApi.fetchDashboardLive(),
    enabled: ready && enabled,
    ...(ready && enabled ? POLL_30S : {}),
  });
}

export function useDashboardFilters() {
  const ready = useAuthReady();
  return useQuery({
    queryKey: attendanceKeys.dashboard.filters(),
    queryFn: () => attendanceApi.fetchDashboardFilters(),
    enabled: ready,
    staleTime: 5 * 60_000,
  });
}

// ─── Matrix hooks ────────────────────────────────────────────────────────────

export function useMatrixGrid(params: {
  year: number;
  month: number;
  department_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: attendanceKeys.matrix.grid(params),
    queryFn: async () => {
      const grid = await attendanceApi.fetchMatrixGrid(params);
      return mapMatrixGridToUi(grid);
    },
    enabled: params.year > 0 && params.month > 0,
  });
}

export function useMatrixSummary(year: number, month: number) {
  return useQuery({
    queryKey: attendanceKeys.matrix.summary(year, month),
    queryFn: () => attendanceApi.fetchMatrixSummary(year, month),
    enabled: year > 0 && month > 0,
  });
}

export function useMatrixDepartments() {
  return useQuery({
    queryKey: attendanceKeys.matrix.departments(),
    queryFn: () => attendanceApi.fetchMatrixDepartments(),
    staleTime: 5 * 60_000,
  });
}

export function useMatrixLive(enabled: boolean) {
  return useQuery({
    queryKey: attendanceKeys.matrix.live(),
    queryFn: () => attendanceApi.fetchMatrixLive(),
    enabled,
    ...(enabled ? POLL_30S : {}),
  });
}

export function useUpdateMatrixDayStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      date,
      status_code,
    }: {
      employeeId: string;
      date: string;
      status_code: string;
    }) => attendanceApi.updateEmployeeDayStatus(employeeId, date, status_code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', 'matrix'] });
    },
  });
}

export function useMatrixImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, year, month }: { file: File; year: number; month: number }) =>
      attendanceApi.importMatrixFile(file, year, month),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', 'matrix'] });
    },
  });
}

// ─── Who's In hooks ────────────────────────────────────────────────────────────

export function useWhoIsInSummary(filters: {
  date: Date;
  department_id?: string;
  designation_id?: string;
  team_id?: string;
  search?: string;
}) {
  const date = format(filters.date, 'yyyy-MM-dd');
  const params = {
    date,
    department_id: filters.department_id,
    designation_id: filters.designation_id,
    team_id: filters.team_id,
    search: filters.search || undefined,
  };
  return useQuery({
    queryKey: attendanceKeys.whosIn.summary(params),
    queryFn: () => attendanceApi.fetchWhoIsInSummary(params),
  });
}

export function useWhoIsInEmployees(
  status: WhoIsInStatus,
  filters: {
    date: Date;
    department_id?: string;
    designation_id?: string;
    team_id?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  enabled = true,
) {
  const date = format(filters.date, 'yyyy-MM-dd');
  const params = {
    date,
    status,
    department_id: filters.department_id,
    designation_id: filters.designation_id,
    team_id: filters.team_id,
    search: filters.search || undefined,
    page: filters.page ?? 1,
    limit: filters.limit ?? 50,
  };
  return useQuery({
    queryKey: attendanceKeys.whosIn.employees(params),
    queryFn: () => attendanceApi.fetchWhoIsInEmployees(params),
    enabled,
  });
}

export function useWhoIsInLive(
  filters: { date: Date; department_id?: string; search?: string },
  enabled: boolean,
) {
  const date = format(filters.date, 'yyyy-MM-dd');
  const params = {
    date,
    department_id: filters.department_id,
    search: filters.search || undefined,
  };
  return useQuery({
    queryKey: attendanceKeys.whosIn.live(params),
    queryFn: () => attendanceApi.fetchWhoIsInLive(params),
    enabled,
    ...(enabled ? POLL_30S : {}),
  });
}

export function useManualPunch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.createManualPunch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', 'who-is-in'] });
    },
  });
}

// ─── Swipe logs hooks ──────────────────────────────────────────────────────────

export function useSwipeLogs(params: {
  from_date?: string;
  to_date?: string;
  employee_id?: string;
  punch_type?: string;
  punch_source?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: attendanceKeys.swipeLogs.list(params),
    queryFn: async () => {
      const res = await attendanceApi.fetchSwipeLogs(params);
      const rows = unwrapList(res);
      return {
        count: 'count' in res ? res.count : rows.length,
        results: rows.map(mapSwipeLogApiToUi),
      };
    },
  });
}

export function useSwipeLogsLive(enabled: boolean) {
  return useQuery({
    queryKey: attendanceKeys.swipeLogs.live(),
    queryFn: async () => {
      const res = await attendanceApi.fetchSwipeLogsLive();
      const rows = res.results ?? [];
      return rows.map(mapSwipeLogApiToUi);
    },
    enabled,
    ...(enabled ? POLL_30S : {}),
  });
}

export function useSwipeLogMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['attendance', 'swipe-logs'] });

  return {
    create: useMutation({
      mutationFn: attendanceApi.createSwipeLog,
      onSuccess: invalidate,
    }),
    patch: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        attendanceApi.patchSwipeLog(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => attendanceApi.deleteSwipeLog(id),
      onSuccess: invalidate,
    }),
    bulkDelete: useMutation({
      mutationFn: (ids: number[]) => attendanceApi.bulkDeleteSwipeLogs(ids),
      onSuccess: invalidate,
    }),
  };
}

// ─── Requests hooks ────────────────────────────────────────────────────────────

export function useAttendanceRequests(search?: string) {
  return useQuery({
    queryKey: attendanceKeys.requests.list(search),
    queryFn: async () => {
      const res = await attendanceApi.fetchAttendanceRequests({ search });
      return unwrapList(res);
    },
  });
}

export function useAttendanceRequestStats() {
  return useQuery({
    queryKey: attendanceKeys.requests.stats(),
    queryFn: () => attendanceApi.fetchAttendanceRequestStats(),
  });
}

export function useRequestApprovalMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['attendance', 'requests'] });
  return {
    approve: useMutation({
      mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
        attendanceApi.approveAttendanceRequest(id, comment),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
        attendanceApi.rejectAttendanceRequest(id, comment),
      onSuccess: invalidate,
    }),
  };
}

// ─── Roster hooks ──────────────────────────────────────────────────────────────

export function useRosterCalendar(month: number, year: number, departmentId?: string) {
  return useQuery({
    queryKey: attendanceKeys.roster.calendar(month, year, departmentId),
    queryFn: () => attendanceApi.fetchRosterCalendarMonthly(month, year, departmentId),
    enabled: month > 0 && year > 0,
  });
}

export function useShiftMasters() {
  return useQuery({
    queryKey: attendanceKeys.roster.shifts(),
    queryFn: async () => unwrapList(await attendanceApi.fetchShiftMasters({ is_active: true })),
    staleTime: 5 * 60_000,
  });
}
