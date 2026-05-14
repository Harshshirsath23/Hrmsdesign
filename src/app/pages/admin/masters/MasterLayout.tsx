import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { Settings2 } from "lucide-react";
import { MASTER_CATEGORIES, getMasterConfig } from "../../../modules/masters/config";
import { MasterTable } from "./MasterTable";
import { LeaveSettingsCenter } from "../leave/sections/LeaveSettingsCenter";
import type { LeaveSettingsSectionKey } from "../../../modules/adminLeave/settings";
import { cn } from "../../../components/ui/utils";

export function MasterLayout() {
  const navigate = useNavigate();
  const { category = "", masterName = "" } = useParams();

  const currentCategory = MASTER_CATEGORIES.find((c) => c.key === category);
  const fallbackCategory = MASTER_CATEGORIES[0];
  const fallbackMaster = fallbackCategory?.masters[0];

  if (!currentCategory || !getMasterConfig(category, masterName)) {
    if (!fallbackCategory || !fallbackMaster) return <div className="p-6">No masters configured.</div>;
    return <Navigate to={`/superadmin/masters/${fallbackCategory.key}/${fallbackMaster.key}`} replace />;
  }

  const selectedConfig = getMasterConfig(category, masterName)!;

  const categoryButtons = useMemo(
    () =>
      MASTER_CATEGORIES.map((c) => (
        <button
          key={c.key}
          type="button"
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
            c.key === category
              ? "border-border bg-secondary text-foreground"
              : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/60 hover:text-foreground",
          )}
          onClick={() => navigate(`/superadmin/masters/${c.key}/${c.masters[0]?.key}`)}
        >
          {c.label}
        </button>
      )),
    [category, navigate],
  );

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-xl border border-white/10 bg-[#0f2744] p-4 text-neutral-100 shadow-xl">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <h1 className="text-lg font-semibold tracking-tight">Masters Management</h1>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          Super Admin console for configuration masters across HRMS domains.
        </p>
      </div>

      <div className="flat-card bg-card p-3">
        <div className="flex flex-wrap gap-2">{categoryButtons}</div>
      </div>

      <div
        className={cn(
          "grid gap-4",
          currentCategory.key === "attendance-leave" ? "lg:grid-cols-1" : "lg:grid-cols-[280px_minmax(0,1fr)]",
        )}
      >
        {currentCategory.key !== "attendance-leave" ? (
          <aside className="flat-card bg-card p-3">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {currentCategory.label}
            </p>
            <nav className="space-y-1">
              {currentCategory.masters.map((m) => {
                const active = m.key === masterName;
                return (
                  <button
                    key={m.key}
                    type="button"
                    className={cn(
                      "w-full rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                      active
                        ? "border-border bg-secondary text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/50 hover:text-foreground",
                    )}
                    onClick={() => navigate(`/superadmin/masters/${currentCategory.key}/${m.key}`)}
                  >
                    {m.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        ) : null}

        {currentCategory.key === "attendance-leave" ? (
          <LeaveSettingsCenter targetSection={masterName as LeaveSettingsSectionKey} mastersIntegration />
        ) : (
          <MasterTable config={selectedConfig} />
        )}
      </div>
    </div>
  );
}

