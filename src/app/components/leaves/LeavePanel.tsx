import type { ElementType } from "react";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Palmtree,
  PieChart,
  Plus,
  Send,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "../ui/utils";
import { HolidayCalendarView } from "./HolidayCalendarView";
import {
  useAllLeaveApplications,
  useApproveLeave,
  useApplyLeave,
  useLeaveTypes,
  useMyLeaveApplications,
  useMyLeaveBalances,
  useRejectLeave,
  useUpcomingHolidays,
} from "../../modules/leaves/useLeaves";
import type { HolidayAPI, LeaveApplicationAPI, LeaveBalanceAPI } from "../../modules/leaves/types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  APPROVED: "default",
  SUBMITTED: "secondary",
  DRAFT: "outline",
  REJECTED: "destructive",
  CANCELLED: "outline",
  REVOKED: "destructive",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function TypePill({ code, color }: { code: string; color?: string }) {
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary border border-border text-[10px] font-bold text-foreground flex-shrink-0"
      style={color ? { borderColor: color } : undefined}
      title={code}
    >
      {code}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  sub,
}: {
  icon: ElementType;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function BalanceCards({ balances }: { balances: LeaveBalanceAPI[] }) {
  if (balances.length === 0) {
    return <EmptyState icon={PieChart} title="No leave balances found" sub="Once configured, balances will appear here." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {balances.map((b) => {
        const code = b.leave_type_detail?.code ?? "??";
        const name = b.leave_type_detail?.name ?? "Leave";
        const total = Number(b.total_allocated) || 0;
        const used = Number(b.used) || 0;
        const available = Number(b.available) || 0;
        const pending = Number(b.pending_approval) || 0;
        const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
        const accent = b.leave_type_detail?.color_code;

        return (
          <div key={b.id} className="flat-card flat-card-hover bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <TypePill code={code} color={accent} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.leave_type_detail?.is_paid ? "Paid" : "Unpaid"} · {formatShortDate(b.period_start)} — {formatShortDate(b.period_end)}
                  </p>
                </div>
              </div>
              {pending > 0 && (
                <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md whitespace-nowrap">
                  {pending} pending
                </span>
              )}
            </div>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-lg font-bold text-foreground">{total}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Allocated</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground/80">{used}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Used</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{available}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Available</p>
                </div>
              </div>

              <div className="h-2 bg-secondary border border-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: accent ? accent : "var(--foreground)",
                    opacity: accent ? 0.85 : 1,
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>{pct.toFixed(0)}% used</span>
                <span>{used} of {total} days</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ApplicationsTable({ applications }: { applications: LeaveApplicationAPI[] }) {
  if (applications.length === 0) {
    return <EmptyState icon={FileText} title="No leave applications" sub="Apply for leave and track status here." />;
  }

  return (
    <div className="flat-card bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-secondary border-b border-border">
              {["Leave Type", "From", "To", "Days", "Reason", "Applied On", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((app) => {
              const code = app.leave_type_detail?.code ?? "??";
              const accent = app.leave_type_detail?.color_code;
              return (
                <tr key={app.id} className="hover:bg-secondary transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <TypePill code={code} color={accent} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{app.leave_type_detail?.name ?? "Leave"}</p>
                        <p className="text-xs text-muted-foreground">{app.leave_type_detail?.is_paid ? "Paid" : "Unpaid"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{formatShortDate(app.from_date)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{formatShortDate(app.to_date)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground whitespace-nowrap">{app.total_days}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground max-w-[220px] truncate" title={app.reason}>
                      {app.reason}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{formatDate(app.applied_on)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={STATUS_VARIANT[app.status] ?? "outline"} className="gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {app.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HolidaysYearList({ holidays }: { holidays: HolidayAPI[] }) {
  if (holidays.length === 0) {
    return <EmptyState icon={Palmtree} title="No holidays found" sub="Once configured, the holiday list will show here." />;
  }

  const grouped = useMemo(() => {
    const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));
    const map = new Map<string, HolidayAPI[]>();
    for (const h of sorted) {
      const m = new Date(h.date).toLocaleDateString("en-IN", { month: "long" });
      map.set(m, [...(map.get(m) ?? []), h]);
    }
    return Array.from(map.entries());
  }, [holidays]);

  return (
    <div className="space-y-4">
      {grouped.map(([month, items]) => (
        <div key={month} className="flat-card bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{month}</p>
            <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
              {items.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {items.map((h) => {
              const d = new Date(h.date);
              const day = d.toLocaleDateString("en-IN", { weekday: "short" });
              const isPast = d < new Date(new Date().toISOString().slice(0, 10));
              return (
                <div key={h.id} className={cn("px-6 py-4 flex items-center justify-between gap-4", isPast && "opacity-60")}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{h.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {day} · {formatDate(h.date)} · {h.holiday_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {h.is_optional && (
                      <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
                        Optional
                      </Badge>
                    )}
                    <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                      {d.getDate().toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplyLeaveForm({
  employee,
  onSuccess,
  balances,
}: {
  employee: { employee_code: string; employee_name: string };
  balances: LeaveBalanceAPI[];
  onSuccess: () => void;
}) {
  const { data: leaveTypes = [] } = useLeaveTypes();
  const applyLeave = useApplyLeave(employee);

  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromHalf, setFromHalf] = useState<"FULL" | "AM" | "PM">("FULL");
  const [toHalf, setToHalf] = useState<"FULL" | "AM" | "PM">("FULL");
  const [reason, setReason] = useState("");
  const [contactDuringLeave, setContactDuringLeave] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  const totalDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) return 0;
    let days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (fromHalf !== "FULL") days -= 0.5;
    if (toHalf !== "FULL" && fromDate !== toDate) days -= 0.5;
    return Math.max(days, 0.5);
  }, [fromDate, toDate, fromHalf, toHalf]);

  const selectedBalance = useMemo(() => {
    if (!leaveType) return null;
    return balances.find((b) => b.leave_type === leaveType) ?? null;
  }, [leaveType, balances]);

  const exceedsBalance =
    selectedBalance ? totalDays > Number(selectedBalance.available || 0) : false;

  const canSubmit =
    !!leaveType && !!fromDate && !!toDate && !!reason.trim() && totalDays > 0 && !exceedsBalance;

  const labelClass = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        applyLeave.mutate(
          {
            leave_type: leaveType,
            from_date: fromDate,
            to_date: toDate,
            from_half: fromHalf,
            to_half: toHalf,
            total_days: totalDays,
            reason: reason.trim(),
            contact_during_leave: contactDuringLeave.trim() || undefined,
            document_url: documentUrl.trim() || undefined,
          },
          {
            onSuccess: () => {
              setLeaveType("");
              setFromDate("");
              setToDate("");
              setFromHalf("FULL");
              setToHalf("FULL");
              setReason("");
              setContactDuringLeave("");
              setDocumentUrl("");
              onSuccess();
            },
          },
        );
      }}
      className="flat-card bg-card p-6 max-w-3xl"
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4" /> Apply for Leave
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Submit a new leave request for approval.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
            Employee: {employee.employee_code}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelClass}>Leave Type *</label>
          <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="flat-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none font-medium" required>
            <option value="">Select leave type</option>
            {leaveTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name} ({lt.code})
              </option>
            ))}
          </select>
          {selectedBalance && (
            <p className="mt-2 text-xs text-muted-foreground">
              Available: <span className="font-semibold text-foreground">{Number(selectedBalance.available)}</span> days · Used:{" "}
              <span className="font-semibold text-foreground">{Number(selectedBalance.used)}</span> days
              {exceedsBalance && (
                <span className="ml-2 text-destructive font-semibold">
                  (Exceeds available balance)
                </span>
              )}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>From Date *</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="flat-input w-full px-3 py-2.5 text-sm" required />
        </div>
        <div>
          <label className={labelClass}>To Date *</label>
          <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} className="flat-input w-full px-3 py-2.5 text-sm" required />
        </div>

        <div>
          <label className={labelClass}>From Session</label>
          <select value={fromHalf} onChange={(e) => setFromHalf(e.target.value as "FULL" | "AM" | "PM")} className="flat-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none font-medium">
            <option value="FULL">Full Day</option>
            <option value="AM">First Half</option>
            <option value="PM">Second Half</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>To Session</label>
          <select value={toHalf} onChange={(e) => setToHalf(e.target.value as "FULL" | "AM" | "PM")} className="flat-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none font-medium">
            <option value="FULL">Full Day</option>
            <option value="AM">First Half</option>
            <option value="PM">Second Half</option>
          </select>
        </div>

        {totalDays > 0 && (
          <div className="md:col-span-2 p-3 rounded-lg bg-secondary border border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              Total Days
            </div>
            <span className="text-sm font-bold text-foreground">{totalDays}</span>
          </div>
        )}

        <div className="md:col-span-2">
          <label className={labelClass}>Reason *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="flat-input w-full px-3 py-2.5 text-sm resize-none"
            placeholder="Briefly describe the reason for leave…"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Contact During Leave</label>
          <input
            type="text"
            value={contactDuringLeave}
            onChange={(e) => setContactDuringLeave(e.target.value)}
            className="flat-input w-full px-3 py-2.5 text-sm"
            placeholder="Phone or alternate contact"
          />
        </div>
        <div>
          <label className={labelClass}>Document URL</label>
          <input
            type="url"
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
            className="flat-input w-full px-3 py-2.5 text-sm"
            placeholder="Supporting document link (optional)"
          />
        </div>
      </div>

      {applyLeave.isError && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {(applyLeave.error as Error)?.message || "Failed to submit leave application."}
        </div>
      )}

      {applyLeave.isSuccess && (
        <div className="mt-4 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground">
          Leave application submitted successfully.
        </div>
      )}

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={applyLeave.isPending || !canSubmit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-foreground text-primary-foreground hover:bg-accent"
        >
          <Send className="w-4 h-4" />
          {applyLeave.isPending ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}

function AdminLeaveApprovalView({
  applications,
  onDataChange,
}: {
  applications: LeaveApplicationAPI[];
  onDataChange: () => void;
}) {
  const approveMut = useApproveLeave();
  const rejectMut = useRejectLeave();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const pending = useMemo(() => applications.filter((a) => a.status === "SUBMITTED"), [applications]);
  const resolved = useMemo(
    () => applications.filter((a) => a.status !== "SUBMITTED" && a.status !== "DRAFT"),
    [applications],
  );

  const AppRow = ({ app }: { app: LeaveApplicationAPI }) => {
    const isPending = app.status === "SUBMITTED";
    const accent = app.leave_type_detail?.color_code;
    return (
      <div className="flat-card bg-card p-4 flex flex-wrap items-center gap-3">
        <TypePill code={app.leave_type_detail?.code ?? "L"} color={accent} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{app.employee_name}</p>
          <p className="text-xs text-muted-foreground">
            {app.leave_type_detail?.name} · {formatShortDate(app.from_date)} — {formatShortDate(app.to_date)} · {app.total_days} day
            {app.total_days > 1 ? "s" : ""}
          </p>
          {app.reason && <p className="mt-1 truncate text-xs italic text-muted-foreground">"{app.reason}"</p>}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[app.status] ?? "outline"} className="gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {app.status}
          </Badge>
          {isPending && (
            <>
              <button
                type="button"
                disabled={approveMut.isPending}
                onClick={async () => {
                  await approveMut.mutate(app.id);
                  onDataChange();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-primary-foreground hover:bg-accent disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                type="button"
                disabled={rejectMut.isPending}
                onClick={() => {
                  setRejectId(app.id);
                  setRejectRemarks("");
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary border border-border text-foreground hover:bg-background disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {rejectId && (
        <div className="flat-card bg-card p-5 border border-destructive/40">
          <p className="text-sm font-semibold text-foreground mb-2">Rejection Remarks (optional)</p>
          <textarea
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            rows={2}
            className="flat-input w-full px-3 py-2.5 text-sm resize-none"
            placeholder="Reason for rejection..."
          />
          <div className="mt-3 flex gap-2 justify-end">
            <button
              type="button"
              disabled={rejectMut.isPending}
              onClick={async () => {
                await rejectMut.mutate({ id: rejectId, remarks: rejectRemarks.trim() || undefined });
                setRejectId(null);
                onDataChange();
              }}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-foreground text-primary-foreground hover:bg-accent disabled:opacity-50"
            >
              Confirm Reject
            </button>
            <button
              type="button"
              onClick={() => setRejectId(null)}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-secondary border border-border text-foreground hover:bg-background"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-muted-foreground" /> Pending Approval
          {pending.length > 0 && (
            <span className="ml-1 text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <div className="flat-card bg-card p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-secondary border border-border mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">All caught up</p>
            <p className="mt-1 text-xs text-muted-foreground">No pending requests right now.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((app) => (
              <AppRow key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      {resolved.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" /> Recent Decisions ({resolved.length})
          </h2>
          <div className="space-y-2">
            {resolved.slice(0, 10).map((app) => (
              <AppRow key={app.id} app={app} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LeavePanel({ mode }: { mode: "employee" | "admin" }) {
  const { user } = useAuth();
  const employee_code = user?.role === "employee" ? "EMP-0001" : "EMP-0001";
  const employee_name = user?.name ?? "Employee";

  const [activeTab, setActiveTab] = useState(mode === "admin" ? "approvals" : "dashboard");
  const [holidayView, setHolidayView] = useState<"list" | "calendar">("list");
  const year = new Date().getFullYear();

  const balancesQ = useMyLeaveBalances(employee_code);
  const appsQ = useMyLeaveApplications(employee_code);
  const allAppsQ = useAllLeaveApplications();
  const holidaysQ = useUpcomingHolidays(year);

  const balances = balancesQ.data ?? [];
  const applications = appsQ.data ?? [];
  const pendingApps = useMemo(
    () => applications.filter((a) => a.status === "SUBMITTED" || a.status === "DRAFT"),
    [applications],
  );

  const dashboard = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: PieChart,
            label: "Available",
            value: balances.reduce((s, b) => s + Number(b.available || 0), 0).toString(),
            sub: "Across all types",
          },
          {
            icon: CheckCircle2,
            label: "Used",
            value: balances.reduce((s, b) => s + Number(b.used || 0), 0).toString(),
            sub: "This period",
          },
          {
            icon: Send,
            label: "Applications",
            value: applications.length.toString(),
            sub: "Total submitted",
          },
          {
            icon: Palmtree,
            label: "Holidays",
            value: holidaysQ.data.length.toString(),
            sub: `Year ${year}`,
          },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="flat-card flat-card-hover bg-card p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {pendingApps.length > 0 && (
        <div className="flat-card bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" /> Pending Approval
            </h2>
            <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
              {pendingApps.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {pendingApps.map((app) => (
              <div key={app.id} className="px-6 py-4 flex items-center gap-4">
                <TypePill code={app.leave_type_detail?.code ?? "L"} color={app.leave_type_detail?.color_code} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{app.leave_type_detail?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatShortDate(app.from_date)} — {formatShortDate(app.to_date)} · {app.total_days} day{app.total_days > 1 ? "s" : ""}
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  Pending
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {mode === "employee" && (
        <div className="flat-card bg-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">My Leaves</h1>
            <p className="text-sm text-muted-foreground mt-1">Balances, applications and holiday calendar</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("apply")}
            className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-primary-foreground text-sm font-medium rounded-lg hover:bg-accent transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Apply Leave
          </button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          {mode === "employee" ? (
            <>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="balances">Balance Leaves</TabsTrigger>
              <TabsTrigger value="applications">My Applications</TabsTrigger>
              <TabsTrigger value="apply">Apply Leave</TabsTrigger>
              <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="all">All Applications</TabsTrigger>
            </>
          )}
        </TabsList>

        {mode === "employee" && (
          <>
            <TabsContent value="dashboard" className="pt-2">
              {dashboard}
            </TabsContent>

            <TabsContent value="balances" className="pt-2">
              <BalanceCards balances={balances} />
            </TabsContent>

            <TabsContent value="applications" className="pt-2">
              <ApplicationsTable applications={applications} />
            </TabsContent>

            <TabsContent value="apply" className="pt-2">
              <ApplyLeaveForm
                employee={{ employee_code, employee_name }}
                balances={balances}
                onSuccess={() => {
                  appsQ.refresh();
                  balancesQ.refresh();
                  setActiveTab("applications");
                }}
              />
            </TabsContent>

            <TabsContent value="holidays" className="pt-2">
              <div className="space-y-4">
                <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit">
                  {([
                    { id: "list", label: "List View" },
                    { id: "calendar", label: "Calendar View" },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setHolidayView(t.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                        holidayView === t.id
                          ? "bg-card text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {holidayView === "calendar" ? (
                  <HolidayCalendarView holidays={holidaysQ.data} initialYear={year} />
                ) : (
                  <HolidaysYearList holidays={holidaysQ.data} />
                )}
              </div>
            </TabsContent>
          </>
        )}

        {mode === "admin" && (
          <>
            <TabsContent value="approvals" className="pt-2">
              <AdminLeaveApprovalView
                applications={allAppsQ.data}
                onDataChange={() => {
                  allAppsQ.refresh();
                }}
              />
            </TabsContent>
            <TabsContent value="all" className="pt-2">
              <ApplicationsTable applications={allAppsQ.data} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

