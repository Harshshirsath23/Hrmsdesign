import { useState } from "react";
import { Employee } from "../mockData";
import { TrendingUp, TrendingDown, Edit2, Save, X } from "lucide-react";
import { useAdminSync } from "../../admin/useAdminSync";

interface Props {
  employee: Employee;
}

/** Indian salary format with explicit rupee symbol */
const formatInr = (n: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)}`;

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
    <div
      className={`flex justify-between items-center py-3 ${
        type === "total" ? "border-t border-border pt-4 mt-2" : "border-b border-border last:border-0"
      }`}
    >
      <span
        className={`text-sm ${
          type === "total" ? "font-bold text-foreground" : "text-muted-foreground font-medium"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-mono ${
          type === "total"
            ? "font-bold text-foreground"
            : type === "gross"
              ? "font-bold text-foreground"
              : type === "deduction"
                ? "font-semibold text-[#6C757D]"
                : "font-semibold text-foreground"
        }`}
      >
        {type === "deduction" ? `– ${formatInr(value)}` : formatInr(value)}
      </span>
    </div>
  );
}

function InrInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="relative w-36">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
        ₹
      </span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full text-sm font-mono font-semibold bg-secondary/50 border border-border rounded-md pl-6 pr-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

export function SalarySummary({ employee }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(employee);
  const { handleAdminSave } = useAdminSync();

  const handleUpdate = (field: keyof Employee, value: number) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const success = await handleAdminSave("Salary Details", employee, editedData);
    if (success) setIsEditing(false);
  };

  function EditableSalaryRow({
    label,
    field,
    type = "normal",
  }: {
    label: string;
    field: keyof Employee;
    type?: "normal" | "deduction" | "gross" | "total";
  }) {
    const value = (editedData[field] as number) || 0;
    return (
      <div
        className={`flex justify-between items-center py-3 ${
          type === "total" ? "border-t border-border pt-4 mt-2" : "border-b border-border last:border-0"
        }`}
      >
        <span
          className={`text-sm ${
            type === "total" ? "font-bold text-foreground" : "text-muted-foreground font-medium"
          }`}
        >
          {label}
        </span>
        {isEditing && type !== "gross" && type !== "total" ? (
          <InrInput value={value} onChange={(n) => handleUpdate(field, n)} />
        ) : (
          <span
            className={`text-sm font-mono ${
              type === "total" || type === "gross"
                ? "font-bold text-foreground"
                : type === "deduction"
                  ? "font-semibold text-[#6C757D]"
                  : "font-semibold text-foreground"
            }`}
          >
            {type === "deduction" ? `– ${formatInr(value)}` : formatInr(value)}
          </span>
        )}
      </div>
    );
  }

  const totalDeductions = (editedData.pf || 0) + (editedData.tds || 0);

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Employee Salary</h2>
          <p className="text-sm text-muted-foreground mt-1">Compensation details for {employee.name} (INR)</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all"
              >
                <Save size={12} /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditedData(employee);
                  setIsEditing(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-secondary transition-all"
              >
                <X size={12} /> Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-secondary transition-all">
              <Edit2 size={12} /> Edit Salary
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flat-card bg-foreground text-primary-foreground p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/60">Gross Salary</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl mt-2 font-mono font-bold">{formatInr(editedData.grossSalary)}</p>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs px-2 py-1 rounded border border-border hover:bg-secondary">Edit</button>
            )}
          </div>
          <p className="text-xs text-primary-foreground/60 mt-1.5 font-medium">Per Month</p>
        </div>
        <div className="flat-card bg-card p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Deductions</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl mt-2 font-mono font-bold text-[#6C757D]">{formatInr(totalDeductions)}</p>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs px-2 py-1 rounded border border-border hover:bg-secondary">Edit</button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">PF + TDS</p>
        </div>
        <div className="flat-card bg-secondary border-foreground/20 p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Net Salary</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl mt-2 font-mono font-bold text-foreground">{formatInr(editedData.netSalary)}</p>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs px-2 py-1 rounded border border-border hover:bg-secondary">Edit</button>
            )}
          </div>
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

        <div className="flat-card bg-card p-6 flex flex-col">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-foreground" />
            </div>
            Deductions
          </h3>
          <EditableSalaryRow label="Provident Fund (PF)" field="pf" type="deduction" />
          <EditableSalaryRow label="Tax Deducted at Source (TDS)" field="tds" type="deduction" />
          <SalaryRow label="Total Deductions" value={totalDeductions} type="total" />

          <div className="mt-auto pt-5">
            <div className="bg-foreground text-primary-foreground rounded-lg p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/60">Net Take Home</p>
              <p className="text-2xl mt-2 font-mono font-bold">{formatInr(editedData.netSalary)}</p>
              <p className="text-xs text-primary-foreground/60 mt-1.5 font-medium">After all deductions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-secondary border border-border rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-foreground">Annual CTC</p>
          <p className="text-xs text-muted-foreground mt-0.5">Cost to Company per year (INR)</p>
        </div>
        <p className="text-xl font-mono font-bold text-foreground">{formatInr(editedData.grossSalary * 12)}</p>
      </div>
    </div>
  );
}
