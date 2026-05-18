import { useEffect, useState } from "react";
import { Employee } from "../mockData";
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  Pencil,
  Plus, 
  Eye,
  Calendar,
  Building2,
  UserCheck,
  Hash,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";
import { useAdminSync } from "../../admin/useAdminSync";


interface Props {
  employee: Employee;
}

const DEFAULT_BG_CHECK = {
  verificationStatus: "Pending",
  completedOn: "",
  agencyName: "",
  remarks: "",
  verifiedBy: "",
  referenceNumber: "",
  reportUrl: "",
};

function SectionHeader({ title, icon: Icon, onStart }: { title: string; icon: any; onStart?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">{title}</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Verification & Compliance</p>
        </div>
      </div>
      {onStart && (
        <button className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white hover:bg-slate-800 rounded-2xl text-xs font-black transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]">
          <Plus size={16} />
          START VERIFICATION
        </button>
      )}
    </div>
  );
}

export function BackgroundCheck({ employee }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBgCheck, setEditedBgCheck] = useState(employee.backgroundCheck || DEFAULT_BG_CHECK);
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();

  useEffect(() => {
    setEditedBgCheck(employee.backgroundCheck || DEFAULT_BG_CHECK);
    setIsEditing(false);
  }, [employee]);

  const updateBgCheck = (field: string, value: string) => {
    setEditedBgCheck((prev) => (prev ? { ...prev, [field]: value } : { ...DEFAULT_BG_CHECK, [field]: value }));
  };

  const handleSave = async () => {
    const updated = { ...employee, backgroundCheck: editedBgCheck };
    const success = await handleAdminSave('Background Check', employee, updated);
    if (success) setIsEditing(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try { return format(new Date(dateStr), "dd MMM yyyy"); } catch { return "-"; }
  };

  const statusConfig: Record<string, { icon: any, color: string, bg: string, border: string }> = {
    Verified:    { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    "In Progress": { icon: Clock,        color: "text-amber-500",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
    Failed:      { icon: XCircle,      color: "text-rose-500",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
    Pending:     { icon: Clock,        color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/20" },
    "Not Required": { icon: AlertCircle,  color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/20" }
  };

  const status = editedBgCheck?.verificationStatus || "Pending";
  const config = statusConfig[status] || statusConfig.Pending;
  const StatusIcon = config.icon;

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Background Check</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Verification & Compliance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all">
                <Save size={12} /> Save Changes
              </button>
              <button onClick={() => { setEditedBgCheck(employee.backgroundCheck || DEFAULT_BG_CHECK); setIsEditing(false); }}
                className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-xs font-bold hover:bg-secondary transition-all">
                <X size={12} /> Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-xs font-bold hover:bg-secondary transition-all">
              <Pencil size={12} /> Edit Section
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
          {/* Main Status Banner */}
          <div className={`p-8 rounded-[3rem] border ${config.border} ${config.bg} relative overflow-hidden group`}>
            <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
              <ShieldCheck size={200} />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-white shadow-2xl ${config.color}`}>
                <StatusIcon size={48} />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Verification Status</p>
                {isEditing ? (
                  <select value={status} onChange={e => updateBgCheck('verificationStatus', e.target.value)}
                    className="text-2xl font-black bg-secondary/50 border border-border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Verified</option>
                    <option>In Progress</option>
                    <option>Pending</option>
                    <option>Failed</option>
                    <option>Not Required</option>
                  </select>
                ) : (
                  <h3 className={`text-4xl font-black tracking-tight ${config.color}`}>{status}</h3>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                  <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Calendar size={14} className="opacity-40" />
                    Completed: {formatDate(editedBgCheck?.completedOn)}
                  </span>
                  <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Building2 size={14} className="opacity-40" />
                    Agency: {editedBgCheck?.agencyName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Detailed Info Card */}
              <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {([
                    { label: 'Agency Name', field: 'agencyName', icon: Building2 },
                    { label: 'Verified By', field: 'verifiedBy', icon: UserCheck },
                    { label: 'Reference Number', field: 'referenceNumber', icon: Hash },
                    { label: 'Completion Date', field: 'completedOn', icon: Calendar },
                  ] as const).map(({ label, field, icon: Icon }) => (
                    <div key={field} className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
                      <div className="p-4 rounded-2xl bg-secondary/50 border border-border flex items-center gap-3">
                        <Icon size={18} className="text-primary/60 shrink-0" />
                        {isEditing ? (
                          <input type="text" value={(editedBgCheck as any)?.[field] || ''}
                            onChange={e => updateBgCheck(field, e.target.value)}
                            className="text-sm font-black bg-transparent border-none w-full focus:outline-none" />
                        ) : (
                          <span className="text-sm font-black">{(editedBgCheck as any)?.[field] || 'Not Available'}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Agency Remarks</label>
                  <div className="p-6 rounded-[2rem] bg-secondary/30 border border-border">
                    {isEditing ? (
                      <textarea value={editedBgCheck?.remarks || ''} onChange={e => updateBgCheck('remarks', e.target.value)}
                        className="text-sm font-bold text-muted-foreground w-full bg-transparent border-none focus:outline-none leading-relaxed resize-none" rows={3} />
                    ) : (
                      <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">
                        "{editedBgCheck?.remarks || 'No remarks provided by the verification agency.'}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Report Card */}
              {editedBgCheck?.reportUrl && (
                <div className="bg-gradient-to-br from-primary to-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-primary/20 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <FileText size={140} />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black tracking-tight">Final Verification Report</h4>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">BGC_Report_v2.0.pdf</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 py-3 bg-white text-primary hover:bg-white/90 rounded-xl text-xs font-black transition-all shadow-xl">
                        VIEW
                      </button>
                      <button className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/20">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="p-6 rounded-[2.5rem] bg-card border border-border shadow-xl">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 opacity-60">Verification Actions</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 px-4 rounded-xl hover:bg-secondary transition-all text-xs font-bold text-foreground">
                    <AlertCircle size={14} className="text-amber-500" />
                    Re-initiate Check
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 px-4 rounded-xl hover:bg-secondary transition-all text-xs font-bold text-foreground">
                    <FileText size={14} className="text-primary" />
                    Request Documents
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 px-4 rounded-xl hover:bg-secondary transition-all text-xs font-bold text-foreground">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Compliance Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
