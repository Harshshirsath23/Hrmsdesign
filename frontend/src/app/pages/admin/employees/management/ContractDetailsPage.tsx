import React from "react";
import { Handshake, Calendar, AlertTriangle, FileSignature, ChevronRight, Filter, Plus } from "lucide-react";

export function ContractDetailsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Handshake className="w-5 h-5 text-amber-500" />
            Contract Management
          </h2>
          <p className="text-sm text-muted-foreground">Monitor and manage employee contracts, renewals, and legal agreements.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-bold rounded-lg hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" />
          Add New Contract
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Expiring Soon</span>
            </div>
            <p className="text-2xl font-bold text-rose-600">08</p>
            <p className="text-xs text-rose-600/80">Contracts expiring in the next 30 days. Action required.</p>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase">Contract Types</h3>
            <div className="space-y-3">
              {[
                { label: "Full-Time", count: 850, color: "bg-blue-500" },
                { label: "Contractual", count: 120, color: "bg-amber-500" },
                { label: "Internship", count: 45, color: "bg-emerald-500" },
                { label: "Freelance", count: 12, color: "bg-purple-500" },
              ].map((type) => (
                <div key={type.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{type.label}</span>
                    <span className="text-muted-foreground">{type.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${type.color}`} style={{ width: `${(type.count / 1027) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-sm font-bold">Recent Contracts</h3>
              <button className="text-xs font-bold text-primary flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
            </div>
            
            <div className="divide-y divide-border">
              {[
                { name: "Siddharth Malhotra", type: "Full-Time", start: "Jan 01, 2024", end: "Permanent", status: "Active" },
                { name: "Ananya Panday", type: "Contractual", start: "Mar 15, 2026", end: "Sep 14, 2026", status: "Expiring" },
                { name: "Varun Dhawan", type: "Internship", start: "May 01, 2026", end: "Jul 31, 2026", status: "Active" },
              ].map((contract, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">{contract.name}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="bg-secondary px-1.5 py-0.5 rounded font-medium">{contract.type}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {contract.start} — {contract.end}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      contract.status === "Expiring" ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      {contract.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border bg-muted/20 text-center">
              <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                View All Contracts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
