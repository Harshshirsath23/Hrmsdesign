import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Employee } from "../mockData";
import { Globe, BookOpen, AlertCircle, CheckCircle2, Edit2, Save, X } from "lucide-react";
import { useAdminSync } from "../../admin/useAdminSync";
import { addNotification } from "../../../../store/slices/notificationSlice";
import { AppDispatch } from "../../../../store";
import { validatePassport } from "../employee-details";


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
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(employee);
  const { handleAdminSave } = useAdminSync();

  useEffect(() => {
    setEditedData(employee);
    setIsEditing(false);
  }, [employee]);
  const dispatch = useDispatch<AppDispatch>();

  const handleUpdate = (field: keyof Employee, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const pErr = validatePassport(editedData.passportNumber || "");
    if (pErr) {
      dispatch(addNotification({ type: "warning", message: pErr }));
      return;
    }
    const success = await handleAdminSave('Passport & Visa Details', employee, editedData);
    if (success) setIsEditing(false);
  };

  const passportExpired      = isExpired(editedData.passportExpiry);
  const passportExpiringSoon = isExpiringSoon(editedData.passportExpiry);
  const visaExpired          = editedData.visaExpiry ? isExpired(editedData.visaExpiry) : false;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Passport & Visa Details</h2>
          <p className="text-sm text-muted-foreground mt-1">Travel document information for {employee.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all">
                <Save size={12} /> Save Changes
              </button>
              <button onClick={() => { setEditedData(employee); setIsEditing(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-secondary transition-all">
                <X size={12} /> Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-secondary transition-all">
              <Edit2 size={12} /> Edit Section
            </button>
          )}
        </div>
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
              {isEditing ? (
                <input type="text" value={editedData.passportNumber || ''} onChange={e => handleUpdate('passportNumber', e.target.value)}
                  className="text-base font-mono font-bold mt-0.5 bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full focus:outline-none" />
              ) : (
                <p className="text-base font-mono font-bold mt-0.5">{editedData.passportNumber}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Nationality</p>
              {isEditing ? (
                <input type="text" value={editedData.nationality || ''} onChange={e => handleUpdate('nationality', e.target.value)}
                  className="text-base font-bold mt-0.5 bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full focus:outline-none" />
              ) : (
                <p className="text-base font-bold mt-0.5">{editedData.nationality}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-primary-foreground/20">
            {([
              { label: 'Holder Name', field: 'passportHolderName' as keyof Employee, value: editedData.passportHolderName || editedData.name },
              { label: 'Place of Issue', field: 'passportPlaceOfIssue' as keyof Employee, value: editedData.passportPlaceOfIssue || '' },
              { label: 'Country of Issue', field: 'passportCountryOfIssue' as keyof Employee, value: editedData.passportCountryOfIssue || '' },
              { label: 'Category', field: 'passportCategory' as keyof Employee, value: editedData.passportCategory || '' },
              { label: 'Status', field: 'passportStatus' as keyof Employee, value: editedData.passportStatus || '' },
              { label: 'Issue Date', field: 'passportIssueDate' as keyof Employee, value: editedData.passportIssueDate || '' },
              { label: 'Expiry Date', field: 'passportExpiry' as keyof Employee, value: editedData.passportExpiry || '' },
            ]).map(({ label, field, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">{label}</p>
                {isEditing ? (
                  <input type="text" value={value} onChange={e => handleUpdate(field, e.target.value)}
                    className="text-sm font-bold mt-0.5 bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full focus:outline-none" />
                ) : (
                  <p className="text-sm font-bold mt-0.5">{value || '—'}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Visa ─────────────────────────────────────────── */}
      <div className="flat-card bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-foreground" />
            </div>
            Visa Details
          </h3>
          {editedData.visaExpiry && !isEditing ? (
            visaExpired ? (
              <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${EXPIRED_BADGE}`}>
                <AlertCircle className="w-3.5 h-3.5" /> Expired
              </span>
            ) : (
              <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${VALID_BADGE}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
              </span>
            )
          ) : null}
        </div>

        {editedData.visaCountry || editedData.visaType || isEditing ? (
          <div className="bg-background border border-border rounded-lg p-5 space-y-3">
            {(
              [
                ["visaCountry", "Visa Country"],
                ["visaType", "Visa Type"],
                ["visaSponsor", "Visa Sponsor"],
                ["visaStatus", "Visa Status"],
                ["visaNumber", "Visa Number"],
                ["visaIssueDate", "Visa Issue Date"],
                ["visaExpiry", "Visa Expiry"],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground font-medium">{label}</span>
                {isEditing ? (
                  <input
                    type={field.includes("Date") || field.includes("Expiry") ? "date" : "text"}
                    value={(editedData as any)[field] || ""}
                    onChange={(e) => handleUpdate(field, e.target.value)}
                    className="text-sm font-semibold text-foreground bg-secondary/50 border border-border rounded-md px-2 py-1 sm:max-w-xs w-full"
                  />
                ) : (
                  <span className="text-sm font-semibold text-foreground">
                    {field.includes("Date") || field === "visaExpiry"
                      ? (editedData as any)[field]
                        ? new Date((editedData as any)[field]).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"
                      : (editedData as any)[field] || "—"}
                  </span>
                )}
              </div>
            ))}
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
