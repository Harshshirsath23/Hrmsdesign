import { attendanceDataset, useAttendanceStore } from "../../modules/attendance/store";

const STATUS_CLASS: Record<string, string> = {
  Present: "bg-emerald-100 text-emerald-800",
  Absent: "bg-rose-100 text-rose-700",
  "Half Day": "bg-amber-100 text-amber-800",
  Leave: "bg-indigo-100 text-indigo-700",
  Holiday: "bg-sky-100 text-sky-700",
  "Week Off": "bg-slate-200 text-slate-700",
};

export function AttendanceCalendar({ employeeId }: { employeeId?: string }) {
  const { setSelectedDate } = useAttendanceStore();
  const records = attendanceDataset.records.filter((record) => !employeeId || record.employeeId === employeeId);
  const days = Array.from({ length: 31 }).map((_, index) => String(index + 1).padStart(2, "0"));

  return (
    <div className="bg-white/35 border border-white/45 backdrop-blur-[22px] rounded-2xl p-4">
      <p className="text-sm font-semibold text-foreground mb-3">May 2026 Calendar</p>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const date = `2026-05-${day}`;
          const record = records.find((item) => item.date === date);
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              title={record ? `${record.firstIn} - ${record.lastOut} | ${record.workHours}h` : "No record"}
              className="rounded-xl border border-white/50 bg-white/30 p-2 text-left hover:bg-white/45 transition-all duration-200"
            >
              <p className="text-xs text-muted-foreground">{day}</p>
              {record ? (
                <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_CLASS[record.status]}`}>
                  {record.status}
                </span>
              ) : (
                <span className="inline-flex mt-1 px-2 py-0.5 rounded text-[11px] bg-secondary text-muted-foreground">
                  —
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
