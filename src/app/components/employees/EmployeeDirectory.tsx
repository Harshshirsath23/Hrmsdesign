import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Info,
  Users,
  X,
} from "lucide-react";
import { departments, teams, designations, Employee } from "./mockData";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type ViewMode = "card" | "list";

interface DirectoryFilters {
  search: string;
  department: string;
  team: string;
  designation: string;
  joiningFrom: string;
  joiningTo: string;
  status: string; // 'active' | 'inactive'
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
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flat-input appearance-none pl-4 pr-9 py-2 text-sm cursor-pointer font-medium"
      >
        {options.map((opt) => (
          <option key={opt} value={opt === placeholder || opt.startsWith("All") ? "" : opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}

import { useEmployee } from "../../context/EmployeeContext";

export function EmployeeDirectory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectEmployee } = useEmployee();
  const employees = useSelector((state: RootState) => state.admin.employees);

  const [filters, setFilters] = useState<DirectoryFilters>({
    search:      searchParams.get("search")      || "",
    department:  searchParams.get("department")  || "",
    team:        searchParams.get("team")        || "",
    designation: searchParams.get("designation") || "",
    joiningFrom: searchParams.get("joiningFrom") || "",
    joiningTo:   searchParams.get("joiningTo")   || "",
    status:      searchParams.get("status") || "active",
  });
  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get("view") as ViewMode) || "card");

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search)      params.search      = filters.search;
    if (filters.department)  params.department  = filters.department;
    if (filters.team)        params.team        = filters.team;
    if (filters.designation) params.designation = filters.designation;
    if (filters.joiningFrom) params.joiningFrom = filters.joiningFrom;
    if (filters.joiningTo)   params.joiningTo = filters.joiningTo;
    if (filters.status && filters.status !== 'active') params.status = filters.status;
    if (viewMode !== "card") params.view        = viewMode;
    setSearchParams(params, { replace: true });
  }, [filters, viewMode]);

  const updateFilter = (key: keyof DirectoryFilters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const filtered = employees.filter((emp) => {
    const s = filters.search.toLowerCase();
    return (
      (!filters.search || emp.name.toLowerCase().includes(s) || emp.employeeId.toLowerCase().includes(s) || emp.email.toLowerCase().includes(s) || emp.designation.toLowerCase().includes(s)) &&
      (!filters.department  || emp.department  === filters.department)  &&
      (!filters.team        || emp.team        === filters.team)        &&
      (!filters.designation || emp.designation === filters.designation) &&
      // Joining date range filter
      (!filters.joiningFrom || !filters.joiningTo || (() => {
        try {
          const jd = new Date(emp.joiningDate);
          const from = new Date(filters.joiningFrom);
          const to = new Date(filters.joiningTo);
          // normalize time
          from.setHours(0,0,0,0);
          to.setHours(23,59,59,999);
          return jd >= from && jd <= to;
        } catch {
          return true;
        }
      })()) &&
      // Status filter: default shows only active employees
      (filters.status === 'active' ? emp.status === 'Active' : (emp.status === 'Inactive' || emp.status === 'Resigned'))
    );
  });

  const clearFilters = () =>
    setFilters({ search: "", department: "", team: "", designation: "", joiningFrom: "", joiningTo: "", status: 'active' });

  const hasActiveFilters = (
    filters.search || filters.department || filters.team || filters.designation || filters.joiningFrom || filters.joiningTo || filters.status !== 'active'
  );

  const openInformation = (emp: Employee) => {
    selectEmployee(emp.id);
    navigate(`/admin/employees/information/${emp.id}`);
  };

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ── Controls ────────────────────────────────────── */}
      <div className="bg-card border-b border-border px-6 py-4 space-y-3 flex-shrink-0">
        {/* Search + View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID, email or designation…"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="flat-input w-full pl-10 pr-4 py-2.5 text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg p-1">
            {(["card", "list"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`p-2 rounded-md transition-all duration-150 ${
                  viewMode === m
                    ? "bg-card border border-border text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={m === "card" ? "Card view" : "List view"}
              >
                {m === "card" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mt-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-muted-foreground">Department</span>
              <SelectFilter value={filters.department} onChange={(v) => updateFilter("department", v)} options={departments} placeholder="All Departments" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-muted-foreground">Team</span>
              <SelectFilter value={filters.team} onChange={(v) => updateFilter("team", v)} options={teams} placeholder="All Teams" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-muted-foreground">Designation</span>
              <SelectFilter value={filters.designation} onChange={(v) => updateFilter("designation", v)} options={designations} placeholder="All Designations" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-muted-foreground">From Date</span>
                <input
                  type="date"
                  value={filters.joiningFrom}
                  onChange={(e) => updateFilter("joiningFrom", e.target.value)}
                  className="flat-input appearance-none px-3 py-2 text-sm cursor-pointer font-medium w-40"
                  title="From Date"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-muted-foreground">To Date</span>
                <input
                  type="date"
                  value={filters.joiningTo}
                  onChange={(e) => updateFilter("joiningTo", e.target.value)}
                  className="flat-input appearance-none px-3 py-2 text-sm cursor-pointer font-medium w-40"
                  title="To Date"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-muted-foreground">Status</span>
                <div className="w-44">
                  <SelectFilter
                    value={filters.status === 'active' ? 'Active Employees' : 'Inactive/Resigned Employees'}
                    onChange={(v) => updateFilter('status', v === 'Active Employees' ? 'active' : 'inactive')}
                    options={[ 'Active Employees', 'Inactive/Resigned Employees' ]}
                    placeholder="Status"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground
                  px-3 py-2 rounded-lg bg-secondary border border-border transition-all"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results header ───────────────────────────────── */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-border bg-background flex-shrink-0">
        <span className="text-sm text-muted-foreground font-medium">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> of{" "}
          <span className="font-bold text-foreground">{employees.length}</span> employees
        </span>
        {hasActiveFilters && (
          <span className="text-[10px] font-bold text-primary-foreground bg-foreground px-2.5 py-1 rounded-md uppercase tracking-wider">
            Filters active
          </span>
        )}
      </div>

      {/* ── Employee grid / table ────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 bg-secondary border border-border rounded-lg">
            <Users className="w-10 h-10 mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm font-medium text-muted-foreground">No employees match your search.</p>
            <button onClick={clearFilters} className="mt-2 text-xs font-semibold text-foreground hover:underline">
              Clear filters
            </button>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((emp) => (
              <div
                key={emp.id}
                className="flat-card flat-card-hover bg-card p-5 cursor-pointer group"
                onClick={() => openInformation(emp)}
              >
                <div className="flex items-start justify-between mb-4">
                  <EmployeeAvatar employee={emp} size="lg" />
                  <StatusBadge status={emp.status} />
                </div>
                <h3 className="text-sm font-bold text-foreground truncate">{emp.name}</h3>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5 truncate">{emp.designation}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{emp.department} · {emp.team}</p>

                <div className="mt-4 pt-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>{emp.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>Joined {new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <span className="flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-foreground bg-secondary border border-border rounded-md">
                    <Info className="w-3.5 h-3.5" /> View Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flat-card bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  {["Employee", "Department", "Designation", "Location", "Joining Date", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-secondary cursor-pointer transition-colors duration-150 group"
                    onClick={() => openInformation(emp)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar employee={emp} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-foreground font-medium">{emp.department}</p>
                      <p className="text-xs text-muted-foreground">{emp.team}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{emp.designation}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {emp.location}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-secondary hover:bg-border
                        border border-border px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all ml-auto">
                        <Info className="w-3.5 h-3.5" /> Info
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
