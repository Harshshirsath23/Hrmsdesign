import React from "react";
import { UserCog, Plus, Shield, ShieldCheck, ShieldAlert, ChevronRight, Search, Settings, Network } from "lucide-react";

export function EmployeeRolesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <UserCog className="w-5 h-5 text-rose-500" />
            Employee Roles & Permissions
          </h2>
          <p className="text-sm text-muted-foreground">Define role hierarchies, permission mapping, and reporting structures.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md">
          <Plus className="w-4 h-4" />
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Hierarchy Overview */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Network className="w-3.5 h-3.5" />
              Role Hierarchy
            </h3>
            
            <div className="space-y-2 relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
              {[
                { name: "Executive Admin", color: "text-rose-500", level: 1 },
                { name: "Department Head", color: "text-orange-500", level: 2 },
                { name: "Team Lead", color: "text-blue-500", level: 3 },
                { name: "Standard Employee", color: "text-muted-foreground", level: 4 },
              ].map((role) => (
                <div key={role.name} className="flex items-center gap-4 relative z-10">
                  <div className={`w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${role.color.replace("text-", "bg-")}`} />
                  </div>
                  <span className={`text-xs font-semibold ${role.color}`}>{role.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quick Stats</h3>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Active Roles</span>
              <span className="text-xs font-bold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Permissions Defined</span>
              <span className="text-xs font-bold">84</span>
            </div>
          </div>
        </div>

        {/* Roles Management */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-sm font-bold">Manage Roles</h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Filter roles..."
                  className="pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-rose-500/20 transition-all w-48"
                />
              </div>
            </div>

            <div className="divide-y divide-border">
              {[
                { name: "HR Manager", users: 5, access: "Full Access", status: "Critical" },
                { name: "Finance Reviewer", users: 3, access: "View & Edit", status: "Moderate" },
                { name: "General User", users: 1240, access: "Self Service", status: "Low" },
                { name: "IT Administrator", users: 8, access: "System Settings", status: "High" },
              ].map((role, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      role.status === "Critical" ? "bg-rose-500/10 text-rose-500" :
                      role.status === "High" ? "bg-orange-500/10 text-orange-500" :
                      "bg-blue-500/10 text-blue-500"
                    }`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">{role.name}</p>
                      <p className="text-[10px] text-muted-foreground">{role.users} active employees assigned</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">{role.access}</p>
                      <p className="text-[10px] text-muted-foreground">Scope: Global</p>
                    </div>
                    <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-all group-hover:translate-x-1">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border bg-muted/20 text-center">
              <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                View All Permission Policies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
