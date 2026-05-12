import React from "react";
import { ShieldCheck, Upload, Search, File, Folder, MoreVertical, Download, Clock, ChevronRight } from "lucide-react";

export function PoliciesFormsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            Company Policies & Forms
          </h2>
          <p className="text-sm text-muted-foreground">Manage and distribute internal HR policies and standardized forms.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Directories</h3>
            <div className="space-y-1">
              {[
                { name: "Global Policies", count: 8 },
                { name: "Leave Forms", count: 4 },
                { name: "Compliance", count: 12 },
                { name: "Onboarding Kits", count: 6 },
                { name: "Reimbursement", count: 3 },
              ].map(folder => (
                <button 
                  key={folder.name}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                    {folder.name}
                  </div>
                  <span className="text-[10px] font-mono opacity-60">{folder.count}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-600 uppercase flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Pending Updates
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              3 policies are awaiting mandatory review by legal department.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search policies or forms..."
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Document Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Category</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Version</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">Last Updated</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { name: "Employee Code of Conduct", cat: "Global Policies", ver: "v2.4", date: "May 01, 2026" },
                    { name: "Sick Leave Application Form", cat: "Leave Forms", ver: "v1.0", date: "Jan 15, 2026" },
                    { name: "Travel Policy 2026", cat: "Compliance", ver: "v3.1", date: "Mar 22, 2026" },
                    { name: "NDA - Standard Template", cat: "Onboarding Kits", ver: "v1.2", date: "Apr 10, 2026" },
                  ].map((doc, i) => (
                    <tr key={i} className="hover:bg-secondary/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center">
                            <File className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-medium bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{doc.cat}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{doc.ver}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{doc.date}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-center">
              <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                View Version History
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
