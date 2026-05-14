import { useState } from "react";
import { HolidayCalendarView } from "../../../components/leaves/HolidayCalendarView";
import { HolidayListGrouped } from "../../../components/leaves/employee/HolidayListGrouped";
import { HolidayYearOverview } from "../../../components/leaves/employee/HolidayYearOverview";
import { cn } from "../../../components/ui/utils";
import { useEmployeeLeaveData } from "./EmployeeLeaveDataContext";

const VIEWS = [
  { id: "list", label: "List" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
] as const;

export function EmployeeLeaveHolidaysPage() {
  const { holidays, year } = useEmployeeLeaveData();
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>("list");

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Holiday calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            List, monthly grid, and yearly overview with optional holiday styling.
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-secondary/50 p-1">
          {VIEWS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setView(t.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                view === t.id
                  ? "border border-border bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {view === "list" && <HolidayListGrouped holidays={holidays} />}
      {view === "month" && <HolidayCalendarView holidays={holidays} initialYear={year} />}
      {view === "year" && <HolidayYearOverview holidays={holidays} year={year} />}
    </div>
  );
}
