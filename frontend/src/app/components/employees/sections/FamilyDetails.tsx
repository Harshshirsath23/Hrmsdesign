import { Employee } from "../mockData";
import { Users, User } from "lucide-react";

interface Props {
  employee: Employee;
}

/* Relationship rendered as a monochrome badge — using palette steps for differentiation */
const RELATIONSHIP_SHADES: Record<string, string> = {
  Spouse:   "bg-[#212529] text-[#F8F9FA]",
  Father:   "bg-[#343A40] text-[#F8F9FA]",
  Mother:   "bg-[#495057] text-[#F8F9FA]",
  Son:      "bg-[#6C757D] text-white",
  Daughter: "bg-[#6C757D] text-white",
  Brother:  "bg-[#ADB5BD] text-[#212529]",
  Sister:   "bg-[#ADB5BD] text-[#212529]",
};

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-1">{value}</p>
    </div>
  );
}

export function FamilyDetails({ employee }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Family Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {employee.family.length} family member{employee.family.length !== 1 ? "s" : ""} registered for {employee.name}
        </p>
      </div>

      <div className="space-y-4">
        {employee.family.map((member, index) => {
          const badge = RELATIONSHIP_SHADES[member.relationship] ?? "bg-[#E9ECEF] text-[#212529] border border-[#DEE2E6]";
          const age = new Date().getFullYear() - new Date(member.dob).getFullYear();
          return (
            <div key={index} className="flat-card bg-card p-5 flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <h4 className="text-sm font-bold text-foreground">{member.name}</h4>
                  <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold ${badge}`}>
                    {member.relationship}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <DataCell
                    label="Date of Birth"
                    value={new Date(member.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  />
                  <DataCell label="Age"        value={`${age} years`}      />
                  <DataCell label="Occupation" value={member.occupation}   />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {employee.family.length === 0 && (
        <div className="flat-card bg-card border-dashed border-2 p-12 text-center">
          <Users className="w-10 h-10 text-muted-foreground opacity-30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No family details added yet.</p>
        </div>
      )}
    </div>
  );
}
