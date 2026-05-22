export function Legend() {
  const items = [
    { label: "Present", color: "bg-emerald-500" },
    { label: "Absent", color: "bg-rose-500" },
    { label: "Half Day", color: "bg-orange-500" },
    { label: "Leave", color: "bg-amber-500" },
    { label: "Holiday", color: "bg-sky-500" },
    { label: "Week Off", color: "bg-slate-400" },
    { label: "Work From Home", color: "bg-purple-500" },
    { label: "Late In", color: "bg-rose-600" },
    { label: "Early Out", color: "bg-violet-500" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 p-6 rounded-[2rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`} />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
