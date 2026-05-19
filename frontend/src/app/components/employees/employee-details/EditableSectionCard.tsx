import { LucideIcon, Save, X, Pencil, Plus } from "lucide-react";
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
  editLabel?: string;
  // Selective Editing for ESS
  sectionId?: string;
  canEmployeeEdit?: boolean;
  onToggleEmployeeEdit?: (checked: boolean) => void;
  requestStatus?: 'None' | 'Pending' | 'Updated';
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
  editLabel,
  sectionId,
  canEmployeeEdit,
  onToggleEmployeeEdit,
  requestStatus,
}: EditableSectionCardProps) {
  const getStatusLabel = () => {
    if (requestStatus === 'Pending') return { l: 'Pending Employee Update', c: 'bg-amber-500/10 text-amber-600 border-amber-200' };
    if (requestStatus === 'Updated') return { l: 'Updated by Employee', c: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' };
    if (canEmployeeEdit) return { l: 'Editable by Employee', c: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' };
    return { l: 'Locked by Admin', c: 'bg-slate-500/10 text-slate-500 border-slate-200' };
  };

  const status = getStatusLabel();

  return (
    <div className={cn("flat-card bg-card border border-border p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2.5">
            {Icon ? (
              <span className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-foreground" />
              </span>
            ) : null}
            {title}
          </h3>
          {sectionId && (
             <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-all", status.c)}>
               {status.l}
             </span>
          )}
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {sectionId && onToggleEmployeeEdit && (
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={canEmployeeEdit}
                  onChange={(e) => onToggleEmployeeEdit(e.target.checked)}
                  className="sr-only"
                />
                <div className={cn(
                  "w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center",
                  canEmployeeEdit ? "bg-indigo-500 border-indigo-500 shadow-sm" : "border-slate-300 bg-white group-hover:border-indigo-400"
                )}>
                  {canEmployeeEdit && <Save className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-700 uppercase tracking-widest transition-colors">
                Allow Employee to Edit
              </span>
            </label>
          )}

          <div className="flex items-center gap-2">
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
                {editLabel === "Add" ? (
                  <Plus className="w-3.5 h-3.5" />
                ) : (
                  <Pencil className="w-3.5 h-3.5" />
                )}
                {editLabel || "Edit"}
              </button>
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
