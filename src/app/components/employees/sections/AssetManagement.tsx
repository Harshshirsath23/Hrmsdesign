import { useMemo, useState } from "react";
import { Monitor, Plus } from "lucide-react";
import { Employee, AssetEntry } from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import {
  EditableSectionCard,
  ProfileInfoField,
  EmptyStateCard,
} from "../employee-details";

interface Props {
  employee: Employee;
}

const STATUS_OPTIONS = [
  { value: "Assigned", label: "Assigned" },
  { value: "Returned", label: "Returned" },
  { value: "Lost", label: "Lost" },
  { value: "Under Repair", label: "Under Repair" },
];

const CONDITION_OPTIONS = [
  { value: "New", label: "New" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" },
  { value: "Damaged", label: "Damaged" },
];

const CATEGORY_OPTIONS = [
  { value: "Laptop", label: "Laptop" },
  { value: "Mobile", label: "Mobile" },
  { value: "Monitor", label: "Monitor" },
  { value: "Accessories", label: "Accessories" },
  { value: "Other", label: "Other" },
];

function emptyAsset(): AssetEntry {
  return {
    id: `ast-${Date.now()}`,
    assetName: "",
    assetId: "",
    assetCategory: "",
    serialNumber: "",
    assignedDate: "",
    returnDate: "",
    assetCondition: "",
    status: "Assigned",
    remarks: "",
  };
}

function validateAssets(assets: AssetEntry[]): Record<number, Record<string, string>> {
  const errors: Record<number, Record<string, string>> = {};
  assets.forEach((a, idx) => {
    const row: Record<string, string> = {};
    if (!a.assetName.trim()) row.assetName = "Asset name is required";
    if (!a.assetId.trim()) row.assetId = "Asset ID is required";
    if (!a.assetCategory.trim()) row.assetCategory = "Category is required";
    if (!a.assignedDate) row.assignedDate = "Assign date is required";
    if (a.returnDate && a.assignedDate && a.returnDate < a.assignedDate) {
      row.returnDate = "Return date cannot be before assign date";
    }
    if (!a.status.trim()) row.status = "Status is required";
    if (Object.keys(row).length) errors[idx] = row;
  });
  return errors;
}

export function AssetManagement({ employee }: Props) {
  const { handleAdminSave } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const baseline = useMemo(() => employee.assets || [], [employee.assets]);
  const [assets, setAssets] = useState<AssetEntry[]>(baseline);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  const addAsset = () => {
    setAssets((rows) => [...rows, emptyAsset()]);
  };

  const startEdit = () => {
    setAssets(baseline.length ? [...baseline] : [emptyAsset()]);
    setErrors({});
    setIsEditing(true);
  };

  const startEditAndAdd = () => {
    setAssets([...baseline, emptyAsset()]);
    setErrors({});
    setIsEditing(true);
  };

  const handleSave = async () => {
    const nextErrors = validateAssets(assets);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const ok = await handleAdminSave("Asset Management", employee, { ...employee, assets });
    if (ok) {
      setErrors({});
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setAssets(baseline);
    setErrors({});
    setIsEditing(false);
  };

  const updateAsset = (idx: number, patch: Partial<AssetEntry>) => {
    setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    setErrors((prev) => {
      if (!prev[idx]) return prev;
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const displayAssets = isEditing ? assets : baseline;

  const addButton = (
    <button
      type="button"
      onClick={() => (isEditing ? addAsset() : startEditAndAdd())}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      Add Asset
    </button>
  );

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-lg font-bold text-foreground">Asset Management</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage company assets assigned to {employee.name}</p>
      </div>

      <EditableSectionCard
        title="Asset Management"
        icon={Monitor}
        isEditing={isEditing}
        onEdit={startEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        headerExtra={addButton}
      >
        {!displayAssets.length ? (
          <EmptyStateCard icon={Monitor} title="No assets assigned" description="Use Add Asset to record asset details." />
        ) : (
          <div className="space-y-6">
            {displayAssets.map((a, idx) => (
              <div key={a.id} className="rounded-2xl border border-border bg-secondary/10 p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProfileInfoField
                    label="Asset Name"
                    value={a.assetName}
                    editing={isEditing}
                    error={errors[idx]?.assetName}
                    onChange={(v) => updateAsset(idx, { assetName: v })}
                  />
                  <ProfileInfoField
                    label="Asset ID"
                    value={a.assetId}
                    editing={isEditing}
                    error={errors[idx]?.assetId}
                    onChange={(v) => updateAsset(idx, { assetId: v })}
                  />
                  <ProfileInfoField
                    label="Asset Category"
                    value={a.assetCategory}
                    editing={isEditing}
                    type="select"
                    options={CATEGORY_OPTIONS}
                    error={errors[idx]?.assetCategory}
                    onChange={(v) => updateAsset(idx, { assetCategory: v })}
                  />
                  <ProfileInfoField
                    label="Serial Number"
                    value={a.serialNumber}
                    editing={isEditing}
                    onChange={(v) => updateAsset(idx, { serialNumber: v })}
                  />
                  <ProfileInfoField
                    label="Assign Date"
                    value={a.assignedDate}
                    editing={isEditing}
                    type="date"
                    error={errors[idx]?.assignedDate}
                    onChange={(v) => updateAsset(idx, { assignedDate: v })}
                  />
                  <ProfileInfoField
                    label="Return Date"
                    value={a.returnDate || ""}
                    editing={isEditing}
                    type="date"
                    error={errors[idx]?.returnDate}
                    onChange={(v) => updateAsset(idx, { returnDate: v })}
                  />
                  <ProfileInfoField
                    label="Asset Condition"
                    value={a.assetCondition}
                    editing={isEditing}
                    type="select"
                    options={CONDITION_OPTIONS}
                    onChange={(v) => updateAsset(idx, { assetCondition: v })}
                  />
                  <ProfileInfoField
                    label="Status"
                    value={a.status}
                    editing={isEditing}
                    type="select"
                    options={STATUS_OPTIONS}
                    error={errors[idx]?.status}
                    onChange={(v) => updateAsset(idx, { status: v })}
                  />
                  <div className="hidden lg:block" aria-hidden />
                  <div className="sm:col-span-2 lg:col-span-3">
                    <ProfileInfoField
                      label="Remarks"
                      value={a.remarks || ""}
                      editing={isEditing}
                      type="textarea"
                      onChange={(v) => updateAsset(idx, { remarks: v })}
                    />
                  </div>
                </div>
                {isEditing && displayAssets.length > 1 ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-destructive hover:underline"
                    onClick={() => setAssets((rows) => rows.filter((_, i) => i !== idx))}
                  >
                    Remove asset
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
