import React from "react";
import { Link } from "react-router";
import { Button } from "../../../../components/ui/button";
import { LeaveSettingsCenter } from "./LeaveSettingsCenter";
import { SuperadminSystemSettings } from "./SuperadminSystemSettings";

export function SuperadminSettings() {
  return (
    <div className="space-y-4">
      <div className="flat-card bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Settings</h2>
          <Button asChild size="sm" className="h-8 rounded-lg">
            <Link to="/superadmin/masters">Open Masters</Link>
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Centralized superadmin console to manage overall application masters and global controls.
        </p>
      </div>

      <SuperadminSystemSettings />
      <LeaveSettingsCenter targetSection="general" />
    </div>
  );
}
