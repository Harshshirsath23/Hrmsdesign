import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@api/client';

const EMP_STORAGE_KEY = 'hrms-demo-employees';

const DEMO_EMPLOYEES: EmployeeListItem[] = [
  {
    id: 'emp-1',
    employee_code: 'EMP-0001',
    first_name: 'Aditi',
    middle_name: '',
    last_name: 'Mehra',
    full_name: 'Aditi Mehra',
    profile_photo: null,
    status: 'ACTIVE',
    status_detail: { id: 'stat-1', name: 'Active', code: 'ACTIVE', color_code: '#10B981' },
    department: 'Human Resources',
    designation: 'HR Manager',
    date_of_joining: '2024-01-15',
    work_email: 'aditi.mehra@hrms.demo',
  },
  {
    id: 'emp-2',
    employee_code: 'EMP-0002',
    first_name: 'Rohan',
    middle_name: '',
    last_name: 'Kulkarni',
    full_name: 'Rohan Kulkarni',
    profile_photo: null,
    status: 'ACTIVE',
    status_detail: { id: 'stat-1', name: 'Active', code: 'ACTIVE', color_code: '#10B981' },
    department: 'Engineering',
    designation: 'Software Engineer',
    date_of_joining: '2023-08-21',
    work_email: 'rohan.kulkarni@hrms.demo',
  },
];

function readDemoEmployees(): EmployeeListItem[] {
  const raw = localStorage.getItem(EMP_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as EmployeeListItem[];
    } catch {
      // fallback to seeded data
    }
  }
  localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(DEMO_EMPLOYEES));
  return DEMO_EMPLOYEES;
}

function writeDemoEmployees(items: EmployeeListItem[]) {
  localStorage.setItem(EMP_STORAGE_KEY, JSON.stringify(items));
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EmployeeListItem {
  id: string;
  employee_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  profile_photo: string | null;
  status: string;
  status_detail: { id: string; name: string; code: string; color_code: string } | null;
  department: string;
  designation: string;
  date_of_joining: string | null;
  work_email: string;
}

export interface MasterOption {
  id: string;
  name: string;
  code: string;
}

export interface InviteEmployeePayload {
  first_name: string;
  last_name: string;
  middle_name?: string;
  work_email: string;
  personal_mobile: string;
  gender: string;
  department: string;
  designation: string;
  employment_type?: string;
  date_of_joining: string;
  date_of_birth?: string;
  branch?: string;
  grade?: string;
  employee_category?: string;
  source_of_hire?: string;
  payroll_status?: string;
  transport_type?: string;
  cost_center?: string;
  shift_type?: string;
  payment_mode?: string;
  notice_period_days?: string;
}

export interface InviteResponse extends EmployeeListItem {
  invite_token: string;
  invite_link: string;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

async function fetchEmployees(): Promise<EmployeeListItem[]> {
  try {
    const res = await api.get('/employees/');
    const rows = res.data?.results ?? res.data?.data?.results ?? res.data?.data ?? res.data ?? [];
    if (Array.isArray(rows) && rows.length) {
      writeDemoEmployees(rows as EmployeeListItem[]);
      return rows as EmployeeListItem[];
    }
  } catch {
    // fallback to demo data
  }
  return readDemoEmployees();
}

async function fetchMaster(endpoint: string): Promise<MasterOption[]> {
  try {
    const res = await api.get(`/masters/${endpoint}/`);
    const rows = res.data?.results ?? res.data?.data?.results ?? res.data?.data ?? res.data ?? [];
    if (Array.isArray(rows) && rows.length) return rows as MasterOption[];
  } catch {
    // fallback below
  }

  const fallback: Record<string, MasterOption[]> = {
    departments: [
      { id: 'dept-1', name: 'Human Resources', code: 'HR' },
      { id: 'dept-2', name: 'Finance', code: 'FIN' },
      { id: 'dept-3', name: 'Engineering', code: 'ENG' },
    ],
    designations: [
      { id: 'desig-1', name: 'HR Manager', code: 'HRM' },
      { id: 'desig-2', name: 'Payroll Specialist', code: 'PAY' },
      { id: 'desig-3', name: 'Software Engineer', code: 'SWE' },
    ],
    genders: [
      { id: 'M', name: 'Male', code: 'M' },
      { id: 'F', name: 'Female', code: 'F' },
      { id: 'O', name: 'Other', code: 'O' },
    ],
    'employment-types': [
      { id: 'etype-1', name: 'Permanent', code: 'PERM' },
      { id: 'etype-2', name: 'Contract', code: 'CONT' },
      { id: 'etype-3', name: 'Intern', code: 'INT' },
    ],
    branches: [
      { id: 'br-1', name: 'Mumbai Branch', code: 'MUM-01' },
      { id: 'br-2', name: 'Pune Branch', code: 'PUN-01' },
    ],
    grades: [
      { id: 'gr-1', name: 'L1', code: 'L1' },
      { id: 'gr-2', name: 'L2', code: 'L2' },
      { id: 'gr-3', name: 'M1', code: 'M1' },
    ],
    'employee-categories': [
      { id: 'cat-1', name: 'Staff', code: 'STAFF' },
      { id: 'cat-2', name: 'Worker', code: 'WORKER' },
      { id: 'cat-3', name: 'Trainee', code: 'TRAINEE' },
    ],
    'source-of-hire': [
      { id: 'soh-1', name: 'Referral', code: 'REF' },
      { id: 'soh-2', name: 'LinkedIn', code: 'LI' },
      { id: 'soh-3', name: 'Campus', code: 'CAMP' },
    ],
    'payroll-statuses': [
      { id: 'ps-1', name: 'Active Payroll', code: 'ACTIVE' },
      { id: 'ps-2', name: 'On Hold', code: 'HOLD' },
    ],
    'transport-types': [
      { id: 'tt-1', name: 'Company Provided', code: 'COMPANY' },
      { id: 'tt-2', name: 'Own Vehicle', code: 'OWN' },
      { id: 'tt-3', name: 'Public Transport', code: 'PUBLIC' },
    ],
    'cost-centers': [
      { id: 'cc-1', name: 'IT Delivery', code: 'CC-IT-001' },
      { id: 'cc-2', name: 'Corporate HR', code: 'CC-HR-001' },
    ],
    'shift-types': [
      { id: 'st-1', name: 'Day', code: 'DAY' },
      { id: 'st-2', name: 'Night', code: 'NIGHT' },
      { id: 'st-3', name: 'Rotational', code: 'ROT' },
    ],
  };

  return fallback[endpoint] ?? [];
}

export function useEmployeeList() {
  return useQuery({
    queryKey: ['employees-list'],
    queryFn: fetchEmployees,
    staleTime: 60_000,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['masters-departments'],
    queryFn: () => fetchMaster('departments'),
    staleTime: 10 * 60_000,
  });
}

export function useDesignations() {
  return useQuery({
    queryKey: ['masters-designations'],
    queryFn: () => fetchMaster('designations'),
    staleTime: 10 * 60_000,
  });
}

export function useGenders() {
  return useQuery({
    queryKey: ['masters-genders'],
    queryFn: () => fetchMaster('genders'),
    staleTime: 10 * 60_000,
  });
}

export function useEmploymentTypes() {
  return useQuery({
    queryKey: ['masters-employment-types'],
    queryFn: () => fetchMaster('employment-types'),
    staleTime: 10 * 60_000,
  });
}

export function useBranches() {
  return useQuery({
    queryKey: ['masters-branches'],
    queryFn: () => fetchMaster('branches'),
    staleTime: 10 * 60_000,
  });
}

export function useGrades() {
  return useQuery({
    queryKey: ['masters-grades'],
    queryFn: () => fetchMaster('grades'),
    staleTime: 10 * 60_000,
  });
}

export function useEmployeeCategories() {
  return useQuery({
    queryKey: ['masters-employee-categories'],
    queryFn: () => fetchMaster('employee-categories'),
    staleTime: 10 * 60_000,
  });
}

export function useSourceOfHire() {
  return useQuery({
    queryKey: ['masters-source-of-hire'],
    queryFn: () => fetchMaster('source-of-hire'),
    staleTime: 10 * 60_000,
  });
}

export function usePayrollStatuses() {
  return useQuery({
    queryKey: ['masters-payroll-statuses'],
    queryFn: () => fetchMaster('payroll-statuses'),
    staleTime: 10 * 60_000,
  });
}

export function useTransportTypes() {
  return useQuery({
    queryKey: ['masters-transport-types'],
    queryFn: () => fetchMaster('transport-types'),
    staleTime: 10 * 60_000,
  });
}

export function useCostCenters() {
  return useQuery({
    queryKey: ['masters-cost-centers'],
    queryFn: () => fetchMaster('cost-centers'),
    staleTime: 10 * 60_000,
  });
}

export function useShiftTypes() {
  return useQuery({
    queryKey: ['masters-shift-types'],
    queryFn: () => fetchMaster('shift-types'),
    staleTime: 10 * 60_000,
  });
}

export function useAccountTypes() {
  return useQuery({
    queryKey: ['masters-account-types'],
    queryFn: () => fetchMaster('account-types'),
    staleTime: 10 * 60_000,
  });
}

export function useInviteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: InviteEmployeePayload): Promise<InviteResponse> => {
      try {
        const res = await api.post('/employees/invite/', payload);
        return res.data;
      } catch {
        const current = readDemoEmployees();
        const nextCode = `EMP-${String(current.length + 1).padStart(4, '0')}`;
        const employee: EmployeeListItem = {
          id: crypto.randomUUID(),
          employee_code: nextCode,
          first_name: payload.first_name,
          middle_name: payload.middle_name ?? '',
          last_name: payload.last_name,
          full_name: [payload.first_name, payload.middle_name, payload.last_name].filter(Boolean).join(' '),
          profile_photo: null,
          status: 'ACTIVE',
          status_detail: { id: 'stat-1', name: 'Active', code: 'ACTIVE', color_code: '#10B981' },
          department: payload.department || 'Human Resources',
          designation: payload.designation || 'Employee',
          date_of_joining: payload.date_of_joining,
          work_email: payload.work_email,
        };
        writeDemoEmployees([employee, ...current]);
        return {
          ...employee,
          invite_token: crypto.randomUUID(),
          invite_link: `/setup-password?token=${encodeURIComponent(crypto.randomUUID())}`,
        };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees-list'] });
    },
  });
}
