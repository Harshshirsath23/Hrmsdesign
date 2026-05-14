"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Users,
  Clock,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../../../components/ui/drawer";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { SearchFilter } from "../../../components/filters/SearchFilter";
import { cn } from "../../../components/ui/utils";

type RequestCategory = "Attendance" | "Leave" | "Other";

type RequestStatus = "Pending" | "Approved" | "Rejected" | "Sent Back" | "Escalated";

type Priority = "Low" | "Medium" | "High" | "Critical";

interface RequestRow {
  id: string;
  requestId: string;
  employeeName: string;
  employeeId: string;
  department: string;
  team: string;
  requestType: string;
  category: RequestCategory;
  requestDate: string;
  effectiveDate: string;
  submittedOn: string;
  status: RequestStatus;
  priority: Priority;
  slaDue: string;
  slaStatus: "On Time" | "Due Today" | "Overdue";
  currentApprover: string;
  designation: string;
  reportingTo: string;
  reason: string;
  attachments: string[];
  existingData: string;
  leaveBalance: string;
  previousRequests: string;
  timeline: Array<{ step: string; date: string; actor: string; status: string }>;
}

const STATUS_STYLES: Record<RequestStatus, string> = {
  Pending: "bg-amber-500/10 text-amber-200 border border-amber-500/20",
  Approved: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20",
  Rejected: "bg-rose-500/10 text-rose-200 border border-rose-500/20",
  "Sent Back": "bg-sky-500/10 text-sky-200 border border-sky-500/20",
  Escalated: "bg-violet-500/10 text-violet-200 border border-violet-500/20",
};

const SLA_STYLES: Record<string, string> = {
  "On Time": "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20",
  "Due Today": "bg-amber-500/10 text-amber-200 border border-amber-500/20",
  Overdue: "bg-rose-500/10 text-rose-200 border border-rose-500/20",
};

const REQUEST_TYPES = [
  "Regularization Request",
  "Late Login Request",
  "Early Logout Request",
  "Missing Punch Request",
  "Half Day Attendance Request",
  "Work From Home Request",
  "Shift Change Request",
  "Overtime Request",
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Comp Off",
  "Half Day Leave",
  "Optional Holiday",
  "On Duty Request",
  "Permission Request",
] as const;

const PRIORITY_OPTIONS: Priority[] = ["Low", "Medium", "High", "Critical"];
const STATUS_OPTIONS: Array<RequestStatus | "ALL"> = ["ALL", "Pending", "Approved", "Rejected", "Sent Back", "Escalated"];
const CATEGORIES: Array<RequestCategory | "ALL"> = ["ALL", "Attendance", "Leave", "Other"];

const REQUESTS: RequestRow[] = [
  {
    id: "r1",
    requestId: "REQ-1024",
    employeeName: "Anaya Kapoor",
    employeeId: "EMP-1802",
    department: "Finance",
    team: "Accounts Payable",
    requestType: "Regularization Request",
    category: "Attendance",
    requestDate: "2026-05-10",
    effectiveDate: "2026-05-10",
    submittedOn: "2026-05-11",
    status: "Pending",
    priority: "High",
    slaDue: "2026-05-14",
    slaStatus: "Due Today",
    currentApprover: "Riya Menon",
    designation: "Accounts Executive",
    reportingTo: "Rohit Sharma",
    reason: "Missed punch due to network issue at office gate.",
    attachments: ["gate-pass.jpg"],
    existingData: "Marked absent on 10 May, no punch logs available.",
    leaveBalance: "N/A",
    previousRequests: "One regularization approved in Apr 2026.",
    timeline: [
      { step: "Submitted", date: "2026-05-11", actor: "Anaya Kapoor", status: "Pending" },
      { step: "Pending with Manager", date: "2026-05-11", actor: "Rohit Sharma", status: "In Review" },
    ],
  },
  {
    id: "r2",
    requestId: "REQ-1031",
    employeeName: "Karan Verma",
    employeeId: "EMP-1934",
    department: "Operations",
    team: "Field Services",
    requestType: "Comp Off",
    category: "Leave",
    requestDate: "2026-05-15",
    effectiveDate: "2026-05-16",
    submittedOn: "2026-05-15",
    status: "Escalated",
    priority: "Medium",
    slaDue: "2026-05-17",
    slaStatus: "Overdue",
    currentApprover: "Radha Singh",
    designation: "Field Supervisor",
    reportingTo: "Rohit Sharma",
    reason: "Worked full shift on a holiday, requesting comp off.",
    attachments: ["attendance-report.pdf"],
    existingData: "Attendance shows 9 hours on holiday 16 May.",
    leaveBalance: "Comp Off: 2 days",
    previousRequests: "Previous comp off pending in Apr 2026.",
    timeline: [
      { step: "Submitted", date: "2026-05-15", actor: "Karan Verma", status: "Escalated" },
      { step: "Pending with Manager", date: "2026-05-15", actor: "Rohit Sharma", status: "Escalated" },
    ],
  },
  {
    id: "r3",
    requestId: "REQ-1034",
    employeeName: "Nisha Rao",
    employeeId: "EMP-1546",
    department: "HR",
    team: "Recruitment",
    requestType: "Permission Request",
    category: "Other",
    requestDate: "2026-05-14",
    effectiveDate: "2026-05-14",
    submittedOn: "2026-05-14",
    status: "Approved",
    priority: "Low",
    slaDue: "2026-05-16",
    slaStatus: "On Time",
    currentApprover: "Rohit Sharma",
    designation: "Recruitment Lead",
    reportingTo: "Rohit Sharma",
    reason: "Doctor appointment for three hours in the afternoon.",
    attachments: ["medical-note.pdf"],
    existingData: "Requested permission from 14:30 to 18:00.",
    leaveBalance: "N/A",
    previousRequests: "Permission request approved in Mar 2026.",
    timeline: [
      { step: "Submitted", date: "2026-05-14", actor: "Nisha Rao", status: "Approved" },
      { step: "Approved", date: "2026-05-14", actor: "Rohit Sharma", status: "Approved" },
    ],
  },
  {
    id: "r4",
    requestId: "REQ-1042",
    employeeName: "Varun Iyer",
    employeeId: "EMP-1418",
    department: "Sales",
    team: "Channel Partners",
    requestType: "Late Login Request",
    category: "Attendance",
    requestDate: "2026-05-13",
    effectiveDate: "2026-05-13",
    submittedOn: "2026-05-14",
    status: "Rejected",
    priority: "Medium",
    slaDue: "2026-05-16",
    slaStatus: "On Time",
    currentApprover: "Riya Menon",
    designation: "Sales Executive",
    reportingTo: "Rohit Sharma",
    reason: "Reached office late due to traffic delay.",
    attachments: ["travel-slip.jpg"],
    existingData: "Login at 09:38, regular shift start 09:00.",
    leaveBalance: "N/A",
    previousRequests: "No previous late login requests this month.",
    timeline: [
      { step: "Submitted", date: "2026-05-14", actor: "Varun Iyer", status: "Rejected" },
      { step: "Rejected", date: "2026-05-15", actor: "Riya Menon", status: "Rejected" },
    ],
  },
  {
    id: "r5",
    requestId: "REQ-1045",
    employeeName: "Sanya Mehta",
    employeeId: "EMP-1677",
    department: "Finance",
    team: "Payroll",
    requestType: "Earned Leave",
    category: "Leave",
    requestDate: "2026-05-18",
    effectiveDate: "2026-05-20",
    submittedOn: "2026-05-17",
    status: "Pending",
    priority: "High",
    slaDue: "2026-05-19",
    slaStatus: "Due Today",
    currentApprover: "Rohit Sharma",
    designation: "Payroll Analyst",
    reportingTo: "Rohit Sharma",
    reason: "Planned personal travel for two days.",
    attachments: [],
    existingData: "Leave balance: 6 days remaining.",
    leaveBalance: "Earned Leave: 6 days",
    previousRequests: "One approved earned leave in Mar 2026.",
    timeline: [
      { step: "Submitted", date: "2026-05-17", actor: "Sanya Mehta", status: "Pending" },
      { step: "Pending with Manager", date: "2026-05-17", actor: "Rohit Sharma", status: "In Review" },
    ],
  },
  {
    id: "r6",
    requestId: "REQ-1048",
    employeeName: "Rahul Dev",
    employeeId: "EMP-1132",
    department: "Operations",
    team: "Logistics",
    requestType: "Work From Home Request",
    category: "Attendance",
    requestDate: "2026-05-19",
    effectiveDate: "2026-05-19",
    submittedOn: "2026-05-18",
    status: "Pending",
    priority: "Low",
    slaDue: "2026-05-20",
    slaStatus: "On Time",
    currentApprover: "Radha Singh",
    designation: "Logistics Coordinator",
    reportingTo: "Rohit Sharma",
    reason: "Working from home for client call and paper work.",
    attachments: [],
    existingData: "WFH not taken in last 30 days.",
    leaveBalance: "N/A",
    previousRequests: "Two approved WFH requests in Apr 2026.",
    timeline: [
      { step: "Submitted", date: "2026-05-18", actor: "Rahul Dev", status: "Pending" },
      { step: "Pending with Manager", date: "2026-05-18", actor: "Radha Singh", status: "In Review" },
    ],
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function isSameDay(value: string, compare: Date) {
  const date = new Date(value);
  return (
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth() &&
    date.getDate() === compare.getDate()
  );
}

function saveFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ManagerApprovalsRequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>(REQUESTS);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [requestType, setRequestType] = useState<string>("ALL");
  const [status, setStatus] = useState<RequestStatus | "ALL">("ALL");
  const [department, setDepartment] = useState<string>("ALL");
  const [team, setTeam] = useState<string>("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [category, setCategory] = useState<RequestCategory | "ALL">("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [drawerRow, setDrawerRow] = useState<RequestRow | null>(null);
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const departments = useMemo(
    () => ["ALL", ...Array.from(new Set(rows.map((row) => row.department))).sort()],
    [rows],
  );
  const teams = useMemo(
    () => ["ALL", ...Array.from(new Set(rows.map((row) => row.team))).sort()],
    [rows],
  );

  const filteredRows = useMemo(() => {
    const normQuery = query.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom).getTime() : 0;
    const to = dateTo ? new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1 : Number.MAX_SAFE_INTEGER;

    return rows.filter((row) => {
      const matchQuery =
        !normQuery ||
        row.employeeName.toLowerCase().includes(normQuery) ||
        row.employeeId.toLowerCase().includes(normQuery) ||
        row.requestId.toLowerCase().includes(normQuery);

      const matchType = requestType === "ALL" || row.requestType === requestType;
      const matchStatus = status === "ALL" || row.status === status;
      const matchDepartment = department === "ALL" || row.department === department;
      const matchTeam = team === "ALL" || row.team === team;
      const matchPriority = priority === "ALL" || row.priority === priority;
      const matchCategory = category === "ALL" || row.category === category;
      const submitted = new Date(row.submittedOn).getTime();
      const matchDateRange = submitted >= from && submitted <= to;

      return matchQuery && matchType && matchStatus && matchDepartment && matchTeam && matchPriority && matchCategory && matchDateRange;
    });
  }, [query, requestType, status, department, team, priority, dateFrom, dateTo, rows]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = filteredRows.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, requestType, status, department, team, priority, category, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const today = new Date();
    return {
      totalPending: rows.filter((row) => row.status === "Pending").length,
      leaveRequests: rows.filter((row) => row.category === "Leave").length,
      attendanceRequests: rows.filter((row) => row.category === "Attendance").length,
      approvedToday: rows.filter((row) => row.status === "Approved" && isSameDay(row.submittedOn, today)).length,
      rejectedToday: rows.filter((row) => row.status === "Rejected" && isSameDay(row.submittedOn, today)).length,
      escalatedRequests: rows.filter((row) => row.status === "Escalated").length,
    };
  }, [rows]);

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const allVisibleSelected = pageRows.length > 0 && pageRows.every((row) => selectedIds[row.id]);
  const someVisibleSelected = pageRows.some((row) => selectedIds[row.id]);

  const handleBulkAction = (action: "Approved" | "Rejected") => {
    setRows((current) =>
      current.map((row) =>
        selectedIds[row.id]
          ? {
              ...row,
              status: action as RequestStatus,
              currentApprover: action === "Approved" ? "Completed" : row.currentApprover,
              timeline: [
                ...row.timeline,
                { step: action, date: new Date().toISOString().slice(0, 10), actor: "You", status: action },
              ],
            }
          : row,
      ),
    );
    setSelectedIds({});
  };

  const handleExport = (type: "excel" | "pdf") => {
    const payload = filteredRows.map((row) => ({
      requestId: row.requestId,
      employeeName: row.employeeName,
      employeeId: row.employeeId,
      requestType: row.requestType,
      requestDate: row.requestDate,
      effectiveDate: row.effectiveDate,
      submittedOn: row.submittedOn,
      status: row.status,
      priority: row.priority,
      currentApprover: row.currentApprover,
    }));

    if (type === "excel") {
      const csv = [
        [
          "Request ID",
          "Employee",
          "Employee ID",
          "Request Type",
          "Request Date",
          "Effective Date",
          "Submitted On",
          "Status",
          "Priority",
          "Current Approver",
        ].join(","),
        ...payload.map((row) =>
          [
            row.requestId,
            row.employeeName,
            row.employeeId,
            row.requestType,
            row.requestDate,
            row.effectiveDate,
            row.submittedOn,
            row.status,
            row.priority,
            row.currentApprover,
          ]
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n");

      saveFile(csv, "manager-requests.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return;
    }

    const pdfContent = `Manager Requests Export\n\n${payload
      .map((row) =>
        [
          `Request ID: ${row.requestId}`,
          `Employee: ${row.employeeName}`,
          `Employee ID: ${row.employeeId}`,
          `Request Type: ${row.requestType}`,
          `Request Date: ${row.requestDate}`,
          `Effective Date: ${row.effectiveDate}`,
          `Submitted On: ${row.submittedOn}`,
          `Status: ${row.status}`,
          `Priority: ${row.priority}`,
          `Current Approver: ${row.currentApprover}`,
        ].join(" | "),
      )
      .join("\n")}`;
    saveFile(pdfContent, "manager-requests.pdf", "application/pdf");
  };

  const handleRowAction = (row: RequestRow, action: "Approved" | "Rejected" | "Sent Back") => {
    if ((action === "Rejected" || action === "Sent Back") && !remarks.trim()) {
      setRemarksError("Remarks are required for this action.");
      return;
    }

    setRows((current) =>
      current.map((item) =>
        item.id === row.id
          ? {
              ...item,
              status: action as RequestStatus,
              currentApprover: action === "Approved" ? "Completed" : item.currentApprover,
              timeline: [
                ...item.timeline,
                {
                  step: action === "Sent Back" ? "Sent Back" : action,
                  date: new Date().toISOString().slice(0, 10),
                  actor: "You",
                  status: action,
                },
              ],
            }
          : item,
      ),
    );

    setDrawerRow(null);
    setRemarks("");
    setRemarksError("");
  };

  const resetFilters = () => {
    setQuery("");
    setRequestType("ALL");
    setStatus("ALL");
    setDepartment("ALL");
    setTeam("ALL");
    setPriority("ALL");
    setCategory("ALL");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const summaryCards = [
    { label: "Total Pending", value: summary.totalPending, icon: ClipboardCheck, onClick: () => { resetFilters(); setStatus("Pending"); } },
    { label: "Leave Requests", value: summary.leaveRequests, icon: Users, onClick: () => { resetFilters(); setCategory("Leave"); } },
    { label: "Attendance Requests", value: summary.attendanceRequests, icon: Clock, onClick: () => { resetFilters(); setCategory("Attendance"); } },
    { label: "Approved Today", value: summary.approvedToday, icon: Check, onClick: () => { resetFilters(); setStatus("Approved"); } },
    { label: "Rejected Today", value: summary.rejectedToday, icon: X, onClick: () => { resetFilters(); setStatus("Rejected"); } },
    { label: "Escalated Requests", value: summary.escalatedRequests, icon: AlertTriangle, onClick: () => { resetFilters(); setStatus("Escalated"); } },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <button
            type="button"
            key={card.label}
            onClick={card.onClick}
            className="flat-card group bg-card p-5 text-left transition hover:border hover:border-white/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl bg-secondary p-3 text-foreground">
                <card.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{card.label}</span>
            </div>

            <p className="mt-5 text-3xl font-semibold text-foreground">{card.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">Click to filter</p>
          </button>
        ))}
      </div>

      <div className="flat-card bg-card p-5 space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
          <SearchFilter
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            placeholder="Search Employee / ID / Request ID"
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-2 text-sm text-neutral-300">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Request Type</span>
              <select
                value={requestType}
                onChange={(event) => setRequestType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="ALL">All request types</option>
                {REQUEST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-neutral-300">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as RequestStatus | "ALL")}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "ALL" ? "All statuses" : option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-neutral-300">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Department</span>
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none"
              >
                {departments.map((option) => (
                  <option key={option} value={option}>
                    {option === "ALL" ? "All departments" : option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-neutral-300">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as RequestCategory | "ALL")}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none"
              >
                {CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option === "ALL" ? "All categories" : option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
          <label className="space-y-2 text-sm text-neutral-300">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Team</span>
            <select
              value={team}
              onChange={(event) => setTeam(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none"
            >
              {teams.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All teams" : option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-neutral-300">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Priority</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority | "ALL")}
              className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="ALL">All priorities</option>
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2 text-sm text-neutral-300">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Date From</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="rounded-xl border border-white/10 bg-neutral-950 text-white"
              />
            </label>
            <label className="space-y-2 text-sm text-neutral-300">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Date To</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="rounded-xl border border-white/10 bg-neutral-950 text-white"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setRequestType("ALL");
              setStatus("ALL");
              setDepartment("ALL");
              setTeam("ALL");
              setPriority("ALL");
              setDateFrom("");
              setDateTo("");
              setPage(1);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-secondary px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary/80"
          >
            Reset Filters
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleExport("excel")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </button>
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="flat-card bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Bulk Actions
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select requests to approve, reject, or export in one click.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" disabled={selectedCount === 0} onClick={() => handleBulkAction("Approved")}>Approve Selected</Button>
            <Button variant="secondary" size="sm" disabled={selectedCount === 0} onClick={() => handleBulkAction("Rejected")}>Reject Selected</Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedCount === 0}
              onClick={() => {
                const selectedRows = rows.filter((row) => selectedIds[row.id]);
                const csv = [
                  ["Request ID","Employee","Employee ID","Request Type","Request Date","Effective Date","Submitted On","Status","Priority","Current Approver"].join(","),
                  ...selectedRows.map((row) =>
                    [
                      row.requestId,
                      row.employeeName,
                      row.employeeId,
                      row.requestType,
                      row.requestDate,
                      row.effectiveDate,
                      row.submittedOn,
                      row.status,
                      row.priority,
                      row.currentApprover,
                    ]
                      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                      .join(","),
                  ),
                ].join("\n");
                saveFile(csv, "selected-requests.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
              }}
            >
              Export Selected
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="hidden sm:block">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="px-3">
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...selectedIds };
                      if (allVisibleSelected) {
                        pageRows.forEach((row) => delete next[row.id]);
                      } else {
                        pageRows.forEach((row) => {
                          next[row.id] = true;
                        });
                      }
                      setSelectedIds(next);
                    }}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-border text-muted-foreground"
                  >
                    {allVisibleSelected ? <Check className="h-3 w-3" /> : someVisibleSelected ? "–" : ""}
                  </button>
                </TableHead>
                {["Request ID", "Employee", "Employee ID", "Request Type", "Request Date", "Effective Date", "Submitted On", "Status", "Priority", "SLA Due", "Current Approver", "Actions"].map((heading) => (
                  <TableHead key={heading} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground px-2 py-3">
                    {heading}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer hover:bg-secondary" onClick={() => setDrawerRow(row)}>
                  <TableCell className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIds((current) => ({ ...current, [row.id]: !current[row.id] }));
                      }}
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-md border border-border transition",
                        selectedIds[row.id] ? "bg-foreground text-background" : "bg-card text-muted-foreground",
                      )}
                    >
                      {selectedIds[row.id] ? <Check className="h-3 w-3" /> : null}
                    </button>
                  </TableCell>
                  <TableCell className="px-2 py-3 font-semibold text-foreground">{row.requestId}</TableCell>
                  <TableCell className="px-2 py-3 text-sm text-muted-foreground">{row.employeeName}</TableCell>
                  <TableCell className="px-2 py-3 text-sm text-muted-foreground">{row.employeeId}</TableCell>
                  <TableCell className="px-2 py-3 text-sm text-muted-foreground">{row.requestType}</TableCell>
                  <TableCell className="px-2 py-3 text-sm text-muted-foreground">{formatDate(row.requestDate)}</TableCell>
                  <TableCell className="px-2 py-3 text-sm text-muted-foreground">{formatDate(row.effectiveDate)}</TableCell>
                  <TableCell className="px-2 py-3 text-sm text-muted-foreground">{formatDate(row.submittedOn)}</TableCell>
                  <TableCell className="px-2 py-3">
                    <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold", STATUS_STYLES[row.status])}>
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-3 text-sm text-muted-foreground">{row.priority}</TableCell>
                  <TableCell className="px-2 py-3">
                    <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold", SLA_STYLES[row.slaStatus])}>
                      {row.slaStatus}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-3 text-sm text-muted-foreground">{row.currentApprover}</TableCell>
                  <TableCell className="px-2 py-3" onClick={(event) => event.stopPropagation()}>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-xl bg-secondary px-3 py-2 text-xs font-semibold text-foreground">View</button>
                      <button type="button" className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">Approve</button>
                      <button type="button" className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200">Reject</button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="px-6 py-20 text-center text-sm text-muted-foreground">
                    No requests match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 sm:hidden">
          {pageRows.map((row) => (
            <button
              type="button"
              key={row.id}
              onClick={() => setDrawerRow(row)}
              className="group w-full rounded-3xl border border-border bg-card p-4 text-left transition hover:border-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{row.requestId}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{row.employeeName} • {row.employeeId}</p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", STATUS_STYLES[row.status])}>
                  {row.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">{row.requestType}</p>
                  <p>{formatDate(row.submittedOn)}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Priority</p>
                  <p>{row.priority}</p>
                </div>
              </div>
            </button>
          ))}
          {pageRows.length === 0 && (
            <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No requests match the selected filters.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(clampedPage - 1) * pageSize + 1}–{Math.min(clampedPage * pageSize, filteredRows.length)} of {filteredRows.length}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={clampedPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {clampedPage} of {pageCount}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={clampedPage >= pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Drawer open={!!drawerRow} onOpenChange={(open) => { if (!open) setDrawerRow(null); }}>
        <DrawerContent direction="right" className="w-[92vw] max-w-[700px] border-l border-border bg-background text-foreground">
          <DrawerHeader className="border-b border-border bg-card sticky top-0 z-20">
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <DrawerTitle className="text-base">Request Details</DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground">Review employee data, history, timeline and actions.</DrawerDescription>
              </div>
              <DrawerClose asChild>
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="space-y-6 px-5 py-5">
            <section className="rounded-3xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Employee Info</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  ["Name", drawerRow?.employeeName ?? "-"],
                  ["ID", drawerRow?.employeeId ?? "-"],
                  ["Department", drawerRow?.department ?? "-"],
                  ["Designation", drawerRow?.designation ?? "-"],
                  ["Team", drawerRow?.team ?? "-"],
                  ["Reporting To", drawerRow?.reportingTo ?? "-"],
                ].map(([label, value]) => (
                  <div key={`${label}-${value}`}>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Request Info</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  ["Request Type", drawerRow?.requestType ?? "-"],
                  ["Request Date", drawerRow ? formatDate(drawerRow.requestDate) : "-"],
                  ["Effective Date", drawerRow ? formatDate(drawerRow.effectiveDate) : "-"],
                  ["Submitted On", drawerRow ? formatDate(drawerRow.submittedOn) : "-"],
                  ["Priority", drawerRow?.priority ?? "-"],
                  ["Current Approver", drawerRow?.currentApprover ?? "-"],
                ].map(([label, value]) => (
                  <div key={`${label}-${value}`}>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Reason</p>
                  <p className="mt-1 text-sm text-foreground">{drawerRow?.reason ?? "-"}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Attachments</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(drawerRow?.attachments.length ?? 0) > 0 ? (
                      drawerRow?.attachments.map((file) => (
                        <span key={file} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          {file}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No attachments</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Historical Data</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">Existing data</p>
                  <p>{drawerRow?.existingData ?? "-"}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Leave balance</p>
                  <p>{drawerRow?.leaveBalance ?? "-"}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Previous similar requests</p>
                  <p>{drawerRow?.previousRequests ?? "-"}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Approval Timeline</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                {drawerRow?.timeline.map((step) => (
                  <div key={`${step.step}-${step.date}`} className="rounded-2xl border border-border bg-secondary/80 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground">
                      <span>{step.step}</span>
                      <span>{step.date}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{step.actor} • {step.status}</p>
                  </div>
                ))}
                {!drawerRow?.timeline.length && <p className="text-sm text-muted-foreground">No timeline data available.</p>}
              </div>
            </section>
          </div>

          <DrawerFooter className="flex flex-col gap-3 border-t border-border bg-card p-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full">
              <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(event) => {
                  setRemarks(event.target.value);
                  setRemarksError("");
                }}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:border-white/20"
                placeholder="Add manager remarks..."
              />
              {remarksError ? <p className="mt-2 text-xs text-rose-300">{remarksError}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => drawerRow && handleRowAction(drawerRow, "Sent Back")}>Send Back</Button>
              <Button variant="destructive" size="sm" onClick={() => drawerRow && handleRowAction(drawerRow, "Rejected")}>Reject</Button>
              <Button size="sm" onClick={() => drawerRow && handleRowAction(drawerRow, "Approved")}>Approve</Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
