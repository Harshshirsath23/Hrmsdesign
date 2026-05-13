import { Employee } from "../mockData";
import { 
  MapPin, Mail, Phone, User, Briefcase, 
  GraduationCap, ShieldCheck, FileText, 
  Download, Edit2, Plus, Trash2, Eye,
  ChevronRight
} from "lucide-react";

interface Props {
  employee: Employee;
}

function InfoCell({ label, value, isDate = false }: { label: string; value?: string | number; isDate?: boolean }) {
  const displayValue = value ? String(value) : (isDate ? "-" : "Not Available");
  
  return (
    <div className="p-3 rounded-lg bg-background border border-border group hover:border-primary/20 transition-colors">
      <span className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{label}</span>
      <span className="block text-sm font-semibold text-foreground">{displayValue}</span>
    </div>
  );
}

function SectionCard({ 
  title, 
  icon: Icon, 
  children, 
  onAdd 
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  children: React.ReactNode;
  onAdd?: () => void;
}) {
  return (
    <div className="flat-card bg-card p-6 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/5 transition-colors" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-sm font-black text-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shadow-sm">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          <span className="uppercase tracking-widest">{title}</span>
        </h3>
        {onAdd && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-black transition-all shadow-sm">
            <Plus size={14} />
            ADD NEW
          </button>
        )}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function EmployeeProfile({ employee }: Props) {
  const statusStyle: Record<string, string> = {
    Active:     "bg-emerald-500 text-white",
    "On Leave": "bg-amber-500 text-white",
    Inactive:   "bg-rose-500 text-white",
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { 
        day: "2-digit", 
        month: "long", 
        year: "numeric" 
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Header card ───────────────────────────────────── */}
      <div className="flat-card bg-[#0F172A] text-white p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="relative group">
            {employee.avatar ? (
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/10 shadow-2xl transition-transform group-hover:scale-105"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center border-4 border-white/10 text-white text-3xl font-black shadow-2xl transition-transform group-hover:scale-105"
                style={{ backgroundColor: employee.avatarColor }}
              >
                {employee.initials}
              </div>
            )}
            <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all">
              <Edit2 size={14} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h2 className="text-3xl font-black tracking-tight">{employee.name}</h2>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg ${statusStyle[employee.status]}`}>
                  {employee.status}
                </span>
              </div>
              <p className="text-white/60 text-base font-bold mt-1 tracking-wide">{employee.designation}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {[
                { label: "ID", value: employee.employeeId },
                { label: "Dept", value: employee.department },
                { label: "Team", value: employee.team }
              ].map(tag => (
                <span key={tag.label} className="text-[10px] font-black bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md uppercase tracking-widest">
                  <span className="text-white/40 mr-1.5">{tag.label}:</span>
                  {tag.value}
                </span>
              ))}
            </div>
          </div>
          
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-black transition-all flex items-center gap-2">
            <Edit2 size={16} />
            EDIT PROFILE
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10 relative z-10">
          {[
            { icon: Mail, value: employee.email, label: "Email Address" },
            { icon: Phone, value: employee.phone, label: "Phone Number" },
            { icon: MapPin, value: employee.location, label: "Current Location" }
          ].map(contact => (
            <div key={contact.label} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <contact.icon className="w-4 h-4 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{contact.label}</p>
                <p className="text-sm font-bold truncate">{contact.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ── Personal Information ───────────────────────────── */}
          <SectionCard title="Personal Information" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCell label="Date of Birth" value={formatDate(employee.dateOfBirth)} isDate />
              <InfoCell label="Gender" value={employee.gender} />
              <InfoCell label="Marital Status" value={employee.maritalStatus} />
              <InfoCell label="Blood Group" value={employee.bloodGroup} />
              <InfoCell label="Nationality" value={employee.nationality} />
              <InfoCell label="Joining Date" value={formatDate(employee.joiningDate)} isDate />
            </div>
          </SectionCard>

          {/* ── Address Details ───────────────────────────────── */}
          <SectionCard title="Address Details" icon={MapPin}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <InfoCell label="Address" value={employee.address} />
              </div>
              <InfoCell label="City" value={employee.city} />
              <InfoCell label="State" value={employee.state} />
              <InfoCell label="Pincode" value={employee.pincode} />
            </div>
          </SectionCard>

          {/* ── Work Details (with new fields) ─────────────────── */}
          <SectionCard title="Work Details" icon={Briefcase}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCell label="Employee ID"    value={employee.employeeId}  />
              <InfoCell label="Department"     value={employee.department}  />
              <InfoCell label="Team"           value={employee.team}        />
              <InfoCell label="Designation"    value={employee.designation} />
              <InfoCell label="Work Location"  value={employee.location}    />
              <InfoCell label="Employee Type"  value={employee.employeeType} />
              <InfoCell label="Confirmation Date" value={formatDate(employee.confirmationDate)} isDate />
              <InfoCell label="Employment Status" value={employee.employmentStatus} />
              <InfoCell label="Probation Period" value={employee.probationPeriod} />
              <InfoCell label="Notice Period"  value={employee.noticePeriod} />
              <InfoCell label="Referred By"    value={employee.referredBy} />
              <InfoCell label="Reporting To"   value={employee.reportingTo} />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          {/* Quick Actions / Summary Card */}
          <div className="p-8 rounded-[3.5rem] bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <ShieldCheck size={160} />
            </div>
            <div className="relative z-10 space-y-6">
              <div>
                <h4 className="text-xl font-black tracking-tight">Compliance Status</h4>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Profile Completeness</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black">
                  <span>95% Complete</span>
                  <span>Perfect</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-emerald-500 w-[95%] shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              <button className="w-full py-4 bg-primary text-white hover:bg-primary/90 rounded-2xl text-xs font-black transition-all shadow-xl shadow-primary/20 uppercase tracking-widest">
                GENERATE REPORT
              </button>
            </div>
          </div>

          <div className="p-6 rounded-[2.5rem] bg-card border border-border shadow-xl">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Quick Links</h4>
            <div className="space-y-2">
              {['View Documents', 'Work History', 'Salary Structure'].map(link => (
                <button key={link} className="w-full flex items-center justify-between p-3 px-4 rounded-xl hover:bg-secondary transition-all text-xs font-bold text-foreground">
                  {link}
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
