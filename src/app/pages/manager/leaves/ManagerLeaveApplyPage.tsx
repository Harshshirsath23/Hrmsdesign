import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { ApplyLeaveFormEnterprise } from "../../../components/leaves/employee/ApplyLeaveFormEnterprise";
import { useManagerLeaveData } from "./ManagerLeaveDataContext";

export function ManagerLeaveApplyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeCode, employeeName, balances, refreshAll } = useManagerLeaveData();
  const [params] = useSearchParams();
  const prefill = params.get("type") ?? undefined;

  const navTabs = [
    { label: "Apply", path: "/employee/leaves/apply" },
    { label: "Pending", path: "/employee/leaves/applications" },
    { label: "History", path: "/employee/leaves/applications" },
  ];

  return (
    <div className="space-y-4">
      <header className="rounded-3xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Apply for leave</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Structured request with live balance preview and approval routing context.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {navTabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.path}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                location.pathname === tab.path
                  ? "border-foreground bg-foreground text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-foreground/70"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
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
