import { attendanceDataset } from "../../modules/attendance/store";

export function AttendanceSummaryCards() {
  const today = "2026-05-06";
  const todayRecords = attendanceDataset.records.filter((record) => record.date === today);
  const cards = [
    { label: "Present Today", value: todayRecords.filter((r) => r.status === "Present").length },
    { label: "Absent Today", value: todayRecords.filter((r) => r.status === "Absent").length },
    { label: "On Leave", value: todayRecords.filter((r) => r.status === "Leave").length },
    { label: "Late Logins", value: todayRecords.filter((r) => r.lateMins > 0).length },
    { label: "Half Days", value: todayRecords.filter((r) => r.status === "Half Day").length },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="flat-card bg-card p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{card.label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
