import { useMemo, useState } from "react";
import { Users, Plus } from "lucide-react";
import { Employee, NomineeEntry } from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import {
  EditableSectionCard,
  ProfileInfoField,
  UploadField,
  EmptyStateCard,
} from "../employee-details";
import { useMasterOptions } from "./useMasterOptions";

interface Props {
  employee: Employee;
  showAddButton?: boolean;
}

const RELATIONSHIP_OPTIONS = [
  { value: "Spouse", label: "Spouse" },
  { value: "Father", label: "Father" },
  { value: "Mother", label: "Mother" },
  { value: "Son", label: "Son" },
  { value: "Daughter", label: "Daughter" },
  { value: "Brother", label: "Brother" },
  { value: "Sister", label: "Sister" },
  { value: "Other", label: "Other" },
];

function emptyNominee(): NomineeEntry {
  return {
    id: `nom-${Date.now()}`,
    nomineeName: "",
    relationship: "",
    dateOfBirth: "",
    contactNumber: "",
    address: "",
    sharePercentage: "",
    idProofFileName: "",
    idProofDataUrl: "",
    email: "",
    nomineeType: "EPF",
    shareEPF: "",
    shareEPS: "",
    shareGratuity: "",
    shareCustom: "",
    isMinor: false,
    guardian: { name: "", relationship: "", contactNumber: "", address: "" },
  };
}

function validateNominees(nominees: NomineeEntry[], typeTotals?: { EPF: number; EPS: number; Gratuity: number; Custom: number }): {
  rowErrors: Record<number, Record<string, string>>;
  formError: string | null;
} {
  const rowErrors: Record<number, Record<string, string>> = {};
  let totalShare = 0;
  const totals = typeTotals || { EPF: 0, EPS: 0, Gratuity: 0, Custom: 0 };

  nominees.forEach((n, idx) => {
    const row: Record<string, string> = {};
    if (!n.nomineeName.trim()) row.nomineeName = "Nominee name is required";
    if (!n.relationship.trim()) row.relationship = "Relationship is required";
    // validate per-type shares if provided, else fall back to legacy sharePercentage
    const shares = [Number(n.shareEPF || 0), Number(n.shareEPS || 0), Number(n.shareGratuity || 0), Number(n.shareCustom || 0)];
    const anyTypeProvided = shares.some((s) => Boolean(s));
    if (anyTypeProvided) {
      shares.forEach((s, i) => {
        if (Number.isNaN(s) || s < 0 || s > 100) {
          const key = ['shareEPF','shareEPS','shareGratuity','shareCustom'][i];
          row[key] = 'Enter a value between 0 and 100';
        } else {
          totalShare += s;
        }
      });
    } else {
      if (!n.sharePercentage.trim()) {
        row.sharePercentage = 'Share percentage is required';
      } else {
        const share = Number(n.sharePercentage);
        if (Number.isNaN(share) || share < 0 || share > 100) {
          row.sharePercentage = 'Enter a value between 0 and 100';
        } else {
          totalShare += share;
        }
      }
    }
    if (n.contactNumber.trim() && !/^\+?[\d\s-]{10,}$/.test(n.contactNumber.trim())) {
      row.contactNumber = "Enter a valid contact number";
    }
    if (Object.keys(row).length) rowErrors[idx] = row;
  });

  // Check per-type totals
  const perTypeErrors: string[] = [];
  if (totals.EPF > 100) perTypeErrors.push(`EPF total ${totals.EPF}% exceeds 100%`);
  if (totals.EPS > 100) perTypeErrors.push(`EPS total ${totals.EPS}% exceeds 100%`);
  if (totals.Gratuity > 100) perTypeErrors.push(`Gratuity total ${totals.Gratuity}% exceeds 100%`);
  if (totals.Custom > 100) perTypeErrors.push(`Custom total ${totals.Custom}% exceeds 100%`);

  const formError = perTypeErrors.length ? perTypeErrors.join('; ') : (nominees.length > 0 && totalShare > 100 ? `Total allocation must not exceed 100% (currently ${totalShare}%)` : null);

  return { rowErrors, formError };
}

export function NomineeDetails({ employee, showAddButton = true }: Props) {
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();
  const relationOptions = useMasterOptions("Relation");
  const [isEditing, setIsEditing] = useState(false);
  const baseline = useMemo(() => employee.nominees || [], [employee.nominees]);
  const [nominees, setNominees] = useState<NomineeEntry[]>(baseline);
  const [rowErrors, setRowErrors] = useState<Record<number, Record<string, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const NOMINEE_TYPES = [
    { value: 'EPF', label: 'EPF' },
    { value: 'EPS', label: 'EPS' },
    { value: 'Gratuity', label: 'Gratuity' },
    { value: 'Custom', label: 'Custom' },
  ];

  const parseNum = (v?: string) => {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n : 0;
  };

  const typeTotals = useMemo(() => {
    return nominees.reduce(
      (acc, n) => {
        acc.EPF += parseNum(n.shareEPF);
        acc.EPS += parseNum(n.shareEPS);
        acc.Gratuity += parseNum(n.shareGratuity);
        acc.Custom += parseNum(n.shareCustom);
        return acc;
      },
      { EPF: 0, EPS: 0, Gratuity: 0, Custom: 0 }
    );
  }, [nominees]);

  const isEditable = employee.editableSections?.includes("nominee-details");

  const startEdit = () => {
    setNominees(baseline.length ? [...baseline] : []);
    setRowErrors({});
    setFormError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const { rowErrors: nextRowErrors, formError: nextFormError } = validateNominees(nominees, typeTotals);
    if (Object.keys(nextRowErrors).length || nextFormError) {
      setRowErrors(nextRowErrors);
      setFormError(nextFormError);
      return;
    }
    const ok = await handleAdminSave("Nominee Details", employee, { ...employee, nominees });
    if (ok) {
      setRowErrors({});
      setFormError(null);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNominees(baseline);
    setRowErrors({});
    setFormError(null);
    setIsEditing(false);
  };

  const updateNominee = (idx: number, patch: Partial<NomineeEntry>) => {
    setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    if (rowErrors[idx]) {
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    }
    if (formError) setFormError(null);
  };

  const addNominee = () => {
    setNominees((rows) => [...rows, emptyNominee()]);
    setIsEditing(true);
  };

  const displayNominees = isEditing ? nominees : baseline;

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-lg font-bold text-foreground">Nominee Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage nominees for {employee.name}</p>
      </div>

      <EditableSectionCard
        title="Nominee Details"
        icon={Users}
        sectionId="nominee-details"
        canEmployeeEdit={isEditable}
        onToggleEmployeeEdit={(v) => handleToggleEditAccess(employee, "nominee-details", v)}
        requestStatus={employee.editRequestStatus}
        isEditing={isEditing}
        onEdit={startEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        headerExtra={showAddButton ? (
          <button
            type="button"
            onClick={addNominee}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold transition-colors hover:bg-secondary`}
          >
            <Plus className="h-3.5 w-3.5" />
            Add New
          </button>
        ) : null}
      >
        {formError ? (
          <p className="mb-4 text-sm text-destructive font-medium">{formError}</p>
        ) : null}
        {!displayNominees.length ? (
          <EmptyStateCard icon={Users} title="No nominees on file" description="Nominee details will appear here once added." />
        ) : (
          <div className="space-y-6">
            {displayNominees.map((n, idx) => {
              const currentSum = parseNum(n.shareEPF) + parseNum(n.shareEPS) + parseNum(n.shareGratuity) + parseNum(n.shareCustom);
              const legacySum = parseNum(n.sharePercentage);
              const nomineeTotal = currentSum > 0 ? currentSum : legacySum;

              

              return (
                <div key={n.id} className="rounded-2xl border border-border bg-secondary/10 p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    <ProfileInfoField label="Nominee Name" value={n.nomineeName} editing={isEditing} error={rowErrors[idx]?.nomineeName} onChange={(v) => updateNominee(idx, { nomineeName: v })} />
                    <ProfileInfoField label="Nominee Email" value={n.email || ''} editing={isEditing} onChange={(v) => updateNominee(idx, { email: v })} />
                    <ProfileInfoField
                      label="Nominee Type"
                      value={n.nomineeType || 'EPF'}
                      editing={isEditing}
                      options={NOMINEE_TYPES}
                      onChange={(v) => updateNominee(idx, {
                        nomineeType: v,
                        // clear other type shares when switching type
                        shareEPF: v === 'EPF' ? n.shareEPF : '',
                        shareEPS: v === 'EPS' ? n.shareEPS : '',
                        shareGratuity: v === 'Gratuity' ? n.shareGratuity : '',
                        shareCustom: v === 'Custom' ? n.shareCustom : '',
                      })}
                    />

                    <ProfileInfoField label="Relationship" value={n.relationship} editing={isEditing} options={relationOptions.length ? relationOptions : RELATIONSHIP_OPTIONS} error={rowErrors[idx]?.relationship} onChange={(v) => updateNominee(idx, { relationship: v })} />
                    <ProfileInfoField label="Date Of Birth" value={n.dateOfBirth} editing={isEditing} type="date" onChange={(v) => updateNominee(idx, { dateOfBirth: v })} />
                    <ProfileInfoField label="Contact Number" value={n.contactNumber} editing={isEditing} type="tel" error={rowErrors[idx]?.contactNumber} onChange={(v) => updateNominee(idx, { contactNumber: v })} />

                    <div className="sm:col-span-2">
                      <ProfileInfoField label="Address" value={n.address} editing={isEditing} type="textarea" onChange={(v) => updateNominee(idx, { address: v })} />
                    </div>

                          <div className="sm:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                            {(() => {
                              const type = n.nomineeType || 'EPF';
                              const map: Record<string, { key: 'shareEPF' | 'shareEPS' | 'shareGratuity' | 'shareCustom'; label: string }> = {
                                EPF: { key: 'shareEPF', label: 'EPF %' },
                                EPS: { key: 'shareEPS', label: 'EPS %' },
                                Gratuity: { key: 'shareGratuity', label: 'Gratuity %' },
                                Custom: { key: 'shareCustom', label: 'Custom %' },
                              };
                              const entry = map[type] || map.EPF;
                              return (
                                <ProfileInfoField
                                  label={entry.label}
                                  value={(n as any)[entry.key] || ''}
                                  editing={isEditing}
                                  type="number"
                                  onChange={(v) => {
                                    // clamp by per-type remaining
                                    const key = entry.key;
                                    let value = Number(v || 0);
                                    if (Number.isNaN(value)) value = 0;
                                    const totalExcl = (typeTotals as any)[type] - parseNum((n as any)[key]);
                                    const allowed = Math.max(0, 100 - totalExcl);
                                    if (value > allowed) value = allowed;
                                    updateNominee(idx, { [key]: String(value) } as Partial<NomineeEntry>);
                                  }}
                                />
                              );
                            })()}
                          </div>

                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={Boolean(n.isMinor)} disabled={!isEditing} onChange={(e) => updateNominee(idx, { isMinor: e.target.checked })} />
                        <span className="text-sm">Is Minor Nominee?</span>
                      </label>
                    </div>

                    {n.isMinor ? (
                      <div className="sm:col-span-3 space-y-3">
                        <h4 className="text-sm font-semibold">Guardian Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <ProfileInfoField label="Guardian Name" value={n.guardian?.name || ''} editing={isEditing} onChange={(v) => updateNominee(idx, { guardian: { ...(n.guardian || {}), name: v } })} />
                          <ProfileInfoField label="Relationship with Minor" value={n.guardian?.relationship || ''} editing={isEditing} onChange={(v) => updateNominee(idx, { guardian: { ...(n.guardian || {}), relationship: v } })} />
                          <ProfileInfoField label="Contact Number" value={n.guardian?.contactNumber || ''} editing={isEditing} onChange={(v) => updateNominee(idx, { guardian: { ...(n.guardian || {}), contactNumber: v } })} />
                          <ProfileInfoField label="Address" value={n.guardian?.address || ''} editing={isEditing} type="textarea" onChange={(v) => updateNominee(idx, { guardian: { ...(n.guardian || {}), address: v } })} />
                        </div>
                      </div>
                    ) : null}

                    <div className="sm:col-span-2">
                      <UploadField label="ID Proof Upload" fileName={n.idProofFileName} dataUrl={n.idProofDataUrl} editing={isEditing} onFileChange={(name, data) => updateNominee(idx, { idProofFileName: name, idProofDataUrl: data })} />
                    </div>
                  </div>
                  {isEditing && displayNominees.length > 1 ? (
                    <button type="button" className="text-xs font-semibold text-destructive hover:underline" onClick={() => setNominees((rows) => rows.filter((_, i) => i !== idx))}>
                      Remove nominee
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </EditableSectionCard>
    </div>
  );
}
