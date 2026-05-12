import { useState } from "react";
import { attendanceDataset, requestBadgeClass } from "../../modules/attendance/store";
import { AttendanceCalendar } from "./AttendanceCalendar";

export function MyAttendancePanel({ employeeId }: { employeeId: string }) {
  const [requestTab, setRequestTab] = useState<"Regularization" | "Leave" | "Overtime" | "Comp-Off">("Regularization");
  const [view, setView] = useState<"list" | "calendar">("list");
  const rows = attendanceDataset.records.filter((entry) => entry.employeeId === employeeId).slice(0, 20);
  const requests = attendanceDataset.requests.filter((entry) => entry.employeeId === employeeId && entry.type === requestTab);

  return (
    <div className="p-4 md:p-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#85B4BC] via-[#9DBFC8] to-[#A7AEB0] p-4 md:p-6">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl liquid-float" />
        <div className="absolute -bottom-20 right-10 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl liquid-drift" />
        <div className="absolute top-10 right-1/3 h-56 w-56 rounded-full bg-emerald-100/25 blur-3xl liquid-float" />
        <div className="absolute inset-0 backdrop-blur-[10px]" />
        <div className="relative space-y-4">
      <div className="glass-shine bg-white/70 border border-white/45 backdrop-blur-[30px] shadow-[0_14px_34px_rgba(15,23,42,0.12)] rounded-2xl p-4 transition-all duration-300 hover:bg-white/75">
        <h2 className="text-base font-semibold text-foreground">My Attendance</h2>
        <p className="text-xs text-muted-foreground mt-1">Switch between list and calendar view for your attendance timeline.</p>
      </div>
      <div className="glass-shine bg-white/70 border border-white/45 backdrop-blur-[30px] shadow-[0_14px_34px_rgba(15,23,42,0.12)] rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/75">
        <div className="p-3 flex items-center justify-between border-b border-white/40">
          <p className="text-sm font-semibold text-foreground">Attendance Records</p>
          <div className="flex gap-2">
            <button
              onClick={() => setView("list")}
              className={`h-8 px-3 text-xs rounded-full border transition-all duration-200 ${view === "list" ? "bg-white/95 border-white text-foreground shadow-[0_6px_16px_rgba(255,255,255,0.35)]" : "border-white/60 text-muted-foreground hover:bg-white/65"}`}
            >
              List View
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`h-8 px-3 text-xs rounded-full border transition-all duration-200 ${view === "calendar" ? "bg-white/95 border-white text-foreground shadow-[0_6px_16px_rgba(255,255,255,0.35)]" : "border-white/60 text-muted-foreground hover:bg-white/65"}`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {view === "list" ? (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/45">
                <tr>
                  {["Date", "First In", "Last Out", "Work Hours", "Late", "Status"].map((head) => (
                    <th key={head} className="p-3 text-left text-xs text-muted-foreground">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-white/40 hover:bg-white/45 transition-colors">
                    <td className="p-3">{row.date}</td>
                    <td className="p-3">{row.firstIn}</td>
                    <td className="p-3">{row.lastOut}</td>
                    <td className="p-3">{row.workHours.toFixed(1)}</td>
                    <td className="p-3">{row.lateMins}m</td>
                    <td className="p-3">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AttendanceCalendar employeeId={employeeId} />
        )}
      </div>

      <div className="glass-shine bg-white/70 border border-white/45 backdrop-blur-[30px] shadow-[0_14px_34px_rgba(15,23,42,0.12)] rounded-2xl p-4 transition-all duration-300 hover:bg-white/75">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            {(["Regularization", "Leave", "Overtime", "Comp-Off"] as const).map((entry) => (
              <button key={entry} onClick={() => setRequestTab(entry)} className={`h-8 px-3 rounded-full text-xs border transition-all duration-200 ${requestTab === entry ? "bg-white/90 border-white text-foreground" : "border-white/60 text-muted-foreground hover:bg-white/55"}`}>
                {entry}
              </button>
            ))}
          </div>
          <button className="h-8 px-4 rounded-full bg-white/90 border border-white text-foreground text-xs hover:bg-white transition-colors">Apply Request</button>
        </div>
        <div className="space-y-2">
          {requests.map((row) => (
            <div key={row.id} className="rounded-2xl border border-white/45 bg-white/35 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground font-medium">{row.date}</p>
                <p className="text-xs text-muted-foreground">{row.reason}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 border rounded ${requestBadgeClass[row.status]}`}>{row.status}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
