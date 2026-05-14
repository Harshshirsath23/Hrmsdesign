/* ================================================================== */
/* Admin Module Constants                                              */
/* ================================================================== */

import {
  FileText,
  MapPin,
  Clock,
  Briefcase,
  Banknote,
  Users,
  Paperclip,
  BarChart3,
  Lock,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { ImporterTypeGroup, MasterField, AdminMenuItem } from '@types/admin';

/* ================================================================== */
/*  Importer Types - Grouped by Category                              */
/* ================================================================== */

export const IMPORTER_TYPES: ImporterTypeGroup[] = [
  {
    groupName: 'Address',
    items: [
      { id: 'addr-perm', name: 'Permanent Address', description: 'Employee permanent addresses' },
      { id: 'addr-contact', name: 'Contact Address', description: 'Employee contact addresses' },
      { id: 'addr-present', name: 'Present Address', description: 'Employee present addresses' },
    ],
  },
  {
    groupName: 'Attendance',
    items: [
      { id: 'att-muster', name: 'Muster', description: 'Attendance muster records' },
      { id: 'att-exception', name: 'Exception', description: 'Attendance exceptions' },
      { id: 'att-swipes', name: 'Swipes', description: 'Biometric swipes' },
      { id: 'att-shift', name: 'Shift Roster', description: 'Shift roster assignments' },
      { id: 'att-override', name: 'Override', description: 'Manual attendance overrides' },
      { id: 'att-regularization', name: 'Regularization', description: 'Attendance regularization' },
    ],
  },
  {
    groupName: 'Employee Core',
    items: [
      { id: 'emp-add', name: 'Add Employee', description: 'Basic employee information' },
      { id: 'emp-basic', name: 'Basic Employee Information', description: 'Core employee data' },
      { id: 'emp-bank', name: 'Employee Bank Details', description: 'Bank account details' },
      { id: 'emp-contract', name: 'Employee Contract Details', description: 'Contract information' },
      { id: 'emp-prev', name: 'Previous Employment', description: 'Previous work history' },
      { id: 'emp-family', name: 'Family Details', description: 'Family member information' },
      { id: 'emp-role', name: 'Employee Role', description: 'Role assignments' },
      { id: 'emp-pf', name: 'Employee PF/ESI Details', description: 'PF and ESI information' },
      { id: 'emp-resignation', name: 'Employee Resignation', description: 'Resignation records' },
    ],
  },
  {
    groupName: 'Payroll',
    items: [
      { id: 'pay-salary', name: 'Salary', description: 'Salary records' },
      { id: 'pay-override', name: 'Salary Overrides', description: 'Salary adjustments' },
      { id: 'pay-claims', name: 'Claims', description: 'Employee claims' },
      { id: 'pay-overtime', name: 'Overtime', description: 'Overtime records' },
      { id: 'pay-arrears', name: 'Arrears', description: 'Salary arrears' },
      { id: 'pay-statement', name: 'Salary Statement', description: 'Payroll statements' },
    ],
  },
  {
    groupName: 'Leave',
    items: [
      { id: 'leave-holiday', name: 'Holiday List', description: 'Holiday calendar' },
      { id: 'leave-trans', name: 'Leave Transactions', description: 'Leave ledger entries' },
      { id: 'leave-weekdays', name: 'Week Days', description: 'Working week configuration' },
    ],
  },
  {
    groupName: 'Income Tax / IT Declarations',
    items: [
      { id: 'it-form24q', name: 'Form24Q', description: 'Form 24Q TDS data' },
      { id: 'it-rent', name: 'Rent Proof', description: 'Rent proof documents' },
      { id: 'it-house', name: 'House Property', description: 'House property details' },
      { id: 'it-plan', name: 'IT Declaration Plan', description: 'IT declaration plans' },
    ],
  },
  {
    groupName: 'Loans / LIC / PF',
    items: [
      { id: 'loan-details', name: 'Loan Details', description: 'Loan information' },
      { id: 'loan-lic', name: 'LIC Importer', description: 'LIC policy details' },
      { id: 'loan-pf', name: 'PF Contribution', description: 'PF contributions' },
    ],
  },
  {
    groupName: 'Workflow',
    items: [
      { id: 'workflow-reviewer', name: 'Reviewer Types', description: 'Approval reviewer setup' },
    ],
  },
  {
    groupName: 'Payments',
    items: [
      { id: 'pay-cheque', name: 'Cheque/Cash Statement', description: 'Payment statements' },
    ],
  },
  {
    groupName: 'Advanced',
    items: [
      { id: 'adv-reversal', name: 'Reversal', description: 'Transaction reversals' },
      { id: 'adv-resettlement', name: 'Resettlement', description: 'Resettlement records' },
      { id: 'adv-fbp', name: 'FBP', description: 'Final Bill Processing' },
      { id: 'adv-controls', name: 'Salary Processing Controls', description: 'Payroll controls' },
      { id: 'adv-repository', name: 'Payroll Repository', description: 'Payroll data repository' },
    ],
  },
];

/* ================================================================== */
/*  Master Fields - All Possible Fields for Import Mapping            */
/* ================================================================== */

export const MASTER_FIELDS: MasterField[] = [
  // Personal Information
  { id: 'first_name', fieldName: 'First Name', category: 'Personal', required: true, dataType: 'text' },
  { id: 'last_name', fieldName: 'Last Name', category: 'Personal', required: true, dataType: 'text' },
  { id: 'full_name', fieldName: 'Full Name', category: 'Personal', required: false, dataType: 'text' },
  { id: 'dob', fieldName: 'Date of Birth', category: 'Personal', required: false, dataType: 'date' },
  { id: 'gender', fieldName: 'Gender', category: 'Personal', required: false, dataType: 'select' },
  { id: 'marital_status', fieldName: 'Marital Status', category: 'Personal', required: false, dataType: 'select' },
  { id: 'blood_group', fieldName: 'Blood Group', category: 'Personal', required: false, dataType: 'select' },
  { id: 'father_name', fieldName: 'Father Name', category: 'Personal', required: false, dataType: 'text' },
  { id: 'spouse_name', fieldName: 'Spouse Name', category: 'Personal', required: false, dataType: 'text' },
  { id: 'marriage_date', fieldName: 'Marriage Date', category: 'Personal', required: false, dataType: 'date' },
  { id: 'nick_name', fieldName: 'Nick Name', category: 'Personal', required: false, dataType: 'text' },

  // Work Information
  { id: 'employee_number', fieldName: 'Employee Number', category: 'Work', required: true, dataType: 'text' },
  { id: 'emp_series', fieldName: 'Employee Number Series', category: 'Work', required: false, dataType: 'text' },
  { id: 'department', fieldName: 'Department', category: 'Work', required: true, dataType: 'select' },
  { id: 'designation', fieldName: 'Designation', category: 'Work', required: true, dataType: 'select' },
  { id: 'grade', fieldName: 'Grade', category: 'Work', required: false, dataType: 'select' },
  { id: 'location', fieldName: 'Location', category: 'Work', required: false, dataType: 'select' },
  { id: 'manager_emp_no', fieldName: 'Manager Employee No', category: 'Work', required: false, dataType: 'text' },
  { id: 'joining_date', fieldName: 'Joining Date', category: 'Work', required: true, dataType: 'date' },
  { id: 'status', fieldName: 'Status', category: 'Work', required: true, dataType: 'select' },
  { id: 'probation_period', fieldName: 'Probation Period', category: 'Work', required: false, dataType: 'number' },
  { id: 'confirmation_date', fieldName: 'Confirmation Date', category: 'Work', required: false, dataType: 'date' },

  // Contact Information
  { id: 'email', fieldName: 'Email', category: 'Contact', required: true, dataType: 'email' },
  { id: 'personal_email', fieldName: 'Personal Email', category: 'Contact', required: false, dataType: 'email' },
  { id: 'mobile_number', fieldName: 'Mobile Number', category: 'Contact', required: true, dataType: 'text' },
  { id: 'emergency_contact_name', fieldName: 'Emergency Contact Name', category: 'Contact', required: false, dataType: 'text' },
  { id: 'emergency_contact_number', fieldName: 'Emergency Contact Number', category: 'Contact', required: false, dataType: 'text' },

  // Compliance Information
  { id: 'pan_number', fieldName: 'PAN Number', category: 'Compliance', required: false, dataType: 'text' },
  { id: 'aadhaar_number', fieldName: 'Aadhaar Number', category: 'Compliance', required: false, dataType: 'text' },
  { id: 'pf_number', fieldName: 'PF Number', category: 'Compliance', required: false, dataType: 'text' },
  { id: 'esi_number', fieldName: 'ESI Number', category: 'Compliance', required: false, dataType: 'text' },
  { id: 'uan_pran', fieldName: 'UAN / PRAN', category: 'Compliance', required: false, dataType: 'text' },

  // Bank Information
  { id: 'bank_name', fieldName: 'Bank Name', category: 'Bank', required: false, dataType: 'text' },
  { id: 'account_number', fieldName: 'Account Number', category: 'Bank', required: false, dataType: 'text' },
  { id: 'ifsc_code', fieldName: 'IFSC Code', category: 'Bank', required: false, dataType: 'text' },
  { id: 'iban', fieldName: 'IBAN', category: 'Bank', required: false, dataType: 'text' },

  // System & Flags
  { id: 'login_username', fieldName: 'Login Username', category: 'System', required: false, dataType: 'text' },
  { id: 'ip_address', fieldName: 'IP Address', category: 'System', required: false, dataType: 'text' },
  { id: 'notice_period', fieldName: 'Notice Period', category: 'System', required: false, dataType: 'number' },
  { id: 'bg_verification', fieldName: 'Background Verification Status', category: 'System', required: false, dataType: 'select' },
  { id: 'bg_remarks', fieldName: 'Background Check Remarks', category: 'System', required: false, dataType: 'text' },

  // Eligibility Flags
  { id: 'pf_eligible', fieldName: 'PF Eligible', category: 'Eligibility', required: false, dataType: 'select' },
  { id: 'esi_eligible', fieldName: 'ESI Eligible', category: 'Eligibility', required: false, dataType: 'select' },
  { id: 'eps_eligible', fieldName: 'EPS Eligible', category: 'Eligibility', required: false, dataType: 'select' },
  { id: 'lwf_eligible', fieldName: 'LWF Eligible', category: 'Eligibility', required: false, dataType: 'select' },
  { id: 'international', fieldName: 'International Employee', category: 'Eligibility', required: false, dataType: 'select' },
  { id: 'physically_challenged', fieldName: 'Physically Challenged', category: 'Eligibility', required: false, dataType: 'select' },
];

/* ================================================================== */
/*  Letter Templates                                                   */
/* ================================================================== */

export const LETTER_TEMPLATES = [
  'Offer Letter',
  'Joining Letter',
  'Appointment Letter',
  'Experience Certificate',
  'Relieving Letter',
  'Full and Final Settlement',
  'Salary Certificate',
  'Leave Encashment Letter',
  'Increment Letter',
  'Promotion Letter',
];

/* ================================================================== */
/*  Admin Menu Items                                                   */
/* ================================================================== */

export const ADMIN_MENU_ITEMS: Array<{
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  disabled: boolean;
  description: string;
}> = [
  {
    id: 'generate-letter',
    label: 'Generate Letter',
    icon: FileText,
    route: '/admin/employee/admin/generate-letter',
    disabled: false,
    description: 'Generate official letters for employees',
  },
  {
    id: 'excel-import',
    label: 'Excel Import',
    icon: BarChart3,
    route: '/admin/employee/admin/excel-import',
    disabled: false,
    description: 'Bulk import employee data from Excel',
  },
  {
    id: 'bulk-photo',
    label: 'Bulk Photo Upload',
    icon: Users,
    route: '/admin/employee/admin/bulk-photo',
    disabled: true,
    description: 'Upload multiple employee photos',
  },
  {
    id: 'bulletin',
    label: 'Bulletin Board',
    icon: Paperclip,
    route: '/admin/employee/admin/bulletin',
    disabled: true,
    description: 'Create and manage announcements',
  },
  {
    id: 'mass-communication',
    label: 'Mass Communication',
    icon: Zap,
    route: '/admin/employee/admin/mass-communication',
    disabled: true,
    description: 'Send messages to multiple employees',
  },
  {
    id: 'identity-verification',
    label: 'Identity Verification',
    icon: Lock,
    route: '/admin/employee/admin/identity-verification',
    disabled: true,
    description: 'Manage employee identity verification',
  },
  {
    id: 'contract-details',
    label: 'Contract Details',
    icon: Briefcase,
    route: '/admin/employee/admin/contract-details',
    disabled: true,
    description: 'Manage employee contracts',
  },
  {
    id: 'data-drive',
    label: 'Data Drive',
    icon: Paperclip,
    route: '/admin/employee/admin/data-drive',
    disabled: true,
    description: 'Access employee data repository',
  },
];

/* ================================================================== */
/*  Sample Mock Data                                                   */
/* ================================================================== */

export const MOCK_LETTER_RECORDS = [
  {
    id: 'letter-1',
    letterTemplate: 'Offer Letter',
    employee: 'Aditi Mehra',
    employeeId: 'EMP-0001',
    preparedOn: '2024-05-01',
    preparedBy: 'HR Admin',
    authorisedSignatory: 'Director',
    approvalStatus: 'Pending' as const,
    serialNo: 'OL-2024-001',
    remarks: 'Pending director approval',
  },
  {
    id: 'letter-2',
    letterTemplate: 'Joining Letter',
    employee: 'Rohan Kulkarni',
    employeeId: 'EMP-0002',
    preparedOn: '2024-04-28',
    preparedBy: 'HR Manager',
    authorisedSignatory: 'Manager',
    approvalStatus: 'Approved' as const,
    serialNo: 'JL-2024-001',
    remarks: 'Approved',
  },
];

export const MOCK_IMPORT_HISTORY = [
  {
    id: 'import-1',
    importerType: 'Add Employee',
    fileName: 'employees_batch_1.xlsx',
    uploadedBy: 'Admin User',
    uploadedOn: '2024-05-02',
    status: 'Success' as const,
    recordsProcessed: 45,
    recordsFailed: 0,
  },
  {
    id: 'import-2',
    importerType: 'Bank Details',
    fileName: 'bank_details_update.csv',
    uploadedBy: 'Admin User',
    uploadedOn: '2024-05-01',
    status: 'Failed' as const,
    recordsProcessed: 0,
    recordsFailed: 23,
  },
  {
    id: 'import-3',
    importerType: 'Salary',
    fileName: 'salary_april_2024.xlsx',
    uploadedBy: 'Payroll Admin',
    uploadedOn: '2024-04-30',
    status: 'Success' as const,
    recordsProcessed: 180,
    recordsFailed: 0,
  },
];

/* ================================================================== */
/*  Employment Status Options                                         */
/* ================================================================== */

export const EMPLOYMENT_STATUS_OPTIONS = [
  { id: 'all', label: 'All', value: '' },
  { id: 'confirmed', label: 'Confirmed', value: 'Confirmed' },
  { id: 'probation', label: 'Probation', value: 'Probation' },
  { id: 'contract', label: 'Contract', value: 'Contract' },
  { id: 'trainee', label: 'Trainee', value: 'Trainee' },
];

export const EMPLOYEE_FILTER_OPTIONS = [
  { id: 'all', label: 'All', value: '' },
  { id: 'current', label: 'Current Employees', value: 'current' },
  { id: 'past', label: 'Past Employees', value: 'past' },
];
