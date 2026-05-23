export function Legend() {
  const items = [
    { label: "Present", color: "attendance-dot-present" },
    { label: "Absent", color: "attendance-dot-absent" },
    { label: "Half Day", color: "attendance-dot-halfday" },
    { label: "Leave", color: "attendance-dot-holiday" },
    { label: "Holiday", color: "attendance-dot-holiday" },
    { label: "Week Off", color: "attendance-dot-weekoff" },
    { label: "Work From Home", color: "attendance-dot-present" },
    { label: "Late In", color: "attendance-dot-late" },
    { label: "Early Out", color: "attendance-dot-early" },
  ];

  return (
    <div className="attendance-legend flex flex-wrap items-center justify-center gap-6 p-5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`attendance-status-dot ${item.color}`} />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
