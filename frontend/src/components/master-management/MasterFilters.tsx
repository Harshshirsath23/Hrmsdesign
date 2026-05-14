import { Search } from "lucide-react";
import { Input } from "../../app/components/ui/input";
import { Button } from "../../app/components/ui/button";

export function MasterFilters({
  query,
  showArchived,
  onQueryChange,
  onToggleArchived,
  onCreate,
}: {
  query: string;
  showArchived: boolean;
  onQueryChange: (value: string) => void;
  onToggleArchived: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-9"
          placeholder="Search settings by name/code"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleArchived}
          className="px-3 py-2 rounded-lg text-xs font-semibold bg-secondary border border-border"
        >
          {showArchived ? "Hide Archived" : "Show Archived"}
        </button>
        <Button className="px-3 py-2 rounded-lg text-xs font-semibold" onClick={onCreate}>
          New
        </Button>
      </div>
    </div>
  );
}
