import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Background,
  Controls,
  Handle,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import type { Edge, Node, NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as d3 from "d3-hierarchy";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  ArrowLeftRight,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Download,
  Filter,
  Info,
  Maximize,
  Minimize,
  MoreVertical,
  RefreshCw,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { updateAdminEmployee } from "@/store/slices/adminSlice";
import type { Employee } from "../../../components/employees/mockData";
import { cn } from "../../../components/ui/utils";
 
type ModalType = "top" | "mass" | "assign" | null;
type ViewMode = "vertical" | "horizontal";
 
type OrgNodeData = Record<string, unknown> & {
  employee: Employee;
  childCount: number;
  isRoot: boolean;
  isCompact: boolean;
  isHighlighted: boolean;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onOpen: (employee: Employee) => void;
  onDropReportee: (reporteeId: string, managerId: string) => void;
  onRemoveFromTree: (employeeId: string) => void;
};
 
type OrgFlowNode = Node<OrgNodeData, "orgNode">;
 
function EmployeeAvatar({ employee, size = "md" }: { employee: Employee; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-9 w-9" : "h-11 w-11";
 
  if (employee.avatar) {
    return (
      <img
        src={employee.avatar}
        alt={employee.name}
        className={cn(sizeClass, "rounded-full border border-white object-cover shadow-sm")}
      />
    );
  }
 
  return (
    <div
      className={cn(sizeClass, "flex items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm")}
      style={{ backgroundColor: employee.avatarColor }}
    >
      {employee.initials}
    </div>
  );
}
 
function OrgNode({ data }: NodeProps) {
  const node = data as OrgNodeData;
  const accent = node.isRoot ? "bg-foreground" : "bg-muted-foreground";
 
  return (
    <div
      onClick={() => node.onOpen(node.employee)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const reporteeId = event.dataTransfer.getData("employee/id");
        if (reporteeId && reporteeId !== node.employee.id) {
          node.onDropReportee(reporteeId, node.employee.id);
        }
      }}
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 rounded-md border bg-card pr-8 shadow-xs transition",
        node.isCompact ? "h-[66px] w-[198px] pl-4" : "h-[78px] w-[232px] pl-5",
        node.isRoot ? "border-foreground bg-secondary" : "border-border bg-card",
        node.isHighlighted && "ring-2 ring-foreground ring-offset-2",
        "hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-2 rounded-l-md", accent)} />
      <EmployeeAvatar employee={node.employee} size={node.isCompact ? "sm" : "md"} />
 
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground">{node.employee.name}</p>
        <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">{node.employee.designation}</p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">Emp ID - {node.employee.employeeId}</p>
      </div>
 
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          node.onRemoveFromTree(node.employee.id);
        }}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-muted-foreground/70 hover:bg-secondary hover:text-foreground"
        title="Remove from organization chart"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
 
      {node.childCount > 0 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            node.onToggle(node.employee.id);
          }}
          className="absolute -bottom-8 left-1/2 z-10 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-md border border-border bg-background px-1.5 text-[11px] font-semibold text-muted-foreground shadow-sm hover:bg-secondary"
          title={node.isExpanded ? "Collapse reportees" : "Expand reportees"}
        >
          {node.isExpanded ? node.childCount : "+"}
        </button>
      )}
 
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
 
const nodeTypes = { orgNode: OrgNode };
 
function getDirectReportCount(employees: Employee[], managerId: string) {
  return employees.filter((employee) => employee.reportingManagerId === managerId).length;
}
 
function getReporteeIds(employees: Employee[], managerId: string) {
  const direct = employees.filter((employee) => employee.reportingManagerId === managerId);
  return direct.flatMap((employee) => [employee.id, ...getReporteeIds(employees, employee.id)]);
}
 
function filterVisibleEmployees(employees: Employee[], expanded: Set<string>) {
  const byId = new Map(employees.map((employee) => [employee.id, employee]));
 
  return employees.filter((employee) => {
    let managerId = employee.reportingManagerId;
    while (managerId) {
      if (!expanded.has(managerId)) return false;
      managerId = byId.get(managerId)?.reportingManagerId;
    }
    return true;
  });
}
 
function layoutEmployees(
  allEmployees: Employee[],
  visibleEmployees: Employee[],
  viewMode: ViewMode,
  isCompact: boolean,
  highlightedId: string | null,
  expanded: Set<string>,
  handlers: Pick<OrgNodeData, "onToggle" | "onOpen" | "onDropReportee" | "onRemoveFromTree">,
) {
  const virtualRootId = "virtual-root";
  const rows = [
    { id: virtualRootId, reportingManagerId: undefined },
    ...visibleEmployees.map((employee) => ({
      ...employee,
      reportingManagerId: employee.reportingManagerId || virtualRootId,
    })),
  ];
 
  const root = d3
    .stratify<any>()
    .id((row) => row.id)
    .parentId((row) => row.reportingManagerId)(rows);
 
  const nodeWidth = isCompact ? 198 : 232;
  const nodeHeight = isCompact ? 66 : 78;
  const tree = d3.tree().nodeSize(
    viewMode === "vertical"
      ? [nodeWidth + 54, nodeHeight + 80]
      : [nodeHeight + 80, nodeWidth + 80],
  );
 
  tree(root);
 
  const nodes: OrgFlowNode[] = [];
  const edges: Edge[] = [];
 
  root.descendants().forEach((item: any) => {
    if (item.data.id === virtualRootId) return;
 
    const employee = item.data as Employee;
    const x = viewMode === "vertical" ? item.x : item.y;
    const y = viewMode === "vertical" ? item.y : item.x;
 
    nodes.push({
      id: employee.id,
      type: "orgNode",
      position: { x, y },
      data: {
        employee,
        childCount: getDirectReportCount(allEmployees, employee.id),
        isRoot: item.parent?.data.id === virtualRootId,
        isCompact,
        isHighlighted: employee.id === highlightedId,
        isExpanded: expanded.has(employee.id),
        ...handlers,
      },
    });
 
    if (item.parent?.data.id && item.parent.data.id !== virtualRootId) {
      edges.push({
        id: `${item.parent.data.id}-${employee.id}`,
        source: item.parent.data.id,
        target: employee.id,
        type: "step",
        style: { stroke: "#9CA3AF", strokeWidth: 1.2 },
      });
    }
  });
 
  return { nodes, edges };
}
 
function SearchSelect({
  employees,
  value,
  onChange,
  placeholder = "Search by Emp No / Name",
}: {
  employees: Employee[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = employees.find((employee) => employee.id === value);
  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return employees;
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(text) ||
        employee.employeeId.toLowerCase().includes(text) ||
        employee.designation.toLowerCase().includes(text),
    );
  }, [employees, search]);
 
  return (
    <div
      className="relative"
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (!(nextFocus instanceof HTMLElement) || !event.currentTarget.contains(nextFocus)) setOpen(false);
      }}
    >
      <User className="absolute left-3 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-secondary p-2 text-muted-foreground" />
      <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={open ? search : selected ? `${selected.name} (${selected.employeeId})` : ""}
        onChange={(event) => {
          setSearch(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setSearch("");
          setOpen(true);
        }}
        placeholder={placeholder}
        className="h-12 w-full appearance-none rounded-full border border-border bg-background pl-14 pr-11 text-sm font-medium text-muted-foreground outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
      />
 
      {open && (
        <div className="absolute left-0 right-0 top-[54px] z-50 overflow-hidden rounded-md border border-border bg-card shadow-lg">
          <div className="border-b border-border bg-secondary px-4 py-2 text-xs font-semibold text-muted-foreground">
            {placeholder}
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(employee.id);
                  setSearch("");
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded px-3 py-2 text-left hover:bg-secondary",
                  value === employee.id && "bg-secondary",
                )}
              >
                <EmployeeAvatar employee={employee} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{employee.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">Emp ID - {employee.employeeId}</span>
                </span>
              </button>
            ))}
            {!filtered.length && (
              <div className="px-4 py-6 text-center text-sm font-medium text-muted-foreground">
                No employees found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
 
function OptionSearchSelect({
  options,
  value,
  onChange,
  icon,
  prefix,
  className,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  prefix?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return options;
    return options.filter((option) => option.toLowerCase().includes(text));
  }, [options, search]);
 
  return (
    <div
      className={cn("relative flex h-10 w-[210px] items-center rounded-md border border-border px-4 text-sm font-medium text-foreground", className)}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (!(nextFocus instanceof HTMLElement) || !event.currentTarget.contains(nextFocus)) setOpen(false);
      }}
    >
      {icon}
      {prefix && !open && <span className="mr-1 shrink-0 text-muted-foreground">{prefix}</span>}
      <input
        value={open ? search : value}
        onChange={(event) => {
          setSearch(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setSearch("");
          setOpen(true);
        }}
        className="min-w-0 flex-1 bg-transparent pr-7 outline-none"
        placeholder="Search"
      />
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
 
      {open && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-md border border-border bg-card shadow-lg">
          <div className="border-b border-border bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground">
            Search
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option);
                  setSearch("");
                  setOpen(false);
                }}
                className={cn(
                  "block w-full rounded px-3 py-2 text-left text-sm hover:bg-secondary",
                  value === option && "bg-secondary font-semibold",
                )}
              >
                {option}
              </button>
            ))}
            {!filtered.length && (
              <div className="px-3 py-4 text-center text-sm font-medium text-muted-foreground">
                No options found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
 
function PayrollMonthSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [startYear, setStartYear] = useState(2024);
  const months = useMemo(() => {
    const names = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    return names.map((month, index) => {
      const year = index < 9 ? startYear : startYear + 1;
      return `${month}'${String(year).slice(-2)}`;
    });
  }, [startYear]);
 
  return (
    <div
      className="relative"
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (!(nextFocus instanceof HTMLElement) || !event.currentTarget.contains(nextFocus)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-10 w-[256px] items-center gap-2 rounded-md border border-border px-4 text-sm font-medium",
          open ? "border-foreground ring-2 ring-foreground/10" : "text-muted-foreground hover:bg-secondary",
        )}
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Payroll Month:</span>
        <span className="font-semibold text-foreground">{value}</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
 
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[278px] rounded-md border border-border bg-card p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setStartYear((year) => year - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-lg font-medium text-foreground">
              {startYear} - {startYear + 1}
            </p>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setStartYear((year) => year + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
 
          <div className="grid grid-cols-3 gap-2">
            {months.map((month) => (
              <button
                key={month}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(month);
                  setOpen(false);
                }}
                className={cn(
                  "h-10 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                  value === month && "bg-secondary text-foreground",
                )}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
 
function OrgModal({
  type,
  employees,
  unassigned,
  reportees,
  values,
  onChange,
  onClose,
  onSave,
}: {
  type: ModalType;
  employees: Employee[];
  unassigned: Employee[];
  reportees: Employee[];
  values: { managerId: string; reporteeId: string; transferFromId: string; transferToId: string };
  onChange: (next: Partial<{ managerId: string; reporteeId: string; transferFromId: string; transferToId: string }>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!type) return null;
 
  const title = type === "top" ? "Set Top Level Manager" : type === "mass" ? "Mass Transfer" : "Assign Manager";
 
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10 pt-20">
      <div
        className={cn(
          "rounded-lg border border-border bg-card shadow-2xl",
          type === "mass" ? "w-[420px]" : "w-[420px]"
        )}
      >
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button className="rounded-full p-1 text-muted-foreground hover:bg-secondary" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
 
        <div className="space-y-6 p-4">
          {type === "top" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">Select Manager</p>
              <SearchSelect employees={employees} value={values.managerId} onChange={(managerId) => onChange({ managerId })} />
            </div>
          )}
 
          {type === "assign" && (
            <>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Select Reportee</p>
                <SearchSelect
                  employees={unassigned.length ? unassigned : employees}
                  value={values.reporteeId}
                  onChange={(reporteeId) => onChange({ reporteeId })}
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Select Manager</p>
                <SearchSelect
                  employees={employees.filter(
                    (employee) =>
                      employee.id !== values.reporteeId &&
                      !getReporteeIds(employees, values.reporteeId).includes(employee.id),
                  )}
                  value={values.managerId}
                  onChange={(managerId) => onChange({ managerId })}
                />
              </div>
            </>
          )}
 
          {type === "mass" && (
            <>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Transfer From</p>
                <SearchSelect
                  employees={employees}
                  value={values.transferFromId}
                  onChange={(transferFromId) => onChange({ transferFromId, transferToId: "" })}
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">All Reportees</p>
                <div className="flex h-[292px] flex-col items-center justify-center rounded-sm border border-border bg-background text-center">
                  {reportees.length ? (
                    <div className="w-full divide-y divide-border overflow-auto text-left">
                      {reportees.map((employee) => (
                        <div key={employee.id} className="flex items-center gap-3 px-4 py-3">
                          <EmployeeAvatar employee={employee} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">{employee.employeeId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border bg-secondary">
                        <CircleAlert className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Nothing to show!</p>
                      <p className="mt-2 max-w-[260px] text-xs font-medium leading-5 text-muted-foreground">
                        All reportee(s) will show up here once you select the manager.
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">Transfer To</p>
                <SearchSelect
                  employees={employees.filter(
                    (employee) =>
                      employee.id !== values.transferFromId &&
                      !getReporteeIds(employees, values.transferFromId).includes(employee.id),
                  )}
                  value={values.transferToId}
                  onChange={(transferToId) => onChange({ transferToId })}
                />
              </div>
            </>
          )}
        </div>
 
        <div className="flex justify-end gap-4 px-4 pb-6">
          <button className="h-8 rounded-md border border-border px-5 text-sm font-medium text-foreground hover:bg-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="h-8 rounded-md bg-foreground px-5 text-sm font-semibold text-primary-foreground hover:bg-foreground/90" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
 
export function OrganizationChartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const employees = useSelector((state: RootState) => state.admin.employees);
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<OrgFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [department, setDepartment] = useState("All");
  const [payrollMonth, setPayrollMonth] = useState("Apr'25");
  const [unassignedQuery, setUnassignedQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("vertical");
  const [isCompact, setIsCompact] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    managerId: "",
    reporteeId: "",
    transferFromId: "",
    transferToId: "",
  });
 
  const [topLevelIds, setTopLevelIds] = useState<Set<string>>(() => {
    const roots = employees.filter((employee) => !employee.reportingManagerId);
    const rootsWithTeams = roots.filter((employee) => getDirectReportCount(employees, employee.id) > 0);
    return new Set((rootsWithTeams.length ? rootsWithTeams : roots.slice(0, 1)).map((employee) => employee.id));
  });
 
  useEffect(() => {
    setTopLevelIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => employees.some((employee) => employee.id === id)));
      const rootsWithTeams = employees.filter(
        (employee) => !employee.reportingManagerId && getDirectReportCount(employees, employee.id) > 0,
      );
      rootsWithTeams.forEach((employee) => next.add(employee.id));
      if (!next.size) {
        const firstRoot = employees.find((employee) => !employee.reportingManagerId);
        if (firstRoot) next.add(firstRoot.id);
      }
      return next;
    });
  }, [employees]);
 
  const chartEmployees = useMemo(
    () => employees.filter((employee) => employee.reportingManagerId || topLevelIds.has(employee.id)),
    [employees, topLevelIds],
  );
  const unassigned = useMemo(
    () => employees.filter((employee) => !employee.reportingManagerId && !topLevelIds.has(employee.id)),
    [employees, topLevelIds],
  );
  const departments = useMemo(() => ["All", ...Array.from(new Set(employees.map((employee) => employee.department)))], [employees]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(employees.map((employee) => employee.id)));
 
  const filteredUnassigned = useMemo(() => {
    const text = unassignedQuery.trim().toLowerCase();
    if (!text) return unassigned;
    return unassigned.filter(
      (employee) =>
        employee.name.toLowerCase().includes(text) ||
        employee.employeeId.toLowerCase().includes(text) ||
        employee.designation.toLowerCase().includes(text) ||
        employee.department.toLowerCase().includes(text),
    );
  }, [unassigned, unassignedQuery]);
 
  const searchedEmployee = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return null;
    return chartEmployees.find(
      (employee) =>
        employee.name.toLowerCase().includes(text) ||
        employee.employeeId.toLowerCase().includes(text) ||
        employee.designation.toLowerCase().includes(text),
    );
  }, [chartEmployees, query]);
 
  const searchResults = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return [];
    return chartEmployees
      .filter(
        (employee) =>
          employee.name.toLowerCase().includes(text) ||
          employee.employeeId.toLowerCase().includes(text) ||
          employee.designation.toLowerCase().includes(text) ||
          employee.department.toLowerCase().includes(text),
      )
      .slice(0, 8);
  }, [chartEmployees, query]);
 
  const filteredEmployees = useMemo(() => {
    const text = query.trim().toLowerCase();
    const matchedIds = new Set<string>();
 
    chartEmployees.forEach((employee) => {
      const matchesDepartment = department === "All" || employee.department === department;
      const matchesSearch =
        !text ||
        employee.name.toLowerCase().includes(text) ||
        employee.employeeId.toLowerCase().includes(text) ||
        employee.designation.toLowerCase().includes(text);
 
      if (matchesDepartment && matchesSearch) {
        matchedIds.add(employee.id);
        getReporteeIds(chartEmployees, employee.id).forEach((id) => matchedIds.add(id));
      }
    });
 
    if (!matchedIds.size) return [];
 
    for (const id of Array.from(matchedIds)) {
      let current = chartEmployees.find((employee) => employee.id === id)?.reportingManagerId;
      while (current) {
        matchedIds.add(current);
        current = chartEmployees.find((employee) => employee.id === current)?.reportingManagerId;
      }
    }
 
    return chartEmployees.filter((employee) => matchedIds.has(employee.id));
  }, [chartEmployees, department, query]);
 
  const visibleEmployees = useMemo(() => filterVisibleEmployees(filteredEmployees, expanded), [expanded, filteredEmployees]);
  const transferReportees = useMemo(
    () => employees.filter((employee) => employee.reportingManagerId === form.transferFromId),
    [employees, form.transferFromId],
  );
 
  const updateManager = useCallback(
    (reporteeId: string, managerId?: string) => {
      const reportee = employees.find((employee) => employee.id === reporteeId);
      if (!reportee) return;
      if (managerId && getReporteeIds(employees, reporteeId).includes(managerId)) return;
      dispatch(updateAdminEmployee({ ...reportee, reportingManagerId: managerId }));
      if (managerId) {
        setTopLevelIds((prev) => {
          const next = new Set(prev);
          next.delete(reporteeId);
          return next;
        });
      }
      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(reporteeId);
        if (managerId) next.add(managerId);
        return next;
      });
    },
    [dispatch, employees],
  );
 
  const handleDropReportee = useCallback(
    (reporteeId: string, managerId: string) => {
      updateManager(reporteeId, managerId);
    },
    [updateManager],
  );
 
  const removeFromTree = useCallback(
    (employeeId: string) => {
      const employee = employees.find((item) => item.id === employeeId);
      if (!employee) return;
 
      dispatch(updateAdminEmployee({ ...employee, reportingManagerId: undefined }));
      employees
        .filter((item) => item.reportingManagerId === employeeId)
        .forEach((reportee) => {
          dispatch(updateAdminEmployee({ ...reportee, reportingManagerId: undefined }));
        });
      setTopLevelIds((prev) => {
        const next = new Set(prev);
        next.delete(employeeId);
        employees
          .filter((item) => item.reportingManagerId === employeeId)
          .forEach((reportee) => next.delete(reportee.id));
        return next;
      });
      setHighlightedId((current) => (current === employeeId ? null : current));
    },
    [dispatch, employees],
  );
 
  const pendingRemoveEmployee = useMemo(
    () => employees.find((employee) => employee.id === pendingRemoveId) ?? null,
    [employees, pendingRemoveId],
  );
 
  const toggleNode = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
 
  const openEmployee = useCallback((employee: Employee) => {
    setHighlightedId(employee.id);
  }, []);
 
  const revealEmployee = useCallback(
    (employee: Employee) => {
      setDepartment("All");
      setQuery(employee.name);
      setHighlightedId(employee.id);
      setSearchOpen(false);
 
      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(employee.id);
        let managerId = employee.reportingManagerId;
        while (managerId) {
          next.add(managerId);
          managerId = chartEmployees.find((item) => item.id === managerId)?.reportingManagerId;
        }
        return next;
      });
    },
    [chartEmployees],
  );
 
  useEffect(() => {
    const layout = layoutEmployees(chartEmployees, visibleEmployees, viewMode, isCompact, highlightedId, expanded, {
      onToggle: toggleNode,
      onOpen: openEmployee,
      onDropReportee: handleDropReportee,
      onRemoveFromTree: setPendingRemoveId,
    });
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [chartEmployees, visibleEmployees, viewMode, isCompact, highlightedId, expanded, toggleNode, openEmployee, handleDropReportee, setNodes, setEdges]);
 
  useEffect(() => {
    if (!searchedEmployee) return;
    setHighlightedId(searchedEmployee.id);
    const node = nodes.find((item) => item.id === searchedEmployee.id);
    if (node) setCenter(node.position.x + 100, node.position.y + 40, { zoom: 1, duration: 600 });
  }, [nodes, searchedEmployee, setCenter]);
 
  const exportChart = async (type: "png" | "pdf") => {
    const flowElement = document.querySelector(".react-flow__viewport") as HTMLElement | null;
    if (!flowElement) return;
 
    const dataUrl = await toPng(flowElement, { backgroundColor: "#ffffff", pixelRatio: 2 });
    const fileName = `organization-chart-${new Date().toISOString().slice(0, 10)}`;
 
    if (type === "png") {
      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
      return;
    }
 
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1200, 760] });
    pdf.addImage(dataUrl, "PNG", 24, 24, 1152, 712);
    pdf.save(`${fileName}.pdf`);
  };
 
  const saveModal = () => {
    if (modal === "top" && form.managerId) {
      setTopLevelIds((prev) => new Set(prev).add(form.managerId));
      updateManager(form.managerId, undefined);
    }
    if (modal === "assign" && form.reporteeId && form.managerId) updateManager(form.reporteeId, form.managerId);
    if (modal === "mass" && form.transferFromId && form.transferToId) {
      transferReportees.forEach((employee) => updateManager(employee.id, form.transferToId));
    }
    setModal(null);
    setForm({ managerId: "", reporteeId: "", transferFromId: "", transferToId: "" });
  };
 
  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-[86px] shrink-0 items-center justify-between border-b border-border bg-card px-7">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-muted-foreground">Home</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Employee</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">Organization Chart</span>
          </div>
        </div>
 
        <div className="flex h-[112px] shrink-0 items-center justify-between border-b border-border bg-card px-8">
          <div
            className="relative w-64"
            onBlur={(event) => {
              const nextFocus = event.relatedTarget;
              if (!(nextFocus instanceof HTMLElement) || !event.currentTarget.contains(nextFocus)) {
                setSearchOpen(false);
              }
            }}
          >
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search"
              className="h-9 w-full rounded-full border border-border bg-background px-4 pr-10 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10"
            />
 
            {searchOpen && query.trim() && (
              <div className="absolute left-0 top-11 z-40 w-[300px] overflow-hidden rounded-md border border-border bg-card shadow-lg">
                <div className="max-h-72 overflow-y-auto p-1">
                  {searchResults.map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => revealEmployee(employee)}
                      className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-left hover:bg-secondary"
                    >
                      <EmployeeAvatar employee={employee} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">{employee.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {employee.employeeId} - {employee.designation}
                        </span>
                      </span>
                    </button>
                  ))}
                  {!searchResults.length && (
                    <div className="px-4 py-6 text-center text-sm font-medium text-muted-foreground">
                      No employees found in the tree.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
 
          <div className="flex flex-col items-end gap-8">
            <div className="flex items-center gap-4">
              <button className="h-8 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setModal("top")}>
                Assign Top Level Manager
              </button>
              <button className="h-8 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setModal("mass")}>
                Mass Transfer
              </button>
              <button className="h-8 rounded-md bg-foreground px-4 text-sm font-semibold text-primary-foreground hover:bg-foreground/90" onClick={() => setModal("assign")}>
                Assign Manager
              </button>
            </div>
 
            <div className="flex items-center gap-3">
              <OptionSearchSelect
                options={departments}
                value={department}
                onChange={setDepartment}
                icon={<Users className="mr-2 h-4 w-4 text-muted-foreground" />}
              />
              <div className="flex rounded-md border border-border">
                <button
                  className={cn("flex h-9 w-9 items-center justify-center hover:bg-secondary", viewMode === "vertical" && "bg-foreground text-primary-foreground hover:bg-foreground/90")}
                  onClick={() => setViewMode("vertical")}
                  title="Vertical layout"
                >
                  <ArrowUpDown className="h-5 w-5" />
                </button>
                <button
                  className={cn("flex h-9 w-9 items-center justify-center hover:bg-secondary", viewMode === "horizontal" && "bg-foreground text-primary-foreground hover:bg-foreground/90")}
                  onClick={() => setViewMode("horizontal")}
                  title="Horizontal layout"
                >
                  <ArrowLeftRight className="h-5 w-5" />
                </button>
              </div>
              <div className="relative">
                <button
                  className="flex h-9 items-center gap-3 rounded-md bg-foreground px-4 text-sm font-semibold text-primary-foreground hover:bg-foreground/90"
                  onClick={() => setExportOpen((prev) => !prev)}
                >
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-4 w-4" />
                </button>
                {exportOpen && (
                  <div className="absolute right-0 top-11 z-20 w-32 rounded-md border border-border bg-card p-1 shadow-lg">
                    <button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-secondary" onClick={() => exportChart("png")}>PNG</button>
                    <button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-secondary" onClick={() => exportChart("pdf")}>PDF</button>
                  </div>
                )}
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground" onClick={() => setIsCompact((prev) => !prev)} title="Compact view">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
 
        <div className="relative min-h-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
            className="bg-background"
          >
            <Background color="#E5E7EB" gap={28} size={1} />
            <Controls position="bottom-right" showInteractive={false} />
            <Panel position="bottom-right" className="mb-24 mr-2 flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm">
              <button className="flex h-9 w-9 items-center justify-center border-b border-border hover:bg-secondary" onClick={() => fitView()} title="Fit view">
                <Maximize className="h-4 w-4" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center border-b border-border hover:bg-secondary" onClick={() => zoomIn()} title="Zoom in">
                <span className="text-2xl leading-none">+</span>
              </button>
              <button className="flex h-9 w-9 items-center justify-center hover:bg-secondary" onClick={() => zoomOut()} title="Zoom out">
                <Minimize className="h-4 w-4" />
              </button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
 
      <aside className="flex w-[254px] shrink-0 flex-col border-l border-border bg-card">
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <h2 className="text-sm font-semibold text-foreground">
            Unassigned ({unassignedQuery.trim() ? filteredUnassigned.length : unassigned.length})
          </h2>
        </div>
 
        <div className="space-y-4 p-3">
          <div className="flex gap-2 rounded-md border border-border bg-secondary px-2.5 py-2 text-xs font-medium leading-5 text-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Assign manager using drag and drop</span>
          </div>
 
          <div className="relative">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={unassignedQuery}
              onChange={(event) => setUnassignedQuery(event.target.value)}
              className="h-8 w-full rounded-full border border-border bg-background px-4 pr-9 text-sm outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/10"
              placeholder="Search"
            />
          </div>
 
          <div className="space-y-3">
            {filteredUnassigned.map((employee) => (
              <div
                key={employee.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("employee/id", employee.id)}
                className="flex cursor-grab items-center gap-3 rounded-md border border-dashed border-border bg-background p-3 active:cursor-grabbing hover:bg-secondary"
              >
                <EmployeeAvatar employee={employee} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{employee.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Emp ID - {employee.employeeId}</p>
                </div>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
            {!filteredUnassigned.length && (
              <div className="rounded-md border border-dashed border-border p-4 text-center text-xs font-medium text-muted-foreground">
                {unassigned.length ? "No unassigned employees match your search." : "Every employee is assigned in the chart."}
              </div>
            )}
          </div>
        </div>
      </aside>
 
      <OrgModal
        type={modal}
        employees={employees}
        unassigned={unassigned}
        reportees={transferReportees}
        values={form}
        onChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
        onClose={() => setModal(null)}
        onSave={saveModal}
      />
 
      {pendingRemoveEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-[420px] rounded-lg border border-border bg-card shadow-2xl">
            <div className="flex h-12 items-center justify-between border-b border-border px-4">
              <h3 className="text-base font-semibold text-foreground">Remove Employee</h3>
              <button
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                onClick={() => setPendingRemoveId(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
 
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-3 rounded-md border border-border bg-secondary p-3">
                <EmployeeAvatar employee={pendingRemoveEmployee} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{pendingRemoveEmployee.name}</p>
                  <p className="text-xs text-muted-foreground">Emp ID - {pendingRemoveEmployee.employeeId}</p>
                </div>
              </div>
 
              <p className="text-sm font-medium leading-6 text-muted-foreground">
                Are you sure you want to remove this employee from the organization chart?
                The employee will move back to the unassigned drag-and-drop section.
              </p>
            </div>
 
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button
                className="h-9 rounded-md border border-border px-5 text-sm font-medium text-foreground hover:bg-secondary"
                onClick={() => setPendingRemoveId(null)}
              >
                Cancel
              </button>
              <button
                className="h-9 rounded-md bg-foreground px-5 text-sm font-semibold text-primary-foreground hover:bg-foreground/90"
                onClick={() => {
                  removeFromTree(pendingRemoveEmployee.id);
                  setPendingRemoveId(null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
export function OrganizationChartPageWrapper() {
  return (
    <ReactFlowProvider>
      <OrganizationChartPage />
    </ReactFlowProvider>
  );
}