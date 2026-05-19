import { useMemo, useState } from "react";
import { Download, Eye, FileDown, FileSpreadsheet, List, Search, User, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { MyAttendanceModule } from "../../components/attendance/my-attendance/MyAttendanceModule";
import { attendanceDataset } from "../../modules/attendance/store";
import { DailyAttendance } from "../../modules/attendance/types";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { cn } from "../../components/ui/utils";

type TeamView = "card" | "list";

const TODAY = "2026-05-14";

function formatHours(hours?: number) {
  return typeof hours === "number" && hours > 0 ? `${hours.toFixed(1)}h` : "-";
}

function downloadBlob(content: BlobPart, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function statusClass(status?: string) {
  switch (status) {
    case "Present":
      return "bg-emerald-500 text-white";
    case "Absent":
      return "bg-rose-500 text-white";
    case "Leave":
      return "bg-blue-500 text-white";
    case "Half Day":
      return "bg-amber-500 text-white";
    case "Holiday":
      return "bg-purple-500 text-white";
    case "Week Off":
      return "bg-slate-600 text-white";
    default:
      return "bg-muted text-foreground";
  }
}

export function ManagerTeamAttendancePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [view, setView] = useState<TeamView>("card");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const teamMembers = useMemo(() => {
    return attendanceDataset.employees.map((employee) => {
      const today = attendanceDataset.records.find((record) => record.employeeId === employee.id && record.date === TODAY);
      const latest = today ?? attendanceDataset.records.find((record) => record.employeeId === employee.id);

      return {
        id: employee.id,
        name: employee.name,
        department: employee.dept,
        designation: latest?.designation ?? employee.desig,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`,
        today,
      };
    });
  }, []);

  const departments = useMemo(() => ["ALL", ...Array.from(new Set(teamMembers.map((employee) => employee.department))).sort()], [teamMembers]);
  const statuses = useMemo(() => ["ALL", ...Array.from(new Set(teamMembers.map((employee) => employee.today?.status ?? "No Record"))).sort()], [teamMembers]);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return teamMembers.filter((employee) => {
      const matchesQuery =
        !normalizedQuery ||
        employee.name.toLowerCase().includes(normalizedQuery) ||
        employee.id.toLowerCase().includes(normalizedQuery);
      const matchesDepartment = department === "ALL" || employee.department === department;
      const employeeStatus = employee.today?.status ?? "No Record";
      const matchesStatus = status === "ALL" || employeeStatus === status;

      return matchesQuery && matchesDepartment && matchesStatus;
    });
  }, [teamMembers, query, department, status]);

  const selectedEmployee = teamMembers.find((employee) => employee.id === selectedEmployeeId) ?? null;
  const selectedRecords = useMemo(
    () => attendanceDataset.records.filter((record) => record.employeeId === selectedEmployeeId),
    [selectedEmployeeId],
  );

  const exportRows = selectedRecords.map((record: DailyAttendance) => ({
    Date: record.date,
    Status: record.status,
    "Shift Timing": record.shiftName,
    "Punch In": record.firstIn || "No Punch In",
    "Punch Out": record.lastOut || "No Punch Out",
    "Working Hours": record.workHours,
    "Late By": record.lateMins,
    "Early By": record.earlyExitMins,
    "Work Mode": record.workMode,
    "Regularization Status": record.approvalPending ? "Pending" : "None",
    Remarks: record.exception ? "Exception recorded" : "",
  }));

  const exportCsv = () => {
    if (!selectedEmployee) return;
    const headers = Object.keys(exportRows[0] ?? {});
    const csv = [
      headers.join(","),
      ...exportRows.map((row) => headers.map((header) => JSON.stringify(row[header as keyof typeof row] ?? "")).join(",")),
    ].join("\n");
    downloadBlob(csv, `${selectedEmployee.id}-attendance.csv`, "text/csv;charset=utf-8");
  };

  const exportExcel = () => {
    if (!selectedEmployee) return;
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, `${selectedEmployee.id}-attendance.xlsx`);
  };

  const exportPdf = () => {
    if (!selectedEmployee) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${selectedEmployee.name} Attendance Report`, 14, 18);
    doc.setFontSize(10);
    doc.text(`${selectedEmployee.id} | ${selectedEmployee.department} | ${selectedEmployee.designation}`, 14, 26);

    selectedRecords.slice(0, 28).forEach((record, index) => {
      const y = 38 + index * 8;
      doc.text(
        `${record.date}  ${record.status}  In: ${record.firstIn || "No Punch In"}  Out: ${record.lastOut || "No Punch Out"}  Hours: ${formatHours(record.workHours)}`,
        14,
        y,
      );
    });

    doc.save(`${selectedEmployee.id}-attendance.pdf`);
  };

  const selectEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flat-card bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Team Attendance</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Search team members, review daily attendance, and open the full attendance history.
            </p>
          </div>
          {selectedEmployee ? (
            <div className="flex flex-wrap gap-2">
              <button onClick={exportExcel} className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700">
                <FileSpreadsheet className="h-4 w-4" /> Excel
              </button>
              <button onClick={exportPdf} className="inline-flex h-9 items-center gap-2 rounded-md bg-rose-600 px-3 text-sm font-semibold text-white hover:bg-rose-700">
                <FileDown className="h-4 w-4" /> PDF
              </button>
              <button onClick={exportCsv} className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700">
                <Download className="h-4 w-4" /> CSV
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_160px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by employee name or ID"
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            {departments.map((option) => (
              <option key={option} value={option} className="bg-card text-foreground">
                {option === "ALL" ? "Department" : option}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            {statuses.map((option) => (
              <option key={option} value={option} className="bg-card text-foreground">
                {option === "ALL" ? "Status" : option}
              </option>
            ))}
          </select>

          <div className="inline-flex rounded-md border border-border bg-secondary p-1">
            <button
              onClick={() => setView("card")}
              className={cn("inline-flex h-8 items-center gap-2 rounded px-3 text-sm font-semibold", view === "card" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <Users className="h-4 w-4" /> Card View
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("inline-flex h-8 items-center gap-2 rounded px-3 text-sm font-semibold", view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <List className="h-4 w-4" /> List View
            </button>
          </div>
        </div>
      </div>

      {view === "card" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEmployees.map((employee) => {
            const selected = employee.id === selectedEmployeeId;
            return (
              <div
                key={employee.id}
                role="button"
                tabIndex={0}
                onClick={() => selectEmployee(employee.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") selectEmployee(employee.id);
                }}
                className={cn(
                  "flat-card flat-card-hover cursor-pointer bg-card p-5 text-left transition-all",
                  selected && "border-primary bg-primary/10 ring-2 ring-primary/30",
                )}
              >
                <div className="flex items-start gap-4">
                  <img src={employee.avatar} alt={employee.name} className="h-12 w-12 rounded-full border border-border bg-secondary object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-foreground">{employee.name}</h2>
                        <p className="text-xs text-muted-foreground">{employee.id}</p>
                      </div>
                      <span className={cn("rounded-md px-2 py-1 text-[10px] font-bold uppercase", statusClass(employee.today?.status))}>
                        {employee.today?.status ?? "No Record"}
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-medium text-foreground">{employee.designation}</p>
                    <p className="text-xs text-muted-foreground">{employee.department}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-md bg-secondary/60 p-3">
                  <MiniMetric label="Punch In" value={employee.today?.firstIn || "No Punch In"} />
                  <MiniMetric label="Punch Out" value={employee.today?.lastOut || "No Punch Out"} />
                  <MiniMetric label="Hours" value={formatHours(employee.today?.workHours)} />
                </div>

                <div className="mt-4 flex gap-2">
                  <button type="button" className="inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                    <Eye className="h-4 w-4" /> View Attendance
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      selectEmployee(employee.id);
                    }}
                    className="inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card text-sm font-semibold text-foreground hover:bg-secondary"
                  >
                    <User className="h-4 w-4" /> View Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flat-card overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Punch In</th>
                  <th className="px-4 py-3">Punch Out</th>
                  <th className="px-4 py-3">Working Hours</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    onClick={() => selectEmployee(employee.id)}
                    className={cn("cursor-pointer hover:bg-secondary/70", employee.id === selectedEmployeeId && "bg-primary/10")}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={employee.avatar} alt={employee.name} className="h-9 w-9 rounded-full border border-border bg-secondary object-cover" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{employee.department}</td>
                    <td className="px-4 py-3 text-sm">{employee.designation}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-1 text-[10px] font-bold uppercase", statusClass(employee.today?.status))}>
                        {employee.today?.status ?? "No Record"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{employee.today?.firstIn || "No Punch In"}</td>
                    <td className="px-4 py-3 text-sm">{employee.today?.lastOut || "No Punch Out"}</td>
                    <td className="px-4 py-3 text-sm">{formatHours(employee.today?.workHours)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground" onClick={(event) => { event.stopPropagation(); selectEmployee(employee.id); }}>View Attendance</button>
                        <button className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary" onClick={(event) => { event.stopPropagation(); selectEmployee(employee.id); navigate(`/manager/team-attendance?employee=${employee.id}`); }}>View Profile</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedEmployee ? (
        <div className="flat-card flex min-h-[260px] items-center justify-center bg-card p-8 text-center">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Select a team member to view attendance details.</h2>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background">
          <MyAttendanceModule
            employeeId={selectedEmployee.id}
            title={`${selectedEmployee.name}'s Attendance`}
            subtitle={`${selectedEmployee.id} • ${selectedEmployee.designation} • ${selectedEmployee.department}. Manager view is read-only.`}
            readOnly
          />
        </div>
      )}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-foreground">{value}</p>
    </div>
  );
}
