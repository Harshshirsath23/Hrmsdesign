import { LucideIcon, Save, X, Pencil, Plus } from "lucide-react";
import { cn } from "../../ui/utils";
import { useEmployeeFormContext } from "./EmployeeFormContext";

interface EditableSectionCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  isEditing: boolean;
  onEdit?: () => void;
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
  /** When true, hides the admin-only "Allow Employee to Edit" checkbox (used on ESS side) */
  hideAdminControls?: boolean;
  /** When true the profile/section is locked for direct edits */
  profileLocked?: boolean;
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
  requestStatus,
  profileLocked,
}: EditableSectionCardProps) {
  const getStatusLabel = () => {
    if (requestStatus === 'Pending') return { l: 'Pending Employee Update', c: 'bg-amber-500/10 text-amber-600 border-amber-200' };
    if (requestStatus === 'Updated') return { l: 'Updated by Employee', c: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' };
    if (canEmployeeEdit) return { l: 'Editable by Employee', c: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' };
    return { l: '', c: '' };
  };

  const status = getStatusLabel();
  const ctx = useEmployeeFormContext();
  const finalSubmitted = ctx?.finalSubmitted;
  const effectiveProfileLocked = profileLocked || !!finalSubmitted;

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
          {sectionId && status.l ? (
             <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-all", status.c)}>
               {status.l}
             </span>
          ) : null}
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {!effectiveProfileLocked && headerExtra}
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
              // If the profile is locked, hide the regular Edit button and show Request Change instead
              (onEdit && !effectiveProfileLocked) ? (
                // Default Edit flow when not locked
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
              ) : (
                // Profile locked — show Request Change button that dispatches a global event
                sectionId ? (
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.dispatchEvent(new CustomEvent('ess:request_change', { detail: { sectionId } }));
                      } catch (e) {
                        // noop
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Request Change
                  </button>
                ) : null
              )
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
