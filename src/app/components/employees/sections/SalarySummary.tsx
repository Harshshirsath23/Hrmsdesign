import { Employee } from "../mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

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
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Employee Salary</h2>
        <p className="text-sm text-muted-foreground mt-1">Compensation details for {employee.name}</p>
      </div>

      {/* ── Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross */}
        <div className="flat-card bg-foreground text-primary-foreground p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/60">Gross Salary</p>
          <p className="text-2xl mt-2 font-mono font-bold">{fmt(employee.grossSalary)}</p>
          <p className="text-xs text-primary-foreground/60 mt-1.5 font-medium">Per Month</p>
        </div>
        {/* Deductions */}
        <div className="flat-card bg-card p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Deductions</p>
          <p className="text-2xl mt-2 font-mono font-bold text-[#6C757D]">
            {fmt(employee.pf + employee.tds)}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">PF + TDS</p>
        </div>
        {/* Net */}
        <div className="flat-card bg-secondary border-foreground/20 p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Net Salary</p>
          <p className="text-2xl mt-2 font-mono font-bold text-foreground">{fmt(employee.netSalary)}</p>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">Take Home</p>
        </div>
      </div>

      {/* ── Breakdown ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Earnings */}
        <div className="flat-card bg-card p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-foreground" />
            </div>
            Earnings
          </h3>
          <SalaryRow label="Basic Salary"                value={employee.basicSalary}       />
          <SalaryRow label="House Rent Allowance (HRA)"  value={employee.hra}               />
          <SalaryRow label="Conveyance Allowance"        value={employee.conveyance}        />
          <SalaryRow label="Medical Allowance"           value={employee.medicalAllowance}  />
          <SalaryRow label="Special Allowance"           value={employee.specialAllowance}  />
          <SalaryRow label="Gross Earnings"              value={employee.grossSalary}       type="gross" />
        </div>

        {/* Deductions */}
        <div className="flat-card bg-card p-6 flex flex-col">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-foreground" />
            </div>
            Deductions
          </h3>
          <SalaryRow label="Provident Fund (PF)"           value={employee.pf}                type="deduction" />
          <SalaryRow label="Tax Deducted at Source (TDS)"  value={employee.tds}               type="deduction" />
          <SalaryRow label="Total Deductions"              value={employee.pf + employee.tds} type="total"     />

          {/* Net pay box */}
          <div className="mt-auto pt-5">
            <div className="bg-foreground text-primary-foreground rounded-lg p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/60">Net Take Home</p>
              <p className="text-2xl mt-2 font-mono font-bold">{fmt(employee.netSalary)}</p>
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
          {fmt(employee.grossSalary * 12)}
        </p>
      </div>
    </div>
  );
}
