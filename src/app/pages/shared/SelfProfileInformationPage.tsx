import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  IndianRupee,
  Key,
  Monitor,
  Send,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { ContentSection } from "../../components/employees/ContentSection";
import { SidebarSection } from "../../components/employees/SidebarMenu";
import { useAuth } from "../../context/AuthContext";
import { fetchRequests, createRequest } from "../../../store/slices/requestSlice";
import { SectionKey } from "../../modules/ess/types";

type SelfSection = SidebarSection | "myRequest";

interface MenuItem {
  id: SelfSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  { id: "profile", label: "Employee Profile", icon: User },
  { id: "education", label: "Education Details", icon: GraduationCap },
  { id: "family", label: "Family Details", icon: Users },
  { id: "nominee", label: "Nominee Details", icon: Users },
  { id: "insurance", label: "Insurance Details", icon: ShieldCheck },
  { id: "work", label: "Work Experience", icon: Building2 },
  { id: "bank", label: "Bank / PF / ESI", icon: CreditCard },
  { id: "passport", label: "Passport & Visa", icon: Globe },
  { id: "assets", label: "Asset Management", icon: Monitor },
  { id: "access", label: "Access Card Details", icon: Key },
  { id: "documents", label: "Employee Documents", icon: FileText },
  { id: "salary", label: "Employee Salary", icon: IndianRupee },
  { id: "myRequest", label: "My Request", icon: ClipboardList },
];

const requestSectionMap: Partial<Record<SelfSection, SectionKey>> = {
  profile: "personalDetails",
  education: "educationDetails",
  family: "familyDetails",
  nominee: "nomineeDetails",
  insurance: "insuranceDetails",
  work: "previousEmployment",
  bank: "bankAndStatutoryDetails",
  passport: "passportAndVisa",
  assets: "assets",
  documents: "documentsRepository",
};

const submitButtonSections = new Set<SelfSection>([
  "profile",
  "education",
  "family",
  "nominee",
  "insurance",
  "work",
  "passport",
  "documents",
]);

const statusStyle: Record<string, string> = {
  Active: "bg-[#212529] text-[#F8F9FA]",
  "On Leave": "bg-[#6C757D] text-white",
  Inactive: "bg-[#CED4DA] text-[#212529]",
};

function MyRequestSection({ employeeId }: { employeeId: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const requests = useSelector((state: RootState) => state.requests.requests);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [section, setSection] = useState<SelfSection | "">("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    dispatch(fetchRequests(employeeId));
  }, [dispatch, employeeId]);

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter((request) => request.status === filter);
  }, [filter, requests]);

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.status === "pending").length,
      approved: requests.filter((request) => request.status === "approved").length,
      rejected: requests.filter((request) => request.status === "rejected").length,
    }),
    [requests]
  );

  const submitRequest = async () => {
    const mappedSection = section ? requestSectionMap[section] : undefined;
    const label = menuItems.find((item) => item.id === section)?.label;
    if (!mappedSection || !label || !description.trim()) return;

    await dispatch(
      createRequest({
        employeeId,
        section: mappedSection,
        sectionLabel: label,
        changes: [
          {
            fieldName: "description",
            fieldLabel: "Description",
            oldValue: "",
            newValue: description.trim(),
          },
        ],
      })
    );
    setSection("");
    setDescription("");
  };

  return (
    <div className="space-y-5 pb-16">
      <div>
        <h2 className="text-xl font-bold text-foreground">My Request</h2>
        <p className="text-sm text-muted-foreground">Track profile update requests sent to admin.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Total", counts.total],
          ["Pending", counts.pending],
          ["Approved", counts.approved],
          ["Rejected", counts.rejected],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[240px_1fr_auto]">
          <select
            value={section}
            onChange={(event) => setSection(event.target.value as SelfSection)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="">Select Section</option>
            {menuItems
              .filter((item) => item.id !== "myRequest" && requestSectionMap[item.id])
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
          </select>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what you want admin to update"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          />
          <button
            onClick={submitRequest}
            disabled={!section || !description.trim()}
            className="h-10 rounded-lg bg-foreground px-5 text-xs font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit Request
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-lg border px-4 py-2 text-xs font-bold capitalize ${
              filter === item ? "border-foreground bg-foreground text-primary-foreground" : "border-border bg-card text-muted-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No requests found.
          </div>
        ) : (
          filtered.map((request) => (
            <div key={request.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{request.sectionLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="rounded-md border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  {request.status}
                </span>
              </div>
              {request.changes[0]?.newValue ? (
                <p className="mt-3 text-sm text-muted-foreground">{String(request.changes[0].newValue)}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function SelfProfileInformationPage() {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [activeSection, setActiveSection] = useState<SelfSection>("profile");
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const employees = useSelector((state: RootState) => state.admin.employees);

  const employee = useMemo(() => {
    const requestedId = user?.employeeId;
    const matched = employees.find(
      (item) =>
        item.id === requestedId ||
        item.employeeId === requestedId ||
        (item.email?.toLowerCase() ?? "") === (user?.email?.toLowerCase() ?? "")
    );
    if (matched) return matched;

    const fallbackId = user?.role === "manager" ? "2" : "1";
    return employees.find((item) => item.id === fallbackId) ?? employees[0];
  }, [employees, user?.email, user?.employeeId, user?.role]);

  if (!employee) {
    return <div className="p-6 text-sm text-muted-foreground">No employee profile found.</div>;
  }

  const activeLabel = menuItems.find((item) => item.id === activeSection)?.label ?? "Employee Profile";
  const canShowSubmitButton = submitButtonSections.has(activeSection);

  const submitAllDetails = async () => {
    if (isSubmittingAll) return;
    const section = requestSectionMap[activeSection];
    if (!section) return;
    const sectionLabel = activeSection === "profile" ? "All Profile Information" : activeLabel;

    setIsSubmittingAll(true);
    try {
      await dispatch(
        createRequest({
          employeeId: employee.id,
          section,
          sectionLabel,
          changes: [
            {
              fieldName: `${activeSection}Submission`,
              fieldLabel: `${sectionLabel} Submission`,
              oldValue: "",
              newValue: `${employee.name} submitted ${sectionLabel.toLowerCase()} for admin review.`,
            },
          ],
        })
      ).unwrap();
      setActiveSection("myRequest");
    } finally {
      setIsSubmittingAll(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <span className="font-medium">My Profile</span>
          <span className="text-border">/</span>
          <span className="font-semibold text-foreground">{employee.name}</span>
          <span className="text-border">/</span>
          <span className="rounded-md border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {activeLabel}
          </span>
        </div>
        <span
          className={`rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
            statusStyle[employee.status] ?? "bg-secondary text-muted-foreground"
          }`}
        >
          {employee.status}
        </span>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <aside className="w-60 min-w-[240px] flex-shrink-0 overflow-y-auto border-r border-border bg-card">
          <div className="px-3 py-5">
            <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Employee Sections
            </p>
            <nav className="space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                      isActive
                        ? "bg-secondary font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {isActive ? (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-foreground" />
                    ) : null}
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {isActive ? <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground" /> : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "myRequest" ? (
            <MyRequestSection employeeId={employee.id} />
          ) : (
            <>
              <ContentSection
                employee={employee}
                activeSection={activeSection}
                disableBankEdit
                showAssetAccessActions={false}
                showSalaryActions={false}
              />
              {canShowSubmitButton ? (
                <div className="mt-8 flex justify-end border-t border-border pt-5">
                  <button
                    type="button"
                    onClick={submitAllDetails}
                    disabled={isSubmittingAll}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmittingAll ? "Submitting..." : "Submit All Details"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
