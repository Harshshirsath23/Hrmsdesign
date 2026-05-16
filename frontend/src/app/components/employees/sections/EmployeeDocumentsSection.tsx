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
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const [docs, setDocs] = useState<Partial<Record<EmployeeDocumentKey, EmployeeDocumentMeta>>>(
    () => ({ ...(employee.employeeDocuments || {}) })
  );
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [err, setErr] = useState<string | null>(null);

  const baseline = useMemo(() => ({ ...(employee.employeeDocuments || {}) }), [employee.employeeDocuments]);

  const isEditable = employee.editableSections?.includes("employee-documents");

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

  const download = (meta: EmployeeDocumentMeta) => {
    if (!meta.dataUrl || !meta.fileName) return;
    const a = document.createElement("a");
    a.href = meta.dataUrl;
    a.download = meta.fileName;
    a.click();
  };

  const previewDocument = (meta: EmployeeDocumentMeta) => {
    if (!meta.dataUrl || !meta.fileName) return;

    const isWord = meta.fileName.toLowerCase().endsWith(".doc") || meta.fileName.toLowerCase().endsWith(".docx");
    if (isWord) {
      download(meta);
      return;
    }

    try {
      const parts = meta.dataUrl.split(",");
      if (parts.length < 2) throw new Error("Invalid data URL");
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      console.error("Preview failed:", e);
      window.open(meta.dataUrl, "_blank");
    }
  };

  const remove = (key: string) => {
    setDocs((d) => {
      const n = { ...d };
      delete n[key];
      return n;
    });
  };

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-lg font-bold text-foreground">Employee Documents</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload and manage documents for {employee.name}</p>
      </div>
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      <EditableSectionCard
        title="Document Management"
        icon={FileText}
        sectionId="employee-documents"
        canEmployeeEdit={isEditable}
        onToggleEmployeeEdit={(v) => handleToggleEditAccess(employee, "employee-documents", v)}
        requestStatus={employee.editRequestStatus}
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
            const needsTwoSides = ["panCard", "aadhaarCard", "passport", "visa", "insuranceDocuments"].includes(key);
            const sides = needsTwoSides ? (["front", "back"] as const) : ([null] as const);

            return (
              <div key={key} className="rounded-xl border border-border bg-background p-4 flex flex-col gap-4">
                <p className="text-sm font-bold text-foreground">{LABELS[key]}</p>
                <div className="space-y-3">
                  {sides.map((side) => {
                    const storageKey = side ? `${key}_${side}` : key;
                    const meta = (docs as any)[storageKey];
                    const pct = progress[storageKey] || 0;

                    return (
                      <div key={storageKey} className="flex flex-col gap-2">
                        {side && <p className="text-[10px] font-bold uppercase text-muted-foreground">{side} Side</p>}
                        {meta?.fileName ? (
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/30 border border-border">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-foreground truncate font-medium">{meta.fileName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                                title="View Document"
                                onClick={() => previewDocument(meta)}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                                title="Download Document"
                                onClick={() => download(meta)}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              {isEditing && (
                                <button
                                  type="button"
                                  className="p-1.5 rounded-md hover:bg-background text-destructive transition-colors"
                                  title="Remove Document"
                                  onClick={() => remove(storageKey)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10 border border-dashed border-border">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground italic">No file uploaded</span>
                          </div>
                        )}

                        {pct > 0 && pct < 100 ? (
                          <div className="h-1 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        ) : null}

                        {isEditing && (
                          <label className="mt-1">
                            <span className="inline-flex items-center justify-center w-full py-1.5 rounded-lg border border-dashed border-border text-[10px] font-bold cursor-pointer hover:bg-secondary/50 transition-colors">
                              {meta ? "Replace" : side ? `Upload ${side}` : "Upload File"}
                            </span>
                            <input
                              type="file"
                              accept={ACCEPT}
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) readFile(f, storageKey as any);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </EditableSectionCard>
    </div>
  );
}
