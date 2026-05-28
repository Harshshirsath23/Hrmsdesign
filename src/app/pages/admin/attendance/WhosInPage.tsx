import { useState, useMemo, useCallback } from "react";
import { ChevronRight, Home, RefreshCw, Download, Calendar as CalendarIcon, Users, CheckCircle, Info, AlertCircle, Loader2, Map } from "lucide-react";
import { AttendanceFilterPanel } from "../../../components/attendance/whos-in/AttendanceFilterPanel";
import { AttendanceAnalyticsHeader } from "../../../components/attendance/whos-in/AttendanceAnalyticsHeader";
import { EmployeeAttendanceCard } from "../../../components/attendance/whos-in/EmployeeAttendanceCard";
import { Button } from "../../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import { isSameDay, isBefore, isAfter, startOfDay, format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { cn } from "../../../components/ui/utils";
import {
  useWhoIsInEmployees,
  useWhoIsInLive,
  useWhoIsInSummary,
} from "../../../modules/attendance/hooks";
import { mapWhoIsInCardToDailyAttendance } from "../../../modules/attendance/mappers";
import type { DailyAttendance } from "../../../modules/attendance/types";
import type { WhoIsInStatus } from "../../../modules/attendance/apiTypes";
import { formatAttendanceError } from "../../../modules/attendance/errors";
import { AttendanceApiError } from "../../../../api/attendanceClient";
import { useAuth } from "../../../context/AuthContext";

export function WhosInPage() {
  const { logout } = useAuth();
  const [filters, setFilters] = useState({
    date: new Date(),
    shift: "all",
    department: "all",
    designation: "all",
    team: "all",
    workMode: "all",
    search: "",
  });

  const [oooTab, setOooTab] = useState("all");

  const isTodayValue = useMemo(() => isSameDay(filters.date, new Date()), [filters.date]);
  const isPast = useMemo(() => isBefore(startOfDay(filters.date), startOfDay(new Date())), [filters.date]);
  const isFuture = useMemo(() => isAfter(startOfDay(filters.date), startOfDay(new Date())), [filters.date]);

  const apiFilters = useMemo(() => ({
    date: filters.date,
    department_id: filters.department !== "all" ? filters.department : undefined,
    designation_id: filters.designation !== "all" ? filters.designation : undefined,
    team_id: filters.team !== "all" ? filters.team : undefined,
    search: filters.search || undefined,
  }), [filters]);

  const summaryQuery = useWhoIsInSummary(apiFilters);
  useWhoIsInLive(apiFilters, isTodayValue);

  const notInQuery = useWhoIsInEmployees("NOT_IN" as WhoIsInStatus, apiFilters, !isFuture);
  const lateQuery = useWhoIsInEmployees("LATE" as WhoIsInStatus, apiFilters, !isFuture);
  const onTimeQuery = useWhoIsInEmployees("ON_TIME" as WhoIsInStatus, apiFilters, !isFuture);
  const oooQuery = useWhoIsInEmployees("OUT_OF_OFFICE" as WhoIsInStatus, apiFilters, true);

  const dateStr = format(filters.date, "yyyy-MM-dd");

  const mapEmployees = useCallback(
    (status: WhoIsInStatus) => {
      const query =
        status === "NOT_IN" ? notInQuery :
        status === "LATE" ? lateQuery :
        status === "ON_TIME" ? onTimeQuery : oooQuery;
      return (query.data?.employees ?? []).map((e) =>
        mapWhoIsInCardToDailyAttendance(e, dateStr) as DailyAttendance,
      );
    },
    [notInQuery.data, lateQuery.data, onTimeQuery.data, oooQuery.data, dateStr],
  );

  const sections = useMemo(() => ({
    primarySection: mapEmployees("NOT_IN"),
    late: mapEmployees("LATE"),
    onTime: mapEmployees("ON_TIME"),
    ooo: mapEmployees("OUT_OF_OFFICE"),
  }), [mapEmployees]);

  const isRefreshing =
    summaryQuery.isFetching ||
    notInQuery.isFetching ||
    lateQuery.isFetching ||
    onTimeQuery.isFetching;

  const handleRefresh = () => {
    summaryQuery.refetch();
    notInQuery.refetch();
    lateQuery.refetch();
    onTimeQuery.refetch();
    oooQuery.refetch();
  };

  const totalEmployees = summaryQuery.data?.summary.total_employees ?? 1;
  const summary = summaryQuery.data?.summary;

  const stats = useMemo(() => {
    if (isFuture) {
      return {
        notYetIn: { count: sections.primarySection.length, percentage: 100, label: "Scheduled Employees" },
        lateArrivals: { count: 0, percentage: 0, label: "No Punches Yet" },
        onTime: { count: 0, percentage: 0, label: "No Punches Yet" },
        outOfOffice: {
          count: summary?.out_of_office ?? sections.ooo.length,
          percentage: Math.round(((summary?.out_of_office ?? 0) / totalEmployees) * 100),
          label: "Scheduled Off",
        },
      };
    }

    return {
      notYetIn: {
        count: summary?.not_yet_in ?? sections.primarySection.length,
        percentage: Math.round(((summary?.not_yet_in ?? 0) / totalEmployees) * 100),
        label: isTodayValue ? "Employees Are Not Yet In" : "Employees Are Absent",
      },
      lateArrivals: {
        count: summary?.late_arrivals ?? sections.late.length,
        percentage: Math.round(((summary?.late_arrivals ?? 0) / totalEmployees) * 100),
        label: isPast ? "Late Arrivals" : "Late Arrivals Today",
      },
      onTime: {
        count: summary?.on_time ?? sections.onTime.length,
        percentage: Math.round(((summary?.on_time ?? 0) / totalEmployees) * 100),
        label: isPast ? "Present (On Time)" : "On Time Today",
      },
      outOfOffice: {
        count: summary?.out_of_office ?? sections.ooo.length,
        percentage: Math.round(((summary?.out_of_office ?? 0) / totalEmployees) * 100),
        label: "Out Of Office",
      },
    };
  }, [sections, summary, totalEmployees, isTodayValue, isFuture, isPast]);

  const loadError =
    summaryQuery.error ?? notInQuery.error ?? lateQuery.error ?? onTimeQuery.error;
  const loadErrorMessage = loadError ? formatAttendanceError(loadError) : null;
  const sessionExpired =
    loadError instanceof AttendanceApiError && loadError.status === 401;
  const isLoading = summaryQuery.isLoading && notInQuery.isLoading;

  return (
    <div className="flex flex-col h-full bg-background/50 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white/75 dark:bg-white/5 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/10 px-6 py-4 space-y-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Home className="w-3 h-3" />
                <ChevronRight className="w-3 h-3" />
                <span>Attendance</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-primary">Who's In?</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Who's In?</h2>
            </div>

            {/* Classic Date Picker Field - Fixed & Fully Functional */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-[240px] h-11 px-4 flex items-center justify-between rounded-xl border transition-all duration-200 outline-none",
                      "border-gray-200 dark:border-white/10 shadow-sm cursor-pointer",
                      "bg-white/80 dark:bg-white/10 backdrop-blur-md",
                      "text-gray-900 dark:text-gray-100 font-semibold text-sm",
                      "hover:border-emerald-500/50 hover:shadow-emerald-500/5 hover:bg-white",
                      "focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                    )}
                  >
                    <span>{format(filters.date, "dd MMM yyyy")}</span>
                    <CalendarIcon className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-black/[0.08] dark:border-white/10 shadow-2xl z-[100]" align="start" sideOffset={8}>
                  <Calendar
                    mode="single"
                    selected={filters.date}
                    onSelect={(d) => {
                      if (d) {
                        setFilters(f => ({ ...f, date: d }));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-3">
              {/* {isTodayValue && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 shadow-sm">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Live Monitoring</span>
                </div>
              )}
               */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg border-black/[0.08] dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 shadow-sm transition-all" 
                  onClick={handleRefresh}
                >
                  <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-primary")} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 gap-2 font-bold text-[11px] px-4 rounded-lg border-black/[0.08] dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-primary" /> EXPORT
                </Button>
              </div>
            </div>

            {isFuture && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Future Schedule Mode</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar Filters - 300px width */}
        <div className="p-6 border-r border-black/[0.05] dark:border-white/5 overflow-y-auto no-scrollbar">
          <AttendanceFilterPanel 
            filters={filters} 
            setFilters={setFilters} 
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar pb-24 bg-black/[0.01] dark:bg-white/[0.01]">
          {loadErrorMessage && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
              <div className="flex items-center gap-2 flex-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loadErrorMessage}</span>
              </div>
              {sessionExpired && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-destructive/40"
                  onClick={() => logout()}
                >
                  Sign in again
                </Button>
              )}
            </div>
          )}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading who&apos;s in data…</span>
            </div>
          )}
          <AttendanceAnalyticsHeader stats={stats} />

          {/* 2x2 Grid of Status Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* Section 1: Primary (Not Yet In / Absent / Scheduled) */}
            <div className="flex flex-col bg-white/50 dark:bg-black/10 border border-black/[0.05] dark:border-white/5 rounded-3xl overflow-hidden shadow-sm h-[620px] transition-all hover:shadow-md">
              <div className="p-5 border-b border-black/[0.05] dark:border-white/5 bg-white/80 dark:bg-black/40 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
                    <Users className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-foreground">
                      {isFuture ? "Scheduled Shifts" : (isTodayValue ? "Not Yet In" : "Absent")}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium">{sections.primarySection.length} employees</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 auto-rows-max no-scrollbar">
                {sections.primarySection.length > 0 ? (
                  sections.primarySection.map(r => (
                    <EmployeeAttendanceCard 
                      key={r.id} 
                      record={r} 
                      type={isFuture ? "not-yet-in" : (isTodayValue ? "not-yet-in" : "absent")} 
                    />
                  ))
                ) : (
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-10 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No records found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Late Arrivals */}
            {!isFuture && (
              <div className="flex flex-col bg-white/50 dark:bg-black/10 border border-black/[0.05] dark:border-white/5 rounded-3xl overflow-hidden shadow-sm h-[620px] transition-all hover:shadow-md">
                <div className="p-5 border-b border-black/[0.05] dark:border-white/5 bg-white/80 dark:bg-black/40 flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                      <RefreshCw className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-foreground">Late Arrivals</h3>
                      <p className="text-[11px] text-muted-foreground font-medium">{sections.late.length} employees</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 auto-rows-max no-scrollbar">
                  {sections.late.length > 0 ? (
                    sections.late.map(r => <EmployeeAttendanceCard key={r.id} record={r} type="late" />)
                  ) : (
                    <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-10 opacity-60">
                      <p className="text-sm font-medium text-muted-foreground">Clean slate! No late arrivals.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: On Time */}
            {!isFuture && (
              <div className="flex flex-col bg-white/50 dark:bg-black/10 border border-black/[0.05] dark:border-white/5 rounded-3xl overflow-hidden shadow-sm h-[620px] transition-all hover:shadow-md">
                <div className="p-5 border-b border-black/[0.05] dark:border-white/5 bg-white/80 dark:bg-black/40 flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-inner">
                      <Map className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-foreground">
                        {isPast ? "Present (On Time)" : "On Time Today"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-medium">{sections.onTime.length} employees</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 auto-rows-max no-scrollbar">
                  {sections.onTime.length > 0 ? (
                    sections.onTime.map(r => <EmployeeAttendanceCard key={r.id} record={r} type="on-time" />)
                  ) : (
                    <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-10 opacity-60">
                      <p className="text-sm font-medium text-muted-foreground">Waiting for arrivals...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 4: Out Of Office */}
            <div className="flex flex-col bg-white/50 dark:bg-black/10 border border-black/[0.05] dark:border-white/5 rounded-3xl overflow-hidden shadow-sm h-[620px] transition-all hover:shadow-md">
              <div className="p-5 border-b border-black/[0.05] dark:border-white/5 bg-white/80 dark:bg-black/40 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                    <Download className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-foreground">Out Of Office</h3>
                    <p className="text-[11px] text-muted-foreground font-medium">{sections.ooo.length} employees</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="all" onValueChange={setOooTab} className="w-full flex-1 flex flex-col">
                  <div className="px-5 py-3 border-b border-black/[0.05] dark:border-white/5 bg-white/40 dark:bg-black/60">
                    <TabsList className="bg-black/5 dark:bg-white/5 h-9 p-1 rounded-lg w-full flex">
                      <TabsTrigger value="all" className="flex-1 text-[10px] font-bold">All</TabsTrigger>
                      <TabsTrigger value="Leave" className="flex-1 text-[10px] font-bold">Leave</TabsTrigger>
                      <TabsTrigger value="Holiday" className="flex-1 text-[10px] font-bold">Holiday</TabsTrigger>
                      <TabsTrigger value="Week Off" className="flex-1 text-[10px] font-bold">Off</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value={oooTab} className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 auto-rows-max no-scrollbar m-0">
                    {sections.ooo.filter(r => oooTab === "all" || r.status === oooTab).length > 0 ? (
                      sections.ooo.filter(r => oooTab === "all" || r.status === oooTab).map(r => <EmployeeAttendanceCard key={r.id} record={r} type="ooo" />)
                    ) : (
                      <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-10 opacity-60">
                        <p className="text-sm font-medium text-muted-foreground">No employees in this category.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
