import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getChangeRequests, getEmployeeDisplayName, reviewChangeRequest } from "../../modules/ess/storage";
import { RequestStatus } from "../../modules/ess/types";
import { buildDiffRows, maskSensitive } from "../../modules/ess/utils";

export function ProfileChangeRequestsPage() {
  const { user } = useAuth();
  const [refreshTick, setRefreshTick] = useState(0);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState("");

  const requests = useMemo(() => {
    const all = getChangeRequests();
    if (statusFilter === "all") return all;
    return all.filter((request) => request.status === statusFilter);
  }, [statusFilter, refreshTick]);

  const approve = (id: string) => {
    reviewChangeRequest({
      requestId: id,
      reviewer: user?.name ?? "Admin",
      status: "approved",
    });
    setRefreshTick((value) => value + 1);
  };

  const reject = (id: string) => {
    reviewChangeRequest({
      requestId: id,
      reviewer: user?.name ?? "Admin",
      status: "rejected",
      rejectionComment,
    });
    setRejectingId(null);
    setRejectionComment("");
    setRefreshTick((value) => value + 1);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Profile Change Requests</h2>
          <p className="text-sm text-muted-foreground">Review employee-submitted profile updates and approve or reject.</p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`h-9 px-4 rounded-lg text-sm border ${
                statusFilter === status
                  ? "bg-secondary border-border text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {requests.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No change requests found for selected filter.
        </div>
      )}

      {requests.map((request) => {
        const diffRows = buildDiffRows(request.changes.oldValue, request.changes.newValue);
        const isPending = request.status === "pending";
        return (
          <section key={request.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">{request.section_label}</h3>
                <p className="text-xs text-muted-foreground">
                  Employee: {getEmployeeDisplayName(request.employee_id)} ({request.employee_id}) | Requested:{" "}
                  {new Date(request.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <span className="text-xs rounded-full border border-border px-2 py-0.5 capitalize">{request.status}</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-2 font-semibold text-muted-foreground">Field</th>
                    <th className="text-left p-2 font-semibold text-muted-foreground">Old Value</th>
                    <th className="text-left p-2 font-semibold text-muted-foreground">New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {diffRows.length === 0 && (
                    <tr>
                      <td className="p-2 text-muted-foreground" colSpan={3}>
                        No field-level differences found.
                      </td>
                    </tr>
                  )}
                  {diffRows.map((row) => (
                    <tr key={row.field} className="border-t border-border">
                      <td className="p-2 font-medium text-foreground">{row.field}</td>
                      <td className="p-2 text-muted-foreground">{maskSensitive(row.field, row.oldValue) || "—"}</td>
                      <td className="p-2 text-foreground">{maskSensitive(row.field, row.newValue) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {request.rejection_comment && (
              <p className="text-sm text-destructive">Rejection Comment: {request.rejection_comment}</p>
            )}

            {isPending && (
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => approve(request.id)} className="h-9 px-4 rounded-lg bg-foreground text-primary-foreground text-sm">
                  Approve
                </button>
                <button
                  onClick={() => setRejectingId(request.id)}
                  className="h-9 px-4 rounded-lg border border-border text-sm text-foreground"
                >
                  Reject
                </button>
                {rejectingId === request.id && (
                  <>
                    <input
                      value={rejectionComment}
                      onChange={(event) => setRejectionComment(event.target.value)}
                      placeholder="Optional rejection comment"
                      className="h-9 rounded-lg border border-border bg-background px-3 text-sm min-w-72"
                    />
                    <button onClick={() => reject(request.id)} className="h-9 px-4 rounded-lg bg-secondary border border-border text-sm">
                      Confirm Reject
                    </button>
                  </>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
