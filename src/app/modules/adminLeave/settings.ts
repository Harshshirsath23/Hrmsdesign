import { useCallback, useEffect, useMemo, useState } from "react";

/** Allowed DynamicField types for Leave Settings (strict contract). */
export type SettingsFieldType = "text" | "number" | "textarea" | "boolean" | "select" | "color";

export interface SettingsFieldSchema {
  key: string;
  label: string;
  type: SettingsFieldType;
  options?: string[];
}

export type LeaveSettingsSectionKey =
  | "general"
  | "feature-flags"
  | "audit-logs"
  | "system-settings"
  | "leave-types"
  | "leave-policies"
  | "approval-workflows"
  | "escalation-matrix"
  | "holidays"
  | "weekend-configuration"
  | "accrual-schedules"
  | "encashment-rules"
  | "notification-templates"
  | "request-module-settings";

export interface LeaveSettingsSectionConfig {
  key: LeaveSettingsSectionKey;
  label: string;
  description: string;
  schema: SettingsFieldSchema[];
}

export interface LeaveSettingsRecord {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  archived_at: string | null;
  updated_at: string;
  config: Record<string, unknown>;
}

export interface LeaveSettingsAuditEvent {
  id: string;
  section: LeaveSettingsSectionKey;
  at: string;
  actor: string;
  action: "CREATE" | "UPDATE" | "ARCHIVE" | "RESTORE" | "ACTIVATE" | "DEACTIVATE" | "CLONE";
  target_id: string;
  previous_value?: string;
  new_value?: string;
}

const STORAGE_KEY = "hrms-admin-leave-settings-v1";
const AUDIT_KEY = "hrms-admin-leave-settings-audit-v1";

const HIDDEN_IN_MASTER_MANAGEMENT = new Set<LeaveSettingsSectionKey>([
  "general",
  "feature-flags",
  "audit-logs",
  "system-settings",
]);

export function getSettingsSectionsForContext(mode: "standalone" | "master-management"): LeaveSettingsSectionConfig[] {
  if (mode === "master-management") {
    return SETTINGS_SECTIONS.filter((s) => !HIDDEN_IN_MASTER_MANAGEMENT.has(s.key));
  }
  return SETTINGS_SECTIONS;
}

export function resolveSectionKeyForContext(
  key: string | undefined,
  mode: "standalone" | "master-management",
): LeaveSettingsSectionKey {
  const sections = getSettingsSectionsForContext(mode);
  const allowed = new Set(sections.map((s) => s.key));
  if (key && allowed.has(key as LeaveSettingsSectionKey)) return key as LeaveSettingsSectionKey;
  return sections[0]?.key ?? "leave-types";
}

const BASE_IDENTITY: SettingsFieldSchema[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "code", label: "Code", type: "text" },
  { key: "is_active", label: "Active", type: "boolean" },
];

const leaveTypesSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "display_color", label: "Display Color", type: "color" },
  { key: "is_paid", label: "Paid Leave", type: "boolean" },
  { key: "carry_forward", label: "Carry Forward", type: "boolean" },
  { key: "encashment_allowed", label: "Encashment Allowed", type: "boolean" },
  {
    key: "gender_restriction",
    label: "Gender Restriction",
    type: "select",
    options: ["ALL", "MALE", "FEMALE", "OTHER"],
  },
  { key: "maximum_days", label: "Maximum Days (per application)", type: "number" },
  { key: "minimum_days", label: "Minimum Days (per application)", type: "number" },
  { key: "requires_attachment", label: "Requires Attachment", type: "boolean" },
  { key: "requires_approval", label: "Requires Approval", type: "boolean" },
  { key: "auto_approval", label: "Auto Approval", type: "boolean" },
  { key: "negative_balance_allowed", label: "Negative Balance Allowed", type: "boolean" },
  { key: "sandwich_rule", label: "Sandwich Rule Applies", type: "boolean" },
  { key: "holiday_inclusion", label: "Count Holidays as Leave", type: "boolean" },
  { key: "weekoff_inclusion", label: "Count Weekends as Leave", type: "boolean" },
  { key: "description", label: "Description", type: "textarea" },
];

const leavePoliciesSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  {
    key: "accrual_logic",
    label: "Accrual Logic",
    type: "select",
    options: ["MONTHLY", "QUARTERLY", "YEARLY", "PRORATED", "NONE"],
  },
  { key: "probation_rules", label: "Probation Rules", type: "textarea" },
  { key: "expiry_rules", label: "Expiry / Lapse Rules", type: "textarea" },
  { key: "monthly_limit", label: "Monthly Limit (days)", type: "number" },
  { key: "yearly_limit", label: "Yearly Limit (days)", type: "number" },
  { key: "department_scope", label: "Department Scope (codes, comma-separated)", type: "textarea" },
  { key: "role_scope", label: "Role Scope (codes, comma-separated)", type: "textarea" },
  { key: "auto_approval_rules", label: "Auto Approval Rules", type: "textarea" },
  { key: "rounding_mode", label: "Rounding Mode", type: "select", options: ["NONE", "HALF_DAY", "FULL_DAY", "HOUR"] },
];

const approvalWorkflowSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "approval_levels", label: "Approval Levels", type: "number" },
  { key: "manager_approval_required", label: "Manager Approval Required", type: "boolean" },
  { key: "hr_approval_required", label: "HR Approval Required", type: "boolean" },
  { key: "escalation_after_hours", label: "Escalation After (hours)", type: "number" },
  { key: "delegation_rules", label: "Delegation Rules", type: "textarea" },
  { key: "sla_rules", label: "SLA Rules", type: "textarea" },
  { key: "skip_weekends_in_sla", label: "Exclude Weekends from SLA", type: "boolean" },
];

const escalationMatrixSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "escalation_tier", label: "Escalation Tier", type: "number" },
  { key: "trigger_after_hours", label: "Trigger After (hours)", type: "number" },
  { key: "notify_channels", label: "Notify Channels (comma labels)", type: "textarea" },
  { key: "escalate_to_role", label: "Escalate To Role", type: "select", options: ["MANAGER", "HRBP", "HR_HEAD", "ADMIN"] },
  { key: "repeat_interval_hours", label: "Repeat Interval (hours)", type: "number" },
  { key: "max_escalations", label: "Max Escalations", type: "number" },
  { key: "notes", label: "Notes", type: "textarea" },
];

const holidaysSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "holiday_date", label: "Holiday Date (YYYY-MM-DD)", type: "text" },
  { key: "region_code", label: "Region Code", type: "text" },
  { key: "calendar_code", label: "Calendar Code", type: "text" },
  { key: "is_optional", label: "Optional Holiday", type: "boolean" },
  { key: "is_restricted", label: "Restricted Holiday", type: "boolean" },
  { key: "description", label: "Description", type: "textarea" },
];

const weekendConfigurationSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  {
    key: "week_start_day",
    label: "Week Starts On",
    type: "select",
    options: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
  },
  {
    key: "weekend_days",
    label: "Weekend Days (e.g. SAT,SUN)",
    type: "text",
  },
  { key: "half_day_on_weekend", label: "Allow Half Day on Weekend Edge", type: "boolean" },
  { key: "alternate_weekend_policy", label: "Alternate Weekend Policy", type: "boolean" },
  { key: "policy_notes", label: "Policy Notes", type: "textarea" },
];

const accrualSchedulesSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "frequency", label: "Run Frequency", type: "select", options: ["MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"] },
  { key: "run_day_of_month", label: "Run Day Of Month (1-28)", type: "number" },
  { key: "prorate_on_join", label: "Prorate On Join", type: "boolean" },
  { key: "prorate_on_exit", label: "Prorate On Exit", type: "boolean" },
  { key: "accrual_amount_days", label: "Accrual Amount (days)", type: "number" },
  { key: "max_balance_cap", label: "Max Balance Cap (days)", type: "number" },
  { key: "schedule_notes", label: "Schedule Notes", type: "textarea" },
];

const encashmentRulesSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "min_balance_to_encash", label: "Minimum Balance To Encash (days)", type: "number" },
  { key: "max_encash_days", label: "Maximum Encashable Days", type: "number" },
  { key: "tax_treatment", label: "Tax Treatment", type: "select", options: ["TAXABLE", "EXEMPT", "MIXED"] },
  { key: "payroll_component_code", label: "Payroll Component Code", type: "text" },
  { key: "window_start_month", label: "Encashment Window Start (month 1-12)", type: "number" },
  { key: "window_end_month", label: "Encashment Window End (month 1-12)", type: "number" },
  { key: "rules_notes", label: "Rules Notes", type: "textarea" },
];

const notificationTemplatesSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "channel", label: "Channel", type: "select", options: ["EMAIL", "SMS", "PUSH", "IN_APP"] },
  { key: "subject_template", label: "Subject Template", type: "text" },
  { key: "body_template", label: "Body Template", type: "textarea" },
  { key: "locale", label: "Locale", type: "select", options: ["en", "en-IN", "hi-IN"] },
  { key: "is_mandatory", label: "Mandatory Notification", type: "boolean" },
];

const requestModuleSettingsSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "allow_future_dated", label: "Allow Future Dated Requests", type: "boolean" },
  { key: "max_future_booking_days", label: "Max Future Booking (days)", type: "number" },
  { key: "allow_backdated", label: "Allow Backdated Requests", type: "boolean" },
  { key: "max_backdate_days", label: "Max Backdate (days)", type: "number" },
  { key: "require_reason_min_length", label: "Minimum Reason Length", type: "number" },
  { key: "attachment_mandatory_above_days", label: "Attachment Mandatory Above (days)", type: "number" },
  { key: "module_notes", label: "Module Notes", type: "textarea" },
];

const generalSettingsSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "default_company_code", label: "Default Company Code", type: "text" },
  {
    key: "leave_year_type",
    label: "Leave Year Type",
    type: "select",
    options: ["CALENDAR", "FINANCIAL", "JOINING_BASED"],
  },
  { key: "default_workweek_profile_code", label: "Default Workweek Profile Code", type: "text" },
  { key: "grace_period_minutes", label: "Apply Grace Period (minutes)", type: "number" },
  { key: "enable_negative_display", label: "Show Negative Balance In UI", type: "boolean" },
  { key: "general_notes", label: "General Notes", type: "textarea" },
];

const featureFlagsSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "flag_key", label: "Flag Key", type: "text" },
  { key: "enabled", label: "Enabled", type: "boolean" },
  { key: "rollout_percentage", label: "Rollout % (0-100)", type: "number" },
  { key: "description", label: "Description", type: "textarea" },
];

const auditLogsSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "retention_days", label: "Retention (days)", type: "number" },
  { key: "export_enabled", label: "Export Enabled", type: "boolean" },
  { key: "pii_masking", label: "PII Masking In UI", type: "boolean" },
  { key: "notes", label: "Notes", type: "textarea" },
];

const systemSettingsSchema: SettingsFieldSchema[] = [
  ...BASE_IDENTITY,
  { key: "maintenance_window_cron", label: "Maintenance Window (cron hint)", type: "text" },
  { key: "max_bulk_import_rows", label: "Max Bulk Import Rows", type: "number" },
  { key: "api_rate_limit_per_minute", label: "API Rate Limit / Minute", type: "number" },
  { key: "strict_mode", label: "Strict Validation Mode", type: "boolean" },
  { key: "system_notes", label: "System Notes", type: "textarea" },
];

export const SETTINGS_SECTIONS: LeaveSettingsSectionConfig[] = [
  {
    key: "general",
    label: "General Settings",
    description: "Core defaults for leave configuration in this tenant.",
    schema: generalSettingsSchema,
  },
  {
    key: "leave-types",
    label: "Leave Types",
    description: "Define leave categories, eligibility behavior, and accounting flags.",
    schema: leaveTypesSchema,
  },
  {
    key: "leave-policies",
    label: "Leave Policies",
    description: "Accrual, limits, and eligibility policies applied to employees.",
    schema: leavePoliciesSchema,
  },
  {
    key: "approval-workflows",
    label: "Approval Workflows",
    description: "Multi-stage approvals, SLAs, and delegation for leave requests.",
    schema: approvalWorkflowSchema,
  },
  {
    key: "escalation-matrix",
    label: "Escalation Matrix",
    description: "Time-based escalation paths when approvals stall.",
    schema: escalationMatrixSchema,
  },
  {
    key: "holidays",
    label: "Holidays",
    description: "Holiday master rows linked to calendars and regions.",
    schema: holidaysSchema,
  },
  {
    key: "weekend-configuration",
    label: "Weekend Configuration",
    description: "Workweek boundaries and weekend treatment for leave accounting.",
    schema: weekendConfigurationSchema,
  },
  {
    key: "accrual-schedules",
    label: "Accrual Schedules",
    description: "Scheduled jobs and parameters for earning leave balances.",
    schema: accrualSchedulesSchema,
  },
  {
    key: "encashment-rules",
    label: "Encashment Rules",
    description: "When and how balances convert to payroll components.",
    schema: encashmentRulesSchema,
  },
  {
    key: "notification-templates",
    label: "Notification Templates",
    description: "Channel-specific templates for leave lifecycle events.",
    schema: notificationTemplatesSchema,
  },
  {
    key: "request-module-settings",
    label: "Request Module Settings",
    description: "Controls for submission, backdating, and validation in the request module.",
    schema: requestModuleSettingsSchema,
  },
  {
    key: "feature-flags",
    label: "Feature Flags",
    description: "Toggle experimental or phased leave features.",
    schema: featureFlagsSchema,
  },
  {
    key: "audit-logs",
    label: "Audit Logs",
    description: "Configuration for how leave audit trails are retained and displayed.",
    schema: auditLogsSchema,
  },
  {
    key: "system-settings",
    label: "System Settings",
    description: "Operational limits and safeguards for the leave engine.",
    schema: systemSettingsSchema,
  },
];

export function defaultValueForField(field: SettingsFieldSchema): unknown {
  if (field.key === "is_active") return true;
  if (field.type === "boolean") return false;
  if (field.type === "number") return 0;
  return "";
}

/** Defaults for a new editor draft (all schema keys including name/code/is_active). */
export function buildNewDraftDefaultsFromSchema(schema: SettingsFieldSchema[]): Record<string, unknown> {
  return Object.fromEntries(schema.map((f) => [f.key, defaultValueForField(f)]));
}

function buildConfigFromSchema(schema: SettingsFieldSchema[]): Record<string, unknown> {
  return Object.fromEntries(schema.map((f) => [f.key, defaultValueForField(f)]));
}

function initialRows(): Record<LeaveSettingsSectionKey, LeaveSettingsRecord[]> {
  const ts = new Date().toISOString();
  const row = (section: LeaveSettingsSectionConfig, idx: number): LeaveSettingsRecord => {
    const code = `${section.key.toUpperCase().replace(/-/g, "_")}_${idx + 1}`;
    const full = buildConfigFromSchema(section.schema);
    const name = String(full.name ?? `${section.label} Sample`);
    const codeVal = String(full.code ?? code);
    const isActive = Boolean(full.is_active ?? true);
    const config = Object.fromEntries(
      Object.entries(full).filter(([k]) => !["name", "code", "is_active"].includes(k)),
    );
    return {
      id: `${section.key}-seed-${idx + 1}`,
      name: name || `${section.label} Sample`,
      code: codeVal || code,
      is_active: isActive,
      archived_at: null,
      updated_at: ts,
      config,
    };
  };

  return SETTINGS_SECTIONS.reduce(
    (acc, section, i) => {
      acc[section.key] = [row(section, i)];
      return acc;
    },
    {} as Record<LeaveSettingsSectionKey, LeaveSettingsRecord[]>,
  );
}

function readData(): Record<LeaveSettingsSectionKey, LeaveSettingsRecord[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialRows();
    const parsed = JSON.parse(raw) as Record<string, LeaveSettingsRecord[]>;
    const next = { ...initialRows() };
    for (const section of SETTINGS_SECTIONS) {
      const rows = parsed[section.key];
      if (Array.isArray(rows) && rows.length) {
        next[section.key] = rows.map((r) => ({
          ...r,
          config: typeof r.config === "object" && r.config !== null ? r.config : {},
        }));
      }
    }
    return next;
  } catch {
    return initialRows();
  }
}

function writeData(data: Record<LeaveSettingsSectionKey, LeaveSettingsRecord[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function readAudit(): LeaveSettingsAuditEvent[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaveSettingsAuditEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAudit(logs: LeaveSettingsAuditEvent[]) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
}

export function useLeaveSettingsStore() {
  const [data, setData] = useState<Record<LeaveSettingsSectionKey, LeaveSettingsRecord[]>>(() => readData());
  const [audit, setAudit] = useState<LeaveSettingsAuditEvent[]>(() => readAudit());

  useEffect(() => {
    writeData(data);
  }, [data]);

  useEffect(() => {
    writeAudit(audit);
  }, [audit]);

  const addAudit = useCallback((entry: Omit<LeaveSettingsAuditEvent, "id" | "at">) => {
    setAudit((prev) => [
      {
        id: `audit-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        at: new Date().toISOString(),
        ...entry,
      },
      ...prev,
    ]);
  }, []);

  const upsert = useCallback(
    (section: LeaveSettingsSectionKey, payload: LeaveSettingsRecord, actor: string, isCreate: boolean) => {
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
    (section: LeaveSettingsSectionKey, id: string, active: boolean, actor: string) => {
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
    (section: LeaveSettingsSectionKey, id: string, actor: string) => {
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
    (section: LeaveSettingsSectionKey, id: string, actor: string) => {
      setData((prev) => ({
        ...prev,
        [section]: (prev[section] ?? []).map((r) => (r.id === id ? { ...r, archived_at: null } : r)),
      }));
      addAudit({ section, actor, action: "RESTORE", target_id: id });
    },
    [addAudit],
  );

  const clone = useCallback(
    (section: LeaveSettingsSectionKey, id: string, actor: string) => {
      setData((prev) => {
        const found = (prev[section] ?? []).find((r) => r.id === id);
        if (!found) return prev;
        const copy: LeaveSettingsRecord = {
          ...found,
          id: `${found.id}-clone-${Date.now()}`,
          name: `${found.name} Copy`,
          code: `${found.code}-COPY`,
          updated_at: new Date().toISOString(),
          config: { ...found.config },
        };
        addAudit({ section, actor, action: "CLONE", target_id: copy.id, new_value: JSON.stringify(copy) });
        return { ...prev, [section]: [copy, ...(prev[section] ?? [])] };
      });
    },
    [addAudit],
  );

  return useMemo(
    () => ({ data, audit, upsert, setActive, archive, restore, clone }),
    [archive, audit, clone, data, restore, setActive, upsert],
  );
}
