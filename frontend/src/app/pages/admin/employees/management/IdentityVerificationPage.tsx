import React, { useState } from "react";
import { ShieldCheck, Fingerprint, CreditCard, Landmark, CheckCircle2, XCircle, Clock, Search, ExternalLink } from "lucide-react";

interface VerificationItem {
  id: string;
  name: string;
  type: "Aadhaar" | "PAN" | "Passport";
  submittedOn: string;
  status: "Verified" | "Pending" | "Rejected";
}

const MOCK_DATA: VerificationItem[] = [
  { id: "1", name: "Rahul Sharma", type: "Aadhaar", submittedOn: "2026-05-10", status: "Pending" },
  { id: "2", name: "Priya Patel", type: "PAN", submittedOn: "2026-05-09", status: "Verified" },
  { id: "3", name: "Amit Kumar", type: "Passport", submittedOn: "2026-05-08", status: "Rejected" },
];

export function IdentityVerificationPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Identity Verification
          </h2>
          <p className="text-sm text-muted-foreground">Review and verify employee government identity documents.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search employee..."
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Employee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">ID Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Submitted On</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs">
                        {item.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.type === "Aadhaar" && <Fingerprint className="w-4 h-4 text-blue-500" />}
                      {item.type === "PAN" && <CreditCard className="w-4 h-4 text-orange-500" />}
                      {item.type === "Passport" && <Landmark className="w-4 h-4 text-indigo-500" />}
                      <span className="text-sm">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.submittedOn}</td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      item.status === "Verified" ? "bg-emerald-500/10 text-emerald-600" :
                      item.status === "Pending" ? "bg-amber-500/10 text-amber-600" :
                      "bg-rose-500/10 text-rose-600"
                    }`}>
                      {item.status === "Verified" && <CheckCircle2 className="w-3 h-3" />}
                      {item.status === "Pending" && <Clock className="w-3 h-3" />}
                      {item.status === "Rejected" && <XCircle className="w-3 h-3" />}
                      {item.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1 ml-auto">
                      View Proof
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">1,024</p>
          <p className="text-sm text-muted-foreground">Successfully Verified</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">42</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
          <div className="w-10 h-10 bg-rose-500/10 text-rose-600 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">Rejected Proofs</p>
        </div>
      </div>
    </div>
  );
}
