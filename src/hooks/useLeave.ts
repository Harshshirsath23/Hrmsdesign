import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@api/client";

/* ------------------------------------------------------------------ */
/*  Local Storage Keys                                                 */
/* ------------------------------------------------------------------ */

const LEAVE_BAL_KEY = "hrms-demo-leave-balances";
const LEAVE_APP_KEY = "hrms-demo-leave-applications";

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const DEMO_LEAVE_TYPES: LeaveTypeRef[] = [
  {
    leave_type_id: "lt-1",
    name: "Privilege Leave",
    code: "PL",
    color_code: "#0EA5E9",
    is_paid: true,
  },
  {
    leave_type_id: "lt-2",
    name: "Sick Leave",
    code: "SL",
    color_code: "#F59E0B",
    is_paid: true,
  },
  {
    leave_type_id: "lt-3",
    name: "Casual Leave",
    code: "CL",
    color_code: "#10B981",
    is_paid: true,
  },
  {
    leave_type_id: "lt-4",
    name: "Loss of Pay",
    code: "LOP",
    color_code: "#EF4444",
    is_paid: false,
  },
];


const DEMO_BALANCES: LeaveBalanceAPI[] = [
  {
    id: "lb-1",
    employee_code: "EMP-0001",
    leave_type: "lt-1",
    leave_type_detail: DEMO_LEAVE_TYPES[0],
    period_start: "2026-01-01",
    period_end: "2026-12-31",
    opening_balance: 12,
    accrued: 2,
    used: 4,
    pending_approval: 1,
    carry_forwarded: 2,
    encashed: 0,
    available: 11,
    total_allocated: 14,
  },
];

export const DEMO_APPLICATIONS: LeaveApplicationAPI[] = [
  {
    id: "la-1",
    employee_code: "EMP-0001",
    employee_name: "Aditi Mehra",
    leave_type: "lt-1",
    leave_type_detail: DEMO_LEAVE_TYPES[0],
    from_date: "2026-05-06",
    to_date: "2026-05-08",
    from_half: "FULL",
    to_half: "FULL",
    total_days: 3,
    reason: "Family function",
    status: "SUBMITTED",
    applied_on: "2026-04-29",
    approved_at: null,
  },
];

/* ------------------------------------------------------------------ */
/*  Local Storage Helpers                                              */
/* ------------------------------------------------------------------ */

export function readStore<T>(key: string, seed: T[]): T[] {
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      return JSON.parse(raw) as T[];
    } catch {
      //
    }
  }

  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

export function writeStore<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}


/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */


export interface LeaveTypeRef {
  leave_type_id: string;
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
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED"
    | "REVOKED";
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
  balances: any[];
}

export interface ApplyLeavePayload {
  leave_type_id: string;

  from_date: string;
  to_date: string;

  from_session:
    | "first_half"
    | "second_half";

  to_session:
    | "first_half"
    | "second_half";

  reason: string;

  attachment?: File | null;
}
export interface UpdateLeavePayload {
  leave_type_id?: string;
  from_date?: string;
  to_date?: string;
  is_half_day?: boolean;
  reason?: string;
}

/* ------------------------------------------------------------------ */
/*  API Calls                                                          */
/* ------------------------------------------------------------------ */

async function fetchLeaveBalanceSummary(): Promise<LeaveBalanceSummaryAPI> {
  try {
    const res = await api.get("/leave/ess/balance");

    console.log("Balance Summary:", res.data);

    return res.data?.data ?? res.data;
  } catch (error) {
    console.error("Balance Summary Error:", error);

    const sum = DEMO_BALANCES.reduce(
      (acc, b) => ({
        total_allocated: acc.total_allocated + b.total_allocated,
        total_available: acc.total_available + b.available,
        total_used: acc.total_used + b.used,
      }),
      {
        total_allocated: 0,
        total_available: 0,
        total_used: 0,
      }
    );

    return {
      employee_id: "",
      total_allocated: sum.total_allocated,
      total_accrued: 0,
      total_available: sum.total_available,
      total_used: sum.total_used,
      total_pending: 0,
      balances: DEMO_BALANCES,
    };
  }
}

async function fetchMyBalances(): Promise<LeaveBalanceAPI[]> {
  try {
    const res = await api.get("/leave/ess/balance");

    console.log("Leave Balances:", res.data);

    const rows =
      res.data?.results ??
      res.data?.data?.results ??
      res.data?.data ??
      res.data ??
      [];

    if (Array.isArray(rows)) {
      writeStore(LEAVE_BAL_KEY, rows);
      return rows;
    }
  } catch (error) {
    console.error("Leave Balance Error:", error);
  }

  return readStore(LEAVE_BAL_KEY, DEMO_BALANCES);
}


async function fetchMyApplications(): Promise<LeaveApplicationAPI[]> {
  try {
    const res = await api.get("/leave/ess/applications");

    console.log("Applications:", res.data);

    const rows =
      res.data?.items ??
      res.data?.results ??
      res.data?.data?.items ??
      res.data?.data?.results ??
      res.data?.data ??
      [];

    if (Array.isArray(rows)) {
      writeStore(LEAVE_APP_KEY, rows);
      return rows;
    }
  } catch (error) {
    console.error("Applications Error:", error);
  }

  return readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS);
}


async function fetchUpcomingHolidays(): Promise<HolidayAPI[]> {
  try {
    const res = await api.get("/leave/ess/holidays");

    console.log("Holidays:", res.data);

    const rows =
      res.data?.results ??
      res.data?.data?.results ??
      res.data?.data ??
      res.data ??
      [];

    if (Array.isArray(rows)) {
      return rows;
    }
  } catch (error) {
    console.error("Holiday Error:", error);
  }

  return [
    {
      id: "hol-1",
      name: "Maharashtra Day",
      date: "2026-05-01",
      holiday_type: "National",
      is_optional: false,
    },
  ];
}


async function fetchLeaveTypes(): Promise<LeaveTypeRef[]> {
  try {
    const res = await api.get("/leave/ess/leave-types");

    console.log("Leave Types:", res.data);

    const rows =
      res.data?.results ??
      res.data?.data?.results ??
      res.data?.data ??
      res.data ??
      [];

    if (Array.isArray(rows)) {
      console.log("Leave Types (final):", rows);
      return rows;
    }
  } catch (error) {
    console.error("Leave Types Error:", error);
  }

  return DEMO_LEAVE_TYPES;
}

async function applyLeave(payload: ApplyLeavePayload) {
  const formData = new FormData();

  formData.append(
    "leave_type_id",
    payload.leave_type_id
  );

  formData.append(
    "from_date",
    payload.from_date
  );

  formData.append(
    "to_date",
    payload.to_date
  );

  formData.append(
    "from_session",
    payload.from_session
  );

  formData.append(
    "to_session",
    payload.to_session
  );

  formData.append(
    "reason",
    payload.reason
  );

  if (payload.attachment) {
    formData.append(
      "attachment",
      payload.attachment
    );
  }
  console.log(formData instanceof FormData);
  const res = await api.post(
    "/leave/ess/apply",
    formData
  );

  return res.data?.data ?? res.data;
}

async function cancelLeave(id: string) {
  const res = await api.patch(
    `/leave/ess/applications/${id}/cancel`,
    { reason: "Cancelled by employee" }
  );

  return res.data?.data ?? res.data;
}

async function updateLeave(id: string, payload: UpdateLeavePayload) {
  const res = await api.patch(
    `/leave/ess/applications/${id}/update/`,
    payload
  );

  return res.data?.data ?? res.data;
}

async function resubmitLeave(id: string) {
  const res = await api.post(
    `/leave/ess/applications/${id}/resubmit/`
  );

  return res.data?.data ?? res.data;
}

async function addLeaveComment(
  id: string,
  comment: string
) {
  const res = await api.post(
    `/leave/ess/applications/${id}/comments/`,
    {
      comment,
    }
  );

  return res.data?.data ?? res.data;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

export function useLeaveBalanceSummary() {
  return useQuery({
    queryKey: ["leave-balance-summary"],
    queryFn: fetchLeaveBalanceSummary,
    staleTime: 3 * 60_000,
  });
}

export function useMyLeaveBalances() {
  return useQuery({
    queryKey: ["leave-balances-my"],
    queryFn: fetchMyBalances,
    staleTime: 2 * 60_000,
  });
}

export function useMyLeaveApplications() {
  return useQuery({
    queryKey: ["leave-applications-my"],
    queryFn: fetchMyApplications,
    staleTime: 2 * 60_000,
  });
}


export function useUpcomingHolidays() {
  return useQuery({
    queryKey: ["holidays-upcoming"],
    queryFn: fetchUpcomingHolidays,
    staleTime: 10 * 60_000,
  });
}


export function useLeaveTypes() {
  return useQuery({
    queryKey: ["leave-types"],
    queryFn: fetchLeaveTypes,
    staleTime: 10 * 60_000,
  });
}

export function useApplyLeave() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: applyLeave,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["leave-applications-my"],
      });

      qc.invalidateQueries({
        queryKey: ["leave-balances-my"],
      });

      qc.invalidateQueries({
        queryKey: ["leave-balance-summary"],
      });
    },
  });
}

export function useCancelLeave() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: cancelLeave,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["leave-applications-my"],
      });

      qc.invalidateQueries({
        queryKey: ["leave-balances-my"],
      });
    },
  });
}

export function useUpdateLeave() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ApplyLeavePayload>;
    }) => updateLeave(id, payload),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["leave-applications-my"],
      });
    },
  });
}

export function useResubmitLeave() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: resubmitLeave,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["leave-applications-my"],
      });
    },
  });
}

export function useAddLeaveComment() {
  return useMutation({
    mutationFn: ({
      id,
      comment,
    }: {
      id: string;
      comment: string;
    }) => addLeaveComment(id, comment),
  });
}