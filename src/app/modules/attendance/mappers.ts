import { format, parseISO } from 'date-fns';
import type {
  AttendanceRequestApiRecord,
  DashboardTrendPoint,
  DashboardWhosInResponse,
  MatrixEmployeeRow,
  MatrixGridResponse,
  SwipeLogApiRecord,
  WhoIsInEmployeeCard,
} from './apiTypes';
import type { AttendanceRequest, DailyAttendance, RosterRecord, SwipeLog } from './types';
import type { RosterCalendarMonthlyResponse } from './apiTypes';

/** API decimals often arrive as strings — normalize before .toFixed() in UI. */
function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value == null || value === '') return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function mapTrendToChartData(trendData: DashboardTrendPoint[]) {
  return trendData.map((point) => ({
    day: format(parseISO(point.date), 'dd MMM'),
    hours: (() => {
      const wh: unknown = point.work_hours;
      const num = typeof wh === 'number' ? wh : (wh == null ? 0 : Number(wh));
      return Number.isFinite(num) ? Number(num.toFixed(1)) : 0;
    })(),
    employees: point.status === 'Present' ? 1 : 0,
  }));
}

export function mapDashboardSummaryToMetrics(summary: {
  avg_work_hours?: number | string;
  total_present?: number | string;
  total_absent?: number | string;
  total_holidays?: number | string;
  total_late_logins?: number | string;
  total_employees?: number | string;
}) {
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
    totalEmployees: toNumber(summary.total_employees),
  };
}

export function mapWhosInToTodayStats(whosIn: DashboardWhosInResponse) {
  const total = whosIn.total_employee_count || 1;
  const present = whosIn.on_time_count + whosIn.late_in_count;
  return {
    overview: {
      present: {
        count: present,
        percentage: Math.round((present / total) * 100),
      },
      onLeave: { count: 0, percentage: 0 },
      absent: {
        count: whosIn.not_yet_in_count,
        percentage: Math.round((whosIn.not_yet_in_count / total) * 100),
      },
      late: {
        count: whosIn.late_in_count,
        percentage: Math.round((whosIn.late_in_count / total) * 100),
      },
      wfh: { count: 0, percentage: 0 },
    },
    whosIn: {
      onTime: whosIn.on_time_count,
      lateIn: whosIn.late_in_count,
      notYetIn: whosIn.not_yet_in_count,
      onLeave: 0,
      outOfOffice: 0,
    },
  };
}

export function mapMatrixRowToUi(row: MatrixEmployeeRow) {
  const attendance: Record<string, { status: string; is_locked?: boolean }> = {};
  for (const day of row.days) {
    const dateKey = typeof day.date === 'string' ? day.date : format(new Date(day.date), 'yyyy-MM-dd');
    attendance[dateKey] = {
      status: day.cell_code ?? 'MR',
      is_locked: day.is_locked,
    };
  }
  return {
    id: row.employee_id,
    code: row.employee_code,
    name: row.full_name,
    department: row.department ?? '',
    designation: row.designation ?? '',
    attendance,
    summary: row.summary,
    avatar_initials: row.avatar_initials,
  };
}

export function mapMatrixGridToUi(grid: MatrixGridResponse) {
  return {
    employees: grid.rows.map(mapMatrixRowToUi),
    meta: grid.meta,
    monthDays: grid.meta.dates.map((d) => parseISO(d.date)),
  };
}

export function mapWhoIsInCardToDailyAttendance(
  card: WhoIsInEmployeeCard,
  dateStr: string,
): Partial<DailyAttendance> {
  const status =
    card.presence_state === 'IN'
      ? card.is_late
        ? 'Present'
        : 'Present'
      : card.work_status_label === 'Leave'
        ? 'Leave'
        : 'Absent';

  return {
    id: card.employee_id,
    employeeId: card.employee_code ?? card.employee_id,
    employeeName: card.name,
    department: card.department ?? '',
    designation: card.designation ?? '',
    team: card.team ?? '',
    date: dateStr,
    status: status as DailyAttendance['status'],
    workMode: (card.work_mode as DailyAttendance['workMode']) ?? 'WFO',
    shiftName: card.shift ?? '',
    firstIn: card.login_time ? format(parseISO(card.login_time), 'HH:mm') : '',
    lastOut: '',
    workHours: 0,
    lateMins: card.is_late ? 15 : 0,
    earlyExitMins: 0,
    lop: 0,
    otMins: 0,
    exception: false,
    approvalPending: false,
    geoViolation: false,
    locked: false,
    isLate: card.is_late,
    isAbsent: card.presence_state !== 'IN',
    isHalfDay: false,
  };
}

export function mapSwipeLogApiToUi(log: SwipeLogApiRecord): SwipeLog {
  const punchTime = parseISO(log.punch_time);
  return {
    id: String(log.id),
    employeeId: log.employee_id,
    employeeName: log.employee_name,
    employeeCode: log.employee_code,
    department: log.department_name ?? '',
    designation: '',
    swipeTime: format(punchTime, 'HH:mm:ss'),
    swipeDate: format(punchTime, 'yyyy-MM-dd'),
    type: log.punch_type as SwipeLog['type'],
    shiftName: log.shift_name ?? '',
    // SwipeLogApiRecord doesn't expose shift timing directly, so keep safe default.
    shiftTiming: '',
    deviceName: log.device_id ?? 'Manual',
    deviceId: log.device_id ?? '',
    deviceType: mapPunchSourceToDeviceType(log.punch_source),
    accessCardId: '',
    branch: '',
    doorName: '',
    ipAddress: '',
    gpsCoordinates: '',
    receivedOn: log.received_at ?? log.punch_time,
    syncTime: log.created_at ?? log.punch_time,
    status: 'Approved',
    verificationMethod: mapPunchSourceToVerificationMethod(log.punch_source),
    spoofDetection: 'N/A',
    workMode: 'WFO',
  };
}


function mapPunchSourceToVerificationMethod(source: string): SwipeLog['verificationMethod'] {
  // Backend values seen in this app: BIOMETRIC | WEB | MANUAL (from mappers).
  // UI expects one of: Face | Fingerprint | Mobile GPS | QR Scan | Card Tap
  switch (source) {
    case 'BIOMETRIC':
      return 'Fingerprint';
    case 'WEB':
      return 'Mobile GPS';
    case 'MANUAL':
      return 'Card Tap';
    case 'QR':
      return 'QR Scan';
    case 'RFID':
      return 'Card Tap';
    default:
      return 'Fingerprint';
  }
}


function mapPunchSourceToDeviceType(source: string): SwipeLog['deviceType'] {
  switch (source) {
    case 'BIOMETRIC':
      return 'Biometric Device';
    case 'WEB':
      return 'Web Login';
    case 'MANUAL':
      return 'Web Login';
    default:
      return 'Biometric Device';
  }
}

export function mapAttendanceRequestApi(req: AttendanceRequestApiRecord): AttendanceRequest & {
  employeeName: string;
  department: string;
  designation: string;
  requestType: string;
  attendanceDate: string;
  submittedOn: string;
  managerStatus: string;
  adminStatus: string;
  punchIn?: string;
  punchOut?: string;
  workingHours?: string;
  managerRemarks?: string;
  adminRemarks?: string;
} {



  const managerStep = req.approval_workflow?.find((w) => w.stage?.toLowerCase().includes('manager'));
  const adminStep = req.approval_workflow?.find((w) => w.stage?.toLowerCase().includes('admin'));

  return {
    id: req.id,
    employeeId: req.employee.id,
    employeeName: req.employee.name,
    department: req.employee.department,
    designation: req.employee.designation,
    type: req.request_type_display as AttendanceRequest['type'],
    requestType: req.request_type_display,
    date: req.date,
    attendanceDate: req.attendance?.date ?? req.date,
    submittedOn: req.created_at,
    reason: req.reason,
    status: normalizeRequestStatus(req.final_status),
    managerStatus: normalizeRequestStatus(req.manager_status),
    adminStatus: normalizeRequestStatus(req.final_status ?? adminStep?.status ?? 'Pending'),
    oldValue: req.attendance?.punch_in,
    newValue: req.attendance?.punch_out,
    comments: adminStep?.comment,
    workflowStep: adminStep?.stage,
    punchIn: req.attendance?.punch_in,
    punchOut: req.attendance?.punch_out,
    workingHours: req.attendance?.working_hours,
    managerRemarks: managerStep?.comment,
    adminRemarks: adminStep?.comment,
  };
}


function normalizeRequestStatus(status: string): AttendanceRequest['status'] {
  const s = status?.toLowerCase();
  if (s === 'approved') return 'Approved';
  if (s === 'rejected') return 'Rejected';
  return 'Pending';
}

export function unwrapList<T>(data: T[] | { results: T[] }): T[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

/** Backend roster calendar uses id/name/code; legacy mocks used employee_* fields. */
export function mapRosterCalendarToUi(
  cal: RosterCalendarMonthlyResponse,
): RosterRecord[] {
  return (cal.employees ?? []).map((emp) => {
    const employeeId = String(emp.employee_id ?? (emp as { id?: string }).id ?? '');
    const employeeName = String(
      emp.employee_name ?? (emp as { name?: string }).name ?? employeeId,
    );
    const employeeCode = String(
      emp.employee_code ?? (emp as { code?: string }).code ?? '',
    );
    const rawShifts = emp.shifts ?? {};
    const shifts: Record<string, string> = {};
    for (const [dateKey, value] of Object.entries(rawShifts)) {
      if (typeof value === 'string') {
        shifts[dateKey] = value;
      } else if (value && typeof value === 'object') {
        shifts[dateKey] = (value as { shift_code?: string }).shift_code ?? 'OFF';
      }
    }
    const workingDays = Object.values(shifts).filter((c) => c && c !== 'OFF').length;
    const weekOffs = Object.values(shifts).filter((c) => c === 'OFF').length;
    return {
      id: employeeId,
      employeeId,
      employeeName,
      employeeCode,
      department: emp.department ?? '',
      designation: '',
      team: '',
      workingDays,
      weekOffs,
      shifts,
    };
  });
}
