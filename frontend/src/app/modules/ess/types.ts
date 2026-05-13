export type RequestStatus = "pending" | "approved" | "rejected";

export type AddressType = "current" | "permanent" | "temporary";

export interface Address {
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  occupation: string;
  isDependent: boolean;
  emergencyContact: boolean;
}

export interface EducationDetail {
  id: string;
  qualification: string;
  specialization: string;
  institutionName: string;
  university: string;
  yearOfPassing: string;
  percentageCgpa: string;
  grade: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  branchName: string;
  accountType: string;
  isPrimary: boolean;
}

export interface NomineeDetail {
  id: string;
  name: string;
  relation: string;
  sharePercentage: string;
  phone: string;
}

export interface InsuranceDetail {
  policyNumber: string;
  provider: string;
  startDate: string;
  endDate: string;
  coverageAmount: string;
  nomineeName: string;
}

export interface LanguageDetail {
  id: string;
  language: string;
  proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Native";
  canRead: boolean;
  canWrite: boolean;
  canSpeak: boolean;
}

export interface AssetDetail {
  id: string;
  assetName: string;
  assetCode: string;
  assetType: string;
  assignedDate: string;
  returnDate: string;
  condition: string;
  remarks: string;
}

export interface EmployeeProfile {
  employeeId: string;
  profile: {
    firstName: string;
    middleName: string;
    lastName: string;
    personalMobile: string;
    personalEmail: string;
    workMobile: string;
    emergencyContactName: string;
    emergencyContactNumber: string;
  };
  personalDetails: {
    dateOfBirth: string;
    actualDateOfBirth: string;
    gender: string;
    bloodGroup: string;
    maritalStatus: string;
    spouseName: string;
    fatherName: string;
    placeOfBirth: string;
    nationality: string;
    religion: string;
    residentialStatus: string;
    identificationMark: string;
    panNumber: string;
    aadhaarNumber: string;
    passportNumber: string;
    uanNumber: string;
    physicallyChallenged: boolean;
    internationalEmployee: boolean;
  };
  employmentDetails: {
    department: string;
    designation: string;
    employmentType: string;
    workLocation: string;
    employeeCategory: string;
    shift: string;
    noticePeriod: string;
    reportingManager: string;
    functionalManager: string;
    hrPartner: string;
  };
  addresses: Record<AddressType, Address>;
  familyDetails: FamilyMember[];
  educationDetails: EducationDetail[];
  bankAndStatutoryDetails: {
    bankAccounts: BankAccount[];
    panNumber: string;
    aadhaarNumber: string;
    uanNumber: string;
    passportNumber: string;
  };
  nomineeDetails: NomineeDetail[];
  insuranceDetails: InsuranceDetail;
  languageDetails: LanguageDetail[];
  assets: AssetDetail[];
}

export type SectionKey =
  | "profile"
  | "personalDetails"
  | "employmentDetails"
  | "addresses"
  | "familyDetails"
  | "educationDetails"
  | "bankAndStatutoryDetails"
  | "nomineeDetails"
  | "insuranceDetails"
  | "languageDetails"
  | "assets";

export interface ProfileChangeRequest {
  id: string;
  employee_id: string;
  section: SectionKey;
  section_label: string;
  changes: {
    oldValue: unknown;
    newValue: unknown;
  };
  status: RequestStatus;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_comment?: string;
}
