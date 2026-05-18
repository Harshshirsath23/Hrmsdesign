import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarMenu, SidebarSection } from "./SidebarMenu";
import { ContentSection } from "./ContentSection";
import { useEmployee } from "../../context/EmployeeContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { updateAdminEmployee } from "../../../store/slices/adminSlice";
import { addNotification } from "../../../store/slices/notificationSlice";
import { Send, CheckCircle2, Lock, Clock, AlertCircle } from "lucide-react";

export function InformationLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { clearSelection } = useEmployee();
  const [activeSection, setActiveSection] = useState<SidebarSection>("profile");

  const employees = useSelector((state: RootState) => state.admin.employees);
  const employee = employees.find((e) => e.id === id) || employees[0];

  const sectionLabels: Record<SidebarSection, string> = {
    profile: "Employee Profile",
    education: "Education Details",
    family: "Family Details",
    nominee: "Nominee Details",
    insurance: "Insurance Details",
    work: "Work Experience",
    position: "Position History",
    bank: "Bank / PF / ESI",
    passport: "Passport & Visa",
    background: "Background Check",
    assets: "Asset Management",
    access: "Access Card Details",
    documents: "Employee Documents",
    salary: "Employee Salary",
    requests: "Profile Update Requests",
  };

  const statusStyle: Record<string, string> = {
    Active: "bg-[#212529] text-[#F8F9FA]",
    "On Leave": "bg-[#6C757D] text-white",
    Inactive: "bg-[#CED4DA] text-[#212529]",
  };

  const handleSendRequest = () => {
    if (!employee) return;
    const editableCount = employee.editableSections?.length || 0;
    if (editableCount === 0) {
      dispatch(addNotification({ 
        type: "warning", 
        message: "Please select at least one section to allow employee editing." 
      }));
      return;
    }

    const next = { ...employee, editRequestStatus: "Pending" as const };
    dispatch(updateAdminEmployee(next));
    dispatch(addNotification({ 
      type: "success", 
      message: `Edit request for ${editableCount} sections shared with ${employee.name}.` 
    }));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Breadcrumb header ─────────────────────────────── */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <button
            onClick={() => {
              clearSelection();
              navigate("/admin/employees");
            }}
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

        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md ${
            statusStyle[employee.status] ?? "bg-secondary text-muted-foreground"
          }`}
        >
          {employee.status}
        </span>
      </div>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarMenu activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 overflow-y-auto p-6 pb-24">
          <ContentSection employee={employee} activeSection={activeSection} />
        </main>

        {/* ── Fixed Bottom Action Bar ──────────────────────── */}
        <div className="absolute bottom-0 left-60 right-0 h-20 bg-card/80 backdrop-blur-xl border-t border-border flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              <span className="text-xs font-bold text-foreground">
                {employee.editableSections?.length || 0} Sections Selected
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                 <CheckCircle2 size={12} className="text-emerald-500" />
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Editable</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <Lock size={12} className="text-slate-400" />
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Locked</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {employee.editRequestStatus === 'Pending' && (
               <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-200 rounded-lg">
                 <Clock size={14} className="text-amber-600 animate-pulse" />
                 <span className="text-xs font-bold text-amber-700">Request Pending</span>
               </div>
             )}
             {employee.editRequestStatus === 'Updated' && (
               <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-200 rounded-lg">
                 <AlertCircle size={14} className="text-emerald-600" />
                 <span className="text-xs font-bold text-emerald-700">Action Required: Updates Received</span>
               </div>
             )}
            <button
              onClick={handleSendRequest}
              className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-primary-foreground rounded-xl text-sm font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-foreground/10"
            >
              <Send size={16} />
              Send Edit Request to Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
