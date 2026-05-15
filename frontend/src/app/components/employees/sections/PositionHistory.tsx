import { useMemo, useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { Employee, PositionHistoryEntry } from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import {
  EditableFormCard,
  EditableSectionCard,
  ProfileInfoField,
  ConfirmationDialog,
} from "../employee-details";

interface Props {
  employee: Employee;
}

export function PositionHistory({ employee }: Props) {
  const { handleAdminSave } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const [rows, setRows] = useState<PositionHistoryEntry[]>(employee.positionHistory || []);
  const [delIdx, setDelIdx] = useState<number | null>(null);

  const baseline = useMemo(() => employee.positionHistory || [], [employee.positionHistory]);

  const update = (i: number, p: Partial<PositionHistoryEntry>) =>
    setRows((list) => list.map((r, idx) => (idx === i ? { ...r, ...p } : r)));

  const addRow = () => {
    setRows((list) => [
      ...list,
      {
        id: `pos-${Date.now()}`,
        title: "",
        department: "",
        from: "",
        to: "",
        reportingTo: "",
        isCurrentPosition: false,
      },
    ]);
  };

  const handleSave = async () => {
    const ok = await handleAdminSave("Position History", employee, { ...employee, positionHistory: rows });
    if (ok) setIsEditing(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Position History</h2>
        <p className="text-sm text-muted-foreground mt-1">Career progression within the organization</p>
      </div>
      <EditableSectionCard
        title="Position History"
        icon={Briefcase}
        isEditing={isEditing}
        onEdit={() => {
          setRows(baseline.map((r, i) => ({ ...r, id: r.id || `pos-${employee.id}-${i}` })));
          setIsEditing(true);
        }}
        onCancel={() => {
          setRows(baseline);
          setIsEditing(false);
        }}
        onSave={handleSave}
        headerExtra={
          isEditing ? (
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Position
            </button>
          ) : null
        }
      >
        <div className="space-y-4">
          {rows.map((pos, index) => (
            <EditableFormCard
              key={pos.id}
              showDelete={isEditing}
              onDelete={() => setDelIdx(index)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileInfoField
                  label="Designation"
                  value={pos.title}
                  editing={isEditing}
                  onChange={(v) => update(index, { title: v })}
                />
                <ProfileInfoField
                  label="Department"
                  value={pos.department}
                  editing={isEditing}
                  onChange={(v) => update(index, { department: v })}
                />
                <ProfileInfoField
                  label="From Date"
                  value={pos.from}
                  editing={isEditing}
                  onChange={(v) => update(index, { from: v })}
                  type="date"
                />
                <ProfileInfoField
                  label="To Date"
                  value={pos.to === "Present" ? "" : pos.to}
                  editing={isEditing}
                  onChange={(v) => update(index, { to: v })}
                  type="date"
                />
                <div className="md:col-span-2">
                  <ProfileInfoField
                    label="Reporting Manager"
                    value={pos.reportingTo}
                    editing={isEditing}
                    onChange={(v) => update(index, { reportingTo: v })}
                  />
                </div>
                <label className="md:col-span-2 flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!pos.isCurrentPosition || pos.to === "Present"}
                    disabled={!isEditing}
                    onChange={() => {
                      if (!isEditing) return;
                      const cur = rows[index];
                      const isCur = cur.isCurrentPosition || cur.to === "Present";
                      if (isCur) {
                        update(index, { isCurrentPosition: false, to: "" });
                      } else {
                        setRows((list) =>
                          list.map((r, i) => ({
                            ...r,
                            isCurrentPosition: i === index,
                            to: i === index ? "Present" : r.to === "Present" ? "" : r.to,
                          }))
                        );
                      }
                    }}
                  />
                  Current position
                </label>
              </div>
            </EditableFormCard>
          ))}
        </div>
      </EditableSectionCard>
      <ConfirmationDialog
        open={delIdx !== null}
        onOpenChange={(o) => !o && setDelIdx(null)}
        title="Remove position?"
        description="This row will be removed. Save the section to persist."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (delIdx === null) return;
          setRows((list) => list.filter((_, i) => i !== delIdx));
          setDelIdx(null);
        }}
      />
    </div>
  );
}
