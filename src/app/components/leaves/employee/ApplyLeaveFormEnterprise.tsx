import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, FileUp } from "lucide-react";
import type { LeaveBalanceAPI } from "../../../modules/leaves/types";
import { useApplyLeave, useLeaveTypes } from "../../../../hooks/useLeave";

import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { LeaveTypePill } from "./LeaveTypePill";

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
  // employee param is kept for display only; auth token identifies the employee on the backend
  const applyLeave = useApplyLeave();

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Session 1 = Morning (AM), Session 2 = Afternoon (PM)
  // Backend uses a single is_half_day boolean, so we derive it from sessions.
  const [fromSession, setFromSession] = useState<"first_half" | "second_half">("first_half");
  const [toSession, setToSession] = useState<"first_half" | "second_half">("second_half");

  const [reason, setReason]                         = useState("");
  const [contactDuringLeave, setContactDuringLeave] = useState("");
  const [attachment, setAttachment]                   = useState<File | null>(null);
  const [attachmentError, setAttachmentError]         = useState<string | null>(null);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!prefillLeaveType) return;
    if (leaveTypes.some((lt) => lt.leave_type_id === prefillLeaveType)) {
      setLeaveTypeId(prefillLeaveType);
    }
  }, [prefillLeaveType, leaveTypes]);

  const handleAttachmentFile = (f: File | null) => {
    if (!f) {
      setAttachment(null);
      setAttachmentError(null);
      return;
    }
    const acceptedExts = [".pdf",".xls",".xlsx",".doc",".docx",".txt",".ppt",".pptx",".gif",".jpg",".jpeg",".png"];
    if (!acceptedExts.some((ext) => f.name.toLowerCase().endsWith(ext))) {
      setAttachmentError("Unsupported file type. Upload PDF, XLS, XLSX, DOC, DOCX, TXT, PPT, PPTX, GIF, JPG, JPEG, PNG.");
      setAttachment(null);
      return;
    }
    setAttachmentError(null);
    setAttachment(f);
  };

  const totalDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const from = new Date(fromDate);
    const to   = new Date(toDate);
    if (to < from) return 0;
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [fromDate, toDate]);

  // Match balance using leave_type_id (backend field)
  const selectedBalance = useMemo(
    () => balances.find((b) => b.leave_type_id === leaveTypeId) ?? null,
    [leaveTypeId, balances],
  );

  // available is the normalised alias for balance
  const availableDays  = Number(selectedBalance?.available ?? selectedBalance?.balance ?? 0);
  const exceedsBalance = selectedBalance ? totalDays > availableDays : false;
  const selectedType = useMemo(
    () => leaveTypes.find((lt) => lt.leave_type_id === leaveTypeId) ?? null,
    [leaveTypeId, leaveTypes],
  );
  const remainingAfterApproval = Math.max(0, availableDays - totalDays);

  // is_half_day: true when the leave spans exactly one day and one session is not "FULL"
  // const isHalfDay = fromDate === toDate && (fromSession !== "1" || toSession !== "2") && totalDays === 1;

  const canSubmit =
    !!leaveTypeId &&
    !!fromDate &&
    !!toDate &&
    !!reason.trim() &&
    totalDays > 0 &&
    !exceedsBalance;

  const resetForm = () => {
    setLeaveTypeId("");
    setFromDate("");
    setToDate("");
    setFromSession("first_half");
    setToSession("second_half");
    setReason("");
    setContactDuringLeave("");
    setAttachment(null);
    setAttachmentError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    console.log("prefillLeaveType", prefillLeaveType);
    console.log("leaveTypes", leaveTypes);
    console.log("leaveTypeId", leaveTypeId);
    // Payload matches LeaveApplicationCreateSerializer exactly:
    // { leave_type_id, from_date, to_date, reason?, is_half_day }
    applyLeave.mutate(
    {
      leave_type_id: leaveTypeId,
      from_date: fromDate,
      to_date: toDate,

      from_session: fromSession,
      to_session: toSession,

      reason: reason.trim(),
      attachment: attachment,
    },
      {
        onSuccess: () => {
          resetForm();
          onSuccess();
        },
      },
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-3">
        {/* ── Main Form ─────────────────────────────────────────────────── */}
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-2xl font-semibold text-slate-900">Leave Application</h2>
              <p className="mt-1 text-sm text-slate-500">
                Applicant: {employee.employee_name} ({employee.employee_code})
              </p>
              <p className="mt-1 text-sm text-slate-500">
                All fields marked <span className="text-red-500">*</span> are required
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {/* Leave Type */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={leaveTypeId}
                    onChange={(e) => setLeaveTypeId(e.target.value)}
                    className="h-12 w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    required
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((lt) => (
                      <option key={lt.leave_type_id} value={lt.leave_type_id}>
                        {lt.name} ({lt.code})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              {/* Dates + Sessions */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* From */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                  <div className="relative mt-3">
                    <select
                      value={fromSession}
                      onChange={(e) =>
                        setFromSession(
                          e.target.value as
                            | "first_half"
                            | "second_half"
                        )
                        }
                      >
                      <option value="first_half">
                        First Half
                      </option>

                      <option value="second_half">
                        Second Half
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>

                {/* To */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                  <div className="relative mt-3">
                    <select
                      value={toSession}
                      onChange={(e) =>
                        setToSession(
                          e.target.value as
                            | "first_half"
                            | "second_half"
                        )
                      }
                    >
                      <option value="first_half">
                        First Half
                      </option>

                      <option value="second_half">
                        Second Half
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Applying To + CC
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Applying To
                  </label>
                  <div className="flex h-12 items-center rounded-lg border border-slate-300 bg-white px-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                      {employee.employee_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-800">
                      {employee.employee_code}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    CC To
                  </label>
                  <div className="flex min-h-[48px] flex-wrvap items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                    {ccTo.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => console.log("Add CC")}
                        className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-indigo-600"
                      >
                        <Plus className="h-4 w-4" />
                        Add recipients
                      </button>
                    ) : (
                      ccTo.map((email) => (
                        <div key={email} className="flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1 text-sm">
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => setCcTo((prev) => prev.filter((e) => e !== email))}
                            className="text-slate-500 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div> */}

              {/* Contact During Leave */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Contact During Leave
                </label>
                <input
                  type="text"
                  value={contactDuringLeave}
                  onChange={(e) => setContactDuringLeave(e.target.value)}
                  placeholder="Phone number or alternate contact"
                  className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={5}
                  placeholder="Briefly describe the reason for your leave..."
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  required
                />
              </div>

              {/* Attachment */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <FileUp className="h-4 w-4 text-slate-700" />
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Attachment
                  </label>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  onDragEnter={(e) => { e.preventDefault(); setIsDraggingAttachment(true); }}
                  onDragOver={(e)  => { e.preventDefault(); setIsDraggingAttachment(true); }}
                  onDragLeave={() => setIsDraggingAttachment(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingAttachment(false);
                    handleAttachmentFile(e.dataTransfer.files?.[0] ?? null);
                  }}
                  className={cn(
                    "rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer",
                    isDraggingAttachment
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-300 bg-slate-50 hover:border-indigo-300",
                  )}
                >
                  {attachment ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-800">{attachment.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAttachmentFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
                        <FileUp className="h-5 w-5 text-slate-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">Drop file here or browse</p>
                      <p className="mt-1 text-xs text-slate-500">PDF, DOC, XLS, PPT, JPG, PNG, GIF — up to 10 MB</p>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.xls,.xlsx,.doc,.docx,.txt,.ppt,.pptx,.gif,.jpg,.jpeg,.png"
                  onChange={(e) => handleAttachmentFile(e.target.files?.[0] ?? null)}
                />

                {attachmentError && (
                  <p className="mt-2 text-sm text-red-600">{attachmentError}</p>
                )}
              </div>

              {/* API error */}
              {applyLeave.isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {(applyLeave.error as Error)?.message || "Failed to submit leave application."}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg border-slate-300 px-6"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={applyLeave.isPending || !canSubmit}
                  className="h-11 rounded-lg bg-indigo-600 px-6 text-white hover:bg-indigo-700"
                >
                  {applyLeave.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
              {selectedType && <LeaveTypePill code={selectedType.code} />}
            </form>
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <div className="space-y-4 xl:col-span-1">
          {/* Balance card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-100">
                Leave Balance
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                {selectedBalance?.leave_type_detail?.name ?? selectedBalance?.leave_type ?? "Select a leave type"}
              </h3>
            </div>

            <div className="p-5">
              {selectedBalance && (
                <div className="space-y-5">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-sm text-slate-500">Used</span>
                      <span className="text-lg font-semibold text-slate-900">
                        {Number(selectedBalance.used ?? selectedBalance.taken)} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-sm text-slate-500">Available</span>
                      <span className="text-lg font-semibold text-slate-900">
                        {availableDays} days
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <span className="text-sm text-slate-500">After this request</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {Math.max(0, availableDays - totalDays)} days
                    </span>
                  </div>

                  {totalDays > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      Applying for <span className="font-semibold">{totalDays}</span>{" "}
                      {totalDays === 1 ? "day" : "days"}
                    </div>
                  )}

                  {exceedsBalance && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      Insufficient balance. Only {availableDays} days available.
                    </div>
                  )}
                </div>
              )}
              {!exceedsBalance &&
                selectedBalance &&
                remainingAfterApproval <= 1 &&
                remainingAfterApproval >= 0 && (
                  <>
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-100/70 px-3 py-2 text-sm text-amber-900">
                      Only {remainingAfterApproval} day remaining after this request.
                    </div>
                  </>
                )}
            </div>
          </div>

          {/* Heads Up */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wide text-amber-700">Heads Up</h4>
            <ul className="mt-3 space-y-2 text-sm text-amber-800">
              <li>• Apply at least 1 day in advance for planned leaves</li>
              <li>• Medical leaves may require a certificate</li>
              <li>• Your manager will be notified automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
