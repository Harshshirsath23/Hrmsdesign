import { useMemo, useState, useEffect } from "react";
import { Key, Plus } from "lucide-react";
import { AccessCardEntry, Employee } from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import {
  EditableSectionCard,
  ProfileInfoField,
  EmptyStateCard,
} from "../employee-details";

interface Props {
  employee: Employee;
}

function emptyCard(employee: Employee): AccessCardEntry {
  return {
    id: `acc-${Date.now()}`,
    employeeId: employee.employeeId,
    cardNumber: "",
  };
}

function validateCards(cards: AccessCardEntry[]): Record<number, string> {
  const errors: Record<number, string> = {};
  cards.forEach((c, idx) => {
    if (!c.cardNumber.trim()) errors[idx] = "Card number is required";
  });
  return errors;
}

export function AccessCardDetails({ employee }: Props) {
  const { handleAdminSave } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const baseline = useMemo(() => employee.accessCards || [], [employee.accessCards]);
  const [cards, setCards] = useState<AccessCardEntry[]>(baseline);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const addCard = () => {
    setCards((rows) => [...rows, emptyCard(employee)]);
  };

  const startEdit = () => {
    setCards(baseline.length ? [...baseline] : [emptyCard(employee)]);
    setErrors({});
    setIsEditing(true);
  };

  const startEditAndAdd = () => {
    setCards([...baseline, emptyCard(employee)]);
    setErrors({});
    setIsEditing(true);
  };

  const handleSave = async () => {
    const nextErrors = validateCards(cards);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const accessCards = cards.map((c) => ({ ...c, employeeId: employee.employeeId }));
    const ok = await handleAdminSave("Access Card Details", employee, { ...employee, accessCards });
    if (ok) {
      setErrors({});
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setCards(baseline);
    setErrors({});
    setIsEditing(false);
  };

  const updateCard = (idx: number, patch: Partial<AccessCardEntry>) => {
    setCards((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    if (errors[idx]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    }
  };

  const displayCards = isEditing ? cards : baseline;

  // No header buttons for employee view; editing should be controlled by admins.

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
        onCancel={handleCancel}
        onSave={handleSave}
        onEdit={startEdit}
        headerExtra={!isEditing ? (
          <button
            type="button"
            onClick={startEditAndAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        ) : null}
      >
        {!displayCards.length ? (
          <EmptyStateCard
            icon={Key}
            title="No access cards"
            description="No access cards registered. Contact admin to add one."
          />
        ) : (
          <div className="space-y-4">
            {displayCards.map((row, i) => (
              <div key={row.id} className="rounded-2xl border border-border bg-secondary/10 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
                  <ProfileInfoField
                    label="Employee ID"
                    value={employee.employeeId}
                    editing={isEditing}
                    readOnly
                  />
                  <ProfileInfoField
                    label="Card Number"
                    value={row.cardNumber}
                    editing={isEditing}
                    error={errors[i]}
                    onChange={(v) => updateCard(i, { cardNumber: v })}
                  />
                </div>
                {isEditing && displayCards.length > 1 ? (
                  <button
                    type="button"
                    className="mt-4 text-xs font-semibold text-destructive hover:underline"
                    onClick={() => setCards((rows) => rows.filter((_, j) => j !== i))}
                  >
                    Remove card
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
