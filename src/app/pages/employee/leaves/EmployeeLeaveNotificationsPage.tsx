import { LeaveNotificationCenter } from "../../../components/leaves/employee/LeaveNotificationCenter";
import { useEmployeeLeaveData } from "./EmployeeLeaveDataContext";

export function EmployeeLeaveNotificationsPage() {
  const { applications, holidays } = useEmployeeLeaveData();

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-3">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Notifications</h1>
          {/* <p className="mt-2 text-sm text-muted-foreground">
            Leave lifecycle signals and upcoming holidays in one dense stream.
          </p> */}
        </div>
      </header>
      <LeaveNotificationCenter applications={applications} holidays={holidays} />
    </div>
  );
}
