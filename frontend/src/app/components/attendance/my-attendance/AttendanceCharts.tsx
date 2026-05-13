import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import { DailyAttendance } from "../../../modules/attendance/types";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

interface AttendanceChartsProps {
  records: DailyAttendance[];
}

export function AttendanceCharts({ records }: AttendanceChartsProps) {
  const trendData = useMemo(() => {
    return records
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15) // Last 15 days
      .map(r => ({
        date: format(parseISO(r.date), "dd MMM"),
        hours: r.workHours || 0
      }));
  }, [records]);

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [records]);

  const COLORS = {
    Present: "#10b981",
    Absent: "#f43f5e",
    Leave: "#f59e0b",
    "Half Day": "#f97316",
    Holiday: "#0ea5e9",
    "Week Off": "#94a3b8",
    "Work From Home": "#a855f7"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Work Hours Trend */}
      <div className="p-8 rounded-[3.5rem] bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-white/10 backdrop-blur-xl shadow-xl">
        <h3 className="text-xl font-black text-foreground mb-8">Work Hours Trend</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
              <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 'black' }} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 'black' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'black' }}
              />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="#10b981" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorHours)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="p-8 rounded-[3.5rem] bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-white/10 backdrop-blur-xl shadow-xl flex flex-col items-center">
        <h3 className="text-xl font-black text-foreground mb-8 w-full">Status Mix</h3>
        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={distribution} 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={8} 
                dataKey="value"
              >
                {distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#94a3b8"} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-foreground">{records.length}</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Logs</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {distribution.map(d => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[d.name as keyof typeof COLORS] || "#94a3b8" }} />
              <span className="text-[10px] font-black text-muted-foreground uppercase">{d.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
