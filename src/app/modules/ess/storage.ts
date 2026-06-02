import { ESS_SECTIONS, getSeedProfile } from "./data";
import { EmployeeProfile, ProfileChangeRequest, RequestStatus, SectionKey } from "./types";
import { mergeEssEmployeeOwnedIntoAdmin } from "./adminEssSync";
import type { Employee } from "../../components/employees/mockData";

const PROFILES_KEY = "hrms_ess_profiles";
const REQUESTS_KEY = "hrms_profile_change_requests";

type ProfilesStore = Record<string, EmployeeProfile>;

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const readProfiles = (): ProfilesStore => {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? (JSON.parse(raw) as ProfilesStore) : {};
  } catch {
    return {};
  }
};

const writeProfiles = (profiles: ProfilesStore) => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

const readRequests = (): ProfileChangeRequest[] => {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? (JSON.parse(raw) as ProfileChangeRequest[]) : [];
  } catch {
    return [];
  }
};

const writeRequests = (requests: ProfileChangeRequest[]) => {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

export const ensureProfile = (employeeId: string): EmployeeProfile => {
  const profiles = readProfiles();
  if (!profiles[employeeId]) {
    profiles[employeeId] = getSeedProfile(employeeId);
    writeProfiles(profiles);
  }
  return deepClone(profiles[employeeId]);
};

export const getProfile = (employeeId: string): EmployeeProfile => ensureProfile(employeeId);

export const getChangeRequests = (employeeId?: string): ProfileChangeRequest[] => {
  const requests = readRequests().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  if (!employeeId) return requests;
  return requests.filter((request) => request.employee_id === employeeId);
};

export const getPendingSections = (employeeId: string): SectionKey[] => {
  const pending = new Set<SectionKey>();
  getChangeRequests(employeeId).forEach((request) => {
    if (request.status === "pending") pending.add(request.section);
  });
  return Array.from(pending);
};

export const saveDraftChangeRequest = (params: {
  employeeId: string;
  section: SectionKey;
  newValue: unknown;
  supportingDoc?: { fileName: string; dataUrl: string; uploadedAt: string };
}): ProfileChangeRequest => {
  const profiles = readProfiles();
  const requests = readRequests();
  const profile = ensureProfile(params.employeeId);
  profiles[params.employeeId] = profile;

  const sectionMeta = ESS_SECTIONS.find((entry) => entry.key === params.section);
  const oldValue = deepClone(profile[params.section as keyof EmployeeProfile] || {});

  const draftIndex = requests.findIndex(
    (request) =>
      request.employee_id === params.employeeId &&
      request.section === params.section &&
      request.status === "draft"
  );

  let changeRequest: ProfileChangeRequest;
  if (draftIndex >= 0) {
    requests[draftIndex].changes.newValue = deepClone(params.newValue);
    requests[draftIndex].supportingDoc = params.supportingDoc;
    requests[draftIndex].created_at = new Date().toISOString();
    changeRequest = requests[draftIndex];
  } else {
    const hasPending = requests.some(
      (request) =>
        request.employee_id === params.employeeId &&
        request.section === params.section &&
        request.status === "pending"
    );
    if (hasPending) {
      throw new Error("A pending request already exists for this section.");
    }
    changeRequest = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      employee_id: params.employeeId,
      section: params.section,
      section_label: sectionMeta?.label ?? params.section,
      changes: {
        oldValue,
        newValue: deepClone(params.newValue),
      },
      status: "draft",
      created_at: new Date().toISOString(),
      reviewed_by: null,
      reviewed_at: null,
      supportingDoc: params.supportingDoc,
    };
    requests.push(changeRequest);
  }

  writeProfiles(profiles);
  writeRequests(requests);
  return changeRequest;
};

export const submitDraftChangeRequest = (requestId: string): ProfileChangeRequest => {
  const requests = readRequests();
  const index = requests.findIndex((r) => r.id === requestId);
  if (index < 0) {
    throw new Error("Request not found");
  }
  requests[index].status = "pending";
  requests[index].created_at = new Date().toISOString();
  writeRequests(requests);
  return requests[index];
};

export const deleteDraftChangeRequest = (requestId: string) => {
  const requests = readRequests();
  const next = requests.filter((r) => r.id !== requestId);
  writeRequests(next);
};

export const submitSectionChangeRequest = (params: {
  employeeId: string;
  section: SectionKey;
  newValue: unknown;
}): ProfileChangeRequest => {
  const profiles = readProfiles();
  const requests = readRequests();
  const profile = ensureProfile(params.employeeId);
  profiles[params.employeeId] = profile;

  const sectionMeta = ESS_SECTIONS.find((entry) => entry.key === params.section);
  const oldValue = deepClone(profile[params.section as keyof EmployeeProfile] || {});
  const hasPending = requests.some(
    (request) =>
      request.employee_id === params.employeeId &&
      request.section === params.section &&
      request.status === "pending",
  );
  if (hasPending) {
    throw new Error("A pending request already exists for this section.");
  }
  const changeRequest: ProfileChangeRequest = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    employee_id: params.employeeId,
    section: params.section,
    section_label: sectionMeta?.label ?? params.section,
    changes: {
      oldValue,
      newValue: deepClone(params.newValue),
    },
    status: "pending",
    created_at: new Date().toISOString(),
    reviewed_by: null,
    reviewed_at: null,
  };

  requests.push(changeRequest);
  writeProfiles(profiles);
  writeRequests(requests);
  return changeRequest;
};

export const getEmployeeDisplayName = (employeeId: string): string => {
  const profile = ensureProfile(employeeId);
  const { firstName, middleName, lastName } = profile.profile;
  return [firstName, middleName, lastName].filter(Boolean).join(" ") || employeeId;
};

export const reviewChangeRequest = (params: {
  requestId: string;
  status: Exclude<RequestStatus, "pending" | "draft">;
  reviewer: string;
  rejectionComment?: string;
}) => {
  const requests = readRequests();
  const profiles = readProfiles();
  const request = requests.find((entry) => entry.id === params.requestId);
  if (!request || request.status !== "pending") return;

  request.status = params.status;
  request.reviewed_by = params.reviewer;
  request.reviewed_at = new Date().toISOString();
  if (params.status === "rejected") {
    request.rejection_comment = params.rejectionComment?.trim() || "";
  }

  if (params.status === "approved") {
    const profile = ensureProfile(request.employee_id);
    let nextProfile: EmployeeProfile;
    if (request.section === "profile") {
      nextProfile = {
        ...profile,
        ...(request.changes.newValue as any),
      };
    } else {
      nextProfile = {
        ...profile,
        [request.section]: deepClone(request.changes.newValue),
      };
    }
    profiles[request.employee_id] = nextProfile;
    writeProfiles(profiles);

    try {
      const rawEmps = localStorage.getItem('admin_employees_db');
      if (rawEmps) {
        const emps = JSON.parse(rawEmps) as Employee[];
        const adminIndex = emps.findIndex(e => e.id === request.employee_id || e.employeeId === request.employee_id);
        if (adminIndex >= 0) {
          const merged = mergeEssEmployeeOwnedIntoAdmin(emps[adminIndex], nextProfile);
          emps[adminIndex] = merged;
          localStorage.setItem('admin_employees_db', JSON.stringify(emps));
        }
      }
    } catch (e) {
      console.error("Error syncing to admin_employees_db", e);
    }
  }

  writeRequests(requests);
};
