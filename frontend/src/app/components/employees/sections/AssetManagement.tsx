import { useState, useEffect } from "react";
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

export function AssetManagement({ employee }: Props) {
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const [assets, setAssets] = useState<AssetEntry[]>(employee.assets || []);

  useEffect(() => {
    setAssets(employee.assets || []);
  }, [employee]);

  const handleSave = async () => {
    const updated = { ...employee, assets };
    const ok = await handleAdminSave("Asset Management", employee, updated);
    if (ok) setIsEditing(false);
  };

  const handleCancel = () => {
    setAssets(employee.assets || []);
    setIsEditing(false);
  };

  const addAsset = () => {
    setAssets((rows) => [
      ...rows,
      {
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
      },
    ]);
  };

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
        onEdit={() => {
          setAssets(employee.assets || []);
          setIsEditing(true);
        }}
        onCancel={handleCancel}
        onSave={handleSave}
        headerExtra={
          <button
            type="button"
            onClick={() => {
              if (!isEditing) {
                setIsEditing(true);
              }
              addAsset();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Asset
          </button>
        }
      >
        {!assets.length ? (
          <EmptyStateCard icon={Monitor} title="No assets assigned" />
        ) : (
          <div className="space-y-6">
            {assets.map((a, idx) => (
              <div key={a.id} className="rounded-2xl border border-border bg-secondary/10 p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ProfileInfoField
                    label="Asset Name"
                    value={a.assetName}
                    editing={isEditing}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, assetName: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Asset ID"
                    value={a.assetId}
                    editing={isEditing}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, assetId: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Asset Category"
                    value={a.assetCategory}
                    editing={isEditing}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, assetCategory: v } : r)))
                    }
                  />
                  
                  <ProfileInfoField
                    label="Serial Number"
                    value={a.serialNumber}
                    editing={isEditing}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, serialNumber: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Assign Date"
                    value={a.assignedDate}
                    editing={isEditing}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, assignedDate: v } : r)))
                    }
                    type="date"
                  />
                  <ProfileInfoField
                    label="Return Date"
                    value={a.returnDate || ""}
                    editing={isEditing}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, returnDate: v } : r)))
                    }
                    type="date"
                  />

                  <ProfileInfoField
                    label="Asset Condition"
                    value={a.assetCondition}
                    editing={isEditing}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, assetCondition: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Status"
                    value={a.status}
                    editing={isEditing}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, status: v } : r)))
                    }
                  />
                  <div className="lg:col-span-4">
                    <ProfileInfoField
                      label="Remarks"
                      value={a.remarks || ""}
                      editing={isEditing}
                      onChange={(v) =>
                        setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, remarks: v } : r)))
                      }
                      type="textarea"
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="pt-2">
                    <button
                      type="button"
                      className="text-xs font-black text-foreground uppercase tracking-widest hover:underline"
                      onClick={() => setAssets((rows) => rows.filter((_, i) => i !== idx))}
                    >
                      Delete asset
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
