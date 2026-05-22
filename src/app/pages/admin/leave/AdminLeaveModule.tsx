import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  BarChart3,
  CalendarDays,
  FileText,
  ListChecks,
  Network,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  BookOpen,
} from "lucide-react";
import { AdminLeaveRequests } from "./sections/AdminLeaveRequests";
import { AdminHolidayCalendarManagement } from "./sections/AdminHolidayCalendarManagement";
import { AdminLeavePolicies } from "./sections/AdminLeavePolicies";
import { SuperadminLeaveDashboard } from "./sections/SuperadminLeaveDashboard";
import { SuperadminLeaveRequests } from "./sections/SuperadminLeaveRequests";
import { SuperadminAuditLogs } from "./sections/SuperadminAuditLogs";
import { SuperadminReportsAnalytics } from "./sections/SuperadminReportsAnalytics";
import { SuperadminWorkflowSettings } from "./sections/SuperadminWorkflowSettings";
import { AdminLeaveTypeMaster } from "./sections/AdminLeaveTypeMaster";
import { AdminLeaveAllocations } from "./sections/AdminLeaveAllocations";
import {
  AdminNavRail,
  type AdminNavGroupSchema,
} from "../../../components/navigation/AdminNavRail";

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
        items: [
          item("dashboard"),
          item("applications"),
          // item("policies"),
          // item("leave-types"),
          item("leave-allocations"),
          item("legacy-requests"),
        ],
      },
      {
        id: "workflows",
        label: "Workflows",
        items: [item("workflow"), item("holidays")],
      },
      {
        id: "insights",
        label: "Insights",
        items: [item("reports"), item("audit")],
      },
    ];
  }, []);

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950 min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-foreground tracking-tight">{header.label}</h1>
      </div>

      {/* Top Navigation Rail */}
      <AdminNavRail groups={navGroups} active={active} onSelect={setActive} />

      {/* Content */}
      <div>
        {active === "dashboard" && <SuperadminLeaveDashboard />}
        {active === "applications" && <SuperadminLeaveRequests title="Leave Applications" />}
        {/* {active === "policies" && (
          <AdminLeavePolicies onAddNewPolicy={() => navigate("/superadmin/masters/attendance-leave/leave-policy")} />
        )}
        {active === "leave-types" && (
          <AdminLeaveTypeMaster onAddNewLeaveType={() => navigate("/superadmin/masters/attendance-leave/leave-type")} />
        )} */}
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
  );
}