import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  Mail,
  MapPin,
  Calendar,
  Info,
  Users,
  X,
} from "lucide-react";
import { Employee, normalizeLegacyEmployee } from "./mockData";
import { useDispatch } from "react-redux";
import { setAdminEmployees } from "@/store/slices/adminSlice";
import {
  useEmployeeDirectoryList,
  useOrganizationDepartments,
  useOrganizationDesignations,
  useOrganizationTeams,
  type MasterOption,
  type EmployeeDirectoryItem,
} from "@hooks/useEmployees";

type ViewMode = "card" | "list";

interface DirectoryFilters {
  search: string;
  department: string;
  team: string;
  designation: string;
  statusFilter: string;
  joiningFrom: string;
  joiningTo: string;
}

function StatusBadge({ status }: { status: Employee["status"] }) {
  const styles = {
    Active:     "bg-[#212529] text-[#F8F9FA]",
    Inactive:   "bg-[#CED4DA] text-[#212529]",
    "On Leave": "bg-[#6C757D] text-white",
  };
  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function EmployeeAvatar({ employee, size = "md" }: { employee: Employee; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" };
  if (employee.avatar) {
    return (
      <img
        src={employee.avatar}
        alt={employee.name}
        className={`${sizes[size]} rounded-lg object-cover flex-shrink-0 border border-border`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} rounded-lg flex items-center justify-center text-white flex-shrink-0 border border-border font-bold`}
      style={{ backgroundColor: employee.avatarColor }}
    >
      {employee.initials}
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const isActive = value !== "";
  
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flat-input appearance-none pl-3 pr-8 py-2 text-sm cursor-pointer font-medium
          transition-all duration-150 min-w-[130px]
          ${isActive 
            ? 'bg-secondary border border-foreground/30 text-foreground shadow-sm' 
            : 'hover:border-border/80 focus:border-foreground/50 focus:shadow-sm'
          }
          hover:bg-secondary/50 focus:outline-none`}
      >
        <option value="">
          {placeholder.startsWith("All") ? placeholder : `All ${placeholder.split(" ").slice(1).join(" ") || "Options"}`}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors ${
        isActive 
          ? 'text-foreground' 
          : 'text-muted-foreground group-hover:text-foreground/70'
      }`} />
    </div>
  );
}

import { useEmployee } from "../../context/EmployeeContext";

function optionLabel(item: MasterOption) {
  return item.name ?? item.title ?? item.label ?? item.code ?? String(item.id);
}

function masterOptions(items: MasterOption[]) {
  return items.map((item) => ({ value: String(item.id), label: optionLabel(item) }));
}

function teamOptions(items: MasterOption[]) {
  return items.map((item) => ({ value: String(item.id), label: optionLabel(item) }));
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "E") + (parts[1]?.[0] ?? "");
}

function employeeStatus(status: string): Employee["status"] {
  const normalized = status.toUpperCase();
  if (normalized === "ACTIVE") return "Active";
  if (normalized === "ON_NOTICE") return "On Leave";
  return "Inactive";
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeDateValue(value: string | null | undefined) {
  const raw = value?.trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

function isWithinDateRange(value: string, from: string, to: string) {
  const date = normalizeDateValue(value);
  const normalizedFrom = normalizeDateValue(from);
  const normalizedTo = normalizeDateValue(to);
  const start = normalizedFrom || normalizedTo;
  const end = normalizedTo || normalizedFrom;
  if (!date) return false;
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

function toDirectoryEmployee(item: EmployeeDirectoryItem): Employee {
  return normalizeLegacyEmployee({
    id: String(item.id),
    name: item.full_name || [item.first_name, item.middle_name, item.last_name].filter(Boolean).join(" "),
    firstName: item.first_name,
    middleName: item.middle_name,
    lastName: item.last_name,
    employeeId: item.employee_code,
    designation: item.designation || "",
    designationId: item.designation_id || "",
    department: item.department || "",
    departmentId: item.department_id || "",
    team: item.team || "",
    teamId: item.team_id || "",
    email: item.work_email || "",
    phone: item.phone || "",
    joiningDate: item.date_of_joining || "",
    location: item.location || "",
    status: employeeStatus(item.status || item.status_display || ""),
    avatar: item.profile_photo || undefined,
    initials: initials(item.full_name || item.employee_code),
    avatarColor: "#334155",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    bloodGroup: "",
    nationality: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    pfNumber: "",
    esiNumber: "",
    family: [],
    passportNumber: "",
    passportExpiry: "",
    visaType: "",
    visaExpiry: "",
    visaCountry: "",
    positionHistory: [],
    basicSalary: 0,
    hra: 0,
    conveyance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    grossSalary: 0,
    pf: 0,
    tds: 0,
    netSalary: 0,
  });
}

function formatJoiningDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function EmployeeDirectory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectEmployee } = useEmployee();
  const dispatch = useDispatch();

  const [filters, setFilters] = useState<DirectoryFilters>({
    search:      searchParams.get("search")      || "",
    department:  searchParams.get("department")  || "",
    team:        searchParams.get("team")        || "",
    designation: searchParams.get("designation") || "",
    statusFilter: searchParams.get("status") || "active",
    joiningFrom: normalizeDateValue(searchParams.get("joiningFrom")) || "",
    joiningTo: normalizeDateValue(searchParams.get("joiningTo")) || "",
  });
  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get("view") as ViewMode) || "card");
  const { data: apiEmployees = [], isLoading, isError } = useEmployeeDirectoryList({
    search: filters.search,
    departmentId: filters.department,
    teamId: filters.team,
    designationId: filters.designation,
    status: filters.statusFilter,
    joiningFrom: filters.joiningFrom,
    joiningTo: filters.joiningTo,
  });
  const { data: departments = [] } = useOrganizationDepartments();
  const { data: teams = [] } = useOrganizationTeams();
  const { data: designations = [] } = useOrganizationDesignations();
  const mappedEmployees = useMemo(() => apiEmployees.map(toDirectoryEmployee), [apiEmployees]);
  const employees = mappedEmployees;

  useEffect(() => {
    if (mappedEmployees.length) {
      dispatch(setAdminEmployees(mappedEmployees));
    }
  }, [dispatch, mappedEmployees]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search)      params.search      = filters.search;
    if (filters.department)  params.department  = filters.department;
    if (filters.team)        params.team        = filters.team;
    if (filters.designation) params.designation = filters.designation;
    if (filters.statusFilter && filters.statusFilter !== 'active') params.status = filters.statusFilter;
    if (filters.joiningFrom) params.joiningFrom = filters.joiningFrom;
    if (filters.joiningTo) params.joiningTo = filters.joiningTo;
    if (viewMode !== "card") params.view        = viewMode;
    setSearchParams(params, { replace: true });
  }, [filters, viewMode]);

  const updateFilter = (key: keyof DirectoryFilters, value: string) =>
    setFilters((prev) => {
      const next = { ...prev, [key]: normalizeDateValue(value) || value };
      if (key === "joiningFrom" && next.joiningTo && next.joiningFrom > next.joiningTo) {
        next.joiningTo = "";
      }
      if (key === "joiningTo" && next.joiningFrom && next.joiningTo < next.joiningFrom) {
        next.joiningFrom = "";
      }
      return next;
    });

  const filtered = employees.filter((emp) => {
    const s = normalizeText(filters.search);

    // Status filtering: default show Active only
    if (filters.statusFilter === 'inactive_resigned') {
      if (!(emp.status === 'Inactive' || (emp as any).status === 'Resigned')) return false;
    } else {
      if (emp.status !== 'Active') return false;
    }

    // Search and dropdown filters
    if (s) {
      const searchable = normalizeText([
        emp.name,
        emp.employeeId,
        emp.email,
        emp.designation,
        emp.department,
        emp.team,
      ].join(" "));
      if (!searchable.includes(s)) return false;
    }
    if (filters.department && (emp as any).departmentId !== filters.department) return false;
    if (filters.team && (emp as any).teamId !== filters.team) return false;
    if (filters.designation && (emp as any).designationId !== filters.designation) return false;

    // Joining date range filters
    if ((filters.joiningFrom || filters.joiningTo) && !isWithinDateRange(emp.joiningDate, filters.joiningFrom, filters.joiningTo)) return false;

    return true;
  });

  const clearFilters = () =>
    setFilters({ search: "", department: "", team: "", designation: "", statusFilter: 'active', joiningFrom: "", joiningTo: "" });

  const hasActiveFilters = Boolean(
    filters.search || filters.department || filters.team || filters.designation ||
    filters.statusFilter !== 'active' || filters.joiningFrom || filters.joiningTo
  );

  const openInformation = (emp: Employee) => {
    selectEmployee(emp.id);
    navigate(`/admin/employees/information/${emp.id}`);
  };

  return (
    <div className="flex flex-col h-full bg-background dark:bg-background">

      {/* ── Controls ────────────────────────────────────── */}
      <div className="bg-card dark:bg-card border-b border-border dark:border-border px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        {/* Search + View Toggle + Filters (all in one row) */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
          {/* Search Box - Left side */}
          <div className="relative flex-1 max-w-lg lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
            <input
              type="text"
              placeholder="          Search employees…"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="flat-input dark:bg-slate-900 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-400 w-full pl-12 pr-4 py-2.5 text-sm font-medium transition-all focus:shadow-md dark:focus:shadow-md"
            />
          </div>

          {/* Filters + View Toggle - Right side (single line) */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 lg:gap-2.5 lg:ml-auto">
            {/* Compact Filter Dropdowns */}
            <div className="flex items-center gap-1.5 flex-wrap lg:flex-nowrap w-full lg:w-auto">
              <SelectFilter 
                value={filters.department}  
                onChange={(v) => updateFilter("department", v)}  
                options={masterOptions(departments)}
                placeholder="All Departments" 
              />
              <SelectFilter 
                value={filters.team}        
                onChange={(v) => updateFilter("team", v)}        
                options={teamOptions(teams)}
                placeholder="All Teams" 
              />
              <SelectFilter 
                value={filters.designation} 
                onChange={(v) => updateFilter("designation", v)} 
                options={masterOptions(designations)}
                placeholder="All Designations" 
              />
              <div className="relative">
                <select
                  value={filters.statusFilter}
                  onChange={(e) => updateFilter('statusFilter', e.target.value)}
                  className={`flat-input appearance-none pl-3 pr-8 py-2 text-sm cursor-pointer font-medium transition-all duration-150 min-w-[170px] ${filters.statusFilter !== 'active' ? 'bg-secondary border border-foreground/30 text-foreground shadow-sm' : 'hover:border-border/80 focus:border-foreground/50 focus:shadow-sm'}`}>
                  <option value="active">Active Employees</option>
                  <option value="inactive_resigned">Inactive/Resigned Employees</option>
                </select>
                <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors ${filters.statusFilter !== 'active' ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/70'}`} />
              </div>
              </div>

            {/* Date range filters placed after status filter (DOM order), pushed to extreme right */}
            <div className="ml-auto flex items-center gap-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">From</div>
              <input
                type="date"
                value={filters.joiningFrom}
                onChange={(e) => updateFilter('joiningFrom', e.target.value)}
                className="flat-input px-3 py-2 text-sm min-w-[140px]"
              />
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To</div>
              <input
                type="date"
                value={filters.joiningTo}
                onChange={(e) => updateFilter('joiningTo', e.target.value)}
                className="flat-input px-3 py-2 text-sm min-w-[140px]"
              />
            </div>

            {/* Divider on large screens */}
            <div className="hidden lg:block w-px h-6 bg-border/40 mx-0.5"></div>

            {/* View Toggle */}
            <div className="flex items-center gap-1.5 bg-secondary border border-border rounded-lg p-1">
              {(["card", "list"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`p-2 rounded-md transition-all duration-150 ${
                    viewMode === m
                      ? "bg-card border border-border text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                  title={m === "card" ? "Card view" : "List view"}
                >
                  {m === "card" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground
                  px-2.5 py-1.5 rounded-lg bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/40 
                  transition-all duration-150 lg:ml-1"
                title="Clear all active filters"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            
          </div>
        </div>
      </div>

      {/* ── Results header ───────────────────────────────── */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b border-border bg-background/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">
            <span className="font-bold text-foreground">{isLoading ? "..." : filtered.length}</span>
            <span className="hidden sm:inline">
              {" "}of <span className="font-bold text-foreground">{employees.length}</span> employees
            </span>
          </span>
          {hasActiveFilters && (
            <span className="text-[10px] font-bold text-primary-foreground bg-foreground px-2.5 py-1 rounded-md uppercase tracking-wider">
              ✓ Active
            </span>
          )}
        </div>
      </div>

      {/* ── Employee grid / table ────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 pt-4 sm:pt-5">
        {isLoading ? (
          <div className="flex h-56 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold text-muted-foreground">
            Loading employees...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-56 bg-secondary/30 border border-dashed border-border rounded-xl">
            <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-muted-foreground opacity-60" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Employee API did not return data</p>
            <p className="text-xs text-muted-foreground mt-1 text-center max-w-md">
              Check that Django is running and the frontend /api proxy is reaching the tenant backend.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 bg-secondary/30 border border-dashed border-border rounded-xl">
            <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-muted-foreground opacity-60" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">No employees found</p>
            <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
              Try adjusting your search or filter criteria
            </p>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters} 
                className="mt-4 text-xs font-semibold text-foreground hover:text-accent px-3 py-1.5 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-all"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((emp) => (
              <div
                key={emp.id}
                className="flat-card flat-card-hover bg-card p-5 cursor-pointer group transition-all duration-150"
                onClick={() => openInformation(emp)}
              >
                <div className="flex items-start justify-between mb-4">
                  <EmployeeAvatar employee={emp} size="lg" />
                  <StatusBadge status={emp.status} />
                </div>
                <h3 className="text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">{emp.name}</h3>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5 truncate">{emp.designation}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{emp.department} · {emp.team}</p>

                <div className="mt-4 pt-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{emp.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">Joined {formatJoiningDate(emp.joiningDate)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-foreground bg-secondary border border-border rounded-md group-hover:bg-foreground group-hover:text-background transition-all">
                    <Info className="w-3.5 h-3.5" /> View Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flat-card bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    {["Employee", "Department", "Designation", "Location", "Joining Date", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-4 sm:px-5 py-3 text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-secondary/40 cursor-pointer transition-colors duration-150 group"
                      onClick={() => openInformation(emp)}
                    >
                      <td className="px-4 sm:px-5 py-4">
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar employee={emp} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <p className="text-sm text-foreground font-medium">{emp.department}</p>
                        <p className="text-xs text-muted-foreground">{emp.team}</p>
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-sm text-foreground font-medium">{emp.designation}</td>
                      <td className="px-4 sm:px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{emp.location}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {formatJoiningDate(emp.joiningDate)}
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <StatusBadge status={emp.status} />
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-right">
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-secondary hover:bg-foreground hover:text-background
                          border border-border px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all ml-auto">
                          <Info className="w-3.5 h-3.5" /> Info
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
