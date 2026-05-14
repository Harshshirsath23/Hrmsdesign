import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { MasterManagementCenter } from "../../../../components/master-management";

export function AdminMasterManagementPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-secondary p-3">
              <Settings2 className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Enterprise Master Management</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Centralized configuration hub for global master data and system settings.
              </p>
            </div>
          </div>
          <Button className="h-10" onClick={() => setOpen(true)}>
            Open Master Management
          </Button>
        </div>
      </div>

      {open ? (
        <MasterManagementCenter />
      ) : (
        <div className="flat-card bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Master Management</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Use this section to manage enterprise-wide lookup masters, policies, workflows and audit controls.
          </p>
        </div>
      )}
    </div>
  );
}
