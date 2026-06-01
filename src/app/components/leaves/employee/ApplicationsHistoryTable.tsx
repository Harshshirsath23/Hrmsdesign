import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type {
  LeaveApplicationAPI,
  LeaveApplicationStatus,
} from "../../../modules/leaves/types";
import {
  useCancelLeave,
  useResubmitLeave,
  useUpdateLeave,
} from "../../../modules/leaves/useLeaves";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { cn } from "../../ui/utils";
import {
  EmployeeLeaveStatusBadge,
  employeeLeaveStatusLabel,
} from "./EmployeeLeaveStatusBadge";
import { LeaveEmptyState } from "./LeaveEmptyState";
import { LeaveTypePill } from "./LeaveTypePill";
import {
  formatLeaveDate,
  formatLeaveShortDate,
} from "./leaveDateUtils";
 
/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
 
const MONTHS = [
  { v: "", l: "Month" },
  ...Array.from({ length: 12 }, (_, i) => ({
    v: String(i + 1),
    l: new Date(2000, i, 1).toLocaleDateString("en-IN", { month: "short" }),
  })),
];
 
const SESSION_OPTIONS = [
  { value: "1", label: "Session 1 (First Half)" },
  { value: "2", label: "Session 2 (Second Half)" },
] as const;
 
/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
 
type Session = "1" | "2";

function apiSessionToFormSession(
  session?: "first_half" | "second_half"
): Session {
  return session === "second_half" ? "2" : "1";
}

function sessionLabel(
  session?: "first_half" | "second_half"
): string {
  if (session === "first_half") return "First Half";
  if (session === "second_half") return "Second Half";
  return "-";
}
 
function sessionToPatchValue(s: Session): "session 1" | "session 2" {
  return s === "1" ? "session 1" : "session 2";
}
 
function escapeCsv(s: string) {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
 
function exportCsv(rows: LeaveApplicationAPI[]) {
  const headers = [
    "Type",
    "Code",
    "From",
    "To",
    "From Session",
    "To Session",
    "Days",
    "Status",
    "Applied",
    "Reason",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        escapeCsv(r.leave_type_detail?.name ?? ""),
        escapeCsv(r.leave_type_detail?.code ?? ""),
        r.from_date,
        r.to_date,
        escapeCsv(sessionLabel(r.from_session)),
        escapeCsv(sessionLabel(r.to_session)),
        String(r.total_days),
        escapeCsv(employeeLeaveStatusLabel(r.leave_status)),
        r.applied_on,
        escapeCsv(r.reason ?? ""),
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leave-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
 
/* ------------------------------------------------------------------ */
/*  Edit-form state type                                               */
/* ------------------------------------------------------------------ */
 
interface EditFormState {
  leaveType: string;
  from_date: string;
  to_date: string;
  fromSession: Session;
  toSession: Session;
  reason: string;
}
 
/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
 
export function ApplicationsHistoryTable({
  applications,
  leaveTypeOptions,
}: {
  applications: LeaveApplicationAPI[];
  leaveTypeOptions: { id: string; name: string; code: string }[];
}) {
  /* ── filter state ───────────────────────────────────────────────── */
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [status, setStatus] = useState<"" | LeaveApplicationStatus>("");
  const [pendingBucket, setPendingBucket] = useState<"" | "in" | "out">("");
  const [category, setCategory] = useState<"" | "paid" | "unpaid">("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
 
  /* ── dialog state ───────────────────────────────────────────────── */
  const [detail, setDetail] = useState<LeaveApplicationAPI | null>(null);
  const [editLeave, setEditLeave] = useState<LeaveApplicationAPI | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    leaveType: "",
    from_date: "",
    to_date: "",
    fromSession: "1",
    toSession: "2",
    reason: "",
  });
 
  /* ── mutations ──────────────────────────────────────────────────── */
  const updateMutation = useUpdateLeave();
  const cancelMutation = useCancelLeave();
  const resubmitMutation = useResubmitLeave();
 
  /* ── handlers ───────────────────────────────────────────────────── */
  const openEditLeave = (app: LeaveApplicationAPI) => {
    setEditLeave(app);
    setEditForm({
      leaveType: app.leave_type_id,
      from_date: app.from_date,
      to_date: app.to_date,
      fromSession: apiSessionToFormSession(app.from_session),
      toSession: apiSessionToFormSession(app.to_session),
      reason: app.reason ?? "",
    });
  };
 
  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editLeave) return;
 
    updateMutation.mutate(
      {
        id: editLeave.id,
        payload: {
          // field names the PATCH endpoint expects
          start_date: editForm.from_date,
          end_date: editForm.to_date,
          from_session: sessionToPatchValue(editForm.fromSession),
          to_session: sessionToPatchValue(editForm.toSession),
          reason: editForm.reason.trim(),
        } as any,
      },
      {
        onSuccess: () => setEditLeave(null),
      }
    );
  };
 
  const handleCancelLeave = (app: LeaveApplicationAPI) => {
    cancelMutation.mutate(app.id);
  };
 
  const handleResubmitLeave = (app: LeaveApplicationAPI) => {
    resubmitMutation.mutate(app.id);
  };
 
  /* ── derived ────────────────────────────────────────────────────── */
  const years = useMemo(() => {
    const y = new Set<number>();
    y.add(new Date().getFullYear());
    for (const a of applications) {
      y.add(new Date(a.from_date).getFullYear());
      y.add(new Date(a.to_date).getFullYear());
    }
    return Array.from(y).sort((a, b) => b - a);
  }, [applications]);
 
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (q) {
        const blob =
          `${a.leave_type_detail?.name ?? ""} ${a.leave_type_detail?.code ?? ""} ${a.reason} ${a.status}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (leaveTypeId && a.leave_type !== leaveTypeId) return false;
      if (status && a.status !== status) return false;
      if (category === "paid" && !a.leave_type_detail?.is_paid) return false;
      if (category === "unpaid" && a.leave_type_detail?.is_paid) return false;
 
      if (pendingBucket === "in") {
        if (
          a.status !== "SUBMITTED" &&
          a.status !== "DRAFT" &&
          a.status !== "PENDING"
        )
          return false;
      }
      if (pendingBucket === "out") {
        if (
          a.status === "SUBMITTED" ||
          a.status === "DRAFT" ||
          a.status === "PENDING"
        )
          return false;
      }
 
      const from = new Date(a.from_date);
      if (month && String(from.getMonth() + 1) !== month) return false;
      if (year && String(from.getFullYear()) !== year) return false;
      if (rangeStart && a.to_date < rangeStart) return false;
      if (rangeEnd && a.from_date > rangeEnd) return false;
      return true;
    });
  }, [
    applications,
    search,
    month,
    year,
    leaveTypeId,
    status,
    pendingBucket,
    category,
    rangeStart,
    rangeEnd,
  ]);
 
  const reset = () => {
    setSearch("");
    setMonth("");
    setYear("");
    setLeaveTypeId("");
    setStatus("");
    setPendingBucket("");
    setCategory("");
    setRangeStart("");
    setRangeEnd("");
  };
 
  const filterSelect =
    "flat-input h-10 min-w-[8rem] flex-1 rounded-lg px-3 text-xs font-medium sm:min-w-0 sm:flex-none sm:max-w-[12rem]";
 
  /* ── empty state ────────────────────────────────────────────────── */
  if (applications.length === 0) {
    return (
<LeaveEmptyState
        icon={FileText}
        title="No applications yet"
        description="Submit a leave request to build your history. Filters and export will appear once you have records."
      />
    );
  }
 
  /* ── render ─────────────────────────────────────────────────────── */
  return (
<div className="space-y-5">
      {/* ── Filters bar ─────────────────────────────────────────────── */}
<div className="flat-card bg-card p-5 sm:p-6">
<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
<div className="relative min-w-0 flex-1 max-w-md">
<Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
<input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search type, code, reason, status…"
              className="flat-input h-10 w-full rounded-xl pl-10 pr-4 text-sm"
            />
</div>
<div className="flex flex-wrap items-center gap-3">
<Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 gap-2 rounded-lg border-border px-4 text-sm font-semibold"
              onClick={() => exportCsv(filtered)}
>
<Download className="h-4 w-4" />
              Export
</Button>
</div>
</div>
 
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
<span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
<SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
</span>
<select
            className={filterSelect}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
>
            {MONTHS.map((m) => (
<option key={m.v || "all"} value={m.v}>
                {m.l}
</option>
            ))}
</select>
<select
            className={filterSelect}
            value={year}
            onChange={(e) => setYear(e.target.value)}
>
<option value="">Year</option>
            {years.map((y) => (
<option key={y} value={String(y)}>
                {y}
</option>
            ))}
</select>
<select
            className={filterSelect}
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
>
<option value="">Leave type</option>
            {leaveTypeOptions.map((lt) => (
<option key={lt.id} value={lt.id}>
                {lt.name} ({lt.code})
</option>
            ))}
</select>
<select
            className={filterSelect}
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "" | LeaveApplicationStatus)
            }
>
<option value="">Status</option>
<option value="DRAFT">Draft</option>
<option value="SUBMITTED">Submitted</option>
<option value="PENDING">Pending</option>
<option value="APPROVED">Approved</option>
<option value="REJECTED">Rejected</option>
<option value="CANCELLED">Cancelled</option>
<option value="REVOKED">Revoked</option>
</select>
<select
            className={filterSelect}
            value={pendingBucket}
            onChange={(e) =>
              setPendingBucket(e.target.value as "" | "in" | "out")
            }
>
<option value="">Pending filter</option>
<option value="in">In workflow</option>
<option value="out">Resolved</option>
</select>
<select
            className={filterSelect}
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as typeof category)
            }
>
<option value="">Category</option>
<option value="paid">Paid</option>
<option value="unpaid">Unpaid</option>
</select>
<input
            type="date"
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
            className={cn(filterSelect, "min-w-[9rem]")}
            aria-label="Range start"
          />
<input
            type="date"
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
            className={cn(filterSelect, "min-w-[9rem]")}
            aria-label="Range end"
          />
<Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
            onClick={reset}
>
            Reset
</Button>
</div>
</div>
 
      {/* ── Table ───────────────────────────────────────────────────── */}
<div className="flat-card overflow-hidden bg-card">
<div className="overflow-x-auto">
<table className="w-full min-w-[900px] text-left">
<thead className="sticky top-0 z-10 bg-secondary/95 backdrop-blur-sm">
<tr className="border-b border-border">
                {[
                  "Leave",
                  "From",
                  "To",
                  "From Session",
                  "To Session",
                  "Days",
                  "Reason",
                  "Applied",
                  "Status",
                  "",
                ].map((h) => (
<th
                    key={h || "actions"}
                    className="whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-5"
>
                    {h}
</th>
                ))}
</tr>
</thead>
<tbody className="divide-y divide-border">
              {filtered.map((app) => {
                const rowStatus = app.leave_status.toUpperCase();
                return (
<tr
                    key={app.id}
                    className="transition-colors duration-150 hover:bg-secondary/60"
>
                    {/* Leave type */}
<td className="px-4 py-3 sm:px-5">
<div className="flex items-center gap-2">
<LeaveTypePill
                          code={app.leave_type_detail?.code ?? "—"}
                        />
<div className="min-w-0">
<p className="truncate text-sm font-medium text-foreground">
                            {app.leave_type_detail?.name}
</p>
<p className="text-[11px] text-muted-foreground">
                            {app.leave_type_detail?.is_paid ? "Paid" : "Unpaid"}
</p>
</div>
</div>
</td>
 
                    {/* From date */}
<td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-5">
                      {formatLeaveShortDate(app.from_date)}
</td>
 
                    {/* To date */}
<td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-5">
                      {formatLeaveShortDate(app.to_date)}
</td>
 
                    {/* From Session */}
<td className="whitespace-nowrap px-4 py-3 sm:px-5">
<span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
                        {sessionLabel(app.from_session)}
</span>
</td>
 
                    {/* To Session */}
<td className="whitespace-nowrap px-4 py-3 sm:px-5">
<span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
                        {sessionLabel(app.to_session)}
</span>
</td>
 
                    {/* Days */}
<td className="whitespace-nowrap px-4 py-3 text-sm font-semibold tabular-nums text-foreground sm:px-5">
                      {app.total_days}
</td>
 
                    {/* Reason */}
<td className="max-w-[200px] px-4 py-3 sm:max-w-[240px] sm:px-5">
<p
                        className="truncate text-sm text-muted-foreground"
                        title={app.reason}
>
                        {app.reason}
</p>
</td>
 
                    {/* Applied on */}
<td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-5">
                      {formatLeaveDate(app.applied_at)}
</td>
 
                    {/* Status */}
<td className="px-4 py-3 sm:px-5">
<EmployeeLeaveStatusBadge status={app.leave_status} />
</td>
 
                    {/* Actions */}
<td className="px-2 py-3 text-right sm:px-4">
<DropdownMenu>
<DropdownMenuTrigger asChild>
<button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            aria-label="Row actions"
>
<MoreHorizontal className="h-4 w-4" />
</button>
</DropdownMenuTrigger>
 
                        <DropdownMenuContent
                          align="end"
                          sideOffset={6}
                          className="z-50 w-52 rounded-xl border border-border bg-popover p-1 shadow-lg"
>
                          {(rowStatus === "PENDING" ||
                            rowStatus === "SUBMITTED" ||
                            rowStatus === "DRAFT") && (
<>
<DropdownMenuItem
                                className="cursor-pointer rounded-md text-sm"
                                onClick={() => openEditLeave(app)}
>
                                Edit pending leave
</DropdownMenuItem>
<DropdownMenuItem
                                className="cursor-pointer rounded-md text-sm text-red-500 focus:text-red-500"
                                onClick={() => handleCancelLeave(app)}
                                disabled={cancelMutation.isPending}
>
                                Cancel leave
</DropdownMenuItem>
</>
                          )}
 
                          {(rowStatus === "REJECTED" ||
                            rowStatus === "CANCELLED") && (
<DropdownMenuItem
                              className="cursor-pointer rounded-md text-sm"
                              onClick={() => handleResubmitLeave(app)}
                              disabled={resubmitMutation.isPending}
>
                              Resubmit leave
</DropdownMenuItem>
                          )}
 
                          <DropdownMenuItem
                            className="cursor-pointer rounded-md text-sm"
                            onClick={() => setDetail(app)}
>
                            View details
</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu>
</td>
</tr>
                );
              })}
</tbody>
</table>
</div>
 
        {filtered.length === 0 && (
<div className="border-t border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No rows match your filters.
</div>
        )}
</div>
 
      {/* ── View details dialog ──────────────────────────────────────── */}
<Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
<DialogContent className="max-w-md rounded-xl border-border">
<DialogHeader>
<DialogTitle className="text-base">Application details</DialogTitle>
</DialogHeader>
          {detail && (
<div className="space-y-2 text-sm">
<div className="flex flex-wrap items-center gap-2">
<LeaveTypePill code={detail.leave_type_detail?.code ?? "—"} />
<EmployeeLeaveStatusBadge status={detail.leave_status} />
</div>
<p className="text-muted-foreground">
<span className="font-medium text-foreground">
                  {detail.leave_type_detail?.name}
</span>{" "}
                · {detail.total_days} day{detail.total_days !== 1 ? "s" : ""}
</p>
<p className="text-xs text-muted-foreground">
                {formatLeaveDate(detail.from_date)} —{" "}
                {formatLeaveDate(detail.to_date)}
</p>
<div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs">
<div>
<p className="font-semibold text-foreground">From Session</p>
<p className="mt-0.5 text-muted-foreground">
                    {sessionLabel(detail.from_session)}
</p>
</div>
<div>
<p className="font-semibold text-foreground">To Session</p>
<p className="mt-0.5 text-muted-foreground">
                    {sessionLabel(detail.to_session)}
</p>
</div>
</div>
<div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs">
<p className="font-semibold text-foreground">Reason</p>
<p className="mt-1 text-muted-foreground">{detail.reason}</p>
</div>
<p className="text-xs text-muted-foreground">
                Applied on {formatLeaveDate(detail.applied_at)}
</p>
</div>
          )}
</DialogContent>
</Dialog>
 
      {/* ── Edit leave modal ─────────────────────────────────────────── */}
      {!!editLeave && (
<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !updateMutation.isPending && setEditLeave(null)}
>
<form
            className="relative flex max-h-[90vh] w-[92vw] max-w-md flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveEdit}
>
            {/* Header */}
<div className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-border bg-card px-5 py-4">
<div>
<p className="text-base font-semibold text-foreground">
                  Edit pending leave
</p>
<p className="mt-1 text-xs text-muted-foreground">
                  Update dates, sessions, or reason. Changes are saved
                  immediately.
</p>
</div>
<button
                type="button"
                onClick={() => setEditLeave(null)}
                disabled={updateMutation.isPending}
                className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
>
<X className="h-4 w-4" />
</button>
</div>
 
            {/* Body */}
<div className="flex-1 space-y-4 overflow-y-auto p-5">
              {/* Leave type (read-only display — type change requires cancel + reapply) */}
<div className="space-y-1.5">
<span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Leave Type
</span>
<div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 text-sm text-muted-foreground">
                  {leaveTypeOptions.find((lt) => lt.id === editForm.leaveType)
                    ?.name ?? "—"}
<span className="ml-auto text-xs opacity-60">(cannot change)</span>
</div>
</div>
 
              {/* Dates */}
<div className="grid gap-3 sm:grid-cols-2">
<label className="space-y-1.5 text-sm">
<span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    From Date <span className="text-red-500">*</span>
</span>
<Input
                    type="date"
                    value={editForm.from_date}
                    required
                    onChange={(e) =>
                      setEditForm((c) => ({ ...c, from_date: e.target.value }))
                    }
                  />
</label>
 
                <label className="space-y-1.5 text-sm">
<span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    To Date <span className="text-red-500">*</span>
</span>
<Input
                    type="date"
                    value={editForm.to_date}
                    min={editForm.from_date || undefined}
                    required
                    onChange={(e) =>
                      setEditForm((c) => ({ ...c, to_date: e.target.value }))
                    }
                  />
</label>
</div>
 
              {/* Sessions */}
<div className="grid gap-3 sm:grid-cols-2">
<label className="space-y-1.5 text-sm">
<span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    From Session <span className="text-red-500">*</span>
</span>
<select
                    value={editForm.fromSession}
                    required
                    onChange={(e) =>
                      setEditForm((c) => ({
                        ...c,
                        fromSession: e.target.value as Session,
                      }))
                    }
                    className="flat-input h-10 w-full rounded-xl px-3 text-sm"
>
                    {SESSION_OPTIONS.map((s) => (
<option key={s.value} value={s.value}>
                        {s.label}
</option>
                    ))}
</select>
</label>
 
                <label className="space-y-1.5 text-sm">
<span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    To Session <span className="text-red-500">*</span>
</span>
<select
                    value={editForm.toSession}
                    required
                    onChange={(e) =>
                      setEditForm((c) => ({
                        ...c,
                        toSession: e.target.value as Session,
                      }))
                    }
                    className="flat-input h-10 w-full rounded-xl px-3 text-sm"
>
                    {SESSION_OPTIONS.map((s) => (
<option key={s.value} value={s.value}>
                        {s.label}
</option>
                    ))}
</select>
</label>
</div>
 
              {/* Reason */}
<label className="block space-y-1.5 text-sm">
<span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Reason <span className="text-red-500">*</span>
</span>
<Textarea
                  value={editForm.reason}
                  required
                  onChange={(e) =>
                    setEditForm((c) => ({ ...c, reason: e.target.value }))
                  }
                  className="min-h-[100px]"
                  placeholder="Describe the reason for your leave…"
                />
</label>
 
              {/* Original details chip */}
<div className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-xs text-muted-foreground">
<p className="font-semibold text-foreground">Current details</p>
<p className="mt-1.5">
                  Applied on:{" "}
<span className="text-foreground">
                    {formatLeaveDate(editLeave.applied_at)}
</span>
</p>
<p>
                  Status:{" "}
<span className="text-foreground">{editLeave.leave_status}</span>
</p>
</div>
 
              {/* API error */}
              {updateMutation.isError && (
<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {(updateMutation.error as Error)?.message ||
                    "Failed to update leave. Please try again."}
</div>
              )}
</div>
 
            {/* Footer */}
<div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border bg-card px-5 py-4">
<Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditLeave(null)}
                disabled={updateMutation.isPending}
>
                Cancel
</Button>
<Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
>
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
</Button>
</div>
</form>
</div>
      )}
</div>
  );
}