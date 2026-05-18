import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  History, 
  Calendar,
  Plus,
  Info,
  Clock,
  ArrowRight,
  Database,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { ImportHistory } from "./ExcelImport/types";
import { ImportHistoryTable } from "./ExcelImport/ImportHistoryTable";
import { ImportWizardModal } from "./ExcelImport/ImportWizardModal";

export function ExcelImportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Mock History
  const [history, setHistory] = useState<ImportHistory[]>([
    { id: "1", fileName: "June_Attendance.xlsx", uploadedDate: "2026-06-01T10:00:00Z", uploadedBy: "Admin User", importerType: "Attendance", status: "COMPLETED" },
    { id: "2", fileName: "New_Hires_Batch_A.xlsx", uploadedDate: "2026-06-05T14:30:00Z", uploadedBy: "HR Manager", importerType: "Add Employee Importer", status: "FAILED" },
    { id: "3", fileName: "Salary_Revisions.xlsx", uploadedDate: "2026-06-10T09:15:00Z", uploadedBy: "Payroll Admin", importerType: "Add / Revise Salary", status: "COMPLETED" },
  ]);

  const handleImportComplete = (data: any) => {
    // Add to history (simulated)
    const newEntry: ImportHistory = {
      id: Date.now().toString(),
      fileName: data.file?.name || "unnamed_file.xlsx",
      uploadedDate: new Date().toISOString(),
      uploadedBy: "Admin User",
      importerType: data.importer?.label || "Unknown",
      status: "COMPLETED"
    };
    setHistory(prev => [newEntry, ...prev]);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background/30">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border bg-card/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-foreground tracking-tight uppercase flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Excel Data Importer
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            Enterprise data migration and bulk update utility
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary/50 rounded-xl border border-border mr-2">
            <Calendar className="w-4 h-4 text-primary" />
            <Input 
              type="month" 
              value={payrollMonth} 
              onChange={(e) => setPayrollMonth(e.target.value)} 
              className="h-8 w-32 border-none bg-transparent text-xs font-bold p-0 focus-visible:ring-0" 
            />
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-6 rounded-2xl bg-primary text-white hover:opacity-90 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Import
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          {/* History Section - Now at Top */}
          <div className="space-y-6" id="import-history">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Data Import Logs
                </h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  Detailed audit trail of all historical data migrations
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  Filter History
                </Button>
                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                  Export Log
                </Button>
              </div>
            </div>

            <ImportHistoryTable history={history} />
          </div>

          <div className="p-8 rounded-[2.5rem] bg-secondary/20 border border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-black text-foreground uppercase tracking-tight">Security & Validation</p>
                <p className="text-xs font-medium text-muted-foreground">All imports undergo a multi-step verification process to ensure data integrity.</p>
              </div>
            </div>
            <div className="flex items-center gap-8 px-8">
               <div className="text-center">
                 <p className="text-xl font-black text-foreground">1,240</p>
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Imports</p>
               </div>
               <div className="h-8 w-px bg-border" />
               <div className="text-center">
                 <p className="text-xl font-black text-emerald-500">98.2%</p>
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Success Rate</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Wizard Modal */}
      <ImportWizardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onComplete={handleImportComplete}
        payrollMonth={payrollMonth}
      />
    </div>
  );
}
