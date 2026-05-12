import { Outlet, useLocation, useNavigate } from "react-router";
import {
  Users,
  Info,
  UserPlus,
  Briefcase,
  Settings,
  BarChart3,
  FileSpreadsheet,
  GitGraph,
} from "lucide-react";
import { useEmployee } from "../../../context/EmployeeContext";

export function EmployeesShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedEmployeeId, clearSelection } = useEmployee();

  const isInformation = location.pathname.includes("/information");
  const isAddEmployee = location.pathname.includes("/add");
  const isManagement = location.pathname.includes("/management");
  const isSetup = location.pathname.includes("/setup");
  const isReports = location.pathname.includes("/reports");
  const isImport = location.pathname.includes("/import");
  const isOrgChart = location.pathname.includes("/org-chart");

  const activeTab = isInformation
    ? "information"
    : isAddEmployee
    ? "add"
    : isManagement
    ? "management"
    : isSetup
    ? "setup"
    : isReports
    ? "reports"
    : isImport
    ? "import"
    : isOrgChart
    ? "org-chart"
    : "directory";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-header with tabs */}
      <div className="bg-card border-b border-border px-6 flex items-center justify-between h-14 flex-shrink-0 z-10">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              clearSelection();
              navigate("/admin/employees");
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium ${
              activeTab === "directory"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            Employee List
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
            onClick={() => navigate("/admin/employees/management")}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium ${
              activeTab === "management"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Management
          </button>

          <button
            onClick={() => navigate("/admin/employees/setup")}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium ${
              activeTab === "setup"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4" />
            Setup
          </button>

          <button
            onClick={() => navigate("/admin/employees/import")}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium ${
              activeTab === "import"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Import
          </button>

          <button
            onClick={() => navigate("/admin/employees/reports")}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium ${
              activeTab === "reports"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Reports
          </button>

          <button
            onClick={() => navigate("/admin/employees/org-chart")}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium ${
              activeTab === "org-chart"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <GitGraph className="w-4 h-4" />
            Org Chart
          </button>

          {selectedEmployeeId && (
            <button
              onClick={() => navigate(`/admin/employees/information/${selectedEmployeeId}`)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium ${
                activeTab === "information"
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Info className="w-4 h-4" />
              Information
            </button>
          )}
        </div>

        <span className="text-xs font-medium text-muted-foreground bg-secondary border border-border px-3 py-1.5 rounded-lg">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-background">
        <Outlet />
      </div>
    </div>
  );
}