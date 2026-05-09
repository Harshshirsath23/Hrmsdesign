import { useNavigate, useSearchParams } from "react-router";
import { ApplyLeaveFormEnterprise } from "../../../components/leaves/employee/ApplyLeaveFormEnterprise";
import { useEmployeeLeaveData } from "./EmployeeLeaveDataContext";

export function EmployeeLeaveApplyPage() {
  const navigate = useNavigate();
  const { employeeCode, employeeName, balances, refreshAll } = useEmployeeLeaveData();
  const [params] = useSearchParams();
  const prefill = params.get("type") ?? undefined;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Apply for leave</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Structured request with live balance preview and approval routing context.
        </p>
      </header>
      <ApplyLeaveFormEnterprise
        employee={{ employee_code: employeeCode, employee_name: employeeName }}
        balances={balances}
        prefillLeaveType={prefill}
        onSuccess={() => {
          refreshAll();
          navigate("/employee/leaves/applications");
        }}
      />
    </div>
  );
}
