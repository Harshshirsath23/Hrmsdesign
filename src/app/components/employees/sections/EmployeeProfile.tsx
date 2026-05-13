import { Employee } from "../mockData";
import { 
  MapPin, Mail, Phone, User, Briefcase, 
  GraduationCap, ShieldCheck, FileText, 
  Download, Edit2, Plus, Trash2, Eye,
  ChevronRight, Heart, Languages, Monitor,
  FileStack, Users
} from "lucide-react";

import { useState, useEffect } from "react";

interface Props {
  employee: Employee;
}

function InfoCell({ 
  label, 
  value, 
  isDate = false,
  isEditing = false,
  onChange
}: { 
  label: string; 
  value?: string | number | boolean; 
  isDate?: boolean;
  isEditing?: boolean;
  onChange?: (val: string) => void;
}) {
  let displayValue = "-";
  if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else if (value !== undefined && value !== null && value !== "") {
    displayValue = String(value);
  } else if (!isDate) {
    displayValue = "Not Available";
  }
  
  return (
    <div className={`p-3 rounded-lg transition-all border ${
      isEditing 
        ? "bg-secondary/20 border-primary/30 ring-1 ring-primary/10" 
        : "bg-background border-border group hover:border-primary/20"
    }`}>
      <span className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{label}</span>
      {isEditing ? (
        <input 
          type={isDate ? "date" : "text"}
          value={String(value || "")}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none placeholder:text-muted-foreground/30"
          placeholder={`Enter ${label}...`}
        />
      ) : (
        <span className="block text-sm font-semibold text-foreground">{displayValue}</span>
      )}
    </div>
  );
}

function SectionCard({ 
  title, 
  icon: Icon, 
  children, 
  onAdd,
  action
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  children: React.ReactNode;
  onAdd?: () => void;
  action?: React.ReactNode;
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
        <div className="flex items-center gap-2">
          {action}
          {onAdd && (
            <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-black transition-all shadow-sm">
              <Plus size={14} />
              ADD NEW
            </button>
          )}
        </div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function EmployeeProfile({ employee }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(employee);
  const [currentAddress, setCurrentAddress] = useState(employee.currentAddress);
  const [permanentAddress, setPermanentAddress] = useState(employee.permanentAddress);
  const [isSameAsPermanent, setIsSameAsPermanent] = useState(employee.currentAddress?.isSameAsPermanent || false);
  const [languages, setLanguages] = useState(employee.languages || []);

  const handleUpdate = (path: string, value: any) => {
    setEditedData(prev => {
      const keys = path.split('.');
      if (keys.length === 1) return { ...prev, [path]: value };
      
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleLanguageChange = (index: number, field: string, value: any) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
  };

  const toggleSameAsPermanent = () => {
    const nextValue = !isSameAsPermanent;
    setIsSameAsPermanent(nextValue);
    
    if (nextValue && currentAddress) {
      setPermanentAddress({
        ...currentAddress,
        isSameAsPermanent: undefined // Not present in permanent address type
      } as any);
    }
  };

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
              <div className="flex items-center justify-center md:justify-start gap-4">
                <h2 className="text-3xl font-black tracking-tight">{editedData.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg ${statusStyle[editedData.status]}`}>
                    {editedData.status}
                  </span>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                      isEditing 
                        ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" 
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                  >
                    {isEditing ? "Cancel Editing" : "Edit Profile"}
                  </button>
                  {isEditing && (
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        alert("Profile updated successfully!");
                      }}
                      className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary border-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
              <p className="text-white/60 text-base font-bold mt-1 tracking-wide">{editedData.designation}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {[
                { label: "ID", value: employee.employeeId },
                { label: "Salutation", value: employee.salutation },
                { label: "Preferred Name", value: employee.preferredName },
                { label: "Dept", value: employee.department },
                { label: "Team", value: employee.team }
              ].filter(tag => tag.value).map(tag => (
                <span key={tag.label} className="text-[10px] font-black bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md uppercase tracking-widest">
                  <span className="text-white/40 mr-1.5">{tag.label}:</span>
                  {tag.value}
                </span>
              ))}
            </div>
            
            {employee.bio && (
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm max-w-2xl">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Bio / About</p>
                <p className="text-sm text-white/80 line-clamp-3 italic leading-relaxed">"{employee.bio}"</p>
              </div>
            )}
          </div>
          
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-black transition-all flex items-center gap-2">
            <Edit2 size={16} />
            EDIT PROFILE
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10 relative z-10">
          {[
            { icon: Mail, value: employee.email, label: "Email Address" },
            { icon: Phone, value: employee.phone, label: "Phone Number" },
            { icon: Phone, value: employee.alternateMobile, label: "Alternate Mobile" },
            { icon: MapPin, value: employee.location, label: "Current Location" }
          ].map(contact => (
            <div key={contact.label} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <contact.icon className="w-4 h-4 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{contact.label}</p>
                <p className="text-sm font-bold truncate">{contact.value || "—"}</p>
              </div>
            </div>
          ))}
        </div>
        {employee.extensionNumber && (
          <div className="absolute bottom-4 right-8 text-[10px] font-black text-white/20 uppercase tracking-widest">
            Ext: {employee.extensionNumber}
          </div>
        )}
      </          {/* ── Personal Information ──────────────────────────── */}
          <SectionCard title="Personal Information" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCell label="First Name" value={editedData.firstName} isEditing={isEditing} onChange={(val) => handleUpdate('firstName', val)} />
              <InfoCell label="Middle Name" value={editedData.middleName} isEditing={isEditing} onChange={(val) => handleUpdate('middleName', val)} />
              <InfoCell label="Last Name" value={editedData.lastName} isEditing={isEditing} onChange={(val) => handleUpdate('lastName', val)} />
              <InfoCell label="Father's Name" value={editedData.fathersName} isEditing={isEditing} onChange={(val) => handleUpdate('fathersName', val)} />
              <InfoCell label="Spouse's Name" value={editedData.spouseName} isEditing={isEditing} onChange={(val) => handleUpdate('spouseName', val)} />
              <InfoCell label="Date of Birth" value={editedData.dateOfBirth} isDate isEditing={isEditing} onChange={(val) => handleUpdate('dateOfBirth', val)} />
              <InfoCell label="Actual DOB" value={editedData.actualDob} isDate isEditing={isEditing} onChange={(val) => handleUpdate('actualDob', val)} />
              <InfoCell label="Place of Birth" value={editedData.placeOfBirth} isEditing={isEditing} onChange={(val) => handleUpdate('placeOfBirth', val)} />
              <InfoCell label="Gender" value={editedData.gender} isEditing={isEditing} onChange={(val) => handleUpdate('gender', val)} />
              <InfoCell label="Marital Status" value={editedData.maritalStatus} isEditing={isEditing} onChange={(val) => handleUpdate('maritalStatus', val)} />
              <InfoCell label="Blood Group" value={editedData.bloodGroup} isEditing={isEditing} onChange={(val) => handleUpdate('bloodGroup', val)} />
              <InfoCell label="Nationality" value={editedData.nationality} isEditing={isEditing} onChange={(val) => handleUpdate('nationality', val)} />
              <InfoCell label="Religion" value={editedData.religion} isEditing={isEditing} onChange={(val) => handleUpdate('religion', val)} />
              <InfoCell label="Caste" value={editedData.caste} isEditing={isEditing} onChange={(val) => handleUpdate('caste', val)} />
              <InfoCell label="Caste Category" value={editedData.casteCategory} isEditing={isEditing} onChange={(val) => handleUpdate('casteCategory', val)} />
              <InfoCell label="Identification Mark" value={editedData.identificationMark} isEditing={isEditing} onChange={(val) => handleUpdate('identificationMark', val)} />
              <InfoCell label="Physically Challenged" value={editedData.isPhysicallyChallenged} isEditing={isEditing} onChange={(val) => handleUpdate('isPhysicallyChallenged', val === 'true')} />
              <InfoCell label="International Employee" value={editedData.isInternationalEmployee} isEditing={isEditing} onChange={(val) => handleUpdate('isInternationalEmployee', val === 'true')} />
              <InfoCell label="Joining Date" value={editedData.joiningDate} isDate isEditing={isEditing} onChange={(val) => handleUpdate('joiningDate', val)} />
            </div>
          </SectionCard>
             <InfoCell label="Joining Date" value={formatDate(employee.joiningDate)} isDate />
            </div>
          </SectionCard>

          {/* ── Address Details ───────────────────────────────── */}
          <SectionCard title="Address Details" icon={MapPin}>
            <div className="space-y-8">
              {/* Current Address */}
              <div>
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Current Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCell label="Address Line 1" value={editedData.currentAddress?.addressLine1} isEditing={isEditing} onChange={(val) => handleUpdate('currentAddress.addressLine1', val)} />
                  <InfoCell label="Address Line 2" value={editedData.currentAddress?.addressLine2} isEditing={isEditing} onChange={(val) => handleUpdate('currentAddress.addressLine2', val)} />
                  <InfoCell label="Landmark" value={editedData.currentAddress?.landmark} isEditing={isEditing} onChange={(val) => handleUpdate('currentAddress.landmark', val)} />
                  <InfoCell label="City" value={editedData.currentAddress?.city} isEditing={isEditing} onChange={(val) => handleUpdate('currentAddress.city', val)} />
                  <InfoCell label="State" value={editedData.currentAddress?.state} isEditing={isEditing} onChange={(val) => handleUpdate('currentAddress.state', val)} />
                  <InfoCell label="Country" value={editedData.currentAddress?.country} isEditing={isEditing} onChange={(val) => handleUpdate('currentAddress.country', val)} />
                  <InfoCell label="Pincode" value={editedData.currentAddress?.pincode} isEditing={isEditing} onChange={(val) => handleUpdate('currentAddress.pincode', val)} />
                  <InfoCell label="Start Date" value={editedData.currentAddress?.startDate} isDate isEditing={isEditing} onChange={(val) => handleUpdate('currentAddress.startDate', val)} />
                  <InfoCell label="To Date" value={editedData.currentAddress?.toDate} isDate isEditing={isEditing} onChange={(val) => handleUpdate('currentAddress.toDate', val)} />
                  
                  <div 
                    className={`flex flex-col gap-1 p-3 rounded-lg border transition-all ${
                      isEditing 
                        ? "bg-secondary/20 border-primary/30 ring-1 ring-primary/10" 
                        : "bg-background border-border"
                    } ${isEditing ? "cursor-pointer hover:border-primary/50" : ""} group`}
                    onClick={isEditing ? toggleSameAsPermanent : undefined}
                  >
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 group-hover:text-primary transition-colors">Same as Permanent Address</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSameAsPermanent 
                          ? "bg-primary border-primary scale-110 shadow-lg shadow-primary/20" 
                          : "bg-transparent border-border group-hover:border-primary/40"
                      }`}>
                        {isSameAsPermanent && (
                          <svg className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-semibold transition-colors ${isSameAsPermanent ? "text-primary" : "text-foreground"}`}>
                        {isSameAsPermanent ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div className="pt-8 border-t border-border/50">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Permanent Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCell label="Address Line 1" value={editedData.permanentAddress?.addressLine1} isEditing={isEditing} onChange={(val) => handleUpdate('permanentAddress.addressLine1', val)} />
                  <InfoCell label="Address Line 2" value={editedData.permanentAddress?.addressLine2} isEditing={isEditing} onChange={(val) => handleUpdate('permanentAddress.addressLine2', val)} />
                  <InfoCell label="Landmark" value={editedData.permanentAddress?.landmark} isEditing={isEditing} onChange={(val) => handleUpdate('permanentAddress.landmark', val)} />
                  <InfoCell label="City" value={editedData.permanentAddress?.city} isEditing={isEditing} onChange={(val) => handleUpdate('permanentAddress.city', val)} />
                  <InfoCell label="State" value={editedData.permanentAddress?.state} isEditing={isEditing} onChange={(val) => handleUpdate('permanentAddress.state', val)} />
                  <InfoCell label="Country" value={editedData.permanentAddress?.country} isEditing={isEditing} onChange={(val) => handleUpdate('permanentAddress.country', val)} />
                  <InfoCell label="Pincode" value={editedData.permanentAddress?.pincode} isEditing={isEditing} onChange={(val) => handleUpdate('permanentAddress.pincode', val)} />
                  <InfoCell label="Start Date" value={editedData.permanentAddress?.startDate} isDate isEditing={isEditing} onChange={(val) => handleUpdate('permanentAddress.startDate', val)} />
                  <InfoCell label="To Date" value={editedData.permanentAddress?.toDate} isDate isEditing={isEditing} onChange={(val) => handleUpdate('permanentAddress.toDate', val)} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Work Details (with new fields) ─────────────────── */}
          <SectionCard title="Work Details" icon={Briefcase}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCell label="Employee ID"    value={employee.employeeId}  />
              <InfoCell label="Employee Category" value={employee.employeeCategory} />
              <InfoCell label="Department"     value={employee.department}  />
              <InfoCell label="Team"           value={employee.team}        />
              <InfoCell label="Designation"    value={employee.designation} />
              <InfoCell label="Shift"          value={employee.shift}       />
              <InfoCell label="Work Location"  value={employee.location}    />
              <InfoCell label="Employee Type"  value={employee.employeeType} />
              <InfoCell label="Confirmation Date" value={formatDate(employee.confirmationDate)} isDate />
              <InfoCell label="Employment Status" value={employee.employmentStatus} />
              <InfoCell label="Probation Period" value={employee.probationPeriod} />
              <InfoCell label="Notice Period"  value={employee.noticePeriod} />
              <InfoCell label="Notice Period (Days)" value={employee.noticePeriodDays} />
              <InfoCell label="Referred By"    value={employee.referredBy} />
              <InfoCell label="Reporting To"   value={employee.reportingTo} />
              <InfoCell label="Functional Manager" value={employee.functionalManager} />
              <InfoCell label="HR Partner"     value={employee.hrPartner} />
            </div>
          </SectionCard>
          {/* ── Nominee Details ────────────────────────────────── */}
          <SectionCard title="Nominee Details" icon={Users}>
            {!employee.nominees || employee.nominees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No nominees declared.</p>
            ) : (
              <div className="space-y-4">
                {employee.nominees.map((nominee, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-xl border border-border">
                    <InfoCell label="Name" value={nominee.name} />
                    <InfoCell label="Relationship" value={nominee.relationship} />
                    <InfoCell label="Share Percentage (%)" value={nominee.sharePercentage} />
                    <InfoCell label="Phone" value={nominee.phone} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
          
          {/* ── Emergency & Medical Information ────────────────── */}
          <SectionCard title="Emergency & Medical Information" icon={Heart}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCell label="Emergency Contact Name" value={employee.emergencyContact?.name} />
              <InfoCell label="Emergency Contact #" value={employee.emergencyContact?.phone} />
              <InfoCell label="Relationship" value={employee.medicalInfo?.relationship || employee.emergencyContact?.relationship} />
              <InfoCell label="Medical Conditions" value={employee.medicalInfo?.conditions} />
              <InfoCell label="Allergies" value={employee.medicalInfo?.allergies} />
              <InfoCell label="Blood Group" value={employee.medicalInfo?.bloodGroup || employee.bloodGroup} />
              <InfoCell label="Doctor Name" value={employee.medicalInfo?.doctorName} />
              <InfoCell label="Insurance Provider" value={employee.medicalInfo?.insuranceProvider} />
              <InfoCell label="Insurance Policy #" value={employee.medicalInfo?.insurancePolicyNumber} />
            </div>
          </SectionCard>

          {/* ── Insurance Details ──────────────────────────────── */}
          <SectionCard title="Insurance Details" icon={ShieldCheck}>
            {employee.insurance && employee.insurance.length > 0 ? (
              <div className="space-y-4">
                {employee.insurance.map((ins, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-xl border border-border">
                    <InfoCell label="Policy Type" value={ins.policyType} />
                    <InfoCell label="Policy Number" value={ins.policyNumber} />
                    <InfoCell label="Provider" value={ins.provider} />
                    <InfoCell label="Coverage Amount" value={ins.coverageAmount} />
                    <InfoCell label="Start Date" value={formatDate(ins.startDate)} isDate />
                    <InfoCell label="End Date" value={formatDate(ins.endDate)} isDate />
                    <InfoCell label="Nominee Name" value={ins.nomineeName} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No insurance records available.</p>
            )}
          </SectionCard>

          {/* ── Language Details ───────────────────────────────── */}
          <SectionCard 
            title="Language Details" 
            icon={Languages}
            action={
              <button 
                className="px-4 py-1.5 bg-primary text-white rounded-full text-[10px] font-black transition-all uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                onClick={() => alert("Changes saved successfully!")}
              >
                Save Changes
              </button>
            }
          >
            {languages.length > 0 ? (
              <div className="space-y-4">
                {languages.map((lang, idx) => (
                  <div key={idx} className="p-6 bg-background border border-border rounded-2xl space-y-6 group/lang transition-all hover:border-primary/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Language</label>
                        <input 
                          type="text"
                          value={lang.language}
                          onChange={(e) => handleLanguageChange(idx, "language", e.target.value)}
                          className="w-full px-4 py-3 bg-secondary/30 rounded-xl border border-border/50 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Proficiency Level</label>
                        <select 
                          value={lang.proficiency}
                          onChange={(e) => handleLanguageChange(idx, "proficiency", e.target.value)}
                          className="w-full px-4 py-3 bg-secondary/30 rounded-xl border border-border/50 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Native">Native</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-12">
                      {[
                        { label: "Can Read", key: "canRead" as const },
                        { label: "Can Write", key: "canWrite" as const },
                        { label: "Can Speak", key: "canSpeak" as const }
                      ].map((check, cIdx) => (
                        <div 
                          key={cIdx} 
                          className="flex items-center gap-3 cursor-pointer group/check"
                          onClick={() => handleLanguageChange(idx, check.key, !lang[check.key])}
                        >
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            lang[check.key] 
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110" 
                              : "bg-transparent border-border group-hover/check:border-primary/40"
                          }`}>
                            {lang[check.key] && (
                              <svg className="w-4 h-4 animate-in zoom-in-50 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                            lang[check.key] ? "text-primary" : "text-muted-foreground group-hover/check:text-foreground"
                          }`}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No language details added.</p>
            )}
          </SectionCard>

          {/* ── Asset Details ──────────────────────────────────── */}
          <SectionCard title="Asset Details" icon={Monitor}>
            {employee.assets && employee.assets.length > 0 ? (
              <div className="space-y-4">
                {employee.assets.map((asset, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-xl border border-border">
                    <InfoCell label="Asset Name" value={asset.name} />
                    <InfoCell label="Asset Code" value={asset.code} />
                    <InfoCell label="Asset Type" value={asset.type} />
                    <InfoCell label="Assigned Date" value={formatDate(asset.assignedDate)} isDate />
                    <InfoCell label="Return Date" value={formatDate(asset.returnDate)} isDate />
                    <InfoCell label="Condition" value={asset.condition} />
                    <div className="sm:col-span-2">
                      <InfoCell label="Remarks" value={asset.remarks} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No assets assigned.</p>
            )}
          </SectionCard>

          {/* ── Documents Repository ───────────────────────────── */}
          <SectionCard title="Documents Repository" icon={FileStack}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "PAN Card", "Aadhaar Card", "Resume", "Offer Letter", 
                "Joining Documents", "Educational Certificates", "Salary Slips",
                "Experience Letters", "Passport", "Visa", "Tax Documents",
                "Insurance Documents", "Relieving Letter", "Appraisal Letters", "Increment Letters"
              ].map(doc => (
                <div key={doc} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-xl border border-border hover:bg-secondary/40 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Document Type</p>
                    <p className="text-xs font-black truncate">{doc}</p>
                  </div>
                  <Eye size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
