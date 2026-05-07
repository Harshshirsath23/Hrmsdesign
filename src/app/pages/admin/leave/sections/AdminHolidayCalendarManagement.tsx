import { useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { HolidayCalendarView } from "../../../../components/leaves/HolidayCalendarView";
import { useUpcomingHolidays } from "../../../../modules/leaves/useLeaves";

export function AdminHolidayCalendarManagement() {
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const year = new Date().getFullYear();
  const holidaysQ = useUpcomingHolidays(year);

  const stats = useMemo(() => {
    const total = holidaysQ.data.length;
    const optional = holidaysQ.data.filter((h) => h.is_optional).length;
    return { total, optional };
  }, [holidaysQ.data]);

  return (
    <div className="space-y-5">
      <div className="flat-card bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              Holiday Calendar Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure year holidays, optional holidays, and calendar publishing.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                Year: {year}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                Total: {stats.total}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                Optional: {stats.optional}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-secondary border border-border text-foreground hover:bg-background transition-colors"
              onClick={() => setView((v) => (v === "calendar" ? "list" : "calendar"))}
            >
              {view === "calendar" ? "List view" : "Calendar view"}
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-foreground text-primary-foreground hover:bg-accent transition-colors inline-flex items-center gap-2"
              onClick={() => alert("CRUD drawer is next (add/edit holidays).")}
            >
              <Plus className="w-4 h-4" />
              Add Holiday
            </button>
          </div>
        </div>
      </div>

      {view === "calendar" ? (
        <HolidayCalendarView holidays={holidaysQ.data} initialYear={year} />
      ) : (
        <div className="flat-card bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Yearly List</p>
            <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
              {holidaysQ.data.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {holidaysQ.data
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((h) => (
                <div key={h.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-secondary transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{h.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{h.holiday_type} · {h.date}</p>
                  </div>
                  <span className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-md border",
                    h.is_optional ? "bg-secondary text-muted-foreground border-border" : "bg-foreground text-primary-foreground border-border",
                  )}>
                    {h.is_optional ? "Optional" : "Mandatory"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

