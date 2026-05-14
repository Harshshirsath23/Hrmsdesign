import { useState } from "react";
import { FileText, Plus, Search, Edit3, Trash2, Eye, Download, ChevronRight, Tags, Copy, History } from "lucide-react";
import { KebabMenu } from "../../../../components/ui/KebabMenu";
import { toast } from "sonner";

export function LetterTemplatePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Letter Templates
          </h2>
          <p className="text-sm text-muted-foreground">Design and manage standardized document templates with dynamic placeholders.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md">
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Categories</h3>
            <div className="space-y-1">
              {["All", "Onboarding", "Offboarding", "Appraisal", "Statutory", "Other"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between group ${activeCategory === cat ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Tags className={`w-3.5 h-3.5 ${activeCategory === cat ? "text-primary" : "text-muted-foreground"}`} />
                    {cat}
                  </div>
                  <span className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border">12</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
              <FileText className="w-3.5 h-3.5" />
              Placeholders
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Use these in your editor: <br />
              <code className="text-primary">{"{{employee_name}}"}</code>,
              <code className="text-primary">{"{{designation}}"}</code>,
              <code className="text-primary">{"{{salary}}"}</code>
            </p>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Standard Offer Letter", cat: "Onboarding", modified: "2 days ago" },
              { name: "Internship Certificate", cat: "Other", modified: "1 week ago" },
              { name: "Salary Revision Letter", cat: "Appraisal", modified: "3 hours ago" },
              { name: "Relieving cum Experience", cat: "Offboarding", modified: "1 month ago" },
            ].map((tpl, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group border-l-4 border-l-primary/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{tpl.name}</h4>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded">{tpl.cat}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <KebabMenu
                      size="sm"
                      items={[
                        { label: "Edit Template", icon: Edit3, onClick: () => toast.info(`Editing ${tpl.name}`) },
                        { label: "Duplicate", icon: Copy, onClick: () => toast.info("Template duplicated") },
                        { label: "Version History", icon: History, onClick: () => toast.info("Viewing version history") },
                        {
                          label: "Delete", icon: Trash2, variant: "destructive", separator: true, onClick: () => {
                            if (confirm(`Permanently delete template "${tpl.name}"?`)) toast.error("Template deleted");
                          }
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/50">
                  <span className="flex items-center gap-1">Modified {tpl.modified}</span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold">
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold">
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
