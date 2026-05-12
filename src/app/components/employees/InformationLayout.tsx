import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { employees } from "./mockData";
import { SidebarMenu, SidebarSection } from "./SidebarMenu";
import { ContentSection } from "./ContentSection";
import { useEmployee } from "../../context/EmployeeContext";

export function InformationLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clearSelection } = useEmployee();
  const [activeSection, setActiveSection] = useState<SidebarSection>("profile");

  const employee = employees.find((e) => e.id === id) || employees[0];

  const sectionLabels: Record<SidebarSection, string> = {
    profile:    "Employee Profile",
    bank:       "Bank / PF / ESI",
    family:     "Family Details",
    passport:   "Passport & Visa",
    position:   "Position History",
    previous:   "Previous Employment",
    separation: "Separation",
    access:     "Access Card Details",
    nomination: "Nomination Details",
    documents:  "Employee Documents",
    contracts:  "Employee Contracts",
    salary:     "Employee Salary",
  };

  const statusStyle: Record<string, string> = {
    Active:     "bg-[#212529] text-[#F8F9FA]",
    "On Leave": "bg-[#6C757D] text-white",
    Inactive:   "bg-[#CED4DA] text-[#212529]",
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Breadcrumb header ─────────────────────────────── */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <button
            onClick={() => clearSelection()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 -ml-2.5 rounded-lg text-foreground
              hover:bg-secondary transition-colors font-semibold text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Employee List
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-border" />
          <span className="font-medium">Employees</span>
          <ChevronRight className="w-3.5 h-3.5 text-border" />
          <span className="font-semibold text-foreground">{employee.name}</span>
          <ChevronRight className="w-3.5 h-3.5 text-border" />
          <span className="font-semibold text-foreground bg-secondary border border-border px-2.5 py-0.5 rounded-md text-xs">
            {sectionLabels[activeSection]}
          </span>
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md ${statusStyle[employee.status] ?? "bg-secondary text-muted-foreground"}`}>
          {employee.status}
        </span>
      </div>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarMenu
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <ContentSection employee={employee} activeSection={activeSection} />
        </main>
      </div>
    </div>
  );
}
