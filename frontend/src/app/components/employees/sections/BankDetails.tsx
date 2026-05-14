import { Employee } from "../mockData";
import { CreditCard, Shield, Building2 } from "lucide-react";

interface Props {
  employee: Employee;
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="flat-card bg-card p-6">
      <h3 className="text-sm font-bold text-foreground mb-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
          <Icon className="w-4 h-4 text-foreground" />
        </div>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className={`text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}

export function BankDetails({ employee }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Bank / PF / ESI Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Financial and statutory details for {employee.name}</p>
      </div>

      {/* Bank Account Card */}
      <SectionCard title="Bank Account Information" icon={CreditCard}>
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
            <p className="text-xl tracking-widest mt-1 font-mono font-bold">{employee.accountNumber}</p>
          </div>
          <div className="flex gap-8 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Bank Name</p>
              <p className="text-sm font-medium mt-0.5">{employee.bankName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">IFSC Code</p>
              <p className="text-sm font-mono font-bold mt-0.5">{employee.ifscCode}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Statutory Documents Card */}
      <SectionCard title="Statutory Documents" icon={Shield}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <InfoRow label="PAN Number" value={employee.panNumber || "—"} mono />
          <InfoRow label="Aadhaar Number" value={employee.aadhaarNumber || "—"} mono />
          <InfoRow label="UAN Number" value={employee.uanNumber || "—"} mono />
          <InfoRow label="Tax Regime" value={employee.taxRegime || "—"} />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Provident Fund (PF)" icon={Shield}>
          <InfoRow label="PF Number"             value={employee.pfNumber}                              mono />
          <InfoRow label="PF Type"               value="EPF (Employee Provident Fund)"                      />
          <InfoRow label="Monthly Contribution"  value={`₹${employee.pf.toLocaleString("en-IN")}`}         />
          <InfoRow label="Employee Share"        value="12% of Basic"                                       />
          <InfoRow label="Employer Share"        value="12% of Basic"                                       />
          <InfoRow label="Status"                value="Active"                                             />
        </SectionCard>

        <SectionCard title="Employee State Insurance (ESI)" icon={Building2}>
          <InfoRow label="ESI Number"             value={employee.esiNumber}  mono />
          <InfoRow label="ESI Type"               value="Employee State Insurance"   />
          <InfoRow label="Employee Contribution"  value="0.75%"                     />
          <InfoRow label="Employer Contribution"  value="3.25%"                     />
          <InfoRow label="Dispensary"             value="ESI Hospital"              />
          <InfoRow label="Status"                 value="Active"                    />
        </SectionCard>
      </div>
    </div>
  );
}
