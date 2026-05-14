import type { MasterAuditEvent, MasterSectionKey } from "../../app/modules/masterManagement/settings";

export function MasterAuditPanel({
  audit,
  section,
}: {
  audit: MasterAuditEvent[];
  section: MasterSectionKey;
}) {
  const recent = audit.filter((item) => item.section === section).slice(0, 12);

  return (
    <div className="flat-card bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Recent Audit</h3>
      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
            No audit events yet for this section.
          </div>
        ) : (
          recent.map((event) => (
            <div key={event.id} className="p-3 rounded-lg border border-border bg-secondary/30">
              <p className="text-sm font-medium text-foreground">
                {event.action} · {event.target_id}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(event.at).toLocaleString()} · {event.actor}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
