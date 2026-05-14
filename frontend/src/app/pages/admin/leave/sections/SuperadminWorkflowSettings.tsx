export function SuperadminWorkflowSettings() {
  return (
    <div className="flat-card bg-card p-6 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Workflow Settings</h2>
      <p className="text-xs text-muted-foreground">Configure approval SLAs, escalation timings, and role-level routing.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-secondary/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Multi-Level Approval</p>
          <p className="text-sm text-foreground mt-1">Manager → HR → Admin (Superadmin override enabled)</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-secondary/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Escalation SLA</p>
          <p className="text-sm text-foreground mt-1">Escalate after 24h pending at each level</p>
        </div>
      </div>
    </div>
  );
}

