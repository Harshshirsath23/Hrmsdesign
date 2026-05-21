import { useEffect, useMemo, useState } from "react";
import {
  User,
  GraduationCap,
  Users,
  Heart,
  Shield,
  Landmark,
  Globe,
  Briefcase,
  IndianRupee,
  Monitor,
  CreditCard,
  FileText,
  ClipboardList,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { EssProfileHeaderCard } from "../../components/employee/EssProfileHeaderCard";
import { EmployeeDocumentsGrid } from "../../modules/employees/documentTypes/EmployeeDocumentsGrid";
import { selectActiveDocumentTypes } from "../../../store/slices/documentTypesSlice";
import type { EmployeeDocumentMeta } from "../../components/employees/mockData";
import {
  getChangeRequests,
  getPendingSections,
  getProfile,
  submitSectionChangeRequest,
} from "../../modules/ess/storage";
import { EmployeeProfile, SectionKey } from "../../modules/ess/types";
import {
  detectDuplicateValues,
  isEqualPayload,
  maskSensitive,
  validateAadhaar,
  validateEmail,
  validatePan,
} from "../../modules/ess/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type BannerState = { type: "success" | "error"; message: string } | null;
type TabMode = "edit" | "multi-add" | "view-only" | "requests" | "combined";
type TabGroup =
  | "Personal Information"
  | "Financial & Legal"
  | "Career"
  | "Assets & Access"
  | "Requests";

interface TabSection {
  key: string;
  label: string;
  group: TabGroup;
  mode: TabMode;
  storeKey?: string;
  icon: React.ElementType;
}

// ─── Section Config (13 tabs) ─────────────────────────────────────────────────

const TAB_SECTIONS: TabSection[] = [
  { key: "employeeProfile",   label: "Employee Profile",    group: "Personal Information", mode: "combined",  icon: User },
  { key: "educationDetails",  label: "Education Details",   group: "Personal Information", mode: "multi-add", icon: GraduationCap },
  { key: "familyDetails",     label: "Family Details",      group: "Personal Information", mode: "multi-add", icon: Users },
  { key: "nomineeDetails",    label: "Nominee Details",     group: "Financial & Legal",    mode: "multi-add", icon: Heart },
  { key: "insuranceDetails",  label: "Insurance Details",   group: "Financial & Legal",    mode: "multi-add", icon: Shield },
  { key: "bankPfEsi",         label: "Bank / PF / ESI",     group: "Financial & Legal",    mode: "view-only", icon: Landmark,     storeKey: "bankAndStatutoryDetails" },
  { key: "passportVisa",      label: "Passport & Visa",     group: "Financial & Legal",    mode: "edit",      icon: Globe,        storeKey: "passportAndVisa" },
  { key: "workExperience",    label: "Work Experience",     group: "Career",               mode: "multi-add", icon: Briefcase,    storeKey: "previousEmployment" },
  { key: "employeeSalary",    label: "Employee Salary",     group: "Career",               mode: "view-only", icon: IndianRupee },
  { key: "assetManagement",   label: "Asset Management",    group: "Assets & Access",      mode: "view-only", icon: Monitor,      storeKey: "assetsAndIT" },
  { key: "accessCardDetails", label: "Access Card Details", group: "Assets & Access",      mode: "view-only", icon: CreditCard },
  { key: "employeeDocuments", label: "Employee Documents",  group: "Assets & Access",      mode: "edit",      icon: FileText,     storeKey: "documentsRepository" },
  { key: "myRequest",         label: "My Request",          group: "Requests",             mode: "requests",  icon: ClipboardList },
];


const STORE_KEY_MAP: Record<string, string> = {
  bankPfEsi: "bankAndStatutoryDetails",
  passportVisa: "passportAndVisa",
  workExperience: "previousEmployment",
  assetManagement: "assetsAndIT",
  employeeDocuments: "documentsRepository",
};

function getStoreKey(sectionKey: string): string {
  return STORE_KEY_MAP[sectionKey] ?? sectionKey;
}

// ─── Field Labels ─────────────────────────────────────────────────────────────

const FORM_LABELS: Record<string, string> = {
  employeeId: "Employee ID",
  employeeCode: "Employee Code",
  salutation: "Salutation",
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  preferredName: "Preferred Name",
  officialEmail: "Official Email",
  personalEmail: "Personal Email",
  workMobile: "Work Mobile",
  personalMobile: "Personal Mobile",
  alternateMobileNumber: "Alternate Mobile Number",
  extensionNumber: "Extension Number",
  username: "Username",
  bio: "Bio / About",
  dateOfBirth: "Date of Birth",
  actualDateOfBirth: "Actual Date of Birth",
  gender: "Gender",
  bloodGroup: "Blood Group",
  maritalStatus: "Marital Status",
  nationality: "Nationality",
  religion: "Religion",
  caste: "Caste",
  casteCategory: "Caste Category",
  residentialStatus: "Residential Status",
  placeOfBirth: "Place of Birth",
  identificationMark: "Identification Mark",
  physicallyChallenged: "Physically Challenged",
  internationalEmployee: "International Employee",
  fatherName: "Father Name",
  motherName: "Mother Name",
  spouseName: "Spouse Name",
  panNumber: "PAN Number",
  aadhaarNumber: "Aadhaar Number",
  addressLine1: "Address Line 1",
  addressLine2: "Address Line 2",
  landmark: "Landmark",
  city: "City",
  state: "State",
  country: "Country",
  pincode: "Pincode",
  startDate: "Start Date",
  toDate: "To Date",
  sameAsPermanent: "Same as Permanent Address",
  emergencyContactName: "Emergency Contact Name",
  emergencyContactRelation: "Emergency Contact Relation",
  emergencyContactNumber: "Emergency Contact Number",
  department: "Department",
  designation: "Designation",
  employmentType: "Employment Type",
  joiningDate: "Joining Date",
  confirmationDate: "Confirmation Date",
  bankName: "Bank Name",
  branchName: "Branch Name",
  ifscCode: "IFSC Code",
  accountNumber: "Account Number",
  accountHolderName: "Account Holder Name",
  accountType: "Account Type",
  isPrimary: "Primary Account",
  uanNumber: "UAN Number",
  esicNumber: "ESIC Number",
  pfNumber: "PF Number",
  professionalTaxNumber: "Professional Tax Number",
  taxRegime: "Tax Regime",
  nomineeName: "Nominee Name",
  relationship: "Relationship",
  sharePercentage: "Share Percentage (%)",
  contactNumber: "Contact Number",
  address: "Address",
  passportNumber: "Passport Number",
  passportHolderName: "Passport Holder Name",
  issueDate: "Issue Date",
  expiryDate: "Expiry Date",
  placeOfIssue: "Place of Issue",
  countryOfIssue: "Country of Issue",
  passportCategory: "Passport Category",
  passportStatus: "Passport Status",
  visaType: "Visa Type",
  visaNumber: "Visa Number",
  visaCountry: "Visa Country",
  visaSponsor: "Visa Sponsor",
  visaIssueDate: "Visa Issue Date",
  visaExpiryDate: "Visa Expiry Date",
  visaStatus: "Visa Status",
  companyName: "Company Name",
  jobTitle: "Job Title",
  totalExperience: "Total Experience",
  hrContact: "HR Contact",
  reasonForLeaving: "Reason for Leaving",
  currentlyWorking: "Currently Working",
  qualification: "Qualification",
  degree: "Degree",
  specialization: "Specialization",
  institutionName: "Institution Name",
  boardUniversity: "Board / University",
  passingYear: "Passing Year",
  percentageCgpa: "Percentage / CGPA",
  grade: "Grade",
  courseType: "Course Type",
  duration: "Duration",
  assetTag: "Asset Tag",
  assetName: "Asset Name",
  assetType: "Asset Type",
  deviceSerialNumber: "Device Serial Number",
  assignedDate: "Assigned Date",
  dueDate: "Due Date",
  assetCondition: "Asset Condition",
  remarks: "Remarks",
  familyMemberName: "Family Member Name",
  occupation: "Occupation",
  dependentStatus: "Dependent Status",
  emergencyContact: "Emergency Contact",
  policyNumber: "Policy Number",
  provider: "Provider",
  policyType: "Policy Type",
  coverageAmount: "Coverage Amount",
  endDate: "End Date",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SALARY = {
  grade: "M2 – Engineering Manager",
  ctcAnnual: "₹30,00,000",
  basicMonthly: "₹1,00,000",
  hraMonthly: "₹50,000",
  specialAllowanceMonthly: "₹62,500",
  pfDeductionMonthly: "₹12,000",
  professionalTaxMonthly: "₹200",
  netMonthlyTakeHome: "₹2,00,300",
  lastIncrementDate: "01 Apr 2025",
  lastIncrementPercent: "18%",
  nextReviewDate: "01 Apr 2026",
  paymentMode: "Bank Transfer",
};

const MOCK_ACCESS_CARD = {
  cardNumber: "CARD-2024-MGR-00018",
  cardType: "Proximity Card (RFID)",
  issuedOn: "02 Jan 2024",
  validTill: "31 Dec 2025",
  status: "Active",
  accessZones: ["Main Office", "Server Room", "Cafeteria", "Parking – Zone A", "Conference Rooms", "Restricted Area – Floor 4"],
  lastUsed: "Today, 08:47 AM",
  lastLocation: "Main Entrance",
  issuerName: "Security & IT Dept",
};

// ─── Field Component ──────────────────────────────────────────────────────────

function Field({
  fieldKey,
  value,
  readOnly,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  readOnly: boolean;
  onChange: (v: unknown) => void;
}) {
  const label = FORM_LABELS[fieldKey] ?? fieldKey;
  const stringValue = value === null || value === undefined ? "" : String(value);
  const isBoolean = typeof value === "boolean";
  const inputType = fieldKey.toLowerCase().includes("email")
    ? "email"
    : fieldKey.toLowerCase().includes("date") ||
      fieldKey === "joiningDate" ||
      fieldKey === "confirmationDate"
    ? "date"
    : "text";

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      {isBoolean ? (
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-foreground"
        />
      ) : (
        <input
          type={inputType}
          value={readOnly ? maskSensitive(fieldKey, stringValue) : stringValue}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground disabled:bg-secondary disabled:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      )}
    </label>
  );
}

// ─── Dynamic List Editor ──────────────────────────────────────────────────────

function DynamicListEditor({
  rows,
  onChange,
  readOnly,
  emptyTemplate,
}: {
  rows: Record<string, unknown>[];
  onChange: (rows: Record<string, unknown>[]) => void;
  readOnly: boolean;
  emptyTemplate?: Record<string, unknown>;
}) {
  const template = emptyTemplate ?? rows[0];
  const columns = template ? Object.keys(template).filter((k) => k !== "id") : [];

  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div
          key={String(row.id ?? rowIndex)}
          className="rounded-xl border border-border bg-background/50 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Entry {rowIndex + 1}
            </span>
            {!readOnly && (
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, i) => i !== rowIndex))}
                className="text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {columns.map((col) => (
              <Field
                key={`${rowIndex}-${col}`}
                fieldKey={col}
                value={row[col]}
                readOnly={readOnly}
                onChange={(v) => {
                  const next = [...rows];
                  next[rowIndex] = { ...next[rowIndex], [col]: v };
                  onChange(next);
                }}
              />
            ))}
          </div>
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          onClick={() => {
            const base = template ?? {};
            const newRow = Object.keys(base).reduce(
              (acc, key) => {
                if (key === "id") return { ...acc, id: `${Date.now()}` };
                if (typeof base[key] === "boolean") return { ...acc, [key]: false };
                return { ...acc, [key]: "" };
              },
              {} as Record<string, unknown>
            );
            onChange([...rows, newRow]);
          }}
          className="w-full h-10 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
        >
          + Add New Entry
        </button>
      )}
      {readOnly && rows.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No entries added yet.</p>
      )}
    </div>
  );
}

function FileUploadField({ label, readOnly }: { label: string; readOnly: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <input
        type="file"
        disabled={readOnly}
        className="text-sm text-foreground file:mr-3 file:h-8 file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:text-xs file:font-medium disabled:opacity-50"
      />
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-border/60 last:border-0">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

function AccessBadge({ mode }: { mode: TabMode }) {
  if (mode === "view-only")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground uppercase tracking-wider">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        View Only
      </span>
    );
  if (mode === "multi-add")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-foreground/8 border border-foreground/15 text-foreground uppercase tracking-wider">
        + Multiple Entries
      </span>
    );
  if (mode === "edit" || mode === "combined")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-foreground/8 border border-foreground/15 text-foreground uppercase tracking-wider">
        ✎ Editable
      </span>
    );
  return null;
}

// ─── Sub-Section Card ─────────────────────────────────────────────────────────

function SubSectionCard({
  title,
  children,
  onEdit,
  isEditing,
  isPending,
}: {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  isEditing?: boolean;
  isPending?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 space-y-4 transition-all ${isEditing ? "border-foreground/30 bg-card" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {onEdit && !isEditing && (
          <button
            onClick={onEdit}
            disabled={isPending}
            className="h-8 px-3 rounded-lg bg-secondary border border-border text-xs font-bold text-foreground hover:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Edit
          </button>
        )}
        {isEditing && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-foreground text-primary-foreground uppercase tracking-wider">
            Editing
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Employee Profile Combined ────────────────────────────────────────────────

const PROFILE_BASIC_FIELDS = [
  "salutation", "firstName", "middleName", "lastName", "preferredName",
  "officialEmail", "personalEmail", "workMobile", "personalMobile",
  "alternateMobileNumber", "extensionNumber", "bio",
];

const PERSONAL_DETAIL_FIELDS = [
  "dateOfBirth", "actualDateOfBirth", "gender", "bloodGroup", "maritalStatus",
  "nationality", "religion", "caste", "casteCategory", "residentialStatus",
  "placeOfBirth", "identificationMark", "physicallyChallenged", "internationalEmployee",
  "fatherName", "motherName", "spouseName",
];

const ADDRESS_FIELDS = [
  "addressLine1", "addressLine2", "landmark", "city", "state", "country", "pincode",
];

function EmployeeProfileCombined({
  profile,
  personalDetails,
  addresses,
  editingSection,
  draft,
  onEditProfile,
  onEditPersonal,
  onEditAddress,
  setDraft,
  pendingSections,
}: {
  profile: Record<string, unknown>;
  personalDetails: Record<string, unknown>;
  addresses: Record<string, Record<string, unknown>>;
  editingSection: SectionKey | null;
  draft: unknown;
  onEditProfile: () => void;
  onEditPersonal: () => void;
  onEditAddress: () => void;
  setDraft: (v: unknown) => void;
  pendingSections: string[];
}) {
  const profileData = editingSection === "profile" ? (draft as Record<string, unknown>) : profile;
  const personalData = editingSection === "personalDetails" ? (draft as Record<string, unknown>) : personalDetails;
  const addrData = editingSection === "addresses" ? (draft as Record<string, Record<string, unknown>>) : addresses;

  return (
    <div className="space-y-4">
      <SubSectionCard
        title="Basic Information"
        onEdit={onEditProfile}
        isEditing={editingSection === "profile"}
        isPending={pendingSections.includes("profile")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROFILE_BASIC_FIELDS.map((f) => (
            <Field key={f} fieldKey={f} value={profileData[f] ?? ""} readOnly={editingSection !== "profile"} onChange={(v) => setDraft({ ...(profileData as object), [f]: v })} />
          ))}
        </div>
        {editingSection === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border">
            <FileUploadField label="Profile Photo" readOnly={false} />
            <FileUploadField label="Signature Upload" readOnly={false} />
          </div>
        )}
      </SubSectionCard>

      <SubSectionCard
        title="Personal Details"
        onEdit={onEditPersonal}
        isEditing={editingSection === "personalDetails"}
        isPending={pendingSections.includes("personalDetails")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PERSONAL_DETAIL_FIELDS.map((f) => (
            <Field key={f} fieldKey={f} value={personalData[f] ?? ""} readOnly={editingSection !== "personalDetails"} onChange={(v) => setDraft({ ...(personalData as object), [f]: v })} />
          ))}
        </div>
      </SubSectionCard>

      <SubSectionCard
        title="Address & Emergency Contact"
        onEdit={onEditAddress}
        isEditing={editingSection === "addresses"}
        isPending={pendingSections.includes("addresses")}
      >
        <div className="space-y-4">
          {Object.entries(addrData).filter(([type]) => type !== "temporary").map(([addrType, values]) => (
            <div key={addrType}>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 capitalize">{addrType} Address</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ADDRESS_FIELDS.map((f) => (
                  <Field key={`${addrType}-${f}`} fieldKey={f} value={values[f] ?? ""} readOnly={editingSection !== "addresses"}
                    onChange={(v) => {
                      if (editingSection !== "addresses") return;
                      setDraft({ ...(addrData as object), [addrType]: { ...addrData[addrType], [f]: v } });
                    }}
                  />
                ))}
                {addrType === "current" && (
                  <Field fieldKey="sameAsPermanent" value={values["sameAsPermanent"] ?? false} readOnly={editingSection !== "addresses"}
                    onChange={(v) => {
                      if (editingSection !== "addresses") return;
                      setDraft({ ...(addrData as object), [addrType]: { ...addrData[addrType], sameAsPermanent: v } });
                    }}
                  />
                )}
              </div>
            </div>
          ))}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Emergency Contact</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {["emergencyContactName", "emergencyContactRelation", "emergencyContactNumber"].map((f) => (
                <Field key={f} fieldKey={f} value={(addrData["communication"] ?? {})[f] ?? ""} readOnly={editingSection !== "addresses"}
                  onChange={(v) => {
                    if (editingSection !== "addresses") return;
                    setDraft({ ...(addrData as object), communication: { ...(addrData["communication"] ?? {}), [f]: v } });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </SubSectionCard>
    </div>
  );
}

// ─── Section Renderers ────────────────────────────────────────────────────────

const PASSPORT_FIELDS = ["passportNumber", "passportHolderName", "issueDate", "expiryDate", "placeOfIssue", "countryOfIssue", "passportCategory", "passportStatus"];
const VISA_FIELDS = ["visaType", "visaNumber", "visaCountry", "visaSponsor", "visaIssueDate", "visaExpiryDate", "visaStatus"];

function PassportVisaSection({ data, readOnly, onChange }: { data: Record<string, unknown>; readOnly: boolean; onChange: (v: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Passport Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PASSPORT_FIELDS.map((f) => <Field key={f} fieldKey={f} value={data[f] ?? ""} readOnly={readOnly} onChange={(v) => onChange({ ...data, [f]: v })} />)}
        </div>
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Visa Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {VISA_FIELDS.map((f) => <Field key={f} fieldKey={f} value={data[f] ?? ""} readOnly={readOnly} onChange={(v) => onChange({ ...data, [f]: v })} />)}
        </div>
      </div>
      {!readOnly && (
        <div className="rounded-xl border border-border p-4 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Uploads</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FileUploadField label="Passport Front" readOnly={false} />
            <FileUploadField label="Passport Back" readOnly={false} />
            <FileUploadField label="Visa Copy" readOnly={false} />
          </div>
        </div>
      )}
    </div>
  );
}

function BankPfEsiSection({ data }: { data: Record<string, unknown> }) {
  const bankAccounts = (data?.bankAccounts ?? []) as Record<string, unknown>[];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Bank Accounts</p>
        {bankAccounts.length === 0 && <p className="text-sm text-muted-foreground">No bank accounts on record.</p>}
        {bankAccounts.map((acc, i) => (
          <div key={i} className="rounded-lg bg-secondary/60 px-4 py-3 mb-2 flex flex-wrap gap-x-6 gap-y-1.5">
            <InfoRow label="Bank" value={String(acc.bankName ?? "")} />
            <InfoRow label="Account No." value={maskSensitive("accountNumber", String(acc.accountNumber ?? ""))} />
            <InfoRow label="IFSC" value={String(acc.ifscCode ?? "")} />
            <InfoRow label="Type" value={String(acc.accountType ?? "")} />
            {acc.isPrimary && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-foreground text-primary-foreground uppercase tracking-wider self-start mt-1">Primary</span>}
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Statutory Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5">
          {[
            { label: "PAN Number", key: "panNumber" }, { label: "Aadhaar Number", key: "aadhaarNumber" },
            { label: "UAN Number", key: "uanNumber" }, { label: "ESIC Number", key: "esicNumber" },
            { label: "PF Number", key: "pfNumber" }, { label: "Tax Regime", key: "taxRegime" },
          ].map(({ label, key }) => (
            <InfoRow key={key} label={label} value={maskSensitive(key, String(data[key] ?? ""))} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmployeeSalarySection() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Compensation Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Pay Grade", value: MOCK_SALARY.grade },
            { label: "Annual CTC", value: MOCK_SALARY.ctcAnnual },
            { label: "Net Monthly Take-Home", value: MOCK_SALARY.netMonthlyTakeHome },
            { label: "Last Increment", value: `${MOCK_SALARY.lastIncrementDate} (${MOCK_SALARY.lastIncrementPercent})` },
            { label: "Next Review", value: MOCK_SALARY.nextReviewDate },
            { label: "Payment Mode", value: MOCK_SALARY.paymentMode },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border p-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Monthly Breakdown</p>
        <div className="space-y-1">
          {[
            { label: "Basic Pay", value: MOCK_SALARY.basicMonthly, type: "earning" },
            { label: "HRA", value: MOCK_SALARY.hraMonthly, type: "earning" },
            { label: "Special Allowance", value: MOCK_SALARY.specialAllowanceMonthly, type: "earning" },
            { label: "PF Deduction", value: `– ${MOCK_SALARY.pfDeductionMonthly}`, type: "deduction" },
            { label: "Professional Tax", value: `– ${MOCK_SALARY.professionalTaxMonthly}`, type: "deduction" },
          ].map(({ label, value, type }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
              <span className="text-sm text-foreground">{label}</span>
              <span className={`text-sm font-semibold ${type === "deduction" ? "text-destructive" : "text-foreground"}`}>{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2.5 mt-1 bg-secondary rounded-lg px-3">
            <span className="text-sm font-bold text-foreground">Net Take-Home</span>
            <span className="text-sm font-bold text-foreground">{MOCK_SALARY.netMonthlyTakeHome}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">Salary details are maintained by HR. Contact HR to raise a revision query.</p>
    </div>
  );
}

function AccessCardSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Card Number</p>
            <p className="text-base font-bold text-foreground font-mono">{MOCK_ACCESS_CARD.cardNumber}</p>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${MOCK_ACCESS_CARD.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
            {MOCK_ACCESS_CARD.status}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow label="Card Type" value={MOCK_ACCESS_CARD.cardType} />
          <InfoRow label="Issued On" value={MOCK_ACCESS_CARD.issuedOn} />
          <InfoRow label="Valid Till" value={MOCK_ACCESS_CARD.validTill} />
          <InfoRow label="Issuing Authority" value={MOCK_ACCESS_CARD.issuerName} />
          <InfoRow label="Last Used" value={MOCK_ACCESS_CARD.lastUsed} />
          <InfoRow label="Last Location" value={MOCK_ACCESS_CARD.lastLocation} />
        </div>
      </div>
      <div className="rounded-xl border border-border p-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Access Zones</p>
        <div className="flex flex-wrap gap-2">
          {MOCK_ACCESS_CARD.accessZones.map((zone) => (
            <span key={zone} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground">{zone}</span>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">For card replacement or zone access changes, raise a request with the IT/Security team.</p>
    </div>
  );
}

function AssetManagementSection({ data }: { data: Record<string, unknown>[] }) {
  if (!data || data.length === 0) {
    return <div className="py-10 text-center"><p className="text-sm text-muted-foreground">No assets assigned to you currently.</p></div>;
  }
  return (
    <div className="space-y-3">
      {data.map((asset, i) => (
        <div key={i} className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-foreground">{String(asset.assetName || asset.assetType || `Asset ${i + 1}`)}</p>
              <p className="text-xs text-muted-foreground font-mono">{String(asset.assetTag || "")}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground uppercase">{String(asset.assetCondition || "—")}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
            <InfoRow label="Serial No." value={String(asset.deviceSerialNumber || "—")} />
            <InfoRow label="Assigned" value={String(asset.assignedDate || "—")} />
            <InfoRow label="Due Date" value={String(asset.dueDate || "—")} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Employee Documents Section (Manager — uses Redux doc types) ─────────────

function EmployeeDocumentsSectionMgr({
  docs,
  readOnly,
  onEdit,
  onChange,
  isPending,
}: {
  docs: Partial<Record<string, EmployeeDocumentMeta>>;
  readOnly: boolean;
  onEdit: () => void;
  onChange: (next: Partial<Record<string, EmployeeDocumentMeta>>) => void;
  isPending: boolean;
}) {
  const allTypes = useSelector(selectActiveDocumentTypes);
  const documentTypes = useMemo(
    () => (readOnly ? allTypes : allTypes.filter((t) => t.allowEmployeeEdit)),
    [allTypes, readOnly]
  );
  return (
    <div className="space-y-3">
      {readOnly && (
        <div className="flex justify-end">
          <button
            onClick={onEdit}
            disabled={isPending}
            className="h-9 px-4 rounded-lg bg-secondary border border-border text-xs font-bold text-foreground hover:bg-border transition-colors disabled:opacity-50"
          >
            Add / Edit Documents
          </button>
        </div>
      )}
      <EmployeeDocumentsGrid
        documentTypes={documentTypes}
        docs={docs}
        isEditing={!readOnly}
        onChange={onChange}
      />
    </div>
  );
}

// ─── My Request Section ───────────────────────────────────────────────────────

interface ChangeRequest {
  id: string;
  section_label: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

function MyRequestSection({
  changeHistory,
  pendingSections,
  onSubmitFreeRequest,
}: {
  changeHistory: ChangeRequest[];
  pendingSections: string[];
  onSubmitFreeRequest: (section: string, description: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formSection, setFormSection] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const counts = useMemo(() => ({
    total: changeHistory.length,
    pending: changeHistory.filter((r) => r.status === "pending").length,
    approved: changeHistory.filter((r) => r.status === "approved").length,
    rejected: changeHistory.filter((r) => r.status === "rejected").length,
  }), [changeHistory]);

  const filtered = useMemo(() => {
    if (filter === "all") return changeHistory;
    return changeHistory.filter((r) => r.status === filter);
  }, [changeHistory, filter]);

  const handleSubmit = () => {
    if (!formSection) return;
    onSubmitFreeRequest(formSection, formDescription);
    setShowForm(false);
    setFormSection("");
    setFormDescription("");
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total, tone: "neutral" },
          { label: "Pending", value: counts.pending, tone: "warning" },
          { label: "Approved", value: counts.approved, tone: "success" },
          { label: "Rejected", value: counts.rejected, tone: "danger" },
        ].map(({ label, value, tone }) => (
          <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={`text-xl font-bold ${tone === "warning" ? "text-amber-600" : tone === "success" ? "text-emerald-600" : tone === "danger" ? "text-destructive" : "text-foreground"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter + Action */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${filter === f ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="h-8 px-4 rounded-lg bg-foreground text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity">
          {showForm ? "Cancel" : "+ Raise Request"}
        </button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="rounded-xl border border-foreground/20 bg-card p-5 space-y-4">
          <h4 className="text-sm font-bold text-foreground">Raise a New Edit Request</h4>
          <div className="space-y-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Section to Update</span>
              <select value={formSection} onChange={(e) => setFormSection(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20">
                <option value="">— Select a section —</option>
                {TAB_SECTIONS.filter((s) => s.mode !== "view-only" && s.mode !== "requests").map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Describe the Change</span>
              <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} placeholder="Describe what needs to be updated and why..." className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20" />
            </label>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={handleSubmit} disabled={!formSection} className="h-9 px-5 rounded-lg bg-foreground text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
                Submit Request
              </button>
              <button onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Warning */}
      {pendingSections.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 font-medium">
          {pendingSections.length} section(s) have pending approval requests.
        </div>
      )}

      {/* Request List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "all" ? "No requests submitted yet." : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((req) => {
            const isExpanded = expandedId === req.id;
            const statusStyle = req.status === "approved"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : req.status === "rejected"
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-amber-500/10 text-amber-600 border-amber-500/20";

            return (
              <div key={req.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{req.section_label}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.created_at ? new Date(req.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${statusStyle} ${req.status === "pending" ? "animate-pulse" : ""}`}>
                      {req.status}
                    </span>
                    <svg className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground italic">Request submitted for section: {req.section_label}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Templates ────────────────────────────────────────────────────────────────

const EDUCATION_TEMPLATE = { id: "", qualification: "", degree: "", specialization: "", institutionName: "", boardUniversity: "", passingYear: "", percentageCgpa: "", grade: "", courseType: "", duration: "" };
const FAMILY_TEMPLATE = { id: "", familyMemberName: "", relationship: "", dateOfBirth: "", gender: "", bloodGroup: "", contactNumber: "", occupation: "", dependentStatus: "", emergencyContact: false };
const NOMINEE_TEMPLATE = { id: "", nomineeName: "", relationship: "", dateOfBirth: "", sharePercentage: "", contactNumber: "", address: "" };
const INSURANCE_TEMPLATE = { id: "", policyNumber: "", provider: "", policyType: "", coverageAmount: "", startDate: "", endDate: "", nomineeName: "" };
const WORK_EXP_TEMPLATE = { id: "", companyName: "", jobTitle: "", startDate: "", endDate: "", totalExperience: "", reasonForLeaving: "", currentlyWorking: false, hrContact: "" };

// ─── Main Component ───────────────────────────────────────────────────────────

const DIRECT_SYNC_SECTIONS = new Set<SectionKey>(["profile", "personalDetails", "addresses", "nomineeDetails", "languageDetails"]);

export function ManagerProfilePage() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? "1";
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [draft, setDraft] = useState<unknown>(null);
  const [pendingSections, setPendingSections] = useState<SectionKey[]>([]);
  const [banner, setBanner] = useState<BannerState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("employeeProfile");

  const changeHistory = useMemo(
    () => getChangeRequests(employeeId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employeeId, profile, pendingSections]
  );

  const refresh = () => {
    setLoading(true);
    setProfile(getProfile(employeeId));
    setPendingSections(getPendingSections(employeeId));
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const beginEdit = (section: SectionKey) => {
    if (!profile) return;
    setEditingSection(section);
    const storeKey = getStoreKey(section);
    const base = storeKey === "documentsRepository"
      ? (profile as unknown as Record<string, unknown>).employeeDocuments ?? {}
      : (profile as unknown as Record<string, unknown>)[storeKey] ?? {};
    setDraft(JSON.parse(JSON.stringify(base)));
    setBanner(null);
  };

  const cancelEdit = () => { setEditingSection(null); setDraft(null); };

  const submitChange = (section: SectionKey) => {
    if (!profile) return;
    const storeKey = getStoreKey(section);
    const current = (profile as unknown as Record<string, unknown>)[storeKey];

    if (isEqualPayload(current, draft)) {
      setBanner({ type: "error", message: "No changes detected." });
      return;
    }

    if (section === "profile") {
      const next = draft as Record<string, unknown>;
      if (next.personalEmail && !validateEmail(String(next.personalEmail))) {
        setBanner({ type: "error", message: "Personal email format is invalid." });
        return;
      }
    }
    if (section === "personalDetails") {
      const next = draft as Record<string, unknown>;
      if (next.panNumber && !validatePan(String(next.panNumber))) {
        setBanner({ type: "error", message: "PAN format is invalid. Expected: ABCDE1234F." });
        return;
      }
      if (next.aadhaarNumber && !validateAadhaar(String(next.aadhaarNumber))) {
        setBanner({ type: "error", message: "Aadhaar must be a 12-digit number." });
        return;
      }
    }
    if (section === "bankAndStatutoryDetails" as SectionKey) {
      const next = draft as Record<string, unknown>;
      if (next.bankAccounts) {
        const primaryCount = (next.bankAccounts as Record<string, unknown>[]).filter((e) => e.isPrimary).length;
        if (primaryCount > 1) {
          setBanner({ type: "error", message: "Only one bank account can be marked as primary." });
          return;
        }
        if (detectDuplicateValues((next.bankAccounts as Record<string, unknown>[]).map((e) => String(e.accountNumber ?? "")))) {
          setBanner({ type: "error", message: "Duplicate bank account numbers are not allowed." });
          return;
        }
      }
    }
    if (section === "nomineeDetails") {
      const next = draft as Record<string, unknown>[];
      if (Array.isArray(next)) {
        const total = next.reduce((s, e) => s + (Number(e.sharePercentage) || 0), 0);
        if (total > 100) {
          setBanner({ type: "error", message: "Nominee share percentage cannot exceed 100%." });
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      submitSectionChangeRequest({ employeeId, section, newValue: draft });
      setBanner({ type: "success", message: "Change request submitted and awaiting admin approval." });
      cancelEdit();
      refresh();
    } catch (err) {
      setBanner({ type: "error", message: err instanceof Error ? err.message : "Failed to submit. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFreeRequest = (sectionKey: string, _description: string) => {
    const tabSection = TAB_SECTIONS.find((s) => s.key === sectionKey);
    if (!tabSection || !profile) return;
    const storeSection = (tabSection.storeKey ?? tabSection.key) as SectionKey;
    try {
      submitSectionChangeRequest({ employeeId, section: storeSection, newValue: {} });
      refresh();
    } catch { /* ignore */ }
  };

  if (loading || !profile) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span className="text-sm">Loading profile...</span>
        </div>
      </div>
    );
  }

  const activeSection = TAB_SECTIONS.find((s) => s.key === activeTab) ?? TAB_SECTIONS[0];
  const storeKey = getStoreKey(activeSection.key);
  const isPending = pendingSections.includes(storeKey as SectionKey);
  const rawData =
    storeKey === "documentsRepository"
      ? ((profile as unknown as Record<string, unknown>).employeeDocuments ?? {})
      : (profile as unknown as Record<string, unknown>)[storeKey];
  const isEditing = editingSection !== null && (
    editingSection === storeKey ||
    (activeSection.mode === "combined" && ["profile", "personalDetails", "addresses"].includes(editingSection))
  );
  const sectionData = isEditing ? draft : rawData;

  const editingSectionLabel =
    editingSection === "profile" ? "Basic Information" :
    editingSection === "personalDetails" ? "Personal Details" :
    editingSection === "addresses" ? "Address & Emergency Contact" :
    activeSection.label;

  const renderSectionBody = () => {
    if (activeSection.mode === "combined") {
      return (
        <EmployeeProfileCombined
          profile={(profile as unknown as Record<string, unknown>).profile as Record<string, unknown> ?? {}}
          personalDetails={(profile as unknown as Record<string, unknown>).personalDetails as Record<string, unknown> ?? {}}
          addresses={(profile as unknown as Record<string, unknown>).addresses as Record<string, Record<string, unknown>> ?? {}}
          editingSection={editingSection}
          draft={draft}
          onEditProfile={() => beginEdit("profile" as SectionKey)}
          onEditPersonal={() => beginEdit("personalDetails" as SectionKey)}
          onEditAddress={() => beginEdit("addresses" as SectionKey)}
          setDraft={setDraft}
          pendingSections={pendingSections as string[]}
        />
      );
    }
    if (activeSection.key === "bankPfEsi") return <BankPfEsiSection data={(sectionData as Record<string, unknown>) ?? {}} />;
    if (activeSection.key === "employeeSalary") return <EmployeeSalarySection />;
    if (activeSection.key === "accessCardDetails") return <AccessCardSection />;
    if (activeSection.key === "assetManagement") return <AssetManagementSection data={(sectionData as Record<string, unknown>[]) ?? []} />;
    if (activeSection.key === "myRequest") {
      return (
        <MyRequestSection
          changeHistory={changeHistory as ChangeRequest[]}
          pendingSections={pendingSections as string[]}
          onSubmitFreeRequest={handleFreeRequest}
        />
      );
    }

    if (activeSection.key === "passportVisa") {
      const isEditingPV = editingSection === "passportAndVisa";
      return (
        <PassportVisaSection
          data={(isEditingPV ? draft : rawData) as Record<string, unknown> ?? {}}
          readOnly={!isEditingPV}
          onChange={setDraft}
        />
      );
    }

    if (activeSection.key === "employeeDocuments") {
      const isEditingDocs = editingSection === ("documentsRepository" as SectionKey);
      return (
        <EmployeeDocumentsSectionMgr
          docs={(isEditingDocs ? draft : rawData) as Partial<Record<string, EmployeeDocumentMeta>> ?? {}}
          readOnly={!isEditingDocs}
          onEdit={() => {
            if (!profile) return;
            setEditingSection("documentsRepository" as SectionKey);
            const base = (profile as unknown as Record<string, unknown>).employeeDocuments ?? {};
            setDraft(JSON.parse(JSON.stringify(base)));
            setBanner(null);
          }}
          onChange={(d) => setDraft(d)}
          isPending={isPending}
        />
      );
    }

    if (activeSection.mode === "multi-add") {
      const template =
        activeSection.key === "educationDetails" ? EDUCATION_TEMPLATE :
        activeSection.key === "familyDetails" ? FAMILY_TEMPLATE :
        activeSection.key === "nomineeDetails" ? NOMINEE_TEMPLATE :
        activeSection.key === "insuranceDetails" ? INSURANCE_TEMPLATE :
        activeSection.key === "workExperience" ? WORK_EXP_TEMPLATE : undefined;

      const storeSection = (activeSection.storeKey ?? activeSection.key) as SectionKey;
      const isEditingMulti = editingSection === storeSection;
      const rows = (isEditingMulti ? draft : rawData) as Record<string, unknown>[];

      return (
        <div className="space-y-3">
          {!isEditingMulti && (
            <div className="flex justify-end">
              <button onClick={() => beginEdit(storeSection)} disabled={isPending} className="h-9 px-4 rounded-lg bg-secondary border border-border text-xs font-bold text-foreground hover:bg-border transition-colors disabled:opacity-50">
                + Add / Edit Entries
              </button>
            </div>
          )}
          <DynamicListEditor rows={Array.isArray(rows) ? rows : []} onChange={setDraft} readOnly={!isEditingMulti} emptyTemplate={template} />
          {activeSection.key === "nomineeDetails" && isEditingMulti && (
            <div className="rounded-xl border border-border p-4 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nominee Documents</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FileUploadField label="Aadhaar Card" readOnly={false} />
                <FileUploadField label="PAN Card" readOnly={false} />
                <FileUploadField label="Relationship Proof" readOnly={false} />
              </div>
            </div>
          )}
          {activeSection.key === "workExperience" && isEditingMulti && (
            <div className="rounded-xl border border-border p-4 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Supporting Document</p>
              <FileUploadField label="Experience Letter" readOnly={false} />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">No content available for this section.</p>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-28 relative">
      <EssProfileHeaderCard employeeId={employeeId} profile={profile} />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Mobile Select */}
        <div className="lg:hidden w-full">
          <select value={activeTab} onChange={(e) => { cancelEdit(); setActiveTab(e.target.value); }} className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none">
            {TAB_SECTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        {/* Sidebar — flat admin-style */}
        <aside className="w-56 min-w-[224px] hidden lg:block bg-card border border-border rounded-xl overflow-hidden sticky top-6">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Employee Sections</p>
          </div>
          <nav className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto space-y-0.5">
            {TAB_SECTIONS.map((section) => {
              const isActive = activeTab === section.key;
              const hasPending = pendingSections.includes(getStoreKey(section.key) as SectionKey);
              const Icon = section.icon;
              return (
                <button
                  key={section.key}
                  onClick={() => { cancelEdit(); setActiveTab(section.key); setBanner(null); }}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all relative ${
                    isActive ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground rounded-r-full" />}
                  <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                  <span className="truncate flex-1 text-[13px]">{section.label}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {section.mode === "view-only" && (
                      <svg className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    {hasPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 w-full space-y-4">
          {banner && (
            <div className={`rounded-xl px-4 py-3 text-sm border ${banner.type === "success" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium" : "bg-destructive/10 text-destructive border-destructive/20 font-medium"}`}>
              {banner.message}
            </div>
          )}

          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div>
                  <h2 className="text-base font-bold text-foreground">{activeSection.label}</h2>
                  {isPending && <p className="text-xs text-amber-600 font-medium mt-0.5">Pending approval — editing locked</p>}
                </div>
                <AccessBadge mode={activeSection.mode} />
              </div>
            </div>
            <div className="p-6">{renderSectionBody()}</div>
          </section>
        </div>
      </div>

      {/* Sticky Save Bar */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 h-[68px] bg-card/90 backdrop-blur-xl border-t border-border flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            <span className="text-xs font-bold text-foreground">Editing — {editingSectionLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={cancelEdit} className="h-9 px-5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors">
              Cancel
            </button>
            <button
              onClick={() => submitChange((editingSection ?? (activeSection.storeKey ?? activeSection.key)) as SectionKey)}
              disabled={submitting}
              className="h-9 px-5 bg-foreground text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
