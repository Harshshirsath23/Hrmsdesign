import React from "react";
import { Filter, Save, Search, Download, Trash2, Edit3, ChevronRight, Share2, Plus, Star } from "lucide-react";

export function EmployeeFilterPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-500" />
            Custom Employee Filters
          </h2>
          <p className="text-sm text-muted-foreground">Create and save advanced filtering logic for reusable employee views.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground text-sm font-bold rounded-lg hover:bg-secondary/80 transition-all">
            <Save className="w-4 h-4" />
            Saved Views
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md">
            <Plus className="w-4 h-4" />
            New Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Saved Filters</h3>
            <div className="space-y-2">
              {[
                { name: "Active Engineering", count: 124, fav: true },
                { name: "On Probation", count: 45, fav: true },
                { name: "Contractual Staff", count: 210, fav: false },
                { name: "High-Performers", count: 12, fav: false },
                { name: "Remote UK", count: 58, fav: false },
              ].map((filter) => (
                <div 
                  key={filter.name}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/50 group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Star className={`w-3 h-3 ${filter.fav ? "text-amber-500 fill-current" : "text-muted-foreground/30"}`} />
                    <span className="text-sm font-medium text-foreground truncate">{filter.name}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{filter.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-blue-600 uppercase flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5" />
              Shared Views
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              These filters are visible to all HR administrators.
            </p>
          </div>
        </div>

        {/* Filter Builder / Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-sm font-bold">Filter Configuration</h3>
              <button className="text-xs font-bold text-rose-500 hover:underline">Reset All</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Department", value: "All" },
                { label: "Designation", value: "All" },
                { label: "Status", value: "Active" },
                { label: "Joining Year", value: "2026" },
                { label: "Location", value: "Any" },
                { label: "Salary Range", value: "> 50k" },
              ].map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">{f.label}</label>
                  <div className="px-3 py-2 bg-background border border-border rounded-lg text-xs flex items-center justify-between group hover:border-primary/50 cursor-pointer">
                    <span>{f.value}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:rotate-90 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-all">
                  Apply Filter
                </button>
                <button className="px-4 py-2 border border-border text-xs font-bold rounded-lg hover:bg-secondary transition-all">
                  Save as View
                </button>
              </div>
              <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                <Download className="w-4 h-4" />
                Export Results
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-muted-foreground opacity-30" />
            </div>
            <p className="text-sm font-bold text-foreground">Apply filters to see results</p>
            <p className="text-xs text-muted-foreground">Configure the parameters above and click "Apply Filter" to generate the employee list.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
