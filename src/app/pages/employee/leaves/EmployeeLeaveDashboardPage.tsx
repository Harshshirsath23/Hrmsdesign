import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Palmtree,
  PenLine,
  PieChart,
  Send,
  Users,
  XCircle,
} from "lucide-react";
import { LeaveStatCard } from "../../../components/leaves/employee/LeaveStatCard";
import { LeaveEmptyState } from "../../../components/leaves/employee/LeaveEmptyState";
import { LeaveTypePill } from "../../../components/leaves/employee/LeaveTypePill";
import { EmployeeLeaveStatusBadge } from "../../../components/leaves/employee/EmployeeLeaveStatusBadge";
import { formatLeaveShortDate } from "../../../components/leaves/employee/leaveDateUtils";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../components/ui/utils";
import { useEmployeeLeaveData } from "./EmployeeLeaveDataContext";

export function EmployeeLeaveDashboardPage() {
  const navigate = useNavigate();
  const { balances, applications, holidays, year, teamApplications, leaveTypes } = useEmployeeLeaveData();

  const today = new Date().toISOString().slice(0, 10);

  const metrics = useMemo(() => {
    const totalAlloc = balances.reduce((s, b) => s + Number(b.total_allocated || 0), 0);
    const used = balances.reduce((s, b) => s + Number(b.used || 0), 0);
    const remaining = balances.reduce((s, b) => s + Number(b.available || 0), 0);
    const pending = applications.filter((a) =>
      ["SUBMITTED", "DRAFT", "PENDING"].includes(a.status),
    ).length;
    const approved = applications.filter((a) => a.status === "APPROVED").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;
    const upcomingHol = holidays.filter((h) => h.date >= today).length;
    return { totalAlloc, used, remaining, pending, approved, rejected, upcomingHol };
  }, [balances, applications, holidays, today]);

  const pendingList = useMemo(
    () => applications.filter((a) => ["SUBMITTED", "DRAFT", "PENDING"].includes(a.status)),
    [applications],
  );

  const recent = useMemo(() => [...applications].slice(0, 5), [applications]);

  const upcomingHolList = useMemo(
    () => [...holidays].filter((h) => h.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4),
    [holidays, today],
  );

  const trend = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const counts = months.map(() => 0);
    for (const a of applications) {
      if (!a.from_date.startsWith(String(year))) continue;
      const m = Number(a.from_date.slice(5, 7)) - 1;
      if (m >= 0 && m < 12) counts[m] += Number(a.total_days) || 0;
    }
    const max = Math.max(1, ...counts);
    return counts.map((c) => (c / max) * 100);
  }, [applications, year]);

  const teamUpcoming = useMemo(() => {
    return [...teamApplications]
      .filter((a) => a.to_date >= today)
      .sort((a, b) => a.from_date.localeCompare(b.from_date))
      .slice(0, 5);
  }, [teamApplications, today]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Leave dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Snapshot of balances, workflow, and org calendar · FY {year}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-border text-xs font-semibold">
            <Link to="/employee/leaves/applications">View applications</Link>
          </Button>
          <Button asChild size="sm" className="h-9 rounded-xl bg-foreground text-xs font-semibold text-primary-foreground">
            <Link to="/employee/leaves/apply">
              <PenLine className="mr-1.5 h-3.5 w-3.5" />
              Apply leave
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <LeaveStatCard icon={PieChart} label="Total balance" value={metrics.totalAlloc} sub="Allocated (all types)" />
        <LeaveStatCard icon={Send} label="Used" value={metrics.used} sub="Consumed this cycle" />
        <LeaveStatCard icon={PieChart} label="Remaining" value={metrics.remaining} sub="Available now" />
        <LeaveStatCard icon={Clock} label="Pending" value={metrics.pending} sub="In approval flow" />
        <LeaveStatCard icon={CheckCircle2} label="Approved" value={metrics.approved} sub="Historical count" />
        <LeaveStatCard icon={XCircle} label="Rejected" value={metrics.rejected} sub="Historical count" />
        <LeaveStatCard icon={Palmtree} label="Holidays" value={metrics.upcomingHol} sub={`Upcoming · ${year}`} />
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="flat-card space-y-3 bg-card p-4 xl:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Leave type breakdown</h2>
            <Link
              to="/employee/leaves/balance"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Details <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {balances.length === 0 ? (
            <LeaveEmptyState icon={PieChart} title="No balances" description="Your entitlements will appear when assigned." />
          ) : (
            <div className="space-y-3">
              {balances.map((b) => {
                const t = Number(b.total_allocated) || 0;
                const u = Number(b.used) || 0;
                const pct = t > 0 ? (u / t) * 100 : 0;
                return (
                  <div key={b.id} className="rounded-xl border border-border bg-background/60 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <LeaveTypePill code={b.leave_type_detail?.code ?? "—"} />
                        <span className="truncate text-xs font-medium text-foreground">{b.leave_type_detail?.name}</span>
                      </div>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {u}/{t} d
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-foreground/75 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flat-card bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Quick actions</h2>
          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={() => navigate("/employee/leaves/apply")}
              className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-secondary"
            >
              <span className="flex items-center gap-2">
                <PenLine className="h-4 w-4 text-muted-foreground" />
                New request
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/employee/leaves/holidays")}
              className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-secondary"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Holiday calendar
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/employee/leaves/team")}
              className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-secondary"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Team availability
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flat-card overflow-hidden bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Pending approvals</h2>
            <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {pendingList.length}
            </span>
          </div>
          {pendingList.length === 0 ? (
            <div className="px-4 py-8">
              <p className="text-center text-xs text-muted-foreground">Nothing waiting on reviewers.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {pendingList.map((app) => (
                <li key={app.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/40">
                  <LeaveTypePill code={app.leave_type_detail?.code ?? "—"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{app.leave_type_detail?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatLeaveShortDate(app.from_date)} — {formatLeaveShortDate(app.to_date)}
                    </p>
                  </div>
                  <EmployeeLeaveStatusBadge status={app.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flat-card overflow-hidden bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Recent applications</h2>
            <Link to="/employee/leaves/applications" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-4 py-8">
              <p className="text-center text-xs text-muted-foreground">No history yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((app) => (
                <li key={app.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/40">
                  <LeaveTypePill code={app.leave_type_detail?.code ?? "—"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{app.leave_type_detail?.name}</p>
                    <p className="text-xs text-muted-foreground">{app.total_days}d · applied {formatLeaveShortDate(app.applied_on)}</p>
                  </div>
                  <EmployeeLeaveStatusBadge status={app.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flat-card bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Leave trends</h2>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Days by month · {year}
            </span>
          </div>
          <div className="mt-4 flex h-28 items-end gap-1">
            {trend.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-[28px] rounded-t-md bg-foreground/80 transition-all duration-500"
                  style={{ height: `${Math.max(8, h * 0.85)}%` }}
                  title={`Month ${i + 1}`}
                />
                <span className="text-[9px] font-semibold text-muted-foreground">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flat-card bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Team availability</h2>
            <Link to="/employee/leaves/team" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Open calendar
            </Link>
          </div>
          {teamUpcoming.length === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">No approved team leave in the demo dataset.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {teamUpcoming.map((a) => (
                <li
                  key={a.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-xs",
                  )}
                >
                  <span className="font-medium text-foreground">{a.employee_name}</span>
                  <span className="text-muted-foreground">
                    {formatLeaveShortDate(a.from_date)} · {a.total_days}d
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flat-card bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Upcoming holidays</h2>
          <Link to="/employee/leaves/holidays" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            Full calendar
          </Link>
        </div>
        {upcomingHolList.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">No upcoming holidays in range.</p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {upcomingHolList.map((h) => (
              <div
                key={h.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2",
                  h.date === today && "ring-1 ring-foreground/15",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{h.name}</p>
                  <p className="text-[11px] text-muted-foreground">{formatLeaveShortDate(h.date)}</p>
                </div>
                {h.is_optional && (
                  <span className="flex-shrink-0 rounded-md border border-dashed border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Opt
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{leaveTypes.length} leave types</span> are enabled for your profile.
        Policy documents are available under{" "}
        <Link to="/employee/leaves/policy" className="font-semibold text-foreground underline-offset-2 hover:underline">
          Leave policy
        </Link>
        .
      </div>
    </div>
  );
}
