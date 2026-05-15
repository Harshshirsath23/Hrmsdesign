import { useCallback, useEffect, useState } from "react";
import {
  MapPin,
  Mail,
  Phone,
  User,
  Briefcase,
  Heart,
  Languages,
  Monitor,
  Users,
  ShieldCheck,
  Edit2,
  Plus,
} from "lucide-react";
import {
  AssetEntry,
  Employee,
  InsuranceEntry,
  NomineeEntry,
} from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import { ProfileActivityTimeline } from "../../admin/ProfileActivityTimeline";
import {
  EditableSectionCard,
  ProfileInfoField,
  UploadField,
  EmptyStateCard,
} from "../employee-details";

interface Props {
  employee: Employee;
}

type LangRow = NonNullable<Employee["languages"]>[number];

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function EmployeeProfile({ employee }: Props) {
  const { handleAdminSave } = useAdminSync();

  const [personalEdit, setPersonalEdit] = useState(false);
  const [personal, setPersonal] = useState(employee);

  const [addressEdit, setAddressEdit] = useState(false);
  const [addr, setAddr] = useState({
    current: employee.currentAddress,
    permanent: employee.permanentAddress,
    same: employee.currentAddress?.isSameAsPermanent ?? false,
  });

  const [workEdit, setWorkEdit] = useState(false);
  const [work, setWork] = useState(employee);

  const [langEdit, setLangEdit] = useState(false);
  const [languages, setLanguages] = useState<LangRow[]>(employee.languages || []);

  const [emEdit, setEmEdit] = useState(false);
  const [emergency, setEmergency] = useState({
    ec: employee.emergencyContact,
    med: employee.medicalInfo,
  });

  const [nomEdit, setNomEdit] = useState(false);
  const [nominees, setNominees] = useState<NomineeEntry[]>(employee.nominees || []);

  const [insEdit, setInsEdit] = useState(false);
  const [insurance, setInsurance] = useState<InsuranceEntry[]>(employee.insurance || []);

  const [assetEdit, setAssetEdit] = useState(false);
  const [assets, setAssets] = useState<AssetEntry[]>(employee.assets || []);

  useEffect(() => {
    setPersonal(employee);
    setAddr({
      current: employee.currentAddress,
      permanent: employee.permanentAddress,
      same: employee.currentAddress?.isSameAsPermanent ?? false,
    });
    setWork(employee);
    setLanguages(employee.languages || []);
    setEmergency({ ec: employee.emergencyContact, med: employee.medicalInfo });
    setNominees(employee.nominees || []);
    setInsurance(employee.insurance || []);
    setAssets(employee.assets || []);
  }, [employee]);

  const mergeEmployee = useCallback(
    (patch: Partial<Employee>) => ({ ...employee, ...patch }),
    [employee]
  );

  const statusStyle: Record<string, string> = {
    Active: "bg-emerald-500 text-white",
    "On Leave": "bg-amber-500 text-white",
    Inactive: "bg-rose-500 text-white",
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flat-card bg-[#0F172A] text-white p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="relative group">
            {employee.avatar ? (
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/10 shadow-2xl"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center border-4 border-white/10 text-white text-3xl font-black shadow-2xl"
                style={{ backgroundColor: employee.avatarColor }}
              >
                {employee.initials}
              </div>
            )}
            <span className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-lg shadow-lg">
              <Edit2 size={14} />
            </span>
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight">{personal.name}</h2>
              <p className="text-white/60 text-base font-bold mt-1 tracking-wide">{employee.designation}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    statusStyle[employee.status] ?? "bg-white/10"
                  }`}
                >
                  {employee.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10 relative z-10">
          {[
            { icon: Mail, value: employee.email, label: "Email Address" },
            { icon: Phone, value: employee.phone, label: "Phone Number" },
            { icon: Phone, value: employee.alternateMobile, label: "Alternate Mobile" },
            { icon: MapPin, value: employee.location, label: "Current Location" },
          ].map((contact) => (
            <div
              key={contact.label}
              className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <contact.icon className="w-4 h-4 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{contact.label}</p>
                <p className="text-sm font-bold truncate">{contact.value || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditableSectionCard
        title="Personal Information"
        icon={User}
        isEditing={personalEdit}
        onEdit={() => setPersonalEdit(true)}
        onCancel={() => {
          setPersonal(employee);
          setPersonalEdit(false);
        }}
        onSave={async () => {
          const ok = await handleAdminSave("Personal Information", employee, personal);
          if (ok) setPersonalEdit(false);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileInfoField
            label="First Name"
            value={personal.firstName || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, firstName: v }))}
          />
          <ProfileInfoField
            label="Middle Name"
            value={personal.middleName || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, middleName: v }))}
          />
          <ProfileInfoField
            label="Last Name"
            value={personal.lastName || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, lastName: v }))}
          />
          <ProfileInfoField
            label="Father's Name"
            value={personal.fathersName || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, fathersName: v }))}
          />
          <ProfileInfoField
            label="Spouse's Name"
            value={personal.spouseName || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, spouseName: v }))}
          />
          <ProfileInfoField
            label="Date of Birth"
            value={personal.dateOfBirth}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, dateOfBirth: v }))}
            type="date"
          />
          <ProfileInfoField
            label="Actual DOB"
            value={personal.actualDob || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, actualDob: v }))}
            type="date"
          />
          <ProfileInfoField
            label="Place of Birth"
            value={personal.placeOfBirth || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, placeOfBirth: v }))}
          />
          <ProfileInfoField
            label="Gender"
            value={personal.gender}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, gender: v }))}
          />
          <ProfileInfoField
            label="Marital Status"
            value={personal.maritalStatus}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, maritalStatus: v }))}
          />
          <ProfileInfoField
            label="Blood Group"
            value={personal.bloodGroup}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, bloodGroup: v }))}
          />
          <ProfileInfoField
            label="Nationality"
            value={personal.nationality}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, nationality: v }))}
          />
          <ProfileInfoField
            label="Religion"
            value={personal.religion || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, religion: v }))}
          />
          <ProfileInfoField
            label="Caste"
            value={personal.caste || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, caste: v }))}
          />
          <ProfileInfoField
            label="Caste Category"
            value={personal.casteCategory || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, casteCategory: v }))}
          />
          <ProfileInfoField
            label="Identification Mark"
            value={personal.identificationMark || ""}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, identificationMark: v }))}
          />
          <ProfileInfoField
            label="Physically Challenged (Yes/No)"
            value={personal.isPhysicallyChallenged ? "Yes" : "No"}
            editing={personalEdit}
            onChange={(v) =>
              setPersonal((p) => ({ ...p, isPhysicallyChallenged: /^y/i.test(v.trim()) }))
            }
          />
          <ProfileInfoField
            label="International Employee (Yes/No)"
            value={personal.isInternationalEmployee ? "Yes" : "No"}
            editing={personalEdit}
            onChange={(v) =>
              setPersonal((p) => ({ ...p, isInternationalEmployee: /^y/i.test(v.trim()) }))
            }
          />
          <ProfileInfoField
            label="Joining Date"
            value={personal.joiningDate}
            editing={personalEdit}
            onChange={(v) => setPersonal((p) => ({ ...p, joiningDate: v }))}
            type="date"
          />
        </div>
      </EditableSectionCard>

      <EditableSectionCard
        title="Address Details"
        icon={MapPin}
        isEditing={addressEdit}
        onEdit={() => setAddressEdit(true)}
        onCancel={() => {
          setAddr({
            current: employee.currentAddress,
            permanent: employee.permanentAddress,
            same: employee.currentAddress?.isSameAsPermanent ?? false,
          });
          setAddressEdit(false);
        }}
        onSave={async () => {
          const currentAddress = {
            ...(addr.current || {}),
            isSameAsPermanent: addr.same,
          } as Employee["currentAddress"];
          const permanentAddress = addr.same ? { ...currentAddress, isSameAsPermanent: undefined } : addr.permanent;
          const next = mergeEmployee({
            currentAddress,
            permanentAddress: permanentAddress as Employee["permanentAddress"],
          });
          const ok = await handleAdminSave("Address Details", employee, next);
          if (ok) setAddressEdit(false);
        }}
      >
        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Current Address
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(
                [
                  ["addressLine1", "Address Line 1"],
                  ["addressLine2", "Address Line 2"],
                  ["landmark", "Landmark"],
                  ["city", "City"],
                  ["state", "State"],
                  ["country", "Country"],
                  ["pincode", "Pincode"],
                  ["startDate", "Start Date"],
                  ["toDate", "To Date"],
                ] as const
              ).map(([key, label]) => (
                <ProfileInfoField
                  key={key}
                  label={label}
                  value={(addr.current?.[key] as string) || ""}
                  editing={addressEdit}
                  type={key.includes("Date") ? "date" : "text"}
                  onChange={(v) =>
                    setAddr((a) => ({
                      ...a,
                      current: { ...(a.current || {}), [key]: v } as Employee["currentAddress"],
                    }))
                  }
                />
              ))}
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={addr.same}
                  disabled={!addressEdit}
                  onChange={() =>
                    setAddr((a) => {
                      const nextSame = !a.same;
                      return {
                        ...a,
                        same: nextSame,
                        permanent: nextSame && a.current ? { ...a.current } : a.permanent,
                      };
                    })
                  }
                />
                Same as permanent address
              </label>
            </div>
          </div>
          <div className="pt-6 border-t border-border">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Permanent Address
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(
                [
                  ["addressLine1", "Address Line 1"],
                  ["addressLine2", "Address Line 2"],
                  ["landmark", "Landmark"],
                  ["city", "City"],
                  ["state", "State"],
                  ["country", "Country"],
                  ["pincode", "Pincode"],
                  ["startDate", "Start Date"],
                  ["toDate", "To Date"],
                ] as const
              ).map(([key, label]) => (
                <ProfileInfoField
                  key={`p-${key}`}
                  label={label}
                  value={(addr.permanent?.[key] as string) || ""}
                  editing={addressEdit && !addr.same}
                  type={key.includes("Date") ? "date" : "text"}
                  onChange={(v) =>
                    setAddr((a) => ({
                      ...a,
                      permanent: { ...(a.permanent || {}), [key]: v } as Employee["permanentAddress"],
                    }))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </EditableSectionCard>

      <EditableSectionCard
        title="Work Details"
        icon={Briefcase}
        isEditing={workEdit}
        onEdit={() => setWorkEdit(true)}
        onCancel={() => {
          setWork(employee);
          setWorkEdit(false);
        }}
        onSave={async () => {
          const ok = await handleAdminSave("Work Details", employee, work);
          if (ok) setWorkEdit(false);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileInfoField label="Employee ID" value={employee.employeeId} editing={false} />
          <ProfileInfoField
            label="Employee Category"
            value={work.employeeCategory || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, employeeCategory: v }))}
          />
          <ProfileInfoField
            label="Department"
            value={work.department}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, department: v }))}
          />
          <ProfileInfoField
            label="Team"
            value={work.team}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, team: v }))}
          />
          <ProfileInfoField
            label="Designation"
            value={work.designation}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, designation: v }))}
          />
          <ProfileInfoField
            label="Shift"
            value={work.shift || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, shift: v }))}
          />
          <ProfileInfoField
            label="Work Location"
            value={work.location}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, location: v }))}
          />
          <ProfileInfoField
            label="Employee Type"
            value={work.employeeType || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, employeeType: v }))}
          />
          <ProfileInfoField
            label="Confirmation Date"
            value={work.confirmationDate || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, confirmationDate: v }))}
            type="date"
          />
          <ProfileInfoField
            label="Employment Status"
            value={work.employmentStatus || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, employmentStatus: v }))}
          />
          <ProfileInfoField
            label="Probation Period"
            value={work.probationPeriod || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, probationPeriod: v }))}
          />
          <ProfileInfoField
            label="Notice Period"
            value={work.noticePeriod || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, noticePeriod: v }))}
          />
          <ProfileInfoField
            label="Notice Period (Days)"
            value={work.noticePeriodDays || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, noticePeriodDays: v }))}
          />
          <ProfileInfoField
            label="Referred By"
            value={work.referredBy || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, referredBy: v }))}
          />
          <ProfileInfoField
            label="Reporting To"
            value={work.reportingTo || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, reportingTo: v }))}
          />
          <ProfileInfoField
            label="Functional Manager"
            value={work.functionalManager || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, functionalManager: v }))}
          />
          <ProfileInfoField
            label="HR Partner"
            value={work.hrPartner || ""}
            editing={workEdit}
            onChange={(v) => setWork((w) => ({ ...w, hrPartner: v }))}
          />
        </div>
      </EditableSectionCard>

      <EditableSectionCard
        title="Language Details"
        icon={Languages}
        isEditing={langEdit}
        onEdit={() => setLangEdit(true)}
        onCancel={() => {
          setLanguages(employee.languages || []);
          setLangEdit(false);
        }}
        onSave={async () => {
          const next = mergeEmployee({ languages });
          const ok = await handleAdminSave("Language Details", employee, next);
          if (ok) setLangEdit(false);
        }}
        headerExtra={
          langEdit ? (
            <button
              type="button"
              onClick={() =>
                setLanguages((rows) => [
                  ...rows,
                  {
                    language: "",
                    proficiency: "Intermediate",
                    canRead: true,
                    canWrite: false,
                    canSpeak: true,
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Language
            </button>
          ) : null
        }
      >
        {!languages.length ? (
          <EmptyStateCard
            icon={Languages}
            title="No languages recorded"
            description="Edit this section to add language proficiency."
          />
        ) : (
          <div className="space-y-4">
            {languages.map((row, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-background p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ProfileInfoField
                    label="Language Name"
                    value={row.language}
                    editing={langEdit}
                    onChange={(v) =>
                      setLanguages((rows) => rows.map((r, i) => (i === idx ? { ...r, language: v } : r)))
                    }
                  />
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-semibold text-muted-foreground tracking-wide">
                      Proficiency Level
                    </span>
                    {langEdit ? (
                      <select
                        value={row.proficiency}
                        onChange={(e) =>
                          setLanguages((rows) =>
                            rows.map((r, i) => (i === idx ? { ...r, proficiency: e.target.value } : r))
                          )
                        }
                        className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium"
                      >
                        {["Beginner", "Intermediate", "Advanced", "Native"].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm font-semibold">
                        {row.proficiency || "—"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  {(
                    [
                      ["canRead", "Read"],
                      ["canWrite", "Write"],
                      ["canSpeak", "Speak"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={row[key]}
                        disabled={!langEdit}
                        onChange={() =>
                          setLanguages((rows) =>
                            rows.map((r, i) => (i === idx ? { ...r, [key]: !r[key] } : r))
                          )
                        }
                      />
                      {label}
                    </label>
                  ))}
                  {langEdit ? (
                    <button
                      type="button"
                      className="ml-auto text-xs font-bold text-destructive hover:underline"
                      onClick={() => setLanguages((rows) => rows.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </EditableSectionCard>

      <EditableSectionCard
        title="Emergency & Medical Information"
        icon={Heart}
        isEditing={emEdit}
        onEdit={() => setEmEdit(true)}
        onCancel={() => {
          setEmergency({ ec: employee.emergencyContact, med: employee.medicalInfo });
          setEmEdit(false);
        }}
        onSave={async () => {
          const next = mergeEmployee({
            emergencyContact: emergency.ec,
            medicalInfo: emergency.med,
          });
          const ok = await handleAdminSave("Emergency & Medical Information", employee, next);
          if (ok) setEmEdit(false);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileInfoField
            label="Emergency Contact Name"
            value={emergency.ec?.name || ""}
            editing={emEdit}
            onChange={(v) => setEmergency((e) => ({ ...e, ec: { ...e.ec, name: v, relationship: e.ec?.relationship || "", phone: e.ec?.phone || "" } }))}
          />
          <ProfileInfoField
            label="Emergency Contact #"
            value={emergency.ec?.phone || ""}
            editing={emEdit}
            onChange={(v) =>
              setEmergency((e) => ({
                ...e,
                ec: {
                  name: e.ec?.name || "",
                  relationship: e.ec?.relationship || "",
                  phone: v,
                  alternatePhone: e.ec?.alternatePhone,
                },
              }))
            }
          />
          <ProfileInfoField
            label="Relationship"
            value={emergency.ec?.relationship || emergency.med?.relationship || ""}
            editing={emEdit}
            onChange={(v) =>
              setEmergency((e) => ({
                ...e,
                ec: { name: e.ec?.name || "", phone: e.ec?.phone || "", relationship: v },
              }))
            }
          />
          <ProfileInfoField
            label="Medical Conditions"
            value={emergency.med?.conditions || ""}
            editing={emEdit}
            onChange={(v) => setEmergency((e) => ({ ...e, med: { ...e.med, conditions: v } }))}
            type="textarea"
          />
          <ProfileInfoField
            label="Allergies"
            value={emergency.med?.allergies || ""}
            editing={emEdit}
            onChange={(v) => setEmergency((e) => ({ ...e, med: { ...e.med, allergies: v } }))}
          />
          <ProfileInfoField
            label="Doctor Name"
            value={emergency.med?.doctorName || ""}
            editing={emEdit}
            onChange={(v) => setEmergency((e) => ({ ...e, med: { ...e.med, doctorName: v } }))}
          />
        </div>
      </EditableSectionCard>

      <EditableSectionCard
        title="Nominee Details"
        icon={Users}
        isEditing={nomEdit}
        onEdit={() => setNomEdit(true)}
        onCancel={() => {
          setNominees(employee.nominees || []);
          setNomEdit(false);
        }}
        onSave={async () => {
          const next = mergeEmployee({ nominees });
          const ok = await handleAdminSave("Nominee Details", employee, next);
          if (ok) setNomEdit(false);
        }}
        headerExtra={
          nomEdit ? (
            <button
              type="button"
              onClick={() =>
                setNominees((rows) => [
                  ...rows,
                  {
                    id: `nom-${Date.now()}`,
                    nomineeName: "",
                    relationship: "",
                    dateOfBirth: "",
                    contactNumber: "",
                    address: "",
                    sharePercentage: "",
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Nominee
            </button>
          ) : null
        }
      >
        {!nominees.length ? (
          <EmptyStateCard icon={Users} title="No nominees on file" />
        ) : (
          <div className="space-y-4">
            {nominees.map((n, idx) => (
              <div key={n.id} className="rounded-xl border border-border bg-background p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ProfileInfoField
                    label="Nominee Name"
                    value={n.nomineeName}
                    editing={nomEdit}
                    onChange={(v) =>
                      setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, nomineeName: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Relationship"
                    value={n.relationship}
                    editing={nomEdit}
                    onChange={(v) =>
                      setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, relationship: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Date Of Birth"
                    value={n.dateOfBirth}
                    editing={nomEdit}
                    onChange={(v) =>
                      setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, dateOfBirth: v } : r)))
                    }
                    type="date"
                  />
                  <ProfileInfoField
                    label="Contact Number"
                    value={n.contactNumber}
                    editing={nomEdit}
                    onChange={(v) =>
                      setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, contactNumber: v } : r)))
                    }
                  />
                  <div className="sm:col-span-2">
                    <ProfileInfoField
                      label="Address"
                      value={n.address}
                      editing={nomEdit}
                      onChange={(v) =>
                        setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, address: v } : r)))
                      }
                      type="textarea"
                    />
                  </div>
                  <ProfileInfoField
                    label="Share Percentage"
                    value={n.sharePercentage}
                    editing={nomEdit}
                    onChange={(v) =>
                      setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, sharePercentage: v } : r)))
                    }
                  />
                  <div className="sm:col-span-2">
                    <UploadField
                      label="ID Proof Upload"
                      fileName={n.idProofFileName}
                      editing={nomEdit}
                      onFileNameChange={(name) =>
                        setNominees((rows) => rows.map((r, i) => (i === idx ? { ...r, idProofFileName: name } : r)))
                      }
                    />
                  </div>
                </div>
                {nomEdit ? (
                  <button
                    type="button"
                    className="text-xs font-bold text-destructive hover:underline"
                    onClick={() => setNominees((rows) => rows.filter((_, i) => i !== idx))}
                  >
                    Delete nominee
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </EditableSectionCard>

      <EditableSectionCard
        title="Insurance Details"
        icon={ShieldCheck}
        isEditing={insEdit}
        onEdit={() => setInsEdit(true)}
        onCancel={() => {
          setInsurance(employee.insurance || []);
          setInsEdit(false);
        }}
        onSave={async () => {
          const next = mergeEmployee({ insurance });
          const ok = await handleAdminSave("Insurance Details", employee, next);
          if (ok) setInsEdit(false);
        }}
        headerExtra={
          insEdit ? (
            <button
              type="button"
              onClick={() =>
                setInsurance((rows) => [
                  ...rows,
                  {
                    id: `ins-${Date.now()}`,
                    insuranceProvider: "",
                    policyNumber: "",
                    coverageType: "",
                    coverageAmount: "",
                    validTill: "",
                    dependentsCovered: "",
                  },
                ])
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Policy
            </button>
          ) : null
        }
      >
        {!insurance.length ? (
          <EmptyStateCard icon={ShieldCheck} title="No insurance policies" />
        ) : (
          <div className="space-y-4">
            {insurance.map((pol, idx) => (
              <div key={pol.id} className="rounded-xl border border-border bg-background p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ProfileInfoField
                    label="Insurance Provider"
                    value={pol.insuranceProvider}
                    editing={insEdit}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, insuranceProvider: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Policy Number"
                    value={pol.policyNumber}
                    editing={insEdit}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, policyNumber: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Coverage Type"
                    value={pol.coverageType}
                    editing={insEdit}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, coverageType: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Coverage Amount"
                    value={pol.coverageAmount}
                    editing={insEdit}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, coverageAmount: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Valid Till"
                    value={pol.validTill}
                    editing={insEdit}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, validTill: v } : r)))
                    }
                    type="date"
                  />
                  <ProfileInfoField
                    label="Dependents Covered"
                    value={pol.dependentsCovered}
                    editing={insEdit}
                    onChange={(v) =>
                      setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, dependentsCovered: v } : r)))
                    }
                  />
                  <div className="sm:col-span-2">
                    <UploadField
                      label="Insurance Document Upload"
                      fileName={pol.documentFileName}
                      editing={insEdit}
                      onFileNameChange={(name) =>
                        setInsurance((rows) => rows.map((r, i) => (i === idx ? { ...r, documentFileName: name } : r)))
                      }
                    />
                  </div>
                </div>
                {insEdit ? (
                  <button
                    type="button"
                    className="text-xs font-bold text-destructive hover:underline"
                    onClick={() => setInsurance((rows) => rows.filter((_, i) => i !== idx))}
                  >
                    Delete policy
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </EditableSectionCard>

      <EditableSectionCard
        title="Asset Management"
        icon={Monitor}
        isEditing={assetEdit}
        onEdit={() => setAssetEdit(true)}
        onCancel={() => {
          setAssets(employee.assets || []);
          setAssetEdit(false);
        }}
        onSave={async () => {
          const next = mergeEmployee({ assets });
          const ok = await handleAdminSave("Asset Management", employee, next);
          if (ok) setAssetEdit(false);
        }}
        headerExtra={
          assetEdit ? (
            <button
              type="button"
              onClick={() =>
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
                ])
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Asset
            </button>
          ) : null
        }
      >
        {!assets.length ? (
          <EmptyStateCard icon={Monitor} title="No assets assigned" />
        ) : (
          <div className="space-y-4">
            {assets.map((a, idx) => (
              <div key={a.id} className="rounded-xl border border-border bg-background p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ProfileInfoField
                    label="Asset Name"
                    value={a.assetName}
                    editing={assetEdit}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, assetName: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Asset ID"
                    value={a.assetId}
                    editing={assetEdit}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, assetId: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Asset Category"
                    value={a.assetCategory}
                    editing={assetEdit}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, assetCategory: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Serial Number"
                    value={a.serialNumber}
                    editing={assetEdit}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, serialNumber: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Assigned Date"
                    value={a.assignedDate}
                    editing={assetEdit}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, assignedDate: v } : r)))
                    }
                    type="date"
                  />
                  <ProfileInfoField
                    label="Return Date"
                    value={a.returnDate || ""}
                    editing={assetEdit}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, returnDate: v } : r)))
                    }
                    type="date"
                  />
                  <ProfileInfoField
                    label="Asset Condition"
                    value={a.assetCondition}
                    editing={assetEdit}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, assetCondition: v } : r)))
                    }
                  />
                  <ProfileInfoField
                    label="Status"
                    value={a.status}
                    editing={assetEdit}
                    onChange={(v) =>
                      setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, status: v } : r)))
                    }
                  />
                  <div className="md:col-span-2">
                    <ProfileInfoField
                      label="Remarks"
                      value={a.remarks || ""}
                      editing={assetEdit}
                      onChange={(v) =>
                        setAssets((rows) => rows.map((r, i) => (i === idx ? { ...r, remarks: v } : r)))
                      }
                      type="textarea"
                    />
                  </div>
                </div>
                {assetEdit ? (
                  <button
                    type="button"
                    className="text-xs font-bold text-destructive hover:underline"
                    onClick={() => setAssets((rows) => rows.filter((_, i) => i !== idx))}
                  >
                    Delete asset
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </EditableSectionCard>

      <ProfileActivityTimeline employeeId={employee.id} />
    </div>
  );
}
