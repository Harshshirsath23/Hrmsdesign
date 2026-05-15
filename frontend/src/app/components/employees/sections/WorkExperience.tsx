import { useMemo, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { Employee, WorkExperienceEntry } from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import {
  EditableFormCard,
  EditableSectionCard,
  ProfileInfoField,
  UploadField,
  EmptyStateCard,
  ConfirmationDialog,
  validateDateOrder,
} from "../employee-details";

interface Props {
  employee: Employee;
}

const emptyEntry = (id: string): WorkExperienceEntry => ({
  id,
  companyName: "",
  jobTitle: "",
  employmentType: "",
  department: "",
  responsibilities: "",
  technologiesUsed: "",
  location: "",
  experienceLetterFileName: "",
  reasonForLeaving: "",
  startDate: "",
  endDate: "",
});

export function WorkExperience({ employee }: Props) {
  const { handleAdminSave } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<WorkExperienceEntry[]>(employee.workExperience || []);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const baseline = useMemo(() => employee.workExperience || [], [employee.workExperience]);

  const updateRow = (index: number, patch: Partial<WorkExperienceEntry>) => {
    setDraft((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setDraft((rows) => [...rows, emptyEntry(`we-${Date.now()}`)]);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;
    setDraft((rows) => rows.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  };

  const handleSave = async () => {
    for (let i = 0; i < draft.length; i++) {
      const err = validateDateOrder(draft[i].startDate, draft[i].endDate);
      if (err) {
        setDateError(`Row ${i + 1}: ${err}`);
        return;
      }
    }
    setDateError(null);
    const updated = { ...employee, workExperience: draft };
    const ok = await handleAdminSave("Work Experience", employee, updated);
    if (ok) setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(baseline);
    setDateError(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Work Experience</h2>
        <p className="text-sm text-muted-foreground mt-1">Prior employment history for {employee.name}</p>
      </div>

      <EditableSectionCard
        title="Work Experience"
        icon={Building2}
        isEditing={isEditing}
        onEdit={() => {
          setDraft(baseline);
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
              Add Work Experience
            </button>
          ) : null
        }
      >
        {dateError ? <p className="text-sm text-destructive mb-3">{dateError}</p> : null}
        {draft.length === 0 ? (
          <EmptyStateCard
            icon={Building2}
            title="No work experience on file"
            description="Add prior roles using Add Work Experience when editing."
          />
        ) : (
          <div className="space-y-4">
            {draft.map((row, index) => (
              <EditableFormCard
                key={row.id}
                showDelete={isEditing}
                onDelete={() => setDeleteIndex(index)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProfileInfoField
                    label="Company Name"
                    value={row.companyName}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { companyName: v })}
                  />
                  <ProfileInfoField
                    label="Job Title"
                    value={row.jobTitle}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { jobTitle: v })}
                  />
                  <ProfileInfoField
                    label="Employment Type"
                    value={row.employmentType}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { employmentType: v })}
                  />
                  <ProfileInfoField
                    label="Department"
                    value={row.department}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { department: v })}
                  />
                  <ProfileInfoField
                    label="Start Date"
                    value={row.startDate}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { startDate: v })}
                    type="date"
                  />
                  <ProfileInfoField
                    label="End Date"
                    value={row.endDate}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { endDate: v })}
                    type="date"
                  />
                  <ProfileInfoField
                    label="Location"
                    value={row.location}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { location: v })}
                  />
                  <ProfileInfoField
                    label="Reason for Leaving"
                    value={row.reasonForLeaving}
                    editing={isEditing}
                    onChange={(v) => updateRow(index, { reasonForLeaving: v })}
                  />
                  <div className="md:col-span-2">
                    <ProfileInfoField
                      label="Technologies Used"
                      value={row.technologiesUsed}
                      editing={isEditing}
                      onChange={(v) => updateRow(index, { technologiesUsed: v })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <ProfileInfoField
                      label="Responsibilities"
                      value={row.responsibilities}
                      editing={isEditing}
                      onChange={(v) => updateRow(index, { responsibilities: v })}
                      type="textarea"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <UploadField
                      label="Experience Letter Upload"
                      fileName={row.experienceLetterFileName}
                      editing={isEditing}
                      onFileNameChange={(name) => updateRow(index, { experienceLetterFileName: name })}
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
        title="Remove work experience?"
        description="This entry will be removed from the employee record. You can save or cancel section edits afterward."
        confirmLabel="Remove"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
