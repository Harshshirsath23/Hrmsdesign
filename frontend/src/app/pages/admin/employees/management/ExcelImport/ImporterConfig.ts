import { ImporterCategory } from "./types";

export const IMPORTER_CATEGORIES: ImporterCategory[] = [
  {
    id: "address",
    label: "Address",
    options: [
      { id: "address", label: "Address", templateUrl: "/templates/address.xlsx", requiredColumns: ["EmployeeID", "Address"] },
      { id: "permanent-address", label: "Employee Permanent Address", templateUrl: "/templates/perm_address.xlsx", requiredColumns: ["EmployeeID", "Address", "City", "State"] },
      { id: "contact-address", label: "Employee Contact Address", templateUrl: "/templates/contact_address.xlsx", requiredColumns: ["EmployeeID", "Phone", "Email"] },
      { id: "present-address", label: "Employee Present Address", templateUrl: "/templates/present_address.xlsx", requiredColumns: ["EmployeeID", "Address", "City"] },
    ],
  },
  {
    id: "attendance",
    label: "Attendance",
    options: [
      { id: "attendance", label: "Attendance", templateUrl: "/templates/attendance.xlsx", requiredColumns: ["EmployeeID", "Date", "Status"] },
      { id: "attendance-muster", label: "Attendance Muster", templateUrl: "/templates/muster.xlsx", requiredColumns: ["EmployeeID", "Month", "Year"] },
      { id: "attendance-exception", label: "Attendance Exception", templateUrl: "/templates/exception.xlsx", requiredColumns: ["EmployeeID", "Date", "Reason"] },
      { id: "attendance-swipes", label: "Attendance Swipes", templateUrl: "/templates/swipes.xlsx", requiredColumns: ["EmployeeID", "DateTime", "Direction"] },
      { id: "shift-roster", label: "Shift Roster", templateUrl: "/templates/roster.xlsx", requiredColumns: ["EmployeeID", "Date", "ShiftID"] },
      { id: "attendance-override", label: "Attendance Override", templateUrl: "/templates/override.xlsx", requiredColumns: ["EmployeeID", "Date", "InTime", "OutTime"] },
      { id: "regularization", label: "Regularization and Permission Importer", templateUrl: "/templates/regularization.xlsx", requiredColumns: ["EmployeeID", "Date", "Type"] },
    ],
  },
  {
    id: "access-card",
    label: "Access Card Details",
    options: [
      { id: "access-card-details", label: "Access Card Details", templateUrl: "/templates/access_card.xlsx", requiredColumns: ["EmployeeID", "CardNumber", "Expiry"] },
    ],
  },
  {
    id: "emp-info",
    label: "EmpInfo",
    options: [
      { id: "damages", label: "Damages Importer", templateUrl: "/templates/damages.xlsx", requiredColumns: ["EmployeeID", "Amount", "Reason"] },
      { id: "change-emp-number", label: "Change Employee Number", templateUrl: "/templates/change_id.xlsx", requiredColumns: ["OldID", "NewID"] },
      { id: "family-details", label: "Family Details", templateUrl: "/templates/family.xlsx", requiredColumns: ["EmployeeID", "Name", "Relation", "DOB"] },
      { id: "employee-role", label: "Employee Role", templateUrl: "/templates/role.xlsx", requiredColumns: ["EmployeeID", "RoleID"] },
      { id: "pf-esi-details", label: "Employee PF/ESI Details", templateUrl: "/templates/pf_esi.xlsx", requiredColumns: ["EmployeeID", "PFNumber", "ESINumber"] },
      { id: "resignation", label: "Employee Resignation", templateUrl: "/templates/resignation.xlsx", requiredColumns: ["EmployeeID", "ResignationDate", "LWD"] },
      { id: "org-tree", label: "Organization Tree Details", templateUrl: "/templates/org_tree.xlsx", requiredColumns: ["EmployeeID", "ManagerID"] },
      { id: "fines", label: "Fines Importer", templateUrl: "/templates/fines.xlsx", requiredColumns: ["EmployeeID", "Amount", "Reason"] },
      { id: "contract-details", label: "Employee Contract Details", templateUrl: "/templates/contract.xlsx", requiredColumns: ["EmployeeID", "StartDate", "EndDate"] },
      { id: "employment-history", label: "Previous Employment History", templateUrl: "/templates/history.xlsx", requiredColumns: ["EmployeeID", "Company", "Designation"] },
      { id: "add-employee", label: "Add Employee Importer", templateUrl: "/templates/add_emp.xlsx", requiredColumns: ["Name", "Email", "Phone", "DOB", "JoiningDate"] },
      { id: "bank-details", label: "Employee Bank Details", templateUrl: "/templates/bank.xlsx", requiredColumns: ["EmployeeID", "BankName", "AccountNo", "IFSC"] },
      { id: "basic-info", label: "Basic Employee Information", templateUrl: "/templates/basic.xlsx", requiredColumns: ["EmployeeID", "Gender", "MaritalStatus"] },
      { id: "card-details", label: "Employee Card Details", templateUrl: "/templates/cards.xlsx", requiredColumns: ["EmployeeID", "CardType", "Number"] },
      { id: "qualification", label: "Qualification Details", templateUrl: "/templates/qualification.xlsx", requiredColumns: ["EmployeeID", "Degree", "Year"] },
      { id: "identity", label: "Employee Identity Importer", templateUrl: "/templates/identity.xlsx", requiredColumns: ["EmployeeID", "IDType", "IDNumber"] },
      { id: "emp-category", label: "Employee Category", templateUrl: "/templates/category.xlsx", requiredColumns: ["EmployeeID", "CategoryID"] },
      { id: "category-type", label: "Category Type", templateUrl: "/templates/cat_type.xlsx", requiredColumns: ["CategoryID", "Type"] },
    ],
  },
  {
    id: "general",
    label: "General",
    options: [
      { id: "user-roles", label: "User Roles Importer", templateUrl: "/templates/user_roles.xlsx", requiredColumns: ["UserID", "RoleID"] },
    ],
  },
  {
    id: "income-tax",
    label: "Income Tax",
    options: [
      { id: "form24q", label: "Form24Q Challan Map Importer", templateUrl: "/templates/24q.xlsx", requiredColumns: ["ChallanNo", "Month"] },
      { id: "it-override", label: "Income Tax Override", templateUrl: "/templates/it_override.xlsx", requiredColumns: ["EmployeeID", "Month", "Amount"] },
    ],
  },
  {
    id: "leave",
    label: "Leave",
    options: [
      { id: "holiday-list", label: "Holiday List Importer", templateUrl: "/templates/holidays.xlsx", requiredColumns: ["Date", "Name"] },
      { id: "emp-week-days", label: "Employee Week Days Importer", templateUrl: "/templates/week_days.xlsx", requiredColumns: ["EmployeeID", "WeekDays"] },
      { id: "leave-transaction", label: "Leave Transaction Importer", templateUrl: "/templates/leave_trans.xlsx", requiredColumns: ["EmployeeID", "LeaveType", "Days"] },
    ],
  },
  {
    id: "payroll",
    label: "Payroll",
    options: [
      { id: "release-salary", label: "Release Salary Details", templateUrl: "/templates/release_salary.xlsx", requiredColumns: ["EmployeeID", "Month", "Year"] },
      { id: "claim-details", label: "Employee Claim Details", templateUrl: "/templates/claims.xlsx", requiredColumns: ["EmployeeID", "Amount", "Type"] },
      { id: "it-declaration-plan", label: "IT Declaration Plan", templateUrl: "/templates/it_plan.xlsx", requiredColumns: ["EmployeeID", "Section", "Amount"] },
      { id: "reimbursement", label: "Reimbursement Transactions", templateUrl: "/templates/reimbursement.xlsx", requiredColumns: ["EmployeeID", "Amount", "Date"] },
      { id: "overtime", label: "Overtime Register Importer", templateUrl: "/templates/overtime.xlsx", requiredColumns: ["EmployeeID", "Hours"] },
      { id: "arrears", label: "Arrear Details", templateUrl: "/templates/arrears.xlsx", requiredColumns: ["EmployeeID", "Amount", "Reason"] },
      { id: "delete-claims", label: "Delete Employee Claim Details", templateUrl: "/templates/delete_claims.xlsx", requiredColumns: ["ClaimID"] },
      { id: "lop-reversal", label: "LOP Reversal Importer", templateUrl: "/templates/lop_reversal.xlsx", requiredColumns: ["EmployeeID", "Days"] },
    ],
  },
  {
    id: "it-declarations",
    label: "IT Declarations",
    options: [
      { id: "payslip-remarks", label: "Payslip Remarks Importer", templateUrl: "/templates/remarks.xlsx", requiredColumns: ["EmployeeID", "Remarks"] },
      { id: "rent-proof", label: "Rent Proof Info Importer", templateUrl: "/templates/rent.xlsx", requiredColumns: ["EmployeeID", "Amount", "Pan"] },
      { id: "house-property", label: "Income From House Property Importer", templateUrl: "/templates/house_prop.xlsx", requiredColumns: ["EmployeeID", "Amount"] },
    ],
  },
  {
    id: "shortlist",
    label: "Shortlist Employee",
    options: [
      { id: "shortlist-employee", label: "Shortlist Employee", templateUrl: "/templates/shortlist.xlsx", requiredColumns: ["EmployeeID", "Status"] },
    ],
  },
  {
    id: "pf-contribution",
    label: "PF Contribution",
    options: [
      { id: "pf-rate", label: "PF Contribution Rate Importer", templateUrl: "/templates/pf_rate.xlsx", requiredColumns: ["EmployeeID", "Rate"] },
    ],
  },
  {
    id: "emp-loan",
    label: "Employee Loan",
    options: [
      { id: "loan-details", label: "Employee Loan Details", templateUrl: "/templates/loan.xlsx", requiredColumns: ["EmployeeID", "Principal", "EMI"] },
      { id: "loan-override", label: "Loan Override Importer", templateUrl: "/templates/loan_override.xlsx", requiredColumns: ["EmployeeID", "Month", "Amount"] },
    ],
  },
  {
    id: "lic",
    label: "LIC",
    options: [
      { id: "lic-importer", label: "LIC Importer", templateUrl: "/templates/lic.xlsx", requiredColumns: ["EmployeeID", "PolicyNo", "Premium"] },
    ],
  },
  {
    id: "salary-controls",
    label: "Salary Processing Controls",
    options: [
      { id: "stop-salary", label: "Stop Salary Processing", templateUrl: "/templates/stop_salary.xlsx", requiredColumns: ["EmployeeID", "Reason"] },
      { id: "emp-lop", label: "Employee LOP", templateUrl: "/templates/lop.xlsx", requiredColumns: ["EmployeeID", "Days"] },
      { id: "final-settlement", label: "Final Settlement Details", templateUrl: "/templates/settlement.xlsx", requiredColumns: ["EmployeeID", "Amount"] },
    ],
  },
  {
    id: "claims-review",
    label: "Claims & Review",
    options: [
      { id: "claim-reviewer", label: "Claim Reviewer Details", templateUrl: "/templates/reviewer.xlsx", requiredColumns: ["EmployeeID", "ReviewerID"] },
    ],
  },
  {
    id: "fbp",
    label: "FBP",
    options: [
      { id: "fbp-plan", label: "FBP Plan Transaction Importer", templateUrl: "/templates/fbp.xlsx", requiredColumns: ["EmployeeID", "Section", "Amount"] },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    options: [
      { id: "cheque-cash", label: "Cheque / Cash Statement Importer", templateUrl: "/templates/payments.xlsx", requiredColumns: ["EmployeeID", "Amount", "Mode"] },
    ],
  },
  {
    id: "payroll-repo",
    label: "Payroll Repository",
    options: [
      { id: "payroll-repository", label: "Payroll Repository", templateUrl: "/templates/payroll_repo.xlsx", requiredColumns: ["EmployeeID", "Data"] },
    ],
  },
  {
    id: "hold-salary",
    label: "Hold Salary",
    options: [
      { id: "hold-salary-payout", label: "Hold Salary Payout Details", templateUrl: "/templates/hold_salary.xlsx", requiredColumns: ["EmployeeID", "Reason"] },
    ],
  },
  {
    id: "reimbursement-sub",
    label: "Reimbursement",
    options: [
      { id: "reimbursement-subsidary", label: "Reimbursement Subsidary Transactions", templateUrl: "/templates/reimb_sub.xlsx", requiredColumns: ["EmployeeID", "Amount"] },
    ],
  },
  {
    id: "resettlement",
    label: "Resettlement",
    options: [
      { id: "resettlement-importer", label: "Resettlement Importer", templateUrl: "/templates/resettlement.xlsx", requiredColumns: ["EmployeeID", "Amount"] },
    ],
  },
  {
    id: "reversal",
    label: "Reversal",
    options: [
      { id: "reversal-importer", label: "Reversal Importer", templateUrl: "/templates/reversal.xlsx", requiredColumns: ["EmployeeID", "RefID"] },
    ],
  },
  {
    id: "salary",
    label: "Salary",
    options: [
      { id: "salary-overrides", label: "Bulk Salary Overrides", templateUrl: "/templates/salary_overrides.xlsx", requiredColumns: ["EmployeeID", "Amount"] },
      { id: "revise-salary", label: "Add / Revise Salary", templateUrl: "/templates/revise_salary.xlsx", requiredColumns: ["EmployeeID", "Basic", "HRA"] },
      { id: "salary-info", label: "Bulk Salary Information Of Employees", templateUrl: "/templates/salary_info.xlsx", requiredColumns: ["EmployeeID", "Details"] },
      { id: "salary-statement", label: "Salary Statement For A Month", templateUrl: "/templates/salary_statement.xlsx", requiredColumns: ["Month", "Year"] },
    ],
  },
  {
    id: "workflow",
    label: "Workflow",
    options: [
      { id: "workflow-reviewers", label: "Employee Specific Workflow Reviewer Types", templateUrl: "/templates/workflow.xlsx", requiredColumns: ["EmployeeID", "ReviewerType"] },
    ],
  },
];
