import { AttendanceCalendarAdvanced } from "./AttendanceCalendarAdvanced";
import { AttendanceCharts } from "./AttendanceCharts";
import { AttendanceFilters } from "./AttendanceFilters";
import { AttendanceSummaryCards } from "./AttendanceSummaryCards";
import { AttendanceTable } from "./AttendanceTable";
import { DayDetailsDrawer } from "./DayDetailsDrawer";
import { ExceptionsPanel } from "./ExceptionsPanel";
import { RequestsManager } from "./RequestsManager";
import { useAttendanceStore } from "../../modules/attendance/store";

export function AttendanceModule() {
  const { view, setView } = useAttendanceStore();

  return (
    <div className="p-6 space-y-4 glassmorph">
      <AttendanceSummaryCards />
      <AttendanceFilters />
      <AttendanceCharts />
      <div className="flat-card glassmorph-card bg-card p-3 flex items-center justify-between glass-shine">
        <p className="text-sm font-semibold text-foreground">Attendance Records</p>
        <div className="flex gap-2">
          <button onClick={() => setView("calendar")} className={`h-8 px-3 text-xs rounded border ${view === "calendar" ? "bg-secondary border-border" : "border-border"}`}>Calendar View</button>
          <button onClick={() => setView("list")} className={`h-8 px-3 text-xs rounded border ${view === "list" ? "bg-secondary border-border" : "border-border"}`}>List View</button>
        </div>
      </div>

      {view === "calendar" ? <AttendanceCalendarAdvanced /> : <AttendanceTable />}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ExceptionsPanel />
        <RequestsManager />
      </div>
      <div className="flat-card glassmorph-card bg-card p-4 flex items-center justify-between glass-shine">
        <p className="text-sm text-foreground font-semibold">Lock & Payroll Controls</p>
        <div className="flex gap-2">
          <button className="h-8 px-3 text-xs border border-border rounded">Lock Range 1-15 May</button>
          <button className="h-8 px-3 text-xs border border-border rounded">Unlock 16-31 May</button>
          <button className="h-8 px-3 text-xs border border-border rounded">View Audit Trail</button>
        </div>
      </div>
      <DayDetailsDrawer />
    </div>
  );
}
