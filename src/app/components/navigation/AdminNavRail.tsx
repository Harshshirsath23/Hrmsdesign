import { Menu, PanelLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { cn } from "../ui/utils";
import { AdminFloatingMenu, type AdminNavMenuItem } from "./AdminFloatingMenu";
import { AdminNavGroup } from "./AdminNavGroup";
import { AdminNavItem } from "./AdminNavItem";
import { AdminSearchNavigation } from "./AdminSearchNavigation";

export type AdminNavGroupSchema<T extends string> = {
  id: string;
  label: string;
  items: Array<AdminNavMenuItem<T>>;
};

export function AdminNavRail<T extends string>({
  groups,
  active,
  onSelect,
}: {
  groups: Array<AdminNavGroupSchema<T>>;
  active: T;
  onSelect: (id: T) => void;
}) {
  const [query, setQuery] = useState("");
  const [compact, setCompact] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.id, true])),
  );
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => item.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const toggleGroup = (id: string) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const rail = (
    <aside
      className={cn(
        "relative rounded-xl border border-white/10 bg-black text-neutral-200 shadow-xl transition-all duration-200",
        compact ? "w-[74px] p-2.5" : "w-full p-3",
      )}
    >
      <div className={cn("flex items-center gap-2 mb-3", compact && "justify-center")}>
        {!compact && <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 font-semibold">Superadmin Leave Control</p>}
        <button
          type="button"
          onClick={() => setCompact((v) => !v)}
          className="ml-auto h-7 w-7 inline-flex items-center justify-center rounded-md border border-white/10 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors duration-150"
          title={compact ? "Expand navigation" : "Compact navigation"}
        >
          <PanelLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {!compact && <AdminSearchNavigation value={query} onChange={setQuery} />}

      <div className={cn("mt-3 space-y-2", compact && "mt-1")}>
        {filteredGroups.map((group) => {
          if (compact) {
            const groupActive = group.items.some((i) => i.id === active);
            const firstIcon = group.items[0]?.icon;
            if (!firstIcon) return null;
            return (
              <div
                key={group.id}
                className="relative"
                onMouseEnter={() => setHoverGroup(group.id)}
                onMouseLeave={() => setHoverGroup((curr) => (curr === group.id ? null : curr))}
              >
                <AdminNavItem
                  label={group.label}
                  icon={firstIcon}
                  active={groupActive}
                  compact
                  onClick={() => {
                    if (group.items.length > 0) onSelect(group.items[0].id);
                  }}
                />
                {hoverGroup === group.id && (
                  <div className="absolute left-full top-0 ml-2 z-50">
                    <AdminFloatingMenu items={group.items} active={active} onSelect={onSelect} />
                  </div>
                )}
              </div>
            );
          }

          return (
            <AdminNavGroup
              key={group.id}
              title={group.label}
              open={openGroups[group.id] ?? true}
              onToggle={() => toggleGroup(group.id)}
            >
              {group.items.map((item) => (
                <AdminNavItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  active={active === item.id}
                  onClick={() => onSelect(item.id)}
                />
              ))}
            </AdminNavGroup>
          );
        })}
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{rail}</div>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="h-9 px-3 rounded-lg border border-white/10 bg-black text-neutral-200 text-xs font-medium inline-flex items-center gap-2"
            >
              <Menu className="w-4 h-4" />
              Navigation
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-black border-white/10 p-3">
            {rail}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

