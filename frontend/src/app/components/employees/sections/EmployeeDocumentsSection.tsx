import { useMemo, useState, useCallback } from "react";
import { FileText, Download, Trash2, Eye } from "lucide-react";
import {
  EMPLOYEE_DOCUMENT_KEYS,
  Employee,
  EmployeeDocumentKey,
  EmployeeDocumentMeta,
} from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import { EditableSectionCard } from "../employee-details";

const LABELS: Record<EmployeeDocumentKey, string> = {
  panCard: "PAN Card",
  aadhaarCard: "Aadhaar Card",
  resume: "Resume",
  offerLetter: "Offer Letter",
  joiningDocuments: "Joining Documents",
  educationalCertificates: "Educational Certificates",
  salarySlips: "Salary Slips",
  experienceLetters: "Experience Letters",
  passport: "Passport",
  visa: "Visa",
  taxDocuments: "Tax Documents",
  insuranceDocuments: "Insurance Documents",
  relievingLetter: "Relieving Letter",
  appraisalLetters: "Appraisal Letters",
  incrementLetters: "Increment Letters",
};

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

function validateFile(file: File): string | null {
  const okExt = /\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(file.name);
  if (!okExt) return "Only PDF, DOC, DOCX, JPG, or PNG files are allowed.";
  if (file.size > MAX_BYTES) return "File must be 8 MB or smaller.";
  return null;
}

interface Props {
  employee: Employee;
}

export function EmployeeDocumentsSection({ employee }: Props) {
  const { handleAdminSave } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const [docs, setDocs] = useState<Partial<Record<EmployeeDocumentKey, EmployeeDocumentMeta>>>(
    () => ({ ...(employee.employeeDocuments || {}) })
  );
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [err, setErr] = useState<string | null>(null);

  const baseline = useMemo(() => ({ ...(employee.employeeDocuments || {}) }), [employee.employeeDocuments]);

  const readFile = useCallback((file: File, key: EmployeeDocumentKey) => {
    const e = validateFile(file);
    if (e) {
      setErr(e);
      return;
    }
    setErr(null);
    setProgress((p) => ({ ...p, [key]: 10 }));
    const reader = new FileReader();
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress((p) => ({ ...p, [key]: Math.round((ev.loaded / ev.total) * 90) + 10 }));
    };
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setDocs((d) => ({
        ...d,
        [key]: {
          fileName: file.name,
          dataUrl,
          uploadedAt: new Date().toISOString(),
          sizeBytes: file.size,
        },
      }));
      setProgress((p) => ({ ...p, [key]: 100 }));
      setTimeout(() => setProgress((p) => ({ ...p, [key]: 0 })), 600);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = async () => {
    const ok = await handleAdminSave("Employee Documents", employee, { ...employee, employeeDocuments: docs });
    if (ok) setIsEditing(false);
  };

  const download = (key: EmployeeDocumentKey) => {
    const m = docs[key];
    if (!m?.dataUrl || !m.fileName) return;
    const a = document.createElement("a");
    a.href = m.dataUrl;
    a.download = m.fileName;
    a.click();
  };

  const remove = (key: EmployeeDocumentKey) => {
    setDocs((d) => {
      const n = { ...d };
      delete n[key];
      return n;
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Employee Documents</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload and manage documents for {employee.name}</p>
      </div>
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      <EditableSectionCard
        title="Document Management"
        icon={FileText}
        isEditing={isEditing}
        onEdit={() => {
          setDocs({ ...baseline });
          setIsEditing(true);
        }}
        onCancel={() => {
          setDocs({ ...baseline });
          setIsEditing(false);
          setErr(null);
        }}
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {EMPLOYEE_DOCUMENT_KEYS.map((key) => {
            const meta = docs[key];
            const pct = progress[key] || 0;
            return (
              <div key={key} className="rounded-xl border border-border bg-background p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{LABELS[key]}</p>
                  {meta?.dataUrl ? (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        className="p-1.5 rounded-md border border-border hover:bg-secondary"
                        title="Preview"
                        onClick={() => window.open(meta.dataUrl, "_blank")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-md border border-border hover:bg-secondary"
                        title="Download"
                        onClick={() => download(key)}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {isEditing ? (
                        <button
                          type="button"
                          className="p-1.5 rounded-md border border-border text-destructive hover:bg-destructive/10"
                          title="Delete"
                          onClick={() => remove(key)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {meta?.fileName ? (
                  <p className="text-xs text-muted-foreground truncate">{meta.fileName}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">No file uploaded</p>
                )}
                {pct > 0 && pct < 100 ? (
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                ) : null}
                {isEditing ? (
                  <label className="mt-auto">
                    <span className="inline-flex items-center justify-center w-full py-2 rounded-lg border border-dashed border-border text-xs font-semibold cursor-pointer hover:bg-secondary/50">
                      {meta ? "Replace file" : "Upload"}
                    </span>
                    <input
                      type="file"
                      accept={ACCEPT}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) readFile(f, key);
                        e.target.value = "";
                      }}
                    />
                  </label>
                ) : null}
              </div>
            );
          })}
        </div>
      </EditableSectionCard>
    </div>
  );
}
