import { useState, useMemo, useEffect } from "react";
import { ChevronRight, Home, RefreshCw, Download, Calendar as CalendarIcon, MapPin, Users, CheckCircle, Info } from "lucide-react";
import { AttendanceFilterPanel } from "../../../components/attendance/whos-in/AttendanceFilterPanel";
import { AttendanceAnalyticsHeader } from "../../../components/attendance/whos-in/AttendanceAnalyticsHeader";
import { EmployeeAttendanceCard } from "../../../components/attendance/whos-in/EmployeeAttendanceCard";
import { Button } from "../../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import { MOCK_ATTENDANCE } from "../../../modules/attendance/mockData";
import { isSameDay, isBefore, isAfter, startOfDay, format, parseISO } from "date-fns";
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

  const isTodayValue = useMemo(() => isSameDay(filters.date, new Date()), [filters.date]);
  const isPast = useMemo(() => isBefore(startOfDay(filters.date), startOfDay(new Date())), [filters.date]);
  const isFuture = useMemo(() => isAfter(startOfDay(filters.date), startOfDay(new Date())), [filters.date]);

  // Simulation of real-time refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  useEffect(() => {
    if (isTodayValue) {
      const interval = setInterval(handleRefresh, 45000);
      return () => clearInterval(interval);
    }
  }, [isTodayValue]);

  // Comprehensive Filter Logic
  const filteredData = useMemo(() => {
    const selectedDateStr = format(filters.date, "yyyy-MM-dd");
    
    return MOCK_ATTENDANCE.filter(record => {
      const isDay = record.date === selectedDateStr;
      
      const matchesShift = filters.shift === "all" || record.shiftName === filters.shift;
      const matchesDept = filters.department === "all" || record.department === filters.department;
      const matchesDesig = filters.designation === "all" || record.designation === filters.designation;
      const matchesTeam = filters.team === "all" || record.team === filters.team;
      const matchesWorkMode = filters.workMode === "all" || record.workMode === filters.workMode;
      const matchesSearch = !filters.search || 
        record.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.email?.toLowerCase().includes(filters.search.toLowerCase());

      return isDay && matchesShift && matchesDept && matchesDesig && matchesTeam && matchesWorkMode && matchesSearch;
    });
  }, [filters]);

  // Section Data Calculation
  const sections = useMemo(() => {
    if (isFuture) {
      return { 
        primarySection: filteredData, 
        late: [], 
        onTime: [], 
        ooo: filteredData.filter(r => r.status === "Week Off" || r.status === "Holiday") 
      };
    }

    if (isPast) {
      // Past categories: Present, Late, Absent, OOO
      const present = filteredData.filter(r => r.status === "Present" && !r.isLate);
      const late = filteredData.filter(r => r.isLate);
      const absent = filteredData.filter(r => r.status === "Absent" && !r.leaveType);
      const ooo = filteredData.filter(r => r.status === "Leave" || r.status === "Holiday" || r.status === "Week Off");
      
      return { primarySection: absent, late, onTime: present, ooo };
    }

    // Today categories
    const notYetIn = filteredData.filter(r => r.status === "Absent" && !r.leaveType);
    const late = filteredData.filter(r => r.isLate);
    const onTime = filteredData.filter(r => r.status === "Present" && !r.isLate);
    const ooo = filteredData.filter(r => r.status === "Leave" || r.status === "Holiday" || r.status === "Week Off");

    return { primarySection: notYetIn, late, onTime, ooo };
  }, [filteredData, isFuture, isPast]);

  // Stats for Header
  const stats = useMemo(() => {
    const total = filteredData.length || 1;
    
    if (isFuture) {
      return {
        notYetIn: { count: filteredData.length, percentage: 100, label: "Scheduled Employees" },
        lateArrivals: { count: 0, percentage: 0, label: "No Punches Yet" },
        onTime: { count: 0, percentage: 0, label: "No Punches Yet" },
        outOfOffice: { count: sections.ooo.length, percentage: Math.round((sections.ooo.length / total) * 100), label: "Scheduled Off" },
      };
    }

    return {
      notYetIn: { 
        count: sections.primarySection.length, 
        percentage: Math.round((sections.primarySection.length / total) * 100),
        label: isTodayValue ? "Employees Are Not Yet In" : "Employees Are Absent"
      },
      lateArrivals: { 
        count: sections.late.length, 
        percentage: Math.round((sections.late.length / total) * 100),
        label: isPast ? "Late Arrivals" : "Late Arrivals Today"
      },
      onTime: { 
        count: sections.onTime.length, 
        percentage: Math.round((sections.onTime.length / total) * 100),
        label: isPast ? "Present (On Time)" : "On Time Today"
      },
      outOfOffice: { 
        count: sections.ooo.length, 
        percentage: Math.round((sections.ooo.length / total) * 100),
        label: "Out Of Office"
      },
    };
  }, [sections, filteredData, isTodayValue, isFuture, isPast]);

  return (
    <div className="flex flex-col h-full bg-background/50 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white/75 dark:bg-white/5 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/10 px-4 py-3 space-y-3 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                <Home className="w-2.5 h-2.5" />
                <ChevronRight className="w-2.5 h-2.5" />
                <span>Attendance</span>
                <ChevronRight className="w-2.5 h-2.5" />
                <span className="text-primary">Who's In?</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Who's In?</h2>
            </div>

            {/* Classic Date Picker Field - Fixed & Fully Functional */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Select Date:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-[160px] h-8 px-3 flex items-center justify-between rounded-lg border transition-all duration-200 outline-none",
                      "border-gray-200 dark:border-white/10 shadow-sm cursor-pointer",
                      "bg-white/80 dark:bg-white/10 backdrop-blur-md",
                      "text-gray-900 dark:text-gray-100 font-semibold text-[11px]",
                      "hover:border-emerald-500/50 hover:shadow-emerald-500/5 hover:bg-white",
                      "focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                    )}
                  >
                    <span>{format(filters.date, "dd MMM yyyy")}</span>
                    <CalendarIcon className="h-3 w-3 text-gray-400 group-hover:text-emerald-500 transition-colors shrink-0" />
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg border-black/[0.08] dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 shadow-sm transition-all" 
                  onClick={handleRefresh}
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-primary")} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1.5 font-bold text-[10px] px-3 rounded-lg border-black/[0.08] dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 shadow-sm transition-all"
                >
                  <Download className="w-3 h-3 text-primary" /> EXPORT
                </Button>
              </div>
            </div>

            {isFuture && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <Info className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Future Schedule Mode</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar Filters - 260px width for more compactness */}
        <div className="w-[260px] p-4 border-r border-black/[0.05] dark:border-white/5 overflow-y-auto no-scrollbar shrink-0">
          <AttendanceFilterPanel 
            filters={filters} 
            setFilters={setFilters} 
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar pb-12 bg-black/[0.01] dark:bg-white/[0.01]">
          <AttendanceAnalyticsHeader stats={stats} />

          {/* 2x2 Grid of Status Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            
            {/* Section 1: Primary (Not Yet In / Absent / Scheduled) */}
            <div className="flex flex-col bg-white/50 dark:bg-black/10 border border-black/[0.05] dark:border-white/5 rounded-2xl overflow-hidden shadow-sm h-[400px] transition-all hover:shadow-md">
              <div className="p-3 border-b border-black/[0.05] dark:border-white/5 bg-white/80 dark:bg-black/40 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
                    <Users className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-foreground">
                      {isFuture ? "Scheduled Shifts" : (isTodayValue ? "Not Yet In" : "Absent")}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-medium">{sections.primarySection.length} employees</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max no-scrollbar">
                {sections.primarySection.length > 0 ? (
                  sections.primarySection.map(r => (
                    <EmployeeAttendanceCard 
                      key={r.id} 
                      record={r} 
                      type={isFuture ? "not-yet-in" : (isTodayValue ? "not-yet-in" : "absent")} 
                    />
                  ))
                ) : (
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                    <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                      <CheckCircle className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">No records found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Late Arrivals */}
            {!isFuture && (
              <div className="flex flex-col bg-white/50 dark:bg-black/10 border border-black/[0.05] dark:border-white/5 rounded-2xl overflow-hidden shadow-sm h-[400px] transition-all hover:shadow-md">
                <div className="p-3 border-b border-black/[0.05] dark:border-white/5 bg-white/80 dark:bg-black/40 flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                      <RefreshCw className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-bold text-foreground">Late Arrivals</h3>
                      <p className="text-[10px] text-muted-foreground font-medium">{sections.late.length} employees</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max no-scrollbar">
                  {sections.late.length > 0 ? (
                    sections.late.map(r => <EmployeeAttendanceCard key={r.id} record={r} type="late" />)
                  ) : (
                    <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                      <p className="text-xs font-medium text-muted-foreground">Clean slate! No late arrivals.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: On Time */}
            {!isFuture && (
              <div className="flex flex-col bg-white/50 dark:bg-black/10 border border-black/[0.05] dark:border-white/5 rounded-2xl overflow-hidden shadow-sm h-[400px] transition-all hover:shadow-md">
                <div className="p-3 border-b border-black/[0.05] dark:border-white/5 bg-white/80 dark:bg-black/40 flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-inner">
                      <MapPin className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-bold text-foreground">
                        {isPast ? "Present (On Time)" : "On Time Today"}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-medium">{sections.onTime.length} employees</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max no-scrollbar">
                  {sections.onTime.length > 0 ? (
                    sections.onTime.map(r => <EmployeeAttendanceCard key={r.id} record={r} type="on-time" />)
                  ) : (
                    <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                      <p className="text-xs font-medium text-muted-foreground">Waiting for arrivals...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 4: Out Of Office */}
            <div className="flex flex-col bg-white/50 dark:bg-black/10 border border-black/[0.05] dark:border-white/5 rounded-2xl overflow-hidden shadow-sm h-[400px] transition-all hover:shadow-md">
              <div className="p-3 border-b border-black/[0.05] dark:border-white/5 bg-white/80 dark:bg-black/40 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                    <Download className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-foreground">Out Of Office</h3>
                    <p className="text-[10px] text-muted-foreground font-medium">{sections.ooo.length} employees</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="all" onValueChange={setOooTab} className="w-full flex-1 flex flex-col">
                  <div className="px-3 py-2 border-b border-black/[0.05] dark:border-white/5 bg-white/40 dark:bg-black/60">
                    <TabsList className="bg-black/5 dark:bg-white/5 h-8 p-1 rounded-lg w-full flex">
                      <TabsTrigger value="all" className="flex-1 text-[9px] font-bold">All</TabsTrigger>
                      <TabsTrigger value="Leave" className="flex-1 text-[9px] font-bold">Leave</TabsTrigger>
                      <TabsTrigger value="Holiday" className="flex-1 text-[9px] font-bold">Holiday</TabsTrigger>
                      <TabsTrigger value="Week Off" className="flex-1 text-[9px] font-bold">Off</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value={oooTab} className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-max no-scrollbar m-0">
                    {sections.ooo.filter(r => oooTab === "all" || r.status === oooTab).length > 0 ? (
                      sections.ooo.filter(r => oooTab === "all" || r.status === oooTab).map(r => <EmployeeAttendanceCard key={r.id} record={r} type="ooo" />)
                    ) : (
                      <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                        <p className="text-xs font-medium text-muted-foreground">No employees in this category.</p>
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
