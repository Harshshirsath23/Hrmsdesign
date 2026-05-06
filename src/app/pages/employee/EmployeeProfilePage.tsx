import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ESS_SECTIONS } from "../../modules/ess/data";
import { getChangeRequests, getPendingSections, getProfile, submitSectionChangeRequest } from "../../modules/ess/storage";
import { EmployeeProfile, SectionKey } from "../../modules/ess/types";
import {
  detectDuplicateValues,
  isEqualPayload,
  maskSensitive,
  validateAadhaar,
  validateEmail,
  validatePan,
} from "../../modules/ess/utils";

type BannerState = { type: "success" | "error"; message: string } | null;

const FORM_LABELS: Record<string, string> = {
  firstName: "First Name",
  middleName: "Middle Name",
  lastName: "Last Name",
  personalMobile: "Personal Mobile",
  personalEmail: "Personal Email",
  workMobile: "Work Mobile",
  emergencyContactName: "Emergency Contact Name",
  emergencyContactNumber: "Emergency Contact Number",
  dateOfBirth: "Date of Birth",
  actualDateOfBirth: "Actual Date of Birth",
  gender: "Gender",
  bloodGroup: "Blood Group",
  maritalStatus: "Marital Status",
  spouseName: "Spouse Name",
  fatherName: "Father Name",
  placeOfBirth: "Place of Birth",
  nationality: "Nationality",
  religion: "Religion",
  residentialStatus: "Residential Status",
  identificationMark: "Identification Mark",
  panNumber: "PAN Number",
  aadhaarNumber: "Aadhaar Number",
  passportNumber: "Passport Number",
  uanNumber: "UAN Number",
  physicallyChallenged: "Physically Challenged",
  internationalEmployee: "International Employee",
  department: "Department",
  designation: "Designation",
  employmentType: "Employment Type",
  workLocation: "Work Location",
  employeeCategory: "Employee Category",
  shift: "Shift",
  noticePeriod: "Notice Period (Days)",
  reportingManager: "Reporting Manager",
  functionalManager: "Functional Manager",
  hrPartner: "HR Partner",
  addressLine1: "Address Line 1",
  addressLine2: "Address Line 2",
  landmark: "Landmark",
  city: "City",
  state: "State",
  country: "Country",
  pincode: "Pincode",
};

function Field({
  fieldKey,
  value,
  readOnly,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  readOnly: boolean;
  onChange: (value: unknown) => void;
}) {
  const label = FORM_LABELS[fieldKey] ?? fieldKey;
  const stringValue = value === null || value === undefined ? "" : String(value);
  const isBoolean = typeof value === "boolean";
  const inputType = fieldKey.toLowerCase().includes("email")
    ? "email"
    : fieldKey.toLowerCase().includes("date")
      ? "date"
      : "text";

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {isBoolean ? (
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={readOnly}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-foreground"
        />
      ) : (
        <input
          type={inputType}
          value={readOnly ? maskSensitive(fieldKey, stringValue) : stringValue}
          disabled={readOnly}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground disabled:bg-secondary disabled:text-muted-foreground"
        />
      )}
    </label>
  );
}

function DynamicListEditor({
  rows,
  onChange,
  readOnly,
}: {
  rows: Record<string, unknown>[];
  onChange: (rows: Record<string, unknown>[]) => void;
  readOnly: boolean;
}) {
  const columns = rows[0] ? Object.keys(rows[0]).filter((key) => key !== "id") : [];

  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div key={String(row.id ?? rowIndex)} className="rounded-lg border border-border p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {columns.map((column) => (
            <Field
              key={`${rowIndex}-${column}`}
              fieldKey={column}
              value={row[column]}
              readOnly={readOnly}
              onChange={(value) => {
                const next = [...rows];
                next[rowIndex] = { ...next[rowIndex], [column]: value };
                onChange(next);
              }}
            />
          ))}
          {!readOnly && (
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, index) => index !== rowIndex))}
              className="h-10 px-3 rounded-lg border border-border text-sm text-foreground hover:bg-secondary"
            >
              Remove Row
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          onClick={() => {
            const base = rows[0] ?? {};
            const newRow = Object.keys(base).reduce((acc, key) => {
              if (key === "id") return { ...acc, id: `${Date.now()}` };
              if (typeof base[key] === "boolean") return { ...acc, [key]: false };
              return { ...acc, [key]: "" };
            }, {} as Record<string, unknown>);
            onChange([...rows, newRow]);
          }}
          className="h-10 px-4 rounded-lg bg-foreground text-primary-foreground text-sm font-medium"
        >
          Add Row
        </button>
      )}
    </div>
  );
}

export function EmployeeProfilePage() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? "1";
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [draft, setDraft] = useState<unknown>(null);
  const [pendingSections, setPendingSections] = useState<SectionKey[]>([]);
  const [banner, setBanner] = useState<BannerState>(null);
  const [submitting, setSubmitting] = useState(false);

  const changeHistory = useMemo(() => getChangeRequests(employeeId), [employeeId, profile, pendingSections]);

  const refresh = () => {
    setLoading(true);
    const nextProfile = getProfile(employeeId);
    setProfile(nextProfile);
    setPendingSections(getPendingSections(employeeId));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const beginEdit = (section: SectionKey) => {
    if (!profile) return;
    setEditingSection(section);
    setDraft(JSON.parse(JSON.stringify(profile[section])));
    setBanner(null);
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setDraft(null);
  };

  const submitChange = (section: SectionKey) => {
    if (!profile) return;
    const currentSectionData = profile[section];
    const nextSectionData = draft;

    if (isEqualPayload(currentSectionData, nextSectionData)) {
      setBanner({ type: "error", message: "No changes detected. Update at least one field before submitting." });
      return;
    }

    if (section === "profile") {
      const next = nextSectionData as EmployeeProfile["profile"];
      if (!validateEmail(next.personalEmail)) {
        setBanner({ type: "error", message: "Personal email format is invalid." });
        return;
      }
    }

    if (section === "personalDetails") {
      const next = nextSectionData as EmployeeProfile["personalDetails"];
      if (!validatePan(next.panNumber)) {
        setBanner({ type: "error", message: "PAN format is invalid. Expected format: ABCDE1234F." });
        return;
      }
      if (!validateAadhaar(next.aadhaarNumber)) {
        setBanner({ type: "error", message: "Aadhaar must be a 12-digit number." });
        return;
      }
    }

    if (section === "bankAndStatutoryDetails") {
      const next = nextSectionData as EmployeeProfile["bankAndStatutoryDetails"];
      if (!validatePan(next.panNumber)) {
        setBanner({ type: "error", message: "PAN format is invalid in statutory details." });
        return;
      }
      if (!validateAadhaar(next.aadhaarNumber)) {
        setBanner({ type: "error", message: "Aadhaar must be a 12-digit number in statutory details." });
        return;
      }
      if (detectDuplicateValues(next.bankAccounts.map((entry) => entry.accountNumber))) {
        setBanner({ type: "error", message: "Duplicate bank account numbers are not allowed." });
        return;
      }
      const primaryCount = next.bankAccounts.filter((entry) => entry.isPrimary).length;
      if (primaryCount > 1) {
        setBanner({ type: "error", message: "Only one bank account can be marked as primary." });
        return;
      }
    }

    if (section === "nomineeDetails") {
      const next = nextSectionData as EmployeeProfile["nomineeDetails"];
      const totalShare = next.reduce((sum, entry) => sum + (Number(entry.sharePercentage) || 0), 0);
      if (totalShare > 100) {
        setBanner({ type: "error", message: "Nominee share percentage cannot exceed 100%." });
        return;
      }
    }

    try {
      setSubmitting(true);
      submitSectionChangeRequest({
        employeeId,
        section,
        newValue: draft,
      });
      setBanner({ type: "success", message: "Change request submitted and awaiting admin approval." });
      cancelEdit();
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit change request. Try again.";
      setBanner({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !profile) {
    return <div className="p-6 text-sm text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="p-6 flex gap-6">
      <aside className="w-64 hidden lg:block">
        <div className="sticky top-6 rounded-xl border border-border bg-card p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Profile Sections</h3>
          {ESS_SECTIONS.map((section) => (
            <a
              key={section.key}
              href={`#${section.key}`}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <span>{section.label}</span>
              {pendingSections.includes(section.key) && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-secondary border border-border">Pending</span>
              )}
            </a>
          ))}
        </div>
      </aside>

      <div className="flex-1 space-y-4">
        {banner && (
          <div
            className={`rounded-lg px-4 py-3 text-sm border ${
              banner.type === "success"
                ? "bg-secondary text-foreground border-border"
                : "bg-destructive/10 text-destructive border-destructive/30"
            }`}
          >
            {banner.message}
          </div>
        )}

        {ESS_SECTIONS.map((section) => {
          const isPending = pendingSections.includes(section.key);
          const isEditing = editingSection === section.key;
          const sectionData = isEditing ? draft : profile[section.key];
          const isReadOnly = !isEditing || !section.editable;

          return (
            <section key={section.key} id={section.key} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{section.label}</h2>
                  {isPending && <p className="text-xs text-muted-foreground mt-1">Pending Approval</p>}
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => submitChange(section.key)}
                        disabled={submitting}
                        className="h-9 px-4 rounded-lg bg-foreground text-primary-foreground text-sm disabled:opacity-60"
                      >
                        {submitting ? "Submitting..." : "Submit"}
                      </button>
                      <button onClick={cancelEdit} className="h-9 px-4 rounded-lg border border-border text-sm">
                        Cancel
                      </button>
                    </>
                  ) : (
                    section.editable && (
                      <button
                        onClick={() => beginEdit(section.key)}
                        disabled={isPending}
                        className="h-9 px-4 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit Section
                      </button>
                    )
                  )}
                </div>
              </div>

              {Array.isArray(sectionData) ? (
                <DynamicListEditor
                  rows={sectionData as Record<string, unknown>[]}
                  onChange={(rows) => setDraft(rows)}
                  readOnly={isReadOnly}
                />
              ) : section.key === "addresses" ? (
                <div className="space-y-4">
                  {Object.entries(sectionData as Record<string, Record<string, unknown>>).map(([addressType, values]) => (
                    <div key={addressType} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-semibold text-foreground capitalize mb-3">{addressType} Address</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(values).map(([field, value]) => (
                          <Field
                            key={`${addressType}-${field}`}
                            fieldKey={field}
                            value={value}
                            readOnly={isReadOnly}
                            onChange={(nextValue) => {
                              if (isReadOnly) return;
                              const current = sectionData as Record<string, Record<string, unknown>>;
                              setDraft({
                                ...current,
                                [addressType]: {
                                  ...current[addressType],
                                  [field]: nextValue,
                                },
                              });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : section.key === "bankAndStatutoryDetails" ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-3 space-y-3">
                    <p className="text-sm font-semibold text-foreground">Bank Accounts</p>
                    <DynamicListEditor
                      rows={((sectionData as EmployeeProfile["bankAndStatutoryDetails"]).bankAccounts ?? []) as unknown as Record<string, unknown>[]}
                      onChange={(rows) => {
                        const current = sectionData as EmployeeProfile["bankAndStatutoryDetails"];
                        setDraft({ ...current, bankAccounts: rows });
                      }}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries((sectionData as EmployeeProfile["bankAndStatutoryDetails"]) ?? {})
                      .filter(([key]) => key !== "bankAccounts")
                      .map(([field, value]) => (
                        <Field
                          key={field}
                          fieldKey={field}
                          value={value}
                          readOnly={isReadOnly}
                          onChange={(nextValue) => {
                            const current = sectionData as EmployeeProfile["bankAndStatutoryDetails"];
                            setDraft({ ...current, [field]: nextValue });
                          }}
                        />
                      ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(sectionData as Record<string, unknown>).map(([field, value]) => (
                    <Field
                      key={field}
                      fieldKey={field}
                      value={value}
                      readOnly={isReadOnly}
                      onChange={(nextValue) => {
                        const current = sectionData as Record<string, unknown>;
                        setDraft({ ...current, [field]: nextValue });
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground mb-3">Change Request History</h2>
          <div className="space-y-2">
            {changeHistory.length === 0 && (
              <p className="text-sm text-muted-foreground">No change requests submitted yet.</p>
            )}
            {changeHistory.map((request) => (
              <div key={request.id} className="rounded-lg border border-border px-3 py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{request.section_label}</p>
                  <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleString("en-IN")}</p>
                </div>
                <span className="text-xs rounded-full border border-border px-2 py-0.5 capitalize">{request.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
