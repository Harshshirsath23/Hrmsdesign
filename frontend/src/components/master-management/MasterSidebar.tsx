import { cn } from "../../app/components/ui/utils";
import type { MasterCategoryGroup, MasterSectionConfig, MasterSectionKey } from "../../app/modules/masterManagement/settings";

export function MasterSidebar({
  categories,
  sections,
  activeCategory,
  activeSection,
  onCategoryChange,
  onSectionChange,
}: {
  categories: MasterCategoryGroup[];
  sections: MasterSectionConfig[];
  activeCategory: string;
  activeSection: MasterSectionKey;
  onCategoryChange: (categoryKey: string) => void;
  onSectionChange: (sectionKey: MasterSectionKey) => void;
}) {
  const activeGroup = categories.find((item) => item.key === activeCategory) ?? categories[0];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => onCategoryChange(category.key)}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors",
              category.key === activeCategory
                ? "border-border bg-secondary text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/40 p-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          Section
        </p>
        <div className="space-y-1">
          {activeGroup.sectionKeys.map((sectionKey) => {
            const section = sections.find((item) => item.key === sectionKey);
            if (!section) return null;
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => onSectionChange(section.key)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  section.key === activeSection
                    ? "bg-card text-foreground font-semibold border border-border"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {section.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
