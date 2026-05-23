import { useMemo, useState } from "react";
import { BackgroundCheckRecord, Employee } from "../mockData";
import { ShieldCheck, FileText, Download, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { useAdminSync } from "../../admin/useAdminSync";
import { ProfileInfoField } from "../employee-details";
import { ConfirmationDialog } from "../employee-details/ConfirmationDialog";
import { useMasterOptions } from "./useMasterOptions";

interface Props {
  employee: Employee;
}

const STATUS_OPTIONS = [
  { value: "Verified", label: "Verified" },
  { value: "In Progress", label: "In Progress" },
  { value: "Pending", label: "Pending" },
  { value: "Failed", label: "Failed" },
  { value: "Not Required", label: "Not Required" },
];

const emptyRecord = (): BackgroundCheckRecord => ({
  id: `bg-new-${Date.now()}`,
  verificationStatus: "Pending",
  completedOn: "",
  agencyName: "",
  remarks: "",
  verifiedBy: "",
  referenceNumber: "",
  reportUrl: "",
});

const STATUS_COLOR: Record<string, string> = {
  Verified: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "In Progress": "bg-amber-500/10 text-amber-600 border-amber-200",
  Pending: "bg-slate-500/10 text-slate-500 border-slate-200",
  Failed: "bg-red-500/10 text-red-600 border-red-200",
  "Not Required": "bg-blue-500/10 text-blue-600 border-blue-200",
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try { return format(new Date(dateStr), "dd MMM yyyy"); } catch { return "—"; }
};

export function BackgroundCheck({ employee }: Props) {
  const verificationStatusOptions = useMasterOptions("VerificationStatus");
  const statusOptions = verificationStatusOptions.length ? verificationStatusOptions : STATUS_OPTIONS;

  const baseline = useMemo(() => employee.backgroundChecks || [], [employee.backgroundChecks]);
  const [records, setRecords] = useState<BackgroundCheckRecord[]>(baseline);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { handleAdminSave } = useAdminSync();

  const updateRecord = (id: string, patch: Partial<BackgroundCheckRecord>) =>
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleAdd = () => {
    const rec = emptyRecord();
    setRecords((prev) => [...prev, rec]);
    setEditingId(rec.id);
  };

  const handleEdit = (id: string) => {
    setRecords(baseline.map((r) => ({ ...r })));
    setEditingId(id);
  };

  const handleSave = async (id: string) => {
    const updated = { ...employee, backgroundChecks: records };
    const ok = await handleAdminSave("Background Check", employee, updated);
    if (ok) setEditingId(null);
  };

  const handleCancel = (id: string) => {
    // If this was a newly added record (not in baseline), remove it
    const isNew = !baseline.find((r) => r.id === id);
    if (isNew) {
      setRecords(baseline.map((r) => ({ ...r })));
    } else {
      setRecords(baseline.map((r) => ({ ...r })));
    }
    setEditingId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const next = records.filter((r) => r.id !== deleteId);
    const updated = { ...employee, backgroundChecks: next };
    const ok = await handleAdminSave("Background Check", employee, updated);
    if (ok) {
      setRecords(next);
      if (editingId === deleteId) setEditingId(null);
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Background Check</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Verification and compliance for {employee.name}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all"
        >
          <Plus size={13} /> Add Background Check
        </button>
      </div>

      {records.length === 0 ? (
        <div className="flat-card bg-card border border-dashed border-border p-10 text-center">
          <ShieldCheck className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No background check records yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Add Background Check" to create the first entry.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec, index) => {
            const isEditing = editingId === rec.id;
            return (
              <div key={rec.id} className="flat-card bg-card border border-border p-6">
                {/* Card header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Background Check #{index + 1}
                      </p>
                      {!isEditing && (
                        <span
                          className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border mt-1 ${
                            STATUS_COLOR[rec.verificationStatus] ?? STATUS_COLOR["Pending"]
                          }`}
                        >
                          {rec.verificationStatus || "Pending"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSave(rec.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel(rec.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEdit(rec.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(rec.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-xs font-bold hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Status banner */}
                {!isEditing && (
                  <div className="mb-5 rounded-xl border border-border bg-secondary/20 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Verification Status
                      </p>
                      <p className="text-lg font-bold text-foreground mt-1">
                        {rec.verificationStatus || "Pending"}
                      </p>
                    </div>
                    {rec.completedOn && (
                      <p className="text-sm text-muted-foreground">
                        Completed on {formatDate(rec.completedOn)}
                      </p>
                    )}
                  </div>
                )}

                {/* Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <ProfileInfoField
                    label="Verification Status"
                    value={rec.verificationStatus || ""}
                    editing={isEditing}
                    options={statusOptions}
                    onChange={(v) => updateRecord(rec.id, { verificationStatus: v })}
                  />
                  <ProfileInfoField
                    label="Agency Name"
                    value={rec.agencyName || ""}
                    editing={isEditing}
                    onChange={(v) => updateRecord(rec.id, { agencyName: v })}
                  />
                  <ProfileInfoField
                    label="Verified By"
                    value={rec.verifiedBy || ""}
                    editing={isEditing}
                    onChange={(v) => updateRecord(rec.id, { verifiedBy: v })}
                  />
                  <ProfileInfoField
                    label="Reference Number"
                    value={rec.referenceNumber || ""}
                    editing={isEditing}
                    onChange={(v) => updateRecord(rec.id, { referenceNumber: v })}
                  />
                  <ProfileInfoField
                    label="Completion Date"
                    value={rec.completedOn || ""}
                    editing={isEditing}
                    type="date"
                    onChange={(v) => updateRecord(rec.id, { completedOn: v })}
                  />
                  <div className="sm:col-span-2 lg:col-span-3">
                    <ProfileInfoField
                      label="Agency Remarks"
                      value={rec.remarks || ""}
                      editing={isEditing}
                      type="textarea"
                      onChange={(v) => updateRecord(rec.id, { remarks: v })}
                    />
                  </div>
                </div>

                {/* Report attachment */}
                {!isEditing && rec.reportUrl && (
                  <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-bold text-foreground">Verification Report</p>
                        <p className="text-xs text-muted-foreground">Attached background check document</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
                        onClick={() => window.open(rec.reportUrl, "_blank")}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg border border-border hover:bg-secondary"
                        onClick={() => window.open(rec.reportUrl, "_blank")}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete background check record?"
        description="This record will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
