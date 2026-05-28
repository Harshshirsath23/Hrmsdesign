import { useState, useMemo, useEffect, useCallback, memo } from "react";
import {
  Download,
  Upload,
  RefreshCw,
  Home,
  ChevronRight,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Building2,
  Users,
  Briefcase,
  Zap,
  Edit2,
  Lock,
  Unlock,
  Eye,
  FileText,
  SlidersHorizontal,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  History,
  TrendingUp,
  X,
  Plus,
  Save,
  Check,
  Trash2
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { KebabMenu } from "../../../components/ui/KebabMenu";
import { useEmployee } from "../../../context/EmployeeContext";
import * as XLSX from "xlsx";
import { MOCK_EMPLOYEES } from "../../../modules/attendance/mockData";
import {
  useMatrixDepartments,
  useMatrixGrid,
  useMatrixImport,
  useMatrixLive,
  useMatrixSummary,
  useUpdateMatrixDayStatus,
} from "../../../modules/attendance/hooks";
import { parseISO } from "date-fns";
import { cn } from "../../../components/ui/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "../../../components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../../../components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "../../../components/ui/sheet";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from "../../../components/ui/context-menu";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

// --- Types & Constants ---
const STATUS_CODES: any = {
  P: { label: "Present", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  A: { label: "Absent", color: "bg-red-100 text-red-700 border-red-200" },
  L: { label: "Leave", color: "bg-orange-100 text-orange-700 border-orange-200" },
  H: { label: "Holiday", color: "bg-purple-100 text-purple-700 border-purple-200" },
  WO: { label: "Week Off", color: "bg-slate-100 text-slate-500 border-slate-200" },
  HD: { label: "Half Day", color: "bg-amber-100 text-amber-700 border-amber-200" },
  CL: { label: "Casual Leave", color: "bg-orange-50 text-orange-600 border-orange-100" },
  SL: { label: "Sick Leave", color: "bg-rose-50 text-rose-600 border-rose-100" },
  OD: { label: "On Duty", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  WFH: { label: "Work From Home", color: "bg-blue-100 text-blue-700 border-blue-200" },
  OT: { label: "Overtime", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  MR: { label: "Missing Record", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

// --- Sub-components ---

const MatrixCell = memo(({ emp, day, onUpdate, onOpenDrawer }: any) => {
  const { selectEmployee } = useEmployee();
  const dateKey = format(day, "yyyy-MM-dd");
  const cellData = emp.attendance?.[dateKey] || { status: "MR" };
  const status = cellData.status || "MR";
  const config = STATUS_CODES[status] || STATUS_CODES.MR;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "w-full h-full min-h-[32px] rounded-md border flex items-center justify-center text-[10px] font-black cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 group relative overflow-hidden shadow-sm",
            config.color
          )}
        >
          {status}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 rounded-2xl shadow-2xl border-slate-200 bg-white/95 backdrop-blur-md z-[100]">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(day, "dd MMM yyyy")}</span>
              <span className="text-[9px] font-bold text-slate-400 truncate w-32">{emp.name}</span>
            </div>
            <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase", config.color)}>{config.label}</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {Object.keys(STATUS_CODES).slice(0, 12).map(code => (
              <button
                key={code}
                className={cn(
                  "h-8 flex items-center justify-center rounded-lg text-[10px] font-black border transition-all hover:scale-110 active:scale-90",
                  STATUS_CODES[code].color,
                  status === code ? "ring-2 ring-slate-900 ring-offset-1" : "opacity-60 hover:opacity-100"
                )}
                onClick={() => onUpdate(emp, dateKey, code)}
              >
                {code}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[10px] font-black gap-2 rounded-xl" onClick={() => selectEmployee(emp.id)}>
              <User className="w-3 h-3 text-blue-500" /> PROFILE
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-[10px] font-black gap-2 rounded-xl">
              <Plus className="w-3 h-3 text-emerald-500" /> REMARK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

const PersonalAttendanceCalendar = ({ emp, month }: any) => {
  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
        <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase py-1">{d}</div>
      ))}
      {Array.from({ length: days[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
      {days.map(day => {
        const dateKey = format(day, "yyyy-MM-dd");
        const cellData = emp.attendance?.[dateKey] || { status: "MR" };
        const config = STATUS_CODES[cellData.status] || STATUS_CODES.MR;
        return (
          <div key={dateKey} className={cn("aspect-square rounded-xl border flex flex-col items-center justify-center relative group transition-all hover:scale-105", config.color)}>
            <span className="text-[10px] font-black">{format(day, "d")}</span>
          </div>
        );
      })}
    </div>
  );
};

export function AttendanceMatrixPage() {
  const { selectEmployee } = useEmployee();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [liveMonitor, setLiveMonitor] = useState(true);

  // Grid Configuration State
  const [gridConfig, setGridConfig] = useState({
    density: "default",
    stickyEmployee: true,
    showSummaries: true
  });

  const [filters, setFilters] = useState({
    search: "",
    department: "all",
    designation: "all",
  });

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1;

  const gridQuery = useMatrixGrid({
    year,
    month,
    department_id: filters.department !== "all" ? filters.department : undefined,
    search: filters.search || undefined,
    page: currentPage,
    page_size: 25,
  });
  const summaryQuery = useMatrixSummary(year, month);
  const departmentsQuery = useMatrixDepartments();
  useMatrixLive(liveMonitor);
  const updateStatusMutation = useUpdateMatrixDayStatus();
  const importMutation = useMatrixImport();

  const data = gridQuery.data?.employees ?? [];
  const monthDays = useMemo(() => {
    if (gridQuery.data?.monthDays?.length) return gridQuery.data.monthDays;
    try {
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);
      return eachDayOfInterval({ start, end });
    } catch {
      return [];
    }
  }, [gridQuery.data, selectedMonth]);

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);

  const filteredData = data;

  const handleUpdateAttendance = useCallback(
    (emp: { id: string; name: string }, dateKey: string, newStatus?: string) => {
      if (!newStatus) {
        toast.info("Select a status from right-click menu");
        return;
      }
      updateStatusMutation.mutate(
        { employeeId: emp.id, date: dateKey, status_code: newStatus },
        {
          onSuccess: () => {
            toast.success(`Updated ${emp.name} to ${newStatus}`);
            gridQuery.refetch();
          },
          onError: (err) => toast.error((err as Error).message),
        },
      );
    },
    [updateStatusMutation, gridQuery],
  );

  const openDrawer = useCallback((emp: any) => {
    setSelectedEmployee(emp);
    setShowDrawer(true);
  }, []);

  // --- Excel Import/Export Logic ---
  const handleExport = async () => {
    const toastId = toast.loading("Exporting Attendance Matrix...");
    try {
      const exportRows = filteredData.map(emp => {
        const row: any = { "Employee": emp.name, "ID": emp.id, "Dept": emp.department };
        monthDays.forEach(day => {
          const key = format(day, "yyyy-MM-dd");
          row[format(day, "dd-MM-yyyy")] = emp.attendance[key]?.status || "MR";
        });
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");
      const fileName = `Attendance_Matrix_${format(selectedMonth, "MMM_yyyy")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.dismiss(toastId);
      toast.success("Excel exported successfully");
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Export failed");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading("Uploading matrix file…");

    importMutation.mutate(
      { file, year, month },
      {
        onSuccess: (res) => {
          toast.dismiss(toastId);
          setShowImportModal(false);
          setIsImporting(false);
          toast.success(res.message ?? `Import queued (job ${res.job_id})`);
          gridQuery.refetch();
        },
        onError: (err) => {
          toast.dismiss(toastId);
          setIsImporting(false);
          toast.error((err as Error).message);
        },
      },
    );
  };

  const confirmImport = () => {
    setImportPreview(null);
    gridQuery.refetch();
    toast.success("Import submitted — refresh grid when processing completes.");
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950/50 relative overflow-hidden">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 space-y-4 shadow-sm z-[40] sticky top-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Home className="w-3 h-3" />
              <ChevronRight className="w-3 h-3" />
              <span>Attendance</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-emerald-500 font-black">Attendance Matrix</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              Attendance Matrix
              {/* <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase">Live Monitor</span>
              </div> */}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-800 mr-2">
              <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold rounded-lg px-3" onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}>
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </Button>
              <span className="px-4 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase min-w-[120px] text-center">
                {format(selectedMonth, "MMMM yyyy")}
              </span>
              <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold rounded-lg px-3" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="h-10 gap-2 font-bold text-[11px] border-emerald-100 hover:bg-emerald-50 rounded-xl px-4" onClick={handleExport}>
              <Download className="w-3.5 h-3.5 text-emerald-500" /> EXPORT
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 font-bold text-[11px] border-blue-100 hover:bg-blue-50 rounded-xl px-4 bg-blue-50/30"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="w-3.5 h-3.5 text-blue-500" /> IMPORT EXCEL
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => {
                setIsRefreshing(true);
                Promise.all([gridQuery.refetch(), summaryQuery.refetch()]).finally(() =>
                  setIsRefreshing(false),
                );
              }}
            >
              <RefreshCw className={cn("w-4 h-4 text-slate-400", (isRefreshing || gridQuery.isFetching) && "animate-spin text-emerald-500")} />
            </Button>
            <KebabMenu
              items={[
                { label: "Matrix Settings", icon: SlidersHorizontal, onClick: () => toast.info("Opening matrix configuration...") },
                { label: "View Audit Trail", icon: History, onClick: () => toast.info("Loading audit trail...") },
                { label: "Lock Attendance", icon: Lock, onClick: () => toast.success("Attendance locked for this month") },
                {
                  label: "Reset Matrix", icon: Trash2, variant: "destructive", separator: true, onClick: () => {
                    if (confirm("Reset all manual updates for this month?")) toast.error("Matrix reset");
                  }
                },
              ]}
            />
          </div>
        </div>

        {/* Filter/Search Bar */}
        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 max-w-[350px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-xs shadow-inner"
              placeholder="Search by Employee Name, ID, or Dept..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="w-[180px]">
            <Select value={filters.department} onValueChange={v => setFilters({ ...filters, department: v })}>
              <SelectTrigger className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent font-bold text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {(departmentsQuery.data?.departments ?? []).map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-6 bg-slate-50/50">
        {/* Statistics Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Present"
            value={String(summaryQuery.data?.total_present ?? "—")}
            sub={summaryQuery.data ? `+${summaryQuery.data.present_change_today} Today` : ""}
            color="emerald"
            icon={<CheckCircle2 />}
          />
          <StatCard
            title="Total Absent"
            value={String(summaryQuery.data?.total_absent ?? "—")}
            sub={summaryQuery.data ? `${summaryQuery.data.absent_change_today} Change` : ""}
            color="red"
            icon={<XCircle />}
          />
          <StatCard
            title="On Leave"
            value={String(summaryQuery.data?.on_leave ?? "—")}
            sub={summaryQuery.data ? `${summaryQuery.data.leave_pending_count} Pending` : ""}
            color="orange"
            icon={<Calendar />}
          />
          <StatCard
            title="Holidays"
            value={String(summaryQuery.data?.holidays_remaining ?? "—")}
            sub={
              summaryQuery.data?.next_holiday_date
                ? `Next: ${format(parseISO(summaryQuery.data.next_holiday_date), "d MMM")}`
                : ""
            }
            color="purple"
            icon={<Zap />}
          />
          <StatCard
            title="Avg Hours"
            value={summaryQuery.data ? `${summaryQuery.data.avg_hours}h` : "—"}
            sub={
              summaryQuery.data
                ? `${Math.round((summaryQuery.data.avg_hours / summaryQuery.data.avg_hours_goal) * 100)}% Goal`
                : ""
            }
            color="blue"
            icon={<Clock />}
          />
          <StatCard
            title="Punctuality"
            value={summaryQuery.data ? `${summaryQuery.data.punctuality_percent}%` : "—"}
            sub={
              summaryQuery.data
                ? `${summaryQuery.data.punctuality_change >= 0 ? "+" : ""}${summaryQuery.data.punctuality_change}%`
                : ""
            }
            color="cyan"
            icon={<TrendingUp />}
          />
        </div>

        {/* Main Matrix Grid Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative group/matrix ring-1 ring-slate-200/50">
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 z-[30]">
                <tr className="bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                  <th className={cn(
                    "w-[240px] px-6 py-5 border-r border-slate-200 z-[35] bg-slate-50 transition-all duration-300",
                    gridConfig.stickyEmployee ? "sticky left-0 shadow-md" : "relative"
                  )}>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Employee Details</span>
                      <span className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Found {filteredData.length} records</span>
                    </div>
                  </th>
                  {monthDays.map((day, idx) => (
                    <th key={idx} className="w-[50px] text-center py-3 border-r border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "text-[14px] font-black leading-tight",
                          (day.getDay() === 0 || day.getDay() === 6) ? "text-red-400" : "text-slate-900 dark:text-slate-100"
                        )}>
                          {format(day, "dd")}
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                          {format(day, "EEE")}
                        </span>
                      </div>
                    </th>
                  ))}
                  {gridConfig.showSummaries && (
                    <th className="sticky right-0 z-[30] bg-slate-50 dark:bg-slate-800 w-[160px] px-4 py-4 text-center border-l border-slate-200 dark:border-slate-700 shadow-[-5px_0_15px_rgba(0,0,0,0.02)]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">P | A | L</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredData.map((emp, empIdx) => (
                  <tr key={emp.id} className={cn(
                    "group transition-all duration-200 border-b border-slate-100 dark:border-slate-800",
                    gridConfig.density === 'compact' ? 'h-10' : gridConfig.density === 'relaxed' ? 'h-20' : 'h-14',
                    "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  )}>
                    <td className={cn(
                      "z-[20] bg-white dark:bg-slate-900 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800 border-r border-slate-200 dark:border-slate-800 px-6 cursor-pointer transition-all duration-300",
                      gridConfig.stickyEmployee ? "sticky left-0 shadow-[5px_0_15px_rgba(0,0,0,0.02)]" : "relative shadow-none",
                      gridConfig.density === 'relaxed' ? 'py-5' : gridConfig.density === 'compact' ? 'py-1' : 'py-3'
                    )} onClick={() => selectEmployee(emp.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-[13px] font-black shadow-inner flex-shrink-0">
                          {emp.name?.[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 transition-colors">{emp.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                            {emp.id} • {emp.department}
                          </span>
                        </div>
                      </div>
                    </td>
                    {monthDays.map((day, dIdx) => (
                      <td key={dIdx} className="p-1 border-r border-slate-50 dark:border-slate-800">
                        <MatrixCell
                          emp={emp}
                          day={day}
                          onUpdate={handleUpdateAttendance}
                          onOpenDrawer={openDrawer}
                        />
                      </td>
                    ))}
                    {gridConfig.showSummaries && (
                      <td className="sticky right-0 z-[20] bg-white dark:bg-slate-900 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800 border-l border-slate-200 dark:border-slate-800 px-4 py-3 shadow-[-5px_0_15px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-around">
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] font-black text-emerald-600">{emp.summary?.P || 0}</span>
                            <div className="w-4 h-0.5 bg-emerald-100 rounded-full" />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] font-black text-red-600">{emp.summary?.A || 0}</span>
                            <div className="w-4 h-0.5 bg-red-100 rounded-full" />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] font-black text-orange-600">{emp.summary?.L || 0}</span>
                            <div className="w-4 h-0.5 bg-orange-100 rounded-full" />
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Legend & Settings Bar */}
          <div className="bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-xl px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Grid Legend:
              </span>
              {Object.entries(STATUS_CODES).slice(0, 8).map(([code, cfg]: any) => (
                <div key={code} className="flex items-center gap-2.5">
                  <div className={cn("w-6 h-6 rounded-lg border flex items-center justify-center text-[9px] font-black shadow-sm", cfg.color)}>
                    {code}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{cfg.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* --- Drawers & Modals --- */}

      {/* 1. Employee Details Drawer */}
      <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
        <SheetContent className="sm:max-w-[550px] p-0 border-l-0 overflow-y-auto no-scrollbar shadow-2xl">
          <SheetHeader className="p-0">
            <div className="bg-slate-900 p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 z-10">
                <Button variant="ghost" size="icon" className="text-white/30 hover:text-white" onClick={() => setShowDrawer(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-5">
                <div className="w-28 h-28 rounded-[40px] bg-emerald-500 border-4 border-white/10 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-[34px] bg-white flex items-center justify-center text-3xl font-black text-emerald-600">
                    {selectedEmployee?.name?.[0]}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{selectedEmployee?.name}</h3>
                  <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mt-1 opacity-80">{selectedEmployee?.id} • {selectedEmployee?.designation}</p>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex flex-col items-center px-4 border-r border-white/10">
                    <span className="text-xl font-black text-white">92%</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">On Time</span>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <span className="text-xl font-black text-white">22</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Present</span>
                  </div>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="p-8 space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-500" /> {selectedEmployee?.department}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employment</p>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-500" /> Full Time Regular</p>
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-500" /> Monthly Attendance Map
              </h4>
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-inner">
                <PersonalAttendanceCalendar emp={selectedEmployee} month={selectedMonth} />
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <History className="w-4 h-4 text-blue-500" /> Change Logs
              </h4>
              <div className="space-y-4">
                {selectedEmployee?.attendance?.[format(new Date(2026, 4, 11), "yyyy-MM-dd")]?.history?.map((log: any, i: number) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div className="w-px flex-1 bg-slate-100 mt-2" />
                    </div>
                    <div className="flex-1 space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black text-slate-800">{log.action}</p>
                        <span className="text-[10px] font-bold text-slate-400">{log.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                        From <span className="font-black text-slate-400">{log.from}</span> to <span className="font-black text-emerald-600">{log.to}</span> by <span className="text-blue-600 font-bold">{log.user}</span>
                      </p>
                    </div>
                  </div>
                )) || <p className="text-[11px] text-slate-400 italic text-center py-4">No recent history for this month</p>}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 2. Excel Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-[500px] rounded-[40px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-blue-600 p-8 text-center space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="grid grid-cols-8 gap-4 p-4">
                {Array.from({ length: 32 }).map((_, i) => <div key={i} className="aspect-square bg-white rounded-lg rotate-12" />)}
              </div>
            </div>
            <Upload className="w-12 h-12 text-white mx-auto relative z-10" />
            <h3 className="text-xl font-bold text-white relative z-10">Import Attendance Data</h3>
            <p className="text-[11px] text-blue-100 font-medium opacity-80 relative z-10 uppercase tracking-widest">Upload XLSX or XLS formatted template</p>
          </div>
          <div className="p-8 space-y-6">
            <div
              className="py-12 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center space-y-4 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-500 transition-all cursor-pointer group"
              onClick={() => document.getElementById('excel-upload')?.click()}
            >
              <input
                type="file"
                id="excel-upload"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-900">Drop your file here or browse</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Support XLSX, XLS (MAX. 5MB)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold text-slate-500" onClick={() => setShowImportModal(false)}>CANCEL</Button>
              <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg" onClick={() => document.getElementById('excel-upload')?.click()}>
                {isImporting ? "PROCESSING..." : "SELECT FILE"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. Final Confirmation Dialog */}
      <Dialog open={!!importPreview} onOpenChange={(open) => !open && setImportPreview(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-[40px] p-8 border-0 shadow-2xl">
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Review & Confirm Changes</h3>
              <p className="text-[11px] text-slate-500 font-medium px-4">
                We parsed the Excel file and found matches for <span className="text-emerald-600 font-black">{importPreview?.length} employees</span>.
                Are you sure you want to proceed with the update?
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> SUMMARY OF UPDATES
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Matched Records</p>
                  <p className="text-lg font-black text-emerald-600">{importPreview?.length}</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Target Period</p>
                  <p className="text-lg font-black text-blue-600">{format(selectedMonth, "MMM yyyy")}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 leading-tight">
                  * This action will override existing attendance records for matched dates and create history logs for each change.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-bold text-slate-500" onClick={() => setImportPreview(null)}>ABORT</Button>
              <Button className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-xl" onClick={confirmImport}>
                YES, CONFIRM UPDATE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, sub, icon, color }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
  };
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-[28px] shadow-sm space-y-4 transition-all cursor-default relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-bl-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("p-2.5 rounded-2xl border", colors[color])}>
          {icon && typeof icon === 'object' ? { ...icon, props: { ...icon.props, className: "w-5 h-5" } } : icon}
        </div>
        <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</span>
      </div>
      <div className="relative z-10 space-y-0.5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className={cn("text-[10px] font-bold", color === 'red' ? 'text-red-400' : 'text-emerald-500')}>{sub}</p>
      </div>
    </motion.div>
  );
}

