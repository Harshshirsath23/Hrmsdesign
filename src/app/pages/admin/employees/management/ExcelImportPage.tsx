import React, { useState } from "react";
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertCircle, X } from "lucide-react";

export function ExcelImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "validating" | "success" | "error">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    setStatus("validating");
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setStatus("success");
      }
    }, 200);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-500" />
            Excel Data Import
          </h2>
          <p className="text-sm text-muted-foreground">Bulk create employee profiles using standardized Excel templates.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors">
          <Download className="w-4 h-4" />
          Download Sample Template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Upload Zone */}
        <div 
          className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all ${
            file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }`}
        >
          {!file ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">XLSX or CSV files only (Max. 10MB)</p>
              </div>
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                id="file-upload" 
                onChange={handleFileChange}
              />
              <label 
                htmlFor="file-upload"
                className="inline-block px-6 py-2.5 bg-foreground text-background text-sm font-bold rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              >
                Select File
              </label>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-6">
              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="p-1 hover:bg-secondary rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Uploading & Validating...</span>
                    <span className="text-muted-foreground font-mono">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {!isUploading && status === "idle" && (
                <button 
                  onClick={handleUpload}
                  className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Upload
                </button>
              )}

              {status === "success" && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-green-600">Import Successful!</p>
                    <p className="text-xs text-green-600/80">150 employees successfully created. No errors found.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase text-muted-foreground">Step 1</h4>
            <p className="text-sm font-medium">Download the official template to ensure data compatibility.</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase text-muted-foreground">Step 2</h4>
            <p className="text-sm font-medium">Fill in the employee details accurately in each column.</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase text-muted-foreground">Step 3</h4>
            <p className="text-sm font-medium">Upload the file. System will auto-detect duplicates and errors.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
