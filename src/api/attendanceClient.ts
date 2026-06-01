import { getTenantSchema, refreshAccessToken } from './authClient';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
export const ATTENDANCE_BASE = `${BASE_URL}/api/admin/attendance`;

export class AttendanceApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'AttendanceApiError';
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const padded = part + '='.repeat((4 - (part.length % 4)) % 4);
    return JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return (
    localStorage.getItem('hrms_access_token') ||
    (import.meta.env.VITE_ACCESS_TOKEN as string | undefined) ||
    null
  );
}

export function getCompanyId(): string | null {
  const stored = localStorage.getItem('hrms_company_id');
  if (stored) return stored;

  const token = getAccessToken();
  if (!token) return null;

  const claims = decodeJwtPayload(token);
  const cid = claims?.company_id;
  return cid != null ? String(cid) : null;
}

export function setCompanyId(companyId: string) {
  localStorage.setItem('hrms_company_id', companyId);
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

function errorMessage(status: number, body: unknown): string {
  if (typeof body === 'object' && body !== null) {
    const b = body as Record<string, unknown>;
    if (typeof b.detail === 'string') return b.detail;
    if (typeof b.message === 'string') return b.message;
    const err = b.error as Record<string, unknown> | undefined;
    if (err && typeof err.message === 'string') return err.message;
    if (err && typeof err.message === 'object') {
      return JSON.stringify(err.message);
    }
  }
  if (status === 401) return 'Session expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to access this attendance data.';
  if (status >= 500) return 'Server error while loading attendance data.';
  return `Request failed (${status})`;
}

export async function attendanceFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${ATTENDANCE_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const buildHeaders = (access: string | null): HeadersInit => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Tenant-Schema': getTenantSchema(),
      ...(init.headers as Record<string, string>),
    };
    if (access) headers.Authorization = `Bearer ${access}`;
    const companyId = getCompanyId();
    if (companyId) headers['X-Company-ID'] = companyId;
    if (init.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  let access = getAccessToken();
  let response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: buildHeaders(access),
  });

  if (response.status === 401 && access) {
    const refresh = localStorage.getItem('hrms_refresh_token');
    if (refresh) {
      const next = await refreshAccessToken(refresh);
      if (next) {
        access = next;
        response = await fetch(url, {
          ...init,
          credentials: 'include',
          headers: buildHeaders(access),
        });
      }
    }
  }

  const body = await parseJsonSafe(response);

  if (!response.ok) {
    throw new AttendanceApiError(errorMessage(response.status, body), response.status, body);
  }

  return body as T;
}

export function attendanceQuery(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const q = new URLSearchParams();
  const companyId = getCompanyId();
  if (companyId && !('company_id' in params)) {
    q.set('company_id', companyId);
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      q.set(key, String(value));
    }
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}
