import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { attendanceDataset } from "../../modules/attendance/store";

export function AttendanceCharts() {
  const today = attendanceDataset.records.filter((r) => r.date === "2026-05-06");
  const pie = [
    { name: "Present", value: today.filter((x) => x.status === "Present").length, color: "#10B981" },
    { name: "Absent", value: today.filter((x) => x.status === "Absent").length, color: "#EF4444" },
    { name: "Leave", value: today.filter((x) => x.status === "Leave").length, color: "#6366F1" },
  ];
  const bar = [
    { name: "On-time", count: today.filter((x) => x.lateMins === 0).length },
    { name: "Late", count: today.filter((x) => x.lateMins > 0).length },
  ];
  const line = Array.from({ length: 10 }).map((_, i) => {
    const date = `2026-05-${String(i + 1).padStart(2, "0")}`;
    const rows = attendanceDataset.records.filter((x) => x.date === date);
    return { day: String(i + 1), avg: rows.reduce((s, x) => s + x.workHours, 0) / Math.max(1, rows.length) };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="flat-card bg-card p-3 h-56">
        <p className="text-xs font-semibold mb-2">Attendance Distribution</p>
        <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pie} dataKey="value">{pie.map((p) => <Cell key={p.name} fill={p.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
      </div>
      <div className="flat-card bg-card p-3 h-56">
        <p className="text-xs font-semibold mb-2">Late vs On-time</p>
        <ResponsiveContainer width="100%" height="100%"><BarChart data={bar}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#334155" /></BarChart></ResponsiveContainer>
      </div>
      <div className="flat-card bg-card p-3 h-56">
        <p className="text-xs font-semibold mb-2">Work Hours Trend</p>
        <ResponsiveContainer width="100%" height="100%"><LineChart data={line}><XAxis dataKey="day" /><YAxis /><Tooltip /><Line dataKey="avg" stroke="#111827" /></LineChart></ResponsiveContainer>
      </div>
    </div>
  );
}
