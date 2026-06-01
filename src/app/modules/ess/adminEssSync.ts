import type { Employee, NomineeEntry as AdminNominee } from "../../components/employees/mockData";
import type { EmployeeProfile, LanguageDetail as EssLanguage, NomineeDetail } from "./types";

const splitName = (full: string) => {
  const p = full.trim().split(/\s+/);
  return {
    firstName: p[0] || "",
    middleName: p.length > 2 ? p.slice(1, -1).join(" ") : "",
    lastName: p.length > 1 ? p[p.length - 1] : "",
  };
};

/** Merge canonical admin employee row into ESS profile for shared employee-owned fields. */
export function mergeAdminEmployeeIntoEssProfile(admin: Employee, profile: EmployeeProfile): EmployeeProfile {
  const nameParts = admin.firstName
    ? { firstName: admin.firstName, middleName: admin.middleName || "", lastName: admin.lastName || "" }
    : splitName(admin.name);

  const languages: EssLanguage[] = (admin.languages || []).map((l, i) => ({
    id: `lng-sync-${admin.id}-${i}`,
    language: l.language,
    proficiencyLevel: (l.proficiency as EssLanguage["proficiencyLevel"]) || "Intermediate",
    canRead: l.canRead,
    canWrite: l.canWrite,
    canSpeak: l.canSpeak,
  }));

  const nomineeDetails: NomineeDetail[] = (admin.nominees || []).map((n: AdminNominee, i) => ({
    id: n.id || `nom-sync-${i}`,
    name: n.nomineeName,
    relation: n.relationship,
    sharePercentage: n.sharePercentage,
    phone: n.contactNumber,
    dateOfBirth: n.dateOfBirth,
    address: n.address,
    idProofFileName: n.idProofFileName,
  }));

  return {
    ...profile,
    profile: {
      ...profile.profile,
      ...nameParts,
      personalMobile: admin.phone || profile.profile.personalMobile,
      personalEmail: admin.email || profile.profile.personalEmail,
      workMobile: profile.profile.workMobile,
      alternateMobileNumber: admin.alternateMobile ?? (profile.profile as any).alternateMobileNumber ?? "",
      officialEmail: (profile.profile as any).officialEmail || admin.email || profile.profile.personalEmail,
      emergencyContactName: admin.emergencyContact?.name ?? profile.profile.emergencyContactName,
      emergencyContactNumber: admin.emergencyContact?.phone ?? profile.profile.emergencyContactNumber,
    },
    personalDetails: {
      ...profile.personalDetails,
      dateOfBirth: admin.dateOfBirth || profile.personalDetails.dateOfBirth,
      actualDateOfBirth: admin.actualDob || profile.personalDetails.actualDateOfBirth,
      gender: admin.gender || profile.personalDetails.gender,
      bloodGroup: admin.bloodGroup || profile.personalDetails.bloodGroup,
      maritalStatus: admin.maritalStatus || profile.personalDetails.maritalStatus,
      spouseName: admin.spouseName || profile.personalDetails.spouseName,
      fatherName: admin.fathersName || profile.personalDetails.fatherName,
      placeOfBirth: admin.placeOfBirth || profile.personalDetails.placeOfBirth,
      nationality: admin.nationality || profile.personalDetails.nationality,
      religion: admin.religion || profile.personalDetails.religion,
      residentialStatus: admin.residentialStatus || profile.personalDetails.residentialStatus,
      identificationMark: admin.identificationMark || profile.personalDetails.identificationMark,
      panNumber: admin.panNumber || profile.personalDetails.panNumber,
      aadhaarNumber: admin.aadhaarNumber || profile.personalDetails.aadhaarNumber,
      passportNumber: admin.passportNumber || profile.personalDetails.passportNumber,
      uanNumber: admin.uanNumber || profile.personalDetails.uanNumber,
      physicallyChallenged: admin.isPhysicallyChallenged ?? profile.personalDetails.physicallyChallenged,
      internationalEmployee: admin.isInternationalEmployee ?? profile.personalDetails.internationalEmployee,
    },
    addresses: {
      current: {
        addressLine1: admin.currentAddress?.addressLine1 ?? profile.addresses.current.addressLine1,
        addressLine2: admin.currentAddress?.addressLine2 ?? profile.addresses.current.addressLine2,
        landmark: admin.currentAddress?.landmark ?? profile.addresses.current.landmark,
        city: admin.currentAddress?.city ?? profile.addresses.current.city,
        state: admin.currentAddress?.state ?? profile.addresses.current.state,
        country: admin.currentAddress?.country ?? profile.addresses.current.country,
        pincode: admin.currentAddress?.pincode ?? profile.addresses.current.pincode,
      },
      permanent: {
        addressLine1: admin.permanentAddress?.addressLine1 ?? profile.addresses.permanent.addressLine1,
        addressLine2: admin.permanentAddress?.addressLine2 ?? profile.addresses.permanent.addressLine2,
        landmark: admin.permanentAddress?.landmark ?? profile.addresses.permanent.landmark,
        city: admin.permanentAddress?.city ?? profile.addresses.permanent.city,
        state: admin.permanentAddress?.state ?? profile.addresses.permanent.state,
        country: admin.permanentAddress?.country ?? profile.addresses.permanent.country,
        pincode: admin.permanentAddress?.pincode ?? profile.addresses.permanent.pincode,
      },
      temporary: profile.addresses.temporary,
    },
    languageDetails: languages.length ? languages : profile.languageDetails,
    nomineeDetails: nomineeDetails.length ? nomineeDetails : profile.nomineeDetails,
    employmentDetails: {
      ...profile.employmentDetails,
      department: admin.department || profile.employmentDetails.department,
      designation: admin.designation || profile.employmentDetails.designation,
      workLocation: admin.location || profile.employmentDetails.workLocation,
      employeeStatus: admin.status || profile.employmentDetails.employeeStatus,
      reportingManager: admin.reportingTo || profile.employmentDetails.reportingManager,
      employmentType: admin.employeeType || profile.employmentDetails.employmentType,
      employeeCategory: admin.employeeCategory || profile.employmentDetails.employeeCategory,
      shift: admin.shift || profile.employmentDetails.shift,
      noticePeriod: admin.noticePeriodDays || admin.noticePeriod || profile.employmentDetails.noticePeriod,
      functionalManager: admin.functionalManager || profile.employmentDetails.functionalManager,
      hrPartner: admin.hrPartner || profile.employmentDetails.hrPartner,
    },
    employeeDocuments: {
      ...(profile as any).employeeDocuments,
      ...(admin.employeeDocuments || {}),
    },
    emergencyAndMedical: {
      emergencyContactName: admin.emergencyContact?.name || profile.emergencyAndMedical?.emergencyContactName || "",
      emergencyContactNumber: admin.emergencyContact?.phone || profile.emergencyAndMedical?.emergencyContactNumber || "",
      relationship:
        admin.emergencyContact?.relationship ||
        admin.medicalInfo?.relationship ||
        profile.emergencyAndMedical?.relationship ||
        "",
      medicalConditions: admin.medicalInfo?.conditions || profile.emergencyAndMedical?.medicalConditions || "",
      allergies: admin.medicalInfo?.allergies || profile.emergencyAndMedical?.allergies || "",
      bloodGroup: admin.medicalInfo?.bloodGroup || profile.emergencyAndMedical?.bloodGroup || "",
      doctorName: admin.medicalInfo?.doctorName || profile.emergencyAndMedical?.doctorName || "",
      insuranceProvider: admin.medicalInfo?.insuranceProvider || profile.emergencyAndMedical?.insuranceProvider || "",
      insurancePolicyNumber:
        admin.medicalInfo?.insurancePolicyNumber || profile.emergencyAndMedical?.insurancePolicyNumber || "",
    },
    profilePhotoDataUrl: admin.avatar || profile.profilePhotoDataUrl,
  };
}

/** Apply employee-owned ESS sections back onto admin Employee (partial update). */
export function mergeEssEmployeeOwnedIntoAdmin(admin: Employee, profile: EmployeeProfile): Employee {
  const nm = profile.profile;
  const fullName = [nm.firstName, nm.middleName, nm.lastName].filter(Boolean).join(" ").trim() || admin.name;

  const nominees: AdminNominee[] = (profile.nomineeDetails || []).map((n) => ({
    id: n.id,
    nomineeName: n.name,
    relationship: n.relation,
    dateOfBirth: n.dateOfBirth || "",
    contactNumber: n.phone,
    address: n.address || "",
    sharePercentage: n.sharePercentage,
    idProofFileName: n.idProofFileName,
  }));

  const languages = (profile.languageDetails || []).map((l) => ({
    language: l.language,
    proficiency: l.proficiencyLevel,
    canRead: l.canRead,
    canWrite: l.canWrite,
    canSpeak: l.canSpeak,
  }));

  const em = profile.emergencyAndMedical;

  return {
    ...admin,
    name: fullName,
    firstName: nm.firstName,
    middleName: nm.middleName,
    lastName: nm.lastName,
    email: nm.officialEmail || nm.personalEmail || admin.email,
    phone: nm.personalMobile || admin.phone,
    alternateMobile: nm.alternateMobileNumber || admin.alternateMobile,
    dateOfBirth: profile.personalDetails.dateOfBirth,
    actualDob: profile.personalDetails.actualDateOfBirth,
    gender: profile.personalDetails.gender,
    bloodGroup: profile.personalDetails.bloodGroup,
    maritalStatus: profile.personalDetails.maritalStatus,
    spouseName: profile.personalDetails.spouseName,
    fathersName: profile.personalDetails.fatherName,
    placeOfBirth: profile.personalDetails.placeOfBirth,
    nationality: profile.personalDetails.nationality,
    religion: profile.personalDetails.religion,
    residentialStatus: profile.personalDetails.residentialStatus,
    identificationMark: profile.personalDetails.identificationMark,
    panNumber: profile.personalDetails.panNumber,
    aadhaarNumber: profile.personalDetails.aadhaarNumber,
    passportNumber: profile.personalDetails.passportNumber,
    uanNumber: profile.personalDetails.uanNumber,
    isPhysicallyChallenged: profile.personalDetails.physicallyChallenged,
    isInternationalEmployee: profile.personalDetails.internationalEmployee,
    currentAddress: {
      addressLine1: profile.addresses.current.addressLine1,
      addressLine2: profile.addresses.current.addressLine2,
      landmark: profile.addresses.current.landmark,
      city: profile.addresses.current.city,
      state: profile.addresses.current.state,
      country: profile.addresses.current.country,
      pincode: profile.addresses.current.pincode,
      startDate: admin.currentAddress?.startDate || "",
      toDate: admin.currentAddress?.toDate || "",
      isSameAsPermanent: admin.currentAddress?.isSameAsPermanent ?? false,
    },
    permanentAddress: {
      addressLine1: profile.addresses.permanent.addressLine1,
      addressLine2: profile.addresses.permanent.addressLine2,
      landmark: profile.addresses.permanent.landmark,
      city: profile.addresses.permanent.city,
      state: profile.addresses.permanent.state,
      country: profile.addresses.permanent.country,
      pincode: profile.addresses.permanent.pincode,
      startDate: admin.permanentAddress?.startDate || "",
      toDate: admin.permanentAddress?.toDate || "",
    },
    languages,
    nominees,
    emergencyContact: {
      name: em?.emergencyContactName || "",
      relationship: em?.relationship || "",
      phone: em?.emergencyContactNumber || "",
    },
    medicalInfo: {
      relationship: em?.relationship,
      conditions: em?.medicalConditions,
      allergies: em?.allergies,
      bloodGroup: em?.bloodGroup,
      doctorName: em?.doctorName,
      insuranceProvider: em?.insuranceProvider,
      insurancePolicyNumber: em?.insurancePolicyNumber,
    },
    designation: profile.employmentDetails.designation || admin.designation,
    department: profile.employmentDetails.department || admin.department,
    location: profile.employmentDetails.workLocation || admin.location,
    status: (profile.employmentDetails.employeeStatus as typeof admin.status) || admin.status,
    reportingTo: profile.employmentDetails.reportingManager || admin.reportingTo,
    employeeDocuments: {
      ...(admin.employeeDocuments || {}),
      ...((profile as any).employeeDocuments || {}),
    },
    avatar: (() => {
      const photo = profile.profilePhotoDataUrl;
      if (photo === "") return "";
      if (photo && (photo.startsWith("http") || photo.startsWith("data:"))) return photo;
      return admin.avatar;
    })(),
  };
}

export function writeEssProfileToStorage(employeeId: string, profile: EmployeeProfile) {
  const raw = localStorage.getItem("hrms_ess_profiles") || "{}";
  const profiles = JSON.parse(raw) as Record<string, EmployeeProfile>;
  profiles[employeeId] = profile;
  localStorage.setItem("hrms_ess_profiles", JSON.stringify(profiles));
}
