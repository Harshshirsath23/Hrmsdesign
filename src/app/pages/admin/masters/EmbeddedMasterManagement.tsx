import { useMemo, useState } from "react";
import { MASTER_CATEGORIES, getMasterConfig } from "../../../modules/masters/config";
import { MasterTable } from "./MasterTable";
import { LeaveSettingsCenter } from "../leave/sections/LeaveSettingsCenter";
import type { LeaveSettingsSectionKey } from "../../../modules/adminLeave/settings";
import { cn } from "../../../components/ui/utils";

export type EmbeddedMasterManagementProps = {
  initialCategoryKey?: string;
  initialMasterKey?: string;
};

function resolveInitialCategoryAndMaster(props: EmbeddedMasterManagementProps): { category: string; masterName: string } {
  const fallback = MASTER_CATEGORIES[0];
  const fbCat = fallback?.key ?? "";
  const fbMaster = fallback?.masters[0]?.key ?? "";
  let categoryKey = fbCat;
  if (props.initialCategoryKey) {
    const found = MASTER_CATEGORIES.find((c) => c.key === props.initialCategoryKey);
    if (found) categoryKey = found.key;
  }
  const cat = MASTER_CATEGORIES.find((c) => c.key === categoryKey);
  const masters = cat?.masters ?? [];
  let masterKey = masters[0]?.key ?? fbMaster;
  if (props.initialMasterKey && getMasterConfig(categoryKey, props.initialMasterKey)) {
    masterKey = props.initialMasterKey;
  }
  return { category: categoryKey, masterName: masterKey };
}

export function EmbeddedMasterManagement(props: EmbeddedMasterManagementProps = {}) {
  const [category, setCategory] = useState(() => resolveInitialCategoryAndMaster(props).category);
  const [masterName, setMasterName] = useState(() => resolveInitialCategoryAndMaster(props).masterName);

  const currentCategory = MASTER_CATEGORIES.find((c) => c.key === category);
  const fallbackCategory = MASTER_CATEGORIES[0];
  const fallbackMaster = fallbackCategory?.masters[0];

  if (!currentCategory || !getMasterConfig(category, masterName)) {
    if (!fallbackCategory || !fallbackMaster) return <div className="p-6">No masters configured.</div>;
    setCategory(fallbackCategory.key);
    setMasterName(fallbackMaster.key);
    return null;
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
          onClick={() => {
            setCategory(c.key);
            setMasterName(c.masters[0]?.key ?? "");
          }}
        >
          {c.label}
        </button>
      )),
    [category],
  );

  return (
    <div className="space-y-4">
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
                    onClick={() => setMasterName(m.key)}
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
