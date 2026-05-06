import { useState } from "react";
import { Clock, CalendarDays, AlertCircle, LogIn, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { employees } from "../../components/employees/mockData";
import { attendanceRecords } from "../../components/employees/mockAdminData";

const STATUS_BADGE: Record<string, string> = {
  Present:    "bg-[#212529] text-[#F8F9FA]",
  "On Leave": "bg-[#E9ECEF] text-[#212529] border border-[#DEE2E6]",
  "Half Day": "bg-[#6C757D] text-white",
  Absent:     "bg-[#CED4DA] text-[#212529]",
};

export function EmployeeAttendancePage() {
  const { user } = useAuth();
  const [month, setMonth] = useState("May 2026");

  const emp          = employees.find((e) => e.id === user?.employeeId) || employees[0];
  const myAttendance = attendanceRecords.filter((a) => a.employeeId === emp.employeeId);

  const presentDays  = myAttendance.filter((r) => r.status === "Present").length;
  const leaveDays    = myAttendance.filter((r) => r.status === "On Leave").length;
  const lateDays     = myAttendance.filter((r) => r.status === "Half Day").length;

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flat-card bg-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Attendance Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Your check-in history and time logs</p>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="flat-input text-sm px-3 py-2 cursor-pointer appearance-none font-medium self-start md:self-auto"
        >
          <option>May 2026</option>
          <option>April 2026</option>
          <option>March 2026</option>
        </select>
      </div>

      {/* ── Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Clock,         label: "Present Days", value: presentDays },
          { icon: CalendarDays,  label: "Leave Taken",  value: leaveDays  },
          { icon: AlertCircle,   label: "Late / Half",  value: lateDays   },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flat-card flat-card-hover bg-card p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ───────────────────────────────────────── */}
      <div className="flat-card bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary border-b border-border">
                {["Date", "Status", "Check In", "Check Out", "Total Hours"].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {myAttendance.map((record, i) => (
                <tr key={i} className="hover:bg-secondary transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {new Date(record.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium ${STATUS_BADGE[record.status] || ""}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {record.checkIn !== "—" ? (
                      <div className="flex items-center gap-1.5">
                        <LogIn className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-foreground">{record.checkIn}</span>
                      </div>
                    ) : <span className="text-sm text-muted-foreground">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    {record.checkOut !== "—" ? (
                      <div className="flex items-center gap-1.5">
                        <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-foreground">{record.checkOut}</span>
                      </div>
                    ) : <span className="text-sm text-muted-foreground">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {record.checkIn !== "—" && record.checkOut !== "—" ? record.hoursWorked : "—"}
                  </td>
                </tr>
              ))}
              {myAttendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                    No attendance records for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
