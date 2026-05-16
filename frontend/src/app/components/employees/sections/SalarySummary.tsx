import { useState } from "react";
import { Employee } from "../mockData";
import { TrendingUp, TrendingDown, Edit2, Save, X } from "lucide-react";
import { useAdminSync } from "../../admin/useAdminSync";


interface Props {
  employee: Employee;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function SalaryRow({
  label,
  value,
  type = "normal",
}: {
  label: string;
  value: number;
  type?: "normal" | "deduction" | "gross" | "total";
}) {
  return (
    <div className={`flex justify-between items-center py-3 ${type === "total" ? "border-t border-border pt-4 mt-2" : "border-b border-border last:border-0"}`}>
      <span className={`text-sm ${type === "total" ? "font-bold text-foreground" : "text-muted-foreground font-medium"}`}>
        {label}
      </span>
      <span className={`text-sm font-mono ${
        type === "total" ? "font-bold text-foreground"
        : type === "gross" ? "font-bold text-foreground"
        : type === "deduction" ? "font-semibold text-[#6C757D]"
        : "font-semibold text-foreground"
      }`}>
        {type === "deduction" ? `– ${fmt(value)}` : fmt(value)}
      </span>
    </div>
  );
}

export function SalarySummary({ employee }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(employee);
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();

  const handleUpdate = (field: keyof Employee, value: number) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const success = await handleAdminSave('Salary Details', employee, editedData);
    if (success) setIsEditing(false);
  };

  function EditableSalaryRow({ label, field, type = 'normal' }: { label: string; field: keyof Employee; type?: 'normal' | 'deduction' | 'gross' | 'total' }) {
    const value = editedData[field] as number || 0;
    return (
      <div className={`flex justify-between items-center py-3 ${type === 'total' ? 'border-t border-border pt-4 mt-2' : 'border-b border-border last:border-0'}`}>
        <span className={`text-sm ${type === 'total' ? 'font-bold text-foreground' : 'text-muted-foreground font-medium'}`}>{label}</span>
        {isEditing && type !== 'gross' && type !== 'total' ? (
          <input type="number" value={value}
            onChange={e => handleUpdate(field, Number(e.target.value))}
            className="text-sm font-mono font-semibold bg-secondary/50 border border-border rounded-md px-2 py-1 w-32 text-right focus:outline-none focus:ring-2 focus:ring-primary/30" />
        ) : (
          <span className={`text-sm font-mono ${type === 'total' || type === 'gross' ? 'font-bold text-foreground' : type === 'deduction' ? 'font-semibold text-[#6C757D]' : 'font-semibold text-foreground'}`}>
            {type === 'deduction' ? `– ${fmt(value)}` : fmt(value)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Employee Salary</h2>
          <p className="text-sm text-muted-foreground mt-1">Compensation details for {employee.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all">
                <Save size={12} /> Save Changes
              </button>
              <button onClick={() => { setEditedData(employee); setIsEditing(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-secondary transition-all">
                <X size={12} /> Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-secondary transition-all">
              <Edit2 size={12} /> Edit Section
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flat-card bg-foreground text-primary-foreground p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/60">Gross Salary</p>
          <p className="text-2xl mt-2 font-mono font-bold">{fmt(editedData.grossSalary)}</p>
          <p className="text-xs text-primary-foreground/60 mt-1.5 font-medium">Per Month</p>
        </div>
        <div className="flat-card bg-card p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Deductions</p>
          <p className="text-2xl mt-2 font-mono font-bold text-[#6C757D]">{fmt((editedData.pf || 0) + (editedData.tds || 0))}</p>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">PF + TDS</p>
        </div>
        <div className="flat-card bg-secondary border-foreground/20 p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Net Salary</p>
          <p className="text-2xl mt-2 font-mono font-bold text-foreground">{fmt(editedData.netSalary)}</p>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">Take Home</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flat-card bg-card p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-foreground" />
            </div>
            Earnings
          </h3>
          <EditableSalaryRow label="Basic Salary" field="basicSalary" />
          <EditableSalaryRow label="House Rent Allowance (HRA)" field="hra" />
          <EditableSalaryRow label="Conveyance Allowance" field="conveyance" />
          <EditableSalaryRow label="Medical Allowance" field="medicalAllowance" />
          <EditableSalaryRow label="Special Allowance" field="specialAllowance" />
          <EditableSalaryRow label="Gross Earnings" field="grossSalary" type="gross" />
        </div>

        {/* Deductions */}
        <div className="flat-card bg-card p-6 flex flex-col">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-foreground" />
            </div>
            Deductions
          </h3>
          <EditableSalaryRow label="Provident Fund (PF)" field="pf" type="deduction" />
          <EditableSalaryRow label="Tax Deducted at Source (TDS)" field="tds" type="deduction" />
          <EditableSalaryRow label="Total Deductions" field="pf" type="total" />

          {/* Net pay box */}
          <div className="mt-auto pt-5">
            <div className="bg-foreground text-primary-foreground rounded-lg p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/60">Net Take Home</p>
              <p className="text-2xl mt-2 font-mono font-bold">{fmt(editedData.netSalary)}</p>
              <p className="text-xs text-primary-foreground/60 mt-1.5 font-medium">After all deductions</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Annual CTC ────────────────────────────────────── */}
      <div className="bg-secondary border border-border rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-foreground">Annual CTC</p>
          <p className="text-xs text-muted-foreground mt-0.5">Cost to Company per year</p>
        </div>
        <p className="text-xl font-mono font-bold text-foreground">
          {fmt(editedData.grossSalary * 12)}
        </p>
      </div>
    </div>
  );
}
