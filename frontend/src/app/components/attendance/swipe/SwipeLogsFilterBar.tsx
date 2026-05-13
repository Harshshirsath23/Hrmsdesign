import { Search, Calendar as CalendarIcon, ChevronDown, Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { cn } from "../../ui/utils";
import { MOCK_DEPARTMENTS, MOCK_DESIGNATIONS, MOCK_TEAMS } from "../../../modules/attendance/mockData";
import { format } from "date-fns";

interface SwipeLogsFilterBarProps {
  filters: any;
  setFilters: (filters: any) => void;
}

export function SwipeLogsFilterBar({ filters, setFilters }: SwipeLogsFilterBarProps) {
  const updateFilter = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-3 shadow-sm transition-all duration-300">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="relative w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            className="pl-9 h-10 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 rounded-xl text-xs font-medium shadow-inner transition-all" 
            placeholder="Search by Employee, ID or Device..." 
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

        {/* Filters Group */}
        <div className="flex-1 flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <Button variant="outline" className="h-10 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-xs font-bold gap-2 text-slate-600 dark:text-slate-400">
            <CalendarIcon className="w-3.5 h-3.5" />
            {format(filters.dateRange.from, "dd MMM")} - {format(filters.dateRange.to, "dd MMM")}
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>

          {/* Department */}
          <Select value={filters.department} onValueChange={(v) => updateFilter("department", v)}>
            <SelectTrigger className="h-10 w-[160px] bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {MOCK_DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Device Type */}
          <Select value={filters.device} onValueChange={(v) => updateFilter("device", v)}>
            <SelectTrigger className="h-10 w-[140px] bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">
              <SelectValue placeholder="Device Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Biometric Device">Biometric</SelectItem>
              <SelectItem value="Mobile App">Mobile App</SelectItem>
              <SelectItem value="Web Login">Web Portal</SelectItem>
              <SelectItem value="QR Attendance">QR Scan</SelectItem>
            </SelectContent>
          </Select>

          {/* Swipe Type */}
          <Select value={filters.type} onValueChange={(v) => updateFilter("type", v)}>
            <SelectTrigger className="h-10 w-[100px] bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">IN/OUT</SelectItem>
              <SelectItem value="IN">Punch IN</SelectItem>
              <SelectItem value="OUT">Punch OUT</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-600 transition-all">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-9 px-4 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-lg" onClick={() => setFilters({
            search: "",
            department: "all",
            designation: "all",
            team: "all",
            location: "all",
            device: "all",
            type: "all",
            dateRange: { from: new Date(2026, 4, 11), to: new Date(2026, 4, 11) },
          })}>
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            RESET
          </Button>
        </div>
      </div>
    </div>
  );
}
