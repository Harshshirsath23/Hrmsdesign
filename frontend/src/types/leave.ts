export interface LeaveBalance {
  id: string;
  name: string;
  available: number;
  used: number;
  accent: string;
}

export interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  reason: string;
}
