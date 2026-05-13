import { useState } from "react";
import { attendanceDataset, requestBadgeClass } from "../../modules/attendance/store";
import { RequestType } from "../../modules/attendance/types";

const tabs: RequestType[] = ["Regularization", "Leave", "Overtime", "Comp-Off"];

export function RequestsManager() {
  const [tab, setTab] = useState<RequestType>("Regularization");
  const rows = attendanceDataset.requests.filter((r) => r.type === tab);

  return (
    <div className="flat-card bg-card p-4">
      <div className="flex gap-2 mb-3 flex-wrap">
        {tabs.map((entry) => (
          <button key={entry} onClick={() => setTab(entry)} className={`h-8 px-3 rounded text-xs border ${tab === entry ? "bg-secondary border-border" : "border-border text-muted-foreground"}`}>{entry}</button>
        ))}
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{row.date} · {row.reason}</p>
              <span className={`text-xs px-2 py-0.5 border rounded ${requestBadgeClass[row.status]}`}>{row.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Old: {row.oldValue || "—"} | New: {row.newValue || "—"} | Step: {row.workflowStep || "Pending"}</p>
            <p className="text-xs text-muted-foreground mt-1">Comment: {row.comments || "None"}</p>
            <div className="flex gap-2 mt-2">
              <button className="text-xs px-2 py-1 border border-border rounded">Approve</button>
              <button className="text-xs px-2 py-1 border border-border rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
