import { useState, useRef, useCallback, useEffect } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode, ElementType, FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  User, Briefcase, Clock, CreditCard, Calendar, FileText,
  Shield, Upload, X, Check, Eye, EyeOff, ChevronDown,
  AlertCircle, CheckCircle, ArrowLeft, Hash, Mail,
  MapPin, Building2, UserPlus, Loader2, Save, RefreshCw, Search,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface UploadedFile { name: string; size: number; type: string; url: string; }

interface FormState {
  firstName: string; lastName: string; employeeId: string;
  email: string; phoneCode: string; phone: string;
  dob: string; gender: string; photo: UploadedFile | null;
  department: string; designation: string; employmentType: string;
  joiningDate: string; workLocation: string; reportingManager: string; status: string;
  shiftType: string; workStart: string; workEnd: string;
  weeklyOff: string[]; trackingMode: string;
  salaryStructure: string; basicSalary: string;
  bankName: string; accountNumber: string; ifscCode: string; taxId: string;
  leavePolicy: string; annualLeave: string; sickLeave: string;
  idProof: UploadedFile | null; addressProof: UploadedFile | null;
  offerLetter: UploadedFile | null; otherDocs: UploadedFile[];
  username: string; password: string; role: string; sendInvite: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;
type Touched = Partial<Record<keyof FormState, boolean>>;

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const SECTIONS = [
  { id: "s-basic",      n: 1, label: "Basic Information",    Icon: User       },
  { id: "s-job",        n: 2, label: "Job Details",          Icon: Briefcase  },
  { id: "s-attendance", n: 3, label: "Attendance Settings",  Icon: Clock      },
  { id: "s-payroll",    n: 4, label: "Payroll Information",  Icon: CreditCard },
  { id: "s-leave",      n: 5, label: "Leave Configuration",  Icon: Calendar   },
  { id: "s-documents",  n: 6, label: "Documents",            Icon: FileText   },
  { id: "s-account",    n: 7, label: "Account Access",       Icon: Shield     },
];

const DEPTS = ["Engineering","Product","Design","Marketing","Sales","Human Resources","Finance","Operations","Legal"];
const ROLES = ["Software Engineer","Senior Software Engineer","Engineering Manager","Product Manager","UX / UI Designer","Marketing Specialist","Sales Executive","HR Business Partner","Finance Analyst","Operations Lead"];
const MANAGERS = [
  { v: "sarah-chen",      l: "Sarah Chen — VP Engineering" },
  { v: "alex-kumar",      l: "Alex Kumar — CTO" },
  { v: "maria-rodriguez", l: "Maria Rodriguez — HR Director" },
  { v: "james-wilson",    l: "James Wilson — Engineering Manager" },
  { v: "priya-sharma",    l: "Priya Sharma — Product Lead" },
  { v: "david-park",      l: "David Park — Design Director" },
  { v: "nina-torres",     l: "Nina Torres — Finance Controller" },
];
const SALARY_STRUCTS = ["Standard","Senior","Executive","Contract","Intern / Trainee"];
const LEAVE_POLICIES = [
  { v: "standard",   l: "Standard Policy  — 24 AL + 12 SL" },
  { v: "senior",     l: "Senior Policy    — 30 AL + 15 SL" },
  { v: "executive",  l: "Executive Policy — 36 AL + 18 SL" },
  { v: "contract",   l: "Contract Policy  — 14 AL + 7 SL"  },
];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const PHONE_CODES = [
  { v: "+1",  l: "+1  US" },{ v: "+44", l: "+44 UK" },{ v: "+91", l: "+91 IN" },
  { v: "+49", l: "+49 DE" },{ v: "+33", l: "+33 FR" },{ v: "+81", l: "+81 JP" },
  { v: "+86", l: "+86 CN" },{ v: "+61", l: "+61 AU" },{ v: "+65", l: "+65 SG" },
];

const genId  = () => `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
const genPwd = () => {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
  return Array.from({ length: 14 }, () => c[Math.floor(Math.random() * c.length)]).join("");
};
const fmtSize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

const INIT: FormState = {
  firstName: "", lastName: "", employeeId: genId(),
  email: "", phoneCode: "+1", phone: "", dob: "", gender: "", photo: null,
  department: "", designation: "", employmentType: "", joiningDate: "",
  workLocation: "", reportingManager: "", status: "active",
  shiftType: "general", workStart: "09:00", workEnd: "18:00",
  weeklyOff: ["Saturday", "Sunday"], trackingMode: "biometric",
  salaryStructure: "", basicSalary: "", bankName: "", accountNumber: "", ifscCode: "", taxId: "",
  leavePolicy: "", annualLeave: "24", sickLeave: "12",
  idProof: null, addressProof: null, offerLetter: null, otherDocs: [],
  username: "", password: "", role: "employee", sendInvite: true,
};

// ═══════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════

function FF({
  label, required, error, ok, hint, children, span2,
}: {
  label: string; required?: boolean; error?: string; ok?: boolean;
  hint?: string; children: ReactNode; span2?: boolean;
}) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-red-500 font-medium">
          <AlertCircle size={11} strokeWidth={2.5} />{error}
        </div>
      ) : ok ? (
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-green-600 font-medium">
          <CheckCircle size={11} strokeWidth={2.5} />Looks good
        </div>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Inp({
  err, success, icon, wfull = true, ...p
}: InputHTMLAttributes<HTMLInputElement> & {
  err?: boolean; success?: boolean; icon?: ReactNode; wfull?: boolean;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center">
          {icon}
        </span>
      )}
      <input
        className={[
          "flat-input h-9 px-3 text-sm",
          wfull ? "w-full" : "",
          icon ? "pl-9" : "",
          err  ? "!border-red-400 focus:!border-red-500 focus:!shadow-[0_0_0_3px_rgba(220,53,69,0.08)]" : "",
          success && !err ? "!border-green-500 pr-9" : "",
          p.readOnly ? "opacity-60 cursor-not-allowed" : "",
        ].filter(Boolean).join(" ")}
        {...p}
      />
      {success && !err && (
        <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
      )}
    </div>
  );
}

function Sel({
  err, success, opts, ph, ...p
}: SelectHTMLAttributes<HTMLSelectElement> & {
  err?: boolean; success?: boolean;
  opts: { v: string; l: string }[]; ph?: string;
}) {
  return (
    <div className="relative">
      <select
        className={[
          "flat-input w-full h-9 px-3 pr-9 text-sm appearance-none cursor-pointer",
          err ? "!border-red-400" : "",
          success && !err ? "!border-green-500" : "",
        ].filter(Boolean).join(" ")}
        {...p}
      >
        {ph && <option value="">{ph}</option>}
        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function MultiSel({
  opts, sel, onChange, ph = "Select…",
}: {
  opts: string[]; sel: string[]; onChange: (v: string[]) => void; ph?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const toggle = (v: string) => onChange(sel.includes(v) ? sel.filter(s => s !== v) : [...sel, v]);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="flat-input w-full h-9 px-3 text-sm flex items-center justify-between gap-2 text-left">
        <span className={`truncate ${sel.length ? "text-foreground" : "text-muted-foreground"}`}>
          {sel.length ? sel.join(", ") : ph}
        </span>
        <ChevronDown size={13} className={`text-muted-foreground shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden">
          {opts.map(o => (
            <button key={o} type="button" onClick={() => toggle(o)}
              className="w-full px-3 py-2 text-sm flex items-center gap-2.5 hover:bg-secondary transition-colors text-left">
              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                sel.includes(o) ? "bg-foreground border-foreground" : "border-border bg-card"}`}>
                {sel.includes(o) && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
              </span>
              <span className="text-foreground">{o}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PhoneInp({
  cc, ph, onCC, onPh, err,
}: {
  cc: string; ph: string; onCC: (v: string) => void; onPh: (v: string) => void; err?: boolean;
}) {
  return (
    <div className={`flex h-9 flat-input overflow-hidden p-0 ${err ? "!border-red-400" : ""}`}>
      <select value={cc} onChange={e => onCC(e.target.value)}
        className="bg-secondary text-foreground text-xs px-2 border-r border-border appearance-none cursor-pointer focus:outline-none shrink-0 w-[76px] font-mono">
        {PHONE_CODES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
      </select>
      <input type="tel" value={ph} onChange={e => onPh(e.target.value)} placeholder="Phone number"
        className="flex-1 px-3 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground" />
    </div>
  );
}

function MaskInp({ val, onChange, ph = "••••••••" }: { val: string; onChange: (v: string) => void; ph?: string; }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex h-9 flat-input overflow-hidden p-0">
      <input type={show ? "text" : "password"} value={val} onChange={e => onChange(e.target.value)}
        placeholder={ph} className="flex-1 px-3 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground font-mono" />
      <button type="button" onClick={() => setShow(!show)} tabIndex={-1}
        className="px-3 text-muted-foreground hover:text-foreground transition-colors shrink-0">
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function SearchSel({
  value, onChange, opts, ph = "Search…",
}: {
  value: string; onChange: (v: string) => void;
  opts: { v: string; l: string }[]; ph?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = opts.filter(o => o.l.toLowerCase().includes(q.toLowerCase()));
  const selected = opts.find(o => o.v === value);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQ(""); } };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50); setQ(""); }}
        className="flat-input w-full h-9 px-3 text-sm flex items-center justify-between gap-2 text-left">
        <span className={selected ? "text-foreground truncate" : "text-muted-foreground"}>
          {selected?.l ?? ph}
        </span>
        <ChevronDown size={13} className={`text-muted-foreground shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input ref={inputRef} type="text" value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search managers…"
                className="w-full h-8 pl-8 pr-3 text-xs bg-background rounded-md border border-border focus:outline-none focus:border-foreground/40 text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0
              ? <p className="px-3 py-2.5 text-xs text-muted-foreground">No results</p>
              : filtered.map(o => (
                <button key={o.v} type="button"
                  onClick={() => { onChange(o.v); setOpen(false); setQ(""); }}
                  className={`w-full px-3 py-2 text-sm text-left transition-colors flex items-center gap-2 ${
                    value === o.v ? "bg-secondary font-medium text-foreground" : "hover:bg-secondary text-foreground"}`}>
                  {value === o.v && <Check size={12} className="text-foreground shrink-0" strokeWidth={2.5} />}
                  <span className={value === o.v ? "" : "pl-[20px]"}>{o.l}</span>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ on, setOn, label, desc }: { on: boolean; setOn: (v: boolean) => void; label: string; desc?: string; }) {
  return (
    <div className="flex items-center justify-between gap-6 p-4 rounded-lg border border-border bg-secondary/30 cursor-pointer select-none"
      onClick={() => setOn(!on)}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <div className={`relative shrink-0 w-10 rounded-full transition-colors duration-200 ${on ? "bg-foreground" : "bg-muted"}`}
        style={{ height: "22px" }}>
        <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-card shadow transition-transform duration-200 ${on ? "translate-x-[18px]" : ""}`} />
      </div>
    </div>
  );
}

function FileUp({ label, file, onChange, accept = "*" }: {
  label: string; file: UploadedFile | null; onChange: (f: UploadedFile | null) => void; accept?: string;
}) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handle = (f: File) => { const url = URL.createObjectURL(f); onChange({ name: f.name, size: f.size, type: f.type, url }); };

  if (file) return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <FileText size={14} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{file.name}</p>
        <p className="text-[11px] text-green-600 flex items-center gap-1 mt-0.5">
          <CheckCircle size={10} strokeWidth={2.5} />{fmtSize(file.size)} · Uploaded
        </p>
      </div>
      <button type="button" onClick={() => onChange(null)}
        className="w-6 h-6 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors shrink-0">
        <X size={11} className="text-muted-foreground" />
      </button>
    </div>
  );

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-150 ${
        drag ? "border-foreground bg-secondary/60 scale-[0.99]" : "border-border hover:border-muted hover:bg-secondary/20"}`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
      onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }} />
      <Upload size={16} className="mx-auto mb-2 text-muted-foreground" />
      <p className="text-xs text-foreground">
        <span className="font-semibold">Click to upload</span>
        <span className="text-muted-foreground"> or drag & drop</span>
      </p>
      <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function PhotoUp({ file, onChange }: { file: UploadedFile | null; onChange: (f: UploadedFile | null) => void; }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handle = (f: File) => { const url = URL.createObjectURL(f); onChange({ name: f.name, size: f.size, type: f.type, url }); };
  return (
    <div className="flex items-center gap-5">
      <div
        className={`relative w-[80px] h-[80px] rounded-xl overflow-hidden cursor-pointer shrink-0 border-2 transition-all duration-150 ${
          file ? "border-border" : `border-dashed ${drag ? "border-foreground" : "border-border hover:border-muted"}`}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
        onClick={() => ref.current?.click()}>
        {file
          ? <img src={file.url} alt="Profile preview" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-secondary/50">
              <User size={26} className="text-muted-foreground" />
            </div>
        }
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }} />
      </div>
      <div>
        <button type="button" onClick={() => ref.current?.click()}
          className="text-sm font-semibold text-foreground hover:text-muted-foreground transition-colors underline-offset-2 hover:underline">
          {file ? "Change photo" : "Upload photo"}
        </button>
        <p className="text-xs text-muted-foreground mt-1">JPG or PNG · Recommended 400×400 px · Max 2 MB</p>
        {file && (
          <button type="button" onClick={() => onChange(null)}
            className="mt-1.5 text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
            <X size={10} />Remove photo
          </button>
        )}
      </div>
    </div>
  );
}

// Section card wrapper
function SC({ id, n, title, desc, Icon, children }: {
  id: string; n: number; title: string; desc: string;
  Icon: ElementType; children: ReactNode;
}) {
  return (
    <section id={id} className="flat-card bg-card p-6 scroll-mt-4">
      <div className="flex items-start gap-4 pb-5 mb-6 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shrink-0">
          <Icon size={16} className="text-primary-foreground" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em]">
            Section {String(n).padStart(2, "0")}
          </p>
          <h2 className="text-[15px] font-semibold text-foreground mt-0.5 leading-snug">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {children}
      </div>
    </section>
  );
}

// Segment button group
function Segs({ opts, val, set }: { opts: string[]; val: string; set: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {opts.map(o => (
        <button key={o} type="button" onClick={() => set(o)}
          className={`h-9 px-4 rounded-lg text-sm font-medium transition-all border capitalize ${
            val === o
              ? "bg-foreground text-primary-foreground border-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:border-muted"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

// Section nav
function SectionNav({ active }: { active: string }) {
  return (
    <aside className="hidden xl:block w-[188px] shrink-0">
      <div className="sticky top-6">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] px-2 mb-3">
          Form Sections
        </p>
        <nav className="flex flex-col gap-0.5">
          {SECTIONS.map(({ id, n, label, Icon }) => {
            const isActive = active === id;
            return (
              <a key={id} href={`#${id}`}
                onClick={e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-foreground text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <span className={`w-[18px] h-[18px] rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isActive ? "bg-white/20 text-primary-foreground" : ""}`}>
                  {n}
                </span>
                <span className="truncate">{label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

export function AddEmployeePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ ...INIT });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [submitting, setSubmitting] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState("s-basic");

  // IntersectionObserver for active section
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: "-10% 0px -80% 0px" }
    );
    SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [submitted]);

  // Auto-generate username from name
  useEffect(() => {
    const u = `${form.firstName}${form.firstName && form.lastName ? "." : ""}${form.lastName}`
      .toLowerCase().replace(/[^a-z0-9.]/g, "");
    setForm(f => ({ ...f, username: u }));
  }, [form.firstName, form.lastName]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const blur = (k: keyof FormState) => {
    setTouched(t => ({ ...t, [k]: true }));
    vField(k);
  };

  const vField = useCallback((k: keyof FormState): boolean => {
    const REQ: (keyof FormState)[] = ["firstName","lastName","email","department","designation","employmentType","joiningDate"];
    if (REQ.includes(k) && !form[k]) {
      setErrors(e => ({ ...e, [k]: "This field is required" })); return false;
    }
    if (k === "email" && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors(e => ({ ...e, email: "Enter a valid email address" })); return false;
    }
    if (k === "basicSalary" && form.basicSalary && isNaN(Number(form.basicSalary))) {
      setErrors(e => ({ ...e, basicSalary: "Must be a valid number" })); return false;
    }
    return true;
  }, [form]);

  const validateAll = (): boolean => {
    const REQ: (keyof FormState)[] = ["firstName","lastName","email","department","designation","employmentType","joiningDate"];
    const errs: Errors = {};
    let ok = true;
    REQ.forEach(k => { if (!form[k]) { errs[k] = "This field is required"; ok = false; } });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address"; ok = false;
    }
    setErrors(errs);
    const allT: Touched = {};
    (Object.keys(form) as (keyof FormState)[]).forEach(k => (allT[k] = true));
    setTouched(allT);
    if (!ok) document.getElementById("s-basic")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return ok;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleDraft = async () => {
    setDraftSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setDraftSaving(false);
  };

  const ok = (k: keyof FormState) => !!(touched[k] && !errors[k] && form[k]);

  // ── Success screen ───────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex items-center justify-center p-8 min-h-full bg-background">
        <div className="flat-card bg-card p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-6">
            <Check size={22} className="text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Employee Created</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            <span className="font-semibold text-foreground">{form.firstName} {form.lastName}</span> has been
            successfully added with ID <span className="font-mono font-semibold text-foreground">{form.employeeId}</span>.
          </p>
          {form.sendInvite && form.email && (
            <p className="mt-3 text-xs text-muted-foreground p-3 bg-secondary rounded-lg leading-relaxed">
              A welcome email has been queued to <span className="font-semibold text-foreground">{form.email}</span>.
            </p>
          )}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => { setSubmitted(false); setForm({ ...INIT, employeeId: genId() }); setErrors({}); setTouched({}); }}
              className="flex-1 h-9 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              Add Another
            </button>
            <button
              onClick={() => navigate("/admin/employees")}
              className="flex-1 h-9 rounded-lg bg-foreground text-primary-foreground text-sm font-semibold hover:bg-accent transition-colors">
              View Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Scrollable form area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-4">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate("/admin/employees")}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shrink-0">
              <ArrowLeft size={14} />
            </button>
            <div>
              <h1 className="text-base font-semibold text-foreground leading-tight">Add New Employee</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete all required sections · Auto-ID:
                <span className="font-mono font-semibold text-foreground ml-1">{form.employeeId}</span>
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button type="button" onClick={handleDraft} disabled={draftSaving}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-all disabled:opacity-50">
              {draftSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save Draft
            </button>
          </div>
        </div>

        {/* Layout: SectionNav + Form */}
        <div className="flex gap-8 items-start">
          <SectionNav active={activeSection} />

          <form id="add-employee-form" onSubmit={handleSubmit} noValidate
            className="flex-1 flex flex-col gap-4 min-w-0">

            {/* ─────────────────────────────────────────────
                SECTION 1 · BASIC INFORMATION
            ───────────────────────────────────────────── */}
            <SC id="s-basic" n={1} title="Basic Information"
              desc="Personal details, contact info, and profile photo" Icon={User}>

              <FF label="First Name" required error={errors.firstName} ok={ok("firstName")}>
                <Inp name="firstName" value={form.firstName}
                  onChange={e => set("firstName", e.target.value)} onBlur={() => blur("firstName")}
                  placeholder="James" err={!!errors.firstName} success={ok("firstName")} />
              </FF>

              <FF label="Last Name" required error={errors.lastName} ok={ok("lastName")}>
                <Inp name="lastName" value={form.lastName}
                  onChange={e => set("lastName", e.target.value)} onBlur={() => blur("lastName")}
                  placeholder="Anderson" err={!!errors.lastName} success={ok("lastName")} />
              </FF>

              <FF label="Employee ID" hint="Auto-generated · Read-only">
                <Inp value={form.employeeId} readOnly icon={<Hash size={13} />}
                  className="bg-secondary/50" />
              </FF>

              <FF label="Email Address" required error={errors.email} ok={ok("email")}>
                <Inp name="email" type="email" value={form.email}
                  onChange={e => set("email", e.target.value)} onBlur={() => blur("email")}
                  placeholder="j.anderson@company.com"
                  icon={<Mail size={13} />} err={!!errors.email} success={ok("email")} />
              </FF>

              <FF label="Phone Number" hint="Include area code" span2>
                <PhoneInp cc={form.phoneCode} ph={form.phone}
                  onCC={v => set("phoneCode", v)} onPh={v => set("phone", v)} />
              </FF>

              <FF label="Date of Birth">
                <Inp type="date" value={form.dob} onChange={e => set("dob", e.target.value)} className="cursor-pointer" />
              </FF>

              <FF label="Gender">
                <Sel value={form.gender} onChange={e => set("gender", e.target.value)}
                  ph="Select gender"
                  opts={[
                    { v: "male", l: "Male" }, { v: "female", l: "Female" },
                    { v: "non-binary", l: "Non-binary" }, { v: "prefer-not-to-say", l: "Prefer not to say" },
                  ]} />
              </FF>

              <FF label="Profile Photo" hint="JPG or PNG · Max 2 MB" span2>
                <PhotoUp file={form.photo} onChange={v => set("photo", v)} />
              </FF>
            </SC>

            {/* ─────────────────────────────────────────────
                SECTION 2 · JOB DETAILS
            ───────────────────────────────────────────── */}
            <SC id="s-job" n={2} title="Job Details"
              desc="Role, department, and employment configuration" Icon={Briefcase}>

              <FF label="Department" required error={errors.department} ok={ok("department")}>
                <Sel value={form.department}
                  onChange={e => { set("department", e.target.value); setTouched(t => ({ ...t, department: true })); }}
                  onBlur={() => blur("department")}
                  ph="Select department" err={!!errors.department} success={ok("department")}
                  opts={DEPTS.map(d => ({ v: d.toLowerCase().replace(/\s+/g, "-"), l: d }))} />
              </FF>

              <FF label="Designation / Role" required error={errors.designation} ok={ok("designation")}>
                <Sel value={form.designation}
                  onChange={e => { set("designation", e.target.value); setTouched(t => ({ ...t, designation: true })); }}
                  onBlur={() => blur("designation")}
                  ph="Select role" err={!!errors.designation} success={ok("designation")}
                  opts={ROLES.map(r => ({ v: r.toLowerCase().replace(/\s+\/\s+|\s+/g, "-"), l: r }))} />
              </FF>

              <FF label="Employment Type" required error={errors.employmentType} ok={ok("employmentType")}>
                <Sel value={form.employmentType}
                  onChange={e => { set("employmentType", e.target.value); setTouched(t => ({ ...t, employmentType: true })); }}
                  onBlur={() => blur("employmentType")}
                  ph="Select type" err={!!errors.employmentType} success={ok("employmentType")}
                  opts={[
                    { v: "full-time", l: "Full-time" },
                    { v: "part-time", l: "Part-time" },
                    { v: "contract",  l: "Contract"  },
                  ]} />
              </FF>

              <FF label="Date of Joining" required error={errors.joiningDate} ok={ok("joiningDate")}>
                <Inp type="date" value={form.joiningDate}
                  onChange={e => { set("joiningDate", e.target.value); setTouched(t => ({ ...t, joiningDate: true })); }}
                  onBlur={() => blur("joiningDate")}
                  err={!!errors.joiningDate} success={ok("joiningDate")} className="cursor-pointer" />
              </FF>

              <FF label="Work Location">
                <Inp value={form.workLocation} onChange={e => set("workLocation", e.target.value)}
                  placeholder="New York HQ / Remote" icon={<MapPin size={13} />} />
              </FF>

              <FF label="Reporting Manager" hint="Searchable — type to filter">
                <SearchSel value={form.reportingManager} onChange={v => set("reportingManager", v)}
                  opts={MANAGERS} ph="Search managers…" />
              </FF>

              <FF label="Employee Status" span2>
                <Segs opts={["active","probation","inactive"]} val={form.status} set={v => set("status", v)} />
              </FF>
            </SC>

            {/* ─────────────────────────────────────────────
                SECTION 3 · ATTENDANCE SETTINGS
            ───────────────────────────────────────────── */}
            <SC id="s-attendance" n={3} title="Attendance Settings"
              desc="Shift type, working hours, and tracking configuration" Icon={Clock}>

              <FF label="Shift Type" span2>
                <Segs opts={["general","night","custom"]} val={form.shiftType} set={v => set("shiftType", v)} />
              </FF>

              <FF label="Working Hours" hint="Start time → End time">
                <div className="flex items-center gap-2">
                  <input type="time" value={form.workStart}
                    onChange={e => set("workStart", e.target.value)}
                    className="flat-input flex-1 h-9 px-3 text-sm cursor-pointer" />
                  <span className="text-xs font-semibold text-muted-foreground shrink-0">→</span>
                  <input type="time" value={form.workEnd}
                    onChange={e => set("workEnd", e.target.value)}
                    className="flat-input flex-1 h-9 px-3 text-sm cursor-pointer" />
                </div>
              </FF>

              <FF label="Weekly Off Days">
                <MultiSel opts={DAYS} sel={form.weeklyOff} onChange={v => set("weeklyOff", v)} ph="Select days off…" />
              </FF>

              <FF label="Attendance Tracking Mode">
                <Sel value={form.trackingMode} onChange={e => set("trackingMode", e.target.value)}
                  opts={[
                    { v: "biometric", l: "Biometric" },
                    { v: "manual",    l: "Manual"    },
                    { v: "hybrid",    l: "Hybrid"    },
                  ]} />
              </FF>
            </SC>

            {/* ─────────────────────────────────────────────
                SECTION 4 · PAYROLL INFORMATION
            ───────────────────────────────────────────── */}
            <SC id="s-payroll" n={4} title="Payroll Information"
              desc="Salary structure and banking details" Icon={CreditCard}>

              <FF label="Salary Structure">
                <Sel value={form.salaryStructure} onChange={e => set("salaryStructure", e.target.value)}
                  ph="Select structure"
                  opts={SALARY_STRUCTS.map(s => ({ v: s.toLowerCase().replace(/\s+\/\s+|\s+/g, "-"), l: s }))} />
              </FF>

              <FF label="Basic Salary (Annual)" error={errors.basicSalary} ok={ok("basicSalary")}>
                <Inp type="number" name="basicSalary" value={form.basicSalary}
                  onChange={e => set("basicSalary", e.target.value)} onBlur={() => blur("basicSalary")}
                  placeholder="85,000"
                  icon={<span className="text-xs font-bold">$</span>}
                  err={!!errors.basicSalary} success={ok("basicSalary")} />
              </FF>

              <FF label="Bank Name">
                <Inp value={form.bankName} onChange={e => set("bankName", e.target.value)}
                  placeholder="Chase Bank" icon={<Building2 size={13} />} />
              </FF>

              <FF label="Account Number" hint="Encrypted at rest — masked for security">
                <MaskInp val={form.accountNumber} onChange={v => set("accountNumber", v)} ph="Enter account number" />
              </FF>

              <FF label="IFSC / Routing Code">
                <Inp value={form.ifscCode} onChange={e => set("ifscCode", e.target.value.toUpperCase())}
                  placeholder="HDFC0001234" className="font-mono tracking-wider" />
              </FF>

              <FF label="Tax ID / PAN">
                <Inp value={form.taxId} onChange={e => set("taxId", e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F" className="font-mono tracking-wider" />
              </FF>
            </SC>

            {/* ─────────────────────────────────────────────
                SECTION 5 · LEAVE CONFIGURATION
            ───────────────────────────────────────────── */}
            <SC id="s-leave" n={5} title="Leave Configuration"
              desc="Leave policy and opening balances for the employee" Icon={Calendar}>

              <FF label="Leave Policy" span2>
                <Sel value={form.leavePolicy} onChange={e => set("leavePolicy", e.target.value)}
                  ph="Select leave policy" opts={LEAVE_POLICIES} />
              </FF>

              <FF label="Annual Leave Balance" hint="Days credited per year">
                <Inp type="number" value={form.annualLeave}
                  onChange={e => set("annualLeave", e.target.value)}
                  placeholder="24" min={0} max={365} />
              </FF>

              <FF label="Sick Leave Balance" hint="Days credited per year">
                <Inp type="number" value={form.sickLeave}
                  onChange={e => set("sickLeave", e.target.value)}
                  placeholder="12" min={0} max={365} />
              </FF>
            </SC>

            {/* ─────────────────────────────────────────────
                SECTION 6 · DOCUMENTS
            ───────────────────────────────────────────── */}
            <SC id="s-documents" n={6} title="Documents"
              desc="Upload required identification and employment documents" Icon={FileText}>

              <FF label="ID Proof" hint="Passport, Driver's License, or National ID">
                <FileUp label="PDF, JPG, PNG · Max 5 MB"
                  file={form.idProof} onChange={v => set("idProof", v)}
                  accept=".pdf,.jpg,.jpeg,.png" />
              </FF>

              <FF label="Address Proof" hint="Utility bill, bank statement, or lease">
                <FileUp label="PDF, JPG, PNG · Max 5 MB"
                  file={form.addressProof} onChange={v => set("addressProof", v)}
                  accept=".pdf,.jpg,.jpeg,.png" />
              </FF>

              <FF label="Offer Letter">
                <FileUp label="PDF · Max 10 MB"
                  file={form.offerLetter} onChange={v => set("offerLetter", v)}
                  accept=".pdf" />
              </FF>

              <FF label="Other Documents" hint="Additional supporting documents">
                <FileUp label="Any format · Max 10 MB"
                  file={form.otherDocs[0] ?? null}
                  onChange={v => set("otherDocs", v ? [v] : [])} />
              </FF>
            </SC>

            {/* ─────────────────────────────────────────────
                SECTION 7 · ACCOUNT ACCESS
            ───────────────────────────────────────────── */}
            <SC id="s-account" n={7} title="Account Access"
              desc="System credentials and role-based access permissions" Icon={Shield}>

              <FF label="Username" hint="Auto-generated from name · Can be edited manually">
                <Inp value={form.username} onChange={e => set("username", e.target.value)}
                  placeholder="james.anderson" icon={<User size={13} />} />
              </FF>

              <FF label="Temporary Password" hint="Leave blank to auto-generate on creation">
                <div className="flex flex-col gap-2">
                  <MaskInp val={form.password} onChange={v => set("password", v)} ph="Auto-generate if empty" />
                  <button type="button" onClick={() => set("password", genPwd())}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-fit font-medium">
                    <RefreshCw size={11} />Generate strong password
                  </button>
                </div>
              </FF>

              <FF label="System Role">
                <Sel value={form.role} onChange={e => set("role", e.target.value)}
                  opts={[
                    { v: "employee", l: "Employee" },
                    { v: "manager",  l: "Manager"  },
                    { v: "admin",    l: "Administrator" },
                  ]} />
              </FF>

              <div className="sm:col-span-2">
                <Toggle on={form.sendInvite} setOn={v => set("sendInvite", v)}
                  label="Send Welcome Email"
                  desc="An email with login credentials and onboarding info will be sent to the employee upon account creation." />
              </div>
            </SC>

          </form>
        </div>
      </div>

      {/* ── Sticky Action Bar ─────────────────────────────── */}
      <div className="sticky bottom-0 z-10 bg-card border-t border-border">
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle size={12} className="shrink-0" />
            <span className="hidden sm:block">
              Fields marked <span className="text-red-500 font-bold mx-0.5">*</span> are required
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate("/admin/employees")}
              className="h-8 px-4 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              Cancel
            </button>
            <button type="button" onClick={handleDraft} disabled={draftSaving}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-all disabled:opacity-50">
              {draftSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save Draft
            </button>
            <button type="submit" form="add-employee-form" disabled={submitting}
              className="flex items-center gap-1.5 h-8 px-5 rounded-lg bg-foreground text-primary-foreground text-xs font-bold hover:bg-accent transition-all disabled:opacity-60">
              {submitting
                ? <><Loader2 size={12} className="animate-spin" />Creating…</>
                : <><UserPlus size={12} />Create Employee</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}