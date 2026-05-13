import type { MasterListQuery, MasterRecord, PaginatedMasterResponse } from "./types";

const BASE_URL = "/api/masters";

function toQueryString(query: MasterListQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.company) params.set("company", query.company);
  if (query.is_active) params.set("is_active", query.is_active);
  if (query.page) params.set("page", String(query.page));
  const str = params.toString();
  return str ? `?${str}` : "";
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { detail?: string; message?: string };
      msg = body.detail ?? body.message ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function getMasterList(masterApiName: string, query: MasterListQuery) {
  return request<PaginatedMasterResponse<MasterRecord>>(
    `${BASE_URL}/${masterApiName}/${toQueryString(query)}`,
  );
}

export async function createMaster(masterApiName: string, payload: Record<string, unknown>) {
  return request<MasterRecord>(`${BASE_URL}/${masterApiName}/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchMaster(masterApiName: string, id: string | number, payload: Record<string, unknown>) {
  return request<MasterRecord>(`${BASE_URL}/${masterApiName}/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteMaster(masterApiName: string, id: string | number) {
  return request<void>(`${BASE_URL}/${masterApiName}/${id}/`, {
    method: "DELETE",
  });
}

