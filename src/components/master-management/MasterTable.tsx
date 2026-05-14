import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Edit3, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { Button } from "../../app/components/ui/button";
import { Input } from "../../app/components/ui/input";
import { Switch } from "../../app/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../app/components/ui/table";
import { cn } from "../../app/components/ui/utils";
import { MasterDialog } from "./MasterDialog";
import { DynamicField } from "./DynamicField";
import { useMasterManagementStore } from "../../app/modules/masterManagement";
import type { MasterRecord, MasterSectionConfig } from "../../app/modules/masterManagement/settings";

function buildInitialDraft(section: MasterSectionConfig) {
  return {
    id: `cfg-${Date.now()}`,
    name: "",
    code: "",
    is_active: true,
    ...Object.fromEntries(section.schema.map((field) => [field.key, field.type === "boolean" ? false : ""])),
  };
}

export function MasterTable({
  section,
  store,
  actor,
}: {
  section: MasterSectionConfig;
  store: ReturnType<typeof useMasterManagementStore>;
  actor: string;
}) {
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRecord | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>(() => buildInitialDraft(section));

  useEffect(() => {
    setDraft(buildInitialDraft(section));
    setEditing(null);
  }, [section]);

  const rows = store.data[section.key] ?? [];
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (!showArchived && r.archived_at) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
    });
  }, [query, rows, showArchived]);

  const openNew = () => {
    setEditing(null);
    setDraft(buildInitialDraft(section));
    setEditorOpen(true);
  };

  const openEdit = (row: MasterRecord) => {
    setEditing(row);
    setDraft({
      id: row.id,
      name: row.name,
      code: row.code,
      is_active: row.is_active,
      ...row.config,
    });
    setEditorOpen(true);
  };

  const save = () => {
    const id = String(draft.id ?? `cfg-${Date.now()}`);
    const next: MasterRecord = {
      id,
      name: String(draft.name ?? "").trim(),
      code: String(draft.code ?? "").trim(),
      is_active: Boolean(draft.is_active),
      archived_at: editing?.archived_at ?? null,
      updated_at: new Date().toISOString(),
      config: Object.fromEntries(
        Object.entries(draft).filter(([k]) => !["id", "name", "code", "is_active"].includes(k)),
      ),
    };
    if (!next.name || !next.code) return;
    store.upsert(section.key, next, actor, !editing);
    setEditorOpen(false);
  };

  const getUpdatedBy = (id: string) => {
    const event = store.audit.find((item) => item.target_id === id);
    return event?.actor ?? "-";
  };

  return (
    <div className="space-y-4">
      <div className="flat-card bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">{section.label}</h2>
            <p className="text-xs text-muted-foreground">{section.description}</p>
          </div>
          <Button className="gap-1.5" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
              placeholder="Search by code or name"
            />
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <span>Active Only</span>
            <Switch checked={!showArchived} onCheckedChange={() => setShowArchived((prev) => !prev)} />
          </div>
        </div>
      </div>

      <div className="flat-card overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary border-b border-border sticky top-0">
              <tr>
                {[
                  "Name",
                  "Code",
                  "Category",
                  "Status",
                  "Updated At",
                  "Updated By",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      "px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider",
                      h === "Actions" && "sticky right-0 bg-secondary",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.code}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{section.label}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border bg-secondary text-muted-foreground border-border">
                      {row.archived_at ? "Archived" : row.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(row.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{getUpdatedBy(String(row.id))}</td>
                  <td className="px-4 py-3 sticky right-0 bg-card">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(row)}
                        className="px-2 py-1 rounded border border-border text-[11px]"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => store.clone(section.key, String(row.id), actor)}
                        className="px-2 py-1 rounded border border-border text-[11px]"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => store.setActive(section.key, String(row.id), !row.is_active, actor)}
                        className="px-2 py-1 rounded border border-border text-[11px]"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      {!row.archived_at ? (
                        <button
                          onClick={() => store.archive(section.key, String(row.id), actor)}
                          className="px-2 py-1 rounded border border-border text-[11px]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => store.restore(section.key, String(row.id), actor)}
                          className="px-2 py-1 rounded border border-border text-[11px]"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MasterDialog
        open={editorOpen}
        title={editing ? `Edit ${section.label}` : `Add ${section.label}`}
        description="Schema-driven form for enterprise master records."
        onClose={() => setEditorOpen(false)}
        onSave={save}
        isSaving={false}
        saveLabel={editing ? "Update" : "Create"}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {section.schema.map((field) => (
            <DynamicField
              key={field.key}
              field={field}
              value={draft[field.key]}
              onChange={(value) => setDraft((prev) => ({ ...prev, [field.key]: value }))}
            />
          ))}
        </div>
      </MasterDialog>
    </div>
  );
}
