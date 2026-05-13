import { Search, Filter, RefreshCcw, X } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { cn } from "../../ui/utils";
import { MOCK_DEPARTMENTS, MOCK_DESIGNATIONS, MOCK_TEAMS, MOCK_SHIFTS } from "../../../modules/attendance/mockData";

interface AttendanceFilterPanelProps {
  filters: any;
  setFilters: (filters: any) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function AttendanceFilterPanel({ filters, setFilters, onRefresh, isRefreshing }: AttendanceFilterPanelProps) {
  const updateFilter = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      date: filters.date, // Keep the selected date
      shift: "all",
      department: "all",
      designation: "all",
      team: "all",
      workMode: "all",
      search: "",
    });
  };

  return (
    <div className="w-full lg:w-[300px] flex-shrink-0">
      <div className={cn(
        "bg-white/75 dark:bg-white/5 backdrop-blur-xl border border-black/[0.08] dark:border-white/10 rounded-[10px] shadow-sm flex flex-col sticky top-24 max-h-[calc(100vh-120px)] transition-all duration-300"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-black/[0.05] dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Filters</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5 rounded-full", isRefreshing && "animate-spin")}
            onClick={onRefresh}
          >
            <RefreshCcw className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>

        {/* Scrollable Filter Area */}
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar">
          {/* Search Employee */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Search Employee</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-9 h-10 bg-black/5 dark:bg-white/5 border-transparent focus:bg-transparent focus:border-primary/30 rounded-lg text-sm" 
                placeholder="Name or ID..." 
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
              />
            </div>
          </div>

          {/* Shift */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Shift</label>
            <Select value={filters.shift} onValueChange={(v) => updateFilter("shift", v)}>
              <SelectTrigger className="h-10 bg-black/5 dark:bg-white/5 border-transparent focus:ring-1 focus:ring-primary/30 rounded-lg text-sm">
                <SelectValue placeholder="All Shifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                {MOCK_SHIFTS.map(s => <SelectItem key={s} value={s}>{s.split('(')[0]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Department</label>
            <Select value={filters.department} onValueChange={(v) => updateFilter("department", v)}>
              <SelectTrigger className="h-10 bg-black/5 dark:bg-white/5 border-transparent focus:ring-1 focus:ring-primary/30 rounded-lg text-sm">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {MOCK_DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Work Mode */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Work Mode</label>
            <Select value={filters.workMode} onValueChange={(v) => updateFilter("workMode", v)}>
              <SelectTrigger className="h-10 bg-black/5 dark:bg-white/5 border-transparent focus:ring-1 focus:ring-primary/30 rounded-lg text-sm">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="WFO">WFO</SelectItem>
                <SelectItem value="WFH">WFH</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Field Work">Field Work</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Designation */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Designation</label>
            <Select value={filters.designation} onValueChange={(v) => updateFilter("designation", v)}>
              <SelectTrigger className="h-10 bg-black/5 dark:bg-white/5 border-transparent focus:ring-1 focus:ring-primary/30 rounded-lg text-sm">
                <SelectValue placeholder="All Designations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {MOCK_DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Team */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">Team</label>
            <Select value={filters.team} onValueChange={(v) => updateFilter("team", v)}>
              <SelectTrigger className="h-10 bg-black/5 dark:bg-white/5 border-transparent focus:ring-1 focus:ring-primary/30 rounded-lg text-sm">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {MOCK_TEAMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/[0.05] dark:border-white/5 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
            onClick={clearFilters}
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
