import { useMemo, useState } from "react";
import { Edit3, Plus, Search, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { useMasterCreate, useMasterList, useMasterToggleActive, useMasterUpdate } from "../../../modules/masters/hooks";
import type { MasterConfig, MasterListQuery, MasterRecord } from "../../../modules/masters/types";
import { MasterForm } from "./MasterForm";

function displayLabel(rec: MasterRecord) {
  return String(rec.label ?? rec.name ?? "");
}

export function MasterTable({ config }: { config: MasterConfig }) {
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState<string>("all");
  const [activeOnly, setActiveOnly] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MasterRecord | null>(null);

  const query = useMemo<MasterListQuery>(
    () => ({
      search: search.trim() || undefined,
      company: config.companyScoped && company !== "all" ? company : undefined,
      is_active: activeOnly ? "true" : undefined,
      page: 1,
    }),
    [search, config.companyScoped, company, activeOnly],
  );

  const listQ = useMasterList(config.apiName, query);
  const companyQ = useMasterList("Company", { is_active: "true", page: 1 }, config.companyScoped === true);
  const createMut = useMasterCreate(config.apiName, query);
  const updateMut = useMasterUpdate(config.apiName, query);
  const toggleMut = useMasterToggleActive(config.apiName, query);

  const rows = listQ.data?.results ?? [];
  const isBusy = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-4">
      <div className="flat-card bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">{config.label}</h2>
            <p className="text-xs text-muted-foreground">
              Manage {config.label} master data.
            </p>
          </div>
          {!config.constant && (
            <Button
              className="gap-1.5"
              onClick={() => {
                setEditing(null);
                setEditorOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              placeholder="Search by code or name"
            />
          </div>

          {config.companyScoped && (
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All companies</SelectItem>
                {(companyQ.data?.results ?? []).map((c) => (
                  <SelectItem key={String(c.id)} value={String(c.id)}>
                    {displayLabel(c) || c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <span>Active Only</span>
            <Switch checked={activeOnly} onCheckedChange={setActiveOnly} />
          </div>
        </div>
      </div>

      {config.constant && (
        <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Shield className="h-3.5 w-3.5" /> System Managed
          </span>{" "}
          This master is constant and cannot be created or edited from UI.
        </div>
      )}

      <div className="flat-card overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Label / Name</TableHead>
              {config.parentFieldKey && <TableHead>{config.parentFieldKey.replaceAll("_", " ")}</TableHead>}
              {config.companyScoped && <TableHead>Company</TableHead>}
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listQ.isLoading ? (
              <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={6}>No records found.</TableCell></TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={String(r.id)}>
                  <TableCell className="font-medium">{r.code}</TableCell>
                  <TableCell>{displayLabel(r)}</TableCell>
                  {config.parentFieldKey && <TableCell>{String(r[config.parentFieldKey] ?? "-")}</TableCell>}
                  {config.companyScoped && <TableCell>{String(r.company_name ?? r.company ?? "-")}</TableCell>}
                  <TableCell>
                    <Badge variant={r.is_active ? "secondary" : "outline"}>{r.is_active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      {!config.constant && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5"
                            onClick={() => {
                              setEditing(r);
                              setEditorOpen(true);
                            }}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5"
                            onClick={() => toggleMut.mutate({ id: r.id, is_active: !r.is_active })}
                          >
                            {r.is_active ? <ToggleLeft className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
                            Toggle
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${config.label}` : `Add ${config.label}`}</DialogTitle>
          </DialogHeader>
          <MasterForm
            config={config}
            mode={editing ? "edit" : "create"}
            initialData={editing}
            isSubmitting={isBusy}
            onCancel={() => setEditorOpen(false)}
            onSubmit={(values) => {
              const payload = {
                ...values,
                label: String(values.label ?? values.name ?? ""),
                name: String(values.label ?? values.name ?? ""),
              };
              if (editing) {
                updateMut.mutate(
                  { id: editing.id, payload },
                  { onSuccess: () => setEditorOpen(false) },
                );
                return;
              }
              createMut.mutate(payload, { onSuccess: () => setEditorOpen(false) });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

