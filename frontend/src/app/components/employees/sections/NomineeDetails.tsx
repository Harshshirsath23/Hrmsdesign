import { useState } from "react";
import { Users, Plus } from "lucide-react";
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

export function NomineeDetails({ employee }: Props) {
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const [nominees, setNominees] = useState<NomineeEntry[]>(employee.nominees || []);

  const handleSave = async () => {
    const updated = { ...employee, nominees };
    const ok = await handleAdminSave("Nominee Details", employee, updated);
    if (ok) setIsEditing(false);
  };

  const handleCancel = () => {
    setNominees(employee.nominees || []);
    setIsEditing(false);
  };

  const isEditable = employee.editableSections?.includes("nominee-details");

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
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
        headerExtra={
          isEditing ? (
            <button
              type="button"
              onClick={() => {
                setNominees((rows) => [
                  ...rows,
                  {
                    id: `nom-${Date.now()}`,
                    nomineeName: "",
                    relationship: "",
                    dateOfBirth: "",
                    contactNumber: "",
                    address: "",
                    sharePercentage: "",
                    idProofFileName: "",
                    idProofDataUrl: "",
                  },
                ]);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Nominee
            </button>
          ) : null
        }
      >
        {!nominees.length ? (
          <EmptyStateCard icon={Users} title="No nominees on file" />
        ) : (
          <div className="space-y-6">
            {nominees.map((n, idx) => (
              <div key={n.id} className="rounded-2xl border border-border bg-secondary/10 p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProfileInfoField
                    label="Nominee Name"
                    value={n.nomineeName}
                    editing={isEditing}
                    onChange={(v) =>
                      setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, nomineeName: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Relationship"
                    value={n.relationship}
                    editing={isEditing}
                    onChange={(v) =>
                      setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, relationship: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Date Of Birth"
                    value={n.dateOfBirth}
                    editing={isEditing}
                    onChange={(v) =>
                      setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, dateOfBirth: v } : r)))
                    }
                    type="date"
                  />
                  
                  <ProfileInfoField
                    label="Contact Number"
                    value={n.contactNumber}
                    editing={isEditing}
                    onChange={(v) =>
                      setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, contactNumber: v } : r)))
                    }
                  />
                  <div className="sm:col-span-2">
                    <ProfileInfoField
                      label="Address"
                      value={n.address}
                      editing={isEditing}
                      onChange={(v) =>
                        setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, address: v } : r)))
                      }
                      type="textarea"
                    />
                  </div>

                  <ProfileInfoField
                    label="Share Percentage"
                    value={n.sharePercentage}
                    editing={isEditing}
                    onChange={(v) =>
                      setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, sharePercentage: v } : r)))
                    }
                  />
                  <div className="sm:col-span-2">
                    <UploadField
                      label="ID Proof Upload"
                      fileName={n.idProofFileName}
                      dataUrl={n.idProofDataUrl}
                      editing={isEditing}
                      onFileChange={(name, data) =>
                        setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, idProofFileName: name, idProofDataUrl: data } : r)))
                      }
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="pt-2">
                    <button
                      type="button"
                      className="text-xs font-black text-foreground uppercase tracking-widest hover:underline"
                      onClick={() => setNominees((rows) => rows.filter((_, i) => i !== idx))}
                    >
                      Delete nominee
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </EditableSectionCard>
    </div>
  );
}
