import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileText,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  MessageSquare,
  Paperclip,
  XCircle,
  RefreshCw,
  CalendarDays,
  User,
  Building,
  Info,
  Calendar
} from "lucide-react";
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
import { cn } from "../../../components/ui/utils";

// --- Types ---
type RequestCategory = "Attendance" | "Leave" | "Other";
type RequestStatus = "Pending" | "Approved" | "Rejected" | "Escalated";
type Priority = "Low" | "Medium" | "High";

interface RequestRow {
  id: string;
  requestId: string;
  employeeName: string;
  employeeId: string;
  photoUrl: string;
  department: string;
  team: string;
  requestType: string;
  category: RequestCategory;
  requestDate: string;
  effectiveDate: string;
  submittedOn: string;
  status: RequestStatus;
  priority: Priority;
  waitingDays: number;
  daysAffected: number;
  currentApprover: string;
  designation: string;
  reportingTo: string;
  reason: string;
  attachments: string[];
  commentsCount: number;
  existingData: string;
  leaveBalance: string;
  previousRequests: string;
  timeline: Array<{ step: string; date: string; actor: string; status: string; remarks?: string }>;
}

// --- Constants ---
const STATUS_STYLES: Record<RequestStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border border-amber-200",
  Approved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Rejected: "bg-rose-100 text-rose-800 border border-rose-200",
  Escalated: "bg-rose-100 text-rose-800 border border-rose-200",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  High: "bg-[#DC2626] text-white border border-[#DC2626]",
  Medium: "bg-[#F59E0B] text-white border border-[#F59E0B]",
  Low: "bg-[#3B82F6] text-white border border-[#3B82F6]",
};

const TYPE_COLORS: Record<string, string> = {
  "Regularization": "bg-[#2563EB] text-white border border-[#2563EB]",
  "Late Login": "bg-[#4F46E5] text-white border border-[#4F46E5]",
  "Earned Leave": "bg-[#059669] text-white border border-[#059669]",
  "Sick Leave": "bg-[#E11D48] text-white border border-[#E11D48]",
  "Comp Off": "bg-[#7C3AED] text-white border border-[#7C3AED]",
  "Permission": "bg-[#C026D3] text-white border border-[#C026D3]",
  "Work From Home": "bg-[#0891B2] text-white border border-[#0891B2]",
  "Half Day": "bg-[#0F766E] text-white border border-[#0F766E]",
  default: "bg-[#4B5563] text-white border border-[#4B5563]",
};

const CARD_STATUS_STYLES: Record<RequestStatus, string> = {
  Pending: "border-l-4 border-l-amber-400",
  Approved: "border-l-4 border-l-emerald-400",
  Rejected: "border-l-4 border-l-rose-400",
  Escalated: "border-l-4 border-l-rose-600",
};

// --- Mock Data ---
const MOCK_REQUESTS: RequestRow[] = [
  {
    id: "r1",
    requestId: "REQ-1024",
    employeeName: "Anaya Kapoor",
    employeeId: "EMP-1802",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Anaya",
    department: "Finance",
    team: "Accounts Payable",
    requestType: "Regularization",
    category: "Attendance",
    requestDate: "2026-05-10",
    effectiveDate: "2026-05-10",
    submittedOn: "2026-05-11",
    status: "Pending",
    priority: "High",
    waitingDays: 3,
    daysAffected: 1,
    currentApprover: "Riya Menon",
    designation: "Accounts Executive",
    reportingTo: "Rohit Sharma",
    reason: "Missed punch due to network issue at office gate. Attended morning sync.",
    attachments: ["gate-pass.jpg"],
    commentsCount: 2,
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
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Karan",
    department: "Operations",
    team: "Field Services",
    requestType: "Comp Off",
    category: "Leave",
    requestDate: "2026-05-15",
    effectiveDate: "2026-05-16",
    submittedOn: "2026-05-15",
    status: "Pending",
    priority: "Low",
    waitingDays: 0,
    daysAffected: 1,
    currentApprover: "Radha Singh",
    designation: "Field Supervisor",
    reportingTo: "Rohit Sharma",
    reason: "Worked full shift on a holiday (May 1st), requesting comp off for family event.",
    attachments: ["attendance-report.pdf"],
    commentsCount: 0,
    existingData: "Attendance shows 9 hours on holiday 1 May.",
    leaveBalance: "Comp Off: 2 days",
    previousRequests: "Previous comp off approved in Apr 2026.",
    timeline: [
      { step: "Submitted", date: "2026-05-15", actor: "Karan Verma", status: "Pending" },
    ],
  },
  {
    id: "r3",
    requestId: "REQ-1034",
    employeeName: "Nisha Rao",
    employeeId: "EMP-1546",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Nisha",
    department: "HR",
    team: "Recruitment",
    requestType: "Permission",
    category: "Other",
    requestDate: "2026-05-14",
    effectiveDate: "2026-05-14",
    submittedOn: "2026-05-14",
    status: "Approved",
    priority: "Low",
    waitingDays: 0,
    daysAffected: 0,
    currentApprover: "Completed",
    designation: "Recruitment Lead",
    reportingTo: "Rohit Sharma",
    reason: "Doctor appointment for three hours in the afternoon.",
    attachments: ["medical-note.pdf"],
    commentsCount: 1,
    existingData: "Requested permission from 14:30 to 18:00.",
    leaveBalance: "N/A",
    previousRequests: "Permission request approved in Mar 2026.",
    timeline: [
      { step: "Submitted", date: "2026-05-14", actor: "Nisha Rao", status: "Approved" },
      { step: "Approved", date: "2026-05-14", actor: "Rohit Sharma", status: "Approved", remarks: "Approved, please update calendar." },
    ],
  },
  {
    id: "r4",
    requestId: "REQ-1042",
    employeeName: "Varun Iyer",
    employeeId: "EMP-1418",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Varun",
    department: "Sales",
    team: "Channel Partners",
    requestType: "Late Login",
    category: "Attendance",
    requestDate: "2026-05-13",
    effectiveDate: "2026-05-13",
    submittedOn: "2026-05-14",
    status: "Rejected",
    priority: "Medium",
    waitingDays: 1,
    daysAffected: 0,
    currentApprover: "Completed",
    designation: "Sales Executive",
    reportingTo: "Rohit Sharma",
    reason: "Reached office late due to severe traffic delay on the highway.",
    attachments: ["travel-slip.jpg"],
    commentsCount: 3,
    existingData: "Login at 09:38, regular shift start 09:00.",
    leaveBalance: "N/A",
    previousRequests: "No previous late login requests this month.",
    timeline: [
      { step: "Submitted", date: "2026-05-14", actor: "Varun Iyer", status: "Rejected" },
      { step: "Rejected", date: "2026-05-15", actor: "Riya Menon", status: "Rejected", remarks: "Please apply for half-day leave as per policy." },
    ],
  },
  {
    id: "r5",
    requestId: "REQ-1045",
    employeeName: "Sanya Mehta",
    employeeId: "EMP-1677",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Sanya",
    department: "Finance",
    team: "Payroll",
    requestType: "Earned Leave",
    category: "Leave",
    requestDate: "2026-05-18",
    effectiveDate: "2026-05-20",
    submittedOn: "2026-05-12",
    status: "Pending",
    priority: "Medium",
    waitingDays: 2,
    daysAffected: 3,
    currentApprover: "Rohit Sharma",
    designation: "Payroll Analyst",
    reportingTo: "Rohit Sharma",
    reason: "Planned personal travel for three days. Backup resource is Varun.",
    attachments: [],
    commentsCount: 0,
    existingData: "Leave balance: 6 days remaining.",
    leaveBalance: "Earned Leave: 6 days",
    previousRequests: "One approved earned leave in Mar 2026.",
    timeline: [
      { step: "Submitted", date: "2026-05-12", actor: "Sanya Mehta", status: "Pending" },
      { step: "Pending with Manager", date: "2026-05-12", actor: "Rohit Sharma", status: "In Review" },
    ],
  },
  {
    id: "r6",
    requestId: "REQ-1048",
    employeeName: "Rahul Dev",
    employeeId: "EMP-1132",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Rahul",
    department: "Operations",
    team: "Logistics",
    requestType: "Work From Home",
    category: "Attendance",
    requestDate: "2026-05-19",
    effectiveDate: "2026-05-19",
    submittedOn: "2026-05-18",
    status: "Pending",
    priority: "Low",
    waitingDays: 0,
    daysAffected: 1,
    currentApprover: "Radha Singh",
    designation: "Logistics Coordinator",
    reportingTo: "Rohit Sharma",
    reason: "Working from home for client call and paper work. Available on teams.",
    attachments: [],
    commentsCount: 0,
    existingData: "WFH not taken in last 30 days.",
    leaveBalance: "N/A",
    previousRequests: "Two approved WFH requests in Apr 2026.",
    timeline: [
      { step: "Submitted", date: "2026-05-18", actor: "Rahul Dev", status: "Pending" },
      { step: "Pending with Manager", date: "2026-05-18", actor: "Radha Singh", status: "In Review" },
    ],
  },
  {
    id: "r7",
    requestId: "REQ-1051",
    employeeName: "Priya Singh",
    employeeId: "EMP-1205",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Priya",
    department: "Marketing",
    team: "Digital",
    requestType: "Sick Leave",
    category: "Leave",
    requestDate: "2026-05-13",
    effectiveDate: "2026-05-14",
    submittedOn: "2026-05-10",
    status: "Pending",
    priority: "High",
    waitingDays: 4,
    daysAffected: 2,
    currentApprover: "Rohit Sharma",
    designation: "Marketing Specialist",
    reportingTo: "Rohit Sharma",
    reason: "Down with viral fever. Requested leaves for proper rest.",
    attachments: ["medical-prescription.pdf"],
    commentsCount: 1,
    existingData: "Leave balance: 4 days remaining.",
    leaveBalance: "Sick Leave: 4 days",
    previousRequests: "None recently.",
    timeline: [
      { step: "Submitted", date: "2026-05-10", actor: "Priya Singh", status: "Pending" },
    ],
  }
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
  const [rows, setRows] = useState<RequestRow[]>(MOCK_REQUESTS);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const selectAllRef = useRef<HTMLInputElement>(null);
  
  // Filters
  const [query, setQuery] = useState("");
  const [requestType, setRequestType] = useState<string>("ALL");
  const [category, setCategory] = useState<RequestCategory | "ALL">("ALL");
  const [status, setStatus] = useState<RequestStatus | "ALL">("Pending"); // Default to pending as requested
  const [department, setDepartment] = useState<string>("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Drawer & Action State
  const [drawerRow, setDrawerRow] = useState<RequestRow | null>(null);
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState("");
  const [showOnlyPending, setShowOnlyPending] = useState(true);
  const [workflowType, setWorkflowType] = useState("Multi-level approval");
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [currentDelegate, setCurrentDelegate] = useState({
    delegateName: "Priya Patel",
    effectiveFrom: "2026-05-19",
    reason: "Annual leave coverage",
  });
  const [delegateFormData, setDelegateFormData] = useState({
    delegateName: "Priya Patel",
    effectiveFrom: "2026-05-19",
    reason: "",
  });

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  const departments = useMemo(() => ["ALL", ...Array.from(new Set(rows.map((row) => row.department))).sort()], [rows]);
  const requestTypes = useMemo(() => ["ALL", ...Array.from(new Set(rows.map((row) => row.requestType))).sort()], [rows]);

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
      const matchCategory = category === "ALL" || row.category === category;
      const matchStatus = status === "ALL" || row.status === status;
      const matchPendingToggle = showOnlyPending ? row.status === "Pending" : true;
      const matchDepartment = department === "ALL" || row.department === department;
      const matchPriority = priority === "ALL" || row.priority === priority;
      
      const submitted = new Date(row.submittedOn).getTime();
      const matchDateRange = submitted >= from && submitted <= to;

      return matchQuery && matchType && matchCategory && (showOnlyPending ? matchPendingToggle : matchStatus) && matchDepartment && matchPriority && matchDateRange;
    });
  }, [query, requestType, category, status, department, priority, dateFrom, dateTo, rows, showOnlyPending]);

  const summary = useMemo(() => {
    const today = new Date();
    return {
      pending: rows.filter((row) => row.status === "Pending").length,
      leave: rows.filter((row) => row.category === "Leave" && row.status === "Pending").length,
      attendance: rows.filter((row) => row.category === "Attendance" && row.status === "Pending").length,
      approvedToday: rows.filter((row) => row.status === "Approved" && isSameDay(row.timeline[row.timeline.length-1]?.date || row.submittedOn, today)).length,
    };
  }, [rows]);

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const allVisibleSelected = filteredRows.length > 0 && filteredRows.every((row) => selectedIds[row.id]);
  const someVisibleSelected = filteredRows.some((row) => selectedIds[row.id]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleAll = () => {
    const next = { ...selectedIds };
    if (allVisibleSelected) {
      filteredRows.forEach((row) => delete next[row.id]);
    } else {
      filteredRows.forEach((row) => {
        next[row.id] = true;
      });
    }
    setSelectedIds(next);
  };

  const handleBulkAction = (action: "Approved" | "Rejected") => {
    const selectedRows = rows.filter((row) => selectedIds[row.id]);
    const actionText = action === "Approved" ? "approved" : "rejected";

    if (!selectedRows.length) return;

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
    showToast(`${selectedRows.length} requests ${actionText} successfully.`);
  };

  const handleRowAction = (row: RequestRow, action: "Approved" | "Rejected", inlineRemarks?: string) => {
    const finalRemarks = inlineRemarks !== undefined ? inlineRemarks : remarks;
    if (action === "Rejected" && !finalRemarks.trim() && !inlineRemarks) {
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
                  step: action,
                  date: new Date().toISOString().slice(0, 10),
                  actor: "You",
                  status: action,
                  remarks: finalRemarks,
                },
              ],
            }
          : item,
      ),
    );

    setDrawerRow(null);
    setRemarks("");
    setRemarksError("");
    showToast(`Request ${row.requestId} ${action.toLowerCase()} successfully.`);
  };

  const handleExport = () => {
    const payload = filteredRows.map((row) => ({
      requestId: row.requestId,
      employeeName: row.employeeName,
      requestType: row.requestType,
      status: row.status,
      submittedOn: row.submittedOn,
    }));

    const csv = [
      ["Request ID", "Employee", "Request Type", "Status", "Submitted On"].join(","),
      ...payload.map((row) => [row.requestId, row.employeeName, row.requestType, row.status, row.submittedOn].join(",")),
    ].join("\n");

    saveFile(csv, "approvals-export.csv", "text/csv");
    showToast("Exported successfully to CSV.");
  };

  const resetFilters = () => {
    setQuery("");
    setRequestType("ALL");
    setCategory("ALL");
    setStatus("ALL");
    setDepartment("ALL");
    setPriority("ALL");
    setDateFrom("");
    setDateTo("");
    setShowOnlyPending(false);
  };

  const applySavedView = (view: string) => {
    resetFilters();
    if (view === "Pending") {
        setShowOnlyPending(true);
        setStatus("Pending");
    }
    if (view === "Leave") {
        setCategory("Leave");
        setStatus("Pending");
        setShowOnlyPending(true);
    }
    if (view === "Attendance") {
        setCategory("Attendance");
        setStatus("Pending");
        setShowOnlyPending(true);
    }
  }

  const summaryCards = [
    { label: "Pending Approval", value: summary.pending, icon: Clock, color: "text-white", bg: "bg-[#F59E0B]", onClick: () => { resetFilters(); setStatus("Pending"); setShowOnlyPending(true); } },
    { label: "Leave Requests", value: summary.leave, icon: CalendarDays, color: "text-white", bg: "bg-[#3B82F6]", onClick: () => { resetFilters(); setCategory("Leave"); setStatus("Pending"); setShowOnlyPending(true); } },
    { label: "Attendance Requests", value: summary.attendance, icon: User, color: "text-white", bg: "bg-[#7C3AED]", onClick: () => { resetFilters(); setCategory("Attendance"); setStatus("Pending"); setShowOnlyPending(true); } },
    { label: "Approved Today", value: summary.approvedToday, icon: CheckCircle2, color: "text-white", bg: "bg-[#10B981]", onClick: () => { resetFilters(); setStatus("Approved"); } },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-2xl animate-in slide-in-from-top-2">
          {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          {toast.type === "error" && <XCircle className="h-5 w-5 text-rose-500" />}
          {toast.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Approvals Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and take action on requests submitted by your team.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={workflowType}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "Delegate Approval Authority") {
                setDelegateFormData({
                  delegateName: currentDelegate.delegateName,
                  effectiveFrom: currentDelegate.effectiveFrom,
                  reason: "",
                });
                setShowDelegateModal(true);
              } else if (value === "Approval Workflow Configuration") {
                setShowWorkflowModal(true);
              }
              setWorkflowType("Multi-level approval");
            }}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            title="Configure approval workflow and delegation"
          >
            <option value="Multi-level approval" className="bg-card text-foreground">Approval Configuration</option>
            <option value="Delegate Approval Authority" className="bg-card text-foreground">Delegate Approval Authority</option>
            <option value="Approval Workflow Configuration" className="bg-card text-foreground">Approval Workflow Configuration</option>
          </select>
          
          <Button variant="outline" size="sm" onClick={() => setRows([...rows])}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>



      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <button
            type="button"
            key={card.label}
            onClick={card.onClick}
            className="group relative flex flex-col items-start justify-between overflow-hidden rounded-lg border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary hover:bg-secondary/60"
          >
            <div className={cn("inline-flex rounded-xl p-3", card.bg, card.color)}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Smart Filter Bar */}
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder="Search employee, ID, request..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-full border border-border bg-background pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                />
            </div>
            <div className="h-6 w-px bg-border hidden md:block"></div>
            
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            >
              {requestTypes.map(opt => <option key={opt} value={opt} className="bg-card text-foreground">{opt === "ALL" ? "Type" : opt}</option>)}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RequestCategory | "ALL")}
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL" className="bg-card text-foreground">Category</option>
              <option value="Attendance" className="bg-card text-foreground">Attendance</option>
              <option value="Leave" className="bg-card text-foreground">Leave</option>
              <option value="Other" className="bg-card text-foreground">Other</option>
            </select>
            
            {!showOnlyPending && (
                <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                >
                <option value="ALL" className="bg-card text-foreground">Status</option>
                <option value="Pending" className="bg-card text-foreground">Pending</option>
                <option value="Approved" className="bg-card text-foreground">Approved</option>
                <option value="Rejected" className="bg-card text-foreground">Rejected</option>
                </select>
            )}

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 hidden sm:block"
            >
              {departments.map(opt => <option key={opt} value={opt} className="bg-card text-foreground">{opt === "ALL" ? "Department" : opt}</option>)}
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 hidden md:block"
            >
              <option value="ALL" className="bg-card text-foreground">Priority</option>
              <option value="High" className="bg-card text-foreground">High</option>
              <option value="Medium" className="bg-card text-foreground">Medium</option>
              <option value="Low" className="bg-card text-foreground">Low</option>
            </select>

            <div className="h-6 w-px bg-border hidden lg:block"></div>
            
            <div className="hidden lg:flex items-center gap-2 px-2">
                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground" onClick={() => applySavedView('Pending')}>Pending</Button>
                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground" onClick={() => applySavedView('Leave')}>Leave</Button>
            </div>

            {(query || requestType !== "ALL" || category !== "ALL" || status !== "ALL" || department !== "ALL" || priority !== "ALL") && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-[#EF4444] hover:text-[#DC2626] h-8 ml-auto">
                    Clear
                </Button>
            )}
        </div>
      </div>

      {/* Priority Inbox - Card Based Layout */}
      <div className="space-y-4">
        {/* Select All Row */}
        {filteredRows.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      className="h-5 w-5 rounded border-border bg-background accent-primary focus:ring-primary"
                      aria-label="Select all visible requests"
                    />
                    <span className="text-sm font-medium text-foreground">Select All</span>
                    <span className="text-sm text-muted-foreground">{filteredRows.length} visible requests</span>
                </label>
                <span className="text-sm font-semibold text-foreground">
                  {selectedCount} {selectedCount === 1 ? "request" : "requests"} selected
                </span>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRows.map((row) => {
                const isSelected = selectedIds[row.id];
                return (
                    <div 
                        key={row.id} 
                        className={cn(
                            "group relative flex flex-col overflow-hidden rounded-lg border bg-card p-5 shadow-sm transition-all hover:border-primary/70 hover:shadow-lg",
                            CARD_STATUS_STYLES[row.status],
                            isSelected ? "border-primary ring-2 ring-primary/35 bg-primary/10" : "border-border",
                            row.status === "Pending" ? "opacity-100" : "opacity-85"
                        )}
                    >
                        {/* Checkbox Overlay */}
                        <div className="absolute left-4 top-4 z-10">
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedIds((current) => ({ ...current, [row.id]: e.target.checked }));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-5 w-5 rounded border-border bg-background accent-primary focus:ring-primary"
                              aria-label={`Select request ${row.requestId}`}
                            />
                        </div>

                        {/* Top Row: Avatar & Details */}
                        <div className="flex items-start justify-between pl-8 cursor-pointer" onClick={() => setDrawerRow(row)}>
                            <div className="flex items-center gap-3">
                                <img src={row.photoUrl} alt={row.employeeName} className="h-10 w-10 rounded-full border border-border object-cover bg-secondary" />
                                <div>
                                    <h3 className="font-medium text-foreground">{row.employeeName}</h3>
                                    <p className="text-xs text-muted-foreground">{row.employeeId} • {row.department}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", PRIORITY_STYLES[row.priority])}>
                                    {row.priority}
                                </span>
                                {row.waitingDays > 0 && row.status === "Pending" && (
                                    <span className="text-[10px] font-semibold text-[#DC2626] flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {row.waitingDays}d wait
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Middle: Badges & Info */}
                        <div className="mt-4 space-y-3 cursor-pointer" onClick={() => setDrawerRow(row)}>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={cn("inline-flex rounded-md px-2 py-1 text-[11px] font-medium", TYPE_COLORS[row.requestType] || TYPE_COLORS.default)}>
                                    {row.requestType}
                                </span>
                                <span className={cn("inline-flex rounded-md px-2 py-1 text-[11px] font-medium", STATUS_STYLES[row.status])}>
                                    {row.status}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {row.daysAffected > 0 ? `${row.daysAffected} day(s)` : formatDate(row.requestDate)}
                                </span>
                            </div>
                            
                            <p className="text-sm text-foreground/85 line-clamp-2 leading-relaxed h-10">
                                "{row.reason}"
                            </p>
                        </div>

                        {/* Bottom: Actions */}
                        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                {row.attachments.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs" title="Attachments">
                                        <Paperclip className="h-3.5 w-3.5" /> {row.attachments.length}
                                    </div>
                                )}
                                {row.commentsCount > 0 && (
                                    <div className="flex items-center gap-1 text-xs" title="Comments">
                                        <MessageSquare className="h-3.5 w-3.5" /> {row.commentsCount}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground" onClick={() => setDrawerRow(row)}>
                                    Details
                                </Button>
                                        {row.status === "Pending" && (
                                          <>
                                            <Button
                                              size="sm"
                                              className="flex items-center gap-2 h-8 bg-rose-100 text-rose-800 hover:bg-rose-200"
                                              onClick={(e) => { e.stopPropagation(); handleRowAction(row, "Rejected", "Rejected from quick actions"); }}
                                              title="Reject"
                                            >
                                              <XCircle className="mr-2 h-4 w-4" /> Reject
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="flex items-center gap-2 h-8 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                              onClick={(e) => { e.stopPropagation(); handleRowAction(row, "Approved", "Approved from quick actions"); }}
                                              title="Approve"
                                            >
                                              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                            </Button>
                                          </>
                                        )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>

        {filteredRows.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-24 text-center shadow-sm">
                <div className="rounded-full bg-[#10B981] p-4 text-white">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">You're all caught up!</h3>
                <p className="mt-1 text-sm text-muted-foreground">There are no requests waiting for your approval matching these filters.</p>
                <Button variant="outline" className="mt-6" onClick={resetFilters}>Clear Filters</Button>
            </div>
        )}
      </div>

      {/* Sticky Bulk Action Toolbar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-5 py-3 shadow-2xl animate-in slide-in-from-bottom-5">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs text-primary-foreground">{selectedCount}</span>
                {selectedCount} {selectedCount === 1 ? "request" : "requests"} selected
            </span>
            <div className="h-5 w-px bg-border"></div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200" onClick={() => handleBulkAction("Approved") }>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Selected
            </Button>
            <Button size="sm" className="bg-rose-100 text-rose-800 hover:bg-rose-200" onClick={() => handleBulkAction("Rejected") }>
              <XCircle className="mr-2 h-4 w-4" /> Reject Selected
            </Button>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary" onClick={() => setSelectedIds({})}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Request Detail Side Drawer */}
      <Drawer open={!!drawerRow} onOpenChange={(open) => { if (!open) setDrawerRow(null); }}>
        <DrawerContent direction="right" className="w-full sm:w-[500px] md:w-[600px] border-l border-border bg-background text-foreground">
          <DrawerHeader className="border-b border-border bg-card sticky top-0 z-20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg font-semibold text-foreground">Request Details</DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground mt-1">{drawerRow?.requestId}</DrawerDescription>
              </div>
              <DrawerClose asChild>
                <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Section A: Employee Snapshot */}
            <section className="flex items-center gap-4">
                <img src={drawerRow?.photoUrl} alt="Avatar" className="h-16 w-16 rounded-full border border-border object-cover bg-secondary" />
                <div>
                    <h2 className="text-xl font-semibold text-foreground">{drawerRow?.employeeName}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{drawerRow?.designation} • {drawerRow?.department}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {drawerRow?.employeeId}</span>
                        <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> Reporting to {drawerRow?.reportingTo}</span>
                    </div>
                </div>
            </section>

            {/* Section B: Request Summary */}
            <section className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Request Summary
              </h3>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-5">
                  <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium text-foreground mt-1">{drawerRow?.requestType}</p>
                  </div>
                  <div>
                      <p className="text-xs text-muted-foreground">Dates / Duration</p>
                      <p className="text-sm font-medium text-foreground mt-1">
                          {drawerRow ? formatDate(drawerRow.effectiveDate) : "-"} 
                          {drawerRow?.daysAffected ? ` (${drawerRow.daysAffected} days)` : ""}
                      </p>
                  </div>
                  <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Reason</p>
                      <p className="text-sm text-foreground mt-1 leading-relaxed bg-secondary/60 p-3 rounded-lg border border-border">{drawerRow?.reason}</p>
                  </div>
              </div>

              {drawerRow?.attachments && drawerRow.attachments.length > 0 && (
                  <div>
                      <p className="text-xs text-muted-foreground mb-2">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                          {drawerRow.attachments.map(att => (
                              <a key={att} href="#" className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-[#2563EB] hover:bg-secondary/80 transition-colors">
                                  <Paperclip className="h-3.5 w-3.5" /> {att}
                              </a>
                          ))}
                      </div>
                  </div>
              )}
            </section>

            {/* Section C: Context Information */}
            <section className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4" /> Context Information
              </h3>
              <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-[#3B82F6] p-1 text-white"><CalendarDays className="h-4 w-4" /></div>
                      <div>
                          <p className="font-medium text-foreground">Existing Data</p>
                          <p className="text-muted-foreground mt-0.5">{drawerRow?.existingData}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-[#10B981] p-1 text-white"><Calendar className="h-4 w-4" /></div>
                      <div>
                          <p className="font-medium text-foreground">Balance</p>
                          <p className="text-muted-foreground mt-0.5">{drawerRow?.leaveBalance}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-[#7C3AED] p-1 text-white"><RefreshCw className="h-4 w-4" /></div>
                      <div>
                          <p className="font-medium text-foreground">Previous Requests</p>
                          <p className="text-muted-foreground mt-0.5">{drawerRow?.previousRequests}</p>
                      </div>
                  </div>
              </div>
            </section>

            {/* Section D: Approval Timeline */}
            <section className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Timeline
              </h3>
              <div className="relative pl-4 border-l border-border space-y-6">
                  {drawerRow?.timeline.map((step, idx) => (
                      <div key={idx} className="relative">
                          <div className={cn("absolute -left-[21px] flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-background", 
                              step.status === 'Approved' ? 'bg-emerald-500' : 
                              step.status === 'Rejected' ? 'bg-rose-500' : 
                              step.status === 'Pending' ? 'bg-amber-500' : 'bg-muted-foreground'
                          )} />
                          <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-foreground">{step.step}</p>
                              <span className="text-xs text-muted-foreground">{step.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.actor}</p>
                          {step.remarks && (
                              <div className="mt-2 rounded-md bg-secondary/60 p-2 text-xs text-foreground border border-border italic">
                                  "{step.remarks}"
                              </div>
                          )}
                      </div>
                  ))}
              </div>
            </section>

          </div>

          {/* Section E: Decision Panel */}
          {drawerRow?.status === "Pending" ? (
              <DrawerFooter className="border-t border-border bg-card p-6 flex-col gap-4">
                <div className="w-full">
                  <textarea
                    value={remarks}
                    onChange={(event) => { setRemarks(event.target.value); setRemarksError(""); }}
                    rows={2}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                    placeholder="Add remarks before taking action (optional for approve)..."
                  />
                  {remarksError && <p className="mt-1 text-xs font-semibold text-[#EF4444] flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {remarksError}</p>}
                </div>
                <div className="flex items-center gap-3 w-full">
                    <Button className="flex-1 bg-rose-100 text-rose-800 hover:bg-rose-200 border-none" onClick={() => drawerRow && handleRowAction(drawerRow, "Rejected") }>
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button className="flex-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200" onClick={() => drawerRow && handleRowAction(drawerRow, "Approved") }>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                    </Button>
                </div>
              </DrawerFooter>
          ) : (
              <DrawerFooter className="border-t border-border bg-card p-6">
                  <div className="flex items-center justify-between w-full p-3 rounded-lg bg-secondary/60 border border-border">
                      <div>
                          <p className="text-sm font-medium text-foreground">Request Closed</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Current status: {drawerRow?.status}</p>
                      </div>
                      <span className={cn("inline-flex rounded-md px-3 py-1.5 text-xs font-semibold", STATUS_STYLES[drawerRow?.status as RequestStatus])}>
                          {drawerRow?.status}
                      </span>
                  </div>
              </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delegate Authority Modal */}
      {showDelegateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in">
          <div className="bg-card border border-border rounded-lg w-full max-w-md mx-4 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="border-b border-border bg-card px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Delegate Approval Authority</h2>
              <p className="text-xs text-muted-foreground mt-1">Assign your approvals to another manager during your absence.</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Delegate Info */}
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Current Delegate</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium text-foreground mt-1">{currentDelegate.delegateName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Effective From</p>
                    <p className="text-sm font-medium text-foreground mt-1">{formatDate(currentDelegate.effectiveFrom)}</p>
                  </div>
                </div>
              </div>

              {/* Delegate Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Edit Delegate</h3>
                
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Delegate To *</label>
                  <select
                    value={delegateFormData.delegateName}
                    onChange={(e) => setDelegateFormData({...delegateFormData, delegateName: e.target.value})}
                    className="mt-2 w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="Priya Patel">Priya Patel - Manager</option>
                    <option value="Rohit Sharma">Rohit Sharma - Manager</option>
                    <option value="Radha Singh">Radha Singh - Manager</option>
                    <option value="Riya Menon">Riya Menon - Manager</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Effective From *</label>
                  <input
                    type="date"
                    value={delegateFormData.effectiveFrom}
                    onChange={(e) => setDelegateFormData({...delegateFormData, effectiveFrom: e.target.value})}
                    className="mt-2 w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reason (Optional)</label>
                  <textarea
                    value={delegateFormData.reason}
                    onChange={(e) => setDelegateFormData({...delegateFormData, reason: e.target.value})}
                    rows={3}
                    placeholder="E.g., On leave, medical emergency, etc."
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-card px-6 py-4 flex items-center gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowDelegateModal(false)}>
                Cancel
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {
                setCurrentDelegate({
                  delegateName: delegateFormData.delegateName,
                  effectiveFrom: delegateFormData.effectiveFrom,
                  reason: delegateFormData.reason || currentDelegate.reason,
                });
                showToast(`Delegation updated to ${delegateFormData.delegateName}`, "success");
                setShowDelegateModal(false);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Workflow Modal */}
      {showWorkflowModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-in fade-in">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="border-b border-border bg-card px-6 py-4 sticky top-0">
              <h2 className="text-lg font-semibold text-foreground">Approval Workflow Configuration</h2>
              <p className="text-xs text-muted-foreground mt-1">Workflow configured by admin - Read only view</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Workflow Type */}
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Workflow Type</p>
                <p className="text-sm font-medium text-foreground">Multi-level Approval</p>
              </div>

              {/* Approval Steps */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Approval Steps</p>
                <div className="space-y-3">
                  {[
                    { step: 1, level: "Manager Review", approvers: "Direct Manager", duration: "2 days", condition: "Auto-escalate if not approved" },
                    { step: 2, level: "HR Review", approvers: "HR Manager", duration: "1 day", condition: "Parallel review" },
                    { step: 3, level: "Finance Sign-off", approvers: "Finance Lead", duration: "1 day", condition: "For leave requests > 5 days" }
                  ].map((item) => (
                    <div key={item.step} className="relative pl-8 pb-4 border-l-2 border-primary/30">
                      <div className="absolute -left-[13px] top-0 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{item.level}</h4>
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <p><span className="font-medium text-foreground">Approvers:</span> {item.approvers}</p>
                          <p><span className="font-medium text-foreground">SLA:</span> {item.duration}</p>
                          <p><span className="font-medium text-foreground">Condition:</span> {item.condition}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto Approval Settings */}
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Auto-Approval Rules</p>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Leave ≤ 1 day: Auto-approve if balance available</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Attendance: Manual review required</li>
                  <li className="flex items-center gap-2"><span className="text-amber-500">⊘</span> Escalation: Yes, after 3 days pending</li>
                </ul>
              </div>

              {/* Notification Settings */}
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Notifications</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Email notification on new approval request</li>
                  <li>• Reminder on SLA breach (1 day before)</li>
                  <li>• SMS alert for High priority requests</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border bg-card px-6 py-4 sticky bottom-0">
              <p className="text-xs text-muted-foreground mb-3">To edit workflow configuration, contact your administrator.</p>
              <Button size="sm" className="w-full" onClick={() => setShowWorkflowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
