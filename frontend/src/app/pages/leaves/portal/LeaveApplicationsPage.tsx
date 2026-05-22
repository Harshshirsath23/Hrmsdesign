import { ApplicationsHistoryTable } from "../../../components/leaves/employee/ApplicationsHistoryTable";
import { TeamLeaveApplicationsTable } from "../../../components/leaves/shared/TeamLeaveApplicationsTable";
import type { LeavePortalDataContextValue } from "../LeavePortalDataContext";

export function LeaveApplicationsPage({
  useLeaveData,
}: {
  useLeaveData: () => Pick<
    LeavePortalDataContextValue,
    "role" | "applications" | "leaveTypes" | "teamPendingApplications" | "refreshTeam"
  >;
}) {
  const { role, applications, leaveTypes, teamPendingApplications, refreshTeam } = useLeaveData();
  const leaveTypeOptions = leaveTypes.map((lt) => ({ id: lt.id, name: lt.name, code: lt.code }));

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">My applications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Filterable ledger with export — optimized for dense enterprise review.
        </p>
      </header>
      <ApplicationsHistoryTable applications={applications} leaveTypeOptions={leaveTypeOptions} />

      {role === "manager" && (
        <section className="space-y-6 pt-2">
          <header className="mb-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Team leave requests</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Review, approve, or reject leave applications from your direct reports.
            </p>
          </header>
          <TeamLeaveApplicationsTable
            applications={teamPendingApplications}
            leaveTypeOptions={leaveTypeOptions}
            onActionComplete={refreshTeam}
          />
        </section>
      )}
    </div>
  );
}
