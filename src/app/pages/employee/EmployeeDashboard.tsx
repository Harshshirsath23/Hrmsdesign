import { ReactNode } from "react";
import {
  CalendarDays,
  ClipboardList,
  FolderOpen,
  Settings2,
  Crown,
} from "lucide-react";
const SIDEBAR_ITEMS = [CalendarDays, ClipboardList, FolderOpen, Crown, Settings2];
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI"];
const DATES = ["28", "29", "30", "31", "1", "2"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];
const EVENTS = [
  { day: 1, start: 0, span: 2, title: "Perkenalan tim", subtitle: "Finance", time: "08:00 - 10:00" },
  { day: 2, start: 1, span: 2, title: "Weekly Sync", subtitle: "Design", time: "09:15 - 10:45" },
  { day: 3, start: 0, span: 3, title: "Project Standup", subtitle: "Marketing", time: "08:00 - 10:30" },
  { day: 4, start: 2, span: 3, title: "Planning Review", subtitle: "HR", time: "10:00 - 12:30" },
  { day: 5, start: 0, span: 2, title: "Client Session", subtitle: "Ops", time: "08:00 - 10:00" },
];

function GlassCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`bg-white/70 border border-white/40 backdrop-blur-[30px] shadow-[0_16px_40px_rgba(15,23,42,0.12)] rounded-2xl ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export function EmployeeDashboard() {
  return (
    <div className="p-6 md:p-8">
      <div className="relative overflow-hidden rounded-3xl min-h-[calc(100vh-8.5rem)] p-4 md:p-8 bg-gradient-to-br from-[#85B4BC] via-[#9DBFC8] to-[#A7AEB0]">
        <div className="absolute inset-0 backdrop-blur-[6px]" />
        <div className="relative grid grid-cols-1 xl:grid-cols-[74px_minmax(0,1fr)_360px] gap-5">
          <GlassCard className="p-3 h-fit xl:h-[560px]">
            <nav className="flex xl:flex-col gap-3 justify-center">
              {SIDEBAR_ITEMS.map((Icon, idx) => (
                <button
                  key={idx}
                  className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 ease-in-out ${
                    idx === 0 ? "bg-white/55 text-slate-700" : "text-slate-500 hover:bg-white/40 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </nav>
          </GlassCard>

          <GlassCard className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 tracking-wide">2026</p>
                <h1 className="text-5xl md:text-6xl font-semibold text-slate-900 mt-2">Agustus</h1>
              </div>
              <button className="px-5 py-2 rounded-full text-sm bg-white/80 text-slate-700 hover:bg-white transition-all duration-200 ease-in-out">
                New Event
              </button>
            </div>

            <div className="mt-8">
              <div className="grid grid-cols-[72px_repeat(6,minmax(0,1fr))] gap-2 text-xs text-slate-500">
                <div />
                {DAYS.map((day, index) => (
                  <div key={day} className={index === 0 ? "text-left" : "text-center"}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-[72px_repeat(6,minmax(0,1fr))] gap-2 text-sm text-slate-700 mt-2">
                <div />
                {DATES.map((day, index) => (
                  <div key={day} className={index === 0 ? "text-left" : "text-center"}>{day}</div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-[72px_repeat(6,minmax(0,1fr))] gap-2">
                <div className="space-y-5 text-xs text-slate-500 pt-1">
                  {TIME_SLOTS.map((slot) => (
                    <p key={slot}>{slot}</p>
                  ))}
                </div>

                <div className="col-span-6 grid grid-cols-6 gap-2 relative min-h-[318px]">
                  {Array.from({ length: 6 }).map((_, col) => (
                    <div key={col} className="h-full rounded-xl bg-white/22 border border-white/20" />
                  ))}

                  {EVENTS.map((event) => (
                    <div
                      key={`${event.title}-${event.day}`}
                      className="absolute bg-white/72 border border-white/40 rounded-2xl p-3 shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                      style={{
                        left: `calc(${(event.day - 1) * (100 / 6)}% + 4px)`,
                        width: `calc(${100 / 6}% - 8px)`,
                        top: `${event.start * 52}px`,
                        height: `${event.span * 52 - 8}px`,
                      }}
                    >
                      <p className="text-xs font-medium text-slate-700">{event.title}</p>
                      <p className="text-[10px] text-sky-700 mt-1">{event.subtitle}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{event.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="space-y-5">
            <GlassCard className="p-6">
              <p className="text-sm font-semibold text-slate-800">Task Reminder</p>
              <p className="text-4xl/[1.12] font-medium text-slate-700 mt-4">
                Ultrices nisi amet ac lorem cumsan enim.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <button className="px-5 py-2 rounded-full border border-white/60 bg-white/55 text-sm text-slate-700 hover:bg-white/80 transition-all duration-200 ease-in-out">
                  Snooze
                </button>
                <button className="px-5 py-2 rounded-full border border-white/60 bg-white/55 text-sm text-slate-700 hover:bg-white/80 transition-all duration-200 ease-in-out">
                  Mark as Completed
                </button>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-4xl font-medium text-slate-800">To-do list</h2>
              <label className="flex items-start gap-3 mt-5">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-white/60 bg-white/60" />
                <span className="text-2xl/[1.35] text-slate-700">
                  Justo non faucibus dictumst sed sem quis in etiam eget. Ultrices nisi amet accumsan enim.
                </span>
              </label>

              <div className="grid grid-cols-[1fr_96px] gap-3 mt-5">
                <img
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop"
                  alt="discussion visual"
                  className="h-44 w-full object-cover rounded-2xl"
                />
                <img
                  src="https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=600&auto=format&fit=crop"
                  alt="task preview"
                  className="h-44 w-full object-cover rounded-2xl"
                />
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <button className="px-5 py-2 rounded-full border border-white/60 bg-white/55 text-sm text-slate-700 hover:bg-white/80 transition-all duration-200 ease-in-out">
                  See Discussion
                </button>
                <button className="px-5 py-2 rounded-full border border-white/60 bg-white/55 text-sm text-slate-700 hover:bg-white/80 transition-all duration-200 ease-in-out">
                  Due: Today
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
