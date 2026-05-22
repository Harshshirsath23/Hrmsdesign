import { useState } from "react";
import { Plus, Search, Filter, ChevronDown, Users, Calendar, CheckCircle2, Clock, XCircle, MoreHorizontal, TrendingUp } from "lucide-react";

type AllocationStatus = "active" | "pending" | "expired";
type AllocationMethod = "manual" | "policy" | "carry-forward";

interface LeaveAllocation {
  id: string;
  employee: { name: string; avatar: string; department: string; role: string };
  leaveType: string;
  leaveTypeColor: string;
  allocated: number;
  used: number;
  remaining: number;
  period: string;
  method: AllocationMethod;
  status: AllocationStatus;
  allocatedBy: string;
  allocatedOn: string;
}

const MOCK_ALLOCATIONS: LeaveAllocation[] = [
  {
    id: "1",
    employee: { name: "Priya Sharma", avatar: "PS", department: "Engineering", role: "Senior Engineer" },
    leaveType: "Annual Leave",
    leaveTypeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    allocated: 18,
    used: 7,
    remaining: 11,
    period: "Jan 2025 – Dec 2025",
    method: "policy",
    status: "active",
    allocatedBy: "System (Policy)",
    allocatedOn: "01 Jan 2025",
  },
  {
    id: "2",
    employee: { name: "Rahul Mehta", avatar: "RM", department: "Product", role: "Product Manager" },
    leaveType: "Sick Leave",
    leaveTypeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    allocated: 10,
    used: 3,
    remaining: 7,
    period: "Jan 2025 – Dec 2025",
    method: "policy",
    status: "active",
    allocatedBy: "System (Policy)",
    allocatedOn: "01 Jan 2025",
  },
  {
    id: "3",
    employee: { name: "Aisha Khan", avatar: "AK", department: "Design", role: "UI/UX Lead" },
    leaveType: "Casual Leave",
    leaveTypeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    allocated: 12,
    used: 12,
    remaining: 0,
    period: "Jan 2025 – Dec 2025",
    method: "manual",
    status: "active",
    allocatedBy: "Admin (Deepak)",
    allocatedOn: "15 Jan 2025",
  },
  {
    id: "4",
    employee: { name: "Vikram Nair", avatar: "VN", department: "Sales", role: "Account Executive" },
    leaveType: "Annual Leave",
    leaveTypeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    allocated: 5,
    used: 0,
    remaining: 5,
    period: "Jan 2025 – Dec 2025",
    method: "carry-forward",
    status: "active",
    allocatedBy: "System (Carry-forward)",
    allocatedOn: "01 Jan 2025",
  },
  {
    id: "5",
    employee: { name: "Sneha Patel", avatar: "SP", department: "HR", role: "HR Specialist" },
    leaveType: "Maternity Leave",
    leaveTypeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    allocated: 90,
    used: 60,
    remaining: 30,
    period: "Mar 2025 – Jun 2025",
    method: "manual",
    status: "active",
    allocatedBy: "Admin (Ritu)",
    allocatedOn: "01 Mar 2025",
  },
  {
    id: "6",
    employee: { name: "Arjun Desai", avatar: "AD", department: "Engineering", role: "DevOps Engineer" },
    leaveType: "Compensatory Off",
    leaveTypeColor: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    allocated: 3,
    used: 1,
    remaining: 2,
    period: "Apr 2025 – Jun 2025",
    method: "manual",
    status: "pending",
    allocatedBy: "Admin (Deepak)",
    allocatedOn: "02 Apr 2025",
  },
  {
    id: "7",
    employee: { name: "Meena Iyer", avatar: "MI", department: "Finance", role: "Finance Analyst" },
    leaveType: "Annual Leave",
    leaveTypeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    allocated: 18,
    used: 18,
    remaining: 0,
    period: "Jan 2024 – Dec 2024",
    method: "policy",
    status: "expired",
    allocatedBy: "System (Policy)",
    allocatedOn: "01 Jan 2024",
  },
];

const METHOD_LABELS: Record<AllocationMethod, { label: string; color: string }> = {
  manual: { label: "Manual", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
  policy: { label: "Policy", color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300" },
  "carry-forward": { label: "Carry-forward", color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
};

const STATUS_CONFIG: Record<AllocationStatus, { label: string; icon: React.ElementType; color: string }> = {
  active: { label: "Active", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
  pending: { label: "Pending", icon: Clock, color: "text-amber-600 dark:text-amber-400" },
  expired: { label: "Expired", icon: XCircle, color: "text-slate-400" },
};

function UsageBar({ used, allocated }: { used: number; allocated: number }) {
  const pct = allocated === 0 ? 0 : Math.min(100, (used / allocated) * 100);
  const color = pct >= 100 ? "bg-rose-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

export function AdminLeaveAllocations({ onAddAllocation }: { onAddAllocation?: () => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AllocationStatus | "all">("all");

  const filtered = MOCK_ALLOCATIONS.filter((a) => {
    const matchSearch =
      a.employee.name.toLowerCase().includes(search.toLowerCase()) ||
      a.leaveType.toLowerCase().includes(search.toLowerCase()) ||
      a.employee.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAllocated = MOCK_ALLOCATIONS.reduce((s, a) => s + a.allocated, 0);
  const totalUsed = MOCK_ALLOCATIONS.reduce((s, a) => s + a.used, 0);
  const activeCount = MOCK_ALLOCATIONS.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Allocations", value: MOCK_ALLOCATIONS.length, icon: Users, sub: "across all employees" },
          { label: "Active", value: activeCount, icon: CheckCircle2, sub: "currently running" },
          { label: "Days Allocated", value: totalAllocated, icon: Calendar, sub: "this period" },
          { label: "Days Used", value: totalUsed, icon: TrendingUp, sub: `${Math.round((totalUsed / totalAllocated) * 100)}% utilisation` },
        ].map((card) => (
          <div key={card.label} className="flat-card bg-card px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{card.label}</span>
              <card.icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-black text-foreground tabular-nums">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="flat-card bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Leave Allocations</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee or leave type…"
                className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-56"
              />
            </div>
            {/* Status filter */}
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AllocationStatus | "all")}
                className="pl-8 pr-7 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={() => onAddAllocation?.()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-primary-foreground hover:bg-accent transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Allocation
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Employee", "Leave Type", "Period", "Allocated", "Used", "Remaining", "Usage", "Method", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                    No allocations found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const status = STATUS_CONFIG[row.status];
                  const method = METHOD_LABELS[row.method];
                  return (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                      {/* Employee */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                            {row.employee.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{row.employee.name}</p>
                            <p className="text-[10px] text-muted-foreground">{row.employee.department} · {row.employee.role}</p>
                          </div>
                        </div>
                      </td>
                      {/* Leave Type */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${row.leaveTypeColor}`}>
                          {row.leaveType}
                        </span>
                      </td>
                      {/* Period */}
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{row.period}</td>
                      {/* Allocated */}
                      <td className="px-4 py-3 text-center font-semibold text-foreground tabular-nums">{row.allocated}</td>
                      {/* Used */}
                      <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">{row.used}</td>
                      {/* Remaining */}
                      <td className="px-4 py-3 text-center tabular-nums font-semibold text-foreground">{row.remaining}</td>
                      {/* Usage bar */}
                      <td className="px-4 py-3 min-w-[100px]">
                        <UsageBar used={row.used} allocated={row.allocated} />
                      </td>
                      {/* Method */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${method.color}`}>
                          {method.label}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-medium ${status.color}`}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {MOCK_ALLOCATIONS.length} allocations</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded hover:bg-muted transition-colors disabled:opacity-40" disabled>← Prev</button>
            <span className="px-2 py-1 rounded bg-foreground text-primary-foreground font-semibold">1</span>
            <button className="px-2 py-1 rounded hover:bg-muted transition-colors disabled:opacity-40" disabled>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}