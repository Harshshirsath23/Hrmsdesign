import type { MasterCategoryConfig, MasterConfig, MasterFieldConfig } from "./types";

const BASE_FIELDS: MasterFieldConfig[] = [
  { key: "code", label: "Code", type: "text", required: true, placeholder: "Enter code" },
  { key: "label", label: "Label / Name", type: "text", required: true, placeholder: "Enter label" },
  { key: "is_active", label: "Active", type: "boolean" },
];

const COMPANY_FIELDS: MasterFieldConfig[] = [
  ...BASE_FIELDS,
  { key: "company", label: "Company", type: "select", relationMaster: "Company", required: true },
];

function toKebabCase(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/\s+/g, "-").toLowerCase();
}

function makeMaster(
  category: string,
  apiName: string,
  opts?: Partial<Omit<MasterConfig, "key" | "apiName" | "label" | "category">>,
): MasterConfig {
  return {
    key: toKebabCase(apiName),
    apiName,
    label: apiName,
    category,
    formFields: BASE_FIELDS,
    ...opts,
  };
}

function makeCategory(categoryKey: string, label: string, names: string[], overrides?: Record<string, Partial<MasterConfig>>): MasterCategoryConfig {
  return {
    key: categoryKey,
    label,
    masters: names.map((name) => makeMaster(categoryKey, name, overrides?.[name])),
  };
}

const COMPANY_EXTRA_FIELDS: MasterFieldConfig[] = [
  ...BASE_FIELDS,
  { key: "pan", label: "PAN", type: "text", placeholder: "ABCDE1234F" },
  { key: "gstin", label: "GSTIN", type: "text" },
  { key: "cin", label: "CIN", type: "text" },
  { key: "registered_address", label: "Registered Address", type: "textarea" },
];

const BRANCH_FIELDS: MasterFieldConfig[] = [
  ...COMPANY_FIELDS,
  {
    key: "branch_type",
    label: "Branch Type",
    type: "select",
    required: true,
    options: [
      { value: "HEAD_OFFICE", label: "Head Office" },
      { value: "BRANCH", label: "Branch" },
      { value: "REGIONAL", label: "Regional" },
      { value: "ZONAL", label: "Zonal" },
      { value: "DEPOT", label: "Depot" },
    ],
  },
  { key: "gstin", label: "GSTIN", type: "text" },
  { key: "pt_registration", label: "PT Registration", type: "text" },
  { key: "is_payroll_entity", label: "Payroll Entity", type: "boolean" },
];

export const MASTER_CATEGORIES: MasterCategoryConfig[] = [
  makeCategory(
    "personal",
    "Personal Masters",
    ["Gender", "Salutation", "MaritalStatus", "Religion", "Caste", "CasteCategory", "MotherTongue", "Nationality", "BloodGroup"],
    {
      Gender: { constant: true },
      MaritalStatus: { constant: true },
      BloodGroup: { constant: true },
    },
  ),
  makeCategory(
    "education",
    "Education Masters",
    ["EducationLevel", "EducationStatus", "Qualification", "Board", "Specialization", "EducationSpecialization", "StudyMode"],
  ),
  makeCategory(
    "employment",
    "Employment Masters",
    [
      "EmployeeType",
      "EmployeeCategory",
      "EmployeeStatus",
      "SourceOfHire",
      "SourceOfHireType",
      "PayrollStatus",
      "PayrollMode",
      "PayrollGroup",
      "TransportType",
      "WorkExperienceRange",
      "RelevantExperienceRange",
    ],
  ),
  makeCategory(
    "location",
    "Location Masters",
    ["Country", "State", "City", "LocationType", "HeadquarterLocation", "OfficeLocation", "ProductionCell", "Floor"],
    {
      State: {
        parentFieldKey: "country",
        formFields: [...BASE_FIELDS, { key: "country", label: "Country", type: "select", relationMaster: "Country", required: true }],
      },
      City: {
        parentFieldKey: "state",
        formFields: [...BASE_FIELDS, { key: "state", label: "State", type: "select", relationMaster: "State", required: true }],
      },
    },
  ),
  makeCategory(
    "organization",
    "Organization Masters",
    [
      "Company",
      "Department",
      "Designation",
      "Grade",
      "Bank",
      "BankStatus",
      "AccountType",
      "DepartmentDivision",
      "Extension",
      "Batch",
      "Cab",
    ],
    {
      Company: { formFields: COMPANY_EXTRA_FIELDS, listColumns: ["code", "label", "pan", "gstin"] },
      Department: {
        companyScoped: true,
        parentFieldKey: "parent_department",
        formFields: [
          ...COMPANY_FIELDS,
          { key: "parent_department", label: "Parent Department", type: "select", relationMaster: "Department" },
        ],
      },
      Designation: { companyScoped: true, formFields: COMPANY_FIELDS },
      Grade: { companyScoped: true, formFields: COMPANY_FIELDS },
      DepartmentDivision: { companyScoped: true, formFields: COMPANY_FIELDS },
      Extension: { companyScoped: true, formFields: COMPANY_FIELDS },
      Batch: { companyScoped: true, formFields: COMPANY_FIELDS },
      Cab: { companyScoped: true, formFields: COMPANY_FIELDS },
    },
  ),
  makeCategory(
    "insurance",
    "Insurance Masters",
    ["PolicyType", "InsuranceType", "CoverType", "PremiumFrequency", "InsuranceCompany"],
  ),
  makeCategory(
    "misc",
    "Misc Masters",
    [
      "Language",
      "LanguageProficiency",
      "ProficiencyLevel",
      "NomineePurpose",
      "Relation",
      "Occupation",
      "Profession",
      "CommunicationChannel",
      "CommunicationTask",
      "DocumentType",
      "DocumentSide",
      "SystemRole",
      "DefaultRole",
    ],
  ),
  makeCategory(
    "core-hr-setup",
    "Core HR Setup Masters",
    ["Branch", "BusinessUnit", "CostCenter", "ProfitCenter", "Band", "ShiftType", "Shift", "WorkWeekPolicy", "HolidayCalendar", "Holiday", "HolidayGroup"],
    {
      Branch: { companyScoped: true, formFields: BRANCH_FIELDS },
      BusinessUnit: { companyScoped: true, formFields: COMPANY_FIELDS },
      CostCenter: { companyScoped: true, formFields: COMPANY_FIELDS },
      ProfitCenter: { companyScoped: true, formFields: COMPANY_FIELDS },
      Shift: { companyScoped: true, formFields: COMPANY_FIELDS },
      WorkWeekPolicy: { companyScoped: true, formFields: COMPANY_FIELDS },
      HolidayCalendar: { companyScoped: true, formFields: COMPANY_FIELDS },
      Holiday: { companyScoped: true, formFields: COMPANY_FIELDS },
      HolidayGroup: { companyScoped: true, formFields: COMPANY_FIELDS },
    },
  ),
  makeCategory(
    "attendance-leave",
    "Attendance & Leave Masters",
    ["AttendancePolicy", "RegularizationReason", "OvertimePolicy", "CompOffPolicy", "LeaveType", "LeavePolicy", "LeaveApprovalMatrix"],
  ),
  makeCategory(
    "payroll-compliance",
    "Payroll & Compliance Masters",
    [
      "PayComponentGroup",
      "PayComponent",
      "SalaryStructure",
      "SalaryStructureComponent",
      "ReimbursementType",
      "LoanType",
      "PayrollCycle",
      "TaxRegime",
      "TdsSection",
      "ArrearType",
      "StatutoryComponent",
      "PfScheme",
      "EsiScheme",
      "PtStateSlab",
      "LwfSlab",
      "LabourRegisterType",
    ],
    {
      PayComponentGroup: {
        formFields: [...BASE_FIELDS, { key: "is_earning", label: "Is Earning", type: "boolean" }],
      },
      PayComponent: {
        formFields: [...BASE_FIELDS, { key: "pay_component_group", label: "Component Group", type: "select", relationMaster: "PayComponentGroup" }],
      },
      SalaryStructureComponent: {
        formFields: [...BASE_FIELDS, { key: "salary_structure", label: "Salary Structure", type: "select", relationMaster: "SalaryStructure" }],
      },
    },
  ),
  makeCategory(
    "recruitment",
    "Recruitment Masters",
    ["JobFunction", "JobLevel", "InterviewRound", "CandidateSource", "OfferStatus", "RejectionReason", "PipelineStage"],
  ),
  makeCategory(
    "performance-training-asset",
    "Performance, Training & Asset Masters",
    [
      "AppraisalCycle",
      "RatingScale",
      "GoalCategory",
      "KpiLibrary",
      "KraLibrary",
      "CompetencyGroup",
      "Competency",
      "TrainingCategory",
      "TrainingMode",
      "Course",
      "CertificationBody",
      "AssetCategory",
      "AssetCondition",
      "AssetType",
      "Vendor",
    ],
  ),
  makeCategory(
    "workflow-security-notification",
    "Workflow, Security & Notification Masters",
    [
      "WorkflowType",
      "ApprovalAction",
      "EscalationType",
      "AuditEventType",
      "Permission",
      "MenuItem",
      "DataScopeType",
      "PasswordPolicy",
      "SessionPolicy",
      "NotificationChannel",
      "NotificationTemplate",
      "NotificationTrigger",
    ],
  ),
  makeCategory(
    "audit-addition",
    "Audit Addition Masters",
    [
      "SeparationMode",
      "ContractStatus",
      "VerificationStatus",
      "ResidentialStatus",
      "PaymentType",
      "AttendanceScheme",
      "AttendanceStatus",
      "EmployeeFilter",
      "BulletinCategory",
      "PolicyCategory",
      "FormCategory",
      "ImportType",
      "LetterApprovalType",
      "ClearanceItemType",
      "PositionChangeReason",
      "CounterParty",
      "AuthorizedSignatory",
    ],
  ),
];

export const MASTER_CONFIG_MAP = new Map<string, MasterConfig>(
  MASTER_CATEGORIES.flatMap((cat) => cat.masters.map((m) => [m.key, m] as const)),
);

export function getCategory(categoryKey: string) {
  return MASTER_CATEGORIES.find((c) => c.key === categoryKey);
}

export function getMasterConfig(categoryKey: string, masterKey: string): MasterConfig | undefined {
  const category = getCategory(categoryKey);
  return category?.masters.find((m) => m.key === masterKey);
}

