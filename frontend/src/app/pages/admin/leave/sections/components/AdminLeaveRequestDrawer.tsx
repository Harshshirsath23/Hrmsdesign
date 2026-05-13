import { useMemo, useState } from "react";
import {
  CalendarDays,
  FileText,
  MessageSquareText,
  Paperclip,
  ShieldCheck,
  Timer,
  X,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../../../../../components/ui/drawer";
import { cn } from "../../../../../components/ui/utils";
import type { AdminLeaveRequestRow } from "../../../../../modules/adminLeave/types";
import { Textarea } from "../../../../../components/ui/textarea";

function SectionTitle({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
      {children}
    </span>
  );
}

export function AdminLeaveRequestDrawer({
  row,
  open,
  onOpenChange,
}: {
  row: AdminLeaveRequestRow | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [tab, setTab] = useState<"overview" | "timeline" | "comments" | "attachments" | "audit" | "ledger">("overview");
  const [comment, setComment] = useState("");

  const header = useMemo(() => {
    if (!row) return null;
    return {
      title: `${row.employee.employee_name} · ${row.leave_type.name}`,
      sub: `${row.employee.employee_code} · ${row.employee.department}`,
    };
  }, [row]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-[92vw] sm:max-w-[540px] border-l border-border bg-background">
        <DrawerHeader className="border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DrawerTitle className="text-base">{header?.title ?? "Leave Request"}</DrawerTitle>
              <DrawerDescription className="text-xs mt-1">{header?.sub ?? "—"}</DrawerDescription>
              {row && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>Status: {row.status}</Pill>
                  <Pill>Workflow: L{row.workflow_level}</Pill>
                  <Pill>Payroll: {row.payroll_lock}</Pill>
                </div>
              )}
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </DrawerClose>
          </div>

          <div className="mt-4 flex gap-1 p-1 bg-secondary rounded-lg overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "timeline", label: "Approval History" },
              { id: "comments", label: "Comments" },
              { id: "attachments", label: "Attachments" },
              { id: "audit", label: "Audit Trail" },
              { id: "ledger", label: "Ledger Impact" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 whitespace-nowrap",
                  tab === (t.id as any)
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </DrawerHeader>

        <div className="p-5 space-y-5 overflow-y-auto">
          {!row ? (
            <div className="flat-card bg-card p-8">
              <p className="text-sm font-semibold text-foreground">No request selected</p>
              <p className="text-xs text-muted-foreground mt-1">Select a row to see details.</p>
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <div className="space-y-4">
                  <div className="flat-card bg-card p-5">
                    <SectionTitle icon={CalendarDays} title="Request Summary" sub="Dates, duration and reason" />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl border border-border bg-background">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">From</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{row.from_date}</p>
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-background">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">To</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{row.to_date}</p>
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-background">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Days</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{row.total_days}</p>
                      </div>
                      <div className="p-4 rounded-xl border border-border bg-background">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Duration</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{row.duration}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 rounded-xl border border-border bg-background">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Reason</p>
                      <p className="text-sm text-foreground mt-1">{row.reason}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Pill>Applied on: {row.applied_on}</Pill>
                      <Pill>Backup: {row.backup_employee ?? "—"}</Pill>
                      <Pill>Current approver: {row.current_approver ?? "—"}</Pill>
                    </div>
                  </div>

                  <div className="flat-card bg-card p-5">
                    <SectionTitle icon={ShieldCheck} title="Controls" sub="Actions here remain UI-only in demo" />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="px-3 py-2 rounded-lg text-xs font-semibold bg-foreground text-primary-foreground hover:bg-accent transition-colors">
                        Approve
                      </button>
                      <button className="px-3 py-2 rounded-lg text-xs font-semibold bg-secondary border border-border text-foreground hover:bg-background transition-colors">
                        Reject
                      </button>
                      <button className="px-3 py-2 rounded-lg text-xs font-semibold bg-secondary border border-border text-foreground hover:bg-background transition-colors">
                        Request Info
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tab === "timeline" && (
                <div className="flat-card bg-card p-5">
                  <SectionTitle icon={Timer} title="Approval History" sub="Workflow steps and actions" />
                  <div className="mt-4 space-y-3">
                    {row.approval_history.map((s) => (
                      <div key={s.level} className="p-4 rounded-xl border border-border bg-background">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">Level {s.level}</p>
                          <Pill>{s.status}</Pill>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Approver: {s.approver}</p>
                        {s.acted_at && <p className="text-xs text-muted-foreground mt-1">Acted at: {s.acted_at}</p>}
                        {s.remarks && <p className="text-xs text-foreground mt-2">{s.remarks}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "comments" && (
                <div className="flat-card bg-card p-5 space-y-4">
                  <SectionTitle icon={MessageSquareText} title="Comments" sub="Discussion and clarifications" />
                  <div className="space-y-2">
                    {row.comments.map((c) => (
                      <div key={c.id} className="p-4 rounded-xl border border-border bg-background">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">{c.author}</p>
                          <Pill>{new Date(c.created_at).toLocaleString()}</Pill>
                        </div>
                        <p className="text-sm text-foreground mt-2">{c.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Add Comment
                    </p>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment…"
                      className="min-h-20"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg text-xs font-semibold bg-foreground text-primary-foreground hover:bg-accent transition-colors"
                        onClick={() => setComment("")}
                      >
                        Post (demo)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tab === "attachments" && (
                <div className="flat-card bg-card p-5">
                  <SectionTitle icon={Paperclip} title="Attachments" sub="Preview and evidence artifacts" />
                  <div className="mt-4 space-y-2">
                    {row.attachments.length === 0 ? (
                      <div className="p-8 rounded-xl border border-dashed border-border text-center">
                        <p className="text-sm font-semibold text-foreground">No attachments</p>
                        <p className="text-xs text-muted-foreground mt-1">This request has no uploaded files.</p>
                      </div>
                    ) : (
                      row.attachments.map((a) => (
                        <a
                          key={a.id}
                          href={a.url}
                          className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{a.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{a.type.toUpperCase()}</p>
                            </div>
                          </div>
                          <Pill>Preview</Pill>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              )}

              {tab === "audit" && (
                <div className="flat-card bg-card p-5">
                  <SectionTitle icon={FileText} title="Audit Trail" sub="Immutable event stream (UI demo)" />
                  <div className="mt-4 space-y-2">
                    {row.audit.map((e) => (
                      <div key={e.id} className="p-4 rounded-xl border border-border bg-background">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">{e.action}</p>
                          <Pill>{new Date(e.at).toLocaleString()}</Pill>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Actor: {e.actor}</p>
                        {e.meta && <p className="text-xs text-foreground mt-2">{e.meta}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "ledger" && (
                <div className="flat-card bg-card p-5">
                  <SectionTitle icon={FileText} title="Ledger Impact" sub="Balance effects and posting preview" />
                  <div className="mt-4 space-y-2">
                    {row.ledger_impact.map((l) => (
                      <div key={l.id} className="p-4 rounded-xl border border-border bg-background">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">
                            {l.effect} · {l.leave_type_code}
                          </p>
                          <Pill>{l.days}d</Pill>
                        </div>
                        {l.note && <p className="text-xs text-muted-foreground mt-1">{l.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

