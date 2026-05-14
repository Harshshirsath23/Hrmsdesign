import { useEffect, useMemo, useState } from "react";
import { Download, SlidersHorizontal } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../../components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { cn } from "../../../../components/ui/utils";
import { AdminLeaveRequestDrawer } from "./components/AdminLeaveRequestDrawer";
import { ADMIN_LEAVE_REQUESTS } from "../../../../modules/adminLeave/mock";
import { AdvancedFilterDrawer, type SavedView } from "../../../../components/filters/AdvancedFilterDrawer";
import { CategoryFilter } from "../../../../components/filters/CategoryFilter";
import { SearchFilter } from "../../../../components/filters/SearchFilter";
import { StatusFilter } from "../../../../components/filters/StatusFilter";
import { DEFAULT_ADVANCED_FILTERS, LEAVE_CATEGORY_OPTIONS, LEAVE_STATUS_OPTIONS, type AdvancedLeaveFilters } from "../../../../components/filters/constants";
import type { AdminLeaveRequestRow, LeaveCategory, LeaveRequestStatus } from "../../../../modules/adminLeave/types";

const STATUS_BADGE: Record<LeaveRequestStatus, string> = {
  DRAFT: "bg-secondary text-foreground border-border",
  SUBMITTED: "bg-secondary text-foreground border-border",
  APPROVED: "bg-foreground text-primary-foreground border-border",
  PENDING: "bg-secondary text-foreground border-border",
  REJECTED: "bg-secondary text-foreground border-border",
  CANCELLED: "bg-secondary text-foreground border-border",
  REVOKED: "bg-secondary text-foreground border-border",
};

const SAVED_VIEWS_KEY = "hrms-admin-leave-saved-views";

function readViews(): SavedView[] {
  try {
    const raw = localStorage.getItem(SAVED_VIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedView[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((view) => ({
      ...view,
      advancedFilters: view.advancedFilters ?? DEFAULT_ADVANCED_FILTERS,
    }));
  } catch {
    return [];
  }
}

function writeViews(views: SavedView[]) {
  localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views));
}

function StatusPill({ status }: { status: LeaveRequestStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md font-semibold border", STATUS_BADGE[status])}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {status}
    </span>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "w-5 h-5 rounded-md border border-border bg-card flex items-center justify-center transition-colors",
        checked && "bg-foreground text-primary-foreground border-border",
      )}
      aria-pressed={checked}
      aria-label="Select row"
    >
      {checked && <span className="text-[10px] font-bold">✓</span>}
    </button>
  );
}

export function AdminLeaveRequests() {
  const [query, setQuery] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [category, setCategory] = useState<LeaveCategory | "ALL">("ALL");
  const [status, setStatus] = useState<LeaveRequestStatus | "ALL">("ALL");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedLeaveFilters>(DEFAULT_ADVANCED_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [drawerRow, setDrawerRow] = useState<AdminLeaveRequestRow | null>(null);

  const [views, setViews] = useState<SavedView[]>(() => readViews());
  const [activeViewId, setActiveViewId] = useState<string | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const departmentOptions = useMemo(() => {
    const all = Array.from(new Set(ADMIN_LEAVE_REQUESTS.map((r) => r.employee.department))).sort();
    return ["ALL", ...all];
  }, []);

  const employeeOptions = useMemo(() => {
    const all = Array.from(new Set(ADMIN_LEAVE_REQUESTS.map((r) => r.employee.employee_name))).sort();
    return ["ALL", ...all];
  }, []);

  const locationOptions = useMemo(() => ["ALL"], []);
  const businessUnitOptions = useMemo(() => ["ALL"], []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQuery(searchValue.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ADMIN_LEAVE_REQUESTS.filter((r) => {
      const matchQuery =
        !q ||
        r.employee.employee_name.toLowerCase().includes(q) ||
        r.employee.employee_code.toLowerCase().includes(q) ||
        r.leave_type.name.toLowerCase().includes(q) ||
        r.leave_type.code.toLowerCase().includes(q);

      const matchStatus = status === "ALL" || r.status === status;
      const matchCategory = category === "ALL" || r.category === category;
      const matchDepartment =
        advancedFilters.department === "ALL" || r.employee.department === advancedFilters.department;

      return matchQuery && matchStatus && matchCategory && matchDepartment;
    });
  }, [query, status, category, advancedFilters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const clampedPage = Math.min(page, pageCount);
  const slice = filtered.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const allVisibleSelected = slice.length > 0 && slice.every((r) => selected[r.id]);
  const someVisibleSelected = slice.some((r) => selected[r.id]);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const activeFilterCount = [
    searchValue ? 1 : 0,
    category !== "ALL" ? 1 : 0,
    status !== "ALL" ? 1 : 0,
    Object.values(advancedFilters).filter((value) => value !== "ALL" && value !== "").length,
  ].reduce((total, next) => total + next, 0);

  const applyView = (v: SavedView) => {
    setSearchValue(v.query);
    setQuery(v.query);
    setCategory(v.category);
    setStatus(v.status);
    setAdvancedFilters(v.advancedFilters);
    setActiveViewId(v.id);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flat-card bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Leave Requests Management</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Enterprise table with focused filters, saved presets, bulk actions, export, and audit-ready details.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:w-auto lg:grid-cols-[minmax(240px,360px)_auto_auto]">
            <SearchFilter
              value={searchValue}
              onChange={(value) => {
                setSearchValue(value);
              }}
              onClear={() => {
                setSearchValue("");
                setQuery("");
                setPage(1);
              }}
            />
            <CategoryFilter
              value={category}
              options={LEAVE_CATEGORY_OPTIONS}
              onChange={(value) => {
                setCategory(value as LeaveCategory | "ALL");
                setActiveViewId("ALL");
                setPage(1);
              }}
            />
            <StatusFilter
              value={status}
              options={LEAVE_STATUS_OPTIONS}
              onChange={(value) => {
                setStatus(value as LeaveRequestStatus | "ALL");
                setActiveViewId("ALL");
                setPage(1);
              }}
            />
            <AdvancedFilterDrawer
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
              query={searchValue}
              category={category}
              status={status}
              advancedFilters={advancedFilters}
              onFilterChange={(key, value) => {
                setAdvancedFilters((prev) => ({ ...prev, [key]: value }));
                setActiveViewId("ALL");
                setPage(1);
              }}
              onReset={() => {
                setSearchValue("");
                setQuery("");
                setCategory("ALL");
                setStatus("ALL");
                setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
                setActiveViewId("ALL");
                setPage(1);
              }}
              onSaveView={(name) => {
                const next: SavedView = {
                  id: `view-${Date.now()}`,
                  name,
                  query: searchValue,
                  category,
                  status,
                  advancedFilters,
                };
                const updated = [next, ...views];
                setViews(updated);
                writeViews(updated);
                setActiveViewId(next.id);
              }}
              views={views}
              activeViewId={activeViewId}
              onApplyView={applyView}
              departmentOptions={departmentOptions}
              employeeOptions={employeeOptions}
              locationOptions={locationOptions}
              businessUnitOptions={businessUnitOptions}
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
              onClick={() => {
                const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "leave-requests-export.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>{activeFilterCount} Active Filters</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span>{filtered.length} records</span>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="px-6 py-3 border-b border-border bg-secondary flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground">
              {selectedCount > 0 ? `${selectedCount} selected` : "No rows selected"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={selectedCount === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-background disabled:opacity-50 transition-colors"
            >
              Bulk Approve
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-background disabled:opacity-50 transition-colors"
            >
              Bulk Reject
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-background disabled:opacity-50 transition-colors"
              onClick={() => setSelected({})}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="relative">
          <Table className="w-full">
            <TableHeader className="sticky top-[0px] z-10">
              <TableRow className="bg-secondary">
                <TableHead className="px-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allVisibleSelected}
                      onChange={(v) => {
                        if (!v) {
                          const next = { ...selected };
                          for (const r of slice) delete next[r.id];
                          setSelected(next);
                        } else {
                          const next = { ...selected };
                          for (const r of slice) next[r.id] = true;
                          setSelected(next);
                        }
                      }}
                    />
                    {someVisibleSelected && !allVisibleSelected && (
                      <span className="text-[10px] text-muted-foreground">(partial)</span>
                    )}
                  </div>
                </TableHead>
                {[
                  "Employee",
                  "Employee Code",
                  "Department",
                  "Leave Type",
                  "From",
                  "To",
                  "Total Days",
                  "Duration",
                  "Applied On",
                  "Reason",
                  "Backup Employee",
                  "Status",
                  "Current Approver",
                  "Payroll Lock",
                  "Workflow Level",
                ].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((r) => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => setDrawerRow(r)}>
                  <TableCell className="px-6" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={!!selected[r.id]}
                      onChange={(v) => setSelected((prev) => ({ ...prev, [r.id]: v }))}
                    />
                  </TableCell>
                  <TableCell className="px-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 bg-foreground"
                        style={r.employee.avatarColor ? { backgroundColor: r.employee.avatarColor } : undefined}
                      >
                        {r.employee.initials ?? "—"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{r.employee.employee_name}</p>
                        <p className="text-xs text-muted-foreground truncate">Approver: {r.current_approver ?? "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 text-sm text-muted-foreground">{r.employee.employee_code}</TableCell>
                  <TableCell className="px-2 text-sm text-muted-foreground">{r.employee.department}</TableCell>
                  <TableCell className="px-2 text-sm font-medium text-foreground whitespace-nowrap">
                    {r.leave_type.name} <span className="text-xs text-muted-foreground">({r.leave_type.code})</span>
                  </TableCell>
                  <TableCell className="px-2 text-sm text-muted-foreground">{r.from_date}</TableCell>
                  <TableCell className="px-2 text-sm text-muted-foreground">{r.to_date}</TableCell>
                  <TableCell className="px-2 text-sm font-semibold text-foreground">{r.total_days}</TableCell>
                  <TableCell className="px-2 text-sm text-muted-foreground">{r.duration}</TableCell>
                  <TableCell className="px-2 text-sm text-muted-foreground">{r.applied_on}</TableCell>
                  <TableCell className="px-2 max-w-[220px]">
                    <p className="text-sm text-muted-foreground truncate" title={r.reason}>
                      {r.reason}
                    </p>
                  </TableCell>
                  <TableCell className="px-2 text-sm text-muted-foreground">{r.backup_employee ?? "—"}</TableCell>
                  <TableCell className="px-2">
                    <StatusPill status={r.status} />
                  </TableCell>
                  <TableCell className="px-2 text-sm text-muted-foreground">{r.current_approver ?? "—"}</TableCell>
                  <TableCell className="px-2">
                    <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                      {r.payroll_lock}
                    </span>
                  </TableCell>
                  <TableCell className="px-2">
                    <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                      L{r.workflow_level}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {slice.length === 0 && (
                <TableRow>
                  <TableCell colSpan={16} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center">
                        <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground">No results</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Try adjusting search, status, or department filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground font-semibold">
            Showing {(clampedPage - 1) * pageSize + 1}–{Math.min(clampedPage * pageSize, filtered.length)} of {filtered.length}
          </p>

          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
                const num = i + 1;
                return (
                  <PaginationItem key={num}>
                    <PaginationLink
                      href="#"
                      isActive={num === clampedPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(num);
                      }}
                    >
                      {num}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(pageCount, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <div className="flat-card bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Detail Drawer</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Click any row to open an audit-ready request view (timeline, comments, attachments, approvals, ledger impact).
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <AdminLeaveRequestDrawer
        row={drawerRow}
        open={!!drawerRow}
        onOpenChange={(o) => {
          if (!o) setDrawerRow(null);
        }}
      />
    </div>
  );
}

