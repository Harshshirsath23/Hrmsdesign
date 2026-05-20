import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User, GraduationCap, Users, ShieldCheck, Building2, Briefcase,
  CreditCard, Globe, Monitor, Key, FileText, IndianRupee, ChevronRight,
  Send, CheckCircle2, Lock, Clock, AlertCircle,
} from "lucide-react";
import { AppDispatch, RootState } from "../../../store";
import { fetchEmployeeData } from "../../../store/slices/employeeSlice";
import { useAuth } from "../../context/AuthContext";
import { useEssPermissions } from "../../../hooks/useEssPermissions";

// Admin section components — reused directly
import { EssEmployeeProfile } from "../../components/employees/sections/EssEmployeeProfile";
import { EducationDetails } from "../../components/employees/sections/EducationDetails";
import { FamilyDetails } from "../../components/employees/sections/FamilyDetails";
import { NomineeDetails } from "../../components/employees/sections/NomineeDetails";
import { InsuranceDetails } from "../../components/employees/sections/InsuranceDetails";
import { WorkExperience } from "../../components/employees/sections/WorkExperience";
import { PositionHistory } from "../../components/employees/sections/PositionHistory";
import { BankDetails } from "../../components/employees/sections/BankDetails";
import { PassportVisa } from "../../components/employees/sections/PassportVisa";
import { AssetManagement } from "../../components/employees/sections/AssetManagement";
import { AccessCardDetails } from "../../components/employees/sections/AccessCardDetails";
import { EmployeeDocumentsSection } from "../../components/employees/sections/EmployeeDocumentsSection";
import { SalarySummary } from "../../components/employees/sections/SalarySummary";
import { MyRequestsTable } from "../../components/employee/MyRequestsTable";
import { EssProfileHeaderCard } from "../../components/employee/EssProfileHeaderCard";

type SidebarSection =
  | "profile" | "education" | "family" | "nominee" | "insurance"
  | "work" | "position" | "bank" | "passport" | "assets"
  | "access" | "documents" | "salary" | "requests";

interface MenuItem {
  id: SidebarSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sectionIds: string[]; // admin editableSections IDs that control this tab
}

const MENU_ITEMS: MenuItem[] = [
  { id: "profile",   label: "Employee Profile",    icon: User,         sectionIds: ["profile-personal", "profile-address", "profile-work", "profile-languages", "profile-medical"] },
  { id: "education", label: "Education Details",   icon: GraduationCap, sectionIds: ["education-details"] },
  { id: "family",    label: "Family Details",      icon: Users,        sectionIds: ["family-details"] },
  { id: "nominee",   label: "Nominee Details",     icon: Users,        sectionIds: ["nominee-details"] },
  { id: "insurance", label: "Insurance Details",   icon: ShieldCheck,  sectionIds: ["insurance-details"] },
  { id: "work",      label: "Work Experience",     icon: Building2,    sectionIds: ["work-experience"] },
  // Position History tab removed from employee view
  { id: "bank",      label: "Bank / PF / ESI",     icon: CreditCard,   sectionIds: ["bank-details"] },
  { id: "passport",  label: "Passport & Visa",     icon: Globe,        sectionIds: ["passport-details", "visa-details"] },
  { id: "assets",    label: "Asset Management",    icon: Monitor,      sectionIds: ["asset-management"] },
  { id: "access",    label: "Access Card Details", icon: Key,          sectionIds: ["access-cards"] },
  { id: "documents", label: "Employee Documents",  icon: FileText,     sectionIds: ["employee-documents"] },
  { id: "salary",    label: "Employee Salary",     icon: IndianRupee,  sectionIds: ["salary-details"] },
  { id: "requests",  label: "My Requests",         icon: Send,         sectionIds: [] },
];

function EssSidebar({
  active,
  onChange,
  editableSections,
}: {
  active: SidebarSection;
  onChange: (s: SidebarSection) => void;
  editableSections: string[];
}) {
  return (
    <aside className="w-60 min-w-[240px] bg-card border-r border-border flex flex-col overflow-y-auto flex-shrink-0">
      <div className="py-5 px-3">
        <p className="px-3 pb-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          My Profile
        </p>
        <nav className="space-y-0.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const hasEditAccess =
              item.sectionIds.length === 0 ||
              item.sectionIds.some((sid) => editableSections.includes(sid));

            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg relative
                  transition-all duration-150 text-sm font-medium
                  ${isActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground rounded-r-full" />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-1">{item.label}</span>
                {hasEditAccess && item.sectionIds.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="Edit access granted" />
                )}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

/** Permission-denied overlay for sections where admin hasn't granted edit access */
function ReadOnlyBanner({ sectionLabel }: { sectionLabel: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-secondary border border-border text-sm text-muted-foreground">
      <Lock className="w-4 h-4 flex-shrink-0" />
      <span>
        <strong>{sectionLabel}</strong> is currently view-only. Your manager/admin has not enabled edit access for this section.
      </span>
    </div>
  );
}

function SectionContent({
  active,
  employee,
  canEdit,
}: {
  active: SidebarSection;
  employee: any;
  canEdit: (sectionId: string) => boolean;
}) {
  // For sections that use the admin components directly, we pass the employee
  // The admin components already respect `editableSections` on the employee object.
  // We override `editableSections` on the employee to reflect current admin permissions.

  switch (active) {
    case "profile":
      return <EssEmployeeProfile employee={employee} />;

    case "education":
      return (
        <>
          <EducationDetails employee={employee} />
        </>
      );

    case "family":
      return (
        <>
          <FamilyDetails employee={employee} essMode />
        </>
      );

    case "nominee":
      return (
        <>
          <NomineeDetails employee={employee} />
        </>
      );

    case "insurance":
      return (
        <>
          <InsuranceDetails employee={employee} />
        </>
      );

    case "work":
      return (
        <>
          <WorkExperience employee={employee} />
        </>
      );

    // 'position' removed from sidebar; keep case to avoid runtime errors if route still used
    case "position":
      return <PositionHistory employee={employee} />;

    case "bank":
      return (
        <>
          <BankDetails employee={employee} disableEdit={!canEdit("bank-details")} />
        </>
      );

    case "passport":
      return (
        <>
          <PassportVisa employee={employee} essMode />
        </>
      );

    case "assets":
      return (
        <>
          <AssetManagement employee={employee} />
        </>
      );

    case "access":
      return (
        <>
          <AccessCardDetails employee={employee} />
        </>
      );

    case "documents":
      return <EmployeeDocumentsSection employee={employee} />;

    case "salary":
      return <SalarySummary employee={employee} />;

    case "requests":
      return (
        <div className="space-y-5 pb-24">
          <div>
            <h2 className="text-lg font-bold text-foreground">My Profile Update Requests</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track all your submitted profile change requests and their approval status.
            </p>
          </div>
          <MyRequestsTable />
        </div>
      );

    default:
      return null;
  }
}

export function EmployeeProfilePage() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? "1";
  const dispatch = useDispatch<AppDispatch>();

  const [activeSection, setActiveSection] = useState<SidebarSection>("profile");

  const { editableSections, canEdit, adminEmployee } = useEssPermissions();
  const essProfile = useSelector((state: RootState) => state.employee.profile);
  const status = useSelector((state: RootState) => state.employee.status);

  useEffect(() => {
    dispatch(fetchEmployeeData(employeeId));
  }, [dispatch, employeeId]);

  if (status === "loading" || !adminEmployee) {
    return (
      <div className="flex flex-col h-full bg-background animate-pulse">
        <div className="h-14 bg-secondary border-b border-border" />
        <div className="flex flex-1">
          <div className="w-60 bg-secondary border-r border-border" />
          <div className="flex-1 p-6 space-y-4">
            <div className="h-32 bg-secondary rounded-2xl" />
            <div className="h-64 bg-secondary rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const activeItem = MENU_ITEMS.find((m) => m.id === activeSection)!;
  const sectionLabel = activeItem.label;

  const statusStyle: Record<string, string> = {
    Active: "bg-[#212529] text-[#F8F9FA]",
    "On Leave": "bg-[#6C757D] text-white",
    Inactive: "bg-[#CED4DA] text-[#212529]",
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Breadcrumb header */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <span className="font-medium">My Profile</span>
          <ChevronRight className="w-3.5 h-3.5 text-border" />
          <span className="font-semibold text-foreground bg-secondary border border-border px-2.5 py-0.5 rounded-md text-xs">
            {sectionLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {adminEmployee.editRequestStatus === "Pending" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-200 rounded-lg">
              <Clock size={14} className="text-amber-600 animate-pulse" />
              <span className="text-xs font-bold text-amber-700">Edit Request Pending</span>
            </div>
          )}
          {adminEmployee.editRequestStatus === "Updated" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-200 rounded-lg">
              <AlertCircle size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">Updates Submitted</span>
            </div>
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md ${
              statusStyle[adminEmployee.status] ?? "bg-secondary text-muted-foreground"
            }`}
          >
            {adminEmployee.status}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        <EssSidebar
          active={activeSection}
          onChange={setActiveSection}
          editableSections={editableSections}
        />

        <main className="flex-1 overflow-y-auto p-6 pb-28">
          {/* Profile header card — only on the profile tab */}
          {activeSection === "profile" && essProfile && (
            <div className="mb-6">
              <EssProfileHeaderCard employeeId={employeeId} profile={essProfile} />
            </div>
          )}

          <SectionContent
            active={activeSection}
            employee={adminEmployee}
            canEdit={canEdit}
          />
        </main>

        {/* Fixed bottom status bar */}
        <div className="absolute bottom-0 left-60 right-0 h-16 bg-card/90 backdrop-blur-xl border-t border-border flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              <span className="text-xs font-bold text-foreground">
                {editableSections.length} Sections Editable
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Editable
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  View Only
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveSection("requests")}
            className="flex items-center gap-2 px-5 py-2 bg-foreground text-primary-foreground rounded-xl text-xs font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-foreground/10"
          >
            <Send size={14} />
            View My Requests
          </button>
        </div>
      </div>
    </div>
  );
}
