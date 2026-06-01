import { useState, useMemo } from "react";
import { AttendanceFilterBar } from "../../../components/attendance/AttendanceFilterBar";
import { WorkHoursSummary } from "../../../components/attendance/WorkHoursSummary";
import { AnalyticsPanel } from "../../../components/attendance/AnalyticsPanel";
import { TodayAttendanceOverview } from "../../../components/attendance/TodayAttendanceOverview";
import { TotalLeaveTakenChart } from "../../../components/attendance/TotalLeaveTakenChart";
import { useDashboardSummary, useDashboardTrend } from "../../../modules/attendance/hooks";
import { format, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { AlertCircle, Loader2 } from "lucide-react";

export function AttendanceDashboard() {
  const [globalFilters, setGlobalFilters] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    department: "all",
    designation: "all",
    team: "all",
    search: "",
  });

  const month = Number(globalFilters.month);
  const year = Number(globalFilters.year);

  const {
    data: metrics,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErr,
  } = useDashboardSummary(month, year);

  const {
    data: trendChart = [],
    isLoading: trendLoading,
    isError: trendError,
  } = useDashboardTrend(month, year);

  const leaveYearlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(year, 0, 1)),
      end: endOfYear(new Date(year, 0, 1)),
    });
    return months.map((m) => ({
      month: format(m, "MMM"),
      leaveDays: 0,
      approvedCount: 0,
      employees: 0,
    }));
  }, [year]);

  const todayStats = useMemo(
    () => ({
      overview: {
        present: { count: metrics?.totalEmployees ?? 0, percentage: Math.round(metrics?.avgAttendance ?? 0) },
        onLeave: { count: 0, percentage: 0 },
        absent: { count: metrics?.totalAbsent ?? 0, percentage: 0 },
        late: { count: metrics?.lateLogins ?? 0, percentage: 0 },
        wfh: { count: 0, percentage: 0 },
      },
    }),
    [metrics],
  );

  const loading = summaryLoading || trendLoading;
  const hasError = summaryError || trendError;

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950 h-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight">Attendance Dashboard</h2>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Operational Insights & Patterns
        </p>
      </div>

      {hasError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{summaryErr instanceof Error ? summaryErr.message : "Failed to load dashboard data."}</span>
        </div>
      )}

      <AttendanceFilterBar filters={globalFilters} setFilters={setGlobalFilters} />

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm font-semibold">Loading attendance dashboard…</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WorkHoursSummary data={trendChart} />
            </div>
            <div className="lg:col-span-1">
              <AnalyticsPanel
                metrics={
                  metrics ?? {
                    avgWorkHours: 0,
                    totalAbsent: 0,
                    holidays: 0,
                    lateLogins: 0,
                    avgAttendance: 0,
                    totalEmployees: 0,
                  }
                }
                filters={globalFilters}
                setFilters={setGlobalFilters}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <TotalLeaveTakenChart data={leaveYearlyData} />
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <TodayAttendanceOverview stats={todayStats.overview} />
          </div>
        </>
      )}
    </div>
  );
}
