import { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { Employee, InsuranceEntry } from "../mockData";
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

export function InsuranceDetails({ employee }: Props) {
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const [insurance, setInsurance] = useState<InsuranceEntry[]>(employee.insurance || []);

  const handleSave = async () => {
    const updated = { ...employee, insurance };
    const ok = await handleAdminSave("Insurance Details", employee, updated);
    if (ok) setIsEditing(false);
  };

  const handleCancel = () => {
    setInsurance(employee.insurance || []);
    setIsEditing(false);
  };

  const isEditable = employee.editableSections?.includes("insurance-details");

  const addPolicy = () => {
    setInsurance((rows) => [
      ...rows,
      {
        id: `ins-${Date.now()}`,
        insuranceProvider: "",
        policyNumber: "",
        coverageType: "",
        coverageAmount: "",
        validTill: "",
        dependentsCovered: "",
      },
    ]);
  };

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-lg font-bold text-foreground">Insurance Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage insurance policies for {employee.name}</p>
      </div>

      <EditableSectionCard
        title="Insurance Details"
        icon={ShieldCheck}
        sectionId="insurance-details"
        canEmployeeEdit={isEditable}
        onToggleEmployeeEdit={(v) => handleToggleEditAccess(employee, "insurance-details", v)}
        requestStatus={employee.editRequestStatus}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
        headerExtra={
          isEditing ? (
            <button
              type="button"
              onClick={addPolicy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Policy
            </button>
          ) : null
        }
      >
        {!insurance.length ? (
          <EmptyStateCard icon={ShieldCheck} title="No insurance policies" />
        ) : (
          <div className="space-y-6">
            {insurance.map((pol, idx) => (
              <div key={pol.id} className="rounded-2xl border border-border bg-secondary/10 p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ProfileInfoField
                    label="Insurance Provider"
                    value={pol.insuranceProvider}
                    editing={isEditing}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, insuranceProvider: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Policy Number"
                    value={pol.policyNumber}
                    editing={isEditing}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, policyNumber: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Coverage Type"
                    value={pol.coverageType}
                    editing={isEditing}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, coverageType: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Coverage Amount"
                    value={pol.coverageAmount}
                    editing={isEditing}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, coverageAmount: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Valid Till"
                    value={pol.validTill}
                    editing={isEditing}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, validTill: v } : r)))
                    }
                    type="date"
                  />
                  <ProfileInfoField
                    label="Dependents Covered"
                    value={pol.dependentsCovered}
                    editing={isEditing}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, dependentsCovered: v } : r)))
                    }
                  />
                  <div className="sm:col-span-2">
                    <UploadField
                      label="Insurance Document Upload"
                      fileName={pol.documentFileName}
                      dataUrl={pol.documentDataUrl}
                      editing={isEditing}
                      onFileChange={(name, data) =>
                        setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, documentFileName: name, documentDataUrl: data } : r)))
                      }
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="pt-2">
                    <button
                      type="button"
                      className="text-xs font-black text-foreground uppercase tracking-widest hover:underline"
                      onClick={() => setInsurance((rows) => rows.filter((_, i) => i !== idx))}
                    >
                      Delete policy
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
