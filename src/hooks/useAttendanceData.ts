import { useState, useEffect } from 'react';
import api from '../api/client';
import { DailyAttendance, AttendanceStatus } from '../app/modules/attendance/types';

export function useAttendanceData(monthKey: string) {
  const [data, setData] = useState<DailyAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        setLoading(true);
        // Add per_page=100 to ensure we get the whole month
        const response = await api.get('/v1/me/attendance/', {
          params: {
            month_key: monthKey,
            per_page: 100
          }
        });
        
        if (isMounted) {
          const results = response.data.results || [];
          // Map backend response to DailyAttendance
          const mappedData: DailyAttendance[] = results.map((record: any) => ({
            id: record.id,
            employeeId: record.employee_code,
            employeeName: record.employee_name,
            department: '',
            designation: '',
            team: '',
            date: record.date,
            status: mapStatus(record.status),
            workMode: 'WFO',
            shiftName: record.shift_name || 'General Shift',
            firstIn: record.first_in || '--:--',
            lastOut: record.last_out || '--:--',
            workHours: parseFloat(record.effective_hours) || 0,
            lateMins: record.late_mins || 0,
            earlyExitMins: record.early_leave_mins || 0,
            lop: 0,
            otMins: record.overtime_mins || 0,
            exception: record.late_mins > 0 || record.early_leave_mins > 0,
            approvalPending: false,
            geoViolation: false,
            locked: false,
            isLate: record.late_mins > 0,
            isAbsent: record.status === 'ABSENT',
            isHalfDay: record.status === 'HALF_DAY',
          }));
          
          setData(mappedData);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching attendance data:", err);
          setError(err.message || 'Failed to fetch attendance data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    if (monthKey) {
      fetchData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [monthKey]);

  return { data, loading, error };
}

function mapStatus(status: string): AttendanceStatus {
  switch (status?.toUpperCase()) {
    case 'PRESENT': return 'Present';
    case 'ABSENT': return 'Absent';
    case 'HALF_DAY': return 'Half Day';
    case 'LEAVE': return 'Leave';
    case 'HOLIDAY': return 'Holiday';
    case 'WEEK_OFF': return 'Week Off';
    default: return 'Absent'; // Fallback
  }
}
