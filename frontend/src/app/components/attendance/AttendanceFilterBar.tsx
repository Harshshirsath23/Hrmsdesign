import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { MOCK_DEPARTMENTS, MOCK_DESIGNATIONS, MOCK_TEAMS } from "../../modules/attendance/mockData";

interface AttendanceFilterBarProps {
  filters: {
    month: string;
    year: string;
    department: string;
    designation: string;
    team: string;
    search: string;
  };
  setFilters: (filters: any) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const YEARS = ["2023", "2024", "2025", "2026"];

export function AttendanceFilterBar({ filters, setFilters }: AttendanceFilterBarProps) {
  const updateFilter = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
      {/* Month Selector */}
      <div className="space-y-1.5 flex-1 min-w-[140px]">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Month</label>
        <Select value={filters.month} onValueChange={(v) => updateFilter("month", v)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year Selector */}
      <div className="space-y-1.5 flex-1 min-w-[100px]">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Year</label>
        <Select value={filters.year} onValueChange={(v) => updateFilter("year", v)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Department Dropdown */}
      <div className="space-y-1.5 flex-1 min-w-[160px]">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Department</label>
        <Select value={filters.department} onValueChange={(v) => updateFilter("department", v)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {MOCK_DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Dropdown */}
      <div className="space-y-1.5 flex-1 min-w-[160px]">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Team</label>
        <Select value={filters.team} onValueChange={(v) => updateFilter("team", v)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {MOCK_TEAMS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Designation Dropdown */}
      <div className="space-y-1.5 flex-1 min-w-[160px]">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Designation</label>
        <Select value={filters.designation} onValueChange={(v) => updateFilter("designation", v)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All Designations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Designations</SelectItem>
            {MOCK_DESIGNATIONS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Search */}
      <div className="space-y-1.5 flex-[1.5] min-w-[200px]">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Employee Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 h-10" 
            placeholder="Search by name or ID..." 
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
