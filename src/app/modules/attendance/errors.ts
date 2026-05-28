import { AttendanceApiError } from '../../../api/attendanceClient';

/** User-facing message for attendance query/mutation failures. */
export function formatAttendanceError(error: unknown): string {
  if (error instanceof AttendanceApiError) {
    if (error.status === 401) {
      return 'Session expired. Please sign in again.';
    }
    if (error.status === 403) {
      return error.message || 'You do not have permission to view this data.';
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong while loading attendance data.';
}
