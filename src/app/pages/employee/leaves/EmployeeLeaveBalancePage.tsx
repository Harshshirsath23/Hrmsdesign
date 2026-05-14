import { EnterpriseBalanceGrid } from "../../../components/leaves/employee/EnterpriseBalanceGrid";
import { useEmployeeLeaveData } from "./EmployeeLeaveDataContext";

export function EmployeeLeaveBalancePage() {
  const { balances } = useEmployeeLeaveData();

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-3">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Leave balance</h1>
          {/* <p className="mt-2 text-sm text-muted-foreground">
            Per-policy utilization with pending encumbrances called out inline.
          </p> */}
        </div>
      </header>
      <EnterpriseBalanceGrid balances={balances} />
    </div>
  );
}
