/**
 * HTTP client for /api/attendance/* endpoints.
 * Sends Bearer token and X-Company-ID when available in localStorage.
 */

import { clearAuthStorage, getTenantSchema, refreshAccessToken } from './authClient';

// Backend mount: /api/attendance/ (alias /api/admin/attendance/ kept for compatibility)
const ATTENDANCE_BASE = '/api/attendance';

export function getAccessToken(): string | null {
  return localStorage.getItem('hrms_access_token');
}

/** Decode JWT payload (no signature verification — client-side hints only). */
export function parseAccessTokenClaims(): Record<string, unknown> | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(
      decodeURIComponent(
        decoded
          .split('')
          .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join(''),
      ),
    );
  } catch {
    return null;
  }
}

export function getCompanyIdFromToken(): string | null {
  const claims = parseAccessTokenClaims();
  if (claims?.company_id) return String(claims.company_id);
  return null;
}

/**
 * Prefer company_id from JWT (source of truth), then localStorage, then env default.
 */
export function getCompanyId(): string | null {
  const fromToken = getCompanyIdFromToken();
  if (fromToken) {
    const stored = localStorage.getItem('hrms_company_id');
    if (stored !== fromToken) {
      localStorage.setItem('hrms_company_id', fromToken);
    }
    return fromToken;
  }
  return (
    localStorage.getItem('hrms_company_id') ||
    (import.meta.env.VITE_COMPANY_ID as string | undefined) ||
    null
  );
}

export function syncCompanyIdFromToken(): string | null {
  const fromToken = getCompanyIdFromToken();
  if (fromToken) {
    setCompanyId(fromToken);
  }
  return fromToken;
}

export function setCompanyId(companyId: string) {
  localStorage.setItem('hrms_company_id', companyId);
}

export function setAccessToken(token: string) {
  localStorage.setItem('hrms_access_token', token);
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

async function tryRefreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem('hrms_refresh_token');
  if (!refresh) return null;
  const access = await refreshAccessToken(refresh);
  if (!access) return null;
  setAccessToken(access);
  return access;
}

export class AttendanceApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'AttendanceApiError';
    this.status = status;
    this.body = body;
  }
}

export async function attendanceRequest<T>(
  path: string,
  init?: RequestInit & { query?: Record<string, string | number | boolean | undefined | null> },
): Promise<T> {
  const { query, ...rest } = init ?? {};
  const url = `${ATTENDANCE_BASE}${path}${query ? buildQuery(query) : ''}`;

  const buildHeaders = (token: string | null): Record<string, string> => {
    const headers: Record<string, string> = {
      ...(rest.headers as Record<string, string> | undefined),
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const companyId = getCompanyId();
    if (companyId) {
      headers['X-Company-ID'] = companyId;
    }
    headers['X-Tenant-Schema'] = getTenantSchema();
    const hasJsonBody =
      rest.body !== undefined &&
      !(rest.body instanceof FormData) &&
      !headers['Content-Type'];
    if (hasJsonBody) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  let token = getAccessToken();
  let res = await fetch(url, {
    credentials: 'include',
    ...rest,
    headers: buildHeaders(token),
  });

  // Retry once after refresh when access token is expired or invalid
  if (res.status === 401) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      token = refreshed;
      res = await fetch(url, {
        credentials: 'include',
        ...rest,
        headers: buildHeaders(token),
      });
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearAuthStorage();
    }
    let msg = `Request failed (${res.status})`;
    let body: unknown;
    try {
      body = await res.json();
      const b = body as {
        detail?: string;
        message?: string;
        error?: { code?: string; message?: string };
      };
      msg = b.detail ?? b.message ?? b.error?.message ?? msg;

      if (res.status === 403) {
        const code = b.error?.code;
        if (code === 'COMPANY_ACCESS_DENIED') {
          syncCompanyIdFromToken();
          msg =
            b.error?.message ??
            'You do not have permission to view this company. Your session was reset to your assigned company — refresh or sign in again.';
        } else {
          msg = b.error?.message ?? msg ?? 'You do not have permission to perform this action.';
        }
      } else if (res.status === 401) {
        msg = 'Session expired. Please sign in again.';
      } else if (res.status >= 500) {
        msg =
          b.error?.message ??
          b.detail ??
          'Server error while loading attendance data. Check backend logs or run migrations.';
      }
    } catch {
      if (res.status === 401) msg = 'Session expired. Please sign in again.';
      if (res.status === 403) msg = 'Permission denied.';
      if (res.status >= 500) msg = 'Server error. Please try again later.';
    }
    throw new AttendanceApiError(msg, res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

/** Inject company_id into query params when required by endpoint. */
export function withCompany<T extends Record<string, unknown>>(params: T): T & { company_id?: string } {
  const companyId = getCompanyId();
  if (!companyId) return params;
  return { ...params, company_id: companyId };
}

export async function pollJobStatus<T extends { status: string }>(
  fetchStatus: () => Promise<T>,
  options?: { intervalMs?: number; maxAttempts?: number; terminalStatuses?: string[] },
): Promise<T> {
  const intervalMs = options?.intervalMs ?? 4000;
  const maxAttempts = options?.maxAttempts ?? 60;
  const terminal = new Set(options?.terminalStatuses ?? ['completed', 'failed', 'COMPLETED', 'FAILED', 'SUCCESS', 'ERROR']);

  for (let i = 0; i < maxAttempts; i++) {
    const result = await fetchStatus();
    if (terminal.has(result.status)) {
      return result;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new AttendanceApiError('Job polling timed out', 408);
}