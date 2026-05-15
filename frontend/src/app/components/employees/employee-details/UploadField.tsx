import { Paperclip } from "lucide-react";

interface UploadFieldProps {
  label: string;
  fileName?: string;
  editing: boolean;
  onFileNameChange?: (name: string) => void;
  accept?: string;
}

export function UploadField({ label, fileName, editing, onFileNameChange, accept }: UploadFieldProps) {
  if (!editing) {
    return (
      <div className="space-y-1.5">
        <span className="block text-[11px] font-semibold text-muted-foreground tracking-wide">{label}</span>
        <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm font-medium text-foreground min-h-[2.5rem] flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {fileName || "—"}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <span className="block text-[11px] font-semibold text-muted-foreground tracking-wide">{label}</span>
      <label className="flex flex-col gap-2 cursor-pointer">
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border bg-secondary/20 text-xs font-semibold hover:bg-secondary/40 transition-colors w-fit">
          <Paperclip className="w-3.5 h-3.5" />
          Choose file
        </span>
        <input
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            onFileNameChange?.(f?.name || "");
          }}
        />
        {fileName ? <span className="text-xs text-muted-foreground truncate">{fileName}</span> : null}
      </label>
    </div>
  );
}
