import { attendanceDataset, useAttendanceStore } from "../../modules/attendance/store";
import { attendanceSessions, punchLogsByDay } from "../../modules/attendance/mockData";

export function DayDetailsDrawer({ employeeId }: { employeeId?: string }) {
  const { selectedDate, setSelectedDate } = useAttendanceStore();
  if (!selectedDate) return null;

  const record = attendanceDataset.records.find(
    (entry) => entry.date === selectedDate && (!employeeId || entry.employeeId === employeeId),
  );
  const logs = punchLogsByDay[selectedDate] ?? [];
  const sessions = attendanceSessions.filter((entry) => entry.date === selectedDate && (!employeeId || entry.employeeId === employeeId));
  const approvals = attendanceDataset.requests.filter((entry) => entry.date === selectedDate && (!employeeId || entry.employeeId === employeeId));

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-end">
      <div className="w-full max-w-md h-full bg-card border-l border-border p-5 overflow-y-auto glassmorph-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Day Details</h3>
          <button onClick={() => setSelectedDate(null)} className="text-sm border border-border rounded px-2 py-1">Close</button>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{selectedDate}</p>
        {record ? (
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <p>Status: <span className="font-semibold">{record.status}</span></p>
              <p>First In: {record.firstIn} | Last Out: {record.lastOut}</p>
              <p>Work Minutes: {Math.round(record.workHours * 60)} | OT: {record.workHours > 9 ? Math.round((record.workHours - 9) * 60) : 0}</p>
              <p>Late: {record.lateMins}m | Early Exit: {record.earlyExitMins}m</p>
              <p>Grace Used: {record.lateMins > 10 ? "1/3" : "0/3"} | Policy: {record.shiftName} Shift | Payroll Lock: {record.locked ? "Locked" : "Open"}</p>
              <p>Exceptions: {attendanceDataset.exceptions.filter((entry) => entry.date === selectedDate).length}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold mb-2">Sessions Breakdown</p>
              {sessions.map((session) => (
                <p key={session.id} className="text-xs">{session.start} - {session.end} ({session.minutes} mins)</p>
              ))}
              {sessions.length === 0 && <p className="text-xs text-muted-foreground">No session blocks found.</p>}
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold mb-2">Punch Logs</p>
              <div className="space-y-2">
                {logs.length === 0 && <p className="text-muted-foreground">No punch logs for this date.</p>}
                {logs.map((log, index) => (
                  <p key={`${log.time}-${index}`} className="text-xs">{log.time} - {log.type} ({log.source})</p>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold mb-2">Approval History</p>
              {approvals.map((request) => (
                <p key={request.id} className="text-xs">{request.type}: {request.status} ({request.workflowStep || "In Progress"})</p>
              ))}
              {approvals.length === 0 && <p className="text-xs text-muted-foreground">No approvals on this date.</p>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No attendance data found for selected date.</p>
        )}
      </div>
    </div>
  );
}
