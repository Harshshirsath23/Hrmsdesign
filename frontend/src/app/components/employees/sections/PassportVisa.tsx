import { Employee } from "../mockData";
import { Globe, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  employee: Employee;
}

function isExpired(dateStr: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isExpiringSoon(dateStr: string): boolean {
  if (!dateStr) return false;
  const expiry = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + 3);
  return expiry > new Date() && expiry <= cutoff;
}

const VALID_BADGE   = "bg-[#212529] text-[#F8F9FA]";
const EXPIRING_BADGE = "bg-[#6C757D] text-white";
const EXPIRED_BADGE  = "bg-[#CED4DA] text-[#212529]";

export function PassportVisa({ employee }: Props) {
  const passportExpired      = isExpired(employee.passportExpiry);
  const passportExpiringSoon = isExpiringSoon(employee.passportExpiry);
  const visaExpired          = employee.visaExpiry ? isExpired(employee.visaExpiry) : false;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Passport & Visa Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Travel document information for {employee.name}</p>
      </div>

      {/* ── Passport ──────────────────────────────────────── */}
      <div className="flat-card bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <Globe className="w-4 h-4 text-foreground" />
            </div>
            Passport Details
          </h3>
          {passportExpired ? (
            <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${EXPIRED_BADGE}`}>
              <AlertCircle className="w-3.5 h-3.5" /> Expired
            </span>
          ) : passportExpiringSoon ? (
            <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${EXPIRING_BADGE}`}>
              <AlertCircle className="w-3.5 h-3.5" /> Expiring Soon
            </span>
          ) : (
            <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${VALID_BADGE}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Valid
            </span>
          )}
        </div>

        {/* Passport card — flat dark treatment */}
        <div className="bg-foreground text-primary-foreground rounded-lg p-6 mb-2">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Republic of India</p>
              <p className="text-base font-bold mt-0.5">Passport</p>
            </div>
            <Globe className="w-8 h-8 text-primary-foreground/30" />
          </div>
          <div className="grid grid-cols-2 gap-6 mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Passport Number</p>
              <p className="text-base font-mono font-bold mt-0.5">{employee.passportNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Nationality</p>
              <p className="text-base font-bold mt-0.5">{employee.nationality}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Name</p>
              <p className="text-sm font-bold mt-0.5">{employee.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Expiry Date</p>
              <p className={`text-sm font-bold mt-0.5 ${passportExpired || passportExpiringSoon ? "opacity-60" : ""}`}>
                {employee.passportExpiry
                  ? new Date(employee.passportExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Visa ─────────────────────────────────────────── */}
      <div className="flat-card bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-foreground" />
            </div>
            Visa Details
          </h3>
          {employee.visaExpiry && (
            visaExpired ? (
              <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${EXPIRED_BADGE}`}>
                <AlertCircle className="w-3.5 h-3.5" /> Expired
              </span>
            ) : (
              <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${VALID_BADGE}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
              </span>
            )
          )}
        </div>

        {employee.visaCountry ? (
          <div className="bg-background border border-border rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground font-medium">Visa Country</span>
              <span className="text-sm font-semibold text-foreground">{employee.visaCountry}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground font-medium">Visa Type</span>
              <span className="text-sm font-semibold text-foreground">{employee.visaType}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground font-medium">Visa Expiry</span>
              <span className="text-sm font-semibold text-foreground">
                {employee.visaExpiry
                  ? new Date(employee.visaExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
                  : "—"}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-background border border-dashed border-border rounded-lg p-10 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm font-medium text-muted-foreground">No visa information available</p>
          </div>
        )}
      </div>
    </div>
  );
}
