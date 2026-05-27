import type { LeaveBalanceAPI } from "../../../modules/leaves/types";

export function MyApplicationsView({
  balances,
}: {
  balances: LeaveBalanceAPI[];
}) {
  // TODO: Fetch and display pending and history applications
  // This component will show:
  // - Pending applications (status = "PENDING")
  // - Application history (all past applications)

  return (
    <div className="rounded-md border border-gray-200 bg-white p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">My Leave Applications</h2>
        
        <div className="text-center py-12">
          <p className="text-gray-500">No applications found</p>
        </div>

        {/* Placeholder for applications list */}
        <div className="border border-gray-200 rounded-md p-4">
          <p className="text-sm text-gray-600">
            Your leave applications will appear here. You can view pending approvals and past applications.
          </p>
        </div>
      </div>
    </div>
  );
}
