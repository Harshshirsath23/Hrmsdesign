import { useState, useMemo, useEffect } from "react";
import { ChevronRight, Home, RefreshCw, Download, Calendar as CalendarIcon, MapPin, Users, CheckCircle, Info } from "lucide-react";
import { AttendanceFilterPanel } from "../../../components/attendance/whos-in/AttendanceFilterPanel";
import { AttendanceAnalyticsHeader } from "../../../components/attendance/whos-in/AttendanceAnalyticsHeader";
import { EmployeeAttendanceCard } from "../../../components/attendance/whos-in/EmployeeAttendanceCard";
import { Button } from "../../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import { isSameDay, isBefore, isAfter, startOfDay, format } from "date-fns";
import { useWhoIsInEmployees, useWhoIsInSummary } from "../../../modules/attendance/hooks";
import { AlertCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { cn } from "../../../components/ui/utils";

export function WhosInPage() {
  const [filters, setFilters] = useState({
    date: new Date(),
    shift: "all",
    department: "all",
    designation: "all",
    team: "all",
    workMode: "all",
    search: "",
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [oooTab, setOooTab] = useState("all");

  const { data: summaryStats, refetch: refetchSummary, isError: summaryError, error: summaryErr } =
    useWhoIsInSummary(filters.date);
  const { data: notYetIn = [], refetch: refetchNotIn, isLoading: loadingNotIn } =
    useWhoIsInEmployees(filters.date, "NOT_IN", filters.search);
  const { data: late = [], refetch: refetchLate, isLoading: loadingLate } =
    useWhoIsInEmployees(filters.date, "LATE", filters.search);
  const { data: onTime = [], refetch: refetchOnTime, isLoading: loadingOnTime } =
    useWhoIsInEmployees(filters.date, "ON_TIME", filters.search);
  const { data: ooo = [], refetch: refetchOoo, isLoading: loadingOoo } =
    useWhoIsInEmployees(filters.date, "OUT_OF_OFFICE", filters.search);

  const isTodayValue = useMemo(() => isSameDay(filters.date, new Date()), [filters.date]);
  const isPast = useMemo(() => isBefore(startOfDay(filters.date), startOfDay(new Date())), [filters.date]);
  const isFuture = useMemo(() => isAfter(startOfDay(filters.date), startOfDay(new Date())), [filters.date]);

  // Simulation of real-time refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchSummary(), refetchNotIn(), refetchLate(), refetchOnTime(), refetchOoo()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isTodayValue) {
      const interval = setInterval(handleRefresh, 45000);
      return () => clearInterval(interval);
    }
  }, [isTodayValue]);

  const sections = useMemo(() => {
    if (isFuture) {
      return { primarySection: [], late: [], onTime: [], ooo: [] };
    }
    return {
      primarySection: notYetIn,
      late,
      onTime,
      ooo,
    };
  }, [notYetIn, late, onTime, ooo, isFuture]);

  const totalEmployees = Math.max(
    1,
    (summaryStats?.notYetIn ?? 0) +
      (summaryStats?.lateIn ?? 0) +
      (summaryStats?.onTime ?? 0) +
      (summaryStats?.outOfOffice ?? 0),
  );

  const stats = useMemo(() => {
    if (summaryStats) {
      return {
        notYetIn: {
          count: summaryStats.notYetIn,
          percentage: Math.round((summaryStats.notYetIn / totalEmployees) * 100),
          label: isTodayValue ? "Employees Are Not Yet In" : "Employees Are Absent",
        },
        lateArrivals: {
          count: summaryStats.lateIn,
          percentage: Math.round((summaryStats.lateIn / totalEmployees) * 100),
          label: isPast ? "Late Arrivals" : "Late Arrivals Today",
        },
        onTime: {
          count: summaryStats.onTime,
          percentage: Math.round((summaryStats.onTime / totalEmployees) * 100),
          label: isPast ? "Present (On Time)" : "On Time Today",
        },
        outOfOffice: {
          count: summaryStats.outOfOffice,
          percentage: Math.round((summaryStats.outOfOffice / totalEmployees) * 100),
          label: "Out Of Office",
        },
      };
    }
    return {
      notYetIn: { count: notYetIn.length, percentage: 0, label: "Not Yet In" },
      lateArrivals: { count: late.length, percentage: 0, label: "Late" },
      onTime: { count: onTime.length, percentage: 0, label: "On Time" },
      outOfOffice: { count: ooo.length, percentage: 0, label: "Out Of Office" },
    };
  }, [summaryStats, notYetIn.length, late.length, onTime.length, ooo.length, totalEmployees, isTodayValue, isPast]);

  const apiLoading = loadingNotIn || loadingLate || loadingOnTime || loadingOoo;

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
          {summaryError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {summaryErr instanceof Error ? summaryErr.message : "Failed to load Who's In data."}
            </div>
          )}
          {apiLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading employees…
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
                      <MapPin className="w-5 h-5 text-green-500" />
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
