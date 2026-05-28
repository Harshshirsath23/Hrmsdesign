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

interface FormField {
  key: string;
  label: string;
  type: "text" | "date" | "select";
  options?: string[];
}

const sectionFields: Record<string, FormField[]> = {
  profile: [
    { key: "firstName", label: "First Name", type: "text" },
    { key: "middleName", label: "Middle Name", type: "text" },
    { key: "lastName", label: "Last Name", type: "text" },
    { key: "fathersName", label: "Father's Name", type: "text" },
    { key: "spouseName", label: "Spouse's Name", type: "text" },
    { key: "dateOfBirth", label: "Date of Birth", type: "date" },
    { key: "actualDob", label: "Actual DOB", type: "date" },
    { key: "placeOfBirth", label: "Place of Birth", type: "text" },
    { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
    { key: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed"] },
    { key: "bloodGroup", label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    { key: "nationality", label: "Nationality", type: "text" },
    { key: "religion", label: "Religion", type: "text" },
  ],
  education: [
    { key: "education.0.qualification", label: "Qualification", type: "text" },
    { key: "education.0.specialization", label: "Specialization", type: "text" },
    { key: "education.0.institutionName", label: "Institution/School Name", type: "text" },
    { key: "education.0.university", label: "Board/University", type: "text" },
    { key: "education.0.grade", label: "Grade/Percentage", type: "text" },
  ],
  family: [
    { key: "family.0.name", label: "Family Member Name", type: "text" },
    { key: "family.0.relationship", label: "Relationship", type: "text" },
    { key: "family.0.dob", label: "Date of Birth", type: "date" },
    { key: "family.0.occupation", label: "Occupation", type: "text" },
  ],
  nominee: [
    { key: "nominees.0.nomineeName", label: "Nominee Name", type: "text" },
    { key: "nominees.0.relationship", label: "Relationship", type: "text" },
    { key: "nominees.0.dateOfBirth", label: "Date of Birth", type: "date" },
    { key: "nominees.0.contactNumber", label: "Contact Number", type: "text" },
    { key: "nominees.0.address", label: "Address", type: "text" },
  ],
  insurance: [
    { key: "insurance.0.insuranceProvider", label: "Insurance Provider", type: "text" },
    { key: "insurance.0.policyNumber", label: "Policy Number", type: "text" },
    { key: "insurance.0.coverageType", label: "Coverage Type", type: "text" },
    { key: "insurance.0.coverageAmount", label: "Coverage Amount", type: "text" },
  ],
  work: [
    { key: "workExperience.0.companyName", label: "Company Name", type: "text" },
    { key: "workExperience.0.jobTitle", label: "Job Title", type: "text" },
    { key: "workExperience.0.startDate", label: "Start Date", type: "date" },
    { key: "workExperience.0.endDate", label: "End Date", type: "date" },
  ],
  bank: [
    { key: "bankName", label: "Bank Name", type: "text" },
    { key: "accountNumber", label: "Account Number", type: "text" },
    { key: "ifscCode", label: "IFSC Code", type: "text" },
    { key: "panNumber", label: "PAN Number", type: "text" },
    { key: "aadhaarNumber", label: "Aadhaar Number", type: "text" },
    { key: "uanNumber", label: "UAN Number", type: "text" },
  ],
  passport: [
    { key: "passportNumber", label: "Passport Number", type: "text" },
    { key: "passportExpiry", label: "Passport Expiry Date", type: "date" },
    { key: "visaType", label: "Visa Type", type: "text" },
    { key: "visaNumber", label: "Visa Number", type: "text" },
    { key: "visaExpiry", label: "Visa Expiry Date", type: "date" },
    { key: "visaCountry", label: "Visa Country", type: "text" },
  ],
};

function getNestedValue(obj: any, path: string): any {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null) return "";
    const index = parseInt(part, 10);
    if (!isNaN(index) && Array.isArray(current)) {
      current = current[index];
    } else {
      current = current[part];
    }
  }
  return current ?? "";
}

function MyRequestSection({ employee }: { employee: Employee }) {
  const employeeId = employee.id;
  const dispatch = useDispatch<AppDispatch>();
  const requests = useSelector((state: RootState) => state.requests.requests);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [section, setSection] = useState<SelfSection | "">("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchRequests(employeeId));
  }, [dispatch, employeeId]);

  // Populate dynamic form values from current employee profile
  useEffect(() => {
    if (!section) {
      setFormValues({});
      return;
    }
    const fields = sectionFields[section] || [];
    const vals: Record<string, string> = {};
    fields.forEach((f) => {
      vals[f.key] = String(getNestedValue(employee, f.key) || "");
    });
    setFormValues(vals);
  }, [section, employee]);

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

  const fields = section ? sectionFields[section] || [] : [];
  const hasChanges = useMemo(() => {
    if (!section) return false;
    return fields.some((f) => {
      const oldVal = String(getNestedValue(employee, f.key) || "");
      const newVal = String(formValues[f.key] || "");
      return oldVal !== newVal;
    });
  }, [section, formValues, fields, employee]);

  const submitRequest = async () => {
    const mappedSection = section ? requestSectionMap[section] : undefined;
    const label = menuItems.find((item) => item.id === section)?.label;
    if (!mappedSection || !label || !hasChanges) return;

    const changes = fields
      .map((f) => {
        const oldVal = getNestedValue(employee, f.key);
        const newVal = formValues[f.key];
        if (String(oldVal || "") !== String(newVal || "")) {
          return {
            fieldName: f.key,
            fieldLabel: f.label,
            oldValue: oldVal,
            newValue: newVal,
          };
        }
        return null;
      })
      .filter(Boolean);

    await dispatch(
      createRequest({
        employeeId,
        section: mappedSection,
        sectionLabel: label,
        changes: changes as any,
      })
    );
    setSection("");
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-xl font-bold text-foreground">My Request</h2>
        <p className="text-sm text-muted-foreground">Submit and track profile update requests sent to admin.</p>
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

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Select Section to Edit
          </label>
          <select
            value={section}
            onChange={(event) => setSection(event.target.value as SelfSection)}
            className="w-full md:w-80 h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        </div>

        {/* Dynamic Form Render */}
        {section && fields.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <h3 className="text-sm font-bold text-foreground">
              Update fields in {menuItems.find((m) => m.id === section)?.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field) => {
                const currentVal = getNestedValue(employee, field.key);
                return (
                  <div key={field.key} className="space-y-1.5 p-3 rounded-lg bg-secondary/20 border border-border/40">
                    <label className="block text-xs font-bold text-foreground">{field.label}</label>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      Current: <span className="font-mono bg-card px-1 py-0.5 rounded border border-border">{String(currentVal || "—")}</span>
                    </div>
                    {field.type === "select" ? (
                      <select
                        value={formValues[field.key] || ""}
                        onChange={(e) => setFormValues((v) => ({ ...v, [field.key]: e.target.value }))}
                        className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none"
                      >
                        <option value="">Select Option</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formValues[field.key] || ""}
                        onChange={(e) => setFormValues((v) => ({ ...v, [field.key]: e.target.value }))}
                        className="w-full h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none font-medium"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={submitRequest}
                disabled={!hasChanges}
                className="h-10 rounded-lg bg-primary text-primary-foreground px-5 text-xs font-bold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 transition-opacity"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {(["all", "pending", "approved", "rejected"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-lg border px-4 py-2 text-xs font-bold capitalize cursor-pointer transition-colors ${
              filter === item
                ? "border-foreground bg-foreground text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No requests found.
          </div>
        ) : (
          filtered.map((request) => (
            <div key={request.id} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{request.sectionLabel}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(request.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                    request.status === "pending"
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : request.status === "approved"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-rose-50 border-rose-200 text-rose-700",
                  ].join(" ")}
                >
                  {request.status}
                </span>
              </div>

              {/* Changes Timeline */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Requested Changes</p>
                <div className="divide-y divide-border/60 border border-border rounded-lg bg-secondary/15 overflow-hidden">
                  {request.changes.map((change, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 text-xs">
                      <span className="font-bold text-foreground w-1/3 shrink-0">{change.fieldLabel || change.fieldName}</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0 font-medium">
                        <span className="text-muted-foreground truncate">{String(change.oldValue || "—")}</span>
                        <span className="text-muted-foreground shrink-0">→</span>
                        <span className="text-foreground font-semibold truncate">{String(change.newValue || "—")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin remarks / feedback */}
              {request.adminRemark && (
                <div className="rounded-lg bg-secondary/35 border border-border/80 p-3 text-xs">
                  <p className="font-bold text-foreground">Admin Remark:</p>
                  <p className="text-muted-foreground mt-1">{request.adminRemark}</p>
                </div>
              )}
              {request.rejectionComment && (
                <div className="rounded-lg bg-rose-50/50 border border-rose-100 p-3 text-xs">
                  <p className="font-bold text-rose-700">Rejection Reason:</p>
                  <p className="text-rose-600 mt-1">{request.rejectionComment}</p>
                </div>
              )}
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
            <MyRequestSection employee={employee} />
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
