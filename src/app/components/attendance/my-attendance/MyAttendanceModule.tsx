import { useState, useMemo } from "react";
import { isSameMonth, parseISO } from "date-fns";
import { SummaryCards } from "./SummaryCards";
import { Filters } from "./Filters";
import { CalendarView } from "./CalendarView";
import { ListView } from "./ListView";
import { RegularizationTab } from "./RegularizationTab";
import { SwipeDetailsDrawer } from "./SwipeDetailsDrawer";
import { AttendanceCharts } from "./AttendanceCharts";
import { Legend } from "./Legend";
import { calculateMetrics } from "./utils";
import { DailyAttendance } from "../../../modules/attendance/types";
import { attendanceDataset } from "../../../modules/attendance/store";
import { motion, AnimatePresence } from "motion/react";

interface MyAttendanceModuleProps {
  employeeId: string;
  title?: string;
  subtitle?: string;
  readOnly?: boolean;
  showTitle?: boolean;
}

export function MyAttendanceModule({
  employeeId,
  title = "My Attendance",
  subtitle = "Track your work hours, presence, and punctuality insights.",
  readOnly = false,
  showTitle = true,
}: MyAttendanceModuleProps) {
  const [view, setView] = useState<"calendar" | "list" | "regularization">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Default to May 2026
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const [selectedDateForRegularize, setSelectedDateForRegularize] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<DailyAttendance | null>(null);

  // Filter records for the current employee and selected month
  const employeeRecords = useMemo(() => {
    let records = attendanceDataset.records.filter(r => r.employeeId === employeeId);

    // Filter by month/year unless in regularization tab where we might need historical data
    if (view !== "regularization") {
      records = records.filter(r => isSameMonth(parseISO(r.date), currentDate));
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      records = records.filter(r =>
        r.date.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        (r.shiftName && r.shiftName.toLowerCase().includes(s)) ||
        (r.workMode && r.workMode.toLowerCase().includes(s)) ||
        (r.exceptionType && r.exceptionType.toLowerCase().includes(s))
      );
    }

    return records;
  }, [employeeId, currentDate, searchTerm, view]);

  const metrics = useMemo(() => calculateMetrics(employeeRecords), [employeeRecords]);

  const handleRegularize = (date: string) => {
    setSelectedDateForRegularize(date);
    setView("regularization");
  };

  const handleSwipeDetails = (record: DailyAttendance) => {
    setSelectedRecord(record);
    setIsSwipeOpen(true);
  };

  return (
    <div className="attendance-workspace space-y-7 pb-12">
      {showTitle ? (
        <div className="attendance-hero flex items-center justify-between">
          <div>
            <p className="attendance-kicker">Attendance intelligence</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground font-medium mt-2 max-w-2xl">{subtitle}</p>
          </div>
        </div>
      ) : null}

      {/* Summary Cards */}
      <SummaryCards metrics={metrics} />

      {/* Filters & View Switcher */}
      <div className="sticky top-4 z-50 attendance-sticky-tools">
        <Filters
          view={view}
          onViewChange={(newView) => {
            setView(newView);
            if (newView !== "regularization") setSelectedDateForRegularize(null);
          }}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {employeeRecords.length > 0 || view === "regularization" ? (
            <motion.div
              key={view + currentDate.getTime()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {view === "calendar" ? (
                <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 items-start">
                  <div className="w-full">
                    <CalendarView
                      records={employeeRecords}
                      currentDate={currentDate}
                      searchTerm={searchTerm}
                      onRegularize={handleRegularize}
                      onSwipeDetails={handleSwipeDetails}
                    />
                  </div>
                  <div className="w-full lg:sticky lg:top-[90px] space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="attendance-section-icon p-2 bg-[#6366F1]/10 rounded-2xl shadow-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3v18h18" />
                          <path d="m19 9-5 5-4-4-3 3" />
                        </svg>
                      </div>
                      <h2 className="text-lg font-semibold text-foreground tracking-tight">Performance Analytics</h2>
                    </div>
                    <AttendanceCharts records={employeeRecords} />
                  </div>
                </div>
              ) : view === "list" ? (
                <ListView
                  records={employeeRecords}
                  onSwipeDetails={handleSwipeDetails}
                  onRegularize={handleRegularize}
                  readOnly={readOnly}
                />
              ) : (
                <RegularizationTab
                  records={attendanceDataset.records.filter(r => r.employeeId === employeeId)}
                  initialDate={selectedDateForRegularize}
                  readOnly={readOnly}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
                className="attendance-empty flex flex-col items-center justify-center py-20"
            >
              <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-4 attendance-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground">No attendance records found</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
                We couldn't find any attendance logs for the selected period. Please try adjusting your filters or contact HR if you believe this is an error.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      {view !== "regularization" && <Legend />}

      {/* Analytics & Trends Section */}
      {view !== "regularization" && view !== "calendar" && (
        <div className="attendance-analytics pt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="attendance-section-icon p-2.5 rounded-2xl shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
            </div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Performance Analytics</h2>
          </div>
          <AttendanceCharts records={employeeRecords} />
        </div>
      )}

      {/* Modals & Drawers */}
      {/* AI Insights modal removed */}
      <SwipeDetailsDrawer
        isOpen={isSwipeOpen}
        onOpenChange={setIsSwipeOpen}
        record={selectedRecord}
      />
    </div>
  );
}
