import { Outlet, useNavigate, useLocation } from "react-router";
import { cn } from "../../../components/ui/utils";
import { EmployeeLeaveDataProvider } from "./EmployeeLeaveDataContext";

const LEAVE_TABS = [
  { label: "Apply Leave", path: "/employee/leaves/apply" },
  { label: "My Applications", path: "/employee/leaves/applications" },
  { label: "Leave Balance", path: "/employee/leaves/balance" },
  { label: "Holiday Calendar", path: "/employee/leaves/holidays" },
  { label: "Leave Policy", path: "/employee/leaves/policy" },
  { label: "Notifications", path: "/employee/leaves/notifications" },
];

export function EmployeeLeavesLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <EmployeeLeaveDataProvider>
      <div className="flex flex-col h-full">
        <div className="bg-card border-b border-border px-6 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {LEAVE_TABS.map((tab) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap",
                  active
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto bg-background p-6">
          <Outlet />
        </div>
      </div>
    </EmployeeLeaveDataProvider>
  );
}

