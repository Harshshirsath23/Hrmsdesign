import { EnterpriseBalanceGrid } from "../../../components/leaves/employee/EnterpriseBalanceGrid";
import { useManagerLeaveData } from "./ManagerLeaveDataContext";

export function ManagerLeaveBalancePage() {
  const { balances } = useManagerLeaveData();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Leave balance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Per-policy utilization with pending encumbrances called out inline.
        </p>
      </header>
      <EnterpriseBalanceGrid balances={balances} />
    </div>
  );
}
