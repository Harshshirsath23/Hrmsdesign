import { AlertTriangle, BarChart3, Briefcase, CalendarDays, CheckCircle2, Clock, UserCheck, Users } from "lucide-react";
import { useMemo } from "react";
import { useUpcomingHolidays } from "../../../../modules/leaves/useLeaves";
import { useAdminLeaveRequestsStore } from "../../../../modules/adminLeave/store";

function MetricCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: React.ElementType }) {
  return (
    <div className="flat-card flat-card-hover bg-card p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-foreground" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
    </div>
  );
}

export function SuperadminLeaveDashboard() {
  const { activeRows } = useAdminLeaveRequestsStore();
  const holidaysQ = useUpcomingHolidays(new Date().getFullYear());

  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const pending = activeRows.filter((r) => r.status === "SUBMITTED");
    const approvedToday = activeRows.filter((r) => r.status === "APPROVED" && r.audit.some((a) => a.action.includes("APPROVE") && a.at.startsWith(today)));
    const rejected = activeRows.filter((r) => r.status === "REJECTED");
    const onLeave = activeRows.filter((r) => r.status === "APPROVED").length;
    const escalated = activeRows.filter((r) => r.priority === "CRITICAL" && r.status === "SUBMITTED").length;
    const compOffPending = activeRows.filter((r) => r.category === "COMP_OFF" && r.status === "SUBMITTED").length;
    const activeWfh = activeRows.filter((r) => r.category === "WFH" && r.status === "APPROVED").length;
    return { pending, approvedToday, rejected, onLeave, escalated, compOffPending, activeWfh };
  }, [activeRows]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Employees on Leave" value={String(metrics.onLeave)} sub="Currently approved" icon={Users} />
        <MetricCard label="Pending Approvals" value={String(metrics.pending.length)} sub="Awaiting action" icon={Clock} />
        <MetricCard label="Approved Today" value={String(metrics.approvedToday.length)} sub="Across workflows" icon={CheckCircle2} />
        <MetricCard label="Rejected Requests" value={String(metrics.rejected.length)} sub="Current period" icon={AlertTriangle} />
        <MetricCard label="Upcoming Holidays" value={String(holidaysQ.data.length)} sub="Configured calendar" icon={CalendarDays} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="flat-card bg-card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Leave Distribution by Department</h2>
          {/* <p className="text-xs text-muted-foreground mt-1">Live view of submitted and approved requests</p> */}
          <div className="mt-5 space-y-3">
            {Object.entries(
              activeRows.reduce<Record<string, number>>((acc, row) => {
                acc[row.employee.department] = (acc[row.employee.department] ?? 0) + 1;
                return acc;
              }, {}),
            ).map(([dept, count]) => (
              <div key={dept} className="p-3 rounded-lg border border-border bg-secondary/40 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{dept}</p>
                <span className="text-[11px] font-semibold text-muted-foreground bg-card border border-border px-2 py-0.5 rounded-md">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flat-card bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">Command Center Alerts</h2>
          {/* <p className="text-xs text-muted-foreground mt-1">Escalations, special requests and workflow health</p> */}
          <div className="mt-5 space-y-3">
            {[
              { icon: Briefcase, label: "Comp Off Pending", value: metrics.compOffPending },
              { icon: UserCheck, label: "Active WFH Requests", value: metrics.activeWfh },
              { icon: AlertTriangle, label: "Escalated Requests", value: metrics.escalated },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-4 rounded-xl border border-border bg-background flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 rounded-xl border border-border bg-background">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Use Reports & Analytics for exportable deep insights.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

