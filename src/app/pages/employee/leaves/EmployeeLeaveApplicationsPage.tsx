import { ApplicationsHistoryTable } from "../../../components/leaves/employee/ApplicationsHistoryTable";
import { useEmployeeLeaveData } from "./EmployeeLeaveDataContext";

export function EmployeeLeaveApplicationsPage() {
  const { applications, leaveTypes } = useEmployeeLeaveData();

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">My applications</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Filterable ledger with export — optimized for dense enterprise review.
            </p>
          </div>
        </div>
      </header>
      <ApplicationsHistoryTable
        applications={applications}
        leaveTypeOptions={leaveTypes.map((lt) => ({ id: lt.id, name: lt.name, code: lt.code }))}
      />
    </div>
  );
}
