import { useState } from 'react';
import { Clock, Edit3, FileText, History, Shield, X } from 'lucide-react';
import { useAttendanceAuditLog, useAttendanceOverride } from '@hooks/useAdminAttendance';
import type { AdminAttendanceRecord, AttendanceEditLogEntry } from '@hooks/useAdminAttendance';
import { cn } from '@utils/utils';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtTime(dt: string | null): string {
  if (!dt) return '—';
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDuration(iso: string | null): string {
  if (!iso) return '—';
  const parts = iso.split(':');
  if (parts.length >= 2) {
    return `${parseInt(parts[0], 10)}h ${parseInt(parts[1], 10)}m`;
  }
  return iso;
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  ABSENT: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  HALF_DAY: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  LEAVE: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  HOLIDAY: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  WEEK_OFF: 'bg-surface-100 text-surface-600 dark:bg-white/10 dark:text-white/40',
};

const SOURCE_LABELS: Record<string, string> = {
  BIOMETRIC: 'Biometric',
  REGULARIZATION: 'Regularization',
  ADMIN_OVERRIDE: 'Admin Override',
  SYSTEM: 'System',
};

/* ------------------------------------------------------------------ */
/*  Audit Trail                                                        */
/* ------------------------------------------------------------------ */

function AuditTrail({ logs }: { logs: AttendanceEditLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-surface-400 dark:text-white/30">
        No edit history for this record.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-2 w-2 rounded-full bg-brand-500 dark:bg-brand-400" />
            <div className="w-px flex-1 bg-surface-200 dark:bg-white/10" />
          </div>
          <div className="pb-3">
            <p className="text-xs font-medium text-surface-700 dark:text-white/70">
              {SOURCE_LABELS[log.change_source] ?? log.change_source}
            </p>
            <p className="text-2xs text-surface-500 dark:text-white/40">
              {log.field_changed}: <span className="line-through">{log.old_value || '—'}</span> → <span className="font-medium text-surface-700 dark:text-white/60">{log.new_value || '—'}</span>
            </p>
            <p className="text-2xs text-surface-400 dark:text-white/25">
              by {log.changed_by_name} · {new Date(log.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Override Form                                                      */
/* ------------------------------------------------------------------ */

function OverrideForm({ record, onSuccess }: { record: AdminAttendanceRecord; onSuccess: () => void }) {
  const override = useAttendanceOverride();
  const [status, setStatus] = useState(record.status);
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.length < 10) return;
    override.mutate(
      { recordId: record.id, payload: { status: status !== record.status ? status : undefined, reason } },
      { onSuccess },
    );
  };

  const inputClass = 'w-full rounded-lg border border-surface-200 bg-surface-0 px-3 py-2 text-sm text-surface-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-surface-100 dark:text-white dark:focus:border-brand-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-surface-600 dark:text-white/50">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="HALF_DAY">Half Day</option>
          <option value="LEAVE">Leave</option>
          <option value="ON_DUTY">On Duty</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-surface-600 dark:text-white/50">
          Reason * <span className="font-normal text-surface-400">(min 10 chars)</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={cn(inputClass, 'min-h-[72px] resize-none')}
          placeholder="Explain why this record is being changed..."
          required
          minLength={10}
        />
        {reason.length > 0 && reason.length < 10 && (
          <p className="mt-0.5 text-2xs text-red-500">{10 - reason.length} more characters needed</p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={override.isPending || reason.length < 10}
          className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          {override.isPending ? 'Saving...' : 'Save Override'}
        </button>
      </div>
      {override.isError && (
        <p className="text-xs text-red-500">
          {(override.error as Error)?.message || 'Failed to save override.'}
        </p>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main: AttendanceDetailSheet                                        */
/* ------------------------------------------------------------------ */

interface Props {
  record: AdminAttendanceRecord;
  onClose: () => void;
}

export function AttendanceDetailSheet({ record, onClose }: Props) {
  const { data: auditLogs = [], refetch } = useAttendanceAuditLog(record.id);
  const [showOverride, setShowOverride] = useState(false);

  const statusCls = STATUS_COLORS[record.status] ?? STATUS_COLORS['WEEK_OFF'];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-surface-200 bg-white shadow-2xl dark:border-white/5 dark:bg-surface-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4 dark:border-white/5">
        <div>
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
            {record.employee_name}
          </h3>
          <p className="text-2xs text-surface-500 dark:text-white/40">
            {record.employee_code} · {fmtDate(record.date)}
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 dark:text-white/30 dark:hover:bg-white/5">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body (scrollable) */}
      <div className="flex-1 space-y-5 overflow-y-auto p-5" data-scroll-container>
        {/* Original Record */}
        {record.original_status && (
          <section>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-surface-400 dark:text-white/30">
              <History className="h-3 w-3" /> Original Biometric Record
            </h4>
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-surface-100 p-3 dark:border-white/5">
              <div>
                <p className="text-2xs text-surface-400 dark:text-white/30">Punch In</p>
                <p className="text-xs font-medium text-surface-700 dark:text-white/70">{fmtTime(record.original_first_in)}</p>
              </div>
              <div>
                <p className="text-2xs text-surface-400 dark:text-white/30">Punch Out</p>
                <p className="text-xs font-medium text-surface-700 dark:text-white/70">{fmtTime(record.original_last_out)}</p>
              </div>
              <div>
                <p className="text-2xs text-surface-400 dark:text-white/30">Status</p>
                <p className="text-xs font-medium text-surface-700 dark:text-white/70">{record.original_status}</p>
              </div>
            </div>
          </section>
        )}

        {/* Current Record */}
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-surface-400 dark:text-white/30">
            <Clock className="h-3 w-3" /> Current Record
            {record.is_admin_edited && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-2xs font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-400">
                <Edit3 className="h-2.5 w-2.5" /> Edited
              </span>
            )}
          </h4>
          <div className="rounded-xl border border-surface-100 p-3 dark:border-white/5">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-2xs text-surface-400 dark:text-white/30">Punch In</p>
                <p className="text-xs font-medium text-surface-700 dark:text-white/70">{fmtTime(record.first_in)}</p>
              </div>
              <div>
                <p className="text-2xs text-surface-400 dark:text-white/30">Punch Out</p>
                <p className="text-xs font-medium text-surface-700 dark:text-white/70">{fmtTime(record.last_out)}</p>
              </div>
              <div>
                <p className="text-2xs text-surface-400 dark:text-white/30">Effective</p>
                <p className="text-xs font-medium text-surface-700 dark:text-white/70">{fmtDuration(record.effective_hours)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-2xs font-semibold', statusCls)}>
                {record.status.replace('_', ' ')}
              </span>
              {record.last_changed_by_source !== 'BIOMETRIC' && (
                <span className="text-2xs text-surface-400 dark:text-white/25">
                  via {SOURCE_LABELS[record.last_changed_by_source] ?? record.last_changed_by_source}
                </span>
              )}
            </div>
            {record.is_regularized && (
              <p className="mt-2 text-2xs text-surface-500 dark:text-white/40">
                <FileText className="mr-1 inline h-3 w-3" /> Regularization applied
              </p>
            )}
          </div>
        </section>

        {/* Admin Override */}
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-surface-400 dark:text-white/30">
            <Shield className="h-3 w-3" /> Admin Override
          </h4>
          {showOverride ? (
            <OverrideForm
              record={record}
              onSuccess={() => {
                setShowOverride(false);
                refetch();
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowOverride(true)}
              className="w-full rounded-xl border-2 border-dashed border-surface-200 py-3 text-xs font-medium text-surface-500 transition-colors hover:border-brand-300 hover:text-brand-600 dark:border-white/10 dark:text-white/40 dark:hover:border-brand-400/30 dark:hover:text-brand-400"
            >
              <Edit3 className="mr-1.5 inline h-3.5 w-3.5" /> Override this record
            </button>
          )}
        </section>

        {/* Audit Trail */}
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-surface-400 dark:text-white/30">
            <History className="h-3 w-3" /> Audit Trail
          </h4>
          <AuditTrail logs={auditLogs} />
        </section>
      </div>
    </div>
  );
}
