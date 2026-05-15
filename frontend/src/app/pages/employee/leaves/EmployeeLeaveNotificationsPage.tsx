import { LeaveNotificationCenter } from "../../../components/leaves/employee/LeaveNotificationCenter";
import { useEmployeeLeaveData } from "./EmployeeLeaveDataContext";

export function EmployeeLeaveNotificationsPage() {
  const { applications, holidays } = useEmployeeLeaveData();

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Leave lifecycle signals and upcoming holidays in one dense stream.
        </p>
      </header>
      <LeaveNotificationCenter applications={applications} holidays={holidays} />
    </div>
  );
}
