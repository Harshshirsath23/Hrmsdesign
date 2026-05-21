import { MyAttendanceModule } from "./my-attendance/MyAttendanceModule";

export function MyAttendancePanel({ employeeId }: { employeeId: string }) {
  return (
    <div className="p-4 md:p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50 attendance-theme-neutral">
      <div className="relative">
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <MyAttendanceModule employeeId={employeeId || "EMP001"} />
        </div>
      </div>
    </div>
  );
}

