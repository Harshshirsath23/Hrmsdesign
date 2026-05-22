import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  List, 
  ClipboardCheck, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

interface FiltersProps {
  view: "calendar" | "list" | "regularization";
  onViewChange: (view: "calendar" | "list" | "regularization") => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function Filters({ 
  view, 
  onViewChange, 
  currentDate, 
  onDateChange, 
  searchTerm, 
  onSearchChange,
}: FiltersProps) {
  
  const handlePrevMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    onDateChange(new Date(2026, 4, 12)); // Mock today
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl">
      <div className="flex items-center gap-3">
        {/* View Switcher */}
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl">
          {[
            { id: "calendar", icon: CalendarIcon, label: "Calendar" },
            { id: "list", icon: List, label: "List" },
            { id: "regularization", icon: ClipboardCheck, label: "Regularization" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                view === v.id 
                  ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <v.icon size={14} />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>

        {/* Date Navigator */}
        {view !== "regularization" && (
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-2xl">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="text-sm font-black text-foreground min-w-[120px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </h3>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <ChevronRight size={16} />
            </button>
            <div className="w-[1px] h-4 bg-foreground/10 mx-1" />
            <button 
              onClick={handleToday}
              className="px-3 py-1.5 text-[10px] font-black hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all uppercase tracking-widest"
            >
              Today
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Search */}
        <div className="relative flex-1 md:flex-none">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search date, status, shift..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full md:w-64 pl-12 pr-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border-none text-xs font-bold focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* AI Insights removed per request */}
      </div>
    </div>
  );
}
