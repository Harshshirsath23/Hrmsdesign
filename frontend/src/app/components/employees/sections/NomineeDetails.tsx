import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Employee, NomineeEntry } from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import {
  EditableSectionCard,
  ProfileInfoField,
  UploadField,
  EmptyStateCard,
} from "../employee-details";

interface Props {
  employee: Employee;
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
  };
}

function validateNominees(nominees: NomineeEntry[]): {
  rowErrors: Record<number, Record<string, string>>;
  formError: string | null;
} {
  const rowErrors: Record<number, Record<string, string>> = {};
  let totalShare = 0;

  nominees.forEach((n, idx) => {
    const row: Record<string, string> = {};
    if (!n.nomineeName.trim()) row.nomineeName = "Nominee name is required";
    if (!n.relationship.trim()) row.relationship = "Relationship is required";
    if (!n.sharePercentage.trim()) {
      row.sharePercentage = "Share percentage is required";
    } else {
      const share = Number(n.sharePercentage);
      if (Number.isNaN(share) || share < 0 || share > 100) {
        row.sharePercentage = "Enter a value between 0 and 100";
      } else {
        totalShare += share;
      }
    }
    if (n.contactNumber.trim() && !/^\+?[\d\s-]{10,}$/.test(n.contactNumber.trim())) {
      row.contactNumber = "Enter a valid contact number";
    }
    if (Object.keys(row).length) rowErrors[idx] = row;
  });

  const formError =
    nominees.length > 0 && Math.round(totalShare) !== 100
      ? `Total share must equal 100% (currently ${totalShare}%)`
      : null;

  return { rowErrors, formError };
}

export function NomineeDetails({ employee }: Props) {
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const baseline = useMemo(() => employee.nominees || [], [employee.nominees]);
  const [nominees, setNominees] = useState<NomineeEntry[]>(baseline);
  const [rowErrors, setRowErrors] = useState<Record<number, Record<string, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const isEditable = employee.editableSections?.includes("nominee-details");

  const startEdit = () => {
    setNominees(baseline.length ? [...baseline] : []);
    setRowErrors({});
    setFormError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const { rowErrors: nextRowErrors, formError: nextFormError } = validateNominees(nominees);
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
      >
        {formError ? (
          <p className="mb-4 text-sm text-destructive font-medium">{formError}</p>
        ) : null}
        {!displayNominees.length ? (
          <EmptyStateCard icon={Users} title="No nominees on file" description="Nominee details will appear here once added." />
        ) : (
          <div className="space-y-6">
            {displayNominees.map((n, idx) => (
              <div key={n.id} className="rounded-2xl border border-border bg-secondary/10 p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProfileInfoField
                    label="Nominee Name"
                    value={n.nomineeName}
                    editing={isEditing}
                    error={rowErrors[idx]?.nomineeName}
                    onChange={(v) => updateNominee(idx, { nomineeName: v })}
                  />
                  <ProfileInfoField
                    label="Relationship"
                    value={n.relationship}
                    editing={isEditing}
                    type="select"
                    options={RELATIONSHIP_OPTIONS}
                    error={rowErrors[idx]?.relationship}
                    onChange={(v) => updateNominee(idx, { relationship: v })}
                  />
                  <ProfileInfoField
                    label="Date Of Birth"
                    value={n.dateOfBirth}
                    editing={isEditing}
                    type="date"
                    onChange={(v) => updateNominee(idx, { dateOfBirth: v })}
                  />
                  <ProfileInfoField
                    label="Contact Number"
                    value={n.contactNumber}
                    editing={isEditing}
                    type="tel"
                    error={rowErrors[idx]?.contactNumber}
                    onChange={(v) => updateNominee(idx, { contactNumber: v })}
                  />
                  <div className="sm:col-span-2">
                    <ProfileInfoField
                      label="Address"
                      value={n.address}
                      editing={isEditing}
                      type="textarea"
                      onChange={(v) => updateNominee(idx, { address: v })}
                    />
                  </div>
                  <ProfileInfoField
                    label="Share Percentage (%)"
                    value={n.sharePercentage}
                    editing={isEditing}
                    type="number"
                    error={rowErrors[idx]?.sharePercentage}
                    onChange={(v) => updateNominee(idx, { sharePercentage: v })}
                  />
                  <div className="sm:col-span-2">
                    <UploadField
                      label="ID Proof Upload"
                      fileName={n.idProofFileName}
                      dataUrl={n.idProofDataUrl}
                      editing={isEditing}
                      onFileChange={(name, data) =>
                        updateNominee(idx, { idProofFileName: name, idProofDataUrl: data })
                      }
                    />
                  </div>
                </div>
                {isEditing && displayNominees.length > 1 ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-destructive hover:underline"
                    onClick={() => setNominees((rows) => rows.filter((_, i) => i !== idx))}
                  >
                    Remove nominee
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </EditableSectionCard>
    </div>
  );
}
