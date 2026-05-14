export type MasterFieldType = "text" | "textarea" | "number" | "select" | "boolean";

export interface MasterFieldConfig {
  key: string;
  label: string;
  type: MasterFieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  relationMaster?: string;
  relationLabelKey?: string;
  relationValueKey?: string;
}

export interface MasterConfig {
  key: string;
  apiName: string;
  label: string;
  category: string;
  constant?: boolean;
  companyScoped?: boolean;
  parentFieldKey?: string;
  formFields?: MasterFieldConfig[];
  listColumns?: string[];
}

export interface MasterCategoryConfig {
  key: string;
  label: string;
  masters: MasterConfig[];
}

export interface MasterRecord {
  id: string | number;
  code: string;
  label?: string;
  name?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  company?: string | number | null;
  company_name?: string;
  [key: string]: unknown;
}

export interface PaginatedMasterResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MasterListQuery {
  search?: string;
  company?: string;
  is_active?: "true" | "false";
  page?: number;
}

