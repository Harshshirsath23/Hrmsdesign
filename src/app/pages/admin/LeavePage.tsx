import { useState } from "react";
import { Check, X, Clock, CalendarDays, Filter } from "lucide-react";
import { leaveRequests as initialRequests, LeaveRequest, LeaveStatus } from "../../components/employees/mockAdminData";

const STATUS_BADGE: Record<LeaveStatus, string> = {
  Pending:  "bg-[#6C757D] text-white",
  Approved: "bg-[#212529] text-[#F8F9FA]",
  Rejected: "bg-[#CED4DA] text-[#212529]",
};

const STATUS_DOT: Record<LeaveStatus, string> = {
  Pending:  "bg-[#6C757D]",
  Approved: "bg-[#212529]",
  Rejected: "bg-[#ADB5BD]",
};

function StatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium ${STATUS_BADGE[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

export function LeavePage() {
  const [requests, setRequests]     = useState<LeaveRequest[]>(initialRequests);
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | "All">("All");
  const [filterType, setFilterType]     = useState("All");

  const update = (id: string, status: LeaveStatus) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const types    = ["All", ...Array.from(new Set(initialRequests.map((r) => r.leaveType)))];
  const filtered = requests.filter((r) => {
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    const matchType   = filterType === "All" || r.leaveType === filterType;
    return matchStatus && matchType;
  });

  const counts = {
    total:    requests.length,
    pending:  requests.filter((r) => r.status === "Pending").length,
    approved: requests.filter((r) => r.status === "Approved").length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
  };

  return (
    <div className="p-6 space-y-6">

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total",    value: counts.total    },
          { label: "Pending",  value: counts.pending  },
          { label: "Approved", value: counts.approved },
          { label: "Rejected", value: counts.rejected },
        ].map(({ label, value }) => (
          <div key={label} className="flat-card flat-card-hover bg-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ──────────────────────────────────── */}
      <div className="flat-card bg-card overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Leave Requests</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as LeaveStatus | "All")}
              className="flat-input text-sm px-3 py-2 cursor-pointer appearance-none font-medium"
            >
              <option value="All">All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flat-input text-sm px-3 py-2 cursor-pointer appearance-none font-medium"
            >
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary border-b border-border">
                {["Employee", "Leave Type", "Duration", "Days", "Reason", "Applied On", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-secondary transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: req.avatarColor }}
                      >
                        {req.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{req.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{req.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground whitespace-nowrap">{req.leaveType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(req.from).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      {req.from !== req.to && (
                        <> – {new Date(req.to).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                      {req.days}d
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground max-w-[200px] truncate" title={req.reason}>{req.reason}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(req.appliedOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4">
                    {req.status === "Pending" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => update(req.id, "Approved")}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#212529] hover:bg-[#343A40] text-white text-xs font-medium rounded-md transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => update(req.id, "Rejected")}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-secondary hover:bg-[#CED4DA] text-foreground text-xs font-medium rounded-md border border-border transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => update(req.id, "Pending")}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-muted-foreground
                          border border-border rounded-md hover:bg-secondary transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" /> Undo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-muted-foreground">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-border bg-secondary text-xs text-muted-foreground font-medium">
          Showing {filtered.length} of {requests.length} requests
        </div>
      </div>
    </div>
  );
}
