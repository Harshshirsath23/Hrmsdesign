import React, { useState } from "react";
import { ShieldCheck, Fingerprint, CreditCard, Landmark, CheckCircle2, XCircle, Clock, Search, Eye, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface VerificationItem {
  id: string;
  name: string;
  type: "Aadhaar" | "PAN" | "Passport";
  submittedOn: string;
  status: "Verified" | "Pending" | "Rejected";
}

const INITIAL_MOCK_DATA: VerificationItem[] = [
  { id: "1", name: "Rahul Sharma", type: "Aadhaar", submittedOn: "2026-05-10", status: "Pending" },
  { id: "2", name: "Priya Patel", type: "PAN", submittedOn: "2026-05-09", status: "Verified" },
  { id: "3", name: "Amit Kumar", type: "Passport", submittedOn: "2026-05-08", status: "Rejected" },
];

export function IdentityVerificationPage() {
  const [data, setData] = useState<VerificationItem[]>(INITIAL_MOCK_DATA);
  const [search, setSearch] = useState("");

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this identity verification record?")) {
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Identity verification record deleted.");
    }
  };

  const handleDownload = (item: VerificationItem) => {
    const element = document.createElement("a");
    const file = new Blob([`Identity Verification Document\nEmployee: ${item.name}\nType: ${item.type}\nSubmitted On: ${item.submittedOn}\nStatus: ${item.status}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${item.name.replace(/\s+/g, "_")}_${item.type}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Identity proof downloaded successfully!");
  };

  const handleView = (item: VerificationItem) => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Verification Proof - ${item.name}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; background: #f8f9fa; color: #333; }
              .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 500px; margin: auto; text-align: center; }
              h1 { color: #111; font-size: 22px; border-bottom: 2px solid #eee; padding-bottom: 12px; }
              .badge { display: inline-block; padding: 6px 12px; border-radius: 12px; font-weight: bold; font-size: 12px; margin-top: 10px; }
              .verified { bg: #e6fcf5; color: #0ca678; }
              .pending { bg: #fff9db; color: #f59f00; }
              .rejected { bg: #fff5f5; color: #fa5252; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>📄 ID Verification Proof</h1>
              <p><strong>Employee:</strong> ${item.name}</p>
              <p><strong>Identity Document Type:</strong> ${item.type}</p>
              <p><strong>Submitted Date:</strong> ${item.submittedOn}</p>
              <div>
                <strong>Status:</strong> 
                <span class="badge ${item.status.toLowerCase()}">${item.status}</span>
              </div>
              <div style="margin-top: 30px; border: 2px dashed #ccc; padding: 50px; border-radius: 8px; color: #888;">
                [ MOCK IMAGE PREVIEW FOR ${item.type.toUpperCase()} ]
              </div>
            </div>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  const filtered = data.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.type.toLowerCase().includes(search.toLowerCase()) ||
    item.status.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    verified: data.filter(i => i.status === "Verified").length,
    pending: data.filter(i => i.status === "Pending").length,
    rejected: data.filter(i => i.status === "Rejected").length,
  };

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              {filtered.map((item) => (
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
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleView(item)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
                        title="View Proof"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownload(item)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
                        title="Download Proof"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground text-sm font-medium">
                    No verification records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{stats.verified}</p>
          <p className="text-sm text-muted-foreground">Successfully Verified</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{stats.pending}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-3">
          <div className="w-10 h-10 bg-rose-500/10 text-rose-600 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{stats.rejected}</p>
          <p className="text-sm text-muted-foreground">Rejected Proofs</p>
        </div>
      </div>
    </div>
  );
}
