import { useState } from "react";
import { useNavigate } from "react-router";
import {
  BarChart3,
  CalendarDays,
  FileText,
  ListChecks,
  Network,
  SlidersHorizontal,
  BookOpen,
} from "lucide-react";
import { AdminLeaveRequests } from "./sections/AdminLeaveRequests";
import { AdminHolidayCalendarManagement } from "./sections/AdminHolidayCalendarManagement";
import { SuperadminLeaveDashboard } from "./sections/SuperadminLeaveDashboard";
import { SuperadminLeaveRequests } from "./sections/SuperadminLeaveRequests";
import { SuperadminAuditLogs } from "./sections/SuperadminAuditLogs";
import { SuperadminReportsAnalytics } from "./sections/SuperadminReportsAnalytics";
import { SuperadminWorkflowSettings } from "./sections/SuperadminWorkflowSettings";
import { AdminLeaveAllocations } from "./sections/AdminLeaveAllocations";

type SectionId =
  | "dashboard"
  | "applications"
  // | "policies"
  | "holidays"
  | "audit"
  | "reports"
  | "workflow"
  | "legacy-requests"
  // | "leave-types"
  | "leave-allocations";

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  {
    id: "dashboard",
    label: "Leave Dashboard",
    icon: BarChart3,
  },
  {
    id: "applications",
    label: "Leave Applications",
    icon: ListChecks,
  },
  // {
  //   id: "policies",
  //   label: "Leave Policies",
  //   icon: ShieldCheck,
  // },
  // {
  //   id: "leave-types",
  //   label: "Leave Types",
  //   icon: Tag,
  // },
  {
    id: "leave-allocations",
    label: "Leave Allocations",
    icon: BookOpen,
  },
  {
    id: "holidays",
    label: "Holiday Management",
    icon: CalendarDays,
  },
  {
    id: "audit",
    label: "Audit Logs",
    icon: FileText,
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: BarChart3,
  },
  {
    id: "workflow",
    label: "Workflow Settings",
    icon: Network,
  },
  {
    id: "legacy-requests",
    label: "Legacy Requests View",
    icon: SlidersHorizontal,
  },
];

export function AdminLeaveModule() {
  const [active, setActive] = useState<SectionId>("dashboard");
  const navigate = useNavigate();

  const handleTabClick = (id: SectionId) => {
    setActive(id);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-header with tabs */}
      <div className="bg-card border-b border-border px-6 flex items-center justify-between h-14 flex-shrink-0 z-10">
        <div className="flex items-center gap-1 overflow-x-auto">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => handleTabClick(section.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-150 font-medium whitespace-nowrap ${
                  active === section.id
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-muted-foreground bg-secondary border border-border px-3 py-1.5 rounded-lg flex-shrink-0 ml-4">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-background">
        <div className="p-8 h-full overflow-y-auto">
          {active === "dashboard" && <SuperadminLeaveDashboard />}
          {active === "applications" && <SuperadminLeaveRequests title="Leave Applications" />}
          {active === "leave-allocations" && (
            <AdminLeaveAllocations onAddAllocation={() => navigate("/superadmin/masters/attendance-leave/leave-allocation")} />
          )}
          {active === "holidays" && (
            <AdminHolidayCalendarManagement onAddHoliday={() => navigate("/superadmin/masters/core-hr-setup/holiday")} />
          )}
          {active === "audit" && <SuperadminAuditLogs />}
          {active === "reports" && <SuperadminReportsAnalytics />}
          {active === "workflow" && <SuperadminWorkflowSettings />}
          {active === "legacy-requests" && <AdminLeaveRequests />}
        </div>
      </div>
    </div>
  );
}