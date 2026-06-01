import { Employee } from "../components/employees/mockData";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://acme.localhost:8000";

const MY_MEDICAL_DETAILS_URL = `${API_BASE_URL}/api/employee/my-medical-details/`;
const EMPLOYEE_MEDICAL_DETAILS_URL = `${API_BASE_URL}/api/admin/employees`;

export interface EmployeeMedicalDetailsApi {
  emergency_contact_name?: string | null;
  emergency_contact_number?: string | null;
  emergency_contact_relationship?: string | null;
  medical_conditions?: string | null;
  allergies?: string | null;
  doctor_name?: string | null;
}

export interface MedicalDetailsSubmitPayload {
  medical_details: EmployeeMedicalDetailsApi;
  remarks?: string;
}

interface MedicalDetailsResponse {
  medical_details?: EmployeeMedicalDetailsApi;
}

function authHeaders() {
  const token = localStorage.getItem("hrms_access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseApiError(response: Response) {
  try {
    const data = await response.json();
    return data?.detail || data?.non_field_errors || JSON.stringify(data);
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as T;
}

export async function getMyMedicalDetails() {
  const data = await requestJson<MedicalDetailsResponse>(MY_MEDICAL_DETAILS_URL, {
    method: "GET",
  });
  return data.medical_details ?? {};
}

export async function postMyMedicalDetails(payload: MedicalDetailsSubmitPayload) {
  return requestJson(MY_MEDICAL_DETAILS_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchMyMedicalDetails(payload: MedicalDetailsSubmitPayload) {
  return requestJson(MY_MEDICAL_DETAILS_URL, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getEmployeeMedicalDetails(employeeId: string) {
  const data = await requestJson<MedicalDetailsResponse>(
    `${EMPLOYEE_MEDICAL_DETAILS_URL}/${employeeId}/medical-details/`,
    { method: "GET" }
  );
  return data.medical_details ?? {};
}

export async function patchEmployeeMedicalDetails(
  employeeId: string,
  payload: MedicalDetailsSubmitPayload
) {
  const data = await requestJson<MedicalDetailsResponse>(
    `${EMPLOYEE_MEDICAL_DETAILS_URL}/${employeeId}/medical-details/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  return data.medical_details ?? {};
}

export function medicalDetailsToEmployeePatch(details: EmployeeMedicalDetailsApi): Partial<Employee> {
  return {
    emergencyContact: {
      name: details.emergency_contact_name || "",
      phone: details.emergency_contact_number || "",
      relationship: details.emergency_contact_relationship || "",
    },
    medicalInfo: {
      conditions: details.medical_conditions || "",
      allergies: details.allergies || "",
      doctorName: details.doctor_name || "",
      relationship: details.emergency_contact_relationship || "",
    },
  };
}

export function employeeMedicalDetailsToPayload(
  emergency: {
    ec?: Employee["emergencyContact"];
    med?: Employee["medicalInfo"];
  }
): MedicalDetailsSubmitPayload {
  return {
    medical_details: {
      emergency_contact_name: emergency.ec?.name || null,
      emergency_contact_number: emergency.ec?.phone || null,
      emergency_contact_relationship:
        emergency.ec?.relationship || emergency.med?.relationship || null,
      medical_conditions: emergency.med?.conditions || null,
      allergies: emergency.med?.allergies || null,
      doctor_name: emergency.med?.doctorName || null,
    },
  };
}

export function hasMedicalDetails(details: EmployeeMedicalDetailsApi) {
  return Boolean(
    details.emergency_contact_name ||
      details.emergency_contact_number ||
      details.emergency_contact_relationship ||
      details.medical_conditions ||
      details.allergies ||
      details.doctor_name
  );
}
