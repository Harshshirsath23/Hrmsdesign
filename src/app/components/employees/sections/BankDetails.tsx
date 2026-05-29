import { useEffect, useMemo, useState } from "react";
import {
  BankAccount,
  Employee,
  EsiDetails,
  PfDetails,
} from "../mockData";
import {
  CreditCard,
  Shield,
  Building2,
  Save,
  X,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { useAdminSync } from "../../admin/useAdminSync";
import { EditableSectionCard } from "../employee-details/EditableSectionCard";
import { ProfileInfoField } from "../employee-details/ProfileInfoField";
import { ConfirmationDialog } from "../employee-details/ConfirmationDialog";
import { useMasterOptions } from "./useMasterOptions";

interface Props {
  employee: Employee;
  disableEdit?: boolean;
}

const ESI_TYPE_OPTIONS = [
  { value: "Employee State Insurance", label: "Employee State Insurance" },
];

const PF_TYPE_OPTIONS = [
  { value: "EPF (Employee Provident Fund)", label: "EPF (Employee Provident Fund)" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const emptyBank = (): BankAccount => ({
  id: `bank-new-${Date.now()}`,
  accountNumber: "",
  bankName: "",
  ifscCode: "",
  accountType: "",
  isPrimary: false,
});

const emptyPf = (): PfDetails => ({
  id: `pf-new-${Date.now()}`,
  pfNumber: "",
  pfType: "",
  monthlyContribution: "",
  employeeShare: "",
  employerShare: "",
  status: "Active",
});

const emptyEsi = (): EsiDetails => ({
  id: `esi-new-${Date.now()}`,
  esiNumber: "",
  esiType: "",
  employeeContribution: "",
  employerContribution: "",
  dispensary: "",
  status: "Active",
});

// ─── Inline row for bank card ─────────────────────────────────────────────────
function BankInfoRow({
  label,
  value,
  mono = false,
  isEditing,
  onChange,
  options,
}: {
  label: string;
  value: string;
  mono?: boolean;
  isEditing?: boolean;
  onChange?: (v: string) => void;
  options?: Array<{ value: string; label: string }>;
}) {
  const selectOptions = options
    ? options.some((o) => o.value === value) || !value
      ? options
      : [{ value, label: value }, ...options]
    : undefined;

  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      {isEditing && selectOptions?.length ? (
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="text-sm font-semibold text-foreground bg-secondary/50 border border-border rounded-md px-2 py-1 w-48 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Select {label}</option>
          {selectOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`text-sm font-semibold text-foreground bg-secondary/50 border border-border rounded-md px-2 py-1 w-48 focus:outline-none focus:ring-2 focus:ring-primary/30 ${mono ? "font-mono" : ""}`}
        />
      ) : (
        <span className={`text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
          {value || "—"}
        </span>
      )}
    </div>
  );
}

// ─── Reusable multi-record section card ──────────────────────────────────────
function RecordCard({
  index,
  title,
  icon: Icon,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  readOnly = false,
  children,
}: {
  index: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  readOnly?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flat-card bg-card border border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-foreground" />
          </div>
          {title} #{index + 1}
        </h3>
        {!readOnly && (
  <div className="flex items-center gap-2">
    {isEditing ? (
      <>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          <Save className="w-3.5 h-3.5" /> Save
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-xs font-bold hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </>
    )}
  </div>
)}
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BankDetails({ employee, disableEdit = false }: Props) {
  const bankOptions = useMasterOptions("Bank");
  const taxRegimeOptions = useMasterOptions("TaxRegime");
  const pfSchemeOptions = useMasterOptions("PfScheme");
  const esiSchemeOptions = useMasterOptions("EsiScheme");
  const { handleAdminSave } = useAdminSync();

  // ── Statutory (single record) ──────────────────────────────────────────────
  const [statutoryEditing, setStatutoryEditing] = useState(false);
  const [statutoryData, setStatutoryData] = useState(employee);

  useEffect(() => {
    setStatutoryData(employee);
    setStatutoryEditing(false);
  }, [employee]);

  const handleSaveStatutory = async () => {
    const ok = await handleAdminSave("Statutory Details", employee, statutoryData);
    if (ok) setStatutoryEditing(false);
  };

  // ── Bank accounts ──────────────────────────────────────────────────────────
  const bankBaseline = useMemo(() => employee.bankAccounts || [], [employee.bankAccounts]);
  const [bankRecords, setBankRecords] = useState<BankAccount[]>(bankBaseline);
  const [bankEditingId, setBankEditingId] = useState<string | null>(null);
  const [bankDeleteId, setBankDeleteId] = useState<string | null>(null);

  useEffect(() => { setBankRecords(bankBaseline); }, [bankBaseline]);

  const updateBank = (id: string, patch: Partial<BankAccount>) =>
    setBankRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleAddBank = () => {
    const rec = emptyBank();
    setBankRecords((prev) => [...prev, rec]);
    setBankEditingId(rec.id);
  };

  const handleEditBank = (id: string) => {
    setBankRecords(bankBaseline.map((r) => ({ ...r })));
    setBankEditingId(id);
  };

  const handleSaveBank = async (_id: string) => {
    const ok = await handleAdminSave("Bank Details", employee, { ...employee, bankAccounts: bankRecords });
    if (ok) setBankEditingId(null);
  };

  const handleCancelBank = (id: string) => {
    const isNew = !bankBaseline.find((r) => r.id === id);
    if (isNew) setBankRecords(bankBaseline.map((r) => ({ ...r })));
    else setBankRecords(bankBaseline.map((r) => ({ ...r })));
    setBankEditingId(null);
  };

  const confirmDeleteBank = async () => {
    if (!bankDeleteId) return;
    const next = bankRecords.filter((r) => r.id !== bankDeleteId);
    const ok = await handleAdminSave("Bank Details", employee, { ...employee, bankAccounts: next });
    if (ok) { setBankRecords(next); if (bankEditingId === bankDeleteId) setBankEditingId(null); }
    setBankDeleteId(null);
  };

  // PF/ESI simplified UI uses `statutoryData` (single record) instead of separate lists

  const bankSelectOptionsFor = (current: string) =>
    bankOptions.some((o) => o.value === current) || !current
      ? bankOptions
      : [{ value: current, label: current }, ...bankOptions];

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-lg font-bold text-foreground">Bank / PF / ESI Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Financial and statutory details for {employee.name}
        </p>
      </div>

      {/* ── Bank Accounts ────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between py-1">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            Bank Accounts
            <span className="ml-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
              {bankRecords.length}
            </span>
          </h3>
          {!disableEdit && (
            <button
              type="button"
              onClick={handleAddBank}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all"
            >
              <Plus size={12} /> Add Bank
            </button>
          )}
        </div>

        {bankRecords.length === 0 ? (
          <div className="flat-card bg-card border border-dashed border-border p-8 text-center">
            <CreditCard className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-semibold">No bank accounts added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bankRecords.map((rec, index) => {
              const isEditing = bankEditingId === rec.id;
              return (
                <RecordCard
                  key={rec.id}
                  index={index}
                  title="Bank Account"
                  icon={CreditCard}
                  isEditing={isEditing}
                  onEdit={() => handleEditBank(rec.id)}
                  onSave={() => handleSaveBank(rec.id)}
                  onCancel={() => handleCancelBank(rec.id)}
                  onDelete={() => setBankDeleteId(rec.id)}
                  readOnly={disableEdit}
                >
                  <div className="bg-foreground text-primary-foreground rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">
                          Account Holder
                        </p>
                        <p className="text-base font-bold mt-0.5">{employee.name}</p>
                      </div>
                      <CreditCard className="w-7 h-7 text-primary-foreground/40" />
                    </div>
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">
                        Account Number
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={rec.accountNumber}
                          onChange={(e) => updateBank(rec.id, { accountNumber: e.target.value })}
                          className="text-xl tracking-widest mt-1 font-mono font-bold bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-white/20"
                          placeholder="Account number"
                        />
                      ) : (
                        <p className="text-xl tracking-widest mt-1 font-mono font-bold">
                          {rec.accountNumber || "—"}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-8 pt-4 border-t border-primary-foreground/20">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">
                          Bank Name
                        </p>
                        {isEditing ? (
                          <select
                            value={rec.bankName}
                            onChange={(e) => updateBank(rec.id, { bankName: e.target.value })}
                            className="text-sm font-medium mt-0.5 bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                          >
                            <option value="">Select Bank</option>
                            {bankSelectOptionsFor(rec.bankName).map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm font-medium mt-0.5">{rec.bankName || "—"}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">
                          IFSC Code
                        </p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={rec.ifscCode}
                            onChange={(e) => updateBank(rec.id, { ifscCode: e.target.value })}
                            className="text-sm font-mono font-bold mt-0.5 bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="IFSC Code"
                          />
                        ) : (
                          <p className="text-sm font-mono font-bold mt-0.5">{rec.ifscCode || "—"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </RecordCard>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Statutory Documents (single record) ─────────────────────────── */}
      <EditableSectionCard
        title="Statutory Documents"
        icon={Shield}
        isEditing={statutoryEditing}
        onEdit={!disableEdit ? () => { setStatutoryData(employee); setStatutoryEditing(true); } : undefined}
        onSave={handleSaveStatutory}
        onCancel={() => { setStatutoryData(employee); setStatutoryEditing(false); }}
        headerExtra={!statutoryEditing && !disableEdit ? (
          <button
            type="button"
            onClick={() => {
              setStatutoryData((prev) => ({ ...prev, panNumber: "", aadhaarNumber: "", uanNumber: "", taxRegime: "" }));
              setStatutoryEditing(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all"
          >
            <Plus size={12} /> Add Statutory
          </button>
        ) : null}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <BankInfoRow label="PAN Number" value={statutoryData.panNumber || ""} mono isEditing={statutoryEditing} onChange={(v) => setStatutoryData((p) => ({ ...p, panNumber: v }))} />
          <BankInfoRow label="Aadhaar Number" value={statutoryData.aadhaarNumber || ""} mono isEditing={statutoryEditing} onChange={(v) => setStatutoryData((p) => ({ ...p, aadhaarNumber: v }))} />
          <BankInfoRow label="Tax Regime" value={statutoryData.taxRegime || ""} isEditing={statutoryEditing} onChange={(v) => setStatutoryData((p) => ({ ...p, taxRegime: v }))} options={taxRegimeOptions} />
        </div>

        <div className="mt-6 border-t border-border pt-4 space-y-4">
          <div className="flex items-center gap-4 py-2 border-b border-border last:border-0">
            <div className="flex items-center gap-3 w-96 shrink-0">
              <input
                type="checkbox"
                checked={Boolean(statutoryData.isPfCovered)}
                disabled={!statutoryEditing}
                onChange={(e) => setStatutoryData((p) => ({ ...p, isPfCovered: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary-600"
              />
              <div>
                <div className="text-sm font-medium">Is Employee Covered Under PF?</div>
                <div className="text-xs text-muted-foreground">Provide PF number if applicable</div>
              </div>
            </div>
            {statutoryData.isPfCovered ? (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PF Number</span>
                  <input
                    type="text"
                    value={statutoryData.pfNumber || ''}
                    disabled={!statutoryEditing}
                    onChange={(e) => setStatutoryData((p) => ({ ...p, pfNumber: e.target.value }))}
                    placeholder="PF Number"
                    className="text-sm font-mono font-semibold bg-secondary/50 border border-border rounded-md px-2.5 py-1.5 w-44 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-80"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">UAN Number</span>
                  <input
                    type="text"
                    value={statutoryData.uanNumber || ''}
                    disabled={!statutoryEditing}
                    onChange={(e) => setStatutoryData((p) => ({ ...p, uanNumber: e.target.value }))}
                    placeholder="UAN Number"
                    className="text-sm font-mono font-semibold bg-secondary/50 border border-border rounded-md px-2.5 py-1.5 w-44 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-80"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-4 py-2 border-b border-border last:border-0">
            <div className="flex items-center gap-3 w-96 shrink-0">
              <input
                type="checkbox"
                checked={Boolean(statutoryData.isEsiCovered)}
                disabled={!statutoryEditing}
                onChange={(e) => setStatutoryData((p) => ({ ...p, isEsiCovered: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary-600"
              />
              <div>
                <div className="text-sm font-medium">Is Employee Covered Under ESI?</div>
                <div className="text-xs text-muted-foreground">Provide ESI number if applicable</div>
              </div>
            </div>
            {statutoryData.isEsiCovered ? (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ESI Number</span>
                <input
                  type="text"
                  value={statutoryData.esiNumber || ''}
                  disabled={!statutoryEditing}
                  onChange={(e) => setStatutoryData((p) => ({ ...p, esiNumber: e.target.value }))}
                  placeholder="ESI Number"
                  className="text-sm font-mono font-semibold bg-secondary/50 border border-border rounded-md px-2.5 py-1.5 w-56 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-80"
                />
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-4 py-2 border-b border-border">
            <div className="flex items-center gap-3 w-96 shrink-0">
              <input
                type="checkbox"
                checked={Boolean(statutoryData.isLwfCovered)}
                disabled={!statutoryEditing}
                onChange={(e) => setStatutoryData((p) => ({ ...p, isLwfCovered: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary-600"
              />
              <div>
                <div className="text-sm font-medium">Is Employee Covered Under LWF?</div>
                <div className="text-xs text-muted-foreground">Provide LIN number if applicable</div>
              </div>
            </div>
            {statutoryData.isLwfCovered ? (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LIN Number</span>
                <input
                  type="text"
                  value={statutoryData.linNumber || ''}
                  disabled={!statutoryEditing}
                  onChange={(e) => setStatutoryData((p) => ({ ...p, linNumber: e.target.value }))}
                  placeholder="LIN Number"
                  className="text-sm font-mono font-semibold bg-secondary/50 border border-border rounded-md px-2.5 py-1.5 w-56 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-80"
                />
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-4 py-2 last:border-0">
            <div className="flex items-center gap-3 w-96 shrink-0">
              <input
                type="checkbox"
                checked={Boolean(statutoryData.isEarlierMemberOfPensionOnHigherWages)}
                disabled={!statutoryEditing}
                onChange={(e) => setStatutoryData((p) => ({ ...p, isEarlierMemberOfPensionOnHigherWages: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary-600"
              />
              <div>
                <div className="text-sm font-medium">Earlier Member of Pension on Higher Wages?</div>
                <div className="text-xs text-muted-foreground">Check if applicable for this employee</div>
              </div>
            </div>
          </div>
        </div>
      </EditableSectionCard>

      {/* PF/ESI/LWF simplified coverage — replaced multi-record management */}

      {/* ── Confirmation dialogs ──────────────────────────────────────────── */}
      <ConfirmationDialog
        open={bankDeleteId !== null}
        onOpenChange={(o) => !o && setBankDeleteId(null)}
        title="Delete bank account?"
        description="This bank account record will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDeleteBank}
      />
      
    </div>
  );
}
