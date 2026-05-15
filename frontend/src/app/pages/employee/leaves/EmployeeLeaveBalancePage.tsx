import { EnterpriseBalanceGrid } from "../../../components/leaves/employee/EnterpriseBalanceGrid";
import { useEmployeeLeaveData } from "./EmployeeLeaveDataContext";

export function EmployeeLeaveBalancePage() {
  const { balances } = useEmployeeLeaveData();

  return (
    <div className="space-y-6">
      <header className="mb-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Leave balance</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Per-policy utilization with pending encumbrances called out inline.
        </p>
      </header>
      <EnterpriseBalanceGrid balances={balances} />
    </div>
  );
}
