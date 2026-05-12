import { Settings2 } from "lucide-react";

export function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="rounded-xl border border-white/10 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-secondary p-3">
            <Settings2 className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage admin configuration and system preferences from here.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-background p-6">
          <p className="text-sm text-foreground font-medium">Coming soon</p>
          <p className="mt-3 text-sm text-muted-foreground leading-6">
            The admin settings panel is being prepared. For now, use the Leave module's built-in
            settings section at <strong>Admin &gt; Leave &gt; Settings</strong> or the superadmin masters section.
          </p>
        </div>
      </div>
    </div>
  );
}
