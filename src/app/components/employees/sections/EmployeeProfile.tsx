import { Employee } from "../mockData";
import { MapPin, Mail, Phone, User, Briefcase } from "lucide-react";

interface Props {
  employee: Employee;
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-background border border-border">
      <span className="block text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">{label}</span>
      <span className="block text-sm font-medium text-foreground">{value || "—"}</span>
    </div>
  );
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

export function EmployeeProfile({ employee }: Props) {
  const statusStyle: Record<string, string> = {
    Active:     "bg-[#212529] text-[#F8F9FA]",
    "On Leave": "bg-[#6C757D] text-white",
    Inactive:   "bg-[#CED4DA] text-[#212529]",
  };

  return (
    <div className="space-y-5">
      {/* ── Header card ───────────────────────────────────── */}
      <div className="flat-card bg-foreground text-primary-foreground p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {employee.avatar ? (
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-20 h-20 rounded-lg object-cover border-2 border-primary-foreground/20 flex-shrink-0"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center border-2 border-primary-foreground/20 text-white text-2xl font-bold flex-shrink-0"
              style={{ backgroundColor: employee.avatarColor }}
            >
              {employee.initials}
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-primary-foreground tracking-tight">{employee.name}</h2>
            <p className="text-primary-foreground/70 text-sm font-medium mt-1">{employee.designation}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="text-xs font-semibold bg-primary-foreground/10 border border-primary-foreground/20 px-2.5 py-1 rounded-md">
                {employee.employeeId}
              </span>
              <span className="text-xs font-semibold bg-primary-foreground/10 border border-primary-foreground/20 px-2.5 py-1 rounded-md">
                {employee.department}
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${statusStyle[employee.status]}`}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-primary-foreground/20">
          <div className="flex items-center gap-3 text-primary-foreground/80 bg-primary-foreground/10 px-4 py-2.5 rounded-lg">
            <Mail className="w-4 h-4 opacity-70 flex-shrink-0" />
            <span className="text-sm truncate">{employee.email}</span>
          </div>
          <div className="flex items-center gap-3 text-primary-foreground/80 bg-primary-foreground/10 px-4 py-2.5 rounded-lg">
            <Phone className="w-4 h-4 opacity-70 flex-shrink-0" />
            <span className="text-sm">{employee.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-primary-foreground/80 bg-primary-foreground/10 px-4 py-2.5 rounded-lg">
            <MapPin className="w-4 h-4 opacity-70 flex-shrink-0" />
            <span className="text-sm">{employee.location}</span>
          </div>
        </div>
      </div>

      {/* ── Personal Information ───────────────────────────── */}
      <SectionCard title="Personal Information" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCell label="Date of Birth" value={new Date(employee.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} />
          <InfoCell label="Gender" value={employee.gender} />
          <InfoCell label="Marital Status" value={employee.maritalStatus} />
          <InfoCell label="Blood Group" value={employee.bloodGroup} />
          <InfoCell label="Nationality" value={employee.nationality} />
          <InfoCell label="Joining Date" value={new Date(employee.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} />
        </div>
      </SectionCard>

      {/* ── Address Details ───────────────────────────────── */}
      <SectionCard title="Address Details" icon={MapPin}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3 sm:col-span-2">
            <InfoCell label="Address" value={employee.address} />
          </div>
          <InfoCell label="City" value={employee.city} />
          <InfoCell label="State" value={employee.state} />
          <InfoCell label="Pincode" value={employee.pincode} />
        </div>
      </SectionCard>

      {/* ── Work Details ──────────────────────────────────── */}
      <SectionCard title="Work Details" icon={Briefcase}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCell label="Employee ID"    value={employee.employeeId}  />
          <InfoCell label="Department"     value={employee.department}  />
          <InfoCell label="Team"           value={employee.team}        />
          <InfoCell label="Designation"    value={employee.designation} />
          <InfoCell label="Work Location"  value={employee.location}    />
        </div>
      </SectionCard>
    </div>
  );
}
