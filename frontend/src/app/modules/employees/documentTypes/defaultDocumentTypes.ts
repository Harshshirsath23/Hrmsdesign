import { EMPLOYEE_DOCUMENT_KEYS } from "../../../components/employees/mockData";
import type { DocumentTypeConfig } from "./types";

const LABELS: Record<string, string> = {
  panCard: "PAN Card",
  aadhaarCard: "Aadhaar Card",
  resume: "Resume",
  offerLetter: "Offer Letter",
  joiningDocuments: "Joining Documents",
  educationalCertificates: "Educational Certificates",
  salarySlips: "Salary Slips",
  experienceLetters: "Experience Letters",
  passport: "Passport",
  visa: "Visa",
  taxDocuments: "Tax Documents",
  insuranceDocuments: "Insurance Documents",
  relievingLetter: "Relieving Letter",
  appraisalLetters: "Appraisal Letters",
  incrementLetters: "Increment Letters",
};

const CATEGORIES: Record<string, string> = {
  panCard: "KYC",
  aadhaarCard: "KYC",
  resume: "Onboarding",
  offerLetter: "Onboarding",
  joiningDocuments: "Onboarding",
  educationalCertificates: "Education",
  salarySlips: "Payroll",
  experienceLetters: "Employment",
  passport: "Travel",
  visa: "Travel",
  taxDocuments: "Tax",
  insuranceDocuments: "Insurance",
  relievingLetter: "Employment",
  appraisalLetters: "HR",
  incrementLetters: "HR",
};

const FRONT_BACK = new Set(["panCard", "aadhaarCard", "passport", "visa", "insuranceDocuments"]);
const MULTIPLE = new Set(["joiningDocuments", "educationalCertificates", "salarySlips", "experienceLetters"]);

export function buildDefaultDocumentTypes(): DocumentTypeConfig[] {
  return EMPLOYEE_DOCUMENT_KEYS.map((id, index) => ({
    id,
    documentName: LABELS[id] || id,
    category: CATEGORIES[id] || "General",
    uploadType: FRONT_BACK.has(id) ? "frontBack" : MULTIPLE.has(id) ? "multiple" : "single",
    allowedFileTypes: ["pdf", "jpg", "png", "doc", "docx"],
    mandatory: ["panCard", "aadhaarCard", "resume"].includes(id),
    allowEmployeeEdit: !["offerLetter", "relievingLetter"].includes(id),
    displayOrder: index + 1,
    status: "Active" as const,
    isSystem: true,
  }));
}
