import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApplyLeavePayload, HolidayAPI, LeaveApplicationAPI, LeaveBalanceAPI, LeaveTypeRef } from "./types";
import { DEMO_APPLICATIONS, DEMO_BALANCES, DEMO_HOLIDAYS_2026, DEMO_LEAVE_TYPES } from "./demoData";
import { readStore, writeStore } from "./storage";

const LEAVE_BAL_KEY = "hrms-demo-leave-balances";
const LEAVE_APP_KEY = "hrms-demo-leave-applications";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function safeUUID(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `id-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

export function useLeaveTypes() {
  const [data, setData] = useState<LeaveTypeRef[]>(() => DEMO_LEAVE_TYPES);
  return { data, isLoading: false, error: null as unknown };
}

export function useMyLeaveBalances(employeeCode: string) {
  const [data, setData] = useState<LeaveBalanceAPI[]>(() =>
    readStore(LEAVE_BAL_KEY, DEMO_BALANCES).filter((b) => b.employee_code === employeeCode),
  );

  const refresh = useCallback(() => {
    setData(readStore(LEAVE_BAL_KEY, DEMO_BALANCES).filter((b) => b.employee_code === employeeCode));
  }, [employeeCode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, refresh, isLoading: false, error: null as unknown };
}

export function useMyLeaveApplications(employeeCode: string) {
  const [data, setData] = useState<LeaveApplicationAPI[]>(() =>
    readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS).filter((a) => a.employee_code === employeeCode),
  );

  const refresh = useCallback(() => {
    setData(readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS).filter((a) => a.employee_code === employeeCode));
  }, [employeeCode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, refresh, isLoading: false, error: null as unknown };
}

export function useAllLeaveApplications() {
  const [data, setData] = useState<LeaveApplicationAPI[]>(() => readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS));

  const refresh = useCallback(() => {
    setData(readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, refresh, isLoading: false, error: null as unknown };
}

export function useUpcomingHolidays(year: number) {
  const data: HolidayAPI[] = useMemo(() => {
    if (year === 2026) return DEMO_HOLIDAYS_2026;
    // simple fallback: keep the same set but shift the year
    return DEMO_HOLIDAYS_2026.map((h) => ({ ...h, id: `${h.id}-${year}`, date: h.date.replace(/^2026/, String(year)) }));
  }, [year]);

  return { data, isLoading: false, error: null as unknown };
}

export function useApplyLeave(employee: { employee_code: string; employee_name: string }) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const mutate = useCallback(
    async (payload: ApplyLeavePayload, opts?: { onSuccess?: () => void; onError?: () => void }) => {
      setIsPending(true);
      setIsSuccess(false);
      setIsError(false);
      setError(null);
      try {
        const typeDetail = DEMO_LEAVE_TYPES.find((l) => l.id === payload.leave_type) ?? DEMO_LEAVE_TYPES[0];
        const apps = readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS);
        const newApp: LeaveApplicationAPI = {
          id: safeUUID(),
          employee_code: employee.employee_code,
          employee_name: employee.employee_name,
          leave_type: payload.leave_type,
          leave_type_detail: typeDetail,
          from_date: payload.from_date,
          to_date: payload.to_date,
          from_half: payload.from_half,
          to_half: payload.to_half,
          total_days: payload.total_days,
          reason: payload.reason,
          status: payload.status ?? "SUBMITTED",
          applied_on: todayISO(),
          approved_at: null,
        };
        writeStore(LEAVE_APP_KEY, [newApp, ...apps]);

        const balances = readStore(LEAVE_BAL_KEY, DEMO_BALANCES);
        const updated = balances.map((bal) => {
          if (bal.employee_code !== employee.employee_code) return bal;
          if (bal.leave_type !== payload.leave_type) return bal;
          const pendingApproval = Number(bal.pending_approval ?? 0) + payload.total_days;
          return {
            ...bal,
            pending_approval: pendingApproval,
            available: Math.max(0, Number(bal.available) - payload.total_days),
          };
        });
        writeStore(LEAVE_BAL_KEY, updated);

        setIsSuccess(true);
        opts?.onSuccess?.();
        return newApp;
      } catch (e) {
        setIsError(true);
        setError(e);
        opts?.onError?.();
        throw e;
      } finally {
        setIsPending(false);
      }
    },
    [employee.employee_code, employee.employee_name],
  );

  return { mutate, isPending, isSuccess, isError, error };
}

export function useApproveLeave() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (id: string) => {
    setIsPending(true);
    try {
      const apps = readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS).map((app) =>
        app.id === id ? { ...app, status: "APPROVED" as const, approved_at: new Date().toISOString() } : app,
      );
      writeStore(LEAVE_APP_KEY, apps);
      return apps.find((a) => a.id === id);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

export function useRejectLeave() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async ({ id, remarks }: { id: string; remarks?: string }) => {
    setIsPending(true);
    try {
      const apps = readStore(LEAVE_APP_KEY, DEMO_APPLICATIONS).map((app) =>
        app.id === id
          ? {
              ...app,
              status: "REJECTED" as const,
              reason: remarks?.trim()
                ? `${app.reason} (Rejected: ${remarks.trim()})`
                : app.reason,
            }
          : app,
      );
      writeStore(LEAVE_APP_KEY, apps);
      return apps.find((a) => a.id === id);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

