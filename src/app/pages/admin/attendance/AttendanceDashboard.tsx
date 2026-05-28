import { useState, useMemo } from "react";
import { AttendanceFilterBar } from "../../../components/attendance/AttendanceFilterBar";
import { WorkHoursSummary } from "../../../components/attendance/WorkHoursSummary";
import { AnalyticsPanel } from "../../../components/attendance/AnalyticsPanel";
import { WhosInToday } from "../../../components/attendance/WhosInToday";
import { TotalLeaveTakenChart } from "../../../components/attendance/TotalLeaveTakenChart";
import { TodayAttendanceOverview } from "../../../components/attendance/TodayAttendanceOverview";
import { format, eachMonthOfInterval, startOfYear, endOfYear } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  useDashboardFilters,
  useDashboardLive,
  useDashboardSummary,
  useDashboardTrend,
  useDashboardWhosIn,
} from "../../../modules/attendance/hooks";
import {
  mapDashboardSummaryToMetrics,
  mapTrendToChartData,
  mapWhosInToTodayStats,
} from "../../../modules/attendance/mappers";

export function AttendanceDashboard() {
  const [globalFilters, setGlobalFilters] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    department: "all",
    designation: "all",
    team: "all",
    search: "",
  });

  const [whosInFilters, setWhosInFilters] = useState({
    date: new Date(),
    department: "all",
    designation: "all",
    team: "all",
    search: "",
  });

  const month = Number(globalFilters.month);
  const year = Number(globalFilters.year);

  const filtersQuery = useDashboardFilters();
  const summaryQuery = useDashboardSummary(month, year);
  const trendQuery = useDashboardTrend(month, year);
  const whosInQuery = useDashboardWhosIn();
  useDashboardLive(true);

  const filterOptions = useMemo(() => {
    const data = filtersQuery.data;
    if (!data) return undefined;
    return {
      departments: data.departments.map((d) => ({ value: d.id ?? d.name, label: d.name })),
      designations: data.designations.map((d) => ({ value: d.id ?? d.name, label: d.name })),
      teams: data.teams.map((t) => ({ value: t.id ?? t.name, label: t.name })),
    };
  }, [filtersQuery.data]);

  const chartData = useMemo(() => {
    if (!trendQuery.data?.trend_data) return [];
    return mapTrendToChartData(trendQuery.data.trend_data);
  }, [trendQuery.data]);

  const metrics = useMemo(() => {
    if (!summaryQuery.data) {
      return {
        avgWorkHours: 0,
        totalAbsent: 0,
        holidays: 0,
        lateLogins: 0,
        avgAttendance: 0,
        totalEmployees: 0,
      };
    }
    return mapDashboardSummaryToMetrics(summaryQuery.data);
  }, [summaryQuery.data]);

  const todayStats = useMemo(() => {
    if (!whosInQuery.data) {
      return {
        overview: {
          present: { count: 0, percentage: 0 },
          onLeave: { count: 0, percentage: 0 },
          absent: { count: 0, percentage: 0 },
          late: { count: 0, percentage: 0 },
          wfh: { count: 0, percentage: 0 },
        },
        whosIn: { onTime: 0, lateIn: 0, notYetIn: 0, onLeave: 0, outOfOffice: 0 },
      };
    }
    return mapWhosInToTodayStats(whosInQuery.data);
  }, [whosInQuery.data]);

  const leaveYearlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(year, 0, 1)),
      end: endOfYear(new Date(year, 0, 1)),
    });
    return months.map((m) => ({
      month: format(m, "MMM"),
      leaveDays: m.getMonth() + 1 === month ? (summaryQuery.data?.total_absent ?? 0) : 0,
      approvedCount: 0,
      employees: 0,
    }));
  }, [year, month, summaryQuery.data]);

  const attendanceTrendData = useMemo(() => {
    if (!trendQuery.data?.trend_data?.length) return [];
    return trendQuery.data.trend_data.map((p) => ({
      month: format(new Date(p.date), "dd"),
      percentage: Number(p.work_hours) > 0 ? Math.min(100, (Number(p.work_hours) / 9) * 100) : 0,
    }));
  }, [trendQuery.data]);

  const isLoading = summaryQuery.isLoading || trendQuery.isLoading || whosInQuery.isLoading;
  const error = summaryQuery.error ?? trendQuery.error ?? whosInQuery.error;

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950 h-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight">Attendance Dashboard</h2>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Operational Insights & Patterns</p>
      </div>

      <AttendanceFilterBar
        filters={globalFilters}
        setFilters={setGlobalFilters}
        filterOptions={filterOptions}
        filtersLoading={filtersQuery.isLoading}
      />

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {(error as Error).message || "Failed to load dashboard data. Check authentication and company_id."}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading attendance dashboard…</span>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WorkHoursSummary data={chartData} />
            </div>
            <div className="lg:col-span-1">
              <AnalyticsPanel
                metrics={metrics}
                filters={globalFilters}
                setFilters={setGlobalFilters}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <TotalLeaveTakenChart data={leaveYearlyData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WhosInToday
                data={todayStats.whosIn}
                filters={whosInFilters}
                setFilters={setWhosInFilters}
              />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
              <TodayAttendanceOverview stats={todayStats.overview} />

              <Card className="shadow-sm border-border">
                <CardHeader className="pb-2 border-b border-border/50">
                  <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Monthly Attendance Trend (%)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[120px] w-full">
                    {attendanceTrendData.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">No trend data for this period</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={attendanceTrendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                          <XAxis dataKey="month" hide />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', fontSize: '10px' }}
                            labelStyle={{ fontWeight: 900 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="percentage"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
