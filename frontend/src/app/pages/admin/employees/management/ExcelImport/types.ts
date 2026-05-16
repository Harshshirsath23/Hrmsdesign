export type ImportStatus = "COMPLETED" | "FAILED" | "PENDING";

export interface ImporterOption {
  id: string;
  label: string;
  templateUrl: string;
  requiredColumns: string[];
}

export interface ImporterCategory {
  id: string;
  label: string;
  options: ImporterOption[];
}

export interface ImportHistory {
  id: string;
  fileName: string;
  uploadedDate: string;
  uploadedBy: string;
  importerType: string;
  status: ImportStatus;
  logUrl?: string;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  type: "ERROR" | "WARNING";
}

export interface ValidationPreview {
  totalRows: number;
  validRows: number;
  failedRows: number;
  skippedRows: number;
  errors: ValidationError[];
}

export interface MappingField {
  systemField: string;
  excelColumn: string;
  isMatched: boolean;
  isRequired: boolean;
}
