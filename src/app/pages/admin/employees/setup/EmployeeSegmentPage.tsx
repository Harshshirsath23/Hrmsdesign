import { Users, Plus, Search, Filter, MapPin, Briefcase, UserCheck, ChevronRight, BarChart3, Edit, Copy, Trash2, Send } from "lucide-react";
import { KebabMenu } from "../../../../components/ui/KebabMenu";
import { toast } from "sonner";

export function EmployeeSegmentPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Employee Segments
          </h2>
          <p className="text-sm text-muted-foreground">Create dynamic smart segments for targeted operations and analytics.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md">
          <Plus className="w-4 h-4" />
          Create New Segment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Quick Filters</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Department</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all">
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Human Resources</option>
                  <option>Sales & Marketing</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase">Location</label>
                <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all">
                  <option>All Locations</option>
                  <option>New York (HQ)</option>
                  <option>London</option>
                  <option>Mumbai</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Smart Segment</span>
                  <div className="w-8 h-4 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  Smart segments automatically add new employees who match these criteria.
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Employee Count</p>
                <p className="text-2xl font-bold text-emerald-600">428</p>
              </div>
              <BarChart3 className="w-8 h-8 text-emerald-600/30" />
            </div>
          </div>
        </div>

        {/* Existing Segments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">My Segments</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search segments..."
                  className="pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all w-48"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Engineering Leads", count: 24, filters: ["Engineering", "Lead", "All Locations"] },
              { name: "NYC Sales Team", count: 156, filters: ["Sales", "All Roles", "New York"] },
              { name: "Global HR", count: 12, filters: ["Human Resources", "All Roles", "All Locations"] },
              { name: "Interns 2026", count: 45, filters: ["All Depts", "Intern", "Remote"] },
            ].map((segment, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-emerald-600">
                    {segment.count}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">{segment.name}</h4>
                    <p className="text-[10px] text-muted-foreground">Created 1 month ago</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {segment.filters.map(f => (
                      <span key={f} className="text-[9px] font-bold bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded border border-border/50">{f}</span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <button className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                      View Employees
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <div onClick={(e) => e.stopPropagation()}>
                      <KebabMenu 
                        size="sm"
                        items={[
                          { label: "Edit Rules", icon: Edit, onClick: () => toast.info(`Editing rules for ${segment.name}`) },
                          { label: "Duplicate Segment", icon: Copy, onClick: () => toast.info("Segment duplicated") },
                          { label: "Send Communication", icon: Send, onClick: () => toast.info("Redirecting to Mass Communication...") },
                          { label: "Delete", icon: Trash2, variant: "destructive", separator: true, onClick: () => {
                            if (confirm(`Delete segment "${segment.name}"?`)) toast.error("Segment deleted");
                          }},
                        ]}
                      />
                    </div>
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
