import { useCallback, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Landmark,
  Pencil,
  ShieldCheck,
  Trash,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import type { EmployeeDocumentMeta } from "../../../components/employees/mockData";
import type { DocumentTypeConfig } from "./types";
import { fileTypesToAccept, getStorageKeys, validateFileAgainstTypes } from "./types";

export type EmployeeDocumentsMap = Partial<Record<string, EmployeeDocumentMeta>>;
type DocumentFilter = "all" | "personal" | "official" | "company";

interface Props {
  documentTypes: DocumentTypeConfig[];
  docs: EmployeeDocumentsMap;
  isEditing: boolean;
  onChange: (docs: EmployeeDocumentsMap) => void;
  showTypeControls?: boolean;
  onEditType?: (type: DocumentTypeConfig) => void;
  onRemoveType?: (type: DocumentTypeConfig) => void;
}

function sideLabel(side: string | null): string | null {
  if (!side) return null;
  if (side === "front") return "Front Side";
  if (side === "back") return "Back Side";
  if (/^\d+$/.test(side)) return `File ${Number(side) + 1}`;
  return side;
}

function parseStorageKey(storageKey: string, typeId: string): string | null {
  if (storageKey === typeId) return null;
  return storageKey.replace(`${typeId}_`, "");
}

const DOCUMENT_SECTIONS = [
  {
    id: "personal",
    title: "Personal Documents",
    description: "Identity, KYC and address records",
    documentSection: "Personal",
    Icon: ShieldCheck,
  },
  {
    id: "official",
    title: "Official Documents",
    description: "Payroll, statutory, insurance and HR records",
    documentSection: "Official",
    Icon: Landmark,
  },
  {
    id: "company",
    title: "Company Documents",
    description: "Onboarding, employment and company-issued letters",
    documentSection: "Company",
    Icon: BriefcaseBusiness,
  },
] as const;

const FALLBACK_SECTION = {
  id: "other",
  title: "Other Documents",
  description: "Additional employee records",
  documentSection: "Company",
  Icon: FileText,
};

const DOCUMENT_FILTERS: { id: DocumentFilter; label: string; description: string }[] = [
  { id: "all", label: "All", description: "Every configured document" },
  { id: "personal", label: "Personal", description: "Documents assigned to the Personal section" },
  { id: "official", label: "Official", description: "Documents assigned to the Official section" },
  { id: "company", label: "Company", description: "Documents assigned to the Company section" },
];

function getDocumentSection(type: DocumentTypeConfig) {
  return DOCUMENT_SECTIONS.find((section) => section.documentSection === type.documentSection) || FALLBACK_SECTION;
}

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getPreviewKind(fileName?: string) {
  if (!fileName) return "unsupported";
  if (/\.(png|jpe?g|gif|webp)$/i.test(fileName)) return "image";
  if (/\.pdf$/i.test(fileName)) return "pdf";
  return "unsupported";
}

export function EmployeeDocumentsGrid({
  documentTypes,
  docs,
  isEditing,
  onChange,
  showTypeControls,
  onEditType,
  onRemoveType,
}: Props) {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [err, setErr] = useState<string | null>(null);
  const [previewMeta, setPreviewMeta] = useState<EmployeeDocumentMeta | null>(null);
  const [activeFilter, setActiveFilter] = useState<DocumentFilter>("all");

  const filteredDocumentTypes = useMemo(() => {
    if (activeFilter === "all") return documentTypes;
    return documentTypes.filter((type) => type.documentSection.toLowerCase() === activeFilter);
  }, [activeFilter, documentTypes]);

  const filteredStorageKeys = useMemo(() => filteredDocumentTypes.flatMap(getStorageKeys), [filteredDocumentTypes]);
  const filteredUploadedCount = filteredStorageKeys.filter((key) => docs[key]?.fileName).length;
  const filteredRequiredCount = filteredDocumentTypes.filter((type) => type.mandatory).length;

  const groupedDocumentTypes = useMemo(() => {
    const buckets = new Map<string, { section: ReturnType<typeof getDocumentSection>; types: DocumentTypeConfig[] }>();

    filteredDocumentTypes
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .forEach((type) => {
        const section = getDocumentSection(type);
        const existing = buckets.get(section.id);
        if (existing) {
          existing.types.push(type);
        } else {
          buckets.set(section.id, { section, types: [type] });
        }
      });

    return [...buckets.values()];
  }, [filteredDocumentTypes]);

  const readFile = useCallback(
    (file: File, storageKey: string, type: DocumentTypeConfig) => {
      const e = validateFileAgainstTypes(file, type.allowedFileTypes);
      if (e) {
        setErr(e);
        return;
      }
      setErr(null);
      setProgress((p) => ({ ...p, [storageKey]: 10 }));
      const reader = new FileReader();
      reader.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setProgress((p) => ({ ...p, [storageKey]: Math.round((ev.loaded / ev.total) * 90) + 10 }));
        }
      };
      reader.onload = () => {
        onChange({
          ...docs,
          [storageKey]: {
            fileName: file.name,
            dataUrl: String(reader.result || ""),
            uploadedAt: new Date().toISOString(),
            sizeBytes: file.size,
          },
        });
        setProgress((p) => ({ ...p, [storageKey]: 100 }));
        setTimeout(() => setProgress((p) => ({ ...p, [storageKey]: 0 })), 600);
      };
      reader.readAsDataURL(file);
    },
    [docs, onChange]
  );

  const download = (meta: EmployeeDocumentMeta) => {
    if (!meta.dataUrl || !meta.fileName) return;
    const a = document.createElement("a");
    a.href = meta.dataUrl;
    a.download = meta.fileName;
    a.click();
  };

  const previewDocument = (meta: EmployeeDocumentMeta) => {
    if (!meta.dataUrl || !meta.fileName) return;
    const previewKind = getPreviewKind(meta.fileName);
    if (previewKind === "unsupported") {
      download(meta);
      return;
    }
    setPreviewMeta(meta);
  };

  const remove = (storageKey: string) => {
    const n = { ...docs };
    delete n[storageKey];
    onChange(n);
  };

  if (!documentTypes.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No document types configured. Add a document type to get started.
      </p>
    );
  }

  return (
    <>
      {err ? (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {err}
        </div>
      ) : null}

      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Document Category</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {DOCUMENT_FILTERS.find((filter) => filter.id === activeFilter)?.description}
              </p>
            </div>

            <div className="hidden flex-wrap items-center gap-2 md:flex">
              {DOCUMENT_FILTERS.map((filter) => {
                const active = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={[
                      "rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
                    ].join(" ")}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as DocumentFilter)}
              className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-black uppercase tracking-widest text-foreground md:hidden"
            >
              {DOCUMENT_FILTERS.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground lg:justify-end">
              <span className="rounded-full border border-border bg-card px-3 py-1.5">
                {filteredUploadedCount}/{filteredStorageKeys.length} Uploaded
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
                {filteredRequiredCount} Required
              </span>
            </div>
          </div>
        </div>

        {groupedDocumentTypes.map(({ section, types }) => {
          const SectionIcon = section.Icon;
          const storageKeys = types.flatMap(getStorageKeys);
          const uploadedCount = storageKeys.filter((key) => docs[key]?.fileName).length;
          const requiredCount = types.filter((type) => type.mandatory).length;

          return (
            <section key={section.id} className="overflow-hidden rounded-2xl border border-border bg-background">
              <div className="flex flex-col gap-4 border-b border-border bg-secondary/20 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm ring-1 ring-border">
                    <SectionIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{section.title}</h3>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span className="rounded-full border border-border bg-card px-3 py-1.5">
                    {uploadedCount}/{storageKeys.length} Uploaded
                  </span>
                  {requiredCount ? (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
                      {requiredCount} Required
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2 2xl:grid-cols-3">
                {types.map((type) => {
                  const typeStorageKeys = getStorageKeys(type);
                  const accept = fileTypesToAccept(type.allowedFileTypes);
                  const completeCount = typeStorageKeys.filter((key) => docs[key]?.fileName).length;

                  return (
                    <div key={type.id} className="flex min-h-48 flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{type.documentName}</p>
                            {type.mandatory ? (
                              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-rose-600">
                                Required
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {type.category} - {completeCount}/{typeStorageKeys.length} files
                          </p>
                        </div>
                        {showTypeControls ? (
                          <div className="flex flex-shrink-0 items-center gap-1">
                            <button
                              type="button"
                              title="Edit document type"
                              className="rounded-md border border-border p-1.5 hover:bg-secondary"
                              onClick={() => onEditType?.(type)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {!type.isSystem ? (
                              <button
                                type="button"
                                title="Remove document type"
                                className="rounded-md border border-border p-1.5 text-destructive hover:bg-destructive/10"
                                onClick={() => onRemoveType?.(type)}
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        {typeStorageKeys.map((storageKey) => {
                          const side = parseStorageKey(storageKey, type.id);
                          const meta = docs[storageKey];
                          const pct = progress[storageKey] || 0;
                          const sideTitle = sideLabel(side);

                          return (
                            <div key={storageKey} className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  {sideTitle || "Document File"}
                                </p>
                                {meta?.uploadedAt ? (
                                  <span className="text-[10px] font-medium text-muted-foreground">{formatBytes(meta.sizeBytes)}</span>
                                ) : null}
                              </div>

                              {meta?.fileName ? (
                                <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/20 p-2.5">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                      <FileCheck2 className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-bold text-foreground">{meta.fileName}</p>
                                      <p className="text-[10px] font-medium text-muted-foreground">Uploaded</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-shrink-0 items-center gap-1">
                                    <button type="button" title="Preview" className="rounded-md p-1.5 hover:bg-background" onClick={() => previewDocument(meta)}>
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    <button type="button" title="Download" className="rounded-md p-1.5 hover:bg-background" onClick={() => download(meta)}>
                                      <Download className="h-3.5 w-3.5" />
                                    </button>
                                    {isEditing ? (
                                      <button type="button" title="Remove" className="rounded-md p-1.5 text-destructive hover:bg-destructive/10" onClick={() => remove(storageKey)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-border bg-secondary/10 p-3">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <UploadCloud className="h-4 w-4 opacity-50" />
                                    <span className="text-xs font-medium italic">No file uploaded</span>
                                  </div>
                                </div>
                              )}

                              {pct > 0 && pct < 100 ? (
                                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                                </div>
                              ) : null}

                              {isEditing ? (
                                <label>
                                  <span className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-secondary/50">
                                    <UploadCloud className="h-3.5 w-3.5" />
                                    {meta ? "Replace File" : sideTitle ? `Upload ${sideTitle}` : "Upload File"}
                                  </span>
                                  <input
                                    type="file"
                                    accept={accept}
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) readFile(f, storageKey, type);
                                      e.target.value = "";
                                    }}
                                  />
                                </label>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {groupedDocumentTypes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background px-5 py-10 text-center">
            <p className="text-sm font-bold text-foreground">No documents in this category</p>
            <p className="mt-1 text-xs text-muted-foreground">Choose another category or add a new document type.</p>
          </div>
        ) : null}
      </div>

      {previewMeta ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" onClick={() => setPreviewMeta(null)}>
          <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black uppercase tracking-widest text-foreground">Document Preview</h3>
                <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{previewMeta.fileName}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  title="Download"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                  onClick={() => download(previewMeta)}
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Close"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                  onClick={() => setPreviewMeta(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-secondary/20 p-4">
              {getPreviewKind(previewMeta.fileName) === "image" ? (
                <div className="flex h-full items-center justify-center overflow-auto rounded-xl bg-background">
                  <img src={previewMeta.dataUrl} alt={previewMeta.fileName || "Document preview"} className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <iframe
                  title={previewMeta.fileName || "Document preview"}
                  src={previewMeta.dataUrl}
                  className="h-full w-full rounded-xl border border-border bg-background"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
