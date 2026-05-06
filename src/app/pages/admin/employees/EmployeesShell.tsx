import { Outlet, useLocation, useNavigate } from "react-router";
import { Users, Info, UserPlus } from "lucide-react";

export function EmployeesShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const isInformation = location.pathname.includes("/information");
  const isAddEmployee  = location.pathname.includes("/add");

  const activeTab = isInformation ? "information" : isAddEmployee ? "add" : "directory";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-header with tabs */}
      <div className="bg-card border-b border-border px-6 flex items-center justify-between h-14 flex-shrink-0 z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/admin/employees")}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium ${
              activeTab === "directory"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            Directory
          </button>

          <button
            onClick={() => navigate("/admin/employees/add")}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium ${
              activeTab === "add"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>

          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium ${
              activeTab === "information"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground/50 cursor-default"
            }`}
            title={activeTab !== "information" ? "Select an employee to view information" : undefined}
          >
            <Info className="w-4 h-4" />
            Information
            {activeTab !== "information" && (
              <span className="text-xs opacity-60 ml-1 font-normal">(select employee)</span>
            )}
          </button>
        </div>

        <span className="text-xs font-medium text-muted-foreground bg-secondary border border-border px-3 py-1.5 rounded-lg">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-background">
        <Outlet />
      </div>
    </div>
  );
}