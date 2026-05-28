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
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
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

const DOCUMENT_FILTERS: { id: DocumentFilter; label: string; description: string }[] = [
  { id: "all", label: "All", description: "Every configured document" },
  { id: "personal", label: "Personal", description: "Documents assigned to the Personal section" },
  { id: "official", label: "Official", description: "Documents assigned to the Official section" },
  { id: "company", label: "Company", description: "Documents assigned to the Company section" },
];

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
  const [frontBackPreview, setFrontBackPreview] = useState<{
    front: EmployeeDocumentMeta | null;
    back: EmployeeDocumentMeta | null;
    docName: string;
  } | null>(null);
  const [activeFilter, setActiveFilter] = useState<DocumentFilter>("all");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredDocumentTypes = useMemo(() => {
    if (activeFilter === "all") return documentTypes;
    return documentTypes.filter((type) => type.documentSection.toLowerCase() === activeFilter);
  }, [activeFilter, documentTypes]);

  const filteredStorageKeys = useMemo(() => filteredDocumentTypes.flatMap(getStorageKeys), [filteredDocumentTypes]);
  const filteredUploadedCount = filteredStorageKeys.filter((key) => docs[key]?.fileName).length;
  const filteredRequiredCount = filteredDocumentTypes.filter((type) => type.mandatory).length;

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

  const downloadAll = (type: DocumentTypeConfig) => {
    const keys = getStorageKeys(type);
    keys.forEach((key) => {
      const meta = docs[key];
      if (meta?.fileName && meta?.dataUrl) {
        download(meta);
      }
    });
  };

  const deleteAll = (type: DocumentTypeConfig) => {
    if (!window.confirm(`Delete all files for "${type.documentName}"?`)) return;
    const keys = getStorageKeys(type);
    const n = { ...docs };
    keys.forEach((key) => {
      delete n[key];
    });
    onChange(n);
  };

  if (!documentTypes.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground font-medium">
        No document types configured. Add a document type to get started.
      </p>
    );
  }

  return (
    <>
      {err ? (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive flex items-center justify-between">
          <span>{err}</span>
          <button type="button" onClick={() => setErr(null)} className="text-destructive hover:opacity-80">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="space-y-4">
        {/* Category filters header */}
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Document Category</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
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
                      "rounded-full border px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
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
              className="h-10 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground md:hidden"
            >
              {DOCUMENT_FILTERS.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground lg:justify-end">
              <span className="rounded-full border border-border bg-card px-3 py-1.5 font-bold">
                {filteredUploadedCount}/{filteredStorageKeys.length} Uploaded
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 font-bold">
                {filteredRequiredCount} Required
              </span>
            </div>
          </div>
        </div>

        {/* Unified Document Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-secondary/40 border-b border-border text-xs font-black uppercase tracking-widest text-muted-foreground select-none">
                <tr>
                  <th scope="col" className="w-8 py-3.5 pl-4"></th>
                  <th scope="col" className="px-6 py-3.5">Document Name</th>
                  <th scope="col" className="px-6 py-3.5">Category</th>
                  <th scope="col" className="px-6 py-3.5">Uploaded Files</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDocumentTypes.map((type) => {
                  const typeStorageKeys = getStorageKeys(type);
                  const isExpandable = type.uploadType !== "single";
                  const isExpanded = !!expandedRows[type.id];
                  const accept = fileTypesToAccept(type.allowedFileTypes);
                  const completeCount = typeStorageKeys.filter((key) => docs[key]?.fileName).length;
                  const allUploaded = completeCount === typeStorageKeys.length;
                  const singleKey = typeStorageKeys[0];
                  const singleMeta = docs[singleKey];

                  return (
                    <>
                      <tr
                        key={type.id}
                        className={[
                          "hover:bg-secondary/15 transition-colors group",
                          isExpanded ? "bg-secondary/5" : "",
                        ].join(" ")}
                      >
                        {/* Expand Icon */}
                        <td className="py-4 pl-4">
                          {isExpandable ? (
                            <button
                              type="button"
                              onClick={() => toggleRow(type.id)}
                              className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          ) : null}
                        </td>

                        {/* Document Name */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{type.documentName}</span>
                              {type.mandatory && (
                                <span className="rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-600">
                                  Required
                                </span>
                              )}
                            </div>
                            {/* If single upload type, show filename under the name */}
                            {!isExpandable && singleMeta?.fileName && (
                              <span className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-xs font-mono">
                                📄 {singleMeta.fileName} ({formatBytes(singleMeta.sizeBytes)})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-md bg-secondary/80 border border-border/70 px-2.5 py-0.5 text-xs font-bold text-foreground">
                            {type.category}
                          </span>
                        </td>

                        {/* Uploaded Files Count */}
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-muted-foreground">
                          {completeCount}/{typeStorageKeys.length} files
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={[
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border",
                              type.status === "Active"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-zinc-50 border-zinc-200 text-zinc-600",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "h-1.5 w-1.5 rounded-full",
                                type.status === "Active" ? "bg-emerald-500" : "bg-zinc-400",
                              ].join(" ")}
                            />
                            {type.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* If single type and uploaded */}
                            {!isExpandable && singleMeta?.fileName && (
                              <>
                                <button
                                  type="button"
                                  title="Preview"
                                  className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                                  onClick={() => previewDocument(singleMeta)}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Download"
                                  className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                                  onClick={() => download(singleMeta)}
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </>
                            )}

                            {/* Front/Back multi-view button */}
                            {type.uploadType === "frontBack" && completeCount > 0 && (
                              <button
                                type="button"
                                title="View side-by-side"
                                className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                                onClick={() => {
                                  setFrontBackPreview({
                                    front: docs[`${type.id}_front`] || null,
                                    back: docs[`${type.id}_back`] || null,
                                    docName: type.documentName,
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}

                            {/* Expand to edit config if showTypeControls is true */}
                            {showTypeControls && (
                              <button
                                type="button"
                                title="Edit Document Settings"
                                className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                                onClick={() => onEditType?.(type)}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}

                            {/* For single upload and isEditing: Show Upload button if empty, otherwise Replace */}
                            {!isExpandable && isEditing && (
                              <label className="cursor-pointer">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border bg-card text-xs font-bold text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all">
                                  <UploadCloud className="h-3.5 w-3.5" />
                                  {singleMeta ? "Replace" : "Upload"}
                                </span>
                                <input
                                  type="file"
                                  accept={accept}
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) readFile(f, singleKey, type);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            )}

                            {/* Expand button for frontBack/multiple edit state */}
                            {isExpandable && isEditing && (
                              <button
                                type="button"
                                onClick={() => toggleRow(type.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-bold text-muted-foreground hover:bg-secondary/55 hover:text-foreground transition-all"
                              >
                                {isExpanded ? "Collapse" : "Edit Files"}
                              </button>
                            )}

                            {/* Download All if expandable */}
                            {isExpandable && completeCount > 0 && (
                              <button
                                type="button"
                                title="Download all files"
                                className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                                onClick={() => downloadAll(type)}
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}

                            {/* Delete buttons */}
                            {!isExpandable && singleMeta && isEditing && (
                              <button
                                type="button"
                                title="Delete file"
                                className="p-1.5 rounded-lg border border-destructive/20 bg-card text-destructive hover:bg-destructive/10 transition-colors"
                                onClick={() => remove(singleKey)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}

                            {isExpandable && completeCount > 0 && isEditing && (
                              <button
                                type="button"
                                title="Delete all files"
                                className="p-1.5 rounded-lg border border-destructive/20 bg-card text-destructive hover:bg-destructive/10 transition-colors"
                                onClick={() => deleteAll(type)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}

                            {showTypeControls && !type.isSystem && (
                              <button
                                type="button"
                                title="Delete Document Type"
                                className="p-1.5 rounded-lg border border-destructive/20 bg-card text-destructive hover:bg-destructive/10 transition-colors"
                                onClick={() => onRemoveType?.(type)}
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Sub-Rows */}
                      {isExpandable && isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-secondary/10 px-6 py-4 border-t border-b border-border/40">
                            <div className="rounded-xl border border-border/80 bg-background overflow-hidden shadow-inner">
                              <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                  <tr className="bg-secondary/20 border-b border-border/70 text-[10px] font-black uppercase tracking-wider text-muted-foreground select-none">
                                    <th className="px-4 py-2.5 w-1/4">Side / File Slot</th>
                                    <th className="px-4 py-2.5 w-2/5">File Details</th>
                                    <th className="px-4 py-2.5">Status</th>
                                    <th className="px-4 py-2.5 text-right pr-4">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                  {typeStorageKeys.map((storageKey) => {
                                    const side = parseStorageKey(storageKey, type.id);
                                    const meta = docs[storageKey];
                                    const pct = progress[storageKey] || 0;
                                    const sideTitle = sideLabel(side);

                                    return (
                                      <tr key={storageKey} className="hover:bg-secondary/5 transition-colors">
                                        {/* Slot Name */}
                                        <td className="px-4 py-3 font-semibold text-foreground">
                                          {sideTitle || "File Slot"}
                                        </td>

                                        {/* File Details */}
                                        <td className="px-4 py-3">
                                          {meta?.fileName ? (
                                            <div className="flex flex-col min-w-0">
                                              <span className="font-bold text-foreground truncate max-w-sm font-mono">
                                                {meta.fileName}
                                              </span>
                                              <span className="text-[10px] text-muted-foreground mt-0.5">
                                                Size: {formatBytes(meta.sizeBytes)}
                                              </span>
                                            </div>
                                          ) : (
                                            <span className="text-muted-foreground italic font-medium">No file uploaded</span>
                                          )}

                                          {/* Progress bar */}
                                          {pct > 0 && pct < 100 && (
                                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                              <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${pct}%` }}
                                              />
                                            </div>
                                          )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                          {meta?.fileName ? (
                                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                              Uploaded
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 rounded bg-zinc-50 border border-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
                                              Pending
                                            </span>
                                          )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-right pr-4">
                                          <div className="flex items-center justify-end gap-1.5">
                                            {meta?.fileName && (
                                              <>
                                                <button
                                                  type="button"
                                                  title="Preview"
                                                  className="p-1 rounded border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                                                  onClick={() => previewDocument(meta)}
                                                >
                                                  <Eye className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  title="Download"
                                                  className="p-1 rounded border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                                                  onClick={() => download(meta)}
                                                >
                                                  <Download className="h-3.5 w-3.5" />
                                                </button>
                                              </>
                                            )}

                                            {isEditing && (
                                              <label className="cursor-pointer">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded border border-dashed border-border bg-card text-[10px] font-bold text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all">
                                                  <UploadCloud className="h-3 w-3" />
                                                  {meta ? "Replace" : "Upload"}
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
                                            )}

                                            {meta && isEditing && (
                                              <button
                                                type="button"
                                                title="Delete file"
                                                className="p-1 rounded border border-destructive/20 bg-card text-destructive hover:bg-destructive/10 transition-colors"
                                                onClick={() => remove(storageKey)}
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}

                {filteredDocumentTypes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm font-semibold text-muted-foreground">
                      No documents found in this category
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Single Document Preview Modal */}
      {previewMeta ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300"
          onClick={() => setPreviewMeta(null)}
        >
          <div
            className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black uppercase tracking-widest text-foreground">
                  Document Preview
                </h3>
                <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground">
                  {previewMeta.fileName}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  title="Download"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => download(previewMeta)}
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Close"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setPreviewMeta(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-secondary/20 p-4">
              {getPreviewKind(previewMeta.fileName) === "image" ? (
                <div className="flex h-full items-center justify-center overflow-auto rounded-xl bg-background border border-border/80">
                  <img
                    src={previewMeta.dataUrl}
                    alt={previewMeta.fileName || "Document preview"}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <iframe
                  title={previewMeta.fileName || "Document preview"}
                  src={previewMeta.dataUrl}
                  className="h-full w-full rounded-xl border border-border/80 bg-background"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Side-by-Side Front & Back Preview Modal */}
      {frontBackPreview ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300"
          onClick={() => setFrontBackPreview(null)}
        >
          <div
            className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black uppercase tracking-widest text-foreground">
                  Side-by-Side Preview: {frontBackPreview.docName}
                </h3>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  title="Close"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setFrontBackPreview(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-secondary/10 p-5 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
              {/* Front Side */}
              <div className="flex flex-col h-full min-h-[400px]">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Front Side</span>
                  {frontBackPreview.front && (
                    <button
                      type="button"
                      title="Download front side"
                      onClick={() => frontBackPreview.front && download(frontBackPreview.front)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                    >
                      <Download className="h-3 w-3" /> Download
                    </button>
                  )}
                </h4>
                <div className="flex-1 rounded-xl border border-border/80 bg-background overflow-hidden p-2 flex items-center justify-center min-h-[300px]">
                  {frontBackPreview.front ? (
                    getPreviewKind(frontBackPreview.front.fileName) === "image" ? (
                      <img
                        src={frontBackPreview.front.dataUrl}
                        alt="Front side preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <iframe
                        title="Front side preview"
                        src={frontBackPreview.front.dataUrl}
                        className="h-full w-full border-0"
                      />
                    )
                  ) : (
                    <div className="text-center p-6 text-muted-foreground font-semibold italic">
                      No front side file uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Back Side */}
              <div className="flex flex-col h-full min-h-[400px]">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Back Side</span>
                  {frontBackPreview.back && (
                    <button
                      type="button"
                      title="Download back side"
                      onClick={() => frontBackPreview.back && download(frontBackPreview.back)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                    >
                      <Download className="h-3 w-3" /> Download
                    </button>
                  )}
                </h4>
                <div className="flex-1 rounded-xl border border-border/80 bg-background overflow-hidden p-2 flex items-center justify-center min-h-[300px]">
                  {frontBackPreview.back ? (
                    getPreviewKind(frontBackPreview.back.fileName) === "image" ? (
                      <img
                        src={frontBackPreview.back.dataUrl}
                        alt="Back side preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <iframe
                        title="Back side preview"
                        src={frontBackPreview.back.dataUrl}
                        className="h-full w-full border-0"
                      />
                    )
                  ) : (
                    <div className="text-center p-6 text-muted-foreground font-semibold italic">
                      No back side file uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
