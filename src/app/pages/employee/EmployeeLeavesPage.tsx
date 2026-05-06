import { useState } from "react";
import { Plus, CalendarDays, X, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { employees } from "../../components/employees/mockData";
import { leaveRequests } from "../../components/employees/mockAdminData";

const STATUS_BADGE: Record<string, string> = {
  Approved: "bg-[#212529] text-[#F8F9FA]",
  Pending:  "bg-[#6C757D] text-white",
  Rejected: "bg-[#CED4DA] text-[#212529]",
};

const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Earned Leave", "Maternity Leave", "Emergency Leave"];

/* ── Apply Leave Modal ─────────────────────────────────────── */
function ApplyLeaveModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ type: LEAVE_TYPES[0], from: "", to: "", reason: "" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#212529]/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Apply for Leave</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Leave Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="flat-input w-full px-3 py-2.5 text-sm cursor-pointer appearance-none"
            >
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                From Date
              </label>
              <input
                type="date"
                value={form.from}
                onChange={(e) => setForm({ ...form, from: e.target.value })}
                className="flat-input w-full px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                To Date
              </label>
              <input
                type="date"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                className="flat-input w-full px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Reason
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Briefly describe the reason for leave…"
              rows={3}
              className="flat-input w-full px-3 py-2.5 text-sm resize-none"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-primary-foreground text-sm font-medium rounded-lg hover:bg-accent transition-colors"
          >
            <Check className="w-4 h-4" /> Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export function EmployeeLeavesPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const emp      = employees.find((e) => e.id === user?.employeeId) || employees[0];
  const myLeaves = leaveRequests.filter((l) => l.employeeId === emp.employeeId);

  const leaveBalance = [
    { type: "Casual Leave",  total: 12, used: 3, remaining: 9  },
    { type: "Sick Leave",    total: 10, used: 2, remaining: 8  },
    { type: "Earned Leave",  total: 15, used: 5, remaining: 10 },
  ];

  return (
    <>
      <div className="p-6 space-y-6">

        {/* ── Header ────────────────────────────────────── */}
        <div className="flat-card bg-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">My Leaves</h1>
            <p className="text-sm text-muted-foreground mt-1">View history and apply for new leaves</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-primary-foreground text-sm font-medium rounded-lg
              hover:bg-accent transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Apply Leave
          </button>
        </div>

        {/* ── Leave Balance ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaveBalance.map(({ type, total, used, remaining }) => (
            <div key={type} className="flat-card bg-card p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{type}</p>
              <div className="flex items-end justify-between mb-3">
                <span className="text-3xl font-bold text-foreground">{remaining}</span>
                <span className="text-xs text-muted-foreground">/ {total} days</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-secondary border border-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full"
                  style={{ width: `${(remaining / total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{used} days used</p>
            </div>
          ))}
        </div>

        {/* ── History Table ──────────────────────────────── */}
        <div className="flat-card bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Leave History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  {["Leave Type", "From", "To", "Days", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myLeaves.length > 0 ? myLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-secondary transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
                          <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{req.leaveType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(req.from).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(req.to).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{req.days} days</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium ${STATUS_BADGE[req.status] || ""}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {req.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
                      No leave requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && <ApplyLeaveModal onClose={() => setShowModal(false)} />}
    </>
  );
}
