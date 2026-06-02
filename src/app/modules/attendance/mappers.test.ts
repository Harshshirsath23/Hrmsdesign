import { describe, expect, it } from 'vitest';
import {
  mapDashboardSummaryToMetrics,
  mapRosterCalendarToUi,
  mapWhoIsInSummaryToStats,
} from './mappers';
import type { DashboardSummaryApi, RosterCalendarApi, WhoIsInSummaryApi } from './apiTypes';

describe('attendance mappers', () => {
  it('maps dashboard summary metrics', () => {
    const summary: DashboardSummaryApi = {
      avg_work_hours: 8.5,
      total_present: 20,
      total_absent: 2,
      total_holidays: 1,
      total_late_logins: 3,
    };
    const metrics = mapDashboardSummaryToMetrics(summary);
    expect(metrics.avgWorkHours).toBe(8.5);
    expect(metrics.totalAbsent).toBe(2);
    expect(metrics.lateLogins).toBe(3);
  });

  it('maps who-is-in summary stats', () => {
    const api: WhoIsInSummaryApi = {
      summary: { on_time: 5, late_arrivals: 2, not_yet_in: 1, out_of_office: 3 },
    };
    expect(mapWhoIsInSummaryToStats(api)).toEqual({
      onTime: 5,
      lateIn: 2,
      notYetIn: 1,
      onLeave: 0,
      outOfOffice: 3,
    });
  });

  it('maps roster calendar using employee UUID for assignments', () => {
    const api: RosterCalendarApi = {
      month: 5,
      year: 2026,
      cycle_id: 'cycle-1',
      employees: [
        {
          id: 'emp-uuid-1',
          name: 'Jane Doe',
          code: 'E001',
          department: 'Engineering',
          shifts: { '2026-05-01': 'GEN' },
        },
      ],
    };
    const rows = mapRosterCalendarToUi(api);
    expect(rows[0].employeeId).toBe('emp-uuid-1');
    expect(rows[0].employeeCode).toBe('E001');
    expect(rows[0].shifts['2026-05-01']).toBe('GEN');
  });
});
