import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  useAllLeaveApplications,
  useLeaveTypes,
  useMyLeaveApplications,
  useMyLeaveBalances,
  useUpcomingHolidays,
} from "../../../modules/leaves/useLeaves";
import type { HolidayAPI, LeaveApplicationAPI, LeaveBalanceAPI, LeaveTypeRef } from "../../../modules/leaves/types";

function managerCodeFromUser(user: ReturnType<typeof useAuth>["user"]): string {
  if (!user || user.role !== "manager") return "EMP-0001";
  if (user.employeeId) return `EMP-${String(user.employeeId).padStart(4, "0")}`;
  return "EMP-0001";
}

export interface ManagerLeaveDataContextValue {
  employeeCode: string;
  employeeName: string;
  year: number;
  leaveTypes: LeaveTypeRef[];
  balances: LeaveBalanceAPI[];
  applications: LeaveApplicationAPI[];
  teamApplications: LeaveApplicationAPI[];
  holidays: HolidayAPI[];
  refreshBalances: () => void;
  refreshApplications: () => void;
  refreshTeam: () => void;
  refreshAll: () => void;
}

const Ctx = createContext<ManagerLeaveDataContextValue | null>(null);

export function ManagerLeaveDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const employeeCode = managerCodeFromUser(user);
  const employeeName = user?.name ?? "Manager";
  const year = new Date().getFullYear();

  const leaveTypesQ = useLeaveTypes();
  const balancesQ = useMyLeaveBalances(employeeCode);
  const appsQ = useMyLeaveApplications(employeeCode);
  const allAppsQ = useAllLeaveApplications();
  const holidaysQ = useUpcomingHolidays(year);

  const refreshAll = useCallback(() => {
    balancesQ.refresh();
    appsQ.refresh();
    allAppsQ.refresh();
  }, [balancesQ, appsQ, allAppsQ]);

  const teamApplications = useMemo(
    () => allAppsQ.data.filter((a) => a.employee_code !== employeeCode && a.status === "APPROVED"),
    [allAppsQ.data, employeeCode],
  );

  const value = useMemo<ManagerLeaveDataContextValue>(
    () => ({
      employeeCode,
      employeeName,
      year,
      leaveTypes: leaveTypesQ.data ?? [],
      balances: balancesQ.data ?? [],
      applications: appsQ.data ?? [],
      teamApplications,
      holidays: holidaysQ.data ?? [],
      refreshBalances: balancesQ.refresh,
      refreshApplications: () => {
        appsQ.refresh();
        allAppsQ.refresh();
      },
      refreshTeam: allAppsQ.refresh,
      refreshAll,
    }),
    [
      refreshAll,
      employeeCode,
      employeeName,
      year,
      leaveTypesQ.data,
      balancesQ.data,
      appsQ.data,
      teamApplications,
      holidaysQ.data,
      balancesQ.refresh,
      appsQ.refresh,
      allAppsQ.refresh,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useManagerLeaveData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useManagerLeaveData must be used within ManagerLeaveDataProvider");
  return v;
}
