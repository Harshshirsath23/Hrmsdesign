/**
 * Shared auth helpers for HRMS API clients (JWT + tenant headers).
 */

const ACCESS_TOKEN_KEY = 'hrms_access_token';
const REFRESH_TOKEN_KEY = 'hrms_refresh_token';
const COMPANY_ID_KEY = 'hrms_company_id';
const TENANT_SCHEMA_KEY = 'hrms_tenant_schema';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function setCompanyId(companyId: string): void {
  localStorage.setItem(COMPANY_ID_KEY, companyId);
}

export function getCompanyId(): string | null {
  return (
    localStorage.getItem(COMPANY_ID_KEY) ||
    (import.meta.env.VITE_COMPANY_ID as string | undefined) ||
    null
  );
}

export function getTenantSchema(): string {
  return (
    localStorage.getItem(TENANT_SCHEMA_KEY) ||
    (import.meta.env.VITE_TENANT_SCHEMA as string | undefined) ||
    'public'
  );
}

export function setTenantSchema(schema: string): void {
  localStorage.setItem(TENANT_SCHEMA_KEY, schema);
}

/** Persist tokens from login response (`access` / `refresh`). */
export function persistAuthTokens(payload: {
  access?: string;
  refresh?: string;
  company_id?: string;
  tenant_schema?: string;
}): void {
  if (payload.access) setAccessToken(payload.access);
  if (payload.refresh) setRefreshToken(payload.refresh);
  if (payload.company_id) setCompanyId(payload.company_id);
  if (payload.tenant_schema) setTenantSchema(payload.tenant_schema);
}

export async function refreshAccessToken(refresh: string): Promise<string | null> {
  try {
    const res = await fetch('/api/employees/login/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access?: string };
    return data.access ?? null;
  } catch {
    return null;
  }
}

export function clearAuthStorage(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(COMPANY_ID_KEY);
}
