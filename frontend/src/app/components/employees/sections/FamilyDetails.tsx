import { useState } from "react";
import { Employee } from "../mockData";
import { Users, User, CheckCircle2, AlertCircle, Phone, Heart, ShieldCheck, Edit2, Save, X } from "lucide-react";
import { useAdminSync } from "../../admin/useAdminSync";

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

function EditableField({ label, value, onChange, isEditing }: { label: string; value: string; onChange?: (v: string) => void; isEditing: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
      {isEditing ? (
        <input type="text" value={value} onChange={e => onChange?.(e.target.value)}
          className="text-xs font-bold text-foreground bg-secondary/50 border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30" />
      ) : (
        <span className="text-xs font-bold text-foreground truncate">{value || "—"}</span>
      )}
    </div>
  );
}

export function FamilyDetails({ employee }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFamily, setEditedFamily] = useState(employee.family || []);
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();

  const updateMember = (idx: number, field: string, value: any) => {
    setEditedFamily(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const handleSave = async () => {
    const updatedEmployee = { ...employee, family: editedFamily };
    const success = await handleAdminSave('Family Details', employee, updatedEmployee);
    if (success) setIsEditing(false);
  };

  const isEditable = employee.editableSections?.includes("family-details");
  const getStatusLabel = () => {
    if (employee.editRequestStatus === 'Pending') return { l: 'Pending Employee Update', c: 'bg-amber-500/10 text-amber-600 border-amber-200' };
    if (employee.editRequestStatus === 'Updated') return { l: 'Updated by Employee', c: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' };
    if (isEditable) return { l: 'Editable by Employee', c: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' };
    return { l: 'Locked by Admin', c: 'bg-slate-500/10 text-slate-500 border-slate-200' };
  };

  const status = getStatusLabel();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-2.5">
              <Users size={20} className="text-indigo-500" />
              Family & Dependents
            </h2>
            <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
              {editedFamily.length} Registered Members
            </p>
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-all ${status.c}`}>
            {status.l}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={isEditable}
                onChange={(e) => handleToggleEditAccess(employee, "family-details", e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center ${
                isEditable ? "bg-indigo-500 border-indigo-500" : "border-slate-300 bg-white"
              }`}>
                {isEditable && <Save className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Allow Employee to Edit
            </span>
          </label>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold transition-all hover:bg-primary/90">
                  <Save size={12} /> Save Changes
                </button>
                <button onClick={() => { setEditedFamily(employee.family || []); setIsEditing(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold transition-all hover:bg-secondary">
                  <X size={12} /> Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold transition-all hover:bg-secondary">
                <Edit2 size={12} /> Edit Section
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {editedFamily.map((member, index) => {
          const badgeStyle = RELATIONSHIP_SHADES[member.relationship] || "bg-secondary text-muted-foreground border-border";
          const age = member.dob ? new Date().getFullYear() - new Date(member.dob).getFullYear() : "—";
          
          return (
            <div key={index} className="group relative bg-card border border-border rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-foreground/5 hover:-translate-y-1 overflow-hidden">
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
                      {isEditing ? (
                        <input type="text" value={member.name} onChange={e => updateMember(index, 'name', e.target.value)}
                          className="text-base font-black text-foreground bg-secondary/50 border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2" />
                      ) : (
                        <h4 className="text-base font-black text-foreground">{member.name}</h4>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <StatusBadge icon={ShieldCheck} label="Dependent" active={member.isDependent} />
                        <StatusBadge icon={AlertCircle} label="Emergency Contact" active={member.isEmergencyContact} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">
                    <EditableField label="Date of Birth" isEditing={isEditing}
                      value={member.dob ? member.dob : "—"}
                      onChange={v => updateMember(index, 'dob', v)} />
                    <EditableField label="Gender" isEditing={isEditing} value={member.gender} onChange={v => updateMember(index, 'gender', v)} />
                    <EditableField label="Age" isEditing={false} value={age !== "—" ? `${age} Years` : "—"} />
                    <EditableField label="Blood Group" isEditing={isEditing} value={member.bloodGroup} onChange={v => updateMember(index, 'bloodGroup', v)} />
                    <EditableField label="Phone" isEditing={isEditing} value={member.phone} onChange={v => updateMember(index, 'phone', v)} />
                    <EditableField label="Occupation" isEditing={isEditing} value={member.occupation} onChange={v => updateMember(index, 'occupation', v)} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editedFamily.length === 0 && (
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
