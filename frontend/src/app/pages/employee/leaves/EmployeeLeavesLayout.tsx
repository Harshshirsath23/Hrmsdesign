import { Outlet, useNavigate, useLocation } from "react-router";
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

  return (
    <EmployeeLeaveDataProvider>
      <div className="flex flex-col h-full">
        {/* Leave Top Navbar */}
        <div className="bg-card border-b border-border px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {LEAVE_TABS.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Leave Page Content */}
        <div className="flex-1 overflow-auto bg-background p-5 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </div>
    </EmployeeLeaveDataProvider>
  );
}

