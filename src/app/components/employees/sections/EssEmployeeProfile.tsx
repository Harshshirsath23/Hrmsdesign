import { useCallback, useEffect, useState } from "react";
import {
  MapPin, User, Briefcase, Heart, Languages,
} from "lucide-react";
import { Employee } from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import {
  EditableSectionCard,
  ProfileInfoField,
  EmptyStateCard,
  UploadField,
  ConfirmationDialog,
} from "../employee-details";

interface Props {
  employee: Employee;
}

type LangRow = NonNullable<Employee["languages"]>[number];

export function EssEmployeeProfile({ employee }: Props) {
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
  }, [employee]);

  const mergeEmployee = useCallback(
    (patch: Partial<Employee>) => ({ ...employee, ...patch }),
    [employee]
  );

  const isEditable = (id: string) => employee.editableSections?.includes(id);

  return (
    <div className="space-y-6 pb-20">
      {/* Personal Information */}
      <EditableSectionCard
        title="Personal Information"
        icon={User}
        sectionId="profile-personal"
        canEmployeeEdit={isEditable("profile-personal")}
        hideAdminControls
        requestStatus={employee.editRequestStatus}
        isEditing={personalEdit}
        onEdit={() => setPersonalEdit(true)}
        onCancel={() => { setPersonal(employee); setPersonalEdit(false); }}
        onSave={async () => {
          const ok = await handleAdminSave("Personal Information", employee, personal);
          if (ok) setPersonalEdit(false);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileInfoField label="First Name" value={personal.firstName || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, firstName: v }))} />
          <ProfileInfoField label="Middle Name" value={personal.middleName || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, middleName: v }))} />
          <ProfileInfoField label="Last Name" value={personal.lastName || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, lastName: v }))} />
          <ProfileInfoField label="Father's Name" value={personal.fathersName || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, fathersName: v }))} />
          <ProfileInfoField label="Spouse's Name" value={personal.spouseName || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, spouseName: v }))} />
          <ProfileInfoField label="Date of Birth" value={personal.dateOfBirth} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, dateOfBirth: v }))} type="date" />
          <ProfileInfoField label="Actual DOB" value={personal.actualDob || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, actualDob: v }))} type="date" />
          <ProfileInfoField label="Place of Birth" value={personal.placeOfBirth || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, placeOfBirth: v }))} />
          <ProfileInfoField label="Gender" value={personal.gender} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, gender: v }))} />
          <ProfileInfoField label="Marital Status" value={personal.maritalStatus} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, maritalStatus: v }))} />
          <ProfileInfoField label="Blood Group" value={personal.bloodGroup} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, bloodGroup: v }))} />
          <ProfileInfoField label="Nationality" value={personal.nationality} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, nationality: v }))} />
          <ProfileInfoField label="Religion" value={personal.religion || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, religion: v }))} />
          <ProfileInfoField label="Caste" value={personal.caste || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, caste: v }))} />
          <ProfileInfoField label="Caste Category" value={personal.casteCategory || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, casteCategory: v }))} />
          <ProfileInfoField label="Identification Mark" value={personal.identificationMark || ""} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, identificationMark: v }))} />
          <ProfileInfoField label="Physically Challenged" value={personal.isPhysicallyChallenged ? "Yes" : "No"} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, isPhysicallyChallenged: /^y/i.test(v.trim()) }))} />
          <ProfileInfoField label="International Employee" value={personal.isInternationalEmployee ? "Yes" : "No"} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, isInternationalEmployee: /^y/i.test(v.trim()) }))} />
          <ProfileInfoField label="Joining Date" value={personal.joiningDate} editing={personalEdit} onChange={(v) => setPersonal((p) => ({ ...p, joiningDate: v }))} type="date" />
        </div>
      </EditableSectionCard>

      {/* Address Details */}
      <EditableSectionCard
        title="Address Details"
        icon={MapPin}
        sectionId="profile-address"
        canEmployeeEdit={isEditable("profile-address")}
        hideAdminControls
        requestStatus={employee.editRequestStatus}
        isEditing={addressEdit}
        onEdit={() => setAddressEdit(true)}
        onCancel={() => {
          setAddr({ current: employee.currentAddress, permanent: employee.permanentAddress, same: employee.currentAddress?.isSameAsPermanent ?? false });
          setAddressEdit(false);
        }}
        onSave={async () => {
          const currentAddress = { ...(addr.current || {}), isSameAsPermanent: addr.same } as Employee["currentAddress"];
          const permanentAddress = addr.same ? { ...currentAddress, isSameAsPermanent: undefined } : addr.permanent;
          const next = mergeEmployee({ currentAddress, permanentAddress: permanentAddress as Employee["permanentAddress"] });
          const ok = await handleAdminSave("Address Details", employee, next);
          if (ok) setAddressEdit(false);
        }}
      >
        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Current Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(["addressLine1", "addressLine2", "landmark", "city", "state", "country", "pincode", "startDate", "toDate"] as const).map((key) => (
                <ProfileInfoField key={key} label={key === "addressLine1" ? "Address Line 1" : key === "addressLine2" ? "Address Line 2" : key.charAt(0).toUpperCase() + key.slice(1)} value={(addr.current?.[key] as string) || ""} editing={addressEdit} type={key.includes("Date") ? "date" : "text"} onChange={(v) => setAddr((a) => ({ ...a, current: { ...(a.current || {}), [key]: v } as Employee["currentAddress"] }))} />
              ))}
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={addr.same} disabled={!addressEdit} onChange={() => setAddr((a) => { const ns = !a.same; return { ...a, same: ns, permanent: ns && a.current ? { ...a.current } : a.permanent }; })} />
                Same as permanent address
              </label>
            </div>
          </div>
          <div className="pt-6 border-t border-border">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Permanent Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(["addressLine1", "addressLine2", "landmark", "city", "state", "country", "pincode", "startDate", "toDate"] as const).map((key) => (
                <ProfileInfoField key={`p-${key}`} label={key === "addressLine1" ? "Address Line 1" : key === "addressLine2" ? "Address Line 2" : key.charAt(0).toUpperCase() + key.slice(1)} value={(addr.permanent?.[key] as string) || ""} editing={addressEdit && !addr.same} type={key.includes("Date") ? "date" : "text"} onChange={(v) => setAddr((a) => ({ ...a, permanent: { ...(a.permanent || {}), [key]: v } as Employee["permanentAddress"] }))} />
              ))}
            </div>
          </div>
        </div>
      </EditableSectionCard>

      {/* Work Details */}
      <EditableSectionCard
        title="Work Details"
        icon={Briefcase}
        sectionId="profile-work"
        canEmployeeEdit={isEditable("profile-work")}
        hideAdminControls
        requestStatus={employee.editRequestStatus}
        isEditing={workEdit}
        onEdit={() => setWorkEdit(true)}
        onCancel={() => { setWork(employee); setWorkEdit(false); }}
        onSave={async () => {
          const ok = await handleAdminSave("Work Details", employee, work);
          if (ok) setWorkEdit(false);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileInfoField label="Employee ID" value={employee.employeeId} editing={false} />
          <ProfileInfoField label="Employee Category" value={work.employeeCategory || ""} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, employeeCategory: v }))} />
          <ProfileInfoField label="Department" value={work.department} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, department: v }))} />
          <ProfileInfoField label="Team" value={work.team} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, team: v }))} />
          <ProfileInfoField label="Designation" value={work.designation} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, designation: v }))} />
          <ProfileInfoField label="Shift" value={work.shift || ""} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, shift: v }))} />
          <ProfileInfoField label="Work Location" value={work.location} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, location: v }))} />
          <ProfileInfoField label="Employee Type" value={work.employeeType || ""} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, employeeType: v }))} />
          <ProfileInfoField label="Confirmation Date" value={work.confirmationDate || ""} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, confirmationDate: v }))} type="date" />
          <ProfileInfoField label="Employment Status" value={work.employmentStatus || ""} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, employmentStatus: v }))} />
          <ProfileInfoField label="Probation Period" value={work.probationPeriod || ""} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, probationPeriod: v }))} />
          <ProfileInfoField label="Notice Period" value={work.noticePeriod || ""} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, noticePeriod: v }))} />
          <ProfileInfoField label="Reporting To" value={work.reportingTo || ""} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, reportingTo: v }))} />
          <ProfileInfoField label="Functional Manager" value={work.functionalManager || ""} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, functionalManager: v }))} />
          <ProfileInfoField label="HR Partner" value={work.hrPartner || ""} editing={workEdit} onChange={(v) => setWork((w) => ({ ...w, hrPartner: v }))} />
        </div>
      </EditableSectionCard>

      {/* Language Details */}
      <EditableSectionCard
        title="Language Details"
        icon={Languages}
        sectionId="profile-languages"
        canEmployeeEdit={isEditable("profile-languages")}
        hideAdminControls
        requestStatus={employee.editRequestStatus}
        isEditing={langEdit}
        onEdit={() => setLangEdit(true)}
        onCancel={() => { setLanguages(employee.languages || []); setLangEdit(false); }}
        onSave={async () => {
          const next = mergeEmployee({ languages });
          const ok = await handleAdminSave("Language Details", employee, next);
          if (ok) setLangEdit(false);
        }}
      >
        {!languages.length ? (
          <EmptyStateCard icon={Languages} title="No languages recorded" description="No language proficiency data available." />
        ) : (
          <div className="space-y-4">
            {languages.map((row, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-background p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ProfileInfoField label="Language Name" value={row.language} editing={langEdit} onChange={(v) => setLanguages((rows) => rows.map((r, i) => (i === idx ? { ...r, language: v } : r)))} />
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-semibold text-muted-foreground tracking-wide">Proficiency Level</span>
                    {langEdit ? (
                      <select value={row.proficiency} onChange={(e) => setLanguages((rows) => rows.map((r, i) => (i === idx ? { ...r, proficiency: e.target.value } : r)))} className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium">
                        {["Beginner", "Intermediate", "Advanced", "Native"].map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    ) : (
                      <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm font-semibold">{row.proficiency || "—"}</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  {(["canRead", "canWrite", "canSpeak"] as const).map((key) => (
                    <label key={key} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input type="checkbox" checked={row[key]} disabled={!langEdit} onChange={() => setLanguages((rows) => rows.map((r, i) => (i === idx ? { ...r, [key]: !r[key] } : r)))} />
                      {key.replace("can", "")}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </EditableSectionCard>

      {/* Emergency & Medical */}
      <EditableSectionCard
        title="Emergency & Medical Information"
        icon={Heart}
        sectionId="profile-medical"
        canEmployeeEdit={isEditable("profile-medical")}
        hideAdminControls
        requestStatus={employee.editRequestStatus}
        isEditing={emEdit}
        onEdit={() => setEmEdit(true)}
        onCancel={() => { setEmergency({ ec: employee.emergencyContact, med: employee.medicalInfo }); setEmEdit(false); }}
        onSave={async () => {
          const next = mergeEmployee({ emergencyContact: emergency.ec, medicalInfo: emergency.med });
          const ok = await handleAdminSave("Emergency & Medical Information", employee, next);
          if (ok) setEmEdit(false);
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileInfoField label="Emergency Contact Name" value={emergency.ec?.name || ""} editing={emEdit} onChange={(v) => setEmergency((e) => ({ ...e, ec: { ...e.ec, name: v, relationship: e.ec?.relationship || "", phone: e.ec?.phone || "" } }))} />
          <ProfileInfoField label="Emergency Contact #" value={emergency.ec?.phone || ""} editing={emEdit} onChange={(v) => setEmergency((e) => ({ ...e, ec: { name: e.ec?.name || "", relationship: e.ec?.relationship || "", phone: v, alternatePhone: e.ec?.alternatePhone } }))} />
          <ProfileInfoField label="Relationship" value={emergency.ec?.relationship || emergency.med?.relationship || ""} editing={emEdit} onChange={(v) => setEmergency((e) => ({ ...e, ec: { name: e.ec?.name || "", phone: e.ec?.phone || "", relationship: v } }))} />
          <ProfileInfoField label="Medical Conditions" value={emergency.med?.conditions || ""} editing={emEdit} onChange={(v) => setEmergency((e) => ({ ...e, med: { ...e.med, conditions: v } }))} type="textarea" />
          <ProfileInfoField label="Allergies" value={emergency.med?.allergies || ""} editing={emEdit} onChange={(v) => setEmergency((e) => ({ ...e, med: { ...e.med, allergies: v } }))} />
          <ProfileInfoField label="Doctor Name" value={emergency.med?.doctorName || ""} editing={emEdit} onChange={(v) => setEmergency((e) => ({ ...e, med: { ...e.med, doctorName: v } }))} />
        </div>
      </EditableSectionCard>
    </div>
  );
}
