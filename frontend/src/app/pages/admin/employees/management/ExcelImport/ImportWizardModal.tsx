import React, { useState, useMemo, useRef } from "react";
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft,
  Settings2,
  ShieldCheck,
  AlertTriangle,
  Info,
  Search,
  ChevronDown,
  ExternalLink,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../../../components/ui/utils";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "../../../../../components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "../../../../../components/ui/select";
import { Badge } from "../../../../../components/ui/badge";
import { Progress } from "../../../../../components/ui/progress";
import { IMPORTER_CATEGORIES } from "./ImporterConfig";
import { MappingField, ValidationPreview } from "./types";

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  payrollMonth: string;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

export function ImportWizardModal({ isOpen, onClose, onComplete, payrollMonth }: ImportWizardModalProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedImporterId, setSelectedImporterId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mappings, setMappings] = useState<MappingField[]>([]);
  const [validationPreview, setValidationPreview] = useState<ValidationPreview | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedImporter = useMemo(() => {
    for (const cat of IMPORTER_CATEGORIES) {
      const opt = cat.options.find(o => o.id === selectedImporterId);
      if (opt) return opt;
    }
    return null;
  }, [selectedImporterId]);

  // Step Handlers
  const handleNext = () => {
    if (step === 2) {
      // Auto-match logic simulation
      const mockMappings: MappingField[] = (selectedImporter?.requiredColumns || []).map(col => ({
        systemField: col,
        excelColumn: col, // Exact match simulation
        isMatched: true,
        isRequired: true
      }));
      setMappings(mockMappings);
      setStep(3);
    } else if (step === 3) {
      startValidation();
    } else if (step === 4) {
      setStep(5);
    } else {
      setStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as WizardStep);
  };

  const startValidation = () => {
    setIsProcessing(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setValidationPreview({
            totalRows: 250,
            validRows: 235,
            failedRows: 10,
            skippedRows: 5,
            errors: [
              { row: 15, column: "EmployeeID", message: "Duplicate record found in Excel", type: "ERROR" },
              { row: 42, column: "Date", message: "Effective date is in the past", type: "WARNING" },
              { row: 108, column: "Amount", message: "Missing mandatory value", type: "ERROR" },
            ]
          });
          setStep(4);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleFinish = () => {
    onComplete({ importer: selectedImporter, file, payrollMonth });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl w-[95vw] p-0 overflow-hidden bg-card border-border rounded-[2.5rem] gap-0 shadow-2xl">
        <div className="flex h-[750px] w-full">
          {/* Sidebar Stepper */}
          <div className="w-80 bg-secondary/30 border-r border-border p-10 flex flex-col gap-10">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Import Wizard</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Follow the steps to import data</p>
            </div>
            
            <div className="flex-1 space-y-6">
              <SidebarStep n={1} label="Importer Type" active={step === 1} completed={step > 1} />
              <SidebarStep n={2} label="Upload File" active={step === 2} completed={step > 2} />
              <SidebarStep n={3} label="Column Mapping" active={step === 3} completed={step > 3} />
              <SidebarStep n={4} label="Validation" active={step === 4} completed={step > 4} />
              <SidebarStep n={5} label="Summary" active={step === 5} completed={false} />
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Target Period</p>
              <p className="text-xs font-bold text-foreground">{payrollMonth || "Not Selected"}</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
            <div className="flex-1 p-10 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Select Importer</h2>
                      <p className="text-[11px] font-medium text-muted-foreground">Choose the data category you wish to upload.</p>
                    </div>

                    <div className="space-y-5 w-full">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Importer Category *</label>
                        <Select value={selectedImporterId} onValueChange={setSelectedImporterId}>
                          <SelectTrigger className="h-14 bg-secondary/30 rounded-2xl border-border/50">
                            <SelectValue placeholder="Search or select importer..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[400px]">
                            <div className="p-2 sticky top-0 bg-popover z-10">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search importers..." className="pl-10 h-10 bg-secondary/30 border-none rounded-xl text-xs" />
                              </div>
                            </div>
                            {IMPORTER_CATEGORIES.map(category => (
                              <SelectGroup key={category.id}>
                                <SelectLabel className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-2 mt-2 bg-primary/5 rounded-md">{category.label}</SelectLabel>
                                {category.options.map(option => (
                                  <SelectItem key={option.id} value={option.id} className="text-xs font-bold py-3">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedImporter && (
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-foreground uppercase tracking-tight">{selectedImporter.label}</p>
                              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Template Ready</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Mandatory Columns:</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedImporter.requiredColumns.map(col => (
                                <Badge key={col} variant="outline" className="text-[9px] font-bold bg-background border-emerald-500/20 text-emerald-700">{col}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4">
                            <Button 
                              onClick={() => setStep(2)}
                              className="w-full h-14 bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 group"
                            >
                              <Upload className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                              Proceed to Upload File
                              <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 h-full flex flex-col justify-center">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Upload Data Source</h2>
                      <p className="text-sm text-muted-foreground">Upload your spreadsheet to map columns and validate data.</p>
                    </div>

                    {!file ? (
                      <div 
                        className="border-2 border-dashed border-border rounded-[2.5rem] p-16 flex flex-col items-center justify-center gap-6 bg-secondary/10 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="w-20 h-20 rounded-[2rem] bg-background border border-border shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-lg font-black text-foreground">Drop file here or click to browse</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Supported formats: XLSX, XLS, CSV (Max 10MB)</p>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" accept=".xlsx, .xls, .csv" />
                      </div>
                    ) : (
                      <div className="bg-card border border-border rounded-3xl p-8 shadow-xl flex items-center justify-between group max-w-xl mx-auto w-full">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                            <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-lg font-black text-foreground">{file.name}</h4>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB • {selectedImporter?.label}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="rounded-full text-rose-500 hover:bg-rose-50">
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Column Mapping</h2>
                      <p className="text-sm text-muted-foreground">Link your Excel headers with the required system fields.</p>
                    </div>

                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Field</th>
                            <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Excel Header</th>
                            <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {mappings.map((m, i) => (
                            <tr key={i} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <Settings2 className="w-4 h-4 text-primary opacity-50" />
                                <span className="text-xs font-black text-foreground uppercase">{m.systemField}</span>
                                {m.isRequired && <span className="text-rose-500 font-bold">*</span>}
                              </td>
                              <td className="px-6 py-4">
                                <Select value={m.excelColumn} onValueChange={(v) => {
                                  const newMappings = [...mappings];
                                  newMappings[i].excelColumn = v;
                                  setMappings(newMappings);
                                }}>
                                  <SelectTrigger className="h-10 bg-background rounded-xl border-border/50 text-xs font-bold">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={m.systemField}>{m.systemField}</SelectItem>
                                    <SelectItem value="Ignore">-- Ignore Column --</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {m.isMatched ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-md text-[9px] font-black uppercase tracking-tighter">Auto-Matched</Badge>
                                ) : (
                                  <Badge className="bg-amber-500/10 text-amber-600 border-none rounded-md text-[9px] font-black uppercase tracking-tighter">Manual Link</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Data Validation</h2>
                      <p className="text-sm text-muted-foreground">System is checking for data integrity and business rules.</p>
                    </div>

                    {isProcessing ? (
                      <div className="py-12 space-y-8 text-center max-w-sm mx-auto">
                        <div className="relative">
                          <RefreshCw className="w-20 h-20 text-primary animate-spin mx-auto opacity-20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-black text-primary">{progress}%</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-black text-foreground uppercase">Scanning Records</h4>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Checking for duplicates and formats...</p>
                        </div>
                        <Progress value={progress} className="h-2 rounded-full" />
                      </div>
                    ) : validationPreview && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <SummaryItem label="Total" value={validationPreview.totalRows} color="blue" />
                          <SummaryItem label="Success" value={validationPreview.validRows} color="emerald" />
                          <SummaryItem label="Failed" value={validationPreview.failedRows} color="rose" />
                          <SummaryItem label="Skipped" value={validationPreview.skippedRows} color="amber" />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-rose-500" />
                              Errors & Warnings ({validationPreview.errors.length})
                            </h4>
                          </div>

                          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-inner max-h-[250px] overflow-y-auto">
                            <table className="w-full text-left">
                              <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                  <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Row</th>
                                  <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Field</th>
                                  <th className="px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Issue</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/50">
                                {validationPreview.errors.map((err, i) => (
                                  <tr key={i} className={cn("hover:bg-secondary/20 transition-colors", err.type === "ERROR" ? "bg-rose-500/5" : "bg-amber-500/5")}>
                                    <td className="px-4 py-3 text-xs font-mono font-bold text-muted-foreground">#{err.row}</td>
                                    <td className="px-4 py-3 text-xs font-bold text-foreground uppercase">{err.column}</td>
                                    <td className="px-4 py-3 flex items-center gap-2">
                                      {err.type === "ERROR" ? <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                      <span className={cn("text-[11px] font-semibold", err.type === "ERROR" ? "text-rose-600" : "text-amber-600")}>{err.message}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 5 && validationPreview && (
                  <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-2xl">
                      <ShieldCheck className="w-12 h-12 text-emerald-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Final Summary</h2>
                      <p className="text-sm text-muted-foreground max-w-md">Your data has been validated and is ready for final commitment.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                      <div className="p-6 bg-secondary/30 rounded-3xl border border-border/50 space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Rows</p>
                        <p className="text-2xl font-black text-foreground">{validationPreview.totalRows}</p>
                      </div>
                      <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 space-y-1">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Successful</p>
                        <p className="text-2xl font-black text-emerald-600">{validationPreview.validRows}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-card border border-border rounded-3xl w-full max-w-md text-left space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-foreground uppercase tracking-widest">Import Details</h4>
                        <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-primary px-2">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Full Preview
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-muted-foreground uppercase">Importer</span>
                          <span className="text-foreground">{selectedImporter?.label}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-muted-foreground uppercase">Target Month</span>
                          <span className="text-foreground">{payrollMonth}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-muted-foreground uppercase">File Name</span>
                          <span className="text-foreground truncate max-w-[150px]">{file?.name}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="px-10 py-6 border-t border-border flex items-center justify-between bg-card/50">
              <Button 
                variant="ghost" 
                onClick={step === 1 ? onClose : handleBack}
                className="h-12 px-6 rounded-2xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                {step === 1 ? "Cancel" : <><ArrowLeft className="w-4 h-4 mr-2" /> Previous</>}
              </Button>
              
              <div className="flex gap-4">
                {step === 1 && selectedImporter && (
                   <Button 
                    variant="outline"
                    className="h-12 px-6 rounded-2xl text-xs font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5"
                    onClick={() => console.log("Downloading sample")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                )}
                {step < 5 ? (
                  <Button 
                    onClick={handleNext}
                    disabled={(step === 1 && !selectedImporterId) || (step === 2 && !file) || isProcessing}
                    className="h-12 px-10 rounded-2xl bg-foreground text-background hover:opacity-90 text-xs font-black uppercase tracking-widest shadow-xl shadow-foreground/10"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <><ArrowRight className="w-4 h-4 ml-2" /> Next Step</>}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleFinish}
                    className="h-12 px-10 rounded-2xl bg-primary text-white hover:opacity-90 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                    Confirm & Complete Import
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SidebarStep({ n, label, active, completed }: { n: number; label: string; active: boolean; completed: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 transition-all", active ? "scale-105" : "opacity-60")}>
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border-2 transition-all shadow-sm",
        active ? "bg-primary border-primary text-white" : 
        completed ? "bg-emerald-500 border-emerald-500 text-white" : "bg-transparent border-border text-muted-foreground"
      )}>
        {completed ? <CheckCircle2 className="w-4 h-4" /> : n}
      </div>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest",
        active ? "text-foreground" : "text-muted-foreground"
      )}>{label}</span>
    </div>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: number; color: "emerald" | "rose" | "amber" | "blue" }) {
  const styles = {
    emerald: "bg-emerald-500/5 border-emerald-500/10 text-emerald-600",
    rose: "bg-rose-500/5 border-rose-500/10 text-rose-600",
    amber: "bg-amber-500/5 border-amber-500/10 text-amber-600",
    blue: "bg-blue-500/5 border-blue-500/10 text-blue-600"
  };
  return (
    <div className={cn("p-4 rounded-2xl border text-center space-y-1", styles[color])}>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
