import { ApplicationsHistoryTable } from "../../../components/leaves/employee/ApplicationsHistoryTable";
import { useEmployeeLeaveData } from "./EmployeeLeaveDataContext";

export function EmployeeLeaveApplicationsPage() {
  const { applications, leaveTypes } = useEmployeeLeaveData();

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">My applications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Filterable ledger with export — optimized for dense enterprise review.
        </p>
      </header>
      <ApplicationsHistoryTable
        applications={applications}
        leaveTypeOptions={leaveTypes.map((lt) => ({ id: lt.id, name: lt.name, code: lt.code }))}
      />
    </div>
  );
}
