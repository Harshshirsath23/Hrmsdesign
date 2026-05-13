import { ChevronRight } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  crumbs,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumbs?: string[];
  right?: React.ReactNode;
}) {
  return (
    <div className="flat-card bg-card p-6">
      {crumbs?.length ? (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          {crumbs.map((c, i) => (
            <span key={`${c}-${i}`} className="inline-flex items-center gap-2">
              <span>{c}</span>
              {i < crumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </span>
          ))}
        </div>
      ) : eyebrow ? (
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          {eyebrow}
        </p>
      ) : null}

      <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </div>
  );
}

