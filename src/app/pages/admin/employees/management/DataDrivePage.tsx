import { HardDrive, Folder, File, Search, Upload, Download, MoreVertical, ChevronRight, Share2, Clock, Eye, Edit, Trash2 } from "lucide-react";
import { KebabMenu } from "../../../../components/ui/KebabMenu";
import { toast } from "sonner";

export function DataDrivePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-500" />
            Data Drive
          </h2>
          <p className="text-sm text-muted-foreground">Secure cloud storage for HR documents and employee shared files.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-bold rounded-lg hover:opacity-90 transition-all">
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { label: "My Drive", icon: HardDrive, active: true },
            { label: "Shared with me", icon: Share2 },
            { label: "Recent", icon: Clock },
            { label: "Archived", icon: Folder },
          ].map((item) => (
            <button 
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                item.active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}

          <div className="pt-6 px-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                <span>Storage</span>
                <span>75% used</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: "75%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground">15.2 GB of 20 GB used</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search files and folders..."
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
              <button className="p-2 bg-secondary text-foreground"><Folder className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-secondary text-muted-foreground"><File className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "HR Policies", items: 12, size: "45 MB" },
              { name: "Employee Manuals", items: 5, size: "12 MB" },
              { name: "Tax Documents", items: 158, size: "1.2 GB" },
            ].map((folder) => (
              <div key={folder.name} className="p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 fill-current" />
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <KebabMenu 
                      size="sm"
                      items={[
                        { label: "Open Folder", icon: Eye, onClick: () => toast.info(`Opening ${folder.name}`) },
                        { label: "Rename", icon: Edit, onClick: () => toast.info(`Renaming ${folder.name}`) },
                        { label: "Share Access", icon: Share2, onClick: () => toast.info(`Sharing ${folder.name}`) },
                        { label: "Delete Folder", icon: Trash2, variant: "destructive", separator: true, onClick: () => {
                          if (confirm(`Delete folder "${folder.name}" and all its contents?`)) toast.error("Folder deleted");
                        }},
                      ]}
                    />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">{folder.name}</h4>
                <p className="text-xs text-muted-foreground">{folder.items} items • {folder.size}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-sm font-bold">Files</h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { name: "Annual_Report_2025.pdf", type: "PDF", size: "2.4 MB", date: "May 10, 2026" },
                { name: "Employee_List_Master.xlsx", type: "Excel", size: "156 KB", date: "May 09, 2026" },
                { name: "Company_Logo_HighRes.png", type: "Image", size: "4.8 MB", date: "May 08, 2026" },
              ].map((file, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <File className="w-5 h-5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{file.date} • {file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
