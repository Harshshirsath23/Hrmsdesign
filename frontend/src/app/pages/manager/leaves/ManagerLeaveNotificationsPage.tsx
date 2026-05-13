import { LeaveNotificationCenter } from "../../../components/leaves/employee/LeaveNotificationCenter";
import { useManagerLeaveData } from "./ManagerLeaveDataContext";

export function ManagerLeaveNotificationsPage() {
  const { applications, holidays } = useManagerLeaveData();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Leave lifecycle signals and upcoming holidays in one dense stream.
        </p>
      </header>
      <LeaveNotificationCenter applications={applications} holidays={holidays} />
    </div>
  );
}
