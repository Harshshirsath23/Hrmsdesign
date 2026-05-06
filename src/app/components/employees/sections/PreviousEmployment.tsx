import { Employee } from "../mockData";
import { Building2, Calendar, ArrowRight } from "lucide-react";

interface Props {
  employee: Employee;
}

function DataCell({ label, value, colSpan }: { label: string; value: string; colSpan?: boolean }) {
  return (
    <div className={`bg-background border border-border rounded-lg p-3 ${colSpan ? "sm:col-span-2" : ""}`}>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-1">{value}</p>
    </div>
  );
}

export function PreviousEmployment({ employee }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Previous Employment</h2>
        <p className="text-sm text-muted-foreground mt-1">Work history before joining the organization</p>
      </div>

      {employee.previousEmployment.length > 0 ? (
        <>
          <div className="space-y-4">
            {employee.previousEmployment.map((emp, index) => (
              <div key={index} className="flat-card bg-card p-5">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{emp.company}</h4>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{emp.designation}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-secondary border border-border px-3 py-1.5 rounded-md flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(emp.from).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                        {new Date(emp.to).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <DataCell
                        label="Duration"
                        value={(() => {
                          const months = Math.floor((new Date(emp.to).getTime() - new Date(emp.from).getTime()) / (1000 * 60 * 60 * 24 * 30));
                          const years  = Math.floor(months / 12);
                          const rem    = months % 12;
                          if (years === 0) return `${rem} months`;
                          if (rem === 0)   return `${years} year${years > 1 ? "s" : ""}`;
                          return `${years}y ${rem}m`;
                        })()}
                      />
                      <DataCell label="Reason for Leaving" value={emp.reasonForLeaving} colSpan />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total experience footer */}
          <div className="bg-secondary border border-border rounded-lg p-5 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Total Prior Experience</span>
            <span className="text-sm font-bold text-foreground font-mono">
              {(() => {
                const totalMonths = employee.previousEmployment.reduce((acc, emp) => {
                  return acc + Math.floor((new Date(emp.to).getTime() - new Date(emp.from).getTime()) / (1000 * 60 * 60 * 24 * 30));
                }, 0);
                const years  = Math.floor(totalMonths / 12);
                const months = totalMonths % 12;
                return `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;
              })()}
            </span>
          </div>
        </>
      ) : (
        <div className="flat-card bg-card border-dashed border-2 p-12 text-center">
          <Building2 className="w-10 h-10 text-muted-foreground opacity-30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No previous employment records found.</p>
        </div>
      )}
    </div>
  );
}
