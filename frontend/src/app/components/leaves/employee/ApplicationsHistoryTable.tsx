import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { LeaveApplicationAPI, LeaveApplicationStatus } from "../../../modules/leaves/types";
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
import {
  Drawer,
  DrawerClose,
  DrawerContent as DrawerPaneContent,
  DrawerHeader as DrawerPaneHeader,
  DrawerTitle as DrawerPaneTitle,
} from "../../ui/drawer";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { cn } from "../../ui/utils";
import { EmployeeLeaveStatusBadge, employeeLeaveStatusLabel } from "./EmployeeLeaveStatusBadge";
import { LeaveEmptyState } from "./LeaveEmptyState";
import { LeaveTypePill } from "./LeaveTypePill";
import { formatLeaveDate, formatLeaveShortDate } from "./leaveDateUtils";

const MONTHS = [
  { v: "", l: "Month" },
  ...Array.from({ length: 12 }, (_, i) => ({
    v: String(i + 1),
    l: new Date(2000, i, 1).toLocaleDateString("en-IN", { month: "short" }),
  })),
];

function escapeCsv(s: string) {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function exportCsv(rows: LeaveApplicationAPI[]) {
  const headers = ["Type", "Code", "From", "To", "Days", "Status", "Applied", "Reason"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        escapeCsv(r.leave_type_detail?.name ?? ""),
        escapeCsv(r.leave_type_detail?.code ?? ""),
        r.from_date,
        r.to_date,
        String(r.total_days),
        escapeCsv(employeeLeaveStatusLabel(r.status)),
        r.applied_on,
        escapeCsv(r.reason ?? ""),
      ].join(","),
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

export function ApplicationsHistoryTable({
  applications,
  leaveTypeOptions,
}: {
  applications: LeaveApplicationAPI[];
  leaveTypeOptions: { id: string; name: string; code: string }[];
}) {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [status, setStatus] = useState<"" | LeaveApplicationStatus>("");
  const [pendingBucket, setPendingBucket] = useState<"" | "in" | "out">("");
  const [category, setCategory] = useState<"" | "paid" | "unpaid">("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [detail, setDetail] = useState<LeaveApplicationAPI | null>(null);
  const [editLeave, setEditLeave] = useState<LeaveApplicationAPI | null>(null);
  const [editForm, setEditForm] = useState({
    leaveType: "",
    from_date: "",
    to_date: "",
    from_half: "FULL" as LeaveApplicationAPI["from_half"],
    to_half: "FULL" as LeaveApplicationAPI["to_half"],
    total_days: 0,
    reason: "",
  });

  const openEditLeave = (app: LeaveApplicationAPI) => {
    setEditLeave(app);
    setEditForm({
      leaveType: app.leave_type,
      from_date: app.from_date,
      to_date: app.to_date,
      from_half: app.from_half,
      to_half: app.to_half,
      total_days: app.total_days,
      reason: app.reason ?? "",
    });
  };

  const handleEditLeave = (app: LeaveApplicationAPI) => {
    openEditLeave(app);
  };

  const handleSaveEdit = async () => {
    console.log("Save mock edit:", editLeave?.id, editForm);
    setEditLeave(null);
  };

const handleCancelLeave = async (app: LeaveApplicationAPI) => {
  try {
    console.log("Cancel leave:", app);

    // Example API call
    // await cancelLeaveApplication(app.id)

    // toast.success("Leave cancelled successfully")
  } catch (error) {
    console.error(error);

    // toast.error("Failed to cancel leave")
  }
};

const handleResubmitLeave = async (app: LeaveApplicationAPI) => {
  try {
    console.log("Resubmit leave:", app);

    // Example API call
    // await resubmitLeaveApplication(app.id)

    // toast.success("Leave resubmitted successfully")
  } catch (error) {
    console.error(error);

    // toast.error("Failed to resubmit leave")
  }
};

  const years = useMemo(() => {
    const y = new Set<number>();
    y.add(new Date().getFullYear());
    for (const a of applications) {
      y.add(new Date(a.from_date).getFullYear());
      y.add(new Date(a.applied_on).getFullYear());
    }
    return Array.from(y).sort((a, b) => b - a);
  }, [applications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (q) {
        const blob = `${a.leave_type_detail?.name ?? ""} ${a.leave_type_detail?.code ?? ""} ${a.reason} ${a.status}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (leaveTypeId && a.leave_type !== leaveTypeId) return false;
      if (status && a.status !== status) return false;
      if (category === "paid" && !a.leave_type_detail?.is_paid) return false;
      if (category === "unpaid" && a.leave_type_detail?.is_paid) return false;

      if (pendingBucket === "in") {
        if (a.status !== "SUBMITTED" && a.status !== "DRAFT" && a.status !== "PENDING") return false;
      }
      if (pendingBucket === "out") {
        if (a.status === "SUBMITTED" || a.status === "DRAFT" || a.status === "PENDING") return false;
      }

      const from = new Date(a.from_date);
      if (month && String(from.getMonth() + 1) !== month) return false;
      if (year && String(from.getFullYear()) !== year) return false;

      if (rangeStart && a.to_date < rangeStart) return false;
      if (rangeEnd && a.from_date > rangeEnd) return false;

      return true;
    });
  }, [applications, search, month, year, leaveTypeId, status, pendingBucket, category, rangeStart, rangeEnd]);

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

  if (applications.length === 0) {
    return (
      <LeaveEmptyState
        icon={FileText}
        title="No applications yet"
        description="Submit a leave request to build your history. Filters and export will appear once you have records."
      />
    );
  }

  return (
    <div className="space-y-5">
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
          <select className={filterSelect} value={month} onChange={(e) => setMonth(e.target.value)}>
            {MONTHS.map((m) => (
              <option key={m.v || "all"} value={m.v}>
                {m.l}
              </option>
            ))}
          </select>
          <select className={filterSelect} value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
          <select className={filterSelect} value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
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
            onChange={(e) => setStatus(e.target.value as "" | LeaveApplicationStatus)}
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
            onChange={(e) => setPendingBucket(e.target.value as "" | "in" | "out")}
          >
            <option value="">Pending filter</option>
            <option value="in">In workflow</option>
            <option value="out">Resolved</option>
          </select>
          <select className={filterSelect} value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
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

      <div className="flat-card overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="sticky top-0 z-10 bg-secondary/95 backdrop-blur-sm">
              <tr className="border-b border-border">
                {["Leave", "From", "To", "Days", "Reason", "Applied", "Status", ""].map((h) => (
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
                const rowStatus = app.status.toUpperCase();
                return (
                  <tr key={app.id} className="transition-colors duration-150 hover:bg-secondary/60">
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2">
                        <LeaveTypePill code={app.leave_type_detail?.code ?? "—"} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{app.leave_type_detail?.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {app.leave_type_detail?.is_paid ? "Paid" : "Unpaid"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-5">
                      {formatLeaveShortDate(app.from_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-5">
                      {formatLeaveShortDate(app.to_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold tabular-nums text-foreground sm:px-5">
                      {app.total_days}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 sm:max-w-[240px] sm:px-5">
                      <p className="truncate text-sm text-muted-foreground" title={app.reason}>
                        {app.reason}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-5">
                      {formatLeaveDate(app.applied_on)}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <EmployeeLeaveStatusBadge status={app.status} />
                    </td>
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
                          {(rowStatus === "PENDING" || rowStatus === "SUBMITTED" || rowStatus === "DRAFT") && (
                            <>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-md text-sm"
                                onClick={() => handleEditLeave(app)}
                              >
                                Edit pending leave
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="cursor-pointer rounded-md text-sm text-red-500 focus:text-red-500"
                                onClick={() => handleCancelLeave(app)}
                              >
                                Cancel leave
                              </DropdownMenuItem>
                            </>
                          )}

                          {(rowStatus === "REJECTED" || rowStatus === "CANCELLED") && (
                            <DropdownMenuItem
                              className="cursor-pointer rounded-md text-sm"
                              onClick={() => handleResubmitLeave(app)}
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

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-md rounded-xl border-border">
          <DialogHeader>
            <DialogTitle className="text-base">Application details</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <LeaveTypePill code={detail.leave_type_detail?.code ?? "—"} />
                <EmployeeLeaveStatusBadge status={detail.status} />
              </div>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{detail.leave_type_detail?.name}</span> ·{" "}
                {detail.total_days} day{detail.total_days !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatLeaveDate(detail.from_date)} — {formatLeaveDate(detail.to_date)}
              </p>
              <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs">
                <p className="font-semibold text-foreground">Reason</p>
                <p className="mt-1 text-muted-foreground">{detail.reason}</p>
              </div>
              <p className="text-xs text-muted-foreground">Applied on {formatLeaveDate(detail.applied_on)}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Drawer open={!!editLeave} onOpenChange={(open) => !open && setEditLeave(null)} direction="right">
        <DrawerPaneContent className="max-w-md border-l border-border bg-background">
          <DrawerPaneHeader className="border-b border-border bg-card sticky top-0 z-10 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <DrawerPaneTitle className="text-base">Edit pending leave</DrawerPaneTitle>
                <p className="text-xs text-muted-foreground mt-1">Mock edit flow for pending requests.</p>
              </div>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </DrawerClose>
            </div>
          </DrawerPaneHeader>

          <div className="space-y-4 p-5">
            <div className="grid gap-4">
              <label className="space-y-2 text-sm">
                <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Leave type</span>
                <select
                  value={editForm.leaveType}
                  onChange={(e) => setEditForm((curr) => ({ ...curr, leaveType: e.target.value }))}
                  className="flat-input h-10 w-full rounded-xl px-3 text-sm"
                >
                  {leaveTypeOptions.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} ({lt.code})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">From</span>
                  <Input
                    type="date"
                    value={editForm.from_date}
                    onChange={(e) => setEditForm((curr) => ({ ...curr, from_date: e.target.value }))}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">To</span>
                  <Input
                    type="date"
                    value={editForm.to_date}
                    onChange={(e) => setEditForm((curr) => ({ ...curr, to_date: e.target.value }))}
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm">
                <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Reason</span>
                <Textarea
                  value={editForm.reason}
                  onChange={(e) => setEditForm((curr) => ({ ...curr, reason: e.target.value }))}
                  className="min-h-[120px]"
                />
              </label>
            </div>

            <div className="rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Request details</p>
              <p className="mt-2">Applied on: {editLeave?.applied_on}</p>
              <p>Status: {editLeave?.status}</p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditLeave(null)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSaveEdit}>
                Save changes
              </Button>
            </div>
          </div>
        </DrawerPaneContent>
      </Drawer>
    </div>
  );
}
