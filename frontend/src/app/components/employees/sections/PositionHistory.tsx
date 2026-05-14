import { Employee } from "../mockData";
import { Briefcase, User } from "lucide-react";

interface Props {
  employee: Employee;
}

function DataCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
      <div className="text-sm font-medium text-foreground mt-1">{children}</div>
    </div>
  );
}

export function PositionHistory({ employee }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Position History</h2>
        <p className="text-sm text-muted-foreground mt-1">Career progression within the organization</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-6 bottom-6 w-px bg-border" />

        <div className="space-y-5">
          {employee.positionHistory.map((pos, index) => (
            <div key={index} className="flex gap-5 relative">
              {/* Timeline dot */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 z-10 border ${
                index === 0
                  ? "bg-foreground border-foreground"
                  : "bg-card border-border"
              }`}>
                <Briefcase className={`w-5 h-5 ${index === 0 ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>

              <div className={`flex-1 flat-card bg-card p-5 ${index === 0 ? "border-foreground/30" : ""}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{pos.title}</h4>
                    <p className="text-xs font-semibold text-muted-foreground mt-0.5">{pos.department}</p>
                  </div>
                  {index === 0 && (
                    <span className="text-[10px] uppercase tracking-wider bg-foreground text-primary-foreground px-2.5 py-1 rounded-md font-bold">
                      Current
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <DataCell label="From">
                    {new Date(pos.from).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </DataCell>
                  <DataCell label="To">
                    {pos.to === "Present" ? (
                      <span className="font-semibold">Present</span>
                    ) : (
                      new Date(pos.to).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    )}
                  </DataCell>
                  <DataCell label="Reporting To">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      {pos.reportingTo}
                    </span>
                  </DataCell>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
