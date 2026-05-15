import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  BarChart3,
  CalendarDays,
  FileText,
  Layers3,
  ListChecks,
  Network,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { AdminLeaveRequests } from "./sections/AdminLeaveRequests";
import { AdminLeaveTypeMaster } from "./sections/AdminLeaveTypeMaster";
import { AdminHolidayCalendarManagement } from "./sections/AdminHolidayCalendarManagement";
import { AdminPlaceholderSection } from "./sections/AdminPlaceholderSection";
import { AdminLeavePolicies } from "./sections/AdminLeavePolicies";
import { SuperadminLeaveDashboard } from "./sections/SuperadminLeaveDashboard";
import { SuperadminLeaveRequests } from "./sections/SuperadminLeaveRequests";
import { SuperadminAuditLogs } from "./sections/SuperadminAuditLogs";
import { SuperadminReportsAnalytics } from "./sections/SuperadminReportsAnalytics";
import { SuperadminWorkflowSettings } from "./sections/SuperadminWorkflowSettings";
import type { LeaveSettingsSectionKey } from "../../../modules/adminLeave/settings";
import {
  AdminNavRail,
  type AdminNavGroupSchema,
} from "../../../components/navigation/AdminNavRail";
import { AdminBreadcrumbs } from "../../../components/navigation/AdminBreadcrumbs";

type SectionId =
  | "dashboard"
  | "applications"
  | "policies"
  | "types"
  | "allocation"
  | "holidays"
  | "audit"
  | "reports"
  | "workflow"
  | "legacy-requests"
  | "legacy-types"
  | "legacy-dashboard";

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType; description: string }[] = [
  {
    id: "dashboard",
    label: "Leave Dashboard",
    icon: BarChart3,
    description: "Enterprise command center for superadmin",
  },
  {
    id: "applications",
    label: "Leave Applications",
    icon: ListChecks,
    description: "Search, filter, manage all leave requests",
  },
  {
    id: "policies",
    label: "Leave Policies",
    icon: ShieldCheck,
    description: "Policy engine and eligibility rules",
  },
  {
    id: "types",
    label: "Leave Types",
    icon: Palette,
    description: "Create and maintain leave master types",
  },
  {
    id: "allocation",
    label: "Leave Allocation",
    icon: Layers3,
    description: "Allocation controls and adjustments",
  },
  {
    id: "holidays",
    label: "Holiday Management",
    icon: CalendarDays,
    description: "Region and category holiday setup",
  },
  {
    id: "audit",
    label: "Audit Logs",
    icon: FileText,
    description: "Action history with change traceability",
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: BarChart3,
    description: "Insights, exports and trends",
  },
  {
    id: "workflow",
    label: "Workflow Settings",
    icon: Network,
    description: "Multi-stage approval workflow controls",
  },


  {
    id: "legacy-requests",
    label: "Legacy Requests View",
    icon: SlidersHorizontal,
    description: "Existing requests module",
  },
  {
    id: "legacy-types",
    label: "Legacy Type Master",
    icon: Palette,
    description: "Existing type master module",
  },
  {
    id: "legacy-dashboard",
    label: "Legacy Dashboard",
    icon: BarChart3,
    description: "Existing admin dashboard module",
  },
];

export function AdminLeaveModule() {
  const [active, setActive] = useState<SectionId>("dashboard");
  const [settingsTargetSection, setSettingsTargetSection] = useState<LeaveSettingsSectionKey>("general");
  const [settingsCreateSignal, setSettingsCreateSignal] = useState(0);

  const header = useMemo(() => {
    const s = SECTIONS.find((x) => x.id === active) ?? SECTIONS[0];
    return s;
  }, [active]);

  const navigate = useNavigate();

  const navGroups = useMemo<AdminNavGroupSchema<SectionId>[]>(() => {
    const byId = new Map(SECTIONS.map((s) => [s.id, s]));
    const item = (id: SectionId) => {
      const section = byId.get(id)!;
      return { id: section.id, label: section.label, icon: section.icon };
    };
    return [
      {
        id: "leave-management",
        label: "Leave Management",
        items: [item("dashboard"), item("applications"), item("policies"), item("types")],
      },
      {
        id: "workflows",
        label: "Workflows",
        items: [item("workflow"), item("allocation"), item("holidays")],
      },

      {
        id: "insights",
        label: "Insights",
        items: [item("reports"), item("audit")],
      },
      {
        id: "legacy",
        label: "Legacy",
        items: [item("legacy-requests"), item("legacy-types"), item("legacy-dashboard")],
      },
    ];
  }, []);

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950 min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight">{header.label}</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
          {header.description}
        </p>
      </div>

      {/* Top Navigation Rail */}
      <AdminNavRail groups={navGroups} active={active} onSelect={setActive} />

      {/* Content */}
      <div>
        {active === "dashboard" && <SuperadminLeaveDashboard />}
        {active === "applications" && <SuperadminLeaveRequests title="Leave Applications" />}
        {active === "policies" && (
          <AdminLeavePolicies onAddNewPolicy={() => navigate("/superadmin/masters/attendance-leave/leave-policy")} />
        )}
        {active === "types" && (
          <AdminLeaveTypeMaster onAddNewLeaveType={() => navigate("/superadmin/masters/attendance-leave/leave-type")} />
        )}
        {active === "allocation" && <AdminPlaceholderSection title="Leave Allocation Management" />}
        {active === "holidays" && (
          <AdminHolidayCalendarManagement onAddHoliday={() => navigate("/superadmin/masters/core-hr-setup/holiday")} />
        )}
        {active === "audit" && <SuperadminAuditLogs />}
        {active === "reports" && <SuperadminReportsAnalytics />}
        {active === "workflow" && <SuperadminWorkflowSettings />}


        {active === "legacy-requests" && <AdminLeaveRequests />}
        {active === "legacy-types" && <AdminLeaveTypeMaster />}
        {active === "legacy-dashboard" && (
          <AdminPlaceholderSection title="Legacy Admin Dashboard" />
        )}
      </div>
    </div>
  );
}