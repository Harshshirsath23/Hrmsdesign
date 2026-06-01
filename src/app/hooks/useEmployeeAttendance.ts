import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  EmployeeAttendanceApiError,
  fetchEmployeeAttendanceList,
  fetchEmployeeAttendanceSummary,
  fetchEmployeePunchDetails,
  submitEmployeeRegularization,
  type PunchDetailsResponse,
  type RegularizationBulkPayload,
} from '../../api/employeeAttendanceClient';
import { mapEmployeeListRecordToDaily, mapSummaryToMetrics } from '../modules/employee-attendance/mappers';
import type { AttendanceMetrics } from '../components/attendance/my-attendance/utils';
import type { DailyAttendance } from '../modules/attendance/types';

export interface UseEmployeeAttendanceOptions {
  monthDate: Date;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  designation?: string;
}

export function useEmployeeAttendance({
  monthDate,
  employeeId = '',
  employeeName = 'Me',
  department = '',
  designation = '',
}: UseEmployeeAttendanceOptions) {
  const [records, setRecords] = useState<DailyAttendance[]>([]);
  const [metrics, setMetrics] = useState<AttendanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthKey = format(monthDate, 'yyyy-MM');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listData, summaryData] = await Promise.all([
        fetchEmployeeAttendanceList({ month: monthKey, per_page: 50, sort: 'date_desc' }),
        fetchEmployeeAttendanceSummary(monthKey),
      ]);

      const mapped = listData.records.map((record) =>
        mapEmployeeListRecordToDaily(record, {
          employeeId,
          employeeName,
          department,
          designation,
        }),
      );
      setRecords(mapped);
      setMetrics(mapSummaryToMetrics(summaryData, mapped));
    } catch (err) {
      const message =
        err instanceof EmployeeAttendanceApiError
          ? err.message
          : 'Failed to load attendance. Please try again.';
      setError(message);
      setRecords([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [monthKey, employeeId, employeeName, department, designation]);

  useEffect(() => {
    void load();
  }, [load]);

  const fetchPunchDetails = useCallback(async (date: string): Promise<PunchDetailsResponse> => {
    return fetchEmployeePunchDetails(date);
  }, []);

  const submitRegularization = useCallback(
    async (payload: RegularizationBulkPayload) => {
      await submitEmployeeRegularization(payload);
      await load();
    },
    [load],
  );

  return {
    records,
    metrics,
    loading,
    error,
    reload: load,
    monthKey,
    fetchPunchDetails,
    submitRegularization,
  };
}
