import { useCallback, useState } from "react";
import { FileText, Download, Trash2, Eye, Pencil, Trash } from "lucide-react";
import type { EmployeeDocumentMeta } from "../../../components/employees/mockData";
import type { DocumentTypeConfig } from "./types";
import { fileTypesToAccept, getStorageKeys, validateFileAgainstTypes } from "./types";

export type EmployeeDocumentsMap = Partial<Record<string, EmployeeDocumentMeta>>;

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
    const isWord = /\.(doc|docx)$/i.test(meta.fileName);
    if (isWord) {
      download(meta);
      return;
    }
    window.open(meta.dataUrl, "_blank");
  };

  const remove = (storageKey: string) => {
    const n = { ...docs };
    delete n[storageKey];
    onChange(n);
  };

  if (!documentTypes.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No document types configured. Add a document type to get started.
      </p>
    );
  }

  return (
    <>
      {err ? <p className="text-sm text-destructive mb-3">{err}</p> : null}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {documentTypes.map((type) => {
          const storageKeys = getStorageKeys(type);
          const accept = fileTypesToAccept(type.allowedFileTypes);

          return (
            <div key={type.id} className="rounded-xl border border-border bg-background p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{type.documentName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {type.category}
                    {type.mandatory ? " · Required" : ""}
                  </p>
                </div>
                {showTypeControls ? (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      title="Edit document type"
                      className="p-1.5 rounded-md border border-border hover:bg-secondary"
                      onClick={() => onEditType?.(type)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {!type.isSystem ? (
                      <button
                        type="button"
                        title="Remove document type"
                        className="p-1.5 rounded-md border border-border text-destructive hover:bg-destructive/10"
                        onClick={() => onRemoveType?.(type)}
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                {storageKeys.map((storageKey) => {
                  const side = parseStorageKey(storageKey, type.id);
                  const meta = docs[storageKey];
                  const pct = progress[storageKey] || 0;
                  const sideTitle = sideLabel(side);

                  return (
                    <div key={storageKey} className="flex flex-col gap-2">
                      {sideTitle ? (
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">{sideTitle}</p>
                      ) : null}
                      {meta?.fileName ? (
                        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/30 border border-border">
                          <div className="flex items-center gap-2 overflow-hidden min-w-0">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-foreground truncate font-medium">{meta.fileName}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button type="button" className="p-1.5 rounded-md hover:bg-background" onClick={() => previewDocument(meta)}>
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" className="p-1.5 rounded-md hover:bg-background" onClick={() => download(meta)}>
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {isEditing ? (
                              <button type="button" className="p-1.5 rounded-md text-destructive hover:bg-destructive/10" onClick={() => remove(storageKey)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10 border border-dashed border-border">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground/30" />
                          <span className="text-xs text-muted-foreground italic">No file uploaded</span>
                        </div>
                      )}
                      {pct > 0 && pct < 100 ? (
                        <div className="h-1 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      ) : null}
                      {isEditing ? (
                        <label className="mt-1">
                          <span className="inline-flex items-center justify-center w-full py-1.5 rounded-lg border border-dashed border-border text-[10px] font-bold cursor-pointer hover:bg-secondary/50">
                            {meta ? "Replace" : sideTitle ? `Upload ${sideTitle}` : "Upload File"}
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
    </>
  );
}
