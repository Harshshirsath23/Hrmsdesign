import { cn } from "../../ui/utils";

interface ProfileInfoFieldProps {
  label: string;
  value: string;
  editing?: boolean;
  onChange?: (v: string) => void;
  type?: "text" | "date" | "email" | "tel" | "number" | "textarea" | "select";
  options?: { value: string; label: string }[];
  readOnly?: boolean;
  className?: string;
  error?: string | null;
}

export function ProfileInfoField({
  label,
  value,
  editing,
  onChange,
  type = "text",
  options = [],
  readOnly = false,
  className,
  error,
}: ProfileInfoFieldProps) {
  const display = value === "" ? "—" : value;
  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="block text-[11px] font-semibold text-muted-foreground tracking-wide">{label}</span>
      {editing && !readOnly ? (
        <>
          {type === "textarea" ? (
            <textarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          ) : type === "select" ? (
            <select
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </>
      ) : (
        <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm font-semibold text-foreground min-h-[2.5rem] flex items-center">
          {display}
        </div>
      )}
    </div>
  );
}
