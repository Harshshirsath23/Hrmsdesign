import React, { useState, useMemo } from "react";
import { 
  Image as ImageIcon, 
  UploadCloud, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  User, 
  FileArchive, 
  FileText, 
  Clock, 
  Search, 
  Filter,
  Download,
  AlertCircle,
  MoreVertical,
  Calendar,
  History
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";

interface PhotoImportHistory {
  id: string;
  date: string;
  fileName: string;
  status: "COMPLETED" | "FAILED" | "PROCESSING";
  logUrl: string;
  recordCount: number;
}

export function BulkPhotoUploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"Images" | "ZIP">("Images");
  
  const [history, setHistory] = useState<PhotoImportHistory[]>([
    { id: "1", date: "2026-05-10T14:30:00Z", fileName: "June_Employee_Photos.zip", status: "COMPLETED", logUrl: "#", recordCount: 150 },
    { id: "2", date: "2026-05-12T09:15:00Z", fileName: "Batch_2_Profiles.zip", status: "FAILED", logUrl: "#", recordCount: 45 },
    { id: "3", date: "2026-05-15T16:45:00Z", fileName: "Direct_Upload_IMG_001.jpg", status: "COMPLETED", logUrl: "#", recordCount: 1 },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newEntry: PhotoImportHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        fileName: file.name,
        status: "COMPLETED",
        logUrl: "#",
        recordCount: file.name.endsWith(".zip") ? 85 : 1
      };
      setHistory([newEntry, ...history]);
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background/30 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-foreground tracking-tight uppercase flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Bulk Photo Management
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            Sync employee profile photos using bulk ZIP or multi-file upload
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area - History Table */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Photo Upload History
                </h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  Track all bulk photo sync activities and error logs
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search files..." className="pl-10 h-10 w-64 bg-secondary/30 border-none rounded-xl text-xs font-bold" />
                </div>
                <Button variant="outline" size="icon" className="rounded-xl border-border">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date & Time</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">File Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-foreground uppercase tracking-tight">
                              {new Date(item.date).toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                              {new Date(item.date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          {item.fileName.endsWith(".zip") ? (
                            <FileArchive className="w-5 h-5 text-amber-500" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-blue-500" />
                          )}
                          <div>
                            <p className="text-xs font-black text-foreground uppercase tracking-tight">{item.fileName}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                              {item.recordCount} records processed
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {item.status === "COMPLETED" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-lg text-[10px] font-black uppercase px-3 py-1">
                            Completed
                          </Badge>
                        ) : item.status === "FAILED" ? (
                          <Badge className="bg-rose-500/10 text-rose-600 border-none rounded-lg text-[10px] font-black uppercase px-3 py-1">
                            Failed
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500/10 text-blue-600 border-none rounded-lg text-[10px] font-black uppercase px-3 py-1">
                            Processing
                          </Badge>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl text-primary hover:bg-primary/5"
                            onClick={() => console.log("Download", item.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setHistory(history.filter(h => h.id !== item.id))}
                            className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <X className="X w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl text-blue-500 hover:bg-blue-50"
                            onClick={() => console.log("View", item.id)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar - Upload Section */}
        <div className="w-[400px] border-l border-border bg-card/30 p-8 flex flex-col gap-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Upload Options</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Choose your preferred upload method</p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/50 rounded-2xl border border-border">
              <button 
                onClick={() => setUploadType("Images")}
                className={cn(
                  "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  uploadType === "Images" ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                Direct Images
              </button>
              <button 
                onClick={() => setUploadType("ZIP")}
                className={cn(
                  "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  uploadType === "ZIP" ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                ZIP Archive
              </button>
            </div>

            <div className="relative group">
              <input 
                type="file" 
                id="photo-upload-input" 
                className="hidden" 
                accept={uploadType === "ZIP" ? ".zip" : "image/*"}
                multiple={uploadType === "Images"}
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <label 
                htmlFor="photo-upload-input"
                className={cn(
                  "flex flex-col items-center justify-center gap-6 p-12 border-2 border-dashed border-border rounded-[2.5rem] bg-card/50 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group-active:scale-95",
                  isUploading && "pointer-events-none opacity-50"
                )}
              >
                <div className="w-20 h-20 rounded-[2rem] bg-background border border-border shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isUploading ? (
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                  ) : uploadType === "ZIP" ? (
                    <FileArchive className="w-8 h-8 text-primary" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-primary" />
                  )}
                </div>
                
                <div className="space-y-1 text-center">
                  <p className="text-sm font-black text-foreground uppercase tracking-tight">
                    {isUploading ? "Uploading Data..." : `Select ${uploadType}`}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                    {uploadType === "ZIP" ? "Single .zip file up to 50MB" : "Multiple JPG/PNG files"}
                  </p>
                </div>

                <div className="px-6 py-2 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-colors">
                  Browse Files
                </div>
              </label>
            </div>

            <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-foreground uppercase tracking-tight">Requirement Guide</p>
                  <p className="text-[9px] font-bold text-blue-600/70 uppercase tracking-widest">Filename Standard</p>
                </div>
              </div>
              <p className="text-[11px] font-medium text-blue-700/80 leading-relaxed">
                Photos must be named exactly as the **Employee ID** (e.g., EMP001.jpg) to ensure automatic matching.
              </p>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">
              <span>Total Photos Sync</span>
              <span>1,420</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[75%] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
