import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  fetchDashboardSummary,
  fetchDashboardTrend,
  fetchMatrixGrid,
  fetchRosterCalendarMonthly,
  fetchSwipeLogs,
  fetchWhoIsInEmployees,
  fetchWhoIsInSummary,
} from './api';
import {
  mapDashboardSummaryToMetrics,
  mapMatrixGridToPageData,
  mapRosterCalendarToUi,
  mapSwipeLogApi,
  mapTrendToChartData,
  mapWhoIsInEmployeeToDaily,
  mapWhoIsInSummaryToStats,
} from './mappers';
import type { WhoIsInStatus } from './apiTypes';

export const attendanceKeys = {
  all: ['attendance'] as const,
  dashboardSummary: (month: number, year: number) =>
    [...attendanceKeys.all, 'dashboard-summary', month, year] as const,
  dashboardTrend: (month: number, year: number) =>
    [...attendanceKeys.all, 'dashboard-trend', month, year] as const,
  whoIsInSummary: (date: string) =>
    [...attendanceKeys.all, 'who-is-in-summary', date] as const,
  whoIsInEmployees: (date: string, status: WhoIsInStatus) =>
    [...attendanceKeys.all, 'who-is-in-employees', date, status] as const,
  swipeLogs: (from: string, to: string) =>
    [...attendanceKeys.all, 'swipe-logs', from, to] as const,
  matrixGrid: (year: number, month: number, page: number) =>
    [...attendanceKeys.all, 'matrix-grid', year, month, page] as const,
  rosterCalendar: (year: number, month: number) =>
    [...attendanceKeys.all, 'roster-calendar', year, month] as const,
};

export function useDashboardSummary(month: number, year: number) {
  return useQuery({
    queryKey: attendanceKeys.dashboardSummary(month, year),
    queryFn: async () => mapDashboardSummaryToMetrics(await fetchDashboardSummary(month, year)),
    enabled: month >= 1 && month <= 12 && year > 2000,
  });
}

export function useDashboardTrend(month: number, year: number) {
  return useQuery({
    queryKey: attendanceKeys.dashboardTrend(month, year),
    queryFn: async () => mapTrendToChartData(await fetchDashboardTrend(month, year)),
    enabled: month >= 1 && month <= 12 && year > 2000,
  });
}

export function useWhoIsInSummary(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  return useQuery({
    queryKey: attendanceKeys.whoIsInSummary(dateStr),
    queryFn: async () => mapWhoIsInSummaryToStats(await fetchWhoIsInSummary(dateStr)),
  });
}

export function useWhoIsInEmployees(date: Date, status: WhoIsInStatus, search?: string) {
  const dateStr = format(date, 'yyyy-MM-dd');
  return useQuery({
    queryKey: attendanceKeys.whoIsInEmployees(dateStr, status),
    queryFn: async () => {
      const res = await fetchWhoIsInEmployees({
        date: dateStr,
        status,
        limit: 100,
        search: search || undefined,
      });
      return (res.employees ?? []).map((e) => mapWhoIsInEmployeeToDaily(e, dateStr));
    },
  });
}

export function useSwipeLogs(fromDate: Date, toDate: Date) {
  const from = format(fromDate, 'yyyy-MM-dd');
  const to = format(toDate, 'yyyy-MM-dd');
  return useQuery({
    queryKey: attendanceKeys.swipeLogs(from, to),
    queryFn: async () => {
      const res = await fetchSwipeLogs({ from_date: from, to_date: to, limit: 500 });
      const rows = res.results ?? res.data ?? [];
      return rows.map(mapSwipeLogApi);
    },
  });
}

export function useMatrixGrid(year: number, month: number, page = 1) {
  return useQuery({
    queryKey: attendanceKeys.matrixGrid(year, month, page),
    queryFn: async () => mapMatrixGridToPageData(await fetchMatrixGrid({ year, month, page, page_size: 50 })),
  });
}

export function useRosterCalendar(month: number, year: number) {
  return useQuery({
    queryKey: attendanceKeys.rosterCalendar(year, month),
    queryFn: async () => mapRosterCalendarToUi(await fetchRosterCalendarMonthly(month, year)),
  });
}
