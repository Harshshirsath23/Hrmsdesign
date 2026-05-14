import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@api/client';

const ADMIN_ATT_KEY = 'hrms-demo-admin-attendance';

function readAdminRecords(): AdminAttendanceRecord[] {
  const raw = localStorage.getItem(ADMIN_ATT_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as AdminAttendanceRecord[];
    } catch {
      // fallback
    }
  }
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const seeded: AdminAttendanceRecord[] = [
    {
      id: 'adm-att-1',
      employee: 'emp-1',
      employee_code: 'EMP-0001',
      employee_name: 'Aditi Mehra',
      date: `${year}-${month}-02`,
      shift: 'shift-1',
      shift_name: 'General Shift',
      first_in: `${year}-${month}-02T09:11:00Z`,
      last_out: `${year}-${month}-02T18:03:00Z`,
      effective_hours: '08:02:00',
      late_mins: 11,
      early_leave_mins: 0,
      overtime_mins: 0,
      status: 'PRESENT',
      is_regularized: false,
      remarks: 'Late due to traffic',
      is_admin_edited: false,
      admin_edit_reason: '',
      admin_edited_at: null,
      original_first_in: `${year}-${month}-02T09:11:00Z`,
      original_last_out: `${year}-${month}-02T18:03:00Z`,
      original_status: 'PRESENT',
      last_changed_by_source: 'SYSTEM',
      regularization_ref: null,
    },
  ];
  localStorage.setItem(ADMIN_ATT_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeAdminRecords(rows: AdminAttendanceRecord[]) {
  localStorage.setItem(ADMIN_ATT_KEY, JSON.stringify(rows));
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AdminAttendanceRecord {
  id: string;
  employee: string;
  employee_code: string;
  employee_name: string;
  date: string;
  shift: string | null;
  shift_name: string;
  first_in: string | null;
  last_out: string | null;
  effective_hours: string | null;
  late_mins: number;
  early_leave_mins: number;
  overtime_mins: number;
  status: string;
  is_regularized: boolean;
  remarks: string;
  is_admin_edited: boolean;
  admin_edit_reason: string;
  admin_edited_at: string | null;
  original_first_in: string | null;
  original_last_out: string | null;
  original_status: string;
  last_changed_by_source: string;
  regularization_ref: string | null;
}

export interface AttendanceEditLogEntry {
  id: string;
  attendance_record: string;
  employee: string;
  date: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  change_source: string;
  changed_by: string;
  changed_by_name: string;
  changed_by_code: string;
  reason: string;
  regularization_request: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface OverridePayload {
  first_in?: string | null;
  last_out?: string | null;
  status?: string;
  reason: string;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

async function fetchAdminRecords(params: Record<string, string>): Promise<AdminAttendanceRecord[]> {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/attendance/admin/records/?${query}`);
    const rows = res.data?.results ?? res.data?.data?.results ?? res.data?.data ?? res.data ?? [];
    if (Array.isArray(rows) && rows.length) {
      writeAdminRecords(rows as AdminAttendanceRecord[]);
      return rows as AdminAttendanceRecord[];
    }
  } catch {
    // fallback
  }
  return readAdminRecords();
}

async function fetchAuditLog(recordId: string): Promise<AttendanceEditLogEntry[]> {
  try {
    const res = await api.get(`/attendance/admin/records/${recordId}/audit-log/`);
    const rows = res.data?.results ?? res.data?.data ?? res.data ?? [];
    if (Array.isArray(rows)) return rows as AttendanceEditLogEntry[];
  } catch {
    // fallback
  }
  return [];
}

export function useAdminAttendanceRecords(filters: Record<string, string>) {
  return useQuery({
    queryKey: ['admin-attendance-records', filters],
    queryFn: () => fetchAdminRecords(filters),
    staleTime: 30_000,
  });
}

export function useAttendanceAuditLog(recordId: string | null) {
  return useQuery({
    queryKey: ['attendance-audit-log', recordId],
    queryFn: () => fetchAuditLog(recordId!),
    enabled: !!recordId,
    staleTime: 10_000,
  });
}

export function useAttendanceOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ recordId, payload }: { recordId: string; payload: OverridePayload }) => {
      try {
        const res = await api.patch(`/attendance/admin/records/${recordId}/override/`, payload);
        return res.data;
      } catch {
        const rows = readAdminRecords();
        const updated = rows.map((row) => (
          row.id === recordId
            ? {
                ...row,
                first_in: payload.first_in ?? row.first_in,
                last_out: payload.last_out ?? row.last_out,
                status: payload.status ?? row.status,
                is_admin_edited: true,
                admin_edit_reason: payload.reason,
                admin_edited_at: new Date().toISOString(),
                last_changed_by_source: 'ADMIN_OVERRIDE',
              }
            : row
        ));
        writeAdminRecords(updated);
        return updated.find((row) => row.id === recordId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-attendance-records'] });
      qc.invalidateQueries({ queryKey: ['attendance-audit-log'] });
    },
  });
}
