import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AlertCircle, Edit2, Plus, Save, ShieldCheck, User, Users, X } from "lucide-react";
import { Employee } from "../mockData";
import { useMasterList } from "../../../modules/masters/hooks";
import type { MasterRecord } from "../../../modules/masters/types";
import {
  EmployeeFamilyMember,
  employeeFamilyToSubmitRows,
  familyDetailsToEmployeeFamily,
  getFamilyOccupationChoices,
  getFamilyRelationChoices,
  getMyFamilyDetails,
  patchMyFamilyDetails,
  postMyFamilyDetails,
} from "../../../api/employeeFamilyDetails";
import { addNotification } from "../../../../store/slices/notificationSlice";
import { updateAdminEmployee } from "../../../../store/slices/adminSlice";
import type { AppDispatch } from "../../../../store";

interface Props {
  employee: Employee;
  essMode?: boolean;
  showAddButton?: boolean;
}

const RELATIONSHIP_SHADES: Record<string, string> = {
  Spouse: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  Father: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Mother: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Son: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Daughter: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

type Choice = { id: number; label: string };
type Option = { value: string; label: string };

function StatusBadge({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
}) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-foreground/5 border border-border text-[10px] font-bold text-foreground/70 uppercase tracking-tight">
      <Icon size={11} className="text-emerald-500" />
      {label}
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  isEditing,
  options,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  isEditing: boolean;
  options?: Option[];
  type?: "text" | "date" | "tel";
}) {
  const selectOptions = options?.length
    ? options.some((option) => option.value === value) || !value
      ? options
      : [{ value, label: value }, ...options]
    : undefined;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      {isEditing && selectOptions?.length ? (
        <select
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="text-xs font-bold text-foreground bg-secondary/50 border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Select {label}</option>
          {selectOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="text-xs font-bold text-foreground bg-secondary/50 border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      ) : (
        <span className="text-xs font-bold text-foreground truncate">{value || "-"}</span>
      )}
    </div>
  );
}

function masterLabel(record: MasterRecord) {
  return String(record.label ?? record.name ?? record.title ?? record.code ?? record.id);
}

function masterOptions(records: MasterRecord[]) {
  return records.map((record) => {
    const label = masterLabel(record);
    return { value: label, label };
  });
}

function choicesToOptions(choices: Choice[]) {
  return choices.map((choice) => ({ value: choice.label, label: choice.label }));
}

function toNumericId(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return undefined;
}

function resolveMasterId(label: string, records: MasterRecord[], current?: number | null) {
  if (!label) return null;
  const selected = records.find((record) => masterLabel(record) === label);
  return toNumericId(selected?.id) ?? current ?? undefined;
}

function resolveChoiceId(label: string, choices: Choice[], current?: number | null) {
  if (!label) return null;
  const selected = choices.find((choice) => choice.label === label);
  return selected?.id ?? current ?? undefined;
}

function calculateAge(dob?: string) {
  if (!dob) return "-";
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return "-";
  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  const hadBirthday =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  if (!hadBirthday) years -= 1;
  return `${years} Years`;
}

export function FamilyDetails({ employee, showAddButton = true }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const masterQuery = useMemo(() => ({ is_active: "true" as const, page: 1 }), []);
  const genderRecords = useMasterList("Gender", masterQuery).data?.results ?? [];
  const bloodGroupRecords = useMasterList("BloodGroup", masterQuery).data?.results ?? [];

  const [relationChoices, setRelationChoices] = useState<Choice[]>([]);
  const [occupationChoices, setOccupationChoices] = useState<Choice[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFamily, setEditedFamily] = useState<EmployeeFamilyMember[]>(employee.family || []);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiLoaded && !isEditing) {
      setEditedFamily(employee.family || []);
    }
  }, [apiLoaded, employee.family, isEditing]);

  useEffect(() => {
    let cancelled = false;

    async function loadFamilyDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const [familyRows, relations, occupations] = await Promise.all([
          getMyFamilyDetails(),
          getFamilyRelationChoices(),
          getFamilyOccupationChoices(),
        ]);
        if (cancelled) return;

        const nextFamily = familyDetailsToEmployeeFamily(familyRows);
        setRelationChoices(relations);
        setOccupationChoices(occupations);
        setEditedFamily(nextFamily);
        setApiLoaded(true);
        dispatch(updateAdminEmployee({ ...employee, family: nextFamily }));
      } catch (loadError) {
        if (cancelled) return;
        const message = loadError instanceof Error ? loadError.message : "Could not load family details.";
        setError(message);
        dispatch(addNotification({ type: "error", message }));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadFamilyDetails();

    return () => {
      cancelled = true;
    };
  }, [dispatch, employee.id]);

  const updateMember = (idx: number, field: keyof EmployeeFamilyMember, value: unknown) => {
    setEditedFamily((prev) =>
      prev.map((member, index) => (index === idx ? { ...member, [field]: value } : member))
    );
  };

  const addFamilyMember = () => {
    setEditedFamily((prev) => [
      ...prev,
      {
        name: "",
        relationship: "",
        dob: "",
        gender: "",
        bloodGroup: "",
        phone: "",
        occupation: "",
        isDependent: false,
        isEmergencyContact: false,
      },
    ]);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const missingRequired = editedFamily.some(
      (member) => !member.name?.trim() || !member.relationship?.trim()
    );
    if (missingRequired) {
      dispatch(
        addNotification({
          type: "warning",
          message: "Name and relationship are required for each family member.",
        })
      );
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        family_details: employeeFamilyToSubmitRows(editedFamily, {
          relationId: (label, current) => resolveChoiceId(label, relationChoices, current),
          genderId: (label, current) => resolveMasterId(label, genderRecords, current),
          bloodGroupId: (label, current) => resolveMasterId(label, bloodGroupRecords, current),
          occupationId: (label, current) => resolveChoiceId(label, occupationChoices, current),
        }),
      };

      const submitFamilyDetails = apiLoaded ? patchMyFamilyDetails : postMyFamilyDetails;
      await submitFamilyDetails(payload);
      setIsEditing(false);
      setApiLoaded(true);
      dispatch(updateAdminEmployee({ ...employee, family: editedFamily }));
      dispatch(
        addNotification({
          type: "success",
          message: "Family details submitted for admin approval.",
        })
      );
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not submit family details.";
      setError(message);
      dispatch(addNotification({ type: "error", message }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedFamily(employee.family || []);
    setIsEditing(false);
  };

  const isEditable = employee.editableSections?.includes("family-details");
  const status =
    employee.editRequestStatus === "Pending"
      ? { label: "Pending Employee Update", className: "bg-amber-500/10 text-amber-600 border-amber-200" }
      : employee.editRequestStatus === "Updated"
        ? { label: "Updated by Employee", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" }
        : isEditable
          ? { label: "Editable by Employee", className: "bg-indigo-500/10 text-indigo-600 border-indigo-200" }
          : null;

  const relationOptions = choicesToOptions(relationChoices);
  const occupationOptions = choicesToOptions(occupationChoices);
  const genderOptions = masterOptions(genderRecords);
  const bloodGroupOptions = masterOptions(bloodGroupRecords);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-2.5">
              <Users size={20} className="text-indigo-500" />
              Family & Dependents
            </h2>
            <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
              {editedFamily.length} Registered Members
            </p>
          </div>
          {status ? (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-all ${status.className}`}>
              {status.label}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold transition-all hover:bg-primary/90 disabled:opacity-60"
              >
                <Save size={12} />
                {isSaving ? "Submitting..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold transition-all hover:bg-secondary"
              >
                <X size={12} />
                Cancel
              </button>
            </>
          ) : (
            <>
              {showAddButton ? (
                <button
                  onClick={addFamilyMember}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold transition-all hover:bg-secondary"
                >
                  <Plus size={12} />
                  Add New
                </button>
              ) : null}
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-bold transition-all hover:bg-secondary"
              >
                <Edit2 size={12} />
                Edit Section
              </button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs font-semibold text-muted-foreground">
          Loading saved family details...
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4">
        {editedFamily.map((member, index) => {
          const badgeStyle =
            RELATIONSHIP_SHADES[member.relationship] ||
            "bg-secondary text-muted-foreground border-border";
          const age = member.age || calculateAge(member.dob);

          return (
            <div
              key={member.apiId ?? member.id ?? index}
              className="group relative bg-card border border-border rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-foreground/5 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full ${badgeStyle.split(" ")[0]}`} />

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center border border-border shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <User size={28} className="text-muted-foreground/40" />
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${badgeStyle}`}>
                    {member.relationship || "-"}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Name</span>
                      {isEditing ? (
                        <input type="text" value={member.name} onChange={e => updateMember(index, 'name', e.target.value)}
                          className="w-full text-base font-black text-foreground bg-secondary/50 border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2" />
                      ) : (
                        <h4 className="text-base font-black text-foreground">{member.name || "—"}</h4>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <StatusBadge icon={ShieldCheck} label="Dependent" active={member.isDependent} />
                        <StatusBadge icon={AlertCircle} label="Emergency Contact" active={member.isEmergencyContact} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">
                    <EditableField
                      label="Date of Birth"
                      isEditing={isEditing}
                      value={member.dob || ""}
                      onChange={(value) => updateMember(index, "dob", value)}
                      type="date"
                    />
                    <EditableField
                      label="Relationship"
                      isEditing={isEditing}
                      value={member.relationship}
                      onChange={(value) => updateMember(index, "relationship", value)}
                      options={relationOptions}
                    />
                    <EditableField
                      label="Gender"
                      isEditing={isEditing}
                      value={member.gender}
                      onChange={(value) => updateMember(index, "gender", value)}
                      options={genderOptions}
                    />
                    <EditableField label="Age" isEditing={false} value={age} />
                    <EditableField
                      label="Blood Group"
                      isEditing={isEditing}
                      value={member.bloodGroup}
                      onChange={(value) => updateMember(index, "bloodGroup", value)}
                      options={bloodGroupOptions}
                    />
                    <EditableField
                      label="Phone"
                      isEditing={isEditing}
                      value={member.phone}
                      onChange={(value) => updateMember(index, "phone", value)}
                      type="tel"
                    />
                    <EditableField
                      label="Occupation"
                      isEditing={isEditing}
                      value={member.occupation}
                      onChange={(value) => updateMember(index, "occupation", value)}
                      options={occupationOptions}
                    />
                    {isEditing ? (
                      <div className="col-span-2 lg:col-span-4 flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-foreground">
                          <input
                            type="checkbox"
                            checked={member.isDependent}
                            onChange={(event) => updateMember(index, "isDependent", event.target.checked)}
                          />
                          Dependent
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-foreground">
                          <input
                            type="checkbox"
                            checked={member.isEmergencyContact}
                            onChange={(event) => updateMember(index, "isEmergencyContact", event.target.checked)}
                          />
                          Emergency Contact
                        </label>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editedFamily.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-border rounded-[2rem] bg-secondary/5 text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Users size={32} className="text-muted-foreground/30" />
          </div>
          <p className="text-sm font-bold text-muted-foreground">No family details added yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-widest">
            Employee has not declared any dependents
          </p>
        </div>
      )}
    </div>
  );
}
