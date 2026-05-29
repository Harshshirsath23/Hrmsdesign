import { useState } from "react";
import { attendanceDataset, requestBadgeClass } from "../../modules/attendance/store";
import { RequestType } from "../../modules/attendance/types";

const tabs: RequestType[] = ["Regularization", "Leave", "Overtime", "Comp-Off"];

export function RequestsManager() {
  const [tab, setTab] = useState<RequestType>("Regularization");
  const rows = attendanceDataset.requests.filter((r) => r.type === tab);

  return (
    <div className="flat-card bg-card p-3">
      <div className="flex gap-1.5 mb-2 flex-wrap">
        {tabs.map((entry) => (
          <button key={entry} onClick={() => setTab(entry)} className={`h-7 px-2 rounded text-[11px] font-medium border ${tab === entry ? "bg-secondary border-border" : "border-border text-muted-foreground"}`}>{entry}</button>
        ))}
      </div>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-border p-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">{row.date} · {row.reason}</p>
              <span className={`text-[10px] px-1.5 py-0.5 border rounded ${requestBadgeClass[row.status]}`}>{row.status}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Old: {row.oldValue || "—"} | New: {row.newValue || "—"} | Step: {row.workflowStep || "Pending"}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Comment: {row.comments || "None"}</p>
            <div className="flex gap-1.5 mt-1.5">
              <button className="text-[10px] font-medium px-2 py-0.5 border border-border rounded">Approve</button>
              <button className="text-[10px] font-medium px-2 py-0.5 border border-border rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
