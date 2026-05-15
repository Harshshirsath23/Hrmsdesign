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

interface Props {
  employee: Employee;
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

export function EducationDetails({ employee }: Props) {
  const { handleAdminSave } = useAdminSync();
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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Education Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Academic qualifications for {employee.name}</p>
      </div>

      <EditableSectionCard
        title="Education Details"
        icon={GraduationCap}
        isEditing={isEditing}
        onEdit={() => {
          setDraft(baseline.length ? baseline : [emptyEdu()]);
          setIsEditing(true);
        }}
        onSave={handleSave}
        onCancel={handleCancel}
        headerExtra={
          isEditing ? (
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Education
            </button>
          ) : null
        }
      >
        {formError ? <p className="text-sm text-destructive mb-3">{formError}</p> : null}
        {!draft.length ? (
          <EmptyStateCard
            icon={GraduationCap}
            title="No education records"
            description="Use Edit, then Add Education to capture qualifications."
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
                  />
                  <ProfileInfoField
                    label="Specialization"
                    value={row.specialization}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { specialization: v })}
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
