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

function employeeCodeFromUser(user: ReturnType<typeof useAuth>["user"]): string {
  if (!user || user.role !== "employee") return "EMP-0001";
  if (user.employeeId) return `EMP-${String(user.employeeId).padStart(4, "0")}`;
  return "EMP-0001";
}

export interface EmployeeLeaveDataContextValue {
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

const Ctx = createContext<EmployeeLeaveDataContextValue | null>(null);

export function EmployeeLeaveDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const employeeCode = employeeCodeFromUser(user);
  const employeeName = user?.name ?? "Employee";
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

  const value = useMemo<EmployeeLeaveDataContextValue>(
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

export function useEmployeeLeaveData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useEmployeeLeaveData must be used within EmployeeLeaveDataProvider");
  return v;
}
