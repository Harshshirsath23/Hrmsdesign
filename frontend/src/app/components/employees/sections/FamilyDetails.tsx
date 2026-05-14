import { Employee } from "../mockData";
import { Users, User, CheckCircle2, AlertCircle, Phone, Heart, ShieldCheck } from "lucide-react";

interface Props {
  employee: Employee;
}

const RELATIONSHIP_SHADES: Record<string, string> = {
  Spouse: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  Father: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Mother: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Son: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Daughter: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

function StatusBadge({ icon: Icon, label, active }: { icon: any, label: string, active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-foreground/5 border border-border text-[10px] font-bold text-foreground/70 uppercase tracking-tight">
      <Icon size={11} className="text-emerald-500" />
      {label}
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-muted-foreground/60" />}
        <span className="text-xs font-bold text-foreground truncate">{value || "—"}</span>
      </div>
    </div>
  );
}

export function FamilyDetails({ employee }: Props) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2.5">
            <Users size={20} className="text-indigo-500" />
            Family & Dependents
          </h2>
          <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            {employee.family.length} Registered Members
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {employee.family.map((member, index) => {
          const badgeStyle = RELATIONSHIP_SHADES[member.relationship] || "bg-secondary text-muted-foreground border-border";
          const age = member.dob ? new Date().getFullYear() - new Date(member.dob).getFullYear() : "—";
          
          return (
            <div key={index} className="group relative bg-card border border-border rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-foreground/5 hover:-translate-y-1 overflow-hidden">
              {/* Decorative side accent */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${badgeStyle.split(' ')[0]}`} />
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center border border-border shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <User size={28} className="text-muted-foreground/40" />
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${badgeStyle}`}>
                    {member.relationship}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h4 className="text-base font-black text-foreground">{member.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <StatusBadge icon={ShieldCheck} label="Dependent" active={member.isDependent} />
                        <StatusBadge icon={AlertCircle} label="Emergency Contact" active={member.isEmergencyContact} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">
                    <InfoItem label="Date of Birth" value={member.dob ? new Date(member.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"} />
                    <InfoItem label="Gender" value={member.gender} />
                    <InfoItem label="Age" value={age !== "—" ? `${age} Years` : "—"} />
                    <InfoItem label="Blood Group" value={member.bloodGroup} icon={Heart} />
                    <InfoItem label="Phone" value={member.phone} icon={Phone} />
                    <InfoItem label="Occupation" value={member.occupation} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {employee.family.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-border rounded-[2rem] bg-secondary/5 text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Users size={32} className="text-muted-foreground/30" />
          </div>
          <p className="text-sm font-bold text-muted-foreground">No family details added yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-widest">Employee has not declared any dependents</p>
        </div>
      )}
    </div>
  );
}
