import { MyAttendanceModule } from "./my-attendance/MyAttendanceModule";

export function MyAttendancePanel({ employeeId }: { employeeId: string }) {
  return (
    <div className="p-4 md:p-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="relative">
        {/* Floating Background Blobs for Liquid Glass Effect */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-emerald-200/30 dark:bg-emerald-900/10 blur-[100px] liquid-float" />
          <div className="absolute top-1/2 left-1/3 h-80 w-80 rounded-full bg-cyan-200/30 dark:bg-cyan-900/10 blur-[100px] liquid-drift" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-200/30 dark:bg-teal-900/10 blur-[100px] liquid-float" />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto">
          <MyAttendanceModule employeeId={employeeId || "EMP001"} />
        </div>
      </div>
    </div>
  );
}

