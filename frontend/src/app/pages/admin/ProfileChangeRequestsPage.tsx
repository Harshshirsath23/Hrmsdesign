import { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle2, Clock3, Search, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { useAuth } from "../../context/AuthContext";
import { fetchRequests, reviewRequest } from "../../../store/slices/requestSlice";
import type { ProfileRequest } from "../../../store/slices/requestSlice";

type StatusFilter = "all" | ProfileRequest["status"];

const statusTabs: StatusFilter[] = ["all", "pending", "approved", "rejected"];

const statusStyles: Record<ProfileRequest["status"], string> = {
  pending: "border-amber-200 bg-amber-500/10 text-amber-700",
  approved: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
  rejected: "border-rose-200 bg-rose-500/10 text-rose-700",
};

const statusIcons = {
  pending: Clock3,
  approved: CheckCircle2,
  rejected: XCircle,
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProfileChangeRequestsPage() {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const requests = useSelector((state: RootState) => state.requests.requests);
  const requestStatus = useSelector((state: RootState) => state.requests.status);
  const employees = useSelector((state: RootState) => state.admin.employees);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState("");

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const employeeNameById = useMemo(() => {
    const names = new Map<string, string>();
    employees.forEach((employee) => {
      names.set(employee.id, employee.name);
      names.set(employee.employeeId, employee.name);
    });
    return names;
  }, [employees]);

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((request) => request.status === "pending").length,
      approved: requests.filter((request) => request.status === "approved").length,
      rejected: requests.filter((request) => request.status === "rejected").length,
    }),
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return requests.filter((request) => {
      if (statusFilter !== "all" && request.status !== statusFilter) return false;

      const createdTime = new Date(request.createdAt).getTime();
      if (fromTime !== null && createdTime < fromTime) return false;
      if (toTime !== null && createdTime > toTime) return false;

      if (!normalizedSearch) return true;

      const employeeName = employeeNameById.get(request.employeeId) ?? "";
      const searchable = [
        request.employeeId,
        employeeName,
        request.sectionLabel,
        request.status,
        ...request.changes.flatMap((change) => [
          change.fieldLabel,
          change.fieldName,
          String(change.oldValue ?? ""),
          String(change.newValue ?? ""),
        ]),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [dateFrom, dateTo, employeeNameById, requests, searchQuery, statusFilter]);

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
  };

  const approve = async (request: ProfileRequest) => {
    await dispatch(
      reviewRequest({
        requestId: request.id,
        status: "approved",
        reviewer: user?.name ?? "Admin",
        employeeId: request.employeeId,
        section: request.section,
      })
    ).unwrap();
  };

  const reject = async (request: ProfileRequest) => {
    await dispatch(
      reviewRequest({
        requestId: request.id,
        status: "rejected",
        reviewer: user?.name ?? "Admin",
        rejectionComment,
        employeeId: request.employeeId,
        section: request.section,
      })
    ).unwrap();
    setRejectingId(null);
    setRejectionComment("");
  };

  return (
    <div className="min-h-full bg-background p-6">
      <div className="space-y-5">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">Profile Change Requests</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review employee-submitted profile updates and approve or reject requests.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {statusTabs.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg border px-4 py-2 text-left transition-colors ${
                    statusFilter === status
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase tracking-widest">{status}</span>
                  <span className="mt-1 block text-lg font-black">{counts[status]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by employee, section, status, or request details"
                className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-foreground/40"
              />
            </div>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-foreground/40"
              />
            </div>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-foreground/40"
              />
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="h-11 rounded-lg border border-border px-4 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
            >
              Clear
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <p className="text-sm font-bold text-foreground">{filteredRequests.length} visible requests</p>
              <p className="text-xs text-muted-foreground">
                {requestStatus === "loading" ? "Refreshing requests..." : "Live from employee and manager submissions"}
              </p>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-bold text-foreground">No profile requests found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                New employee or manager submissions will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredRequests.map((request) => {
                const employeeName = employeeNameById.get(request.employeeId) ?? "Unknown Employee";
                const StatusIcon = statusIcons[request.status];
                const isPending = request.status === "pending";

                return (
                  <article key={request.id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-foreground">{request.sectionLabel}</h3>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${statusStyles[request.status]}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {request.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {employeeName} ({request.employeeId}) | {formatDateTime(request.createdAt)}
                        </p>
                      </div>

                      {isPending ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => approve(request)}
                            className="h-9 rounded-lg bg-foreground px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-foreground/90"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingId(request.id)}
                            className="h-9 rounded-lg border border-border px-4 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 overflow-hidden rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary/70">
                          <tr>
                            <th className="p-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Field
                            </th>
                            <th className="p-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Submitted Detail
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {request.changes.map((change) => (
                            <tr key={`${request.id}-${change.fieldName}`} className="border-t border-border">
                              <td className="w-64 p-3 font-bold text-foreground">{change.fieldLabel}</td>
                              <td className="p-3 text-muted-foreground">{String(change.newValue || "-")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {request.rejectionComment ? (
                      <p className="mt-3 rounded-lg border border-rose-200 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
                        Rejection Comment: {request.rejectionComment}
                      </p>
                    ) : null}

                    {rejectingId === request.id ? (
                      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
                        <input
                          value={rejectionComment}
                          onChange={(event) => setRejectionComment(event.target.value)}
                          placeholder="Add rejection comment"
                          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-foreground/40"
                        />
                        <button
                          type="button"
                          onClick={() => reject(request)}
                          className="h-10 rounded-lg bg-foreground px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-foreground/90"
                        >
                          Confirm Reject
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
