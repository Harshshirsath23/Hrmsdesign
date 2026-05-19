import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ESS_SECTIONS } from "../../modules/ess/data";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { fetchEmployeeData, saveEssProfileWithAdminSync } from "../../../store/slices/employeeSlice";
import { addNotification } from "../../../store/slices/notificationSlice";
import { fetchRequests, createRequest } from "../../../store/slices/requestSlice";
import { MyRequestsTable } from "../../components/employee/MyRequestsTable";
import { EmployeeNotificationPanel } from "../../components/ui/EmployeeNotificationPanel";
import { EssProfileHeaderCard } from "../../components/employee/EssProfileHeaderCard";
import { EmployeeDocumentMeta } from "../../components/employees/mockData";
import { EmployeeDocumentsGrid } from "../../modules/employees/documentTypes/EmployeeDocumentsGrid";
import { selectActiveDocumentTypes } from "../../../store/slices/documentTypesSlice";
import { EmployeeProfile, SectionKey } from "../../modules/ess/types";
import {
  detectDuplicateValues,
  isEqualPayload,
  maskSensitive,
  validateAadhaar,
  validateEmail,
  validatePan,
} from "../../modules/ess/utils";

type BannerState = { type: "success" | "error"; message: string } | null;

// ---------------------------------------------------------------------------
// Field label map — extended with all new fields
// ---------------------------------------------------------------------------
const FORM_LABELS: Record<string, string> = {
  // Profile Information
  employeeId: "Employee ID",
  employeeCode: "Employee Code",
  salutation: "Salutation",
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  preferredName: "Preferred Name",
  profilePhoto: "Profile Photo",
  officialEmail: "Official Email",
  personalEmail: "Personal Email",
  workMobile: "Work Mobile",
  personalMobile: "Personal Mobile",
  alternateMobileNumber: "Alternate Mobile Number",
  extensionNumber: "Extension Number",
  username: "Username",
  bio: "Bio / About",
  signatureUpload: "Signature Upload",

  // Personal Details
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

  // Contact & Address
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

  // Employment
  department: "Department",
  subDepartment: "Sub Department",
  designation: "Designation",
  employmentType: "Employment Type",
  employeeCategory: "Employee Category",
  gradeBand: "Grade / Band",
  workLocation: "Work Location",
  shift: "Shift",
  joiningDate: "Joining Date",
  confirmationDate: "Confirmation Date",
  probationStatus: "Probation Status",
  noticePeriod: "Notice Period (Days)",
  employeeStatus: "Employee Status",
  reportingManager: "Reporting Manager",
  functionalManager: "Functional Manager",
  hrPartner: "HR Partner",

  // Bank & Statutory
  bankName: "Bank Name",
  branchName: "Branch Name",
  ifscCode: "IFSC Code",
  accountNumber: "Account Number",
  accountHolderName: "Account Holder Name",
  accountType: "Account Type",
  isPrimary: "Primary Account",
  panNumber: "PAN Number",
  aadhaarNumber: "Aadhaar Number",
  uanNumber: "UAN Number",
  esicNumber: "ESIC Number",
  pfNumber: "PF Number",
  professionalTaxNumber: "Professional Tax Number",
  passportNumber: "Passport Number",
  taxRegime: "Tax Regime",

  // Nominee
  nomineeName: "Nominee Name",
  relationship: "Relationship",
  sharePercentage: "Share Percentage (%)",
  contactNumber: "Contact Number",
  address: "Address",
  sameAsCurrentAddress: "Same as Current Address",
  sameAsPermanentAddress: "Same as Permanent Address",

  // Passport & Visa
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

  // Previous Employment
  companyName: "Company Name",
  totalExperience: "Total Experience",
  hrContact: "HR Contact",
  reasonForLeaving: "Reason for Leaving",
  currentlyWorking: "Currently Working",

  // Education
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

  // Skills
  skillName: "Skill Name",
  skillCategory: "Skill Category",
  skillLevel: "Skill Level",
  experienceInSkill: "Experience in Skill",

  // Certifications
  certificationName: "Certification Name",
  issuingOrganization: "Issuing Organization",
  licenseNumber: "License Number",
  validFrom: "Valid From",
  validTill: "Valid Till",
  credentialUrl: "Credential URL",

  // Assets
  assetTag: "Asset Tag",
  assetName: "Asset Name",
  assetType: "Asset Type",
  deviceSerialNumber: "Device Serial Number",
  softwareLicenses: "Software Licenses",
  assignedDate: "Assigned Date",
  dueDate: "Due Date",
  assetCondition: "Asset Condition",
  remarks: "Remarks",

  // Family
  familyMemberName: "Family Member Name",
  occupation: "Occupation",
  dependentStatus: "Dependent Status",
  emergencyContact: "Emergency Contact",

  // Emergency & Medical
  medicalConditions: "Medical Conditions",
  allergies: "Allergies",
  doctorName: "Doctor Name",
  insuranceProvider: "Insurance Provider",
  insurancePolicyNumber: "Insurance Policy Number",

  // Insurance
  policyNumber: "Policy Number",
  provider: "Provider",
  policyType: "Policy Type",
  coverageAmount: "Coverage Amount",
  endDate: "End Date",

  // Language
  language: "Language",
  proficiencyLevel: "Proficiency Level",
  canRead: "Can Read",
  canSpeak: "Can Speak",
  canWrite: "Can Write",

  // Social
  linkedin: "LinkedIn",
  github: "GitHub",
  portfolioWebsite: "Portfolio Website",
  personalWebsite: "Personal Website",
};

// ---------------------------------------------------------------------------
// Extended ESS_SECTIONS — sections not already in the original data file
// ---------------------------------------------------------------------------
const EXTRA_SECTIONS = [
  { key: "passportAndVisa", label: "Passport & Visa Details", editable: true, optional: true },
  { key: "previousEmployment", label: "Previous Employment / Work Experience", editable: true, optional: true },
  { key: "educationDetails", label: "Education Details", editable: true, optional: true },
  { key: "skillsAndCertifications", label: "Skills & Certifications", editable: true, optional: true },
  { key: "documentsRepository", label: "Documents Repository", editable: true, optional: true },
  { key: "familyDetails", label: "Family Details", editable: true, optional: true },
  { key: "emergencyAndMedical", label: "Emergency & Medical Information", editable: true, optional: true },
  { key: "socialProfiles", label: "Social & Professional Profiles", editable: true, optional: true },
] as const;

// ---------------------------------------------------------------------------
// Field component
// ---------------------------------------------------------------------------
function Field({
  fieldKey,
  value,
  readOnly,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  readOnly: boolean;
  onChange: (value: unknown) => void;
}) {
  const label = FORM_LABELS[fieldKey] ?? fieldKey;
  const stringValue = value === null || value === undefined ? "" : String(value);
  const isBoolean = typeof value === "boolean";
  const inputType = fieldKey.toLowerCase().includes("email")
    ? "email"
    : fieldKey.toLowerCase().includes("url") ||
      fieldKey.toLowerCase().includes("website") ||
      fieldKey.toLowerCase().includes("linkedin") ||
      fieldKey.toLowerCase().includes("github") ||
      fieldKey.toLowerCase().includes("portfolio")
    ? "url"
    : fieldKey.toLowerCase().includes("date") ||
      fieldKey.toLowerCase().includes("from") ||
      fieldKey.toLowerCase().includes("till") ||
      fieldKey === "joiningDate" ||
      fieldKey === "confirmationDate"
    ? "date"
    : fieldKey.toLowerCase().includes("number") ||
      fieldKey === "sharePercentage" ||
      fieldKey === "coverageAmount"
    ? "text"
    : "text";

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
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
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground disabled:bg-secondary disabled:text-muted-foreground"
        />
      )}
    </label>
  );
}

// ---------------------------------------------------------------------------
// DynamicListEditor
// ---------------------------------------------------------------------------
function DynamicListEditor({
  rows,
  onChange,
  readOnly,
}: {
  rows: Record<string, unknown>[];
  onChange: (rows: Record<string, unknown>[]) => void;
  readOnly: boolean;
}) {
  const columns = rows[0] ? Object.keys(rows[0]).filter((k) => k !== "id") : [];

  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div
          key={String(row.id ?? rowIndex)}
          className="rounded-lg border border-border p-3 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
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
          {!readOnly && (
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, i) => i !== rowIndex))}
              className="h-10 px-3 rounded-lg border border-border text-sm text-foreground hover:bg-secondary"
            >
              Remove Row
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          onClick={() => {
            const base = rows[0] ?? {};
            const newRow = Object.keys(base).reduce((acc, key) => {
              if (key === "id") return { ...acc, id: `${Date.now()}` };
              if (typeof base[key] === "boolean") return { ...acc, [key]: false };
              return { ...acc, [key]: "" };
            }, {} as Record<string, unknown>);
            onChange([...rows, newRow]);
          }}
          className="h-10 px-4 rounded-lg bg-foreground text-primary-foreground text-sm font-medium"
        >
          Add Row
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FileUploadField — lightweight upload placeholder (wires to your storage layer)
// ---------------------------------------------------------------------------
function FileUploadField({
  label,
  readOnly,
}: {
  label: string;
  readOnly: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type="file"
        disabled={readOnly}
        className="text-sm text-foreground file:mr-3 file:h-8 file:rounded file:border file:border-border file:bg-secondary file:px-3 file:text-xs file:font-medium disabled:opacity-50"
      />
    </label>
  );
}

// ---------------------------------------------------------------------------
// Passport & Visa section renderer
// ---------------------------------------------------------------------------
function PassportVisaSection({
  data,
  readOnly,
  onChange,
}: {
  data: Record<string, unknown>;
  readOnly: boolean;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const passportFields = [
    "passportNumber",
    "passportHolderName",
    "issueDate",
    "expiryDate",
    "placeOfIssue",
    "countryOfIssue",
    "passportCategory",
    "passportStatus",
  ];
  const visaFields = [
    "visaType",
    "visaNumber",
    "visaCountry",
    "visaSponsor",
    "visaIssueDate",
    "visaExpiryDate",
    "visaStatus",
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-3">
        <p className="text-sm font-semibold text-foreground mb-3">Passport Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {passportFields.map((f) => (
            <Field
              key={f}
              fieldKey={f}
              value={data[f] ?? ""}
              readOnly={readOnly}
              onChange={(v) => onChange({ ...data, [f]: v })}
            />
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-sm font-semibold text-foreground mb-3">Visa Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visaFields.map((f) => (
            <Field
              key={f}
              fieldKey={f}
              value={data[f] ?? ""}
              readOnly={readOnly}
              onChange={(v) => onChange({ ...data, [f]: v })}
            />
          ))}
        </div>
      </div>
      {!readOnly && (
        <div className="rounded-lg border border-border p-3 space-y-3">
          <p className="text-sm font-semibold text-foreground">Uploads</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FileUploadField label="Passport Front" readOnly={readOnly} />
            <FileUploadField label="Passport Back" readOnly={readOnly} />
            <FileUploadField label="Visa Copy" readOnly={readOnly} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skills & Certifications section renderer
// ---------------------------------------------------------------------------
function SkillsCertificationsSection({
  data,
  readOnly,
  onChange,
}: {
  data: { skills: Record<string, unknown>[]; certifications: Record<string, unknown>[] };
  readOnly: boolean;
  onChange: (v: typeof data) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-3">
        <p className="text-sm font-semibold text-foreground mb-3">Skills</p>
        <DynamicListEditor
          rows={data.skills}
          readOnly={readOnly}
          onChange={(rows) => onChange({ ...data, skills: rows })}
        />
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-sm font-semibold text-foreground mb-3">Certifications</p>
        <DynamicListEditor
          rows={data.certifications}
          readOnly={readOnly}
          onChange={(rows) => onChange({ ...data, certifications: rows })}
        />
        {!readOnly && (
          <div className="mt-3">
            <FileUploadField label="Certification Document" readOnly={readOnly} />
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentsRepositorySection({
  docs,
  readOnly,
  onChange,
}: {
  docs: Partial<Record<string, EmployeeDocumentMeta>>;
  readOnly: boolean;
  onChange: (next: Partial<Record<string, EmployeeDocumentMeta>>) => void;
}) {
  const allTypes = useSelector(selectActiveDocumentTypes);
  const documentTypes = useMemo(
    () => (readOnly ? allTypes : allTypes.filter((t) => t.allowEmployeeEdit)),
    [allTypes, readOnly]
  );

  return (
    <EmployeeDocumentsGrid
      documentTypes={documentTypes}
      docs={docs}
      isEditing={!readOnly}
      onChange={onChange}
    />
  );
}

// ---------------------------------------------------------------------------
// Address sub-section renderer (reused for current / permanent)
// ---------------------------------------------------------------------------
const ADDRESS_FIELDS = [
  "addressLine1",
  "addressLine2",
  "landmark",
  "city",
  "state",
  "country",
  "pincode",
  "startDate",
  "toDate",
];

function AddressesSection({
  data,
  readOnly,
  onChange,
}: {
  data: Record<string, Record<string, unknown>>;
  readOnly: boolean;
  onChange: (v: Record<string, Record<string, unknown>>) => void;
}) {
  return (
    <div className="space-y-4">
      {Object.entries(data)
        .filter(([addrType]) => addrType !== "temporary")
        .map(([addrType, values]) => (
          <div key={addrType} className="rounded-lg border border-border p-3">
            <p className="text-sm font-semibold text-foreground capitalize mb-3">{addrType} Address</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ADDRESS_FIELDS.map((f) => (
                <Field
                  key={`${addrType}-${f}`}
                  fieldKey={f}
                  value={values[f] ?? ""}
                  readOnly={readOnly}
                  onChange={(v) => {
                    if (readOnly) return;
                    onChange({ ...data, [addrType]: { ...data[addrType], [f]: v } });
                  }}
                />
              ))}
              {addrType === "current" && (
                <Field
                  fieldKey="sameAsPermanent"
                  value={values["sameAsPermanent"] ?? false}
                  readOnly={readOnly}
                  onChange={(v) => {
                    if (readOnly) return;
                    onChange({ ...data, [addrType]: { ...data[addrType], sameAsPermanent: v } });
                  }}
                />
              )}
            </div>
          </div>
        ))}

      {/* Communication Details */}
      <div className="rounded-lg border border-border p-3">
        <p className="text-sm font-semibold text-foreground mb-3">Communication Details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "emergencyContactName",
            "emergencyContactRelation",
            "emergencyContactNumber",
            "alternateMobileNumber",
          ].map((f) => (
            <Field
              key={f}
              fieldKey={f}
              value={(data["communication"] ?? {})[f] ?? ""}
              readOnly={readOnly}
              onChange={(v) => {
                if (readOnly) return;
                onChange({ ...data, communication: { ...(data["communication"] ?? {}), [f]: v } });
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground mb-4">My Requests</h2>
        <MyRequestsTable />
      </div>
      
      <EmployeeNotificationPanel />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile section renderer — adds new fields not in original
// ---------------------------------------------------------------------------
const ORIGINAL_PROFILE_FIELDS = [
  "employeeId",
  "employeeCode",
  "salutation",
  "firstName",
  "middleName",
  "lastName",
  "preferredName",
  "officialEmail",
  "personalEmail",
  "workMobile",
  "personalMobile",
  "alternateMobileNumber",
  "extensionNumber",
  "username",
  "bio",
];

function ProfileSection({
  data,
  readOnly,
  onChange,
}: {
  data: Record<string, unknown>;
  readOnly: boolean;
  onChange: (v: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ORIGINAL_PROFILE_FIELDS.map((f) => (
          <Field
            key={f}
            fieldKey={f}
            value={data[f] ?? ""}
            readOnly={readOnly}
            onChange={(v) => onChange({ ...data, [f]: v })}
          />
        ))}
      </div>
      {!readOnly && (
        <p className="text-xs text-muted-foreground">
          Profile photo is updated from the summary card at the top of this page.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Personal Details — adds motherName, caste, casteCategory
// ---------------------------------------------------------------------------
const PERSONAL_DETAIL_FIELDS = [
  "dateOfBirth",
  "actualDateOfBirth",
  "gender",
  "bloodGroup",
  "maritalStatus",
  "nationality",
  "religion",
  "caste",
  "casteCategory",
  "residentialStatus",
  "placeOfBirth",
  "identificationMark",
  "physicallyChallenged",
  "internationalEmployee",
  "fatherName",
  "motherName",
  "spouseName",
];

// ---------------------------------------------------------------------------
// Employment — adds subDepartment, gradeBand, joiningDate, confirmationDate, probationStatus, employeeStatus
// ---------------------------------------------------------------------------
const EMPLOYMENT_FIELDS = [
  "department",
  "subDepartment",
  "designation",
  "employmentType",
  "employeeCategory",
  "gradeBand",
  "workLocation",
  "shift",
  "joiningDate",
  "confirmationDate",
  "probationStatus",
  "noticePeriod",
  "employeeStatus",
  "reportingManager",
  "functionalManager",
  "hrPartner",
];

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

function getDifferences(oldObj: any, newObj: any, prefix = ''): any[] {
  let diffs: any[] = [];
  if (!oldObj || !newObj) return diffs;
  for (let key in newObj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof newObj[key] === 'object' && newObj[key] !== null && !Array.isArray(newObj[key])) {
      diffs = diffs.concat(getDifferences(oldObj[key] || {}, newObj[key], fullKey));
    } else if (Array.isArray(newObj[key])) {
      if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
        diffs.push({ fieldName: fullKey, fieldLabel: FORM_LABELS[key] || fullKey, oldValue: 'List Changed', newValue: 'List Changed' });
      }
    } else {
      if (oldObj[key] !== newObj[key]) {
        diffs.push({ fieldName: fullKey, fieldLabel: FORM_LABELS[key] || fullKey, oldValue: oldObj[key], newValue: newObj[key] });
      }
    }
  }
  return diffs;
}

export function EmployeeProfilePage() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? "1";
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.employee.profile);
  const status = useSelector((state: RootState) => state.employee.status);
  const requests = useSelector((state: RootState) => state.requests.requests);

  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [banner, setBanner] = useState<BannerState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("profile");

  const uniqueSections = useMemo(() => {
    const combined = [...ESS_SECTIONS, ...EXTRA_SECTIONS];
    const seen = new Set();
    const result = combined.filter((section) => {
      if (seen.has(section.key)) return false;
      seen.add(section.key);
      return true;
    }).map(s => {
      if (s.key === "assets") {
        return { ...s, label: "Assets" };
      }
      return s;
    });

    result.push({ key: "requests", label: "My Requests", editable: false, optional: false });
    result.push({ key: "notifications", label: "Notifications Hub", editable: false, optional: false });
    return result;
  }, []);

  const pendingSections = useMemo(() => {
    return Array.from(new Set(requests.filter(r => r.status === 'pending').map(r => r.section)));
  }, [requests]);

  useEffect(() => {
    dispatch(fetchEmployeeData(employeeId));
    dispatch(fetchRequests(employeeId));
  }, [dispatch, employeeId]);

  const beginEdit = (section: SectionKey) => {
    if (!profile) return;
    setEditingSection(section);
    const base =
      section === "documentsRepository"
        ? (profile as any).employeeDocuments ?? {}
        : (profile as any)[section] ?? {};
    setDraft(JSON.parse(JSON.stringify(base)));
    setBanner(null);
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setDraft(null);
  };

  const submitChange = async (section: SectionKey) => {
    if (!profile) return;
    const current =
      section === "documentsRepository"
        ? (profile as any).employeeDocuments ?? {}
        : (profile as any)[section];

    if (isEqualPayload(current, draft)) {
      setBanner({
        type: "error",
        message: "No changes detected. Update at least one field before submitting.",
      });
      return;
    }

    // Existing validations
    if (section === "profile") {
      const next = draft as any;
      if (next.personalEmail && !validateEmail(next.personalEmail)) {
        setBanner({ type: "error", message: "Personal email format is invalid." });
        return;
      }
    }

    if (section === "personalDetails") {
      const next = draft as any;
      if (next.panNumber && !validatePan(next.panNumber)) {
        setBanner({
          type: "error",
          message: "PAN format is invalid. Expected format: ABCDE1234F.",
        });
        return;
      }
      if (next.aadhaarNumber && !validateAadhaar(next.aadhaarNumber)) {
        setBanner({ type: "error", message: "Aadhaar must be a 12-digit number." });
        return;
      }
    }

    if (section === "bankAndStatutoryDetails") {
      const next = draft as any;
      if (next.panNumber && !validatePan(next.panNumber)) {
        setBanner({ type: "error", message: "PAN format is invalid in statutory details." });
        return;
      }
      if (next.aadhaarNumber && !validateAadhaar(next.aadhaarNumber)) {
        setBanner({
          type: "error",
          message: "Aadhaar must be a 12-digit number in statutory details.",
        });
        return;
      }
      if (
        next.bankAccounts &&
        detectDuplicateValues(next.bankAccounts.map((e: any) => e.accountNumber))
      ) {
        setBanner({ type: "error", message: "Duplicate bank account numbers are not allowed." });
        return;
      }
      if (next.bankAccounts) {
        const primaryCount = next.bankAccounts.filter((e: any) => e.isPrimary).length;
        if (primaryCount > 1) {
          setBanner({ type: "error", message: "Only one bank account can be marked as primary." });
          return;
        }
      }
    }

    if (section === "nomineeDetails") {
      const next = draft as any[];
      if (Array.isArray(next)) {
        const total = next.reduce((s, e) => s + (Number(e.sharePercentage) || 0), 0);
        if (total > 100) {
          setBanner({ type: "error", message: "Nominee share percentage cannot exceed 100%." });
          return;
        }
      }
    }

    if (section === "documentsRepository") {
      const names = Object.values(draft as Record<string, EmployeeDocumentMeta>)
        .map((m) => m?.fileName)
        .filter(Boolean) as string[];
      const dup = names.find((n, i) => names.indexOf(n) !== i);
      if (dup) {
        setBanner({ type: "error", message: `Duplicate file name not allowed: ${dup}` });
        return;
      }
    }

    const DIRECT_SYNC_SECTIONS = new Set<SectionKey>([
      "profile",
      "personalDetails",
      "addresses",
      "languageDetails",
      "emergencyAndMedical",
      "nomineeDetails",
      "documentsRepository",
    ]);

    if (DIRECT_SYNC_SECTIONS.has(section)) {
      setSubmitting(true);
      try {
        const payloadKey = section === "documentsRepository" ? "employeeDocuments" : section;
        const nextProfile = {
          ...profile,
          [payloadKey]: draft,
        } as EmployeeProfile;
        await dispatch(saveEssProfileWithAdminSync({ employeeId, profile: nextProfile })).unwrap();
        dispatch(addNotification({ type: "success", message: "Saved and synced with HR records." }));
        setBanner({ type: "success", message: "Your updates were saved successfully." });
        cancelEdit();
      } catch {
        setBanner({ type: "error", message: "Could not save changes. Try again." });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      setSubmitting(true);
      const changes = getDifferences(current, draft);
      const sectionLabel = ESS_SECTIONS.find((s) => s.key === section)?.label || String(section);
      
      dispatch(createRequest({
        employeeId,
        section,
        sectionLabel,
        changes
      }));
      setBanner(null);
      cancelEdit();
    } catch (err) {
      setBanner({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to submit. Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || !profile) {
    return <div className="p-6 text-sm text-muted-foreground">Loading profile...</div>;
  }

  // Merge static ESS_SECTIONS with extra sections for sidebar + rendering
  const allSections = uniqueSections;

  const renderSectionBody = (sectionKey: string, sectionData: unknown, isReadOnly: boolean) => {
    // ---- Profile ----
    if (sectionKey === "profile") {
      return (
        <ProfileSection
          data={sectionData as Record<string, unknown>}
          readOnly={isReadOnly}
          onChange={setDraft}
        />
      );
    }

    // ---- Personal Details ----
    if (sectionKey === "personalDetails") {
      const data = sectionData as Record<string, unknown>;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PERSONAL_DETAIL_FIELDS.map((f) => (
            <Field
              key={f}
              fieldKey={f}
              value={data[f] ?? ""}
              readOnly={isReadOnly}
              onChange={(v) => setDraft({ ...data, [f]: v })}
            />
          ))}
        </div>
      );
    }

    // ---- Addresses ----
    if (sectionKey === "addresses") {
      return (
        <AddressesSection
          data={sectionData as Record<string, Record<string, unknown>>}
          readOnly={isReadOnly}
          onChange={setDraft}
        />
      );
    }

    // ---- Employment ----
    if (sectionKey === "employmentDetails") {
      const data = sectionData as Record<string, unknown>;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EMPLOYMENT_FIELDS.map((f) => (
            <Field
              key={f}
              fieldKey={f}
              value={data[f] ?? ""}
              readOnly={isReadOnly}
              onChange={(v) => setDraft({ ...data, [f]: v })}
            />
          ))}
        </div>
      );
    }

    // ---- Bank & Statutory ----
    if (sectionKey === "bankAndStatutoryDetails") {
      const data = sectionData as any;
      const statutoryFields = [
        "panNumber",
        "aadhaarNumber",
        "uanNumber",
        "esicNumber",
        "pfNumber",
        "professionalTaxNumber",
        "passportNumber",
        "taxRegime",
      ];
      return (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-3 space-y-3">
            <p className="text-sm font-semibold text-foreground">Bank Accounts</p>
            <DynamicListEditor
              rows={(data?.bankAccounts ?? []) as Record<string, unknown>[]}
              onChange={(rows) => setDraft({ ...data, bankAccounts: rows })}
              readOnly={isReadOnly}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {statutoryFields.map((f) => (
              <Field
                key={f}
                fieldKey={f}
                value={data[f] ?? ""}
                readOnly={isReadOnly}
                onChange={(v) => setDraft({ ...data, [f]: v })}
              />
            ))}
          </div>
        </div>
      );
    }

    // ---- Nominee Details ----
    if (sectionKey === "nomineeDetails") {
      return (
        <div className="space-y-3">
          <DynamicListEditor
            rows={sectionData as Record<string, unknown>[]}
            onChange={setDraft}
            readOnly={isReadOnly}
          />
          {!isReadOnly && (
            <div className="rounded-lg border border-border p-3 space-y-3">
              <p className="text-sm font-semibold text-foreground">Uploads</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FileUploadField label="Aadhaar Card" readOnly={isReadOnly} />
                <FileUploadField label="PAN Card" readOnly={isReadOnly} />
                <FileUploadField label="Identity Proof" readOnly={isReadOnly} />
                <FileUploadField label="Relationship Proof" readOnly={isReadOnly} />
                <FileUploadField label="Supporting Documents" readOnly={isReadOnly} />
              </div>
            </div>
          )}
        </div>
      );
    }

    // ---- Passport & Visa ----
    if (sectionKey === "passportAndVisa") {
      return (
        <PassportVisaSection
          data={sectionData as Record<string, unknown>}
          readOnly={isReadOnly}
          onChange={setDraft}
        />
      );
    }

    // ---- Previous Employment ----
    if (sectionKey === "previousEmployment") {
      return (
        <div className="space-y-3">
          <DynamicListEditor
            rows={sectionData as Record<string, unknown>[]}
            onChange={setDraft}
            readOnly={isReadOnly}
          />
          {!isReadOnly && (
            <div className="rounded-lg border border-border p-3 space-y-3">
              <p className="text-sm font-semibold text-foreground">Uploads</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FileUploadField label="Experience Letter" readOnly={isReadOnly} />
                <FileUploadField label="Relieving Letter" readOnly={isReadOnly} />
                <FileUploadField label="Offer Letter" readOnly={isReadOnly} />
                <FileUploadField label="Salary Slips" readOnly={isReadOnly} />
              </div>
            </div>
          )}
        </div>
      );
    }

    // ---- Education Details ----
    if (sectionKey === "educationDetails") {
      return (
        <div className="space-y-3">
          <DynamicListEditor
            rows={sectionData as Record<string, unknown>[]}
            onChange={setDraft}
            readOnly={isReadOnly}
          />
          {!isReadOnly && (
            <div className="rounded-lg border border-border p-3 space-y-3">
              <p className="text-sm font-semibold text-foreground">Uploads</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FileUploadField label="Degree Certificate" readOnly={isReadOnly} />
                <FileUploadField label="Marksheet" readOnly={isReadOnly} />
                <FileUploadField label="Leaving Certificate" readOnly={isReadOnly} />
              </div>
            </div>
          )}
        </div>
      );
    }

    // ---- Skills & Certifications ----
    if (sectionKey === "skillsAndCertifications") {
      const data = sectionData as {
        skills: Record<string, unknown>[];
        certifications: Record<string, unknown>[];
      };
      return (
        <SkillsCertificationsSection data={data} readOnly={isReadOnly} onChange={setDraft} />
      );
    }

    // ---- Assets & IT ----
    if (sectionKey === "assetsAndIT") {
      return (
        <DynamicListEditor
          rows={sectionData as Record<string, unknown>[]}
          onChange={setDraft}
          readOnly={isReadOnly}
        />
      );
    }

    // ---- Documents Repository ----
    if (sectionKey === "documentsRepository") {
      return (
        <DocumentsRepositorySection
          docs={(sectionData as Partial<Record<string, EmployeeDocumentMeta>>) || {}}
          readOnly={isReadOnly}
          onChange={(d) => setDraft(d)}
        />
      );
    }

    // ---- Family Details ----
    if (sectionKey === "familyDetails") {
      return (
        <DynamicListEditor
          rows={sectionData as Record<string, unknown>[]}
          onChange={setDraft}
          readOnly={isReadOnly}
        />
      );
    }

    // ---- Emergency & Medical ----
    if (sectionKey === "emergencyAndMedical") {
      const data = sectionData as Record<string, unknown>;
      const fields = [
        "emergencyContactName",
        "emergencyContactNumber",
        "relationship",
        "medicalConditions",
        "allergies",
        "bloodGroup",
        "doctorName",
        "insuranceProvider",
        "insurancePolicyNumber",
      ];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((f) => (
            <Field
              key={f}
              fieldKey={f}
              value={data[f] ?? ""}
              readOnly={isReadOnly}
              onChange={(v) => setDraft({ ...data, [f]: v })}
            />
          ))}
        </div>
      );
    }

    // ---- Insurance Details ----
    if (sectionKey === "insuranceDetails") {
      const data = sectionData as Record<string, unknown>;
      const fields = [
        "policyNumber",
        "provider",
        "policyType",
        "coverageAmount",
        "startDate",
        "endDate",
        "nomineeName",
      ];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((f) => (
            <Field
              key={f}
              fieldKey={f}
              value={data[f] ?? ""}
              readOnly={isReadOnly}
              onChange={(v) => setDraft({ ...data, [f]: v })}
            />
          ))}
        </div>
      );
    }

    // ---- Language Details ----
    if (sectionKey === "languageDetails") {
      return (
        <DynamicListEditor
          rows={sectionData as Record<string, unknown>[]}
          onChange={setDraft}
          readOnly={isReadOnly}
        />
      );
    }

    // ---- Social & Professional Profiles ----
    if (sectionKey === "socialProfiles") {
      const data = sectionData as Record<string, unknown>;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {["linkedin", "github", "portfolioWebsite", "personalWebsite"].map((f) => (
            <Field
              key={f}
              fieldKey={f}
              value={data[f] ?? ""}
              readOnly={isReadOnly}
              onChange={(v) => setDraft({ ...data, [f]: v })}
            />
          ))}
        </div>
      );
    }

    // ---- Generic fallback (array) ----
    if (Array.isArray(sectionData)) {
      return (
        <DynamicListEditor
          rows={sectionData as Record<string, unknown>[]}
          onChange={setDraft}
          readOnly={isReadOnly}
        />
      );
    }

    // ---- Generic fallback (flat object) ----
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(sectionData as Record<string, unknown>).map(([f, v]) => (
          <Field
            key={f}
            fieldKey={f}
            value={v}
            readOnly={isReadOnly}
            onChange={(nv) =>
              setDraft({ ...(sectionData as Record<string, unknown>), [f]: nv })
            }
          />
        ))}
      </div>
    );
  };

  const selectedSection = allSections.find(s => s.key === activeSection) || allSections[0];
  const isPending = pendingSections.includes(selectedSection.key as SectionKey);
  const isEditing = editingSection === selectedSection.key;
  const rawData =
    selectedSection.key === "documentsRepository"
      ? (profile as any).employeeDocuments ?? {}
      : (profile as any)[selectedSection.key];
  const sectionData = isEditing ? draft : rawData;
  const isReadOnly = !isEditing || !selectedSection.editable;

  // Skip rendering sections with no data and optional flag (clean UX)
  const isEmpty =
    sectionData === undefined ||
    sectionData === null ||
    (Array.isArray(sectionData) && sectionData.length === 0) ||
    (typeof sectionData === "object" &&
      !Array.isArray(sectionData) &&
      Object.keys(sectionData as object).length === 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-28 relative">
      {/* Hero Profile Header Card */}
      <EssProfileHeaderCard employeeId={employeeId} profile={profile} />

      {/* Main container */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Mobile Dropdown */}
        <div className="lg:hidden w-full">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Select Section</label>
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground shadow-sm focus:outline-none"
          >
            {allSections.map((section) => (
              <option key={section.key} value={section.key}>
                {section.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sidebar Navigation */}
        <aside className="w-64 min-w-[256px] hidden lg:block bg-card border border-border rounded-xl p-3 space-y-1 sticky top-6 shadow-sm">
          <p className="px-3 pb-3 pt-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border mb-2">
            Profile Sections
          </p>
          <nav className="space-y-0.5">
            {allSections.map((section) => {
              const isActive = activeSection === section.key;
              const isSectionPending = pendingSections.includes(section.key as SectionKey);
              return (
                <button
                  key={section.key}
                  onClick={() => {
                    cancelEdit();
                    setActiveSection(section.key);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all relative
                    ${
                      isActive
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground rounded-r-full" />
                  )}
                  <span className="truncate">{section.label}</span>
                  <div className="flex items-center gap-1">
                    {section.optional && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
                        Opt
                      </span>
                    )}
                    {isSectionPending && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 font-bold">
                        Pending
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 w-full space-y-6">
          {banner && (
            <div
              className={`rounded-xl px-4 py-3 text-sm border shadow-sm ${
                banner.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium"
                  : "bg-destructive/10 text-destructive border-destructive/20 font-medium"
              }`}
            >
              {banner.message}
            </div>
          )}

          {/* Render selected section inside a clean panel */}
          {selectedSection.key === "requests" ? (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-foreground">My Requests</h2>
              <p className="text-xs text-muted-foreground">Track all profile modification requests and their approvals status.</p>
              <MyRequestsTable />
            </div>
          ) : selectedSection.key === "notifications" ? (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-foreground">Notifications Hub</h2>
              <p className="text-xs text-muted-foreground">Your recent HR system notifications and alerts.</p>
              <EmployeeNotificationPanel />
            </div>
          ) : (
            <section className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{selectedSection.label}</h2>
                    {selectedSection.optional && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground font-semibold">
                        Optional
                      </span>
                    )}
                  </div>
                  {isPending && (
                    <p className="text-xs text-amber-600 font-medium mt-1">Pending Approval</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedSection.editable && !isEditing && (
                    <button
                      onClick={() => beginEdit(selectedSection.key as SectionKey)}
                      disabled={isPending}
                      className="h-9 px-4 rounded-lg bg-secondary text-foreground border border-border text-xs font-bold hover:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit Section
                    </button>
                  )}
                </div>
              </div>

              {isEmpty && !isEditing ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    No data added yet.
                  </p>
                  {selectedSection.editable && (
                    <button
                      onClick={() => beginEdit(selectedSection.key as SectionKey)}
                      className="h-9 px-4 rounded-lg bg-foreground text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      Add data now
                    </button>
                  )}
                </div>
              ) : (
                renderSectionBody(selectedSection.key, sectionData, isReadOnly)
              )}
            </section>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-card/85 backdrop-blur-xl border-t border-border flex items-center justify-between px-8 z-40 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-foreground animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
            <span className="text-xs font-bold text-foreground">
              Editing {selectedSection.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={cancelEdit}
              className="h-10 px-5 rounded-xl border border-border text-xs font-bold hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => submitChange(selectedSection.key as SectionKey)}
              disabled={submitting}
              className="h-10 px-5 bg-foreground text-primary-foreground rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
