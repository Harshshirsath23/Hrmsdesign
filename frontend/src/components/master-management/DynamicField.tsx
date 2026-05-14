import { Input } from "../../app/components/ui/input";
import { Switch } from "../../app/components/ui/switch";
import { Textarea } from "../../app/components/ui/textarea";
import { cn } from "../../app/components/ui/utils";
import type { MasterFieldSchema } from "../../app/modules/masterManagement/settings";

export function DynamicField({
  field,
  value,
  onChange,
}: {
  field: MasterFieldSchema;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const stringValue = String(value ?? "");
  const isDisabled = field.type === "upload" && typeof value === "string";

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-4 shadow-sm transition-all">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{field.label}</p>
          <p className="text-[11px] text-muted-foreground">
            {Boolean(value) ? "Enabled" : "Disabled"}
          </p>
        </div>
        <Switch checked={Boolean(value)} onCheckedChange={onChange as (checked: boolean) => void} />
      </div>
    );
  }

  if (field.type === "textarea" || field.type === "json") {
    return (
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {field.label}
        </label>
        <Textarea
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-24"
        />
      </div>
    );
  }

  if (field.type === "select" || field.type === "multiselect") {
    const options = field.options ?? [];
    const selected = field.type === "multiselect" ? (Array.isArray(value) ? value : stringValue.split(",").filter(Boolean)) : stringValue;

    return (
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {field.label}
        </label>
        <select
          value={field.type === "multiselect" ? undefined : String(selected)}
          onChange={(e) => {
            if (field.type === "multiselect") {
              const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
              onChange(values);
              return;
            }
            onChange(e.target.value);
          }}
          multiple={field.type === "multiselect"}
          className="flat-input w-full px-3 py-2 text-sm"
        >
          {field.type !== "multiselect" && <option value="">Select</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "upload") {
    return (
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {field.label}
        </label>
        <input
          type="file"
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
          onChange={(e) => onChange(e.target.files?.[0]?.name ?? "")}
        />
        {stringValue ? <p className="text-xs text-muted-foreground">Uploaded file: {stringValue}</p> : null}
      </div>
    );
  }

  if (field.type === "tags") {
    return (
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {field.label}
        </label>
        <Input
          value={Array.isArray(value) ? value.join(", ") : stringValue}
          onChange={(e) => onChange(e.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
        />
        <p className="text-[11px] text-muted-foreground">Separate tags with commas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {field.label}
      </label>
      <Input
        type={field.type === "number" ? "number" : field.type === "color" ? "color" : field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
        value={stringValue}
        onChange={(e) => {
          if (field.type === "number") {
            onChange(Number(e.target.value));
            return;
          }
          onChange(e.target.value);
        }}
        className={cn("w-full", isDisabled ? "opacity-70" : "")}
      />
    </div>
  );
}
