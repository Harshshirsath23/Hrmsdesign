import { useState, useCallback, useMemo, useEffect } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Position, 
  MarkerType,
  Handle,
  NodeProps,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import * as d3 from "d3-hierarchy";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { 
  Search, 
  Maximize, 
  Minimize, 
  Plus, 
  Minus, 
  Download, 
  RefreshCw, 
  FileImage, 
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Edit2,
  Send,
  ExternalLink,
  Users,
  Layout
} from "lucide-react";
import { employees, Employee } from "../../../components/employees/mockData";
import { cn } from "../../../components/ui/utils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface OrgNodeData {
  employee: Employee;
  isRoot?: boolean;
  hasChildren?: boolean;
  childCount?: number;
  isExpanded?: boolean;
  isCompact?: boolean;
  onToggleExpand?: (id: string) => void;
  onNodeClick?: (emp: Employee) => void;
}

// --- Custom Node Component ---
const OrgNode = ({ data }: NodeProps<any>) => {
  const { employee, isRoot, childCount, onNodeClick } = data as OrgNodeData;
  
  return (
    <div 
      className={cn(
        "group relative flex flex-col rounded-2xl border transition-all duration-300",
        data.isCompact ? "p-3 w-[200px]" : "p-4 w-[260px]",
        "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl",
        "hover:shadow-2xl hover:scale-[1.02] cursor-pointer",
        isRoot 
          ? "border-emerald-500/50 shadow-emerald-500/10 ring-1 ring-emerald-500/20" 
          : "border-slate-200 dark:border-slate-800 shadow-lg shadow-black/5"
      )}
      onClick={() => onNodeClick?.(employee)}
    >
      {/* Decorative Peacock Feather Accent */}
      {isRoot && (
        <div className="absolute -top-1 -left-1 w-12 h-12 overflow-hidden rounded-tl-2xl opacity-20 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rotate-45 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          {employee.avatar ? (
            <img 
              src={employee.avatar} 
              alt={employee.name} 
              className={cn("rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-sm", data.isCompact ? "w-10 h-10" : "w-12 h-12")}
            />
          ) : (
            <div 
              className={cn("rounded-xl flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-800 shadow-sm", data.isCompact ? "w-10 h-10 text-xs" : "w-12 h-12 text-sm")}
              style={{ backgroundColor: employee.avatarColor }}
            >
              {employee.initials}
            </div>
          )}
          {/* Status Dot */}
          <div className={cn(
            "absolute -bottom-1 -right-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm",
            data.isCompact ? "w-3 h-3" : "w-3.5 h-3.5",
            employee.status === "Active" ? "bg-green-500" : employee.status === "On Leave" ? "bg-amber-500" : "bg-slate-400"
          )} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 transition-colors", data.isCompact ? "text-[12px]" : "text-sm")}>
            {employee.name}
          </h4>
          <p className={cn("font-medium text-slate-500 dark:text-slate-400 truncate leading-tight", data.isCompact ? "text-[10px]" : "text-[11px]")}>
            {employee.designation}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{employee.employeeId}</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{employee.department}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {childCount && childCount > 0 ? (
            <button 
              className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group/btn hover:bg-emerald-500 hover:text-white transition-all"
              onClick={(e) => {
                e.stopPropagation();
                data.onToggleExpand?.(employee.id);
              }}
            >
               {data.isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          ) : null}
          {childCount && childCount > 0 && (
            <div className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
               <Users className="w-2.5 h-2.5 text-slate-500" />
               <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{childCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = {
  orgNode: OrgNode,
};

// --- Layout Logic using D3 ---
const getLayoutedElements = (employees: Employee[], direction = 'TB', isCompact = false) => {
  // To handle multiple roots, we add a "virtual root"
  const virtualRootId = "VIRTUAL_ROOT";
  const dataWithVirtualRoot = [
    { id: virtualRootId, name: "Virtual Root", reportingManagerId: undefined },
    ...employees.map(emp => ({
      ...emp,
      reportingManagerId: emp.reportingManagerId || virtualRootId
    }))
  ];

  const root = d3.stratify<any>()
    .id(d => d.id)
    .parentId(d => d.reportingManagerId)(dataWithVirtualRoot);

  const nodeWidth = isCompact ? 200 : 260;
  const nodeHeight = isCompact ? 90 : 120;
  const spacingX = isCompact ? 50 : 100;
  const spacingY = isCompact ? 60 : 100;
  
  // D3 Tree layout
  const treeLayout = d3.tree().nodeSize(direction === 'TB' ? [nodeWidth + spacingX, nodeHeight + spacingY] : [nodeHeight + spacingY, nodeWidth + spacingX]);
  treeLayout(root);

  const nodes: any[] = [];
  const edges: any[] = [];

  root.descendants().forEach((d: any) => {
    // Skip virtual root
    if (d.data.id === virtualRootId) return;

    const isRoot = d.parent?.data.id === virtualRootId;
    
    // Swap X and Y for horizontal layout
    const x = direction === 'TB' ? d.x : d.y;
    const y = direction === 'TB' ? d.y : d.x;

    nodes.push({
      id: d.data.id,
      type: 'orgNode',
      data: { 
        employee: d.data, 
        isRoot,
        isCompact,
        childCount: d.children?.length || 0,
      },
      position: { x, y },
    });

    if (d.parent && d.parent.data.id !== virtualRootId) {
      edges.push({
        id: `e${d.parent.data.id}-${d.data.id}`,
        source: d.parent.data.id,
        target: d.data.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#CBD5E1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#CBD5E1' },
      });
    }
  });

  return { nodes, edges };
};

export function OrganizationChartPage() {
  const { setViewport, fitView, zoomIn, zoomOut, getNodes } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Persist view mode settings
  const [viewMode, setViewMode] = useState<"vertical" | "horizontal">(() => {
    return (localStorage.getItem("orgChart_direction") as any) || "vertical";
  });
  const [isCompact, setIsCompact] = useState(() => {
    return localStorage.getItem("orgChart_compact") === "true";
  });
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(employees.map(e => e.id)));

  const onNodeClick = useCallback((emp: Employee) => {
    setSelectedEmp(emp);
    setIsDrawerOpen(true);
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const layout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      employees, 
      viewMode === 'vertical' ? 'TB' : 'LR',
      isCompact
    );
    
    const finalNodes = layoutedNodes.map(n => ({
      ...n,
      data: { 
        ...n.data, 
        isExpanded: expandedNodes.has(n.id),
        isCompact,
        onToggleExpand: toggleExpand,
        onNodeClick
      }
    }));

    setNodes(finalNodes);
    setEdges(layoutedEdges);
  }, [expandedNodes, onNodeClick, toggleExpand, viewMode, isCompact]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("orgChart_direction", viewMode);
    localStorage.setItem("orgChart_compact", String(isCompact));
  }, [viewMode, isCompact]);

  // Initial Layout & Re-layout on expand/collapse
  useEffect(() => {
    layout();
  }, [layout]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) return;

    const found = employees.find(e => 
      e.name.toLowerCase().includes(term.toLowerCase()) || 
      e.employeeId.toLowerCase().includes(term.toLowerCase()) ||
      e.designation.toLowerCase().includes(term.toLowerCase())
    );

    if (found) {
      // Ensure all ancestors are expanded
      const ancestors: string[] = [];
      let current = found.reportingManagerId;
      while (current) {
        ancestors.push(current);
        const manager = employees.find(e => e.id === current);
        current = manager?.reportingManagerId;
      }
      
      setExpandedNodes(prev => {
        const next = new Set(prev);
        ancestors.forEach(id => next.add(id));
        return next;
      });

      const node = nodes.find(n => n.id === found.id);
      if (node) {
        setViewport({ x: -node.position.x + window.innerWidth / 2 - 130, y: -node.position.y + 200, zoom: 1 }, { duration: 800 });
      }
    }
  };

  const expandAll = () => setExpandedNodes(new Set(employees.map(e => e.id)));
  const collapseAll = () => setExpandedNodes(new Set([employees.find(e => !e.reportingManagerId)?.id || "0"]));

  const handleExport = async (type: 'png' | 'pdf') => {
    const flowElement = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (!flowElement) return;

    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `organization-chart-${dateStr}`;

      const dataUrl = await toPng(flowElement, {
        backgroundColor: "transparent",
        quality: 1,
        pixelRatio: 2,
      });

      if (type === 'png') {
        const link = document.createElement("a");
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [flowElement.offsetWidth, flowElement.offsetHeight]
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, flowElement.offsetWidth, flowElement.offsetHeight);
        pdf.save(`${fileName}.pdf`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 overflow-hidden relative">
      
      {/* --- Top Toolbar --- */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-30 shadow-sm sticky top-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Users className="w-3 h-3" />
            <span>Employees</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-emerald-500 font-black">Org Chart</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
            Organization Chart
          </h2>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-[400px] mx-8 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-xs shadow-inner" 
            placeholder="Search by Name, ID, Designation..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
             <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black px-3 rounded-lg" onClick={expandAll}>EXPAND ALL</Button>
             <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black px-3 rounded-lg" onClick={collapseAll}>COLLAPSE ALL</Button>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => zoomIn()} title="Zoom In"><Plus className="w-4 h-4" /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => zoomOut()} title="Zoom Out"><Minus className="w-4 h-4" /></Button>
             <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => fitView()} title="Fit to Screen"><Maximize className="w-4 h-4" /></Button>
          </div>

          <div className="flex items-center gap-2 ml-2">
             <Button 
               variant="outline" 
               size="sm" 
               className="h-10 gap-2 font-bold text-[11px] rounded-xl px-4" 
               onClick={() => handleExport('png')}
               disabled={isExporting}
             >
               {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileImage className="w-3.5 h-3.5 text-emerald-500" />} 
               PNG
             </Button>
             <Button 
               variant="outline" 
               size="sm" 
               className="h-10 gap-2 font-bold text-[11px] rounded-xl px-4" 
               onClick={() => handleExport('pdf')}
               disabled={isExporting}
             >
               {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-red-500" />} 
               PDF
             </Button>
             <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => window.location.reload()}>
               <RefreshCw className="w-4 h-4 text-slate-400" />
             </Button>
          </div>
        </div>
      </div>

      {/* --- Main Chart Area --- */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          className="bg-slate-50 dark:bg-slate-950"
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: '#94A3B8', strokeWidth: 2 },
          }}
        >
          <Background color="#94A3B8" gap={20} size={1} opacity={0.2} />
          <Controls showInteractive={false} position="bottom-right" className="bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl" />
          
          <Panel position="top-left" className="m-6 space-y-4">
             <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-2xl w-[200px] space-y-3">
                <div className="flex items-center gap-2 mb-2">
                   <Layout className="w-4 h-4 text-emerald-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">View Mode</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                   <Button 
                    variant={viewMode === 'vertical' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="justify-start h-9 text-[11px] font-bold gap-3 rounded-xl"
                    onClick={() => setViewMode('vertical')}
                   >
                     <div className="w-1.5 h-4 bg-emerald-500 rounded-full" /> Vertical Tree
                   </Button>
                   <Button 
                    variant={viewMode === 'horizontal' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="justify-start h-9 text-[11px] font-bold gap-3 rounded-xl"
                    onClick={() => setViewMode('horizontal')}
                   >
                     <div className="w-4 h-1.5 bg-blue-500 rounded-full" /> Horizontal Tree
                   </Button>
                   <Button 
                    variant={isCompact ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="justify-start h-9 text-[11px] font-bold gap-3 rounded-xl"
                    onClick={() => setIsCompact(!isCompact)}
                   >
                     <div className="w-2.5 h-2.5 bg-amber-500 rounded-lg" /> Compact View
                   </Button>
                </div>
             </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* --- Employee Detail Drawer --- */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-[500px] p-0 border-l-0 overflow-y-auto no-scrollbar shadow-2xl bg-white dark:bg-slate-950">
          <SheetHeader className="p-0 relative">
             <div className="h-48 bg-gradient-to-br from-slate-900 to-emerald-950 relative overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                   <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>
                
                <div className="absolute top-6 right-6">
                   <Button variant="ghost" size="icon" className="text-white/40 hover:text-white" onClick={() => setIsDrawerOpen(false)}>
                     <X className="w-6 h-6" />
                   </Button>
                </div>

                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                   <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-slate-900 p-1 shadow-2xl">
                      {selectedEmp?.avatar ? (
                        <img src={selectedEmp.avatar} alt="" className="w-full h-full rounded-[36px] object-cover" />
                      ) : (
                        <div 
                          className="w-full h-full rounded-[36px] flex items-center justify-center text-white text-3xl font-black"
                          style={{ backgroundColor: selectedEmp?.avatarColor }}
                        >
                          {selectedEmp?.initials}
                        </div>
                      )}
                   </div>
                   <div className="mb-4">
                      <h3 className="text-2xl font-black text-white leading-none">{selectedEmp?.name}</h3>
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-2">{selectedEmp?.employeeId} • {selectedEmp?.designation}</p>
                   </div>
                </div>
             </div>
          </SheetHeader>

          <div className="pt-20 px-8 pb-10 space-y-10">
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                   <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                     <Building2 className="w-4 h-4 text-blue-500" /> {selectedEmp?.department}
                   </p>
                </div>
                <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joining Date</p>
                   <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-emerald-500" /> {selectedEmp?.joiningDate}
                   </p>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Contact Information</h4>
                <div className="space-y-3">
                   <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Mail className="w-4 h-4 text-blue-600" /></div>
                         <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{selectedEmp?.email}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="w-3.5 h-3.5" /></Button>
                   </div>
                   <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><Phone className="w-4 h-4 text-green-600" /></div>
                         <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{selectedEmp?.phone}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="w-3.5 h-3.5" /></Button>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                   <Button variant="outline" className="h-12 gap-2 font-bold text-[11px] rounded-2xl border-emerald-100 hover:bg-emerald-50">
                      <Users className="w-4 h-4 text-emerald-600" /> VIEW PROFILE
                   </Button>
                   <Button variant="outline" className="h-12 gap-2 font-bold text-[11px] rounded-2xl border-blue-100 hover:bg-blue-50">
                      <Edit2 className="w-4 h-4 text-blue-600" /> EDIT EMPLOYEE
                   </Button>
                   <Button variant="outline" className="h-12 gap-2 font-bold text-[11px] rounded-2xl border-purple-100 hover:bg-purple-50">
                      <Send className="w-4 h-4 text-purple-600" /> MESSAGE
                   </Button>
                   <Button variant="outline" className="h-12 gap-2 font-bold text-[11px] rounded-2xl border-orange-100 hover:bg-orange-50">
                      <FileText className="w-4 h-4 text-orange-600" /> PAYROLL
                   </Button>
                </div>
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Wrapper to provide ReactFlow context
export default function OrganizationChartPageWrapper() {
  return (
    <ReactFlowProvider>
      <OrganizationChartPage />
    </ReactFlowProvider>
  );
}
