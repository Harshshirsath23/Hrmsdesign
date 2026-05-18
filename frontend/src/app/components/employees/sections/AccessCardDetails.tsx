import { useMemo, useState, useEffect } from "react";
import { Key, Plus } from "lucide-react";
import { AccessCardEntry, Employee } from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import {
  EditableFormCard,
  EditableSectionCard,
  ProfileInfoField,
  EmptyStateCard,
  ConfirmationDialog,
} from "../employee-details";

interface Props {
  employee: Employee;
}

export function AccessCardDetails({ employee }: Props) {
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<AccessCardEntry[]>(employee.accessCards || []);
  const [delIdx, setDelIdx] = useState<number | null>(null);

  const baseline = useMemo(() => employee.accessCards || [], [employee.accessCards]);

  useEffect(() => {
    setDraft(baseline);
  }, [employee, baseline]);

  const update = (i: number, p: Partial<AccessCardEntry>) =>
    setDraft((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...p } : r)));

  const handleSave = async () => {
    const ok = await handleAdminSave("Access Card Details", employee, { ...employee, accessCards: draft });
    if (ok) setIsEditing(false);
  };

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-lg font-bold text-foreground">Access Card Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Building access cards for {employee.name}</p>
      </div>
      <EditableSectionCard
        title="Access Cards"
        icon={Key}
        isEditing={isEditing}
        onEdit={() => {
          setDraft(baseline);
          setIsEditing(true);
        }}
        onCancel={() => {
          setDraft(baseline);
          setIsEditing(false);
        }}
        onSave={handleSave}
        headerExtra={
          <button
            type="button"
            onClick={() => {
              if (!isEditing) {
                setIsEditing(true);
              }
              setDraft((r) => [...r, { id: `acc-${Date.now()}`, employeeId: employee.employeeId || "", cardNumber: "", fromDate: "", toDate: "" }]);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Access Card
          </button>
        }
      >
        {!draft.length ? (
          <EmptyStateCard icon={Key} title="No access cards" description="Add cards while editing this section." />
        ) : (
          <div className="space-y-4">
            {draft.map((row, i) => (
              <EditableFormCard key={row.id} showDelete={isEditing} onDelete={() => setDelIdx(i)}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ProfileInfoField
                    label="Employee ID"
                    value={row.employeeId || ""}
                    editing={isEditing}
                    onChange={(v) => update(i, { employeeId: v })}
                  />
                  <ProfileInfoField
                    label="Access Card Number"
                    value={row.cardNumber}
                    editing={isEditing}
                    onChange={(v) => update(i, { cardNumber: v })}
                  />
                  <ProfileInfoField
                    label="From Date"
                    value={row.fromDate}
                    editing={isEditing}
                    onChange={(v) => update(i, { fromDate: v })}
                    type="date"
                  />
                  <ProfileInfoField
                    label="To Date"
                    value={row.toDate}
                    editing={isEditing}
                    onChange={(v) => update(i, { toDate: v })}
                    type="date"
                  />
                </div>
              </EditableFormCard>
            ))}
          </div>
        )}
      </EditableSectionCard>
      <ConfirmationDialog
        open={delIdx !== null}
        onOpenChange={(o) => !o && setDelIdx(null)}
        title="Remove access card?"
        description="This entry will be removed when you save the section."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (delIdx === null) return;
          setDraft((rows) => rows.filter((_, j) => j !== delIdx));
          setDelIdx(null);
        }}
      />
    </div>
  );
}
