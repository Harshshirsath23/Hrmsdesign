import { useEffect, useState } from "react";
import { Employee } from "../mockData";
import { ShieldCheck, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { useAdminSync } from "../../admin/useAdminSync";
import {
  EditableSectionCard,
  ProfileInfoField,
} from "../employee-details";

interface Props {
  employee: Employee;
}

const DEFAULT_BG_CHECK = {
  verificationStatus: "Pending",
  completedOn: "",
  agencyName: "",
  remarks: "",
  verifiedBy: "",
  referenceNumber: "",
  reportUrl: "",
};

const STATUS_OPTIONS = [
  { value: "Verified", label: "Verified" },
  { value: "In Progress", label: "In Progress" },
  { value: "Pending", label: "Pending" },
  { value: "Failed", label: "Failed" },
  { value: "Not Required", label: "Not Required" },
];

export function BackgroundCheck({ employee }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBgCheck, setEditedBgCheck] = useState(employee.backgroundCheck || DEFAULT_BG_CHECK);
  const { handleAdminSave } = useAdminSync();

  useEffect(() => {
    setEditedBgCheck(employee.backgroundCheck || DEFAULT_BG_CHECK);
    setIsEditing(false);
  }, [employee]);

  const updateBgCheck = (field: string, value: string) => {
    setEditedBgCheck((prev) => ({ ...(prev || DEFAULT_BG_CHECK), [field]: value }));
  };

  const handleSave = async () => {
    const updated = { ...employee, backgroundCheck: editedBgCheck };
    const success = await handleAdminSave("Background Check", employee, updated);
    if (success) setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedBgCheck(employee.backgroundCheck || DEFAULT_BG_CHECK);
    setIsEditing(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return "—";
    }
  };

  const status = editedBgCheck?.verificationStatus || "Pending";
  const display = isEditing ? editedBgCheck : employee.backgroundCheck || DEFAULT_BG_CHECK;

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-lg font-bold text-foreground">Background Check</h2>
        <p className="text-sm text-muted-foreground mt-1">Verification and compliance for {employee.name}</p>
      </div>

      <EditableSectionCard
        title="Background Verification"
        icon={ShieldCheck}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
      >
        <div className="mb-6 rounded-2xl border border-border bg-secondary/20 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Verification Status</p>
            <p className="text-lg font-bold text-foreground mt-1">{isEditing ? status : display?.verificationStatus || "Pending"}</p>
          </div>
          {!isEditing && display?.completedOn ? (
            <p className="text-sm text-muted-foreground">Completed on {formatDate(display.completedOn)}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProfileInfoField
            label="Verification Status"
            value={editedBgCheck?.verificationStatus || ""}
            editing={isEditing}
            type="select"
            options={STATUS_OPTIONS}
            onChange={(v) => updateBgCheck("verificationStatus", v)}
          />
          <ProfileInfoField
            label="Agency Name"
            value={editedBgCheck?.agencyName || ""}
            editing={isEditing}
            onChange={(v) => updateBgCheck("agencyName", v)}
          />
          <ProfileInfoField
            label="Verified By"
            value={editedBgCheck?.verifiedBy || ""}
            editing={isEditing}
            onChange={(v) => updateBgCheck("verifiedBy", v)}
          />
          <ProfileInfoField
            label="Reference Number"
            value={editedBgCheck?.referenceNumber || ""}
            editing={isEditing}
            onChange={(v) => updateBgCheck("referenceNumber", v)}
          />
          <ProfileInfoField
            label="Completion Date"
            value={editedBgCheck?.completedOn || ""}
            editing={isEditing}
            type="date"
            onChange={(v) => updateBgCheck("completedOn", v)}
          />
          <div className="hidden lg:block" aria-hidden />
          <div className="sm:col-span-2 lg:col-span-3">
            <ProfileInfoField
              label="Agency Remarks"
              value={editedBgCheck?.remarks || ""}
              editing={isEditing}
              type="textarea"
              onChange={(v) => updateBgCheck("remarks", v)}
            />
          </div>
        </div>

        {display?.reportUrl ? (
          <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground">Verification Report</p>
                <p className="text-xs text-muted-foreground">Attached background check document</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
                onClick={() => window.open(display.reportUrl, "_blank")}
              >
                View
              </button>
              <button
                type="button"
                className="p-2 rounded-lg border border-border hover:bg-secondary"
                onClick={() => window.open(display.reportUrl, "_blank")}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </EditableSectionCard>
    </div>
  );
}
