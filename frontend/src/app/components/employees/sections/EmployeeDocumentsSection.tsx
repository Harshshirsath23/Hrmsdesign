import { useMemo, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Employee } from "../mockData";
import { useAdminSync } from "../../admin/useAdminSync";
import { EditableSectionCard } from "../employee-details";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store";
import {
  addDocumentType,
  removeDocumentType,
  selectActiveDocumentTypes,
  updateDocumentType,
} from "../../../../store/slices/documentTypesSlice";
import { DocumentTypeModal } from "../../../modules/employees/documentTypes/DocumentTypeModal";
import { EmployeeDocumentsGrid } from "../../../modules/employees/documentTypes/EmployeeDocumentsGrid";
import type { DocumentTypeConfig } from "../../../modules/employees/documentTypes/types";

interface Props {
  employee: Employee;
}

export function EmployeeDocumentsSection({ employee }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const documentTypes = useSelector(selectActiveDocumentTypes);
  const { handleAdminSave, handleToggleEditAccess } = useAdminSync();
  const [isEditing, setIsEditing] = useState(false);
  const [docs, setDocs] = useState(() => ({ ...(employee.employeeDocuments || {}) }));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<DocumentTypeConfig | null>(null);

  const baseline = useMemo(() => ({ ...(employee.employeeDocuments || {}) }), [employee.employeeDocuments]);
  const isEditable = employee.editableSections?.includes("employee-documents");
  const existingIds = useSelector((s: RootState) => s.documentTypes.types.map((t) => t.id));

  const handleSave = async () => {
    const ok = await handleAdminSave("Employee Documents", employee, { ...employee, employeeDocuments: docs });
    if (ok) setIsEditing(false);
  };

  const handleSaveType = (config: DocumentTypeConfig) => {
    if (editingType) {
      dispatch(updateDocumentType(config));
    } else {
      dispatch(addDocumentType(config));
    }
    setEditingType(null);
  };

  const handleRemoveType = (type: DocumentTypeConfig) => {
    if (type.isSystem) return;
    if (!window.confirm(`Remove document type "${type.documentName}"?`)) return;
    dispatch(removeDocumentType(type.id));
    setDocs((d) => {
      const n = { ...d };
      Object.keys(n).forEach((k) => {
        if (k === type.id || k.startsWith(`${type.id}_`)) delete n[k];
      });
      return n;
    });
  };

  const addTypeButton = (
    <button
      type="button"
      onClick={() => {
        setEditingType(null);
        setModalOpen(true);
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-secondary transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      Add New Document Type
    </button>
  );

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-lg font-bold text-foreground">Employee Documents</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload and manage documents for {employee.name}</p>
      </div>

      <EditableSectionCard
        title="Document Management"
        icon={FileText}
        sectionId="employee-documents"
        canEmployeeEdit={isEditable}
        onToggleEmployeeEdit={(v) => handleToggleEditAccess(employee, "employee-documents", v)}
        requestStatus={employee.editRequestStatus}
        isEditing={isEditing}
        onEdit={() => {
          setDocs({ ...baseline });
          setIsEditing(true);
        }}
        onCancel={() => {
          setDocs({ ...baseline });
          setIsEditing(false);
        }}
        onSave={handleSave}
        headerExtra={addTypeButton}
      >
        <EmployeeDocumentsGrid
          documentTypes={documentTypes}
          docs={docs}
          isEditing={isEditing}
          onChange={setDocs}
          showTypeControls
          onEditType={(type) => {
            setEditingType(type);
            setModalOpen(true);
          }}
          onRemoveType={handleRemoveType}
        />
      </EditableSectionCard>

      <DocumentTypeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editingType}
        existingIds={existingIds}
        onSave={handleSaveType}
      />
    </div>
  );
}
