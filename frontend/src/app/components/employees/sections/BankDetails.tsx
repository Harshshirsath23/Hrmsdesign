import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Employee, EsiDetails, PfDetails } from "../mockData";
import { CreditCard, Shield, Building2, Edit2, Save, X, Plus } from "lucide-react";
import { useAdminSync } from "../../admin/useAdminSync";
import { addNotification } from "../../../../store/slices/notificationSlice";
import { AppDispatch } from "../../../../store";
import { validateAccountNumber, validateIfsc } from "../employee-details";
import { EditableSectionCard } from "../employee-details/EditableSectionCard";
import { ProfileInfoField } from "../employee-details/ProfileInfoField";
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


function StatSectionCard({
  title,
  icon: Icon,
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  editLabel,
  headerExtra,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  editLabel?: string;
  headerExtra?: React.ReactNode;
}) {
  const label = editLabel || "Edit";
  const ShowIcon = label === "Add" ? Plus : Edit2;

  return (
    <div className="flat-card bg-card p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <Icon className="w-4 h-4 text-foreground" />
            </div>
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {!isEditing && headerExtra}
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold transition-all hover:bg-primary/90"
                >
                  <Save size={12} /> Save
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold transition-all hover:bg-secondary"
                >
                  <X size={12} /> Cancel
                </button>
              </>
            ) : (
              onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold transition-all hover:bg-secondary"
                >
                  <ShowIcon size={12} /> {label}
                </button>
              )
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoRow({
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
    ? options.some((option) => option.value === value) || !value
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
          {selectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
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
        <span className={`text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
      )}
    </div>
  );
}

export function BankDetails({ employee, disableEdit = false }: Props) {
  const bankOptions = useMasterOptions("Bank");
  const taxRegimeOptions = useMasterOptions("TaxRegime");
  const pfSchemeOptions = useMasterOptions("PfScheme");
  const esiSchemeOptions = useMasterOptions("EsiScheme");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(employee);
  const [pfEdit, setPfEdit] = useState(false);
  const [pfDraft, setPfDraft] = useState<PfDetails>(employee.pfDetails || {
    pfNumber: "",
    pfType: "",
    monthlyContribution: "",
    employeeShare: "",
    employerShare: "",
    status: "Pending"
  });
  const [esiEdit, setEsiEdit] = useState(false);
  const [esiDraft, setEsiDraft] = useState<EsiDetails>(employee.esiDetails || {
    esiNumber: "",
    esiType: "",
    employeeContribution: "",
    employerContribution: "",
    dispensary: "",
    status: "Pending"
  });
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();
  const dispatch = useDispatch<AppDispatch>();
  const bankSelectOptions =
    bankOptions.some((option) => option.value === (editedData.bankName || "")) || !editedData.bankName
      ? bankOptions
      : [{ value: editedData.bankName, label: editedData.bankName }, ...bankOptions];

  useEffect(() => {
    setEditedData(employee);
    setPfDraft(employee.pfDetails || {
      pfNumber: "",
      pfType: "",
      monthlyContribution: "",
      employeeShare: "",
      employerShare: "",
      status: "Pending"
    });
    setEsiDraft(employee.esiDetails || {
      esiNumber: "",
      esiType: "",
      employeeContribution: "",
      employerContribution: "",
      dispensary: "",
      status: "Pending"
    });
  }, [employee]);

  const handleUpdate = (field: keyof Employee, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBank = async () => {
    const acctErr = validateAccountNumber(editedData.accountNumber || "");
    if (acctErr) {
      dispatch(addNotification({ type: "warning", message: acctErr }));
      return;
    }
    const ifscErr = validateIfsc(editedData.ifscCode || "");
    if (ifscErr) {
      dispatch(addNotification({ type: "warning", message: ifscErr }));
      return;
    }
    const ok = await handleAdminSave("Bank / PF / ESI Details", employee, editedData);
    if (ok) setIsEditing(false);
  };

  const savePf = async () => {
    const next = { ...employee, pfDetails: pfDraft };
    const ok = await handleAdminSave("PF Details", employee, next);
    if (ok) setPfEdit(false);
  };

  const saveEsi = async () => {
    const next = { ...employee, esiDetails: esiDraft };
    const ok = await handleAdminSave("ESI Details", employee, next);
    if (ok) setEsiEdit(false);
  };

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-lg font-bold text-foreground">Bank / PF / ESI Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Financial and statutory details for {employee.name}</p>
      </div>

      <EditableSectionCard
        title="Bank Account Information"
        icon={CreditCard}
        isEditing={isEditing}
        onEdit={!disableEdit ? () => setIsEditing(true) : undefined}
        onSave={handleSaveBank}
        onCancel={() => {
          setEditedData(employee);
          setIsEditing(false);
        }}
      >
        <div className="bg-foreground text-primary-foreground rounded-lg p-6 mb-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Account Holder</p>
              <p className="text-base font-bold mt-0.5">{employee.name}</p>
            </div>
            <CreditCard className="w-7 h-7 text-primary-foreground/40" />
          </div>
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Account Number</p>
            {isEditing ? (
              <input
                type="text"
                value={editedData.accountNumber || ""}
                onChange={(e) => handleUpdate("accountNumber", e.target.value)}
                className="text-xl tracking-widest mt-1 font-mono font-bold bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            ) : (
              <p className="text-xl tracking-widest mt-1 font-mono font-bold">{employee.accountNumber}</p>
            )}
          </div>
          <div className="flex gap-8 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Bank Name</p>
              {isEditing ? (
                <select
                  value={editedData.bankName || ""}
                  onChange={(e) => handleUpdate("bankName", e.target.value)}
                  className="text-sm font-medium mt-0.5 bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="">Select Bank</option>
                  {bankSelectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm font-medium mt-0.5">{employee.bankName}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">IFSC Code</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.ifscCode || ""}
                  onChange={(e) => handleUpdate("ifscCode", e.target.value)}
                  className="text-sm font-mono font-bold mt-0.5 bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              ) : (
                <p className="text-sm font-mono font-bold mt-0.5">{employee.ifscCode}</p>
              )}
            </div>
          </div>
        </div>
      </EditableSectionCard>

      <EditableSectionCard
        title="Statutory Documents"
        icon={Shield}
        isEditing={isEditing}
        onEdit={!disableEdit ? () => setIsEditing(true) : undefined}
        onSave={handleSaveBank}
        onCancel={() => {
          setEditedData(employee);
          setIsEditing(false);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <InfoRow label="PAN Number" value={editedData.panNumber || ""} mono isEditing={isEditing} onChange={(v) => handleUpdate("panNumber", v)} />
          <InfoRow label="Aadhaar Number" value={editedData.aadhaarNumber || ""} mono isEditing={isEditing} onChange={(v) => handleUpdate("aadhaarNumber", v)} />
          <InfoRow label="UAN Number" value={editedData.uanNumber || ""} mono isEditing={isEditing} onChange={(v) => handleUpdate("uanNumber", v)} />
          <InfoRow label="Tax Regime" value={editedData.taxRegime || ""} isEditing={isEditing} onChange={(v) => handleUpdate("taxRegime", v)} options={taxRegimeOptions} />
        </div>
      </EditableSectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StatSectionCard
          title="Provident Fund (PF)"
          icon={Shield}
          isEditing={pfEdit}
          onEdit={!disableEdit ? () => setPfEdit(true) : undefined}
          onSave={savePf}
          onCancel={() => {
            setPfDraft(employee.pfDetails || pfDraft);
            setPfEdit(false);
          }}
        >
          <div className="grid grid-cols-1 gap-3">
            <ProfileInfoField label="PF Number" value={pfDraft.pfNumber} editing={pfEdit} onChange={(v) => setPfDraft((d) => ({ ...d, pfNumber: v }))} />
            <ProfileInfoField
              label="PF Type"
              value={pfDraft.pfType}
              editing={pfEdit}
              onChange={(v) => setPfDraft((d) => ({ ...d, pfType: v }))}
              options={pfSchemeOptions.length ? pfSchemeOptions : PF_TYPE_OPTIONS}
            />
            <ProfileInfoField
              label="Monthly Contribution"
              value={pfDraft.monthlyContribution}
              editing={pfEdit}
              onChange={(v) => setPfDraft((d) => ({ ...d, monthlyContribution: v }))}
            />
            <ProfileInfoField label="Employee Share" value={pfDraft.employeeShare} editing={pfEdit} onChange={(v) => setPfDraft((d) => ({ ...d, employeeShare: v }))} />
            <ProfileInfoField label="Employer Share" value={pfDraft.employerShare} editing={pfEdit} onChange={(v) => setPfDraft((d) => ({ ...d, employerShare: v }))} />
            <ProfileInfoField
              label="Status"
              value={pfDraft.status}
              editing={pfEdit}
              onChange={(v) => setPfDraft((d) => ({ ...d, status: v }))}
              options={STATUS_OPTIONS}
            />
          </div>
        </StatSectionCard>

        <StatSectionCard
          title="Employee State Insurance (ESI)"
          icon={Building2}
          isEditing={esiEdit}
          onEdit={!disableEdit ? () => setEsiEdit(true) : undefined}
          onSave={saveEsi}
          onCancel={() => {
            setEsiDraft(employee.esiDetails || esiDraft);
            setEsiEdit(false);
          }}
        >
          <div className="grid grid-cols-1 gap-3">
            <ProfileInfoField label="ESI Number" value={esiDraft.esiNumber} editing={esiEdit} onChange={(v) => setEsiDraft((d) => ({ ...d, esiNumber: v }))} />
            <ProfileInfoField
              label="ESI Type"
              value={esiDraft.esiType}
              editing={esiEdit}
              onChange={(v) => setEsiDraft((d) => ({ ...d, esiType: v }))}
              options={esiSchemeOptions.length ? esiSchemeOptions : ESI_TYPE_OPTIONS}
            />
            <ProfileInfoField
              label="Employee Contribution"
              value={esiDraft.employeeContribution}
              editing={esiEdit}
              onChange={(v) => setEsiDraft((d) => ({ ...d, employeeContribution: v }))}
            />
            <ProfileInfoField
              label="Employer Contribution"
              value={esiDraft.employerContribution}
              editing={esiEdit}
              onChange={(v) => setEsiDraft((d) => ({ ...d, employerContribution: v }))}
            />
            <ProfileInfoField label="Dispensary" value={esiDraft.dispensary} editing={esiEdit} onChange={(v) => setEsiDraft((d) => ({ ...d, dispensary: v }))} />
            <ProfileInfoField
              label="Status"
              value={esiDraft.status}
              editing={esiEdit}
              onChange={(v) => setEsiDraft((d) => ({ ...d, status: v }))}
              options={STATUS_OPTIONS}
            />
          </div>
        </StatSectionCard>
      </div>
    </div>
  );
}

