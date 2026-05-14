import { useCallback, useEffect, useMemo, useState } from "react";

export type MasterSectionKey =
  | "general"
  | "master-types"
  | "policy-configurations"
  | "approval-workflows"
  | "escalation-matrix"
  | "holiday-calendar"
  | "weekend-configuration"
  | "accrual-schedules"
  | "encashment-rules"
  | "notification-templates"
  | "request-module-settings"
  | "feature-flags"
  | "audit-logs"
  | "system-settings";

export type MasterFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "boolean"
  | "color"
  | "json"
  | "date"
  | "email"
  | "phone"
  | "upload"
  | "tags";

export interface MasterFieldSchema {
  key: string;
  label: string;
  type: MasterFieldType;
  required?: boolean;
  options?: string[];
}

export interface MasterRecord {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  archived_at: string | null;
  updated_at: string;
  config: Record<string, unknown>;
}

export interface MasterAuditEvent {
  id: string;
  section: MasterSectionKey;
  at: string;
  actor: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "ARCHIVE" | "RESTORE" | "ACTIVATE" | "DEACTIVATE" | "CLONE";
  target_id: string;
  previous_value?: string;
  new_value?: string;
}

export interface MasterSectionConfig {
  key: MasterSectionKey;
  label: string;
  description: string;
  schema: MasterFieldSchema[];
}

export interface MasterCategoryGroup {
  key: string;
  label: string;
  sectionKeys: MasterSectionKey[];
}

const SETTINGS_KEY = "hrms-admin-master-management-v1";
const LEGACY_SETTINGS_KEY = "hrms-admin-leave-settings-v1";
const SETTINGS_AUDIT_KEY = "hrms-admin-master-management-audit-v1";
const LEGACY_SETTINGS_AUDIT_KEY = "hrms-admin-leave-settings-audit-v1";

const baseSchema: MasterFieldSchema[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "code", label: "Code", type: "text", required: true },
  { key: "is_active", label: "Active", type: "boolean" },
  { key: "custom_fields_json", label: "Custom Fields JSON", type: "json" },
];

const leaveTypeSchema: MasterFieldSchema[] = [
  ...baseSchema,
  { key: "color", label: "Color", type: "color" },
  { key: "is_paid", label: "Paid", type: "boolean" },
  { key: "carry_forward", label: "Carry Forward", type: "boolean" },
  { key: "encashment_allowed", label: "Encashment Allowed", type: "boolean" },
  { key: "gender_restriction", label: "Gender Restriction", type: "select", options: ["ALL", "MALE", "FEMALE", "OTHER"] },
  { key: "maximum_days", label: "Maximum Days", type: "number" },
  { key: "minimum_days", label: "Minimum Days", type: "number" },
  { key: "requires_attachment", label: "Requires Attachment", type: "boolean" },
  { key: "requires_approval", label: "Requires Approval", type: "boolean" },
  { key: "auto_approval", label: "Auto Approval", type: "boolean" },
  { key: "negative_balance_allowed", label: "Negative Balance Allowed", type: "boolean" },
  { key: "sandwich_rule", label: "Sandwich Rule", type: "boolean" },
  { key: "holiday_inclusion", label: "Holiday Inclusion", type: "boolean" },
  { key: "weekoff_inclusion", label: "Weekoff Inclusion", type: "boolean" },
];

const policySchema: MasterFieldSchema[] = [
  ...baseSchema,
  { key: "accrual_logic", label: "Accrual Logic", type: "select", options: ["MONTHLY", "YEARLY"] },
  { key: "probation_rules", label: "Probation Rules", type: "textarea" },
  { key: "expiry_rules", label: "Expiry Rules", type: "textarea" },
  { key: "monthly_limit", label: "Monthly Limit", type: "number" },
  { key: "yearly_limit", label: "Yearly Limit", type: "number" },
  { key: "department", label: "Department", type: "text" },
  { key: "role", label: "Role", type: "text" },
  { key: "auto_approval_rules", label: "Auto Approval Rules", type: "textarea" },
];

const workflowSchema: MasterFieldSchema[] = [
  ...baseSchema,
  { key: "approval_levels", label: "Approval Levels", type: "number" },
  { key: "manager_approval_required", label: "Manager Approval Required", type: "boolean" },
  { key: "hr_approval_required", label: "HR Approval Required", type: "boolean" },
  { key: "escalation_after_hours", label: "Escalation After Hours", type: "number" },
  { key: "delegation_rules", label: "Delegation Rules", type: "textarea" },
  { key: "sla_rules", label: "SLA Rules", type: "textarea" },
];

export const MASTER_SECTIONS: MasterSectionConfig[] = [
  { key: "general", label: "General Settings", description: "Core enterprise system defaults.", schema: baseSchema },
  { key: "master-types", label: "Master Types", description: "Manage shared master type definitions.", schema: leaveTypeSchema },
  { key: "policy-configurations", label: "Policy Configurations", description: "Define reusable policy rules.", schema: policySchema },
  { key: "approval-workflows", label: "Approval Workflows", description: "Configure multi-stage approvals.", schema: workflowSchema },
  { key: "escalation-matrix", label: "Escalation Matrix", description: "Set escalation and SLA rules.", schema: workflowSchema },
  { key: "holiday-calendar", label: "Holiday Calendar", description: "Manage holiday and regional calendars.", schema: baseSchema },
  { key: "weekend-configuration", label: "Workweek Configuration", description: "Configure weekend and workweek behavior.", schema: baseSchema },
  { key: "accrual-schedules", label: "Accrual Schedules", description: "Manage schedule and earning rules.", schema: policySchema },
  { key: "encashment-rules", label: "Encashment Rules", description: "Define encashment policies.", schema: policySchema },
  { key: "notification-templates", label: "Notification Templates", description: "Manage notification content and triggers.", schema: baseSchema },
  { key: "request-module-settings", label: "Request Module Settings", description: "Configure request module controls.", schema: baseSchema },
  { key: "feature-flags", label: "Feature Flags", description: "Enable or disable platform features.", schema: baseSchema },
  { key: "audit-logs", label: "Audit Logs", description: "Review configuration change history.", schema: baseSchema },
  { key: "system-settings", label: "System Settings", description: "Manage global system controls.", schema: baseSchema },
];

export const MASTER_CATEGORY_GROUPS: MasterCategoryGroup[] = [
  {
    key: "organization",
    label: "Organization Masters",
    sectionKeys: ["general", "notification-templates", "system-settings"],
  },
  {
    key: "employment",
    label: "Employment Masters",
    sectionKeys: ["master-types", "policy-configurations", "request-module-settings", "feature-flags"],
  },
  {
    key: "attendance",
    label: "Attendance & Leave Masters",
    sectionKeys: ["approval-workflows", "escalation-matrix", "holiday-calendar", "weekend-configuration"],
  },
  {
    key: "payroll",
    label: "Payroll & Compliance Masters",
    sectionKeys: ["accrual-schedules", "encashment-rules"],
  },
  {
    key: "workflow",
    label: "Workflow & Notification Masters",
    sectionKeys: ["notification-templates", "approval-workflows", "feature-flags"],
  },
  {
    key: "security",
    label: "Security & Audit Masters",
    sectionKeys: ["audit-logs", "system-settings"],
  },
];

function initialState(): Record<MasterSectionKey, MasterRecord[]> {
  return MASTER_SECTIONS.reduce(
    (acc, section, idx) => {
      acc[section.key] = [
        {
          id: `${section.key}-default-1`,
          name: `${section.label} Default`,
          code: `CFG-${idx + 1}`,
          is_active: true,
          archived_at: null,
          updated_at: new Date().toISOString(),
          config: { custom_fields_json: "{}", is_active: true },
        },
      ];
      return acc;
    },
    {} as Record<MasterSectionKey, MasterRecord[]>,
  );
}

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY) ?? localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (!raw) return initialState();
    return JSON.parse(raw) as Record<MasterSectionKey, MasterRecord[]>;
  } catch {
    return initialState();
  }
}

function writeSettings(data: Record<MasterSectionKey, MasterRecord[]>) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

function readAudit() {
  try {
    const raw = localStorage.getItem(SETTINGS_AUDIT_KEY) ?? localStorage.getItem(LEGACY_SETTINGS_AUDIT_KEY);
    if (!raw) return [] as MasterAuditEvent[];
    return JSON.parse(raw) as MasterAuditEvent[];
  } catch {
    return [] as MasterAuditEvent[];
  }
}

function writeAudit(logs: MasterAuditEvent[]) {
  localStorage.setItem(SETTINGS_AUDIT_KEY, JSON.stringify(logs));
}

export function useMasterManagementStore() {
  const [data, setData] = useState<Record<MasterSectionKey, MasterRecord[]>>(() => readSettings());
  const [audit, setAudit] = useState<MasterAuditEvent[]>(() => readAudit());

  useEffect(() => {
    writeSettings(data);
  }, [data]);

  useEffect(() => {
    writeAudit(audit);
  }, [audit]);

  const addAudit = useCallback(
    (entry: Omit<MasterAuditEvent, "id" | "at">) => {
      setAudit((prev) => [
        { id: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`, at: new Date().toISOString(), ...entry },
        ...prev,
      ]);
    },
    [],
  );

  const upsert = useCallback(
    (section: MasterSectionKey, payload: MasterRecord, actor: string, isCreate: boolean) => {
      setData((prev) => {
        const existing = prev[section] ?? [];
        const index = existing.findIndex((r) => r.id === payload.id);
        const next = [...existing];
        if (index >= 0) {
          const old = next[index];
          next[index] = { ...payload, updated_at: new Date().toISOString() };
          addAudit({
            section,
            actor,
            action: "UPDATE",
            target_id: payload.id,
            previous_value: JSON.stringify(old),
            new_value: JSON.stringify(next[index]),
          });
        } else {
          next.unshift({ ...payload, updated_at: new Date().toISOString(), archived_at: null });
          addAudit({
            section,
            actor,
            action: isCreate ? "CREATE" : "UPDATE",
            target_id: payload.id,
            new_value: JSON.stringify(payload),
          });
        }
        return { ...prev, [section]: next };
      });
    },
    [addAudit],
  );

  const setActive = useCallback(
    (section: MasterSectionKey, id: string, active: boolean, actor: string) => {
      setData((prev) => ({
        ...prev,
        [section]: (prev[section] ?? []).map((r) =>
          r.id === id ? { ...r, is_active: active, updated_at: new Date().toISOString() } : r,
        ),
      }));
      addAudit({ section, actor, action: active ? "ACTIVATE" : "DEACTIVATE", target_id: id });
    },
    [addAudit],
  );

  const archive = useCallback(
    (section: MasterSectionKey, id: string, actor: string) => {
      setData((prev) => ({
        ...prev,
        [section]: (prev[section] ?? []).map((r) =>
          r.id === id ? { ...r, archived_at: new Date().toISOString(), is_active: false } : r,
        ),
      }));
      addAudit({ section, actor, action: "ARCHIVE", target_id: id });
    },
    [addAudit],
  );

  const restore = useCallback(
    (section: MasterSectionKey, id: string, actor: string) => {
      setData((prev) => ({
        ...prev,
        [section]: (prev[section] ?? []).map((r) => (r.id === id ? { ...r, archived_at: null } : r)),
      }));
      addAudit({ section, actor, action: "RESTORE", target_id: id });
    },
    [addAudit],
  );

  const remove = useCallback(
    (section: MasterSectionKey, id: string, actor: string) => {
      setData((prev) => ({ ...prev, [section]: (prev[section] ?? []).filter((r) => r.id !== id) }));
      addAudit({ section, actor, action: "DELETE", target_id: id });
    },
    [addAudit],
  );

  const clone = useCallback(
    (section: MasterSectionKey, id: string, actor: string) => {
      setData((prev) => {
        const found = (prev[section] ?? []).find((r) => r.id === id);
        if (!found) return prev;
        const copy: MasterRecord = {
          ...found,
          id: `${found.id}-clone-${Date.now()}`,
          name: `${found.name} Copy`,
          code: `${found.code}-COPY`,
          updated_at: new Date().toISOString(),
        };
        addAudit({ section, actor, action: "CLONE", target_id: copy.id, new_value: JSON.stringify(copy) });
        return { ...prev, [section]: [copy, ...(prev[section] ?? [])] };
      });
    },
    [addAudit],
  );

  const reset = useCallback(() => {
    setData(initialState());
  }, []);

  return useMemo(
    () => ({ data, audit, upsert, setActive, archive, restore, remove, clone, reset }),
    [archive, audit, clone, data, remove, reset, restore, setActive, upsert],
  );
}
