
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LOGIN_PATH = `${BASE_URL}/api/employees/login/`;
const REFRESH_PATH = `${BASE_URL}/api/employees/refresh/`;


export function getTenantSchema(): string {
  return (
    localStorage.getItem('hrms_tenant_schema') ||
    (import.meta.env.VITE_TENANT_SCHEMA as string | undefined) ||
    'acme'
  );
}

export function setTenantSchema(schema: string) {
  localStorage.setItem('hrms_tenant_schema', schema);
}

/** Clear all auth-related browser storage (login session). */
export function clearAuthStorage() {
  localStorage.removeItem('hrms_user');
  localStorage.removeItem('hrms_access_token');
  localStorage.removeItem('hrms_refresh_token');
  localStorage.removeItem('hrms_company_id');
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  data?: LoginResponse & { companyId?: string; employeeId?: string };
}

export async function loginWithBackend(
  email: string,
  password: string,
): Promise<LoginResult> {
  const response = await fetch(LOGIN_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Schema': getTenantSchema(),
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      payload.detail ||
      payload.message ||
      (Array.isArray(payload.non_field_errors) ? payload.non_field_errors[0] : undefined) ||
      'Invalid email or password.';
    return { success: false, message: String(msg) };
  }

  if (!payload.access) {
    return { success: false, message: 'Login succeeded but no access token was returned.' };
  }

  return { success: true, data: payload };
}

export async function refreshAccessToken(refresh: string): Promise<string | null> {
  const response = await fetch(REFRESH_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Schema': getTenantSchema(),
    },
    credentials: 'include',
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) return null;
  const payload = await response.json();
  const access = payload.access ?? null;
  if (access) {
    localStorage.setItem('hrms_access_token', access);
    if (payload.refresh) {
      localStorage.setItem('hrms_refresh_token', payload.refresh);
    }
  }
  return access;
}
