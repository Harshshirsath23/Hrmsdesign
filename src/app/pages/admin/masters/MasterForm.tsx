import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import { getMasterList } from "../../../modules/masters/api";
import type { MasterConfig, MasterFieldConfig, MasterRecord } from "../../../modules/masters/types";

type FormValues = Record<string, unknown>;

function schemaForFields(fields: MasterFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (field.type === "boolean") {
      shape[field.key] = z.boolean().optional();
      continue;
    }
    if (field.type === "number") {
      const base = z.coerce.number();
      shape[field.key] = field.required ? base : base.optional();
      continue;
    }
    const str = z.string().trim();
    shape[field.key] = field.required ? str.min(1, `${field.label} is required`) : str.optional();
  }
  return z.object(shape);
}

function getLabel(rec: MasterRecord) {
  return String(rec.label ?? rec.name ?? rec.code ?? rec.id);
}

export function MasterForm({
  config,
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  config: MasterConfig;
  mode: "create" | "edit";
  initialData?: MasterRecord | null;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const fields = config.formFields ?? [];
  const schema = useMemo(() => schemaForFields(fields), [fields]);

  const defaults = useMemo<FormValues>(() => {
    const out: FormValues = {};
    for (const f of fields) {
      if (f.type === "boolean") out[f.key] = Boolean(initialData?.[f.key] ?? (f.key === "is_active" ? true : false));
      else out[f.key] = String(initialData?.[f.key] ?? "");
    }
    return out;
  }, [fields, initialData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const relationFields = fields.filter((f) => f.relationMaster);
  const relationQueries = useQueries({
    queries: relationFields.map((f) => ({
      queryKey: ["masters", "options", f.relationMaster],
      queryFn: () => getMasterList(String(f.relationMaster), { is_active: "true", page: 1 }),
    })),
  });

  const relationOptionsByKey = useMemo(() => {
    const map: Record<string, MasterRecord[]> = {};
    relationFields.forEach((f, i) => {
      map[f.key] = relationQueries[i]?.data?.results ?? [];
    });
    return map;
  }, [relationFields, relationQueries]);

  return (
    <form
      onSubmit={form.handleSubmit((vals) => onSubmit(vals))}
      className="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => {
          const err = form.formState.errors[field.key]?.message;
          return (
            <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {field.label}{field.required ? " *" : ""}
              </Label>

              {field.type === "boolean" ? (
                <Controller
                  control={form.control}
                  name={field.key}
                  render={({ field: ctrl }) => (
                    <div className="flex h-9 items-center justify-between rounded-lg border border-border px-3">
                      <span className="text-sm text-foreground">{ctrl.value ? "Enabled" : "Disabled"}</span>
                      <Switch checked={Boolean(ctrl.value)} onCheckedChange={ctrl.onChange} />
                    </div>
                  )}
                />
              ) : field.type === "textarea" ? (
                <Textarea {...form.register(field.key)} placeholder={field.placeholder} />
              ) : field.type === "select" ? (
                <Controller
                  control={form.control}
                  name={field.key}
                  render={({ field: ctrl }) => (
                    <Select value={String(ctrl.value ?? "")} onValueChange={ctrl.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? relationOptionsByKey[field.key]?.map((r) => ({ value: String(r.id), label: getLabel(r) })) ?? [])
                          .map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : (
                <Input
                  type={field.type === "number" ? "number" : "text"}
                  placeholder={field.placeholder}
                  {...form.register(field.key)}
                />
              )}

              {err && <p className="text-xs text-destructive">{String(err)}</p>}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
}

