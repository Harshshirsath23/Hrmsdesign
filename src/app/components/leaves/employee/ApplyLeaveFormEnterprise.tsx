import type { ElementType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ClipboardList, FileUp, GitBranch, MessageSquare, Phone, Send, Shield } from "lucide-react";
import type { LeaveBalanceAPI } from "../../../modules/leaves/types";
import { useApplyLeave, useLeaveTypes } from "../../../modules/leaves/useLeaves";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { LeaveTypePill } from "./LeaveTypePill";

const labelClass = "mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";

function SectionHeading({ icon: Icon, title, description }: { icon: ElementType; title: string; description?: string }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-secondary">
        <Icon className="h-4 w-4 text-foreground" aria-hidden />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ElementType;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="pb-6">
      <SectionHeading icon={Icon} title={title} description={description} />
      {children}
      <div className="mt-6 h-px bg-border" />
    </section>
  );
}

const ACCEPTED_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ACCEPTED_EXTS = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];

function isAcceptedAttachment(file: File) {
  const name = file.name.toLowerCase();
  const extOk = ACCEPTED_EXTS.some((ext) => name.endsWith(ext));
  const mimeOk = ACCEPTED_MIMES.has(file.type);
  return extOk || mimeOk;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(gb < 10 ? 1 : 0)} GB`;
}

export function ApplyLeaveFormEnterprise({
  employee,
  balances,
  prefillLeaveType,
  onSuccess,
}: {
  employee: { employee_code: string; employee_name: string };
  balances: LeaveBalanceAPI[];
  prefillLeaveType?: string;
  onSuccess: () => void;
}) {
  const { data: leaveTypes = [] } = useLeaveTypes();
  const applyLeave = useApplyLeave(employee);

  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromHalf, setFromHalf] = useState<"FULL" | "AM" | "PM">("FULL");
  const [toHalf, setToHalf] = useState<"FULL" | "AM" | "PM">("FULL");
  const [reason, setReason] = useState("");
  const [handover, setHandover] = useState("");
  const [contactDuringLeave, setContactDuringLeave] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);
  const submitModeRef = useRef<"DRAFT" | "SUBMITTED">("SUBMITTED");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!prefillLeaveType) return;
    if (leaveTypes.some((lt) => lt.id === prefillLeaveType)) {
      setLeaveType(prefillLeaveType);
    }
  }, [prefillLeaveType, leaveTypes]);

  useEffect(() => {
    return () => {
      if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl);
    };
  }, [attachmentPreviewUrl]);

  const handleAttachmentFile = (f: File | null) => {
    if (!f) {
      setAttachment(null);
      setAttachmentError(null);
      setAttachmentPreviewUrl(null);
      return;
    }
    if (!isAcceptedAttachment(f)) {
      setAttachmentError("Unsupported file type. Upload PDF, JPG, PNG, DOC, or DOCX.");
      setAttachment(null);
      setAttachmentPreviewUrl(null);
      return;
    }
    setAttachmentError(null);
    setAttachment(f);
    setAttachmentPreviewUrl(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  };

  const totalDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) return 0;
    let days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (fromHalf !== "FULL") days -= 0.5;
    if (toHalf !== "FULL" && fromDate !== toDate) days -= 0.5;
    return Math.max(days, 0.5);
  }, [fromDate, toDate, fromHalf, toHalf]);

  const selectedBalance = useMemo(() => {
    if (!leaveType) return null;
    return balances.find((b) => b.leave_type === leaveType) ?? null;
  }, [leaveType, balances]);

  const selectedType = useMemo(
    () => leaveTypes.find((lt) => lt.id === leaveType) ?? null,
    [leaveTypes, leaveType],
  );

  const exceedsBalance = selectedBalance ? totalDays > Number(selectedBalance.available || 0) : false;
  const attachmentPayload = attachment ? attachment.name : undefined;

  const composedReason = useMemo(() => {
    const base = reason.trim();
    const h = handover.trim();
    if (!h) return base;
    return `${base}\n\nWork handover: ${h}`;
  }, [reason, handover]);

  const canSubmit =
    !!leaveType &&
    !!fromDate &&
    !!toDate &&
    !!reason.trim() &&
    totalDays > 0 &&
    !exceedsBalance;

  const approvalSteps = ["You submit", "Manager review", "HR / Admin confirmation"];

  return (
    <form
      className="flat-card bg-card p-4 sm:p-6 lg:p-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start"
      onSubmit={(e) => {
        e.preventDefault();
        const submitMode = submitModeRef.current;
        if (submitMode === "SUBMITTED" && !canSubmit) return;
        if (submitMode === "DRAFT" && (!leaveType || !fromDate || !toDate || !reason.trim() || totalDays <= 0)) return;

        applyLeave.mutate(
          {
            leave_type: leaveType,
            from_date: fromDate,
            to_date: toDate,
            from_half: fromHalf,
            to_half: toHalf,
            total_days: totalDays,
            reason: composedReason,
            contact_during_leave: contactDuringLeave.trim() || undefined,
            document_url: attachmentPayload,
            status: submitMode,
          },
          {
            onSuccess: () => {
              setLeaveType("");
              setFromDate("");
              setToDate("");
              setFromHalf("FULL");
              setToHalf("FULL");
              setReason("");
              setHandover("");
              setContactDuringLeave("");
              setAttachment(null);
              setAttachmentError(null);
              setAttachmentPreviewUrl(null);
              onSuccess();
            },
          },
        );
      }}
    >
      <div className="space-y-0">
        <div className="mb-6 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Routing: </span>
          Submitted requests are reviewed by your manager and HR in sequence. You will be notified at each step.
        </div>

        <FormSection
          icon={Shield}
          title="Leave information"
          description="Choose the policy bucket this request should consume."
        >
          <label className={labelClass}>Leave type *</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="flat-input w-full cursor-pointer appearance-none rounded-lg px-3 py-2.5 text-sm font-medium"
            required
          >
            <option value="">Select leave type</option>
            {leaveTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name} ({lt.code})
              </option>
            ))}
          </select>
        </FormSection>

        <FormSection icon={CalendarDays} title="Date & duration" description="Inclusive dates; sessions refine partial days.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>From *</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="flat-input w-full rounded-lg px-3 py-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className={labelClass}>To *</label>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
                className="flat-input w-full rounded-lg px-3 py-2.5 text-sm"
                required
              />
            </div>
          </div>
        </FormSection>

        <FormSection icon={CalendarDays} title="Half-day (sessions)" description="Use for first/second half patterns.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>From session</label>
              <select
                value={fromHalf}
                onChange={(e) => setFromHalf(e.target.value as "FULL" | "AM" | "PM")}
                className="flat-input w-full cursor-pointer appearance-none rounded-lg px-3 py-2.5 text-sm font-medium"
              >
                <option value="FULL">Full day</option>
                <option value="AM">First half</option>
                <option value="PM">Second half</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>To session</label>
              <select
                value={toHalf}
                onChange={(e) => setToHalf(e.target.value as "FULL" | "AM" | "PM")}
                className="flat-input w-full cursor-pointer appearance-none rounded-lg px-3 py-2.5 text-sm font-medium"
              >
                <option value="FULL">Full day</option>
                <option value="AM">First half</option>
                <option value="PM">Second half</option>
              </select>
            </div>
          </div>
          {totalDays > 0 && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <span className="font-medium text-foreground">Total days</span>
              <span className="font-bold tabular-nums text-foreground">{totalDays}</span>
            </div>
          )}
        </FormSection>

        <FormSection icon={MessageSquare} title="Reason & details" description="A concise business justification for reviewers.">
          <label className={labelClass}>Reason *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="flat-input w-full resize-none rounded-lg px-3 py-2.5 text-sm"
            placeholder="Share context approvers need…"
            required
          />
        </FormSection>

        <FormSection
          icon={ClipboardList}
          title="Handover information"
          description="Captured into the request narrative for approvers."
        >
          <label className={labelClass}>Handover notes</label>
          <textarea
            value={handover}
            onChange={(e) => setHandover(e.target.value)}
            rows={2}
            className="flat-input w-full resize-none rounded-lg px-3 py-2.5 text-sm"
            placeholder="Coverage, pending tasks, critical contacts…"
          />
        </FormSection>

        <FormSection
          icon={FileUp}
          title="Attachments"
          description="Optional evidence upload (PDF, JPG, PNG, DOC, DOCX)."
        >
          <label className={labelClass}>Supporting document</label>

          {attachmentError && (
            <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {attachmentError}
            </p>
          )}

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDraggingAttachment(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingAttachment(true);
            }}
            onDragLeave={() => setIsDraggingAttachment(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingAttachment(false);
              const f = e.dataTransfer.files?.[0] ?? null;
              handleAttachmentFile(f);
            }}
            className={cn(
              "rounded-xl border border-dashed px-4 py-6 transition-colors cursor-pointer select-none",
              isDraggingAttachment
                ? "border-foreground/40 bg-secondary/25"
                : "border-border bg-secondary/10 hover:border-foreground/25",
            )}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary">
                <FileUp className="h-4 w-4 text-foreground" aria-hidden />
              </div>
              <p className="text-xs text-muted-foreground">
                Drag & drop, or click to browse. Accepted: PDF/JPG/PNG/DOC/DOCX
              </p>

              {attachment ? (
                <div className="mt-3 w-full">
                  {attachmentPreviewUrl && (
                    <img
                      src={attachmentPreviewUrl}
                      alt="Attachment preview"
                      className="h-20 w-20 rounded-xl border border-border bg-background object-cover"
                    />
                  )}
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-semibold text-foreground">{attachment.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatBytes(attachment.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg border border-border bg-background hover:bg-secondary/40"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAttachmentFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-[11px] text-muted-foreground">No file attached.</p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                handleAttachmentFile(f);
              }}
            />
          </div>
        </FormSection>

        <FormSection icon={Phone} title="Contact details" description="Optional alternate reachability for emergencies.">
          <label className={labelClass}>Contact</label>
          <input
            type="text"
            value={contactDuringLeave}
            onChange={(e) => setContactDuringLeave(e.target.value)}
            className="flat-input w-full rounded-lg px-3 py-2.5 text-sm"
            placeholder="Phone or email"
          />
        </FormSection>

        <FormSection
          icon={GitBranch}
          title="Submission summary"
          description="Total days and balance impact before you send."
        >
          <div className="rounded-xl border border-border bg-background/60 px-3 py-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">Request</span>
              <span className="font-bold tabular-nums text-foreground">
                {totalDays > 0 ? `${totalDays} days` : "—"}
              </span>
            </div>
            {selectedBalance && totalDays > 0 ? (
              <>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="font-semibold uppercase tracking-wider text-muted-foreground">Available after</span>
                  <span
                    className={cn(
                      "font-bold tabular-nums",
                      exceedsBalance ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {Math.max(0, Number(selectedBalance.available) - totalDays)} days
                  </span>
                </div>
                {exceedsBalance && (
                  <p className="mt-2 text-[11px] font-semibold text-destructive">
                    This request exceeds your available balance.
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2 text-[11px] text-muted-foreground">Select a leave type to preview entitlement consumption.</p>
            )}
          </div>
        </FormSection>

        {applyLeave.isError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {(applyLeave.error as Error)?.message || "Failed to submit leave application."}
          </div>
        )}

        <div className="sticky bottom-0 z-20 flex flex-col gap-2 border-t border-border bg-background/95 py-3 backdrop-blur-sm sm:flex-row sm:justify-end lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Button
            type="submit"
            variant="outline"
            className="h-10 rounded-xl border-border font-semibold"
            disabled={
              applyLeave.isPending || !leaveType || !fromDate || !toDate || !reason.trim() || totalDays <= 0
            }
            onClick={() => {
              submitModeRef.current = "DRAFT";
            }}
          >
            Save draft
          </Button>
          <Button
            type="submit"
            className="h-10 rounded-xl bg-foreground font-semibold text-primary-foreground hover:bg-foreground/90"
            disabled={applyLeave.isPending || !canSubmit}
            onClick={() => {
              submitModeRef.current = "SUBMITTED";
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            {applyLeave.isPending ? "Submitting…" : "Submit for approval"}
          </Button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Balance preview</p>
          {selectedBalance && selectedType ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <LeaveTypePill code={selectedType.code} />
                <span className="text-sm font-semibold text-foreground">{selectedType.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border bg-secondary/50 px-2 py-1.5">
                  <p className="text-muted-foreground">Available</p>
                  <p className="text-lg font-bold tabular-nums">{Number(selectedBalance.available)}</p>
                </div>
                <div className="rounded-xl border border-border bg-secondary/50 px-2 py-1.5">
                  <p className="text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold tabular-nums">{Number(selectedBalance.pending_approval)}</p>
                </div>
              </div>
              {totalDays > 0 && (
                <div className="rounded-xl border border-border bg-background px-3 py-2 text-xs">
                  <p className="text-muted-foreground">After this request</p>
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      exceedsBalance ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {Math.max(0, Number(selectedBalance.available) - totalDays)} days left
                  </p>
                  {exceedsBalance && <p className="mt-1 text-[11px] text-destructive">Exceeds available balance.</p>}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Select a leave type to preview entitlement consumption.</p>
          )}

          <div className="mt-4 border-t border-border pt-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <GitBranch className="h-3.5 w-3.5" />
              Approval chain
            </p>
            <ol className="mt-3 space-y-2">
              {approvalSteps.map((step, i) => (
                <li key={step} className="flex gap-2 text-xs">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>
    </form>
  );
}
