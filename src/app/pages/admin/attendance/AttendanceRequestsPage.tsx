import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, CheckCircle, XCircle, Clock, Eye, AlertCircle, Calendar } from 'lucide-react';
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Select } from "../../../components/ui/select";
import { Sheet } from "../../../components/ui/sheet";
import { cn } from "../../../components/ui/utils";

// --- Types & Mock Data ---

type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

interface AttendanceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  requestType: string;
  attendanceDate: string;
  submittedOn: string;
  managerStatus: ApprovalStatus;
  adminStatus: ApprovalStatus;
  reason: string;
  shiftTiming?: string;
  punchIn?: string;
  punchOut?: string;
  workingHours?: string;
  managerRemarks?: string;
  adminRemarks?: string;
}

const MOCK_REQUESTS: AttendanceRequest[] = [
  {
    id: 'REQ-001',
    employeeId: 'EMP-042',
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    designation: 'Frontend Developer',
    requestType: 'Missing Punch Request',
    attendanceDate: '2023-10-24',
    submittedOn: '2023-10-25',
    managerStatus: 'Approved',
    adminStatus: 'Pending',
    reason: 'Forgot to punch out yesterday due to urgent server deployment.',
    shiftTiming: '09:00 AM - 06:00 PM',
    punchIn: '08:55 AM',
    punchOut: '--',
    workingHours: '9h 5m (Requested)',
    managerRemarks: 'Approved based on deployment logs.',
  },
  {
    id: 'REQ-002',
    employeeId: 'EMP-015',
    employeeName: 'Michael Chen',
    department: 'Marketing',
    designation: 'Content Strategist',
    requestType: 'Late Login Justification',
    attendanceDate: '2023-10-26',
    submittedOn: '2023-10-26',
    managerStatus: 'Pending',
    adminStatus: 'Pending',
    reason: 'Stuck in heavy traffic due to road accident on highway.',
    shiftTiming: '10:00 AM - 07:00 PM',
    punchIn: '11:15 AM',
    punchOut: '07:30 PM',
    workingHours: '8h 15m',
  },
  {
    id: 'REQ-003',
    employeeId: 'EMP-088',
    employeeName: 'Elena Rodriguez',
    department: 'Sales',
    designation: 'Account Executive',
    requestType: 'Work From Home Attendance Adjustment',
    attendanceDate: '2023-10-23',
    submittedOn: '2023-10-24',
    managerStatus: 'Approved',
    adminStatus: 'Approved',
    reason: 'Worked from home, VPN connection was dropping so time tracker missed 2 hours.',
    shiftTiming: '09:00 AM - 06:00 PM',
    punchIn: '09:00 AM',
    punchOut: '06:00 PM',
    workingHours: '9h 0m',
    managerRemarks: 'Confirmed with client meetings.',
    adminRemarks: 'Adjusted in system.',
  },
  {
    id: 'REQ-004',
    employeeId: 'EMP-102',
    employeeName: 'David Kim',
    department: 'HR',
    designation: 'HR Generalist',
    requestType: 'Half-Day Attendance Correction',
    attendanceDate: '2023-10-25',
    submittedOn: '2023-10-26',
    managerStatus: 'Rejected',
    adminStatus: 'Pending',
    reason: 'Left early for doctor appointment.',
    shiftTiming: '09:00 AM - 06:00 PM',
    punchIn: '09:00 AM',
    punchOut: '01:00 PM',
    workingHours: '4h 0m',
    managerRemarks: 'Needs to be filed as Half Day Leave, not attendance correction.',
  },
  {
    id: 'REQ-005',
    employeeId: 'EMP-055',
    employeeName: 'Priya Patel',
    department: 'Engineering',
    designation: 'QA Engineer',
    requestType: 'Attendance Regularization',
    attendanceDate: '2023-10-20',
    submittedOn: '2023-10-22',
    managerStatus: 'Approved',
    adminStatus: 'Rejected',
    reason: 'Attended full day offsite training.',
    shiftTiming: '09:00 AM - 06:00 PM',
    punchIn: '--',
    punchOut: '--',
    workingHours: '9h 0m',
    managerRemarks: 'Training verified.',
    adminRemarks: 'Missing certificate of attendance.',
  }
];

// --- Helper Functions ---

const getFinalStatus = (manager: ApprovalStatus, admin: ApprovalStatus) => {
  if (manager === 'Rejected') return 'Rejected';
  if (manager === 'Approved' && admin === 'Pending') return 'Pending Admin Approval';
  if (manager === 'Approved' && admin === 'Approved') return 'Fully Approved';
  if (manager === 'Approved' && admin === 'Rejected') return 'Rejected';
  return 'Pending';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'warning';
    case 'Pending Admin Approval': return 'info';
    case 'Fully Approved': return 'success';
    case 'Rejected': return 'danger';
    default: return 'neutral';
  }
};

// --- Main Component ---

export function AttendanceRequestsPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<AttendanceRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter Data
  const filteredRequests = useMemo(() => {
    return MOCK_REQUESTS.filter(req => {
      const matchSearch = req.employeeName.toLowerCase().includes(search.toLowerCase()) || req.id.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'All' || req.requestType === filterType;
      const matchDept = filterDept === 'All' || req.department === filterDept;
      const finalStatus = getFinalStatus(req.managerStatus, req.adminStatus);
      const matchStatus = filterStatus === 'All' || finalStatus === filterStatus;
      
      return matchSearch && matchType && matchDept && matchStatus;
    });
  }, [search, filterType, filterDept, filterStatus]);

  // Summary Stats
  const stats = useMemo(() => {
    let pending = 0, managerApproved = 0, pendingAdmin = 0, approved = 0, rejected = 0;
    
    MOCK_REQUESTS.forEach(req => {
      const final = getFinalStatus(req.managerStatus, req.adminStatus);
      if (req.managerStatus === 'Pending' && req.adminStatus === 'Pending') pending++;
      if (req.managerStatus === 'Approved') managerApproved++;
      if (final === 'Pending Admin Approval') pendingAdmin++;
      if (final === 'Fully Approved') approved++;
      if (final === 'Rejected') rejected++;
    });

    return { pending, managerApproved, pendingAdmin, approved, rejected };
  }, []);

  // Handlers
  const toggleSelection = (id: string) => {
    const newSel = new Set(selectedRequests);
    if (newSel.has(id)) newSel.delete(id);
    else newSel.add(id);
    setSelectedRequests(newSel);
  };

  const selectAllValid = () => {
    const validIds = filteredRequests.filter(r => r.managerStatus === 'Approved' && r.adminStatus === 'Pending').map(r => r.id);
    if (selectedRequests.size === validIds.length && validIds.length > 0) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(validIds));
    }
  };

  const openDetails = (req: AttendanceRequest) => {
    setSelectedRequestDetails(req);
    setIsDrawerOpen(true);
  };

  const handleAction = (id: string, action: 'Approve' | 'Reject') => {
    console.log(`${action} request ${id}`);
    setIsDrawerOpen(false);
  };

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Compact Header — title + stats + filters inline */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-sm space-y-3">
        {/* Row 1: Title + Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Attendance Requests</h1>
            <p className="text-muted-foreground text-xs hidden md:block">Manage and approve attendance corrections.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-40">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Name or ID..." 
                className="pl-8 h-8 text-xs"
              />
            </div>

            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="All">All Types</option>
              <option value="Attendance Regularization">Regularization</option>
              <option value="Late Login Justification">Late Login</option>
              <option value="Missing Punch Request">Missing Punch</option>
              <option value="Work From Home Attendance Adjustment">WFH Adj.</option>
              <option value="Half-Day Attendance Correction">Half-Day</option>
            </select>

            <select 
              value={filterDept} 
              onChange={e => setFilterDept(e.target.value)}
              className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="All">All Depts</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
            </select>

            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="h-8 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Pending Admin Approval">Pending Admin</option>
              <option value="Fully Approved">Fully Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <Button variant="outline" className="h-8 text-xs" size="sm" onClick={() => { setSearch(''); setFilterType('All'); setFilterDept('All'); setFilterStatus('All'); }}>
              Clear
            </Button>
            <Button variant="outline" className="h-8 text-xs gap-1.5" size="sm">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* Row 2: Stats Inline */}
        <div className="grid grid-cols-5 gap-2 border-t border-border pt-3">
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="text-orange-500" bg="bg-orange-500/10" />
          <StatCard title="Mgr Approved" value={stats.managerApproved} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-500/10" />
          <StatCard title="Pending Admin" value={stats.pendingAdmin} icon={AlertCircle} color="text-blue-500" bg="bg-blue-500/10" />
          <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="text-emerald-500" bg="bg-emerald-500/10" />
          <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="text-red-500" bg="bg-red-500/10" />
        </div>
      </div>


      {/* Bulk Actions */}
      {selectedRequests.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-sm font-medium text-primary ml-2">{selectedRequests.size} requests selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">Approve Selected</Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject Selected</Button>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] font-bold text-muted-foreground uppercase bg-secondary/50 border-b border-border tracking-wider">
              <tr>
                <th className="px-3 py-2 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-input"
                    checked={filteredRequests.length > 0 && selectedRequests.size === filteredRequests.filter(r => r.managerStatus === 'Approved' && r.adminStatus === 'Pending').length}
                    onChange={selectAllValid}
                  />
                </th>
                <th className="px-3 py-2">Request ID</th>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Type & Date</th>
                <th className="px-3 py-2">Manager Status</th>
                <th className="px-3 py-2">Final Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-20" />
                      <p>No attendance requests found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  const finalStatus = getFinalStatus(req.managerStatus, req.adminStatus);
                  const canSelect = req.managerStatus === 'Approved' && req.adminStatus === 'Pending';
                  
                  return (
                    <tr key={req.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-3 py-2">
                        <input 
                          type="checkbox" 
                          className="rounded border-input disabled:opacity-50"
                          disabled={!canSelect}
                          checked={selectedRequests.has(req.id)}
                          onChange={() => toggleSelection(req.id)}
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground">{req.id}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{req.employeeName}</span>
                          <span className="text-[10px] text-muted-foreground">{req.employeeId} • {req.department}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-foreground">{req.requestType}</span>
                          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" /> {req.attendanceDate}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={req.managerStatus === 'Approved' ? 'success' : req.managerStatus === 'Rejected' ? 'danger' : 'warning'}>
                          {req.managerStatus}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={getStatusColor(finalStatus) as any}>
                          {finalStatus}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Button variant="ghost" size="sm" className="h-7 w-7" iconOnly onClick={() => openDetails(req)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10px] text-emerald-600 border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
                            disabled={req.managerStatus !== 'Approved' || req.adminStatus !== 'Pending'}
                            onClick={() => handleAction(req.id, 'Approve')}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[10px] text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                            disabled={req.managerStatus !== 'Approved' || req.adminStatus !== 'Pending'}
                            onClick={() => handleAction(req.id, 'Reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <Sheet 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen}
        title="Request Details"
        subtitle={selectedRequestDetails?.id}
        footer={
          selectedRequestDetails?.managerStatus === 'Approved' && selectedRequestDetails?.adminStatus === 'Pending' ? (
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleAction(selectedRequestDetails!.id, 'Reject')}>
                Reject Request
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction(selectedRequestDetails!.id, 'Approve')}>
                Approve Request
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedRequestDetails && (
          <div className="space-y-6">
            
            {/* Employee Info */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Employee Details</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Name</div>
                  <div className="font-medium text-foreground">{selectedRequestDetails.employeeName}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Employee ID</div>
                  <div className="font-medium text-foreground">{selectedRequestDetails.employeeId}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Department</div>
                  <div className="font-medium text-foreground">{selectedRequestDetails.department}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Designation</div>
                  <div className="font-medium text-foreground">{selectedRequestDetails.designation}</div>
                </div>
              </div>
            </div>

            {/* Attendance Details */}
            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Attendance Details</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Date</div>
                  <div className="font-medium text-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedRequestDetails.attendanceDate}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Shift Timing</div>
                  <div className="font-medium text-foreground">{selectedRequestDetails.shiftTiming || '--'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Punch In</div>
                  <div className="font-medium text-foreground">{selectedRequestDetails.punchIn || '--'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Punch Out</div>
                  <div className="font-medium text-foreground">{selectedRequestDetails.punchOut || '--'}</div>
                </div>
                <div className="col-span-2 border-t border-border mt-1 pt-2">
                  <div className="text-muted-foreground text-xs mb-0.5">Working Hours</div>
                  <div className="font-medium text-foreground">{selectedRequestDetails.workingHours || '--'}</div>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 uppercase tracking-wider">Request Information</h3>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Request Type</div>
                <div className="text-sm font-medium text-foreground bg-secondary/50 px-3 py-2 rounded-lg border border-border/50">{selectedRequestDetails.requestType}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Reason / Justification</div>
                <p className="text-sm text-foreground bg-secondary/50 px-3 py-2 rounded-lg border border-border/50 leading-relaxed">
                  {selectedRequestDetails.reason}
                </p>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="gap-2 w-full justify-center">
                  <Download className="w-4 h-4" /> Download Supporting Document
                </Button>
              </div>
            </div>

            {/* Workflow */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 uppercase tracking-wider">Approval Workflow</h3>
              
              {/* Manager Step */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white", 
                    selectedRequestDetails.managerStatus === 'Approved' ? 'bg-emerald-500' : 
                    selectedRequestDetails.managerStatus === 'Rejected' ? 'bg-red-500' : 'bg-orange-500'
                  )}>
                    {selectedRequestDetails.managerStatus === 'Approved' ? <CheckCircle className="w-5 h-5" /> :
                     selectedRequestDetails.managerStatus === 'Rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className="w-0.5 h-full bg-border mt-2" />
                </div>
                <div className="pb-6">
                  <h4 className="text-sm font-semibold text-foreground">Manager Approval</h4>
                  <div className="text-xs mt-1">
                    Status: <Badge variant={selectedRequestDetails.managerStatus === 'Approved' ? 'success' : selectedRequestDetails.managerStatus === 'Rejected' ? 'danger' : 'warning'}>{selectedRequestDetails.managerStatus}</Badge>
                  </div>
                  {selectedRequestDetails.managerRemarks && (
                    <div className="mt-2 text-sm text-muted-foreground bg-secondary/30 p-2 rounded border border-border italic">
                      "{selectedRequestDetails.managerRemarks}"
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Step */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white", 
                    selectedRequestDetails.adminStatus === 'Approved' ? 'bg-emerald-500' : 
                    selectedRequestDetails.adminStatus === 'Rejected' ? 'bg-red-500' : 'bg-blue-500'
                  )}>
                    {selectedRequestDetails.adminStatus === 'Approved' ? <CheckCircle className="w-5 h-5" /> :
                     selectedRequestDetails.adminStatus === 'Rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Admin Approval</h4>
                  <div className="text-xs mt-1">
                    Status: <Badge variant={selectedRequestDetails.adminStatus === 'Approved' ? 'success' : selectedRequestDetails.adminStatus === 'Rejected' ? 'danger' : 'info'}>{selectedRequestDetails.adminStatus}</Badge>
                  </div>
                  {selectedRequestDetails.adminRemarks && (
                    <div className="mt-2 text-sm text-muted-foreground bg-secondary/30 p-2 rounded border border-border italic">
                      "{selectedRequestDetails.adminRemarks}"
                    </div>
                  )}
                  {selectedRequestDetails.adminStatus === 'Pending' && selectedRequestDetails.managerStatus === 'Pending' && (
                    <div className="mt-2 text-xs text-muted-foreground">Waiting for Manager to approve first.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </Sheet>

    </div>
  );
}

// Simple Stat Card component
function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: number, icon: any, color: string, bg: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-sm flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", bg, color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">{title}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
