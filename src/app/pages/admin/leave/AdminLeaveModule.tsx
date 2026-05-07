import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileText,
  Layers3,
  ListChecks,
  MessageSquareText,
  Network,
  Palette,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  UserCheck,
} from "lucide-react";
import { cn } from "../../../components/ui/utils";
import { AdminLeaveDashboard } from "./sections/AdminLeaveDashboard";
import { AdminLeaveRequests } from "./sections/AdminLeaveRequests";
import { AdminLeaveTypeMaster } from "./sections/AdminLeaveTypeMaster";
import { AdminHolidayCalendarManagement } from "./sections/AdminHolidayCalendarManagement";
import { AdminPlaceholderSection } from "./sections/AdminPlaceholderSection";

type SectionId =
  | "dashboard"
  | "requests"
  | "approvals"
  | "type-master"
  | "policy"
  | "balances"
  | "ledger"
  | "holidays"
  | "workflow"
  | "escalation"
  | "compoff"
  | "encashment"
  | "wfh"
  | "outduty"
  | "gatepass"
  | "shortleave"
  | "weeklyoff"
  | "overtime"
  | "templates"
  | "reports"
  | "settings";

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType; description: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, description: "KPIs, SLA insights, trends" },
  { id: "requests", label: "Requests", icon: ListChecks, description: "Manage and audit leave requests" },
  { id: "approvals", label: "Approval Center", icon: UserCheck, description: "Queue, SLAs, bulk actions" },
  { id: "type-master", label: "Leave Types", icon: Palette, description: "Master data and attributes" },
  { id: "policy", label: "Policies", icon: ShieldCheck, description: "Rules, eligibility, accrual" },
  { id: "balances", label: "Balances", icon: Layers3, description: "Allocation, adjustments, bulk ops" },
  { id: "ledger", label: "Ledger & Audit", icon: FileText, description: "Entries, impacts, audit trails" },
  { id: "holidays", label: "Holiday Calendar", icon: CalendarDays, description: "Year setup and holiday mgmt" },
  { id: "workflow", label: "Workflow Builder", icon: Network, description: "Approval flows and SLAs" },
  { id: "escalation", label: "Escalation Matrix", icon: Timer, description: "Escalations and reminders" },
  { id: "compoff", label: "Comp Off", icon: CheckCircle2, description: "Requests and approvals" },
  { id: "encashment", label: "Encashment", icon: FileText, description: "Rules and payouts" },
  { id: "wfh", label: "WFH", icon: MessageSquareText, description: "Work from home requests" },
  { id: "outduty", label: "Out Duty", icon: MessageSquareText, description: "OD requests and approvals" },
  { id: "gatepass", label: "Gate Pass", icon: MessageSquareText, description: "Short movement approvals" },
  { id: "shortleave", label: "Short Leave", icon: MessageSquareText, description: "Hourly/short leaves" },
  { id: "weeklyoff", label: "Weekly Off Shuffle", icon: SlidersHorizontal, description: "Shifts and weekoff swaps" },
  { id: "overtime", label: "Overtime", icon: Timer, description: "OT requests and approvals" },
  { id: "templates", label: "Notifications", icon: MessageSquareText, description: "Templates and triggers" },
  { id: "reports", label: "Reports & Analytics", icon: BarChart3, description: "Downloads, exports, KPIs" },
  { id: "settings", label: "Settings", icon: Settings, description: "System configs and defaults" },
];

function SectionStrip({
  active,
  onChange,
}: {
  active: SectionId;
  onChange: (id: SectionId) => void;
}) {
  return (
    <div className="flat-card bg-card p-3 sticky top-0 z-20">
      <div className="flex gap-1 p-1 bg-secondary rounded-lg overflow-x-auto">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-150",
                isActive
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={s.description}
            >
              <Icon className="w-4 h-4" />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AdminLeaveModule() {
  const [active, setActive] = useState<SectionId>("dashboard");

  const header = useMemo(() => {
    const s = SECTIONS.find((x) => x.id === active) ?? SECTIONS[0];
    return s;
  }, [active]);

  return (
    <div className="p-6 space-y-5">
      <div className="flat-card bg-card p-6">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Admin · Leave Management
        </p>
        <h1 className="text-xl font-bold text-foreground tracking-tight mt-1">
          {header.label}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {header.description}
        </p>
      </div>

      <SectionStrip active={active} onChange={setActive} />

      {active === "dashboard" && <AdminLeaveDashboard />}
      {active === "requests" && <AdminLeaveRequests />}
      {active === "type-master" && <AdminLeaveTypeMaster />}
      {active === "holidays" && <AdminHolidayCalendarManagement />}

      {active === "approvals" && <AdminPlaceholderSection title="Leave Approval Center" />}
      {active === "policy" && <AdminPlaceholderSection title="Leave Policy Management" />}
      {active === "balances" && <AdminPlaceholderSection title="Leave Balance Management" />}
      {active === "ledger" && <AdminPlaceholderSection title="Leave Ledger & Audit" />}
      {active === "workflow" && <AdminPlaceholderSection title="Approval Workflow Builder" />}
      {active === "escalation" && <AdminPlaceholderSection title="Escalation Matrix Management" />}
      {active === "compoff" && <AdminPlaceholderSection title="Comp Off Management" />}
      {active === "encashment" && <AdminPlaceholderSection title="Encashment Management" />}
      {active === "wfh" && <AdminPlaceholderSection title="WFH Management" />}
      {active === "outduty" && <AdminPlaceholderSection title="Out Duty Management" />}
      {active === "gatepass" && <AdminPlaceholderSection title="Gate Pass Management" />}
      {active === "shortleave" && <AdminPlaceholderSection title="Short Leave Management" />}
      {active === "weeklyoff" && <AdminPlaceholderSection title="Weekly Off Shuffle Management" />}
      {active === "overtime" && <AdminPlaceholderSection title="Overtime Management" />}
      {active === "templates" && <AdminPlaceholderSection title="Notification Templates" />}
      {active === "reports" && <AdminPlaceholderSection title="Leave Reports & Analytics" />}
      {active === "settings" && <AdminPlaceholderSection title="Leave Settings & System Configurations" />}
    </div>
  );
}

