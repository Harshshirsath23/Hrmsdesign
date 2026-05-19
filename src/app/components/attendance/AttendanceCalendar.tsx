import { useMemo, useState } from "react";
import { attendanceDataset, useAttendanceStore } from "../../modules/attendance/store";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_STYLES: Record<string, string> = {
  Present: "bg-white text-black border-neutral-300",
  Absent: "bg-red-50 text-red-700 border-red-200",
  "Half Day": "bg-amber-50 text-amber-700 border-amber-200",
  Leave: "bg-neutral-100 text-neutral-700 border-neutral-200",
  Holiday: "bg-neutral-100 text-neutral-700 border-neutral-200",
  "Week Off": "bg-neutral-200 text-neutral-700 border-neutral-300",
};

export function AttendanceCalendar({
  employeeId,
}: {
  employeeId?: string;
}) {
  const { setSelectedDate } = useAttendanceStore();

  const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth()
  );

  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear()
  );

  const records = attendanceDataset.records.filter(
    (record) => !employeeId || record.employeeId === employeeId
  );

  const totalDays = new Date(
    selectedYear,
    selectedMonth + 1,
    0
  ).getDate();

  const firstDay = new Date(
    selectedYear,
    selectedMonth,
    1
  ).getDay();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const years = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => 2024 + i);
  }, []);

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-black">
            Attendance Calendar
          </h2>
          <p className="text-sm text-neutral-500">
            View monthly attendance records
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium outline-none transition focus:border-black"
          >
            {MONTHS.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium outline-none transition focus:border-black"
          >
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Week Header */}
      <div className="mb-2 grid grid-cols-7">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-neutral-200">
        {calendarDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={index}
                className="min-h-[120px] border border-neutral-100 bg-neutral-50"
              />
            );
          }

          const formattedDay = String(day).padStart(2, "0");

          const formattedMonth = String(selectedMonth + 1).padStart(2, "0");

          const date = `${selectedYear}-${formattedMonth}-${formattedDay}`;

          const record = records.find((item) => item.date === date);

          const isToday =
            currentDate.getDate() === day &&
            currentDate.getMonth() === selectedMonth &&
            currentDate.getFullYear() === selectedYear;

          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className="group min-h-[120px] border border-neutral-100 bg-white p-3 text-left transition-all hover:bg-neutral-50"
            >
              {/* Day Number */}
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    isToday
                      ? "bg-black text-white"
                      : "text-black"
                  }`}
                >
                  {day}
                </span>

                {record && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[record.status]}`}
                  >
                    {record.status}
                  </span>
                )}
              </div>

              {/* Working Hours */}
              {record ? (
                <div className="mt-4">
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-neutral-500">
                      Working Hours
                    </p>

                    <p className="mt-1 text-lg font-semibold text-black">
                      {record.workHours}h
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex items-center justify-center">
                  <span className="text-xs text-neutral-300">—</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}