import { useMemo, useState } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { EducationEntry, Employee } from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import {
  EditableFormCard,
  EditableSectionCard,
  ProfileInfoField,
  EmptyStateCard,
  ConfirmationDialog,
  validateEducationYear,
  validatePercentageCgpa,
} from "../employee-details";
import { useMasterOptions } from "./useMasterOptions";

interface Props {
  employee: Employee;
  showAddButton?: boolean;
}

const emptyEdu = (): EducationEntry => ({
  qualification: "",
  specialization: "",
  institutionName: "",
  university: "",
  yearOfPassing: "",
  percentageCgpa: "",
  grade: "",
});

export function EducationDetails({ employee, showAddButton = true }: Props) {
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();
  const qualificationOptions = useMasterOptions("Qualification");
  const specializationOptions = useMasterOptions("EducationSpecialization");
  const boardOptions = useMasterOptions("Board");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EducationEntry[]>(employee.education || []);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const baseline = useMemo(() => employee.education || [], [employee.education]);

  const updateRow = (index: number, patch: Partial<EducationEntry>) => {
    setDraft((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setDraft((rows) => [...rows, emptyEdu()]);
    setIsEditing(true);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;
    setDraft((rows) => rows.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  };

  const handleSave = async () => {
    for (let i = 0; i < draft.length; i++) {
      const row = draft[i];
      const hasAny = Object.values(row).some((v) => String(v).trim() !== "");
      if (!hasAny) continue;
      const yErr = validateEducationYear(row.yearOfPassing);
      if (yErr) {
        setFormError(`Education ${i + 1}: ${yErr}`);
        return;
      }
      const pErr = validatePercentageCgpa(row.percentageCgpa);
      if (pErr) {
        setFormError(`Education ${i + 1}: ${pErr}`);
        return;
      }
    }
    setFormError(null);
    const updated = { ...employee, education: draft.filter((r) => Object.values(r).some((v) => String(v).trim() !== "")) };
    const ok = await handleAdminSave("Education Details", employee, updated);
    if (ok) setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(baseline);
    setFormError(null);
    setIsEditing(false);
  };

  const isEditable = employee.editableSections?.includes("education-details");

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-lg font-bold text-foreground">Education Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Academic qualifications for {employee.name}</p>
      </div>

      <EditableSectionCard
        title="Education Details"
        icon={GraduationCap}
        sectionId="education-details"
        canEmployeeEdit={isEditable}
        onToggleEmployeeEdit={(v) => handleToggleEditAccess(employee, "education-details", v)}
        requestStatus={employee.editRequestStatus}
        isEditing={isEditing}
        onEdit={() => {
          setDraft(baseline.length ? baseline : [emptyEdu()]);
          setIsEditing(true);
        }}
        onSave={handleSave}
        onCancel={handleCancel}
        headerExtra={showAddButton ? (
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold transition-colors hover:bg-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New
          </button>
        ) : null}
      >
        {formError ? <p className="text-sm text-destructive mb-3">{formError}</p> : null}
        {!draft.length ? (
          <EmptyStateCard
            icon={GraduationCap}
            title="No education records"
            description="Contact employee to update their educational qualifications."
          />
        ) : (
          <div className="space-y-4">
            {draft.map((row, index) => (
              <EditableFormCard
                key={`edu-${index}-${row.institutionName}`}
                showDelete={isEditing}
                onDelete={() => setDeleteIndex(index)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProfileInfoField
                    label="Qualification"
                    value={row.qualification}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { qualification: v })}
                    options={qualificationOptions}
                  />
                  <ProfileInfoField
                    label="Specialization"
                    value={row.specialization}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { specialization: v })}
                    options={specializationOptions}
                  />
                  <ProfileInfoField
                    label="Institution Name"
                    value={row.institutionName}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { institutionName: v })}
                  />
                  <ProfileInfoField
                    label="University"
                    value={row.university}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { university: v })}
                    options={boardOptions}
                  />
                  <ProfileInfoField
                    label="Year Of Passing"
                    value={row.yearOfPassing}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { yearOfPassing: v })}
                  />
                  <ProfileInfoField
                    label="Percentage / CGPA"
                    value={row.percentageCgpa}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { percentageCgpa: v })}
                  />
                  <div className="md:col-span-2 max-w-md">
                    <ProfileInfoField
                      label="Grade"
                      value={row.grade}
                      editing={isEditing}
                      onChange={(v) => updateRow(index, { grade: v })}
                    />
                  </div>
                </div>
              </EditableFormCard>
            ))}
          </div>
        )}
      </EditableSectionCard>

      <ConfirmationDialog
        open={deleteIndex !== null}
        onOpenChange={(o) => !o && setDeleteIndex(null)}
        title="Remove education entry?"
        description="This qualification row will be removed. Save the section to persist."
        confirmLabel="Remove"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
