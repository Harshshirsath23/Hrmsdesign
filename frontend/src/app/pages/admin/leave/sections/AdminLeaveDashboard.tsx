import {
  BarChart3,
  CalendarDays,
  Clock,
  FileText,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
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

export function AdminLeaveDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={FileText} label="Open Requests" value="18" sub="Submitted / in review" />
        <KpiCard icon={Clock} label="SLA Risk" value="3" sub="Due in 24 hours" />
        <KpiCard icon={Users} label="Absenteeism" value="6.2%" sub="30-day rolling avg" />
        <KpiCard icon={CalendarDays} label="Holidays" value="10" sub="Configured for 2026" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="flat-card bg-card p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Leave Trends</h2>
              <p className="text-xs text-muted-foreground mt-1">Monthly utilization and distribution</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-12 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="col-span-3 sm:col-span-2">
                <div className="h-20 rounded-xl bg-secondary border border-border" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-2 text-center">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flat-card bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Approvals Health</h2>
              <p className="text-xs text-muted-foreground mt-1">Bottlenecks and SLA snapshots</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              { label: "Level 1", value: "8 pending", tone: "bg-secondary" },
              { label: "Level 2", value: "6 pending", tone: "bg-secondary" },
              { label: "Escalations", value: "3 triggered", tone: "bg-secondary" },
              { label: "Auto-approvals", value: "2 enabled", tone: "bg-secondary" },
            ].map((x) => (
              <div key={x.label} className="p-4 rounded-xl border border-border bg-background hover:bg-secondary transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{x.label}</p>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                    {x.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl border border-border bg-background">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Reports & Analytics</p>
                <p className="text-xs text-muted-foreground mt-0.5">Export register, SLA, balances and trends.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

