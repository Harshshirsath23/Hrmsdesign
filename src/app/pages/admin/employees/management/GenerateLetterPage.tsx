import React, { useState } from "react";
import { FileText, Download, Mail, Eye, CheckCircle2 } from "lucide-react";

const LETTER_TYPES = [
  "Offer Letter",
  "Appointment Letter",
  "Experience Letter",
  "Relieving Letter",
  "Promotion Letter",
  "Salary Revision Letter",
];

export function GenerateLetterPage() {
  const [selectedLetter, setSelectedLetter] = useState(LETTER_TYPES[0]);
  const [employeeId, setEmployeeId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Document
          </h2>
          <p className="text-sm text-muted-foreground">Select a letter type and employee to generate a professional document.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Letter Settings</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Letter Type</label>
              <select 
                value={selectedLetter}
                onChange={(e) => setSelectedLetter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                {LETTER_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Employee ID / Name</label>
              <input 
                type="text"
                placeholder="Search employee..."
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !employeeId}
              className="w-full py-2.5 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Generate Letter
                </>
              )}
            </button>
          </div>

          <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
            <h4 className="text-xs font-bold text-foreground uppercase mb-2">Dynamic Placeholders</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The system will automatically populate: <br/>
              <span className="font-mono bg-background px-1 rounded">{"{employee_name}"}</span>, 
              <span className="font-mono bg-background px-1 rounded">{"{designation}"}</span>, 
              <span className="font-mono bg-background px-1 rounded">{"{doj}"}</span>, 
              <span className="font-mono bg-background px-1 rounded">{"{salary}"}</span>
            </p>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col min-h-[500px]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <span className="text-sm font-semibold">Document Preview</span>
              {showPreview && (
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Send via Email">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              {showPreview ? (
                <div className="w-full max-w-2xl bg-background border border-border shadow-2xl p-12 text-left space-y-6 aspect-[1/1.414]">
                  <div className="flex justify-between items-start mb-12">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-bold uppercase tracking-widest text-primary">Company Name</h1>
                      <p className="text-xs text-muted-foreground">123 Business Street, Tech City</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Date: {new Date().toLocaleDateString()}</p>
                      <p>Ref: HR/LET/2026/001</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-center font-bold underline text-lg uppercase mb-8">{selectedLetter}</h2>
                    <p className="text-sm">To,<br/><strong>{employeeId || "Employee Name"}</strong></p>
                    <p className="text-sm leading-relaxed">
                      This is to certify that Mr./Ms. <strong>{employeeId || "Employee Name"}</strong> is working with us as <strong>Software Engineer</strong> since <strong>01-Jan-2024</strong>.
                    </p>
                    <p className="text-sm leading-relaxed">
                      We appreciate your contributions to the organization and look forward to your continued success.
                    </p>
                  </div>

                  <div className="mt-20 pt-12 border-t border-border/50">
                    <p className="text-sm font-bold">Authorized Signatory</p>
                    <p className="text-xs text-muted-foreground">Human Resources Department</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                    <Eye className="w-8 h-8 text-muted-foreground opacity-50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">No Preview Available</p>
                    <p className="text-xs text-muted-foreground">Select an employee and click "Generate" to see the document here.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
