import { LucideIcon, Save, X, Pencil } from "lucide-react";
import { cn } from "../../ui/utils";

interface EditableSectionCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  /** Extra actions shown next to edit (e.g. Add) */
  headerExtra?: React.ReactNode;
  className?: string;
}

export function EditableSectionCard({
  title,
  icon: Icon,
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  headerExtra,
  className,
}: EditableSectionCardProps) {
  return (
    <div className={cn("flat-card bg-card border border-border p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2.5">
          {Icon ? (
            <span className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-foreground" />
            </span>
          ) : null}
          {title}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {headerExtra}
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
