import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { MasterSidebar } from "./MasterSidebar";
import { MasterTable } from "./MasterTable";
import { MasterAuditPanel } from "./MasterAuditPanel";
import {
  MASTER_CATEGORY_GROUPS,
  MASTER_SECTIONS,
  useMasterManagementStore,
  type MasterSectionKey,
} from "../../app/modules/masterManagement";

export function MasterManagementCenter({
  initialSection,
}: {
  initialSection?: MasterSectionKey;
} = {}) {
  const store = useMasterManagementStore();
  const [activeCategory, setActiveCategory] = useState(MASTER_CATEGORY_GROUPS[0]?.key ?? "organization");
  const [activeSection, setActiveSection] = useState<MasterSectionKey>(
    initialSection ?? MASTER_CATEGORY_GROUPS[0]?.sectionKeys[0] ?? MASTER_SECTIONS[0]?.key,
  );

  const section = useMemo(
    () => MASTER_SECTIONS.find((item) => item.key === activeSection) ?? MASTER_SECTIONS[0],
    [activeSection],
  );

  const activeGroup = MASTER_CATEGORY_GROUPS.find((group) => group.key === activeCategory) ?? MASTER_CATEGORY_GROUPS[0];

  const normalizedCategory = useMemo(() => {
    if (activeGroup.sectionKeys.includes(activeSection)) return activeCategory;
    return activeGroup.key;
  }, [activeCategory, activeGroup.sectionKeys, activeSection]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-[#0f2744] p-4 text-neutral-100 shadow-xl">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Masters Management</h1>
            <p className="mt-1 text-xs text-neutral-400">
              Centralized super admin console for global enterprise masters and configuration.
            </p>
          </div>
        </div>
      </div>

      <div className="flat-card bg-card p-3">
        <div className="flex flex-wrap gap-2">
          {MASTER_CATEGORY_GROUPS.map((group) => (
            <button
              key={group.key}
              type="button"
              className={
                group.key === normalizedCategory
                  ? "rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground"
                  : "rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-border hover:bg-secondary/60 hover:text-foreground"
              }
              onClick={() => {
                setActiveCategory(group.key);
                if (!group.sectionKeys.includes(activeSection)) {
                  setActiveSection(group.sectionKeys[0]);
                }
              }}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flat-card bg-card p-3 sticky top-4 max-h-[calc(100vh-130px)] overflow-y-auto">
          <MasterSidebar
            categories={MASTER_CATEGORY_GROUPS}
            sections={MASTER_SECTIONS}
            activeCategory={activeCategory}
            activeSection={activeSection}
            onCategoryChange={(categoryKey) => {
              setActiveCategory(categoryKey);
              const group = MASTER_CATEGORY_GROUPS.find((item) => item.key === categoryKey);
              if (group) {
                setActiveSection(group.sectionKeys[0]);
              }
            }}
            onSectionChange={setActiveSection}
          />
        </aside>
        <div className="space-y-5">
          <MasterTable section={section} store={store} actor="Admin User" />
          <MasterAuditPanel audit={store.audit} section={section.key} />
        </div>
      </div>
    </div>
  );
}
