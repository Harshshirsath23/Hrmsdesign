import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User, Phone, Briefcase, Users, Shield, FileText, ChevronRight, Check,
  X, AlertCircle,
} from "lucide-react";
import { employees } from "../../../components/employees/mockData";

interface FormData {
  empNumberSeries: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  status: string;
  dateOfJoining: string;
  probationPeriod: string;
  confirmationDate: string;
  email: string;
  mobile: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  reportingManager: string;
  department: string;
  designation: string;
  grade: string;
  location: string;
  attendanceScheme: string;
  referredBy: string;
  referralName: string;
  pan: string;
  aadhaar: string;
  bankAccount: string;
  ifsc: string;
  onboardingPolicy: boolean;
}

const INITIAL: FormData = {
  empNumberSeries: "EMP-", employeeId: "", firstName: "", lastName: "", dob: "",
  gender: "", status: "Active", dateOfJoining: "", probationPeriod: "3", confirmationDate: "",
  email: "", mobile: "", emergencyContactName: "", emergencyContactNumber: "",
  reportingManager: "", department: "", designation: "", grade: "", location: "", attendanceScheme: "Standard",
  referredBy: "", referralName: "",
  pan: "", aadhaar: "", bankAccount: "", ifsc: "",
  onboardingPolicy: false,
};

const departments      = ["Engineering", "Human Resources", "Product", "Design", "Marketing", "Analytics", "Finance"];
const grades           = ["L1", "L2", "L3", "L4", "L5", "L6", "M1", "M2", "Director"];
const locations        = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Pune", "Kochi"];
const attendanceSchemes = ["Standard", "Flexible", "Shift A", "Shift B", "Remote"];
const genders          = ["Male", "Female", "Non-binary", "Prefer not to say"];

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
      <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-foreground" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {label} {required && <span className="text-foreground ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "flat-input w-full px-4 py-2.5 text-sm";
const selectCls = inputCls + " appearance-none cursor-pointer";

export function AddEmployeePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.firstName.trim())    errs.firstName    = "Required";
    if (!form.lastName.trim())     errs.lastName     = "Required";
    if (!form.email.trim())        errs.email        = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.mobile.trim())       errs.mobile       = "Required";
    if (!form.department)          errs.department   = "Required";
    if (!form.designation.trim())  errs.designation  = "Required";
    if (!form.dateOfJoining)       errs.dateOfJoining = "Required";
    if (!form.onboardingPolicy)    errs.onboardingPolicy = "You must accept the policy";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="flat-card bg-card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-secondary border border-border rounded-lg flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3">Employee Added!</h2>
          <p className="text-sm text-muted-foreground mb-8">
            <span className="font-bold text-foreground">{form.firstName} {form.lastName}</span> has been successfully added to the system.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setForm(INITIAL); setSubmitted(false); setErrors({}); }}
              className="px-6 py-2.5 border border-border text-sm font-semibold text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              Add Another
            </button>
            <button
              onClick={() => navigate("/admin/employees")}
              className="px-6 py-2.5 bg-foreground text-primary-foreground text-sm font-semibold rounded-lg hover:bg-accent transition-colors"
            >
              View Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  const E = (key: keyof FormData) =>
    errors[key] ? (
      <p className="text-xs font-medium text-muted-foreground mt-1.5 flex items-center gap-1.5" data-error="true">
        <AlertCircle className="w-3.5 h-3.5" /> {errors[key]}
      </p>
    ) : null;

  return (
    <div className="h-full overflow-y-auto p-6">
      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Section 1 – Basic Info */}
          <div className="flat-card bg-card p-8">
            <SectionHeader icon={User} title="Basic Information" subtitle="Personal and employment details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="Employee Number Series">
                <input className={inputCls} value={form.empNumberSeries} onChange={(e) => set("empNumberSeries", e.target.value)} placeholder="EMP-" />
              </Field>
              <Field label="Employee ID">
                <input className={inputCls} value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} placeholder="Auto-generated if blank" />
              </Field>
              <Field label="First Name" required>
                <input className={inputCls} value={form.firstName} onChange={(e) => { set("firstName", e.target.value); setErrors((p) => ({ ...p, firstName: "" })); }} placeholder="First name" />
                {E("firstName")}
              </Field>
              <Field label="Last Name" required>
                <input className={inputCls} value={form.lastName} onChange={(e) => { set("lastName", e.target.value); setErrors((p) => ({ ...p, lastName: "" })); }} placeholder="Last name" />
                {E("lastName")}
              </Field>
              <Field label="Date of Birth">
                <input type="date" className={inputCls} value={form.dob} onChange={(e) => set("dob", e.target.value)} />
              </Field>
              <Field label="Gender">
                <select className={selectCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Select gender</option>
                  {genders.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className={selectCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>On Probation</option>
                </select>
              </Field>
              <Field label="Date of Joining" required>
                <input type="date" className={inputCls} value={form.dateOfJoining} onChange={(e) => { set("dateOfJoining", e.target.value); setErrors((p) => ({ ...p, dateOfJoining: "" })); }} />
                {E("dateOfJoining")}
              </Field>
              <Field label="Probation Period (months)">
                <input type="number" className={inputCls} value={form.probationPeriod} onChange={(e) => set("probationPeriod", e.target.value)} min="0" max="24" />
              </Field>
              <Field label="Confirmation Date">
                <input type="date" className={inputCls} value={form.confirmationDate} onChange={(e) => set("confirmationDate", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Section 2 – Contact */}
          <div className="flat-card bg-card p-8">
            <SectionHeader icon={Phone} title="Contact Information" subtitle="Email, phone and emergency contact" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Work Email" required>
                <input type="email" className={inputCls} value={form.email} onChange={(e) => { set("email", e.target.value); setErrors((p) => ({ ...p, email: "" })); }} placeholder="employee@company.com" />
                {E("email")}
              </Field>
              <Field label="Mobile Number" required>
                <input type="tel" className={inputCls} value={form.mobile} onChange={(e) => { set("mobile", e.target.value); setErrors((p) => ({ ...p, mobile: "" })); }} placeholder="+91 98765 43210" />
                {E("mobile")}
              </Field>
              <Field label="Emergency Contact Name">
                <input className={inputCls} value={form.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} placeholder="Contact person name" />
              </Field>
              <Field label="Emergency Contact Number">
                <input type="tel" className={inputCls} value={form.emergencyContactNumber} onChange={(e) => set("emergencyContactNumber", e.target.value)} placeholder="+91 98765 43210" />
              </Field>
            </div>
          </div>

          {/* Section 3 – Work Info */}
          <div className="flat-card bg-card p-8">
            <SectionHeader icon={Briefcase} title="Work Information" subtitle="Role, department and reporting details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="Reporting Manager">
                <select className={selectCls} value={form.reportingManager} onChange={(e) => set("reportingManager", e.target.value)}>
                  <option value="">Select manager</option>
                  {employees.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
                </select>
              </Field>
              <Field label="Department" required>
                <select className={selectCls} value={form.department} onChange={(e) => { set("department", e.target.value); setErrors((p) => ({ ...p, department: "" })); }}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d}>{d}</option>)}
                </select>
                {E("department")}
              </Field>
              <Field label="Designation" required>
                <input className={inputCls} value={form.designation} onChange={(e) => { set("designation", e.target.value); setErrors((p) => ({ ...p, designation: "" })); }} placeholder="e.g. Software Engineer" />
                {E("designation")}
              </Field>
              <Field label="Grade">
                <select className={selectCls} value={form.grade} onChange={(e) => set("grade", e.target.value)}>
                  <option value="">Select grade</option>
                  {grades.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Location">
                <select className={selectCls} value={form.location} onChange={(e) => set("location", e.target.value)}>
                  <option value="">Select location</option>
                  {locations.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Attendance Scheme">
                <select className={selectCls} value={form.attendanceScheme} onChange={(e) => set("attendanceScheme", e.target.value)}>
                  {attendanceSchemes.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Section 4 – Referral */}
          <div className="flat-card bg-card p-8">
            <SectionHeader icon={Users} title="Referral Information" subtitle="Employee referral details (if applicable)" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Referred By">
                <select className={selectCls} value={form.referredBy} onChange={(e) => set("referredBy", e.target.value)}>
                  <option value="">No referral</option>
                  {employees.map((e) => <option key={e.id} value={e.name}>{e.name} ({e.employeeId})</option>)}
                </select>
              </Field>
              {form.referredBy && (
                <Field label="Referral Name (Optional)">
                  <input className={inputCls} value={form.referralName} onChange={(e) => set("referralName", e.target.value)} placeholder="Name of external candidate" />
                </Field>
              )}
            </div>
          </div>

          {/* Section 5 – Statutory */}
          <div className="flat-card bg-card p-8">
            <SectionHeader icon={Shield} title="Statutory Information" subtitle="PAN, Aadhaar and banking details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="PAN Number">
                <input className={inputCls} value={form.pan} onChange={(e) => set("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} />
              </Field>
              <Field label="Aadhaar Number">
                <input className={inputCls} value={form.aadhaar} onChange={(e) => set("aadhaar", e.target.value)} placeholder="XXXX XXXX XXXX" maxLength={14} />
              </Field>
              <Field label="Bank Account Number">
                <input className={inputCls} value={form.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} placeholder="Account number" />
              </Field>
              <Field label="IFSC Code">
                <input className={inputCls} value={form.ifsc} onChange={(e) => set("ifsc", e.target.value.toUpperCase())} placeholder="HDFC0001234" maxLength={11} />
              </Field>
            </div>
          </div>

          {/* Section 6 – Policy */}
          <div className="flat-card bg-card p-8">
            <SectionHeader icon={FileText} title="Policies" subtitle="Employee policy acknowledgement" />
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={form.onboardingPolicy}
                  onChange={(e) => { set("onboardingPolicy", e.target.checked); setErrors((p) => ({ ...p, onboardingPolicy: "" })); }}
                  className="peer appearance-none w-5 h-5 rounded-md border-2 border-border bg-card
                    checked:bg-foreground checked:border-foreground focus:outline-none
                    focus:ring-2 focus:ring-foreground/20 transition-all cursor-pointer"
                />
                <Check className="absolute w-3.5 h-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <span className="text-sm font-medium text-foreground leading-relaxed">
                I confirm that this employee has read and agreed to the{" "}
                <span className="font-bold underline cursor-pointer">Employee Onboarding Policy</span>{" "}
                and all terms of employment.
              </span>
            </label>
            {E("onboardingPolicy")}
          </div>

          {/* Submit row */}
          <div className="flex items-center justify-end gap-3 pb-6 pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/employees")}
              className="flex items-center gap-2 px-6 py-2.5 border border-border text-sm font-semibold text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-2.5 bg-foreground text-primary-foreground text-sm font-semibold rounded-lg hover:bg-accent transition-colors"
            >
              Add Employee <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
