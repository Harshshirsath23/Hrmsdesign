import { useState, useMemo } from "react";
import { AttendanceFilterBar } from "../../../components/attendance/AttendanceFilterBar";
import { WorkHoursSummary } from "../../../components/attendance/WorkHoursSummary";
import { AnalyticsPanel } from "../../../components/attendance/AnalyticsPanel";
import { WhosInToday } from "../../../components/attendance/WhosInToday";
import { TotalLeaveTakenChart } from "../../../components/attendance/TotalLeaveTakenChart";
import { TodayAttendanceOverview } from "../../../components/attendance/TodayAttendanceOverview";
import { MOCK_ATTENDANCE } from "../../../modules/attendance/mockData";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export function AttendanceDashboard() {
  // Global Filters
  const [globalFilters, setGlobalFilters] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    department: "all",
    designation: "all",
    team: "all",
    search: "",
  });

  // Whos In Today Filters
  const [whosInFilters, setWhosInFilters] = useState({
    date: new Date(),
    department: "all",
    designation: "all",
    team: "all",
    search: "",
  });

  // 1. Filtered data for the Work Hours & Analytics (Monthly)
  const filteredMonthlyData = useMemo(() => {
    return MOCK_ATTENDANCE.filter(record => {
      const recordDate = new Date(record.date);
      const matchesMonth = (recordDate.getMonth() + 1) === Number(globalFilters.month);
      const matchesYear = recordDate.getFullYear() === Number(globalFilters.year);
      const matchesDept = globalFilters.department === "all" || record.department === globalFilters.department;
      const matchesTeam = globalFilters.team === "all" || record.team === globalFilters.team;
      const matchesDesig = globalFilters.designation === "all" || record.designation === globalFilters.designation;
      const matchesSearch = !globalFilters.search || 
        record.employeeName.toLowerCase().includes(globalFilters.search.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(globalFilters.search.toLowerCase());

      return matchesMonth && matchesYear && matchesDept && matchesTeam && matchesDesig && matchesSearch;
    });
  }, [globalFilters]);

  // 2. Filtered data for "Who's In Today" (Specific Date)
  const filteredDailyData = useMemo(() => {
    return MOCK_ATTENDANCE.filter(record => {
      const isDay = isSameDay(new Date(record.date), whosInFilters.date);
      const matchesDept = whosInFilters.department === "all" || record.department === whosInFilters.department;
      const matchesTeam = whosInFilters.team === "all" || record.team === whosInFilters.team;
      const matchesSearch = !whosInFilters.search || 
        record.employeeName.toLowerCase().includes(whosInFilters.search.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(whosInFilters.search.toLowerCase());
      
      return isDay && matchesDept && matchesTeam && matchesSearch;
    });
  }, [whosInFilters]);

  // 3. Calculate Work Hours Chart Data (Daily for selected month)
  const chartData = useMemo(() => {
    const startDate = startOfMonth(new Date(Number(globalFilters.year), Number(globalFilters.month) - 1));
    const endDate = endOfMonth(startDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayRecords = filteredMonthlyData.filter(r => r.date === dateStr && r.status !== "Week Off" && r.status !== "Holiday");
      
      const avgHours = dayRecords.length > 0 
        ? dayRecords.reduce((acc, curr) => acc + curr.workHours, 0) / dayRecords.length 
        : 0;

      return {
        day: format(day, "dd MMM"),
        hours: Number(avgHours.toFixed(1)),
        employees: dayRecords.length
      };
    });
  }, [filteredMonthlyData, globalFilters]);

  // 4. Calculate Yearly Leave Data (Jan-Dec)
  const leaveYearlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(Number(globalFilters.year), 0, 1)),
      end: endOfYear(new Date(Number(globalFilters.year), 0, 1))
    });

    return months.map(month => {
      const monthIdx = month.getMonth() + 1;
      // In real app, we'd fetch data for the whole year. 
      // For mock, we'll simulate yearly distribution based on the single month's patterns but randomized
      const monthLeaveRecords = filteredMonthlyData.filter(r => (new Date(r.date).getMonth() + 1) === monthIdx || Math.random() > 0.8);
      
      const leaveDays = Math.floor(Math.random() * 50) + 10;
      const approvedCount = Math.floor(leaveDays * 0.9);
      const employeesOnLeave = Math.floor(leaveDays / 2);

      return {
        month: format(month, "MMM"),
        leaveDays,
        approvedCount,
        employees: employeesOnLeave
      };
    });
  }, [filteredMonthlyData, globalFilters.year]);

  // 5. Calculate Monthly Attendance Trend (%)
  const attendanceTrendData = useMemo(() => {
     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
     return months.map(m => ({
       month: m,
       percentage: 90 + Math.random() * 8
     }));
  }, []);

  // 6. Calculate Metrics for Panel
  const metrics = useMemo(() => {
    const presentRecords = filteredMonthlyData.filter(r => r.status === "Present");
    const absentRecords = filteredMonthlyData.filter(r => r.status === "Absent");
    const lateRecords = filteredMonthlyData.filter(r => r.isLate);
    
    const totalEmployees = new Set(filteredMonthlyData.map(r => r.employeeId)).size;
    const avgAttendance = filteredMonthlyData.length > 0 
      ? (presentRecords.length / (presentRecords.length + absentRecords.length)) * 100 
      : 0;

    return {
      avgWorkHours: presentRecords.length > 0 ? presentRecords.reduce((acc, curr) => acc + curr.workHours, 0) / presentRecords.length : 0,
      totalAbsent: absentRecords.length,
      holidays: filteredMonthlyData.filter(r => r.status === "Holiday").length,
      lateLogins: lateRecords.length,
      avgAttendance,
      totalEmployees
    };
  }, [filteredMonthlyData]);

  // 7. Today's Statistics
  const todayStats = useMemo(() => {
    const total = filteredDailyData.length || 1;
    const presentCount = filteredDailyData.filter(r => r.status === "Present" || r.status === "Half Day").length;
    const leaveCount = filteredDailyData.filter(r => r.status === "Leave").length;
    const absentCount = filteredDailyData.filter(r => r.status === "Absent").length;
    const lateCount = filteredDailyData.filter(r => r.isLate).length;
    const wfhCount = filteredDailyData.filter(r => r.workMode === "WFH").length;
    const oooCount = Math.floor(Math.random() * 5); // Simulating Out of Office

    return {
      overview: {
        present: { count: presentCount, percentage: Math.round((presentCount / total) * 100) },
        onLeave: { count: leaveCount, percentage: Math.round((leaveCount / total) * 100) },
        absent: { count: absentCount, percentage: Math.round((absentCount / total) * 100) },
        late: { count: lateCount, percentage: Math.round((lateCount / total) * 100) },
        wfh: { count: wfhCount, percentage: Math.round((wfhCount / total) * 100) },
      },
      whosIn: {
        onTime: Math.max(0, presentCount - lateCount),
        lateIn: lateCount,
        notYetIn: absentCount,
        onLeave: leaveCount,
        outOfOffice: oooCount
      }
    };
  }, [filteredDailyData]);

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950 h-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-foreground tracking-tight">Attendance Dashboard</h2>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Operational Insights & Patterns</p>
      </div>

      <AttendanceFilterBar 
        filters={globalFilters} 
        setFilters={setGlobalFilters} 
      />

      {/* Row 1: Work Hours & Summary */}
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

      {/* Row 2: Yearly Leave Trend */}
      <div className="grid grid-cols-1 gap-6">
         <TotalLeaveTakenChart data={leaveYearlyData} />
      </div>

      {/* Row 3: Today's Status & Overview */}
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
          
          {/* Monthly Attendance Trend Sparkline */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-2 border-b border-border/50">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Monthly Attendance Trend (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                    <XAxis dataKey="month" hide />
                    <YAxis hide domain={[80, 100]} />
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
