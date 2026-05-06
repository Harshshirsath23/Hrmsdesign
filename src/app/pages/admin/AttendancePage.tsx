import { useState } from "react";
import { Clock, UserCheck, UserX, CalendarOff, Minus, Download } from "lucide-react";
import { attendanceRecords, AttendanceRecord, AttendanceStatus } from "../../components/employees/mockAdminData";

/* Status badge config — strictly within monochrome palette */
const STATUS_CONFIG: Record<AttendanceStatus, { dot: string; badge: string }> = {
  Present:    { dot: "bg-[#212529]", badge: "bg-[#212529] text-[#F8F9FA]"   },
  Absent:     { dot: "bg-[#ADB5BD]", badge: "bg-[#CED4DA] text-[#212529]"   },
  "Half Day": { dot: "bg-[#6C757D]", badge: "bg-[#6C757D] text-[#F8F9FA]"   },
  "On Leave": { dot: "bg-[#495057]", badge: "bg-[#E9ECEF] text-[#212529] border border-[#DEE2E6]" },
};

const DATES = [...new Set(attendanceRecords.map((r) => r.date))].sort().reverse();

export function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | "All">("All");
  const [search, setSearch] = useState("");

  const records  = attendanceRecords.filter((r) => r.date === selectedDate);
  const filtered = records.filter((r) => {
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    const matchSearch = !search || r.employeeName.toLowerCase().includes(search.toLowerCase()) || r.employeeId.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    present: records.filter((r) => r.status === "Present").length,
    absent:  records.filter((r) => r.status === "Absent").length,
    halfDay: records.filter((r) => r.status === "Half Day").length,
    onLeave: records.filter((r) => r.status === "On Leave").length,
  };

  const statCards = [
    { icon: UserCheck,   label: "Present",  value: counts.present },
    { icon: UserX,       label: "Absent",   value: counts.absent  },
    { icon: Minus,       label: "Half Day", value: counts.halfDay },
    { icon: CalendarOff, label: "On Leave", value: counts.onLeave },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flat-card flat-card-hover bg-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ──────────────────────────────────── */}
      <div className="flat-card bg-card overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Attendance Log</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flat-input text-sm px-3 py-2 cursor-pointer appearance-none font-medium min-w-[140px]"
            >
              {DATES.map((d) => (
                <option key={d} value={d}>
                  {new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | "All")}
              className="flat-input text-sm px-3 py-2 cursor-pointer appearance-none font-medium"
            >
              <option value="All">All Status</option>
              <option>Present</option>
              <option>Absent</option>
              <option>Half Day</option>
              <option>On Leave</option>
            </select>

            <input
              placeholder="Search employee…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flat-input text-sm px-3 py-2 w-44 font-medium"
            />

            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-lg
              text-foreground hover:bg-secondary transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary border-b border-border">
                {["Employee", "Department", "Check In", "Check Out", "Hours", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((record) => {
                const cfg = STATUS_CONFIG[record.status];
                return (
                  <tr key={record.id} className="hover:bg-secondary transition-colors duration-150">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{record.employeeName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{record.employeeId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{record.department}</td>
                    <td className="px-6 py-4">
                      {record.checkIn === "—" ? (
                        <span className="text-muted-foreground text-sm">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{record.checkIn}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {record.checkOut === "—" ? (
                        <span className="text-muted-foreground text-sm">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{record.checkOut}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{record.hoursWorked}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-secondary text-xs text-muted-foreground font-medium">
          Showing {filtered.length} of {records.length} records ·{" "}
          {new Date(selectedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}
