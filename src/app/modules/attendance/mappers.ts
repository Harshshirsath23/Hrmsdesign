import { format, parseISO } from 'date-fns';
import type {
  DashboardSummaryApi,
  DashboardTrendApi,
  MatrixGridApi,
  MatrixRowApi,
  RosterCalendarApi,
  SwipeLogApi,
  WhoIsInEmployeeApi,
  WhoIsInSummaryApi,
} from './apiTypes';
import type { DailyAttendance, RosterRecord, SwipeLog } from './types';
import type { AttendanceStatus } from './types';

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value == null || value === '') return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function mapDashboardSummaryToMetrics(summary: DashboardSummaryApi) {
  const totalPresent = toNumber(summary.total_present);
  const totalAbsent = toNumber(summary.total_absent);
  return {
    avgWorkHours: toNumber(summary.avg_work_hours),
    totalAbsent,
    holidays: toNumber(summary.total_holidays),
    lateLogins: toNumber(summary.total_late_logins),
    avgAttendance: totalPresent
      ? (totalPresent / Math.max(totalPresent + totalAbsent, 1)) * 100
      : 0,
    totalEmployees: 0,
  };
}

export function mapTrendToChartData(trend: DashboardTrendApi) {
  return (trend.trend_data ?? []).map((p) => ({
    day: p.date ? format(parseISO(p.date), 'dd MMM') : '',
    hours: toNumber(p.work_hours),
    employees: p.status === 'Present' ? 1 : 0,
  }));
}

export function mapWhoIsInSummaryToStats(summary: WhoIsInSummaryApi) {
  const s = summary.summary ?? {};
  return {
    onTime: toNumber(s.on_time),
    lateIn: toNumber(s.late_arrivals),
    notYetIn: toNumber(s.not_yet_in),
    onLeave: 0,
    outOfOffice: toNumber(s.out_of_office),
  };
}

function mapPresenceToStatus(emp: WhoIsInEmployeeApi): AttendanceStatus {
  if (emp.work_status_label?.toLowerCase().includes('leave')) return 'Leave';
  if (emp.presence_state === 'OUT' && !emp.login_time) return 'Absent';
  if (emp.is_late) return 'Present';
  if (emp.login_time) return 'Present';
  return 'Absent';
}

function formatLoginTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'hh:mm a');
  } catch {
    return iso;
  }
}

export function mapWhoIsInEmployeeToDaily(
  emp: WhoIsInEmployeeApi,
  dateStr: string,
): DailyAttendance {
  const workMode =
    emp.work_mode === 'REMOTE' || emp.work_mode === 'WFH'
      ? 'WFH'
      : emp.work_mode === 'CLIENT_SITE'
        ? 'Field'
        : 'WFO';

  return {
    id: `${emp.employee_id}-${dateStr}`,
    employeeId: emp.employee_code ?? emp.employee_id,
    employeeName: emp.name,
    department: emp.department ?? '—',
    designation: emp.designation ?? '—',
    team: emp.team ?? '—',
    date: dateStr,
    status: mapPresenceToStatus(emp),
    workMode,
    shiftName: emp.shift ?? 'General',
    firstIn: formatLoginTime(emp.login_time),
    lastOut: '—',
    workHours: 0,
    lateMins: emp.is_late ? 1 : 0,
    earlyExitMins: 0,
    lop: 0,
    otMins: 0,
    exception: false,
    approvalPending: false,
    geoViolation: false,
    locked: false,
    isLate: !!emp.is_late,
    isAbsent: !emp.login_time && emp.presence_state !== 'IN',
    isHalfDay: false,
    expectedInTime: '09:00 AM',
    email: undefined,
  };
}

export function mapSwipeLogApi(row: SwipeLogApi): SwipeLog {
  const punchTime = row.punch_time ?? '';
  let swipeDate = '';
  let swipeTime = punchTime;
  try {
    const d = parseISO(punchTime);
    swipeDate = format(d, 'yyyy-MM-dd');
    swipeTime = format(d, 'hh:mm a');
  } catch {
    swipeDate = punchTime.slice(0, 10);
  }

  return {
    id: String(row.id),
    employeeId: row.employee_id ?? '',
    employeeName: row.employee_name ?? '—',
    employeeCode: row.employee_code ?? '—',
    department: row.department_name ?? '—',
    designation: '—',
    swipeTime,
    swipeDate,
    type: row.punch_type === 'OUT' ? 'OUT' : 'IN',
    shiftName: row.shift_name ?? '—',
    shiftTiming: '—',
    deviceName: row.device_id ? String(row.device_id) : '—',
    deviceId: row.device_id ? String(row.device_id) : '—',
    deviceType: row.punch_source === 'BIOMETRIC' ? 'Biometric Device' : 'Mobile App',
    accessCardId: '—',
    branch: '—',
    doorName: '—',
    ipAddress: '—',
    gpsCoordinates: '—',
    receivedOn: punchTime,
    syncTime: punchTime,
    status: 'Approved',
    verificationMethod: 'Fingerprint',
    spoofDetection: 'N/A',
  };
}

const CELL_STATUS: Record<string, AttendanceStatus> = {
  P: 'Present',
  A: 'Absent',
  L: 'Leave',
  H: 'Holiday',
  W: 'Week Off',
  HD: 'Half Day',
};

export function mapMatrixRowToUi(row: MatrixRowApi, year: number, month: number): {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  days: Record<string, AttendanceStatus | string>;
} {
  const days: Record<string, AttendanceStatus | string> = {};
  row.days.forEach((cell) => {
    const code = cell.cell_code ?? cell.status_code ?? '';
    days[cell.date] = CELL_STATUS[code] ?? code;
  });
  return {
    employeeId: row.employee_id,
    employeeName: row.full_name,
    employeeCode: row.employee_code,
    department: row.department ?? '—',
    days,
  };
}

export function mapRosterCalendarToUi(data: RosterCalendarApi): RosterRecord[] {
  return (data.employees ?? []).map((emp) => ({
    id: emp.id,
    employeeId: emp.code,
    employeeName: emp.name,
    employeeCode: emp.code,
    department: emp.department ?? '—',
    designation: '—',
    team: '—',
    workingDays: Object.keys(emp.shifts ?? {}).length,
    weekOffs: 0,
    shifts: emp.shifts ?? {},
  }));
}

export interface MatrixPageEmployee {
  id: string;
  name: string;
  department: string;
  designation?: string;
  attendance: Record<string, { status: string; history: unknown[] }>;
}

export function mapMatrixGridToPageData(grid: MatrixGridApi): MatrixPageEmployee[] {
  return (grid.rows ?? []).map((row) => {
    const attendance: MatrixPageEmployee['attendance'] = {};
    row.days.forEach((cell) => {
      attendance[cell.date] = {
        status: cell.cell_code ?? cell.status_code ?? 'MR',
        history: [],
      };
    });
    return {
      id: row.employee_code,
      name: row.full_name,
      department: row.department ?? '—',
      designation: row.designation ?? undefined,
      attendance,
    };
  });
}
