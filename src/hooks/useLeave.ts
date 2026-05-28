import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@api/client';
 
const LEAVE_BAL_KEY = 'hrms-demo-leave-balances';
const LEAVE_APP_KEY = 'hrms-demo-leave-applications';
 
const DEMO_LEAVE_TYPES: LeaveTypeRef[] = [
  { id: 'lt-1', name: 'Privilege Leave', code: 'PL', color_code: '#0EA5E9', is_paid: true },
  { id: 'lt-2', name: 'Sick Leave', code: 'SL', color_code: '#F59E0B', is_paid: true },
  { id: 'lt-3', name: 'Casual Leave', code: 'CL', color_code: '#10B981', is_paid: true },
  { id: 'lt-4', name: 'Loss of Pay', code: 'LOP', color_code: '#EF4444', is_paid: false },
];
 
const DEMO_BALANCES: LeaveBalanceAPI[] = [
  {
    id: 'lb-1', employee_code: 'EMP-0001', leave_type: 'lt-1', leave_type_detail: DEMO_LEAVE_TYPES[0],
    period_start: '2026-01-01', period_end: '2026-12-31', opening_balance: 12, accrued: 2, used: 4,
    pending_approval: 1, carry_forwarded: 2, encashed: 0, available: 11, total_allocated: 14,
  },
  {
    id: 'lb-2', employee_code: 'EMP-0001', leave_type: 'lt-2', leave_type_detail: DEMO_LEAVE_TYPES[1],
    period_start: '2026-01-01', period_end: '2026-12-31', opening_balance: 8, accrued: 0, used: 2,
    pending_approval: 0, carry_forwarded: 0, encashed: 0, available: 6, total_allocated: 8,
  },
  {
    id: 'lb-3', employee_code: 'EMP-0001', leave_type: 'lt-3', leave_type_detail: DEMO_LEAVE_TYPES[2],
    period_start: '2026-01-01', period_end: '2026-12-31', opening_balance: 6, accrued: 0, used: 1,
    pending_approval: 0, carry_forwarded: 0, encashed: 0, available: 5, total_allocated: 6,
  },
];
 
const DEMO_APPLICATIONS: LeaveApplicationAPI[] = [
  {
    id: 'la-1', employee_code: 'EMP-0002', employee_name: 'Rohan Kulkarni', leave_type: 'lt-2',
    leave_type_detail: DEMO_LEAVE_TYPES[1], from_date: '2026-04-16', to_date: '2026-04-16', from_half: 'FULL', to_half: 'FULL',
    total_days: 1, reason: 'Fever and doctor consultation', status: 'APPROVED', applied_on: '2026-04-14', approved_at: '2026-04-15T10:15:00Z',
  },
  {
    id: 'la-2', employee_code: 'EMP-0001', employee_name: 'Aditi Mehra', leave_type: 'lt-1',
    leave_type_detail: DEMO_LEAVE_TYPES[0], from_date: '2026-05-06', to_date: '2026-05-08', from_half: 'FULL', to_half: 'FULL',
    total_days: 3, reason: 'Family function out of station', status: 'SUBMITTED', applied_on: '2026-04-29', approved_at: null,
  },
];
 
function readStore<T>(key: string, seed: T[]): T[] {
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw) as T[];
    } catch {
      // fallback to seed
    }
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}
 
function writeStore<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}
 
/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
 
export interface LeaveTypeRef {
  id: string;
  name: string;
  code: string;
  color_code: string;
  is_paid: boolean;
}
 
export interface LeaveBalanceAPI {
  id: string;
  employee_code: string;
  leave_type: string;
  leave_type_detail: LeaveTypeRef;
  period_start: string;
  period_end: string;
  opening_balance: number;
  accrued: number;
  used: number;
  pending_approval: number;
  carry_forwarded: number;
  encashed: number;
  available: number;
  total_allocated: number;
}
 
export interface LeaveApplicationAPI {
  id: string;
  employee_code: string;
  employee_name: string;
  leave_type: string;
  leave_type_detail: LeaveTypeRef;
  from_date: string;
  to_date: string;
  from_half: string;
  to_half: string;
  total_days: number;
  reason: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REVOKED';
  applied_on: string;
  approved_at: string | null;
}
 
export interface HolidayAPI {
  id: string;
  name: string;
  date: string;
  holiday_type: string;
  is_optional: boolean;
}
 
export interface LeaveBalanceSummaryAPI {
  employee_id: string;
  total_allocated: number;
  total_accrued: number;
  total_available: number;
  total_used: number;
  total_pending: number;
  balances: Array<{
    leave_type_id: string;
    leave_type_name: string;
    allocated: number;
    accrued: number;
    available: number;
    used: number;
    pending: number;
    carried_forward: number;
  }>;
}
 
/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */
 
async function fetchLeaveBalanceSummary(): Promise<LeaveBalanceSummaryAPI> {
  try {
    console.log('Fetching leave balance summary...');
    const res = await api.get('/leave/ess/balance/summary/');
    console.log('Leave balance summary response:', res.data);
    const data = res.data?.data ?? res.data ?? {};
    if (data?.total_allocated !== undefined) {
      return data as LeaveBalanceSummaryAPI;
    }
  } catch (error) {
    console.error('Error fetching leave balance summary:', error);
  }
  // Fallback: sum from demo balances
  const sum = DEMO_BALANCES.reduce(
    (acc, b) => ({
      total_allocated: acc.total_allocated + b.total_allocated,
      total_available: acc.total_available + b.available,
      total_used: acc.total_used + b.used,
    }),
    { total_allocated: 0, total_available: 0, total_used: 0 }
  );
  return {
    employee_id: '',
    total_allocated: sum.total_allocated,
    total_accrued: 0,
    total_available: sum.total_available,
    total_used: sum.total_used,
    total_pending: 0,
    balances: DEMO_BALANCES as any,
  };
}
 
async function fetchMyBalances(): Promise<LeaveBalanceAPI[]> {
  try {
    console.log('Fetching leave balances...');
    const res = await api.get('/me/leave-balances/');
    console.log('Leave balances response:', res.data);
    const rows = res.data?.results ?? res.data?.data ?? res.data ?? [];
    if (Array.isArray(rows) && rows.length) {
      writeStore(LEAVE_BAL_KEY, rows as LeaveBalanceAPI[]);
      return rows as LeaveBalanceAPI[];
    }
  } catch (error) {
    console.error('Error fetching leave balances:', error);
  }
  return readStore(LEAVE_BAL_KEY, DEMO_BALANCES);
}
 
async function fetchMyApplications(): Promise<LeaveApplicationAPI[]> {
  try {
    console.log('Fetching leave applications...');
    const res = await api.get('/me/leave-applications/');
    console.log('Leave applications response:', res.data);
    const rows = res.data?.results ?? res.data?.data?.results ?? res.data?.data ?? res.data ?? [];
    if (Array.isArray(rows) && rows.length) {
      writeStore(LEAVE_APP_KEY, rows as LeaveApplicationAPI[]);
      return rows as LeaveApplicationAPI[];
    }
  } catch {
    // fallback
  }
  return readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS);
}
 
async function fetchUpcomingHolidays(): Promise<HolidayAPI[]> {
  try {
    const res = await api.get('/me/holidays/');
    const rows = res.data?.results ?? res.data?.data ?? res.data ?? [];
    if (Array.isArray(rows) && rows.length) return rows as HolidayAPI[];
  } catch {
    // fallback
  }
  return [
    { id: 'hol-1', name: 'Maharashtra Day', date: '2026-05-01', holiday_type: 'National', is_optional: false },
    { id: 'hol-2', name: 'Bakrid', date: '2026-06-08', holiday_type: 'Festival', is_optional: true },
  ];
}
 
async function fetchLeaveTypes(): Promise<LeaveTypeRef[]> {
  try {
    const res = await api.get('/me/leave-types/');
    const rows = res.data?.results ?? res.data?.data?.results ?? res.data?.data ?? res.data ?? [];
    if (Array.isArray(rows) && rows.length) return rows as LeaveTypeRef[];
  } catch {
    // fallback
  }
  return DEMO_LEAVE_TYPES;
}
 
export function useMyLeaveBalances() {
  return useQuery({
    queryKey: ['leave-balances-my'],
    queryFn: fetchMyBalances,
    staleTime: 2 * 60_000,
  });
}
 
export function useLeaveBalanceSummary() {
  return useQuery({
    queryKey: ['leave-balance-summary'],
    queryFn: fetchLeaveBalanceSummary,
    staleTime: 3 * 60_000,
  });
}
 
export function useMyLeaveApplications() {
  return useQuery({
    queryKey: ['leave-applications-my'],
    queryFn: fetchMyApplications,
    staleTime: 2 * 60_000,
  });
}
 
export function useUpcomingHolidays() {
  return useQuery({
    queryKey: ['holidays-upcoming'],
    queryFn: fetchUpcomingHolidays,
    staleTime: 10 * 60_000,
  });
}
 
export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: fetchLeaveTypes,
    staleTime: 10 * 60_000,
  });
}
 
export interface ApplyLeavePayload {
  leave_type: string;
  from_date: string;
  to_date: string;
  from_half: 'AM' | 'PM' | 'FULL';
  to_half: 'AM' | 'PM' | 'FULL';
  total_days: number;
  reason: string;
  contact_during_leave?: string;
  document_url?: string;
}
 
export function useApplyLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ApplyLeavePayload) => {
      try {
        const res = await api.post('/me/apply-leave/', payload);
        return res.data;
      } catch {
        const leaveTypes = DEMO_LEAVE_TYPES;
        const typeDetail = leaveTypes.find((l) => l.id === payload.leave_type) ?? leaveTypes[0];
        const apps = readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS);
        const newApp: LeaveApplicationAPI = {
          id: crypto.randomUUID(),
          employee_code: 'EMP-0001',
          employee_name: 'Aditi Mehra',
          leave_type: payload.leave_type,
          leave_type_detail: typeDetail,
          from_date: payload.from_date,
          to_date: payload.to_date,
          from_half: payload.from_half,
          to_half: payload.to_half,
          total_days: payload.total_days,
          reason: payload.reason,
          status: 'SUBMITTED',
          applied_on: new Date().toISOString().slice(0, 10),
          approved_at: null,
        };
        writeStore(LEAVE_APP_KEY, [newApp, ...apps]);
 
        const balances = readStore(LEAVE_BAL_KEY, DEMO_BALANCES);
        const updated = balances.map((bal) => {
          if (bal.leave_type !== payload.leave_type) return bal;
          const pendingApproval = Number(bal.pending_approval ?? 0) + payload.total_days;
          return { ...bal, pending_approval: pendingApproval, available: Number(bal.available) - payload.total_days };
        });
        writeStore(LEAVE_BAL_KEY, updated);
 
        return newApp;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-applications-my'] });
      qc.invalidateQueries({ queryKey: ['leave-balances-my'] });
    },
  });
}
 
/* ------------------------------------------------------------------ */
/*  Admin hooks (HRMS portal)                                          */
/* ------------------------------------------------------------------ */
 
async function fetchAllApplications(): Promise<LeaveApplicationAPI[]> {
  try {
    const res = await api.get('/leave/applications/');
    const rows = res.data?.results ?? res.data?.data?.results ?? res.data?.data ?? res.data ?? [];
    if (Array.isArray(rows) && rows.length) {
      writeStore(LEAVE_APP_KEY, rows as LeaveApplicationAPI[]);
      return rows as LeaveApplicationAPI[];
    }
  } catch {
    // fallback
  }
  return readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS);
}
 
export function useAllLeaveApplications() {
  return useQuery({
    queryKey: ['leave-applications-all'],
    queryFn: fetchAllApplications,
    staleTime: 60_000,
  });
}
 
export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await api.post(`/leave/applications/${id}/approve/`);
        return res.data;
      } catch {
        const apps = readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS).map((app) => (
          app.id === id ? { ...app, status: 'APPROVED' as const, approved_at: new Date().toISOString() } : app
        ));
        writeStore(LEAVE_APP_KEY, apps);
        return apps.find((app) => app.id === id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-applications-all'] });
      qc.invalidateQueries({ queryKey: ['leave-applications-my'] });
    },
  });
}
 
export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, remarks }: { id: string; remarks?: string }) => {
      try {
        const res = await api.post(`/leave/applications/${id}/reject/`, { remarks });
        return res.data;
      } catch {
        const apps = readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS).map((app) => (
          app.id === id ? { ...app, status: 'REJECTED' as const, reason: remarks?.trim() ? `${app.reason} (Rejected: ${remarks.trim()})` : app.reason } : app
        ));
        writeStore(LEAVE_APP_KEY, apps);
        return apps.find((app) => app.id === id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-applications-all'] });
      qc.invalidateQueries({ queryKey: ['leave-applications-my'] });
    },
  });
}
 
 